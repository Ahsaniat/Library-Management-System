import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { BookStatus } from '../types';

interface BookAttributes {
  id: string;
  isbn: string;
  title: string;
  subtitle?: string;
  description?: string;
  publishedYear?: number;
  edition?: string;
  language: string;
  pageCount?: number;
  coverImage?: string;
  authorId?: string;
  publisherId?: string;
  categoryId?: string;
  averageRating: number;
  totalRatings: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookCreationAttributes
  extends Optional<
    BookAttributes,
    | 'id'
    | 'subtitle'
    | 'description'
    | 'publishedYear'
    | 'edition'
    | 'language'
    | 'pageCount'
    | 'coverImage'
    | 'authorId'
    | 'publisherId'
    | 'categoryId'
    | 'averageRating'
    | 'totalRatings'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Book extends Model<BookAttributes, BookCreationAttributes> implements BookAttributes {
  declare id: string;
  declare isbn: string;
  declare title: string;
  declare subtitle?: string;
  declare description?: string;
  declare publishedYear?: number;
  declare edition?: string;
  declare language: string;
  declare pageCount?: number;
  declare coverImage?: string;
  declare authorId?: string;
  declare publisherId?: string;
  declare categoryId?: string;
  declare averageRating: number;
  declare totalRatings: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Book.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    isbn: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    publishedYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1000,
        max: new Date().getFullYear() + 1,
      },
    },
    edition: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING(50),
      defaultValue: 'English',
    },
    pageCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
      },
    },
    coverImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    publisherId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    totalRatings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Book',
    tableName: 'books',
    indexes: [
      { fields: ['isbn'], unique: true },
      { fields: ['title'] },
      { fields: ['author_id'] },
      { fields: ['category_id'] },
      { fields: ['published_year'] },
    ],
  }
);

export default Book;
