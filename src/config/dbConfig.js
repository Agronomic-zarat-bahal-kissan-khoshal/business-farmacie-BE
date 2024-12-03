// Import required modules and configuration
import chalk from "chalk";
import { Sequelize } from "sequelize";
import { dbUrl, dbUrlMW } from "./initialConfig.js";


const sequelize = new Sequelize(dbUrl);
export const sequelizeMW = new Sequelize(dbUrlMW)
// Async function to connect to the MongoDB database
export const connectDB = async () => {
  try {
    // Connect to the database with the provided URL and name
    await sequelize.authenticate();
    await sequelizeMW.authenticate();
    // Log success message in green
    console.log(`${chalk.green.bold("Connected to the database")}`);
    console.log(`${chalk.green.bold("============================================================")}`);
    await sequelize.sync();
    await sequelizeMW.sync();
    console.log(`${chalk.green.bold("Models synced successfully")}`);
    console.log(`${chalk.green.bold("============================================================")}`);
  } catch (error) {
    // Log error message in red and exit the application
    console.log(`${chalk.red.bold("Error")} connecting to database `, error);
    console.log(`${chalk.green.bold("============================================================")}`);
    process.exit(1);
  }
};
// Export the connectDB function
export default sequelize;
