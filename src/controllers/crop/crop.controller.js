import Crop from "../../models/crop/crop.model.js";
import { catchError, successOkWithData } from "../../utils/responses.js";

// ============================================
//             CONTOLLERS
// ============================================

export async function getCropsList(req, res) {
    try {
        const cropsList = await Crop.findAll({
            attributes: ["crop_name"],
            order: [["crop_name", "ASC"]],
        })
        return successOkWithData(res, "Data fetched successfully.", cropsList)
    } catch (error) {
        return catchError(res, error)
    }
}
