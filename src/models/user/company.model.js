import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';

// Define a schema for the user with email and password fields
const Company = sequelize.define('company', {
    company: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: 'The compnay name must be unique. This name is already in use.'
        },
        primaryKey: true,
    },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
}, {
    timestamps: false
}
)

export default Company;