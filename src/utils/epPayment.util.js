import { getEasyPaisaCredentials } from "../config/easypaisa.config.js";
import { FRANCHISE_CHARGES } from "../config/payment.config.js";
import Franchise from "../models/franchise/franchise.model.js";
import FarmaciePaymentHistory from "../models/payment/paymentHistroy.model.js";
import { EPINQUIRY } from "./easyPaisa.js";

import {
  backError,
  catchError,
  conflictError,
  validationError,
} from "./responses.js";
import { check31DaysExpiry } from "./utils.js";

// =================================================================================
//                                GLOBAL VARIABLES
// =================================================================================
const easypaisa = getEasyPaisaCredentials();

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
  if (activeFranchisesCount === franchises.length)
    return conflictError(res, "All franchises are already active.");
  if (activeFranchisesCount > 0)
    return conflictError(
      res,
      `${activeFranchisesCount} franchise's are already activated. Refresh the page and try again.`
    );
  return null;
};

// ================================================================

const epCheckPendingPayments = (franchises) => {
    let txnRefNoList = [];
    let txnRefNoCountObj = {};
    let txnRefNoUuidsObj = {};
    for (const franchise of franchises) {
        const ref_no = franchise.txn_ref_no
        // IF PAYMENT PENDING
        if (ref_no && ["PENDING", null].includes(franchise.response_code)) {
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

const epPerformMwallet = async (
  ref_no,
  EPMWALLET,
  SIMULATOR_CHARGES,
  phone,
  email
)=> {
  // Set EasyPaisa credentials for EPMWALLET
  EPMWALLET.setCredentials({
    username: easypaisa.username,
    password: easypaisa.password,
    salt: easypaisa.salt,
    storeId: easypaisa.storeId,
    accountNum: easypaisa.accountNum,
    sandbox: easypaisa.sandbox,
  });

  // Set the remaining data
  EPMWALLET.setData({
    orderId: `${ref_no}`,
    storeId: easypaisa.storeId,
    transactionAmount: `${SIMULATOR_CHARGES}`,
    transactionType: "MA",
    mobileAccountNo: `${phone}`,
    emailAddress: `${email}`, // Replace with user's email address
  });

  // console.log("EPMWALLET", EPMWALLET);

  const mwalletResponse = await EPMWALLET.createRequest();
  return mwalletResponse?.data;
}

// ================================================================

const callEasypaisaInquiry = async (txnRefNo) => {
  try {
    EPINQUIRY.setCredentials({
      username: easypaisa.username,
      password: easypaisa.password,
      salt: easypaisa.salt,
      storeId: easypaisa.storeId,
      accountNum: easypaisa.accountNum,
      sandbox: easypaisa.sandbox,
    });
    EPINQUIRY.setData({
      orderId: txnRefNo,
      storeId: easypaisa.storeId,
      accountNum: easypaisa.accountNum,
    });

    const response = (await EPINQUIRY.createRequest()).data;
    if (
      response.responseCode === "0000" &&
      response.transactionStatus === "PAID"
    ) {
      return {
        success: true,
        response,
        error: false,
      };
    } else
      return {
        success: false,
        response: { message: "Payment not completed", details: response },
        error: false,
      };
  } catch (error) {
    return { success: null, response: error, error: true };
  }
};

// ================================================================

const epPerformBulkInquiry = async (
  res,
  txnRefNoList,
  txnRefNoCountObj,
  txnRefNoUuidsObj,
  company_user_fk
) => {
  let paymentRestored = false;

  let paidUuids = [];
  let failedUuids = [];
  let paidRefRetrivalNoObj = {};
  for (const refNo of txnRefNoList) {
    const inquiry = await callEasypaisaInquiry(refNo);
    if (inquiry.success && !inquiry.error) {
      paidUuids.push(...txnRefNoUuidsObj[refNo]);
      paidRefRetrivalNoObj[refNo] = inquiry.response.pp_RetrievalReferenceNo;
    } else if (!inquiry.success && !inquiry.error)
      failedUuids.push(...txnRefNoUuidsObj[refNo]);
    else
      return {
        error: catchError(res, inquiry.response),
        paymentRestored: false,
      };
  }

  // RESET FAILED PAYMENT REQUESTS
  if (failedUuids.length > 0) {
    await Franchise.update(
      { txn_ref_no: null, response_code: null },
      { where: { uuid: failedUuids } }
    );
  }

  // FOR SUCCESSFUL PAYMENTS
  if (paidUuids.length == 0) return { error: null, paymentRestored };

  // ELSE SET ACTIVE FRANCHISES
  paymentRestored = true;
  await Franchise.update(
    {
      active: true,
      active_date: new Date(),
      txn_ref_no: null,
      response_code: null,
    },
    { where: { uuid: paidUuids } }
  );

  // CREATE PAYMENT RECORDS
  for (const refNo in paidRefRetrivalNoObj) {
    await FarmaciePaymentHistory.create({
      retrival_ref_no: paidRefRetrivalNoObj[refNo],
      payment_method: "MA",
      base_price: FRANCHISE_CHARGES,
      quantity: txnRefNoCountObj[refNo],
      franchises: txnRefNoUuidsObj[refNo],
      company_user_fk,
      user_fk: null,
      sandbox: easypaisa.sandbox,
    });
  }
  return { error: null, paymentRestored };
};

// ================================================================

const getEasypaisaResponseFromResCode = (easypaisaResponse, res) => {
  switch (easypaisaResponse.responseCode) {
    case "0001":
      return backError(res, "System error. This may be caused by an invalid phone number or Easypaisa server issue. Please verify and try again.");
    case "0002":
      return validationError(
        res,
        "Required field missing, please verify the input data."
      );
    case "0005":
      return backError(res, "Merchant account is not active, contact support.");
    case "0006":
      return validationError(
        res,
        "Invalid store ID, please check configuration."
      );
    case "0007":
      return validationError(res, "Store is not active, please try later.");
    case "0008":
      return validationError(
        res,
        "Payment method not enabled for this account."
      );
    case "0010":
      return validationError(
        res,
        "Invalid credentials, please check API settings."
      );
    case "0013":
      return backError(res, "Low balance in merchant account.");
    case "0014":
      return validationError(
        res,
        "Account does not exist, please verify account details."
      );
    default:
      return validationError(
        res,
        easypaisaResponse.responseMessage || "Unknown error occurred."
      );
  }
};


export {
  isListContainActiveFranchise,
  epCheckPendingPayments,
  epPerformMwallet,
  callEasypaisaInquiry,
  epPerformBulkInquiry,
  getEasypaisaResponseFromResCode,
};
