import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';

// Define a schema for the user with email and password fields
const CompanyUser = sequelize.define('company_user', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ntn: {
        type: DataTypes.STRING,
    },

    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    otp: {
        type: DataTypes.INTEGER,
    },
    otp_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    can_change_password: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    company_fk: {
        type: DataTypes.STRING,
        allowNull: true,
    },
},
)

export default CompanyUser;

// ==========================================================
//                     Relations
// ==========================================================
import Company from './company.model.js';

Company.hasOne(CompanyUser, { foreignKey: 'company_fk', sourceKey: 'company', as: 'company_user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
CompanyUser.belongsTo(Company, { foreignKey: 'company_fk', targetKey: 'company', as: 'company', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
