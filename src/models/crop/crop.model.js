import sequelize, { sequelizeMW } from "../../config/dbConfig.js";
import { DataTypes } from "sequelize";


const Crop = sequelizeMW.define(
    "crop",
    {
        crop_name: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            unique: {
                msg: 'Crop with the follwoing name is already exist.'
            },
        },
        crop_category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        source: {
            type: DataTypes.STRING,
        },
        root_depth_max_m: {
            type: DataTypes.FLOAT,
            validate: {
                isFloat: {
                    msg: 'Root depth max milimeter must be a valid float or integer value',
                },
            },
        },
        seed_sowing_depth_m: {
            type: DataTypes.FLOAT,
            validate: {
                isFloat: {
                    msg: 'Seed sowing depth milimeter must be a valid float or integer value',
                },
            },
        },
        stage_count: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: {
                    msg: 'Stage count must be a valid integer value',
                },
            },
            defaultValue: 0,
        }
    },
    {
        schema: "crop",       // Change this to "crop" later --- when deploy
        timestamps: false,
    }
);

export default Crop;