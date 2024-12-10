import express from "express";
import * as cropCtrl from "../../controllers/crop/crop.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js"

const router = express.Router();

router.get("/list", verifyToken, cropCtrl.getCropsList)

export default router;