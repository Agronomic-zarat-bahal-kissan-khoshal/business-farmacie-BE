import { frontError } from "../utils/responses.js";

export function setProductImgPath(req, res, next) {
    req.storagePath = `../static/images/products/`;
    next();
}

export function setSeedImgPath(req, res, next) {
    req.storagePath = `../static/images/seeds/`;
    next();
}