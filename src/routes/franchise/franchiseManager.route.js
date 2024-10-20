import express from "express";
import * as franchiseManagerCtrl from "../../controllers/franchise/franchiseManger.controller.js"
import verifyToken from "../../middlewares/authMiddleware.js";

const router = express.Router()

router.route("/")
    .post(verifyToken, franchiseManagerCtrl.addFranchiseManger)
    .delete(verifyToken, franchiseManagerCtrl.deleteFranchiseManager)
    .patch(verifyToken, franchiseManagerCtrl.updateFranchiseManager)

router.get('/all', verifyToken, franchiseManagerCtrl.getFranchiseManagers)
router.get('/stats', verifyToken, franchiseManagerCtrl.franchiseManagerStats)
export default router;