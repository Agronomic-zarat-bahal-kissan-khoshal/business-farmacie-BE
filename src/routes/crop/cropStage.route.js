import express from "express";
import * as cropStageCtrl from "../../controllers/crop/cropStage.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js"

const router = express.Router();

router.get("/all", verifyToken, cropStageCtrl.getCropStages);

export default router;