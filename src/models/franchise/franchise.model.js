import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';

const Franchise = sequelize.define('franchise', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true,
    },
    franchise_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    franchise_contact: {
        type: DataTypes.BIGINT,
        unique: true,
        validate: {
            isInt: {
                msg: "Phone number contains numbers only."
            },
            min: {
                args: [3000000000],
                msg: "Invalid phone number, starts with 0"
            },
            max: {
                args: [3799999999],
                msg: "Invalid phone number, start with 0"
            }
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    province: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    district: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tehsil: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_company_franchise: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    company_fk: {
        type: DataTypes.STRING,
        allowNull: true,            // If company franchise is false then it's null
    },
    user_fk: {
        type: DataTypes.UUID,
        allowNull: true,            // In case the user deleted by the franchise
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    active_date: {
        type: DataTypes.DATE,
    },
    txn_ref_no: {
        type: DataTypes.STRING,
    },
    response_code: {
        type: DataTypes.STRING,
    },
});

export default Franchise;

// ==========================================================
//                     Relations
// ==========================================================
import FranchiseManager from './fanchiseManager.model.js';
import Company from '../user/company.model.js';

// WITH FRANCHISE MANAGER
FranchiseManager.hasMany(Franchise, { foreignKey: 'user_fk', sourceKey: 'uuid', as: 'franchise', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Franchise.belongsTo(FranchiseManager, { foreignKey: 'user_fk', targetKey: 'uuid', as: 'franchise_manager', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// WITH COMPANY
Company.hasMany(Franchise, { foreignKey: 'company_fk', sourceKey: 'company', as: 'franchise', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Franchise.belongsTo(Company, { foreignKey: 'company_fk', targetKey: 'company', as: 'company', onDelete: 'CASCADE', onUpdate: 'CASCADE' });