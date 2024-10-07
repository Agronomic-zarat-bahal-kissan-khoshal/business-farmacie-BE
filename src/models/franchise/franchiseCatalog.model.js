import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';

export const FranchiseCatalogProduct = sequelize.define('franchise_catalog_product', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true,
    },
    product_fk: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    franchise_fk: {
        type: DataTypes.UUID,
        allowNull: false,
    }
},
    {
        indexes: [
            {
                unique: true,
                fields: ['product_fk', 'franchise_fk'],
            }
        ]
    })

// ======================================================

export const FranchiseCatalogSeed = sequelize.define('franchise_catalog_seed', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true,
    },
    seed_fk: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    franchise_fk: {
        type: DataTypes.UUID,
        allowNull: false,
    }
},
    {
        indexes: [
            {
                unique: true,
                fields: ['seed_fk', 'franchise_fk'],
            }
        ]
    })


// ==========================================================
//                     Relations
// ==========================================================
import Franchise from './franchise.model.js';
import Product from '../product/product.model.js'
import Seed from '../seed/seed.model.js'

// FRANCHISE && FRANCHISE CATALOG PRODUCT
Franchise.hasMany(FranchiseCatalogProduct, { foreignKey: 'franchise_fk', sourceKey: 'uuid', as: 'franchise_catalog_product', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
FranchiseCatalogProduct.belongsTo(Franchise, { foreignKey: "franchise_fk", targetKey: 'uuid', as: 'franchise', onDelete: 'CASCADE', onUpdate: 'CASCADE' })

Product.hasMany(FranchiseCatalogProduct, { foreignKey: 'product_fk', sourceKey: 'uuid', as: 'franchise_catalog_product', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
FranchiseCatalogProduct.belongsTo(Product, { foreignKey: "product_fk", targetKey: 'uuid', as: 'product', onDelete: 'CASCADE', onUpdate: 'CASCADE' })


// SEEDS && FRANCHISE CATALOG SEED
Franchise.hasMany(FranchiseCatalogSeed, { foreignKey: 'franchise_fk', sourceKey: 'uuid', as: 'franchise_catalog_seed', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
FranchiseCatalogSeed.belongsTo(Franchise, { foreignKey: "franchise_fk", targetKey: 'uuid', as: 'franchise', onDelete: 'CASCADE', onUpdate: 'CASCADE' })


Seed.hasMany(FranchiseCatalogSeed, { foreignKey: 'seed_fk', sourceKey: 'uuid', as: 'franchise_catalog_seed', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
FranchiseCatalogSeed.belongsTo(Seed, { foreignKey: "seed_fk", targetKey: 'uuid', as: 'seed', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
