import Seed from "../../models/seed/seed.model.js";
import SeedImage from "../../models/seed/seedImage.model.js";
import { bodyReqFields, queryReqFields } from "../../utils/requiredFields.js";
import { catchError, catchErrorWithSequelize, conflictError, frontError, notFound, successOk, successOkWithData, validationError } from "../../utils/responses.js";
import { convertToLowercase, getRelativePath } from "../../utils/utils.js";


// ================================================================
//                          CONTROLLERS
// ================================================================

export async function addSeed(req, res) {
    try {
        const reqFields = ["seed_variety_name", "crop_category", "crop", "seed_weight", "package_weight", "package_type", "germination_percentage", "maturity_percentage", "min_harvesting_days", "max_harvesting_days", "suitable_region", "price"];
        const bodyFieldsReq = bodyReqFields(req, res, reqFields);
        if (bodyFieldsReq.error) return bodyFieldsReq.response;

        if (!req.files?.images?.length) return frontError(res, "Atleast one image is required.", "images")
        let requiredData = convertToLowercase(req.body);
        requiredData.company_fk = req.user.company_fk;

        const { min_harvesting_days, max_harvesting_days } = requiredData;
        if (parseInt(min_harvesting_days) > parseInt(max_harvesting_days)) return validationError(res, "Min harvesting days must be less than equal to max harvesting days");

        // DUPLICATION TEST
        const { seed_variety_name, company_fk, crop_category, crop, package_weight, package_type } = requiredData;
        const seedExist = await Seed.findOne({ where: { seed_variety_name, company_fk, crop_category, crop, package_weight, package_type } })
        if (seedExist) return conflictError(res, "Seeds already added in global list")

        // ADDING SEED
        const seed = await Seed.create(requiredData);

        // ADDING SEED IMAGES
        const seedImages = req.files.images.map(image => ({ image_url: getRelativePath(image.path), seed_fk: seed.uuid }))
        await SeedImage.bulkCreate(seedImages);
        return successOk(res, "Seed added successfully");
    } catch (error) {
        console.log("error: -------------_: ", error)
        return catchErrorWithSequelize(res, error);
    }
}


// ========================== getSingleSeed ================================


export async function getSingleSeed(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["uuid"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { uuid } = req.query

        const seed = await Seed.findByPk(uuid, {
            include: [
                {
                    required: false,
                    model: SeedImage,
                    as: 'seed_image',
                    attributes: ['image_url', 'uuid']
                }
            ],
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            where: { uuid }
        });
        if (!seed) return notFound(res, "Seed not found", "uuid");
        return successOkWithData(res, "Seed fetched successfully", seed);
    } catch (error) {
        return catchError(res, error);
    }
}



// ========================== getSeeds ================================


export async function getSeeds(req, res) {
    try {
        const products = await Seed.findAll({
            attributes: ['uuid', 'seed_variety_name', 'company_fk', 'crop_category', 'crop'],
            where: {
                company_fk: req.user.company_fk
            }
        });
        return successOkWithData(res, "Seeds fetched successfully", products);
    } catch (error) {
        return catchError(res, error);
    }
}


// ========================== deleteSeed ================================


export async function deleteSeed(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["uuid"])
        if (queryFieldsReq.error) return queryFieldsReq.response

        const { uuid } = req.query;
        await Seed.destroy({ where: { uuid } })
        return successOk(res, "Seed delete successfully")

    } catch (error) {
        return catchError(res, error)
    }
}

// ========================== deleteSeedImg ================================


export async function deleteSeedImg(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["imgUid"])
        if (queryFieldsReq.error) return queryFieldsReq.response

        const { imgUid } = req.query;
        await SeedImage.destroy({ where: { uuid: imgUid } })
        return successOk(res, "Seed images delete successfully")

    } catch (error) {
        return catchError(res, error)
    }
}


// ========================== updateSeed ================================


export async function updateSeed(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["uuid"])
        if (queryFieldsReq.error) return queryFieldsReq.response

        const { uuid } = req.query;
        const seed = await Seed.findOne({ where: { uuid }, attributes: ["min_harvesting_days", "max_harvesting_days"] });
        if (!seed) return notFound(res, "Seed not found");

        if (req.files?.images?.length) {
            const seedImages = req.files.images.map(image => ({ image_url: getRelativePath(image.path), seed_fk: uuid }))
            await SeedImage.bulkCreate(seedImages);
        }

        let requiredData = convertToLowercase(req.body);
        requiredData.company_fk = req.user.company_fk;       // This insures no one can change the company.
        // Harvesting days validations
        let { min_harvesting_days, max_harvesting_days } = requiredData;
        min_harvesting_days = parseInt(min_harvesting_days);
        max_harvesting_days = parseInt(max_harvesting_days);
        if (min_harvesting_days && max_harvesting_days && min_harvesting_days > max_harvesting_days) return validationError(res, "Min harvesting days must be less than max harvesting days");
        if (min_harvesting_days && seed.max_harvesting_days < min_harvesting_days) return validationError(res, "Min harvesting days must be less than max harvesting days");
        if (max_harvesting_days && seed.min_harvesting_days > max_harvesting_days) return validationError(res, "Max harvesting days must be greater than min harvesting days");


        // ADDING SEED
        await Seed.update(requiredData, { where: { uuid } });

        return successOk(res, "Seed updated successfully");
    } catch (error) {
        console.log("error: -------------_: ", error)
        return catchErrorWithSequelize(res, error);
    }
}

// ========================== seedStats ================================
export async function seedStats(req, res) {
    try {
        const { company_fk } = req.user;
        const seedCountglobalList = await Seed.count({ where: { company_fk } });
        return successOkWithData(res, "Seeds fetched successfully", { seedCountglobalList });
    } catch (error) {
        return catchError(res, error);
    }
}