import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { LoanStatus } from '../types';

interface LoanAttributes {
  id: string;
  bookCopyId: string;
  userId: string;
  librarianId?: string;
  status: LoanStatus;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt?: Date;
  renewalCount: number;
  maxRenewals: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LoanCreationAttributes
  extends Optional<
    LoanAttributes,
    | 'id'
    | 'librarianId'
    | 'status'
    | 'borrowedAt'
    | 'returnedAt'
    | 'renewalCount'
    | 'maxRenewals'
    | 'notes'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Loan extends Model<LoanAttributes, LoanCreationAttributes> implements LoanAttributes {
  declare id: string;
  declare bookCopyId: string;
  declare userId: string;
  declare librarianId?: string;
  declare status: LoanStatus;
  declare borrowedAt: Date;
  declare dueDate: Date;
  declare returnedAt?: Date;
  declare renewalCount: number;
  declare maxRenewals: number;
  declare notes?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Loan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookCopyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    librarianId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(LoanStatus)),
      defaultValue: LoanStatus.ACTIVE,
    },
    borrowedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    returnedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    renewalCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    maxRenewals: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Loan',
    tableName: 'loans',
    indexes: [
      { fields: ['book_copy_id'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['due_date'] },
      { fields: ['borrowed_at'] },
    ],
  }
);

export default Loan;
