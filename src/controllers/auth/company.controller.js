// ========================================
//           LIBRARIES IMPORTS
// ========================================
import crypto from "crypto"
import bcrypt from "bcryptjs";
import { ARRAY, Op, Sequelize } from "sequelize";


// ========================================
//         CODE IMPORTS
// ========================================
import Company from "../../models/user/company.model.js";
import CompanyUser from "../../models/user/companyUser.model.js";
import { catchError, conflictError, created, frontError, successOk, successOkWithData, validationError } from "../../utils/responses.js";
import { bodyReqFields, queryReqFields } from "../../utils/requiredFields.js";
import { convertToLowercase } from "../../utils/utils.js";



// ========================================
//             CONTOLLERS
// ========================================
export async function addCompniestoGlobalList(req, res) {
    try {
        const { companies } = req.body;
        if (!companies) return frontError(res, "Missing body required fields", { companies: "This field is required." })
        if (!Array.isArray(companies)) return frontError(res, "Field companies is of type array.", "companies")
        if (companies.length === 0) return frontError(res, "Field companies  cannot be empty", "companies")

        // COVERT COMPANIES TO LOWER CASE
        const companiesLowerCase = companies.map(company => company.toLowerCase());

        // FINDING ALL COMPANIES THAT ARE ALREADY ADDED
        const companiesExist = await Company.findAll({
            where: { company: { [Op.in]: companiesLowerCase } },
            attributes: ["company"]
        });

        // MAKING AN ARRAY OF COMPANIES THAT ARE ALREADY ADDED
        const companiesExistArr = companiesExist.map(company => company.company)

        let companiesToAdd = companiesLowerCase.filter(company => !companiesExistArr.includes(company));
        companiesToAdd = companiesToAdd.map(company => ({ company }));
        await Company.bulkCreate(companiesToAdd);
        return created(res, "Company added successfully");
    } catch (error) {
        console.log("error while creating the compnay", error);
        return catchError(res, error.message);
    }
}

// ================= getCompanies =======================

export async function getGlobalListCompanies(req, res) {
    try {
        const companies = await Company.findAll();
        const count = companies.length;
        return successOkWithData(res, "Companies fetched successfully", { companies, count });
    } catch (error) {
        console.log("error while getting the companies", error);
        return catchError(res, error.message);
    }
}

// ================= deleteCompany =======================
export async function deleteGlobalListCompanies(req, res) {
    try {
        const reqBodyFields = bodyReqFields(req, res, ["company"]);
        if (reqBodyFields.error) return reqBodyFields.response;
        const requiredData = convertToLowercase(req.body);
        const { company } = requiredData;


        await Company.destroy({ where: { company } });
        return created(res, "Company deleted successfully");
    } catch (error) {
        console.log("error while deleting the company", error);
        return catchError(res, error.message);
    }
}

// ================= updateCompany =======================
export async function updateGlobalListCompanies(req, res) {
    try {
        const reqBodyFields = bodyReqFields(req, res, ["company", "updatedCompany"]);
        if (reqBodyFields.error) return reqBodyFields.response;
        const requiredData = convertToLowercase(req.body);
        const { company, updatedCompany } = requiredData;

        const companyExists = await Company.findByPk(company);
        if (!companyExists) return validationError(res, "Company not found in company global list");
        companyExists.company = updatedCompany;
        await companyExists.save();
        await Company.update({ company: updatedCompany }, { where: { company } });
        return successOk(res, "Company updated successfully");
    } catch (error) {
        console.log("error while updating the company", error);
        return catchError(res, error.message);
    }
}

// ================= verifyCompany =======================
export async function verifyCompanyUser(req, res) {
    try {
        const reqBodyFields = bodyReqFields(req, res, ["company", "uuid"]);
        if (reqBodyFields.error) return reqBodyFields.response;
        const excludedFields = ["uuid"];
        const requiredData = convertToLowercase(req.body, excludedFields);
        const { company, uuid } = requiredData;

        // DOES COMPANY EXIST WITH THE GIVEN NAME IN GLOBAL LIST
        const companyExists = await Company.findByPk(company);
        if (!companyExists) return validationError(res, "Company not found in company global list, First add it to the global list.");

        // DOES ANY COMPANY ALREADY REGISTERED AGAINST THE GIVEN COMPANY
        const companyUsersExist = await CompanyUser.findOne({ where: { company_fk: company } });
        if (companyUsersExist) {
            if (companyUsersExist.uuid === uuid) return conflictError(res, "Company already verified");
            else return validationError(res, "Another compmany is registered under this company name.");
        }
        // DOES COMPANY USER EXIST WITH THE GIVEN UUID
        const companyUser = await CompanyUser.findByPk(uuid);
        if (!companyUser) return frontError(res, "Invalid company uuid.")

        // REGISTER AND MAKE COMPANY VERIFIED
        companyUser.company_fk = company;
        companyUser.verified = true;
        await companyUser.save();
        return successOk(res, "Company verified successfully");
    } catch (error) {
        console.log("error while verifying the company", error);
        return catchError(res, error.message);
    }
}

// ================= getAllCompanyUsers =======================
export async function getAllCompanyUsers(req, res) {
    try {
        const companyUsers = await CompanyUser.findAll();
        return successOkWithData(res, "Company users fetched successfully", { companyUsers, count });
    } catch (error) {
        console.log("error while getting the company users", error);
        return catchError(res, error.message);
    }
}

// ================= deleteCompanyUser =======================
export async function deleteCompanyUser(req, res) {
    try {
        const reqQueryFields = queryReqFields(req, res, ["uuid"]);
        if (reqQueryFields.error) return reqQueryFields.response;
        const { uuid } = req.body;

        await CompanyUser.destroy({ where: { uuid } });
        return created(res, "Company user deleted successfully");
    } catch (error) {
        console.log("error while deleting the company user", error);
        return catchError(res, error.message);
    }
}

// ================= companyStats =======================
export async function getCompaniesStats(req, res) {
    try {
        const globalListCompanies = await Company.count();
        const registeredCompanies = await CompanyUser.count();
        const verifiedCompanies = await CompanyUser.count({ where: { verified: true } });
        return successOkWithData(res, "Company stats fetched successfully", { globalListCompanies, registeredCompanies, verifiedCompanies });
    } catch (error) {
        console.log("error while getting the company stats", error);
        return catchError(res, error.message);
    }
}