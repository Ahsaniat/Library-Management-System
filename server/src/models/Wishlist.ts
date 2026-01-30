import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface WishlistAttributes {
  id: string;
  userId: string;
  bookId: string;
  notes?: string;
  priority: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WishlistCreationAttributes
  extends Optional<WishlistAttributes, 'id' | 'notes' | 'priority' | 'createdAt' | 'updatedAt'> {}

class Wishlist
  extends Model<WishlistAttributes, WishlistCreationAttributes>
  implements WishlistAttributes
{
  declare id: string;
  declare userId: string;
  declare bookId: string;
  declare notes?: string;
  declare priority: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Wishlist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Wishlist',
    tableName: 'wishlists',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['book_id'] },
      { fields: ['user_id', 'book_id'], unique: true },
    ],
  }
);

export default Wishlist;
