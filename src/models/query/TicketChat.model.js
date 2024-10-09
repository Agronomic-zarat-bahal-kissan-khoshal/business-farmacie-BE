import sequelize from "../../config/dbConfig.js";
import { DataTypes } from "sequelize";

const TicketChat = sequelize.define('ticket_chat', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true,
    },

    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_query: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    ticket_fk: {
        type: DataTypes.UUID,
        allowNull: false,
    }
});

export default TicketChat;

// ==========================================
//                 RELATIONS
// ==========================================
import QueriesTicket from "./queriesTicket.model.js";

TicketChat.belongsTo(QueriesTicket, { foreignKey: 'ticket_fk', targetKey: 'uuid', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
QueriesTicket.hasMany(TicketChat, { foreignKey: 'ticket_fk', sourceKey: 'uuid', onDelete: 'CASCADE', onUpdate: 'CASCADE' });