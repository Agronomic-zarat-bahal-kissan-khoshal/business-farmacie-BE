import sequelize from "../../config/dbConfig.js";
import { DataTypes } from "sequelize";

const QueriesTicket = sequelize.define('quries_ticket', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true,
    },
    first_query: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    responded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    query_viewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    response_viewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    }
});

export default QueriesTicket;

// ==========================================
//                 RELATIONS
// ==========================================

import CompanyUser from "../user/companyUser.model.js";

QueriesTicket.belongsTo(CompanyUser, { foreignKey: 'company_user_fk', targetKey: 'uuid', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
CompanyUser.hasMany(QueriesTicket, { foreignKey: 'company_user_fk', sourceKey: 'uuid', onDelete: 'CASCADE', onUpdate: 'CASCADE' });