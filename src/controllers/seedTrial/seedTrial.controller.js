import Seed from "../../models/seed/seed.model.js";
import SeedTrial from "../../models/seedTrial/seedTrial.model.js";
import SeedTrialData from "../../models/seedTrial/seedTrialData.model.js";
import { bodyReqFields, queryReqFields } from "../../utils/requiredFields.js";
import { catchError, catchErrorWithSequelize, conflictError, frontError, notFound, successOk, successOkWithData, validationError } from "../../utils/responses.js";
import { convertToLowercase, getRelativePath } from "../../utils/utils.js";
import sequelize from "../../config/dbConfig.js";


// ================================================================
//                          CONTROLLERS
// ================================================================

export async function addSeedTrialAndDate(req, res) {
    try {
        const reqFields = ["seed_fk", "seed_variety", "sowing_date", "tehsil", "city", "min_irrigation", "max_irrigation", "estimated_yield", "seed_trial_form"];
        const bodyFieldsReq = bodyReqFields(req, res, reqFields);
        if (bodyFieldsReq.error) return bodyFieldsReq.response;

        const { seed_trial_form } = req.body;

        // VALIDATION FOR SEED_TRIAL_FORM
        const invalidForm = seedTrialFormValidation(res, seed_trial_form);
        if (invalidForm) return invalidForm;
        console.log("invalid forms")
        // ADDING SEED TRIAL
        const excludeFields = ["seed_fk"]
        const requiredData = convertToLowercase(req.body, excludeFields);
        const seedTrial = await SeedTrial.create(requiredData);
        const transaction = await sequelize.transaction();
        try {
            await SeedTrialData.bulkCreate(seed_trial_form.map(row => ({ ...row, seed_trial_fk: seedTrial.uuid })), transaction);
            // INCREMENTING TRIAL COUNT IN SEED
            await Seed.increment('trial_count', { by: 1, where: { uuid: requiredData.seed_fk }, transaction });
            transaction.commit();
        } catch (error) {
            transaction.rollback();
            throw error;
        }

        return successOk(res, "Seed trial added successfully");
    } catch (error) {
        console.log("error: -------------_: ", error)
        return catchErrorWithSequelize(res, error);

    }
}

// ========================== getAllTrials ================================

export async function getAllTrials(req, res) {
    try {
        const trials = await SeedTrial.findAll({
            include: [
                {
                    required: false,
                    model: Seed,
                    as: 'seed',
                    attributes: ['seed_variety_name'],
                }
            ],
            attributes: { exclude: ["createdAt", "updatedAt", "seed_variety"] }
        });
        return successOkWithData(res, "All seed trials", trials);
    } catch (error) {
        catchError(res, error);
    }
}

// ========================== getTrialData ================================

export async function getTrialData(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["uuid"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { uuid } = req.query

        const trialData = await SeedTrialData.findAll({
            where: { seed_trial_fk: uuid },
            order: [['bbch_scale', 'ASC']]
        });
        return successOkWithData(res, "Seed trial data", trialData);
    } catch (error) {
        return catchError(res, error);
    }
}

// ========================== updateTrialData ================================
export async function updateTrialData(req, res) {
    try {
        const reqField = ["uuid"];
        const queryFieldsReq = queryReqFields(req, res, reqField);
        if (queryFieldsReq.error) return queryFieldsReq.response;

        const bodyFieldsReq = bodyReqFields(req, res, ["seed_trial_form"]);
        if (bodyFieldsReq.error) return bodyFieldsReq.response;


        const { uuid } = req.query;
        const trialData = await SeedTrial.findByPk(uuid);
        if (!trialData) return notFound(res, "Seed trial not found");

        // VALIDATION FOR SEED_TRIAL_FORM
        const seed_trial_form = req.body.seed_trial_form;
        const invalidForm = seedTrialFormValidation(res, seed_trial_form);
        if (invalidForm) return invalidForm;

        const transaction = await sequelize.transaction();
        try {
            await SeedTrialData.destroy({ where: { seed_trial_fk: uuid }, transaction });
            await SeedTrialData.bulkCreate(seed_trial_form.map(row => ({ ...row, seed_trial_fk: uuid })), transaction);
            transaction.commit();
        } catch (error) {
            transaction.rollback();
            throw error;
        }
        return successOk(res, "Seed trial data updated successfully");
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}


// ==========================================================
//                     Helping functions
// ==========================================================

function seedTrialFormValidation(res, seed_trial_form) {
    if (!Array.isArray(seed_trial_form)) return frontError(res, "Seed trial form is type of array.", "seed_trial_form")
    if (!seed_trial_form.length) return frontError(res, "Seed trial form cannot be emtpy.", "seed_trial_form")
    for (let i = 0; i < seed_trial_form.length; i++) {
        let { stage, sub_stage, bbch_scale, start_day, end_day, kc } = seed_trial_form[i];
        start_day = parseInt(start_day); end_day = parseInt(end_day);
        if (!stage) return frontError(res, "Seed trial form contain empty stage.", `seed_trial_form`)
        if (!sub_stage) return frontError(res, "Seed trial form contain empty principle stage.", `seed_trial_form`)
        if (!bbch_scale) return frontError(res, "Seed trial form contain empty bbch scale.", `seed_trial_form`)
        if (!start_day || start_day == 0) return frontError(res, "Seed trial form contain empty start day.", `seed_trial_form`)
        if (!end_day || end_day == 0) return frontError(res, "Seed trial form contain empty end day.", `seed_trial_form`)
        if (!kc) return frontError(res, "Seed trial form contain empty kc.", `seed_trial_form`)

        if (start_day > end_day) return validationError(res, "Start day of stage cannot be greater than end day.")
        if (start_day == end_day) return validationError(res, "Start day of stage cannot be equal to end day.")
        if (i > 0 && parseInt(seed_trial_form[i - 1].end_day) > start_day) return validationError(res, "Start day of stage must be greater than end day of previous stage.")
    }
}