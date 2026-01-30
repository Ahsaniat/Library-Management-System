import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ReviewAttributes {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
  isApproved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReviewCreationAttributes
  extends Optional<
    ReviewAttributes,
    'id' | 'title' | 'content' | 'isApproved' | 'createdAt' | 'updatedAt'
  > {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  declare id: string;
  declare bookId: string;
  declare userId: string;
  declare rating: number;
  declare title?: string;
  declare content?: string;
  declare isApproved: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    indexes: [
      { fields: ['book_id'] },
      { fields: ['user_id'] },
      { fields: ['rating'] },
      { fields: ['book_id', 'user_id'], unique: true },
    ],
  }
);

export default Review;
