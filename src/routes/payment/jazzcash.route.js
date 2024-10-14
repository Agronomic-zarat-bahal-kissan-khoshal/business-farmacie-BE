import express from "express";
import verifyToken from "../../middlewares/authMiddleware.js";
import * as paymentCtrl from "../../controllers/payment/jazzcash.controller.js";


const router = express.Router();
router.post("/mwallet/bulk", verifyToken, paymentCtrl.jazzcashMwalletBulkPayment);


export default router;