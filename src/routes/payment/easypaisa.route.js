
import express from "express";
import verifyToken from "../../middlewares/authMiddleware.js";
import * as paymentCtrl from "../../controllers/payment/easypaisa.controller.js";


const router = express.Router();
router.post("/easypaisa-mwallet/bulk", verifyToken, paymentCtrl.easypaisaMwalletBulkPayment);
router.get("/inquiry", verifyToken, paymentCtrl.easypaisaInquiry);

export default router;