import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';

// Define a schema for the user with email and password fields
const ActiveIngredient = sequelize.define('active_ingredient', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true,
    },
    ingredient_fk: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    concentration: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "concentration must be an integer."
            },
        }
    },
    unit: {
        type: DataTypes.STRING,
    },

}, {
    timestamps: false
}
)

export default ActiveIngredient;


// ==========================================================
//                     Relations
// ==========================================================

import Ingredient from './ingredient.model.js';

ActiveIngredient.belongsTo(Ingredient, { foreignKey: 'ingredient_fk', targetKey: 'ingredient_name', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Ingredient.hasMany(ActiveIngredient, { foreignKey: 'ingredient_fk', sourceKey: 'ingredient_name', onDelete: 'CASCADE', onUpdate: 'CASCADE' });