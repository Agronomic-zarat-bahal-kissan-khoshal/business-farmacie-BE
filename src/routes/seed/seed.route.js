import express from "express";
import * as seedCtrl from "../../controllers/seed/seed.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js"
import upload from "../../config/multer.config.js";
import { setSeedImgPath } from "../../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/")
    .post(verifyToken, setSeedImgPath, upload.fields([{ name: 'images', maxCount: 5 }]), seedCtrl.addSeed)
    .patch(verifyToken, setSeedImgPath, upload.fields([{ name: 'images', maxCount: 3 }]), seedCtrl.updateSeed)
    .get(verifyToken, seedCtrl.getSingleSeed)
    .delete(verifyToken, seedCtrl.deleteSeed);

router.get("/all", verifyToken, seedCtrl.getSeeds);
router.delete("/image", verifyToken, seedCtrl.deleteSeedImg)
router.get("/stats", verifyToken, seedCtrl.seedStats)


export default router;