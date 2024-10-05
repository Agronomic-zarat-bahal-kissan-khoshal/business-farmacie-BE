import Company from "./user/company.model.js";
import CompanyUser from "./user/companyUser.model.js";
import ActiveIngredient from "./product/activeIngredient.model.js";
import Ingredient from "./product/ingredient.model.js";
import Product from "./product/product.model.js";
import ProductImage from "./product/productImage.model.js";
import Seed from "./seed/seed.model.js";
import { nodeEnv } from "../config/initialConfig.js";
import seedImage from "./seed/seedImage.model.js";

import Franchise from "./franchise/franchise.model.js";
import FranchiseManager from "./franchise/fanchiseManager.model.js";
import { FranchiseCatalogProduct, FranchiseCatalogSeed } from "./franchise/franchiseCatalog.model.js";



// ==========================================================
//                     Syncing Models
// ==========================================================
// Using force to drop and recreate
// await FranchiseManager.sync({ force: true }); // Caution: Data will be lost
// await Franchise.sync({ force: true }); // Caution: Data will be lost
// await FranchiseCatalogSeed.sync({ force: true }); // Caution: Data will be lost
// await FranchiseCatalogProduct.sync({ force: true }); // Caution: Data will be lost

// Using alter to update the table structure without losing data
if (nodeEnv === "local") {
    // await Seed.sync({ alter: true }); // Recommended for development
    // await Product.sync({ alter: true }); // Recommended for development
    // await CompanyUser.sync({ alter: true }); // Recommended for development
}
