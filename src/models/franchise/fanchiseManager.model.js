import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';
// ==========================================================
// This table belong to the USER table of the farmacie here named as FranchiseManager
// ==========================================================
const FranchiseManager = sequelize.define('user', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    full_name: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
    },
    contact: {
        type: DataTypes.BIGINT,
        unique: true,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Phone number contains numbers only."
            },
            min: {
                args: [3000000000],
                msg: "Invalid phone number"
            },
            max: {
                args: [3599999999],
                msg: "Invalid phone number"
            }
        }
    },
    otp: {
        type: DataTypes.INTEGER,
    },
    otp_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    company_fk: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profile_pic: {
        type: DataTypes.STRING,
        allowNull: true,
    }
},
)

export default FranchiseManager;

// ==========================================================
//                     Relations
// ==========================================================
import Company from '../user/company.model.js';

Company.hasMany(FranchiseManager, { foreignKey: 'company_fk', sourceKey: 'company', as: 'franchise_manager', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
FranchiseManager.belongsTo(Company, { foreignKey: 'company_fk', targetKey: 'company', as: 'company', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
