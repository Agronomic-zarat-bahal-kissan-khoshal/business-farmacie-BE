import express from "express";
import * as franchiseCtrl from "../../controllers/franchise/franchise.controller.js"
import verifyToken from "../../middlewares/authMiddleware.js";

const router = express.Router()

router.route("/")
    .post(verifyToken, franchiseCtrl.addFranchise)
    .get(verifyToken, franchiseCtrl.getSingleFranchise)
    .delete(verifyToken, franchiseCtrl.deleteFranchise)
    .patch(verifyToken, franchiseCtrl.updateFranchise)

router.get('/all', verifyToken, franchiseCtrl.getFranchises)
router.get('/stats', verifyToken, franchiseCtrl.franchiseStats)
router.get('/inactive', verifyToken, franchiseCtrl.getInactiveFranchises)
export default router;