import Product from "../../models/product/product.model.js";
import ProductImage from "../../models/product/productImage.model.js";
import ActiveIngredient from "../../models/product/activeIngredient.model.js";
import Ingredient from "../../models/product/ingredient.model.js";
import { bodyReqFields, queryReqFields } from "../../utils/requiredFields.js";
import { catchError, conflictError, frontError, notFound, sequelizeValidationError, successOk, successOkWithData } from "../../utils/responses.js";
import { convertToLowercase, getRelativePath } from "../../utils/utils.js";
import { Sequelize } from "sequelize";
import sequelize from "../../config/dbConfig.js";






// ==========================================================
//                     CONTROLLERS
// ==========================================================

export async function createProduct(req, res) {
    try {
        // BODY REQUIRED FIELDS CHECK 
        const reqFields = ["name", "category", "sub_category",
            "type", "package_weight", "weight_unit", "package_type", "area_covered",
            "disease_purpose", "price", "description", "active_ingredients"];
        const bodyFieldsReq = bodyReqFields(req, res, reqFields);
        if (bodyFieldsReq.error) return bodyFieldsReq.response;



        // ACTIVE INGREDIENTS CHECK ========================================
        let active_ingredients = null;
        try {
            active_ingredients = JSON.parse(req.body.active_ingredients);
        } catch (error) {
            return frontError(res, "Active ingredients must be of type array of objects.", "active_ingredients");
        }

        // IF ACTIVE INGREDEINTS IS NOT ARRAY OR EMPTY RAISE ERROR
        if (!Array.isArray(active_ingredients)) return frontError(res, "Active ingredients must be of type array of objects.", "active_ingredients");
        if (active_ingredients.length === 0) return frontError(res, "Active ingredients array cannot be empty", "active_ingredients");

        // IF INGREDIENTS NAME IS MISSING IN ANY OBJECT OF ACTIVE INGREDIENTS ARRAY RAISE ERROR
        const ingredients = getActiveIngredientsData(res, active_ingredients);
        if (ingredients.error) return ingredients.response;
        // ACTIVE INGREDIENTS CHECK ========================================



        // IMAGES CHECK
        if (!req.files?.images?.length) return frontError(res, "Product images are required", "images");


        // CONVERT DATA TO LOWERCASE
        const excludedFields = ["active_ingredients", "price"]
        const requiredData = convertToLowercase(req.body, excludedFields);
        const { name, category, sub_category, type, package_weight,
            weight_unit, package_type, area_covered, disease_purpose, price, description } = requiredData;

        // PRODUCT DUPPLICATE CHECK
        let productFields = {
            name,
            company_fk: req.user.company_fk,
            category,
            sub_category,
            type,
            package_weight,
            weight_unit,
            package_type,
            area_covered,
            price
        }

        try {
            const dublicateProduct = await Product.findOne({ where: productFields });
            if (dublicateProduct) return conflictError(res, "Product already exists");
        } catch { }

        // CREATE PRODUCT
        productFields.description = description;
        productFields.disease_purpose = disease_purpose;
        productFields.verified = false;
        const product = await Product.create(productFields);

        // CREATE ACTIVE INGREDIENTS
        const allIngredients = ingredients.data.map(ingredient => ({ ...ingredient, product_fk: product.uuid }));
        try {
            await ActiveIngredient.bulkCreate(allIngredients, { validate: true });
        } catch (error) {
            await Product.destroy({ where: { uuid: product.uuid } });
            if (error.name === 'SequelizeDatabaseError') return frontError(res, error.message, "active_ingredients");
            if (error.errors && error.errors[0].errors instanceof Sequelize.ValidationError) return frontError(res, error.errors[0].message, "active_ingredients")
            if (error.name === 'SequelizeForeignKeyConstraintError' && error.parent?.constraint === "active_ingredients_ingredient_fk_fkey")
                return frontError(res, "active_ingredient's object contains an Active ingredient not preset in ingredient global list", "active_ingredient");
            return catchError(res, error);
        }

        // CREATE PRODUCT IMAGES
        try {
            const allImages = req.files.images.map(image => ({ product_fk: product.uuid, image_url: getRelativePath(image.path) }));
            await ProductImage.bulkCreate(allImages);
        } catch (error) {
            await Product.destroy({ where: { uuid: product.uuid } });
            console.log("error while creating the images of product", error);
            return catchError(res, error);
        }

        return successOk(res, "Product created successfully");


    } catch (error) {
        if (error instanceof Sequelize.ValidationError) return sequelizeValidationError(res, error);
        if (error.name === 'SequelizeDatabaseError') return frontError(res, error.message, "database");
        return catchError(res, error);
    }
}

// ========================== getProducts ================================


export async function getProducts(req, res) {
    try {
        const products = await Product.findAll({
            attributes: ['uuid', 'name', 'company_fk', 'category', 'sub_category'],
            where: {
                company_fk: req.user.company_fk
            }
        });
        return successOkWithData(res, "Products fetched successfully", products);
    } catch (error) {
        return catchError(res, error);
    }
}

// ========================== getSingleProduct ================================


export async function getSingleProduct(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["uuid"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const productUid = req.query.uuid

        const product = await Product.findByPk(productUid, {
            include: [
                {
                    required: false,
                    model: ProductImage,
                    as: 'product_image',
                    attributes: ['image_url', 'uuid']
                },
                {
                    required: false,
                    model: ActiveIngredient,
                    as: 'active_ingredient',
                    attributes: ['ingredient_fk', 'concentration', 'unit'],
                }
            ],
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            where: {
                uuid: productUid,
            }
        });
        if (!product) return notFound(res, "Product not found", "uuid");
        return successOkWithData(res, "Products fetched successfully", product);
    } catch (error) {
        return catchError(res, error);
    }
}

// ========================== updateProducts ================================


export async function updateProduct(req, res) {
    try {

        const queryFieldsReq = queryReqFields(req, res, ["uuid"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const productUid = req.query.uuid

        // IF ACTIVE INGREDIENTS
        console.log("req.body", req.body)
        if (req.body.active_ingredients) {
            let active_ingredients = null;
            try {
                active_ingredients = JSON.parse(req.body.active_ingredients);
            } catch (error) {
                return frontError(res, "Active ingredients must be of type array of objects.", "active_ingredients");
            }
            // IF ACTIVE INGREDEINTS IS NOT ARRAY OR EMPTY RAISE ERROR
            if (!Array.isArray(active_ingredients)) return frontError(res, "Active ingredients must be of type array of objects.", "active_ingredients");
            if (active_ingredients.length === 0) return frontError(res, "Active ingredients array cannot be empty", "active_ingredients");

            // IF INGREDIENTS NAME IS MISSING IN ANY OBJECT OF ACTIVE INGREDIENTS ARRAY RAISE ERROR
            const ingredients = getActiveIngredientsData(res, active_ingredients);
            if (ingredients.error) return ingredients.response;
            const allNewIngredients = ingredients.data.map(ingredient => ({ ...ingredient, product_fk: productUid }));


            const t = await sequelize.transaction();
            try {
                await ActiveIngredient.destroy({ where: { product_fk: productUid }, transaction: t });
                await ActiveIngredient.bulkCreate(allNewIngredients, { transaction: t, validate: true });
                await t.commit();
            } catch (error) {
                await t.rollback()
                if (error.name === 'SequelizeDatabaseError') return frontError(res, error.message, "active_ingredients");
                if (error.errors[0].errors instanceof Sequelize.ValidationError) return frontError(res, error.errors[0].message, "active_ingredients")
                return catchError(res, error);
            }


        }


        // IF IMAGES
        if (req.files?.images?.length) {
            try {
                const allImages = req.files.images.map(image => ({ product_fk: productUid, image_url: getRelativePath(image.path) }));
                await ProductImage.bulkCreate(allImages);
            } catch (error) {
                return catchError(res, error);
            }
        }


        // CONVERT DATA TO LOWERCASE
        const excludedFields = ["active_ingredients"]
        const requiredData = convertToLowercase(req.body, excludedFields);
        const { name, category, sub_category, type, package_weight,
            weight_unit, package_type, area_covered, disease_purpose, price, description } = requiredData;

        const productFields = {
            name, category, sub_category, type, package_weight,
            weight_unit, package_type, area_covered, disease_purpose, price, description
        }

        // PRODUCT FIELDS TO UPDATE
        let fieldsToUpdate = {};
        for (const field in productFields) if (productFields[field]) fieldsToUpdate[field] = productFields[field];

        console.log("fieldsToUpdate", fieldsToUpdate)
        console.log("productUid", productUid)
        console.log("req.user.company_fk", req.user.company_fk)
        //UPDATE
        await Product.update(fieldsToUpdate, { where: { uuid: productUid, company_fk: req.user.company_fk } });
        return successOk(res, "Product updated successfully");

    } catch (error) {
        if (error instanceof Sequelize.ValidationError) return sequelizeValidationError(res, error);
        if (error.name === 'SequelizeDatabaseError') return frontError(res, error.message, "database");
        return catchError(res, error);
    }
}


// ========================== deleteProduct ================================

export async function deleteProduct(req, res) {
    try {

        const queryFieldsReq = queryReqFields(req, res, ["uuid"])
        if (queryFieldsReq.error) return queryFieldsReq.response

        const productUid = req.query.uuid;
        await Product.destroy({ where: { uuid: productUid, company_fk: req.user.company_fk } })
        return successOk(res, "Product delete successfully")

    } catch (error) {
        return catchError(res, error)
    }
}

// ========================== deleteProductImg ================================
export async function deleteProductImg(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["imgUid"])
        if (queryFieldsReq.error) return queryFieldsReq.response

        const { imgUid } = req.query;
        await ProductImage.destroy({ where: { uuid: imgUid } })
        return successOk(res, "Product image delete successfully")

    } catch (error) {
        return catchError(res, error)
    }
}


// ================================================================
//                     Helper Functions
// ================================================================



const getActiveIngredientsData = (res, active_ingredients) => {
    let error = false;
    let response = null;
    let data = [];
    for (const ingredient of active_ingredients) {
        const { ingredient_name, concentration, unit } = ingredient;
        // CHECK IF INGREDIENT NAME IS MISSING
        if (!ingredient_name) {
            error = true;
            response = frontError(res, "ingredient_name key is missing in object of acitve ingredient in active_ingredients array.", "ingredient_name");
            break;
        }
        const activeIngredient = {
            ingredient_fk: ingredient_name.toLowerCase(),
            concentration: concentration || null,
            unit: unit?.toLowerCase() || null
        }
        data.push(activeIngredient);
    }
    return { error, response, data };
}