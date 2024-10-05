import express from "express";
import * as productCtrl from "../../controllers/product/product.controller.js";
import upload from "../../config/multer.config.js";
import verifyToken from "../../middlewares/authMiddleware.js";
import { setProductImgPath } from "../../middlewares/multer.middleware.js";
const router = express.Router();

router.route("/")
    .post(verifyToken, setProductImgPath, upload.fields([{ name: 'images', maxCount: 5 }]), productCtrl.createProduct)
    .get(verifyToken, productCtrl.getSingleProduct)
    .patch(verifyToken, setProductImgPath, upload.fields([{ name: 'images', maxCount: 3 }]), productCtrl.updateProduct)
    .delete(verifyToken, productCtrl.deleteProduct);

router.get("/all", verifyToken, productCtrl.getProducts);
router.delete("/image", verifyToken, productCtrl.deleteProductImg)



export default router;