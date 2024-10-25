import sequelize from "../../config/dbConfig.js";
import { DataTypes } from "sequelize";

const SeedTrialData = sequelize.define('seed_trial_data', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    stage: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sub_stage: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bbch_scale: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "BBCH scale must be an integer."
            },
            min: {
                args: [0],
                msg: "BBCH scale must be at least 0."
            },
            max: {
                args: [20],
                msg: "BBCH scale must be at most 20."
            }
        }
    },
    start_day: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "start_day must be an integer."
            },
            min: {
                args: [0],
                msg: "start_day must be at least 0."
            }
        }
    },
    end_day: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "end_day must be an integer."
            },
            min: {
                args: [0],
                msg: "end_day must be at least 0."
            }
        }
    },
    kc: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            isFloat: {
                msg: "kc must be a float or an integer."
            },
            min: {
                args: [0],
                msg: "kc must be at least 0."
            }
        }
    },
    seed_trial_fk: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, { timestamps: false });

export default SeedTrialData;

// ============================================================
//                   RELATIONSHIPS
// ============================================================
import SeedTrial from "./seedTrial.model.js";

SeedTrialData.belongsTo(SeedTrial, { foreignKey: 'seed_trial_fk', targetKey: 'uuid', onDelete: 'CASCADE', as: 'seed_trial_data' });
SeedTrial.hasMany(SeedTrialData, { foreignKey: 'seed_trial_fk', sourceKey: 'uuid', onDelete: 'CASCADE', as: 'seed_trial_data' });