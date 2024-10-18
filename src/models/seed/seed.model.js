import sequelize from "../../config/dbConfig.js";
import { DataTypes } from "sequelize";

const Seed = sequelize.define('seed', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    seed_variety_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    company_fk: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    crop_category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    crop: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    seed_weight: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "seed_weight must be an integer."
            },
        }
    },
    package_weight: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "package_weight must be an integer."
            },
        }

    },
    package_type: {
        type: DataTypes.STRING,
    },
    germination_percentage: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "germination_percentage must be an integer."
            },
            min: {
                args: [0],
                msg: "germination_percentage must be at least 0."
            },
            max: {
                args: [100],
                msg: "germination_percentage must be at most 100."
            }
        }
    },
    maturity_percentage: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "maturity_percentage must be an integer."
            },
            min: {
                args: [0],
                msg: "germination_percentage must be at least 0."
            },
            max: {
                args: [100],
                msg: "germination_percentage must be at most 100."
            }
        }
    },
    min_harvesting_days: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "min_harvesting_days must be an integer."
            },
        }
    },
    max_harvesting_days: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "max_harvesting_days must be an integer."
            },
        }
    },
    suitable_region: {
        type: DataTypes.ENUM('irrigated', 'rainfed', 'drought'),
        validate: {
            isIn: {
                args: [['irrigated', 'rainfed', 'drought']],
                msg: "Valid suitalble_region options are 'irrigated', 'rainfed', 'drought' "
            }
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "price must be an integer."
            },
        }
    },
    in_simulator: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

})


export default Seed;

// ==========================================================
//                     Relations
// ==========================================================
import Company from "../user/company.model.js";
import SeedImage from "./seedImage.model.js";

// COMPANY
Seed.belongsTo(Company, { foreignKey: 'company_fk', targetKey: 'company', as: 'company', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Company.hasMany(Seed, { foreignKey: 'company_fk', sourceKey: 'company', as: 'seeds', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// SEEDIMAGES
Seed.hasMany(SeedImage, { foreignKey: 'seed_fk', sourceKey: 'uuid', as: 'seed_image', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
SeedImage.belongsTo(Seed, { foreignKey: 'seed_fk', targetKey: 'uuid', as: 'seed', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
