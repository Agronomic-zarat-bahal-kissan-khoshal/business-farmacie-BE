import { catchError, successOkWithData } from "../../utils/responses.js";
import Ingredient from "../../models/ingredient/ingredient.model.js";

// ========================================
//             CONTOLLERS
// ========================================

export async function getGlobalListIngredients(req, res) {
    try {
        const ingredients = await Ingredient.findAll({
            attributes: ["ingredient_name"],
            order: [
                ["ingredient_name", "ASC"] // Sorting in ascending order
            ]
        });

        // Extract distinct ingredient names
        const distinctIngredients = [...new Set(ingredients.map(ingredient => ingredient.ingredient_name))];

        // Get the count of distinct ingredients
        const count = distinctIngredients.length;

        return successOkWithData(res, "Ingredients fetched successfully", { ingredients: distinctIngredients, count });
    } catch (error) {
        console.log("error while getting the ingredients", error);
        return catchError(res, error);
    }
}