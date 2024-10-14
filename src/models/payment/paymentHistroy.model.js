import sequelize from "../../config/dbConfig.js";
import { DataTypes } from "sequelize";

const FarmaciePaymentHistory = sequelize.define('farmacie_payment_history', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true,
    },
    retrival_ref_no: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    base_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    franchises: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: false,
    },
    company_user_fk: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    user_fk: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    sandbox: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
});

export default FarmaciePaymentHistory;

// ==========================================
//                 RELATIONS
// ==========================================

import CompanyUser from "../user/companyUser.model.js";
import FranchiseManager from "../franchise/fanchiseManager.model.js";

// COMPANY USER
FarmaciePaymentHistory.belongsTo(CompanyUser, { foreignKey: 'company_user_fk', targetKey: 'uuid', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
CompanyUser.hasMany(FarmaciePaymentHistory, { foreignKey: 'company_user_fk', sourceKey: 'uuid', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// FRANCHISE MANAGER
FarmaciePaymentHistory.belongsTo(FranchiseManager, { foreignKey: 'user_fk', targetKey: 'uuid', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
FranchiseManager.hasMany(FarmaciePaymentHistory, { foreignKey: 'user_fk', sourceKey: 'uuid', onDelete: 'SET NULL', onUpdate: 'CASCADE' });