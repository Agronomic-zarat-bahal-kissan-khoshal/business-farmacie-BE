import jwt from "jsonwebtoken";
import { UnauthorizedError, catchError, forbiddenError, frontError } from "../utils/responses.js";
import { jwtSecret } from "../config/initialConfig.js";
import CompanyUser from "../models/user/companyUser.model.js";
import Franchise from "../models/franchise/franchise.model.js";
import { check31DaysExpiry } from "../utils/utils.js";

// Middleware to validate JWT tokens
export default async function verifyToken(req, res, next) {
  try {
    // Extract the token from the Authorization header
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) return UnauthorizedError(res, 'No token, authorization denied');
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.token !== 'access') return UnauthorizedError(res, "Invalid token");

    const companyUser = await CompanyUser.findByPk(decoded.userUid, { attributes: ['uuid', 'email', 'verified', 'company_fk'] });
    if (!companyUser) return UnauthorizedError(res, "Invalid token");
    if (!companyUser.verified) return forbiddenError(res, "Compnay profile is not verified yet");
    req.userUid = decoded.userUid;
    req.user = companyUser.dataValues;
    next();
  } catch (error) {
    return UnauthorizedError(res, "Invalid token");
  }
}


export async function isFranchiseActive(req, res, next) {
  try {
    let franchise_fk = null;
    if (req.query.franchise_fk) franchise_fk = req.query.franchise_fk
    if (req.body.franchise_fk) franchise_fk = req.body.franchise_fk

    if (franchise_fk) {
      const franchise = await Franchise.findByPk(franchise_fk, { attributes: ["active", "active_date"] });
      if (!franchise) return frontError(res, "Franchise not found, invalid franchise_fk", "franchise_fk");
      if (franchise.active) {
        const { expired } = check31DaysExpiry(franchise.active_date)
        if (!expired) return next();
      }
      return forbiddenError(res, "Active the franchise first, operation not allowed.")
    }
    return next()
  } catch (error) {
    catchError(res, error)
  }
}