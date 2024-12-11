import Franchise from "../../models/franchise/franchise.model.js";
import { catchError, catchErrorWithSequelize, conflictError, frontError, notFound, successOk, successOkWithData, validationError } from "../../utils/responses.js";
import { bodyReqFields, queryReqFields } from "../../utils/requiredFields.js";
import { check31DaysExpiry, convertToLowercase } from "../../utils/utils.js";
import { generateEasypaisaRefNo, EPINQUIRY, EPMWALLET } from "../../utils/easyPaisa.js";
import { getEasyPaisaCredentials } from "../../config/easypaisa.config.js";
import FarmaciePaymentHistory from "../../models/payment/paymentHistroy.model.js";
import { FRANCHISE_CHARGES } from "../../config/payment.config.js";
import { isListContainActiveFranchise, epPerformBulkInquiry, epPerformMwallet,epCheckPendingPayments ,getEasypaisaResponseFromResCode} from "../../utils/epPayment.util.js";
import { Op } from "sequelize";


// =================================================================================
//                                GLOBAL VARIABLES
// =================================================================================
const easypaisa = getEasyPaisaCredentials();
 


// =================================================================================
//                                CONTROLERS
// =================================================================================



export async function easypaisaMwalletBulkPayment(req, res) {
  try {
      const reqFields = ["phone", "email", "franchise_uuid_list", "amount_showed"];
      const bodyFieldsReq = bodyReqFields(req, res, reqFields);
      if (bodyFieldsReq.error) return bodyFieldsReq.response;

      const { phone, email, franchise_uuid_list, amount_showed } = req.body;

      // Validate fields
      if (phone.length !== 11) return validationError(res, "Invalid phone number", "phone");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return validationError(res, "Invalid email address", "email");
      if (!Array.isArray(franchise_uuid_list)) return frontError(res, "franchise_uuid_list must be an array", "franchise_uuid_list");

      const franchiseUuidList = Array.from(new Set(franchise_uuid_list));
      const amount = FRANCHISE_CHARGES * franchiseUuidList.length;
      if (amount !== amount_showed) return frontError(res, `Amount mismatch: Expected ${amount}, got ${amount_showed}`, "amount_showed");

  // CHECK FRANCHISES
  let franchises = await Franchise.findAll({ where: { uuid: franchiseUuidList }, attributes: ["uuid", "active", "active_date", "txn_ref_no", "response_code"] });
  if (!franchises || franchises.length === 0) return notFound(res, "No franchises found with the given uuids");
  franchises = JSON.parse(JSON.stringify(franchises));
  if (franchises.length != franchiseUuidList.length) return validationError(res, "Some franchises not exist in the selected list, Refresh and try again.")

      franchises = JSON.parse(JSON.stringify(franchises));
      if (franchises.length !== franchiseUuidList.length) {
          return validationError(res, "Some franchises do not exist. Refresh and try again.");
      }

      // Check active status
      const franchiseActive = isListContainActiveFranchise(res, franchises);
      if (franchiseActive) return franchiseActive;

      // Check pending payments
      const { txnRefNoList, txnRefNoCountObj, txnRefNoUuidsObj } = epCheckPendingPayments(franchises);
      if (txnRefNoList.length > 0) {
        console.log("req.user:=======", req.user);
          const bulkInquiry = await epPerformBulkInquiry(res, txnRefNoList, txnRefNoCountObj, txnRefNoUuidsObj, req.user.uuid);
          if (bulkInquiry.error) return bulkInquiry.error;
          if (bulkInquiry.paymentRestored) {
              return validationError(res, "Some payments are already paid and restored. Refresh and try again.");
          }
      }

      // Generate a new reference number
      const newRefNo = generateEasypaisaRefNo();

      // Update franchises with the new reference number
      await Franchise.update(
          { txn_ref_no: newRefNo, response_code: null },
          { where: { uuid: franchiseUuidList } }
      );

      // Perform Easypaisa MWallet payment
      const mwalletData = await epPerformMwallet(newRefNo, EPMWALLET, FRANCHISE_CHARGES, phone, email);

      // Handle Easypaisa response
      if (mwalletData.responseCode !== "0000") {
        console.log("Mwallet Response Data:=======", mwalletData);

        await Franchise.update({ response_code: mwalletData.responseCode }, { where: { uuid: franchiseUuidList } });
          return getEasypaisaResponseFromResCode(mwalletData, res);
      }

      // Mark franchises as active and log payment
      await Franchise.update(
          { txn_ref_no: null, active: true, active_date: new Date() },
          { where: { uuid: franchiseUuidList } }
      );

      await FarmaciePaymentHistory.create({
          retrival_ref_no: mwalletData.pp_RetreivalReferenceNo,
          payment_method: "MA",
          base_price: FRANCHISE_CHARGES,
          quantity: franchiseUuidList.length,
          franchises: franchiseUuidList,
          company_user_fk: req.user.uuid,
          user_fk: null,
          sandbox: easypaisa.sandbox
      });

      return successOk(res, "Payment successful. Franchises activated successfully.");
  } catch (error) {
    console.log("Error in easypaisaMwalletBulkPayment:============ ", error);
      return catchError(res, error);
  }
}



// ================================================================


export async function easypaisaInquiry(req, res) {
    let franchises = await Franchise.findAll({
        attributes: ["uuid", "active", "active_date", "txn_ref_no", "response_code"],
        where: {
            txn_ref_no: { [Op.ne]: null }
        }
    });
    if (!franchises || franchises.length === 0) return successOk(res, "No pending payments found");
    franchises = JSON.parse(JSON.stringify(franchises));

    // PAYMENT INQUIRY
    const { txnRefNoList, txnRefNoCountObj, txnRefNoUuidsObj } = epCheckPendingPayments(franchises);
    if (txnRefNoList.length == 0) return successOk(res, "No pending payments found");    // true if have txn_ref_no but all are rejected.

    const bulkInquiry = await epPerformBulkInquiry(res, txnRefNoList, txnRefNoCountObj, txnRefNoUuidsObj, req.user.uuid);
    if (bulkInquiry.error) return bulkInquiry.error;
    if (bulkInquiry.paymentRestored) return successOk(res, "Some already paid payments are restored, Refresh the page.");
    successOk(res, "Amount against the pending payments is not deducted. Pay to activate franchises.");
};




