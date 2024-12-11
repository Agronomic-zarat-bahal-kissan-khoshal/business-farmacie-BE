// EASYPAISA LIVE CREDENTIALS
const EASYPAISA_USERNAME = "Agronomics";
const EASYPAISA_PASSWORD = "a1e661a50fb96e33016f6b700a4a5595";
const EASYPAISA_HASH_SALT = "GRU9Q2BT09FPF80P";
const EASYPAISA_STORE_ID = "658174";
const EASYPAISA_ACCOUNT_NUM = "153290166";

// EASYPAISA SANDBOX CREDENTIALS
const SANDBOX_EASYPAISA_USERNAME = "Agronomics";
const SANDBOX_EASYPAISA_PASSWORD = "a1e661a50fb96e33016f6b700a4a5595";
const SANDBOX_EASYPAISA_HASH_SALT = "GRU9Q2BT09FPF80P";
const SANDBOX_EASYPAISA_STORE_ID = "658174";
const SANDBOX_EASYPAISA_ACCOUNT_NUM = "153290166";

// CURRENTLY ACTIVATED ENVIRONMENT
const SANDBOX = process.env.SANDBOX === "true"; // Use environment variable for flexibility

// FUNCTION TO GET EASYPAISA CREDENTIALS
const getEasyPaisaCredentials = () => {
    if (SANDBOX) {
        return {
            username: SANDBOX_EASYPAISA_USERNAME,
            password: SANDBOX_EASYPAISA_PASSWORD,
            salt: SANDBOX_EASYPAISA_HASH_SALT,
            storeId: SANDBOX_EASYPAISA_STORE_ID,
            accountNum: SANDBOX_EASYPAISA_ACCOUNT_NUM,
            sandbox: SANDBOX
        };
    } else {
        return {
            username: EASYPAISA_USERNAME,
            password: EASYPAISA_PASSWORD,
            salt: EASYPAISA_HASH_SALT,
            storeId: EASYPAISA_STORE_ID,
            accountNum: EASYPAISA_ACCOUNT_NUM,
            sandbox: SANDBOX
        };
    }
};

// EXPORT THE FUNCTION
export {
    getEasyPaisaCredentials
};
