import express from "express";
import * as franchiseCatalogCtrl from "../../controllers/franchise/franchiseCatalog.controller.js"
import verifyToken, { isFranchiseActive } from "../../middlewares/authMiddleware.js";

const router = express.Router()

router.route("/product")
    .post(verifyToken, isFranchiseActive, franchiseCatalogCtrl.subscribeProduct)
    .get(verifyToken, isFranchiseActive, franchiseCatalogCtrl.getSubcribedProducts)
    .delete(verifyToken, isFranchiseActive, franchiseCatalogCtrl.unsubscribeProduct)

router.route("/seed")
    .post(verifyToken, isFranchiseActive, franchiseCatalogCtrl.subscribeSeed)
    .get(verifyToken, isFranchiseActive, franchiseCatalogCtrl.getSubscribedSeeds)
    .delete(verifyToken, isFranchiseActive, franchiseCatalogCtrl.unsubscribeSeed)

router.get('/unsub-product', isFranchiseActive, verifyToken, franchiseCatalogCtrl.getProductsToSubscribe)
router.get('/unsub-seed', isFranchiseActive, verifyToken, franchiseCatalogCtrl.getSeedsToSubcribe)
router.get('/stats', verifyToken, franchiseCatalogCtrl.frachiseCatalogStats)
export default router;