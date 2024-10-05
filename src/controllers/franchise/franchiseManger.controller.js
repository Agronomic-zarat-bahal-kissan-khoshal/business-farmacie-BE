import FranchiseManager from "../../models/franchise/fanchiseManager.model.js";
import { bodyReqFields, queryReqFields } from "../../utils/requiredFields.js";
import { catchError, catchErrorWithSequelize, conflictError, frontError, notFound, successOk, successOkWithData, validationError } from "../../utils/responses.js";
import { convertToLowercase, getRelativePath } from "../../utils/utils.js";


// ================================================================
//                          CONTROLLERS
// ================================================================

export async function addFranchiseManger(req, res) {
    try {
        const reqFields = ["full_name", "contact"];
        const bodyFieldsReq = bodyReqFields(req, res, reqFields);
        if (bodyFieldsReq.error) return bodyFieldsReq.response;

        let requiredData = convertToLowercase(req.body);
        const { full_name, contact } = requiredData;

        // DUPLICATION TEST
        try {
            const franchiseManagerExist = await FranchiseManager.findOne({ where: { contact } })
            if (franchiseManagerExist) return conflictError(res, "Franchise Manager already exist on this phone number.")
        } catch (error) { }

        await FranchiseManager.create({ full_name, contact, company_fk: req.user.company_fk });
        return successOk(res, "Franchise Manager added successfully");
    } catch (error) {
        console.log("error: -------------_: ", error)
        return catchErrorWithSequelize(res, error);

    }
}


// ========================== getFranchiseManagers ================================


export async function getFranchiseManagers(req, res) {
    try {
        const franchiseManagers = await FranchiseManager.findAll({ where: { company_fk: req.user.company_fk }, attributes: ['uuid', 'full_name', 'contact'] })
        return successOkWithData(res, "Franchise managers fetched successfully.", franchiseManagers);
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}

// ========================== deleteFranchiseManager ================================


export async function deleteFranchiseManager(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["uuid"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { uuid } = req.query

        const franchiseManager = await FranchiseManager.findOne({ where: { uuid, company_fk: req.user.company_fk } })
        if (!franchiseManager) return notFound(res, "Franchise Manager not found");

        await franchiseManager.destroy();
        return successOk(res, "Franchise Manager deleted successfully");
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}

// ========================== updateFranchiseManager ================================


export async function updateFranchiseManager(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["uuid"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { uuid } = req.query

        const franchiseManager = await FranchiseManager.findOne({ where: { uuid, company_fk: req.user.company_fk } })
        if (!franchiseManager) return notFound(res, "Franchise Manager not found");

        const requiredData = convertToLowercase(req.body);

        let fieldsToUPdate = {};
        if (requiredData.full_name) fieldsToUPdate.full_name = requiredData.full_name;
        if (requiredData.contact) fieldsToUPdate.contact = requiredData.contact;
        await franchiseManager.update(fieldsToUPdate);

        return successOk(res, "Franchise Manager updated successfully");
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}