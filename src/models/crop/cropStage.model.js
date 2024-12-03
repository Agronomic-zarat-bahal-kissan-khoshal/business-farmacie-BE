import sequelize from "../../config/dbConfig.js";
import { DataTypes } from "sequelize";

const CropStage = sequelize.define("crop_stage", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
                msg: 'BBCH scale must be a valid integer value',
            },
            min: {
                args: [0],
                msg: 'BBCH scale must be a positive integer value',
            },
            max: {
                args: [20],
                msg: 'BBCH scale cannot have a value greater than 20',
            },
        },
    },
    crop_fk: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['sub_stage', 'crop_fk'],
        },
    ],
});


export default CropStage;

// ============================================
//                Relations
// ============================================

import Crop from "./crop.model.js";

CropStage.belongsTo(Crop, { foreignKey: "crop_fk", targetKey: "crop_name", onDelete: "CASCADE", onUpdate: "CASCADE", as: "crop" });
Crop.hasMany(CropStage, { foreignKey: "crop_fk", sourceKey: "crop_name", onDelete: "CASCADE", onUpdate: "CASCADE", as: "crop_stages" });