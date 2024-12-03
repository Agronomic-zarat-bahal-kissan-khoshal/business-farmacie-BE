import CropStage from "../../models/crop/cropStage.model.js";
import { catchError, successOkWithData } from "../../utils/responses.js";
import { queryReqFields } from "../../utils/requiredFields.js";

// ============================================
//             CONTOLLERS
// ============================================

export async function getCropStages(req, res) {
    try {

        const reqField = ["crop_name"];
        const queryField = queryReqFields(req, res, reqField)
        if (queryField.error) return queryField.error;

        const crop_name = req.query.crop_name.toLowerCase();
        const cropStages = await CropStage.findAll({
            where: { crop_fk: crop_name },
            attributes: ["uuid", "stage", "sub_stage", "bbch_scale"],
            order: [["bbch_scale", "ASC"]]
        })
        return successOkWithData(res, cropStages)
    } catch (error) {
        return catchError(res, error)
    }
}