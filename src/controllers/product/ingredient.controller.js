import { catchError, conflictError, created, frontError, sequelizeValidationError, successOk, successOkWithData, validationError } from "../../utils/responses.js";
import Ingredient from "../../models/product/ingredient.model.js";
import { bodyReqFields, queryReqFields } from "../../utils/requiredFields.js";
import { Op } from "sequelize";
import { convertToLowercase } from "../../utils/utils.js";

// ========================================
//             CONTOLLERS
// ========================================
export async function addIngredientsToGlobalList(req, res) {
    try {
        const { ingredients } = req.body;
        if (!ingredients) return frontError(res, "Missing body required fields", { ingredients: "This field is required." })
        if (!Array.isArray(ingredients)) return frontError(res, "Field ingredients is of type array.", "ingredients")
        if (ingredients.length === 0) return frontError(res, "Field ingredients  cannot be empty", "ingredients")

        // COVERT COMPANIES TO LOWER CASE
        const ingredientsLowerCase = ingredients.map(ingredient => ingredient.toLowerCase());

        // FINDING ALL COMPANIES THAT ARE ALREADY ADDED
        const ingredientsExist = await Ingredient.findAll({
            where: { ingredient_name: { [Op.in]: ingredientsLowerCase } },
            attributes: ["ingredient_name"]
        });

        // MAKING AN ARRAY OF COMPANIES THAT ARE ALREADY ADDED
        const ingredientsExistArr = ingredientsExist.map(ingredient => ingredient.ingredient_name)

        let ingredientsToAdd = ingredientsLowerCase.filter(ingredient => !ingredientsExistArr.includes(ingredient));
        ingredientsToAdd = ingredientsToAdd.map(ingredient => ({ ingredient_name: ingredient }));
        await Ingredient.bulkCreate(ingredientsToAdd);
        return created(res, "Ingredients added successfully");
    } catch (error) {
        console.log("error while creating the compnay", error);
        return catchError(res, error.message);
    }
}

// ================= getCompanies =======================

export async function getGlobalListIngredients(req, res) {
    try {
        const ingredients = await Ingredient.findAll({ attributes: ["ingredient_name"] });
        const count = ingredients.length;
        return successOkWithData(res, "Companies fetched successfully", { ingredients, count });
    } catch (error) {
        console.log("error while getting the companies", error);
        return catchError(res, error.message);
    }
}

// ================= deleteCompany =======================
export async function deleteGlobalListIngredient(req, res) {
    try {
        const reqQueryFields = queryReqFields(req, res, ["ingredient"]);
        if (reqQueryFields.error) return reqQueryFields.response;
        const requiredData = convertToLowercase(req.query);
        const { ingredient } = requiredData;


        await Ingredient.destroy({ where: { ingredient_name: ingredient } });
        return successOk(res, "Ingredient deleted successfully");
    } catch (error) {
        console.log("error while deleting the company", error);
        return catchError(res, error.message);
    }
}

// ================= updateCompany =======================
export async function updateGlobalListIngredient(req, res) {
    try {
        const reqBodyFields = bodyReqFields(req, res, ["ingredient", "updatedIngredient"]);
        if (reqBodyFields.error) return reqBodyFields.response;
        const requiredData = convertToLowercase(req.body);
        const { ingredient, updatedIngredient } = requiredData;

        const ingredientExists = await Ingredient.findByPk(ingredient);
        if (!ingredientExists) return validationError(res, "Ingredient not found in company global list");
        await Ingredient.update({ ingredient_name: updatedIngredient }, { where: { ingredient_name: ingredient } });
        return successOk(res, "Ingredient updated successfully");
    } catch (error) {
        console.log("Error while updating the Ingredient", error);
        if (error.name === "SequelizeUniqueConstraintError") return sequelizeValidationError(res, error);
        return catchError(res, error.message);
    }
}