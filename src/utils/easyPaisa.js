import axios from "axios";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

// ################################################################
//                        Helper Functions
// ################################################################

function generateEasypaisaRefNo() {
  let ref_no = uuidv4();
  const ref_length = Math.floor(Math.random() * 5 + 12); // Adjusted to account for 'EP' prefix
  ref_no = ref_no.replace(/-/g, "").slice(0, ref_length);
  return `EP${ref_no}`;
}

function getDateStr() {
  const date = new Date();
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}`;
}

function createBase64EncodedString(payload, salt) {
  let unhashedString = salt;
  for (const key in payload) {
    if (payload[key]) unhashedString += `&${payload[key]}`;
  }
  const unhashedBuffer = Buffer.from(unhashedString, "utf-8");
  return unhashedBuffer.toString("base64");
}

// ################################################################
//                     Sending Requests
// ################################################################

const sendRequest = async ({ payload, url, credentials }) => {
  try {
    const authHeader = Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64")
    const headers = {
      'Credentials': authHeader, // Keep as 'Credentials' to match Postman
      'Content-Type': 'application/json'
    };

    const response = await axios.post(url, payload, { headers });
    return { status: response.status, data: response.data };
  } catch (error) {
    throw {
      message: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : 500
    };
  }
};


// ################################################################
//                      MWALLET Functions
// ################################################################

const EPMWALLET = {
  salt: "",
  credentials: null,
  data: false,
  payload: {
    orderId: "",
    storeId: "",
    transactionAmount: "",
    transactionType: "MA",
    mobileAccountNo: "",
    emailAddress: "",
    accountNum: "",
    emailAddress: "",
    optional1: "",
    optional2: "",
    optional3: "",
    optional4: "",
    optional5: ""
  },
  requestUrl: "",

  setCredentials({ username, password, salt, storeId, accountNum, sandbox }) {
    if (!username || !password || !salt || !storeId || !accountNum || sandbox == null) {
      throw new Error("Incomplete credentials, required fields are: username, password, salt, storeId, accountNum, sandbox");
    }
    this.credentials = { username, password, salt, storeId, accountNum, sandbox };
    this.salt = salt;
    this.payload.storeId = storeId;
    this.payload.accountNum = accountNum;
    this.requestUrl = sandbox
      ? "https://easypay.easypaisa.com.pk/easypay-service/rest/v4/initiate-ma-transaction"
      : "https://easypay.easypaisa.com.pk/easypay-service/rest/v4/initiate-ma-transaction";
    // console.log("MWALLET Credentials Set:", this.credentials);
  },

  setData({ orderId, transactionAmount, mobileAccountNo, emailAddress, optional1, optional2, optional3, optional4, optional5 }) {
    if (!orderId || !transactionAmount || !mobileAccountNo || !emailAddress) {
      throw new Error("Incomplete data, required fields are: orderId, transactionAmount, mobileAccountNo, emailAddress");
    }
    this.payload = {
      ...this.payload,
      orderId,
      transactionAmount,
      mobileAccountNo,
      emailAddress,
      optional1: optional1 || "",
      optional2: optional2 || "",
      optional3: optional3 || "",
      optional4: optional4 || "",
      optional5: optional5 || ""
    };
    this.data = true;
    // console.log("MWALLET Data Set:", this.payload);
  },

  async createRequest() {
    if (!this.credentials || !this.data) {
      // console.error("Missing credentials or data in MWALLET.createRequest.");
      throw new Error("Incomplete request. Ensure credentials and data are set.");
    }

    const headers = {
      'Credentials': `Basic ${Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString("base64")}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await sendRequest({
        payload: this.payload,
        url: this.requestUrl,
        credentials: this.credentials
      });
      this.reset();
      return response;
    } catch (error) {
      // console.error("Error in MWALLET.createRequest:", error);
      this.reset();
      throw error;
    }
  },

  reset() {
    this.payload = {
      orderId: "",
      storeId: "",
      transactionAmount: "",
      transactionType: "MA",
      mobileAccountNo: "",
      emailAddress: "",
      optional1: "",
      optional2: "",
      optional3: "",
      optional4: "",
      optional5: ""
    };
    this.credentials = null;
    this.data = false;
  }
};

// ################################################################
//                      INQUIRY Functions
// ################################################################

const EPINQUIRY = {
  salt: "",
  credentials: null,
  data: false,
  payload: {
    orderId: "",
    storeId: "",
    accountNum: ""
  },
  requestUrl: "",

  setCredentials({ username, password, salt, storeId, accountNum, sandbox }) {
    // console.log("Setting INQUIRY Credentials:", { username, password, salt, storeId, accountNum, sandbox });
    if (!username || !password || !salt || !storeId || !accountNum || sandbox == null) {
      throw new Error("Incomplete credentials, required fields are: username, password, salt, storeId, accountNum, sandbox");
    }
    this.salt = salt;
    this.payload.storeId = storeId;
    this.payload.accountNum = accountNum;
    this.requestUrl = sandbox
      ? "https://easypay.easypaisa.com.pk/easypay-service/rest/v4/inquire-transaction"
      : "https://easypay.easypaisa.com.pk/easypay-service/rest/v4/inquire-transaction";
    this.credentials = { username, password, salt, storeId, accountNum };
    // console.log("INQUIRY.credentials inside setCredentials:", this.credentials);
  },

  setData({ orderId, storeId, accountNum }) {
    if (!orderId || !storeId || !accountNum) {
      throw new Error("orderId, storeId, and accountNum are required fields.");
    }
    this.payload = {
      orderId,
      storeId,
      accountNum
    };
    this.data = true;
    // console.log("INQUIRY Data Set:", this.payload);
  },

  async createRequest() {
    if (!this.credentials || !this.data) {
      throw new Error("Incomplete request. Ensure credentials and data are set.");
    }
    try {
      const response = await sendRequest({
        payload: this.payload,
        url: this.requestUrl,
        credentials: this.credentials
      });
      this.reset();
      return response;
    } catch (error) {
      this.reset();
      throw error;
    }
  },

  reset() {
    this.payload = {
      orderId: "",
      storeId: "",
      accountNum: ""
    };
    this.credentials = null;
    this.data = false;
  }
};

// ################################################################
//                          Export Modules
// ################################################################

export { EPMWALLET, EPINQUIRY, sendRequest, createBase64EncodedString, generateEasypaisaRefNo };
