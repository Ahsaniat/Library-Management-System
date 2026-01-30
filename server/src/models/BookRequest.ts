import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum BookRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACQUIRED = 'acquired',
}

interface BookRequestAttributes {
  id: string;
  userId: string;
  title: string;
  author?: string;
  isbn?: string;
  reason?: string;
  status: BookRequestStatus;
  adminNotes?: string;
  processedBy?: string;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookRequestCreationAttributes
  extends Optional<
    BookRequestAttributes,
    | 'id'
    | 'author'
    | 'isbn'
    | 'reason'
    | 'status'
    | 'adminNotes'
    | 'processedBy'
    | 'processedAt'
    | 'createdAt'
    | 'updatedAt'
  > {}

class BookRequest
  extends Model<BookRequestAttributes, BookRequestCreationAttributes>
  implements BookRequestAttributes
{
  declare id: string;
  declare userId: string;
  declare title: string;
  declare author?: string;
  declare isbn?: string;
  declare reason?: string;
  declare status: BookRequestStatus;
  declare adminNotes?: string;
  declare processedBy?: string;
  declare processedAt?: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

BookRequest.init(
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
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isbn: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BookRequestStatus)),
      defaultValue: BookRequestStatus.PENDING,
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'BookRequest',
    tableName: 'book_requests',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
    ],
  }
);

export default BookRequest;
