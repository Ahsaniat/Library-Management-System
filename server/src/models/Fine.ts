import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { FineStatus } from '../types';

interface FineAttributes {
  id: string;
  loanId: string;
  userId: string;
  amount: number;
  paidAmount: number;
  reason: string;
  status: FineStatus;
  dueDate?: Date;
  paidAt?: Date;
  waivedAt?: Date;
  waivedBy?: string;
  waiverReason?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FineCreationAttributes
  extends Optional<
    FineAttributes,
    | 'id'
    | 'paidAmount'
    | 'status'
    | 'dueDate'
    | 'paidAt'
    | 'waivedAt'
    | 'waivedBy'
    | 'waiverReason'
    | 'notes'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Fine extends Model<FineAttributes, FineCreationAttributes> implements FineAttributes {
  declare id: string;
  declare loanId: string;
  declare userId: string;
  declare amount: number;
  declare paidAmount: number;
  declare reason: string;
  declare status: FineStatus;
  declare dueDate?: Date;
  declare paidAt?: Date;
  declare waivedAt?: Date;
  declare waivedBy?: string;
  declare waiverReason?: string;
  declare notes?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Fine.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    loanId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(FineStatus)),
      defaultValue: FineStatus.PENDING,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waivedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    waiverReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Fine',
    tableName: 'fines',
    indexes: [
      { fields: ['loan_id'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
    ],
  }
);

export default Fine;
