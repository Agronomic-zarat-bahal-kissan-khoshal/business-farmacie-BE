import express from "express";
import * as seedTrialCtrl from "../../controllers/seedTrial/seedTrial.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js"

const router = express.Router();

router.route("/")
    .post(verifyToken, seedTrialCtrl.addSeedTrialAndDate)

router.get("/all", verifyToken, seedTrialCtrl.getAllTrials);
router.get("/data/all", verifyToken, seedTrialCtrl.getTrialData);
router.patch("/data", verifyToken, seedTrialCtrl.updateTrialData);


export default router;