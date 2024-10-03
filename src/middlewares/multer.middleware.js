import { frontError } from "../utils/responses.js";

export default function setProductImgPath(req, res, next) {
    req.storagePath = `./static/images/products/`;
    next();
}