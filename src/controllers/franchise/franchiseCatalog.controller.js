import { FranchiseCatalogProduct, FranchiseCatalogSeed } from "../../models/franchise/franchiseCatalog.model.js";
import { catchError, catchErrorWithSequelize, frontError, successOk, successOkWithData, validationError } from "../../utils/responses.js";
import { queryReqFields, bodyReqFields } from "../../utils/requiredFields.js";
import Product from "../../models/product/product.model.js";
import Seed from "../../models/seed/seed.model.js";


// ================================================================
//                          CONTROLLERS
// ================================================================

export async function subscribeProduct(req, res) {
    try {
        const reqFields = ["product_fk", "franchise_fk"];
        const bodyFieldsReq = bodyReqFields(req, res, reqFields);
        if (bodyFieldsReq.error) return bodyFieldsReq.response;
        const { product_fk, franchise_fk } = req.body;
        const product = await Product.findByPk(product_fk, { attributes: ["price"] });
        if (!product) return frontError(res, "Invalid product_fk, product not found.", "product_fk");
        if (!product.price) return validationError(res, "Product price is not set. Kindly upate the product price.");
        await FranchiseCatalogProduct.create({ product_fk, franchise_fk, price: product.price });
        return successOk(res, "Product subscribed successfully");

    } catch (error) {
        if (error.parent?.constraint === "franchise_catalog_products_product_fk_fkey") return frontError(res, "Invalid product_fk, product not found.", "product_fk");
        if (error.parent?.constraint === "franchise_catalog_products_franchise_fk_fkey") return frontError(res, "Invalid franchise_fk, franchise not found.", "franchise_fk");
        if (error.name === 'SequelizeUniqueConstraintError') return validationError(res, "Product already subscribed.", "product_fk");
        return catchError(res, error);
    }
}

// ============================ subscribeSeed ============================

export async function subscribeSeed(req, res) {
    try {
        const reqFields = ["seed_fk", "franchise_fk"];
        const bodyFieldsReq = bodyReqFields(req, res, reqFields);
        if (bodyFieldsReq.error) return bodyFieldsReq.response;
        const { seed_fk, franchise_fk } = req.body;
        const seed = await Seed.findByPk(seed_fk, { attributes: ["price"] });
        if (!seed) return frontError(res, "Invalid seed_fk, seed not found.", "seed_fk");
        if (!seed.price) return validationError(res, "Seed price is not set. Kindly upate the seed price.");
        await FranchiseCatalogSeed.create({ seed_fk, franchise_fk, price: seed.price });
        return successOk(res, "Seed subscribed successfully");

    } catch (error) {
        if (error.parent?.constraint === "franchise_catalog_seeds_seed_fk_fkey") return frontError(res, "Invalid seed_fk, seed not found.", "seed_fk");
        if (error.parent?.constraint === "franchise_catalog_seeds_franchise_fk_fkey") return frontError(res, "Invalid franchise_fk, franchise not found.", "franchise_fk");
        if (error.name === 'SequelizeUniqueConstraintError') return validationError(res, "Product already subscribed.", "product_fk");
        return catchError(res, error);
    }
}


// ============================ getProductsToSubscribe ============================

export async function getProductsToSubscribe(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["franchise_fk"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { franchise_fk } = req.query;
        const subscribedProducts = await FranchiseCatalogProduct.findAll({ where: { franchise_fk }, attributes: ["product_fk"] });
        const subscribedProductdIds = subscribedProducts.map(product => product.product_fk);
        let products = await Product.findAll({ where: { company_fk: req.user.company_fk }, attributes: ['uuid', 'name', 'company_fk', 'category', 'sub_category'] })
        products = JSON.parse(JSON.stringify(products));
        products.forEach(product => {
            if (subscribedProductdIds.includes(product.uuid)) {
                product.subscribed = true;
            } else {
                product.subscribed = false;
            }
        });
        return successOkWithData(res, "Data fetched successfully.", products);

    } catch (error) {
        console.log("========= error =======: ", error)
        return catchErrorWithSequelize(res, "Products to subscribed fetched successfully.", error);
    }
}


// ============================ getSeedToSubcribe ============================


export async function getSeedsToSubcribe(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["franchise_fk"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { franchise_fk } = req.query;
        const subscribedSeeds = await FranchiseCatalogSeed.findAll({ where: { franchise_fk }, attributes: ["seed_fk"] });
        const subscribedSeedIds = subscribedSeeds.map(seed => seed.seed_fk);
        let seeds = await Seed.findAll({ where: { company_fk: req.user.company_fk }, attributes: ['uuid', 'seed_variety_name', 'company_fk', 'crop_category', 'crop'] })
        seeds = JSON.parse(JSON.stringify(seeds));
        seeds.forEach(seed => {
            if (subscribedSeedIds.includes(seed.uuid)) seed.subscribed = true;
            else seed.subscribed = false;
        });
        return successOkWithData(res, "Seeds to subscribed fetched successfully.", seeds);

    } catch (error) {
        console.log("========= error =======: ", error)
        return catchErrorWithSequelize(res, error);
    }
}


// ============================ getSubscribedProducts ============================


export async function getSubcribedProducts(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["franchise_fk"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { franchise_fk } = req.query;
        let subscribedProducts = await FranchiseCatalogProduct.findAll(
            {
                where: { franchise_fk },
                attributes: ["uuid"],
                include: [
                    {
                        required: true,
                        model: Product,
                        as: 'product',
                        attributes: ['uuid', 'name', 'company_fk', 'category', 'sub_category']
                    }
                ]
            });
        return successOkWithData(res, "Subscribed products fetched successfully.", subscribedProducts);

    } catch (error) {
        console.log("========= error =======: ", error)
        return catchErrorWithSequelize(res, error);
    }
}


// ============================ getSubscribedSeeds ============================


export async function getSubscribedSeeds(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["franchise_fk"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { franchise_fk } = req.query;
        let subscribedSeeds = await FranchiseCatalogSeed.findAll(
            {
                where: { franchise_fk },
                attributes: ["uuid"],
                include: [
                    {
                        required: true,
                        model: Seed,
                        as: 'seed',
                        attributes: ['uuid', 'seed_variety_name', 'company_fk', 'crop_category', 'crop']
                    }
                ]
            });
        return successOkWithData(res, "Subscribed products fetched successfully.", subscribedSeeds);

    } catch (error) {
        console.log("========= error =======: ", error)
        return catchErrorWithSequelize(res, error);
    }
}

// ============================ unsubscribeProduct ============================

export async function unsubscribeProduct(req, res) {
    try {
        const reqFields = ["uuid"];
        const queryFieldsReq = queryReqFields(req, res, reqFields);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { uuid } = req.query;
        await FranchiseCatalogProduct.destroy({ where: { uuid } });
        return successOk(res, "Product unsubscribed successfully");

    } catch (error) {
        console.log("========= error =======: ", error)
        return catchErrorWithSequelize(res, error);
    }
}

// ============================ unsubscribeSeed ============================

export async function unsubscribeSeed(req, res) {
    try {
        const reqFields = ["uuid"];
        const queryFieldsReq = queryReqFields(req, res, reqFields);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { uuid } = req.query;
        await FranchiseCatalogSeed.destroy({ where: { uuid } });
        return successOk(res, "Seed unsubscribed successfully");

    } catch (error) {
        console.log("========= error =======: ", error)
        return catchErrorWithSequelize(res, error);
    }
}

// ============================ frachiseCatalogStats ============================
export async function frachiseCatalogStats(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["franchise_fk"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { franchise_fk } = req.query;
        const subscribedProducts = await FranchiseCatalogProduct.count({ where: { franchise_fk } });
        const subscribedSeeds = await FranchiseCatalogSeed.count({ where: { franchise_fk } });
        return successOkWithData(res, "Franchise catalog stats fetched successfully.", { subscribedProducts, subscribedSeeds });

    } catch (error) {
        console.log("========= error =======: ", error)
        return catchErrorWithSequelize(res, error);
    }
}