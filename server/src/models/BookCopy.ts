import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { BookStatus } from '../types';

interface BookCopyAttributes {
  id: string;
  bookId: string;
  barcode: string;
  status: BookStatus;
  condition: 'new' | 'good' | 'fair' | 'poor';
  location?: string;
  shelf?: string;
  section?: string;
  floor?: string;
  libraryId?: string;
  acquisitionDate?: Date;
  acquisitionPrice?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookCopyCreationAttributes
  extends Optional<
    BookCopyAttributes,
    | 'id'
    | 'status'
    | 'condition'
    | 'location'
    | 'shelf'
    | 'section'
    | 'floor'
    | 'libraryId'
    | 'acquisitionDate'
    | 'acquisitionPrice'
    | 'notes'
    | 'createdAt'
    | 'updatedAt'
  > {}

class BookCopy
  extends Model<BookCopyAttributes, BookCopyCreationAttributes>
  implements BookCopyAttributes
{
  declare id: string;
  declare bookId: string;
  declare barcode: string;
  declare status: BookStatus;
  declare condition: 'new' | 'good' | 'fair' | 'poor';
  declare location?: string;
  declare shelf?: string;
  declare section?: string;
  declare floor?: string;
  declare libraryId?: string;
  declare acquisitionDate?: Date;
  declare acquisitionPrice?: number;
  declare notes?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

BookCopy.init(
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
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BookStatus)),
      defaultValue: BookStatus.AVAILABLE,
    },
    condition: {
      type: DataTypes.ENUM('new', 'good', 'fair', 'poor'),
      defaultValue: 'good',
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    shelf: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    section: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    floor: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    libraryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    acquisitionDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    acquisitionPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'BookCopy',
    tableName: 'book_copies',
    indexes: [
      { fields: ['barcode'], unique: true },
      { fields: ['book_id'] },
      { fields: ['status'] },
      { fields: ['library_id'] },
    ],
  }
);

export default BookCopy;
