import express from "express";
import * as ingredientCtrl from "../../controllers/product/ingredient.controller.js"
import verifyToken from "../../middlewares/authMiddleware.js";

const router = express.Router()

// ADD THE ISADMIN MIDDLEARE FOR DELETE
router.route("/global-list")
    .get(verifyToken, ingredientCtrl.getGlobalListIngredients)
    .post(verifyToken, ingredientCtrl.addIngredientsToGlobalList)
    .put(verifyToken, ingredientCtrl.updateGlobalListIngredient)
    .delete(verifyToken, ingredientCtrl.deleteGlobalListIngredient)

export default router;