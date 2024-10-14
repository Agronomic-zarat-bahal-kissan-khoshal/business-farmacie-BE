// =========================================
//             Lbraries Import
// =========================================
import chalk from "chalk";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import os from "os"
import { fileURLToPath } from 'url';
import path from 'path';

// =========================================
//             Code Import
// =========================================
import { nodeEnv, port } from "./config/initialConfig.js";
import { connectDB } from "./config/dbConfig.js";
import { getIPAddress } from "./utils/utils.js";
import "./models/models.js";
import authRoutes from "./routes/auth/auth.route.js";
import productRoutes from "./routes/product/product.route.js";
import seedRoutes from "./routes/seed/seed.route.js"
import franchiseRoutes from "./routes/franchise/franchise.route.js"
import franchiseManagerRoutes from "./routes/franchise/franchiseManager.route.js"
import franchiseCatalogRoutes from "./routes/franchise/franchiseCatalog.route.js"
import queryRoutes from "./routes/query/query.routes.js"
import jazzcashRoutes from "./routes/payment/jazzcash.route.js"
// Internal dashboard
import companyRoutes from "./routes/auth/company.route.js";
import ingredientRoutes from "./routes/product/ingredient.route.js"


// =========================================
//            Configurations
// =========================================
// Initializing the app
const app = express();
app.use(cookieParser());

// Essential security headers with Helmet
app.use(helmet());

// Enable CORS with default settings
const crosOptions = {
  origin: nodeEnv === 'production' ? domain : '*',                                // allow requests from all ips in development, and use array for multiple domains
  // allowedHeaders: ['Content-Type', 'Authorization', 'x-token', 'y-token'],    // allow these custom headers only
};
app.use(cors(crosOptions));

// Logger middleware for development environment
if (nodeEnv !== "production") {
  app.use(morgan("dev"));
}

// Compress all routes
app.use(compression());

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Built-in middleware for parsing JSON
app.use(express.json());

// static directories
// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/static', express.static(path.join(__dirname, '..', 'static')));

// =========================================
//            Routes
// =========================================
// Route for root path
app.get('/', (req, res) => {
  res.send("Welcome to Farmacie Company API");
});

// other routes
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/franchise", franchiseRoutes)
app.use("/api/franchise/manager", franchiseManagerRoutes)
app.use("/api/franchise/subscribe", franchiseCatalogRoutes)
app.use("/api/query", queryRoutes)
app.use("/api/payment/jazzcash", jazzcashRoutes)

// Internal dashboard
app.use("/api/company", companyRoutes);
app.use("/api/ingredient", ingredientRoutes)




// =========================================
//            Global Error Handler
// =========================================
// Global error handler
app.use((err, req, res, next) => {
  console.error(chalk.red(err.stack));
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: {},
  });
});



// Database connection
connectDB();


// Server running
app.listen(port, () => {
  console.log(chalk.bgYellow.bold(` Server is listening at http://${getIPAddress()}:${port} `));
});