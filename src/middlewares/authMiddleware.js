import jwt from "jsonwebtoken";
import { UnauthorizedError, forbiddenError } from "../utils/responses.js";
import { jwtSecret } from "../config/initialConfig.js";
import CompanyUser from "../models/user/companyUser.model.js";

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