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
    manager_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    franchise_contact: {
        type: DataTypes.STRING,
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
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
    }
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