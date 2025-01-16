import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';

// Define a schema for the user with email and password fields
const Product = sequelize.define('product', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    company_fk: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sub_category: {
        type: DataTypes.STRING,
    },
    type: {
        type: DataTypes.ENUM('bio', 'chemical'),
        validate: {
            isIn: {
                args: [['bio', 'chemical']],
                msg: "Valid product type is either bio or chemical"
            }
        }
    },
    package_weight: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "package_weight must be an integer."
            },
        }
    },
    weight_unit: {
        type: DataTypes.STRING,
    },
    package_type: {
        type: DataTypes.STRING,
    },
    area_covered: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "areaCovered must be an integer."
            },
        }
    },
    disease_purpose: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "price must be an integer."
            },
        }
    },
    description: {
        type: DataTypes.TEXT,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    blacklist: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
    {
        underscored: true
    }
)

export default Product;


// ==========================================================
//                     Relations
// ==========================================================
import ActiveIngredient from './activeIngredient.model.js';
import ProductImage from './productImage.model.js';
import Company from '../user/company.model.js';

// RELATION WITH ACTIVE INGREDIENTS
Product.hasMany(ActiveIngredient, { foreignKey: 'product_fk', sourceKey: 'uuid', as: 'active_ingredient', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ActiveIngredient.belongsTo(Product, { foreignKey: 'product_fk', targetKey: 'uuid', as: 'product', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// RELATION WITH IMAGES

Product.hasMany(ProductImage, { foreignKey: 'product_fk', sourceKey: 'uuid', as: 'product_image', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'product_fk', targetKey: 'uuid', as: 'product', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// RELATION WITH COMPANY
Product.belongsTo(Company, { foreignKey: 'company_fk', targetKey: 'company', as: 'company', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Company.hasMany(Product, { foreignKey: 'company_fk', sourceKey: 'company', as: 'products', onDelete: 'CASCADE', onUpdate: 'CASCADE' });