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
import QueriesTicket from "./query/queriesTicket.model.js";
import TicketChat from "./query/TicketChat.model.js";
import FarmaciePaymentHistory from "./payment/paymentHistroy.model.js";


// ==========================================================
//                     Syncing Models
// ==========================================================
// Using force to drop and recreate
// await FarmaciePaymentHistory.sync({ force: true }); // Caution: Data will be lost
// await QueriesTicket.sync({ force: true }); // Caution: Data will be lost
// await TicketChat.sync({ force: true }); // Caution: Data will be lost
// await FranchiseCatalogProduct.sync({ force: true }); // Caution: Data will be lost

// Using alter to update the table structure without losing data
if (nodeEnv === "local") {
    // await Seed.sync({ alter: true }); // Recommended for development
    // await Product.sync({ alter: true }); // Recommended for development
    // await CompanyUser.sync({ alter: true }); // Recommended for development
}
