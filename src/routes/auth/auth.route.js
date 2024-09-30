// Import required modules and configuration
import express from "express";
import * as authCtrl from "../../controllers/auth/auth.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", authCtrl.registerUser);

router.post("/login", authCtrl.loginUser);

router.post("/regenerate-access-token", authCtrl.regenerateAccessToken);

router.post("/password/update", verifyToken, authCtrl.updatePassword);

router.post("/password/forgot", verifyToken, authCtrl.forgotPassword);

router.post("/password/verify-otp", verifyToken, authCtrl.verifyOtp);

router.post("/password/reset", verifyToken, authCtrl.setNewPassword);

router.route("/profile")
    .get(verifyToken, authCtrl.getProfile)
    .patch(verifyToken, authCtrl.updateProfile);

export default router;