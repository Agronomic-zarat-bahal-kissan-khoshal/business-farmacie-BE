import express from "express";
import * as ingredientCtrl from "../../controllers/ingredient/ingredient.controller.js"
import verifyToken from "../../middlewares/authMiddleware.js";

const router = express.Router()

// ADD THE ISADMIN MIDDLEARE FOR DELETE
router.route("/global-list")
    .get(verifyToken, ingredientCtrl.getGlobalListIngredients)

export default router;