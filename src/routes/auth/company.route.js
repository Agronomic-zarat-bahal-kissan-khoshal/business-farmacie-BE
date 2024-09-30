import express from "express";
import * as companyCtrl from "../../controllers/auth/company.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js";

const router = express.Router();


router.delete("/", verifyToken, companyCtrl.deleteCompanyUser);


router.route("/global-list")
    .get(verifyToken, companyCtrl.getGlobalListCompanies)
    .post(verifyToken, companyCtrl.addCompniestoGlobalList)
    .delete(verifyToken, companyCtrl.deleteGlobalListCompanies)
    .put(verifyToken, companyCtrl.updateGlobalListCompanies);


router.route("/verify").post(verifyToken, companyCtrl.verifyCompanyUser);
router.get("/stats", verifyToken, companyCtrl.getCompaniesStats);

export default router;
