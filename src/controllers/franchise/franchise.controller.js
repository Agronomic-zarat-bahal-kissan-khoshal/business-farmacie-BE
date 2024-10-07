import Franchise from "../../models/franchise/franchise.model.js";
import FranchiseManager from "../../models/franchise/fanchiseManager.model.js";
import { catchError, catchErrorWithSequelize, conflictError, frontError, notFound, successOk, successOkWithData, validationError } from "../../utils/responses.js";
import { bodyReqFields, queryReqFields } from "../../utils/requiredFields.js";
import { check31DaysExpiry, convertToLowercase } from "../../utils/utils.js";
import { Op } from "sequelize";


// ================================================================
//                          CONTROLLERS
// ================================================================


export async function addFranchise(req, res) {
    try {
        const reqFields = ["franchise_name", "address", "province", "district", "tehsil", "user_fk"];
        const bodyFieldsReq = bodyReqFields(req, res, reqFields);
        if (bodyFieldsReq.error) return bodyFieldsReq.response;

        const requiredData = convertToLowercase(req.body);
        const { franchise_name, address, province, district, tehsil, user_fk, franchise_contact } = requiredData;


        // DUPLICATION TEST
        try {
            const franchiseExist = await Franchise.findOne({ where: { address, province, district, tehsil, user_fk } })
            if (franchiseExist) return conflictError(res, "Same franchise already exist with the given address, info, against this user.")
        } catch (error) {

        }

        // ADDING FRANCHISE
        await Franchise.create({ franchise_name, franchise_contact, address, province, district, tehsil, user_fk, company_fk: req.user.company_fk, is_company_franchise: true });
        return successOk(res, "Franchise added successfully");
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}


// ========================== getSingleFranchise ================================


export async function getSingleFranchise(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["uuid"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { uuid } = req.query

        let franchise = await Franchise.findByPk(uuid, {
            include: [
                {
                    required: false,
                    model: FranchiseManager,
                    as: 'franchise_manager',
                    attributes: ['uuid', 'full_name', 'contact']
                }
            ],
            attributes: ["uuid", "franchise_name", "address", "province", "district", "tehsil", "active", "active_date"]
        });
        if (!franchise) return notFound(res, "Franchise not found");

        // console.log("franchise: ", franchise)
        // VERIFY THE ACTIVE STATUS
        if (franchise.active) {
            const { expired, remainingDays } = check31DaysExpiry(franchise.active_date);
            if (expired) {
                franchise.active = false;
                await franchise.save();
            }
            franchise.dataValues.remainingDays = remainingDays;
        } else franchise.dataValues.remainingDays = 0;
        return successOkWithData(res, "Franchise found", franchise);
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}


// ========================== getFranchises ================================

export async function getFranchises(req, res) {
    try {
        let franchises = await Franchise.findAll({
            attributes: ['uuid', 'address', 'province', 'district', 'tehsil', 'active', 'active_date'],
            include: [
                {
                    required: false,
                    model: FranchiseManager,
                    as: 'franchise_manager',
                    attributes: ['uuid', 'full_name', 'contact']
                }
            ],
            where: {
                company_fk: req.user.company_fk
            }
        });

        // VERIFY THE ACTIVE STATUS
        franchises = JSON.parse(JSON.stringify(franchises));
        franchises.forEach(franchise => {
            if (franchise.active) {
                const { expired, remainingDays } = check31DaysExpiry(franchise.active_date);
                if (expired) franchise.active = false;
                franchise.remainingDays = remainingDays;
            } else franchise.remainingDays = 0;
        });
        return successOkWithData(res, "Franchises fetched successfully", franchises);
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}


// ========================== getInactiveFranchises ================================

export async function getInactiveFranchises(req, res) {
    try {
        const today = new Date();
        let previous31thDay = new Date(today);
        previous31thDay.setDate(today.getDate() - 31);

        let franchises = await Franchise.findAll({
            attributes: ['uuid', 'address', 'province', 'district', 'tehsil', 'active', 'active_date'],
            include: [
                {
                    required: false,
                    model: FranchiseManager,
                    as: 'franchise_manager',
                    attributes: ['uuid', 'full_name']
                }
            ],
            where: {
                company_fk: req.user.company_fk,
                [Op.or]: [{ active: false }, { active_date: { [Op.lt]: previous31thDay } }]
            }
        });

        return successOkWithData(res, "Franchises fetched successfully", franchises);
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}

// ========================== updateFranchises ================================

export async function updateFranchise(req, res) {
    try {
        const reqFields = ["uuid"];
        const queryFieldsReq = queryReqFields(req, res, reqFields);
        if (queryFieldsReq.error) return queryFieldsReq.response;

        const { uuid } = req.query;
        const requiredData = convertToLowercase(req.body);
        const { franchise_name, address, province, district, tehsil, user_fk, franchise_contact } = requiredData;

        let franchise = await Franchise.findByPk(uuid);
        if (!franchise) return notFound(res, "Franchise not found");

        if (user_fk) {
            const userExist = await FranchiseManager.findByPk(user_fk);
            if (!userExist) return validationError(res, "Franchise Manager not found", "user_fk");
            franchise.user_fk = user_fk;
        }
        if (franchise_name) franchise.franchise_name = franchise_name;
        if (address) franchise.address = address;
        if (province) franchise.province = province;
        if (district) franchise.district = district;
        if (tehsil) franchise.tehsil = tehsil;
        if (franchise_contact) franchise.franchise_contact = franchise_contact;
        await franchise.save();
        return successOk(res, "Franchise updated successfully");
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}

// ========================== deleteFranchise ================================

export async function deleteFranchise(req, res) {
    try {
        const reqFields = ["uuid"];
        const queryFieldsReq = queryReqFields(req, res, reqFields);
        if (queryFieldsReq.error) return queryFieldsReq.response;

        const { uuid } = req.query;
        await Franchise.destroy({ where: { uuid } });
        return successOk(res, "Franchise deleted successfully");
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}

// ========================== franchiseStats ================================

export async function franchiseStats(req, res) {
    try {
        let franchises = await Franchise.findAll({
            attributes: ['active', 'active_date'],
            where: {
                company_fk: req.user.company_fk
            }
        });
        franchises = JSON.parse(JSON.stringify(franchises));

        let activeFranchises = 0;
        let inactiveFranchises = 0;
        franchises.forEach(franchise => {
            if (franchise.active) {
                const { expired } = check31DaysExpiry(franchise.active_date);
                if (!expired) activeFranchises++;
                else inactiveFranchises++;
            } else inactiveFranchises++
        });
        const totalFranchises = franchises.length;

        return successOkWithData(res, "Franchises stats fetched successfully", { activeFranchises, inactiveFranchises, totalFranchises });
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}

