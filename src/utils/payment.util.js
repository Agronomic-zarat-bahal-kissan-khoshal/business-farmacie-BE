import { getJazzCredentials } from "../config/jazzcash.config.js";
import { FRANCHISE_CHARGES } from "../config/payment.config.js";
import Franchise from "../models/franchise/franchise.model.js";
import FarmaciePaymentHistory from "../models/payment/paymentHistroy.model.js";
import { INQUIRY } from "./jazzcash.js";
import { backError, catchError, conflictError, validationError } from "./responses.js";
import { check31DaysExpiry } from "./utils.js";

// =================================================================================
//                                GLOBAL VARIABLES
// =================================================================================
const jazz = getJazzCredentials();


// ================================================================
//                          FUNCTIONS
// ================================================================


const isListContainActiveFranchise = (res, franchises) => {
    let activeFranchisesCount = 0;
    for (const franchise of franchises) {
        if (franchise.active) {
            const { expired } = check31DaysExpiry(franchise.active_date);
            if (!expired) activeFranchisesCount++;
        }
    }
    if (activeFranchisesCount === franchises.length) return conflictError(res, "All franchises are already active.");
    if (activeFranchisesCount > 0) return conflictError(res, `${activeFranchisesCount} franchise's are already activated. Refresh the page and try again.`);
    return null
}


// ================================================================

const checkPendingPayments = (franchises) => {
    let txnRefNoList = [];
    let txnRefNoCountObj = {};
    let txnRefNoUuidsObj = {};
    for (const franchise of franchises) {
        const ref_no = franchise.txn_ref_no
        // IF PAYMENT PENDING
        if (ref_no && ["124", "157", null].includes(franchise.response_code)) {
            txnRefNoList.push(ref_no);
            // INITIALIZE OR INCREMENT FRANCHISES COUNT AGAINST REF NO
            if (!txnRefNoCountObj[ref_no]) txnRefNoCountObj[ref_no] = 1;
            else txnRefNoCountObj[ref_no]++

            // INITIALIZE OR PUSH FRANCHISE UUIDS AGAINST REF NO
            if (!txnRefNoUuidsObj[ref_no]) txnRefNoUuidsObj[ref_no] = [franchise.uuid]
            else txnRefNoUuidsObj[ref_no].push(franchise.uuid);
        }
    }
    txnRefNoList = Array.from(new Set(txnRefNoList));
    return { txnRefNoList, txnRefNoCountObj, txnRefNoUuidsObj };
};

// ================================================================

const callJazzcashInquiry = async (txnRefNo) => {
    try {
        INQUIRY.setCredentials(
            {
                merchantId: jazz.merchantId,
                password: jazz.password,
                salt: jazz.salt,
                sandbox: jazz.sandbox
            }
        );
        INQUIRY.setData({ txnRefNo: txnRefNo });
        const response = (await INQUIRY.createRequest()).data;
        if (response.pp_ResponseCode == "000" || response.pp_PaymentResponseCode == "121") {
            return { success: true, response, error: false };
        }
        else return { success: false, response, error: false };
    } catch (error) {
        return { success: null, response: error, error: true };
    }
};

// ================================================================

const performBulkInquiry = async (res, txnRefNoList, txnRefNoCountObj, txnRefNoUuidsObj, company_user_fk) => {
    let paymentRestored = false;

    let paidUuids = [];
    let failedUuids = [];
    let paidRefRetrivalNoObj = {};
    for (const refNo of txnRefNoList) {
        const inquiry = await callJazzcashInquiry(refNo);
        if (inquiry.success && !inquiry.error) {
            paidUuids.push(...txnRefNoUuidsObj[refNo]);
            paidRefRetrivalNoObj[refNo] = inquiry.response.pp_RetrievalReferenceNo;
        }
        else if (!inquiry.success && !inquiry.error) failedUuids.push(...txnRefNoUuidsObj[refNo]);
        else return { error: catchError(res, inquiry.response), paymentRestored: false };
    }

    // RESET FAILED PAYMENT REQUESTS
    if (failedUuids.length > 0) {
        await Franchise.update({ txn_ref_no: null, response_code: null },
            { where: { uuid: failedUuids } });
    }

    // FOR SUCCESSFUL PAYMENTS
    if (paidUuids.length == 0) return { error: null, paymentRestored }

    // ELSE SET ACTIVE FRANCHISES
    paymentRestored = true;
    await Franchise.update({ active: true, active_date: new Date(), txn_ref_no: null, response_code: null },
        { where: { uuid: paidUuids } });

    // CREATE PAYMENT RECORDS
    for (const refNo in paidRefRetrivalNoObj) {
        await FarmaciePaymentHistory.create({
            retrival_ref_no: paidRefRetrivalNoObj[refNo],
            payment_method: "jazz mwallet",
            base_price: FRANCHISE_CHARGES,
            quantity: txnRefNoCountObj[refNo],
            franchises: txnRefNoUuidsObj[refNo],
            company_user_fk,
            user_fk: null,
            sandbox: jazz.sandbox
        });
    }
    return { error: null, paymentRestored };
};


// ================================================================

const getJazzResponseFromResCode = (jazzResponse) => {
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
};


export { isListContainActiveFranchise, checkPendingPayments, callJazzcashInquiry, performBulkInquiry, getJazzResponseFromResCode }