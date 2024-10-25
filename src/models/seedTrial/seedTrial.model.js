import sequelize from "../../config/dbConfig.js";
import { DataTypes } from "sequelize";

const SeedTrial = sequelize.define('seed_trial', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    sowing_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    tehsil: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    min_irrigation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Min irrigation in milimiter must cotain an integer value."
            }
        }
    },
    max_irrigation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Max irrigation in milimiter must cotain an integer value."
            }
        }
    },
    estimated_yield: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Estimated yield must cotain an integer value."
            }
        }
    },
    seed_fk: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    seed_variety: {             // This fields will only be populated once during adding a new seed trial, it will not involve any CRUD operation. This is only helpful in seed is deleted in future.
        type: DataTypes.STRING,
        allowNull: true,
    },
});

export default SeedTrial;

// ============================================================
//                      RELATIONS
// ============================================================
import Seed from "../seed/seed.model.js";

SeedTrial.belongsTo(Seed, { foreignKey: 'seed_fk', targetKey: 'uuid', as: 'seed', onDelete: 'SET NULL' });
Seed.hasMany(SeedTrial, { foreignKey: 'seed_fk', sourceKey: 'uuid', as: 'seed_trial', onDelete: 'SET NULL' });