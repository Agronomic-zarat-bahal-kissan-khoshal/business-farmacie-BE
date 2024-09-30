import { uuid } from 'uuidv4';
import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';

const ProductImage = sequelize.define('product_image', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false
});

export default ProductImage;