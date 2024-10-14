// CURRENTLY ACTIVATED PAYMENT ENVIRONMENT
// ======================================
const SANDBOX = true;
// ======================================

// JAZZ CASH LIVE CREDENTIALS
if (!SANDBOX && !process.env.JAZZCASH_MERCHANT_ID) throw new Error("Missing JAZZCASH_MERCHANT_ID in environment variables");
if (!SANDBOX && !process.env.JAZZCASH_PASSWORD) throw new Error("Missing JAZZCASH_PASSWORD in environment variables");
if (!SANDBOX && !process.env.JAZZCASH_HASH_SALT) throw new Error("Missing JAZZCASH_HASH_SALT in environment variables");


// JAZZ CASH SANDBOX CREDENTIALS
const SANDBOX_JAZZCASH_MERCHANT_ID = "MC94332"
const SANDBOX_JAZZCASH_PASSWORD = "udau93yy5e"
const SANDBOX_JAZZCASH_HASH_SALT = "uvw451v3zx"



// FUNCTION TO GET JAZZ CASH CREDENTIALS
const getJazzCredentials = () => {
    if (SANDBOX) {
        return {
            merchantId: SANDBOX_JAZZCASH_MERCHANT_ID,
            password: SANDBOX_JAZZCASH_PASSWORD,
            salt: SANDBOX_JAZZCASH_HASH_SALT,
            sandbox: SANDBOX
        }
    }
    else {
        return {
            merchantId: process.env.JAZZCASH_MERCHANT_ID,
            password: process.env.JAZZCASH_PASSWORD,
            salt: process.env.JAZZCASH_HASH_SALT,
            sandbox: SANDBOX
        }
    }
};


export {
    getJazzCredentials
}