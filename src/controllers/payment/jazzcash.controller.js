import Franchise from "../../models/franchise/franchise.model.js";
import { catchError, catchErrorWithSequelize, conflictError, frontError, notFound, successOk, successOkWithData, validationError } from "../../utils/responses.js";
import { bodyReqFields, queryReqFields } from "../../utils/requiredFields.js";
import { check31DaysExpiry, convertToLowercase } from "../../utils/utils.js";
import { generateJazzcashRefNo, INQUIRY, MWALLET } from "../../utils/jazzcash.js";
import { getJazzCredentials } from "../../config/jazzcash.config.js";
import FarmaciePaymentHistory from "../../models/payment/paymentHistroy.model.js";
import { FRANCHISE_CHARGES } from "../../config/payment.config.js";
import { isListContainActiveFranchise, performBulkInquiry, checkPendingPayments, getJazzResponseFromResCode } from "../../utils/payment.util.js";
import { Op } from "sequelize";
// =================================================================================
//                                GLOBAL VARIABLES
// =================================================================================
const jazz = getJazzCredentials();


// ================================================================
//                          CONTROLLERS
// ================================================================

export async function jazzcashMwalletBulkPayment(req, res) {
    try {
        const reqFields = ["phone", "cnic_last6", "franchise_uuid_list", "amount_showed"];
        const bodyFieldsReq = bodyReqFields(req, res, reqFields);
        if (bodyFieldsReq.error) return bodyFieldsReq.response;

        const { phone, cnic_last6, franchise_uuid_list, amount_showed } = req.body;

        // FIELD VALIDATION
        if (phone.length !== 11) return validationError(res, "Invalid phone number", "phone");
        if (cnic_last6.length !== 6) return validationError(res, "Invalid CNIC last 6 digits", "cnic_last6");
        if (!Array.isArray(franchise_uuid_list)) return frontError(res, "franchise_uuid_list must be an array", "franchise_uuid_list");
        const franchiseUuidList = Array.from(new Set(franchise_uuid_list))
        const amount = FRANCHISE_CHARGES * franchiseUuidList.length;
        if (amount !== amount_showed) return frontError(res, `Amount showed and the amount calculated is mismatched ${amount}`, "amount_showed");


        // CHECK FRANCHISES
        let franchises = await Franchise.findAll({ where: { uuid: franchiseUuidList }, attributes: ["uuid", "active", "active_date", "txn_ref_no", "response_code"] });
        if (!franchises || franchises.length === 0) return notFound(res, "No franchises found with the given uuids");
        franchises = JSON.parse(JSON.stringify(franchises));
        if (franchises.length != franchiseUuidList.length) return validationError(res, "Some franchises not exist in the selected list, Refresh and try again.")


        // CHECK ACTIVE STATUS OF FRANCHISE IF ANY ACTIVE RETURN ERROR
        const franchiseActive = isListContainActiveFranchise(res, franchises);
        if (franchiseActive) return franchiseActive


        // PAYMENT INQUIRY
        const { txnRefNoList, txnRefNoCountObj, txnRefNoUuidsObj } = checkPendingPayments(franchises);
        if (txnRefNoList.length > 0) {
            const bulkInquiry = await performBulkInquiry(res, txnRefNoList, txnRefNoCountObj, txnRefNoUuidsObj, req.user.uuid);
            if (bulkInquiry.error) return bulkInquiry.error;
            if (bulkInquiry.paymentRestored) return validationError(res, "Some payments are already paid and restored, Refresh the page and try again.");
        }

        // ELSE CONTINUE TO PAYMENT REQUEST
        // GENERATE REF_NO
        const newRefNo = generateJazzcashRefNo();


        // UPDATE FRANCHISES WITH NEW REF NO FOR FUTURE UNSUCCESSFUL TRACK
        await Franchise.update({ txn_ref_no: newRefNo, response_code: null }, { where: { uuid: franchiseUuidList } });

        // PAYMENT REQUEST
        MWALLET.setCredentials({
            merchantId: jazz.merchantId,
            password: jazz.password,
            salt: jazz.salt,
            sandbox: jazz.sandbox
        });

        MWALLET.setData({
            amount,
            txnRefNo: newRefNo,
            mobileNumber: phone,
            cnic: cnic_last6,
            description: "Bulk Franchise Activation",
            billRefrence: newRefNo,
        })
        const jazzResponse = (await MWALLET.createRequest()).data;

        // IF PAYMENT NOT SUCCESSFUL 
        if (jazzResponse.pp_ResponseCode != "000" && jazzResponse.pp_ResponseCode != "121") {
            await Franchise.update({ response_code: jazzResponse.pp_ResponseCode }, { where: { uuid: franchiseUuidList } });

            // INVALID MERCHANT CREADENTIALS
            if (jazzResponse.pp_ResponseCode == '101') return backError(res, "Merchant creadentials are invalid, Backend error");
            // INVALID VALUE OF SOME VARIABLE IN PAYLOAD
            if (jazzResponse.pp_ResponseCode == '110') return backError(res, jazzResponse.pp_ResponseMessage);
            // INVALID HASH RECEIVED
            if (jazzResponse.pp_ResponseCode == '115') return backError(res, jazzResponse.pp_ResponseMessage);
            // INVALID TRANSACTION OR MISUSE OF CARD BY SOMEONE ELSE OR FRAUD
            if (jazzResponse.pp_ResponseCode == '409') return validationError(res, "Error while processing the transaction, Please try again later");
            // REQUEST REJECTED
            if (jazzResponse.pp_ResponseCode == '430') return validationError(res, "Your request rejected by the jazzCash, Please try again later");
            // SERVER FAILED or JAZZCASH BUSY
            if (jazzResponse.pp_ResponseCode == '431') return validationError(res, "JazzCash is down, Please try again later");
            // TRANSACTION FAILED
            if (jazzResponse.pp_ResponseCode == '999') return validationError(res, "Transaction request cancelled.");

            // PENDING STATUS
            if (jazzResponse.pp_ResponseCode == '124' || jazzResponse.pp_ResponseCode == '157') return res.status(202).send({ "message": "Transaction pending, Accept the payment request and recheck the status." });
            if (jazzResponse.pp_ResponseCode == "58") return res.status(202).send({ "message": "Transaction timed out, Please recheck the status in a while." });
            if (jazzResponse.pp_ResponseCode == "432") return res.status(202).send({ "message": "Server is busy, Please recheck the status in a while." });

            // OTHER RESPONSE CODES
            return validationError(res, jazzResponse.pp_ResponseMessage);
        }

        // IF PAYMENT SUCCESSFUL
        await Franchise.update({ txn_ref_no: null, active: true, active_date: new Date() }, { where: { uuid: franchiseUuidList } });
        await FarmaciePaymentHistory.create({
            retrival_ref_no: jazzResponse.pp_RetreivalReferenceNo,
            payment_method: "jazz mwallet",
            base_price: FRANCHISE_CHARGES,
            quantity: franchiseUuidList.length,
            franchises: franchiseUuidList,
            company_user_fk: req.user.uuid,
            user_fk: null,
            sandbox: jazz.sandbox
        });
        successOk(res, "Payment successful, Franchises activated successfully");
    } catch (error) {
        return catchError(res, error);

    }
}


// ================================================================


export async function jazzcashInquiry(req, res) {
    let franchises = await Franchise.findAll({
        attributes: ["uuid", "active", "active_date", "txn_ref_no", "response_code"],
        where: {
            txn_ref_no: { [Op.ne]: null }
        }
    });
    if (!franchises || franchises.length === 0) return successOk(res, "No pending payments found");
    franchises = JSON.parse(JSON.stringify(franchises));

    // PAYMENT INQUIRY
    const { txnRefNoList, txnRefNoCountObj, txnRefNoUuidsObj } = checkPendingPayments(franchises);
    if (txnRefNoList.length == 0) return successOk(res, "No pending payments found");    // true if have txn_ref_no but all are rejected.

    const bulkInquiry = await performBulkInquiry(res, txnRefNoList, txnRefNoCountObj, txnRefNoUuidsObj, req.user.uuid);
    if (bulkInquiry.error) return bulkInquiry.error;
    if (bulkInquiry.paymentRestored) return successOk(res, "Some already paid payments are restored, Refresh the page.");
    successOk(res, "Amount against the pending payments is not deducted. Pay to activate franchises.");
};

