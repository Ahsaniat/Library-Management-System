import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PaymentAttributes {
  id: string;
  fineId: string;
  userId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'other';
  transactionId?: string;
  receiptNumber: string;
  paidAt: Date;
  processedBy?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaymentCreationAttributes
  extends Optional<
    PaymentAttributes,
    | 'id'
    | 'transactionId'
    | 'paidAt'
    | 'processedBy'
    | 'notes'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Payment
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes
{
  declare id: string;
  declare fineId: string;
  declare userId: string;
  declare amount: number;
  declare paymentMethod: 'cash' | 'card' | 'online' | 'other';
  declare transactionId?: string;
  declare receiptNumber: string;
  declare paidAt: Date;
  declare processedBy?: string;
  declare notes?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fineId: {
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
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'online', 'other'),
      allowNull: false,
    },
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    receiptNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    processedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    indexes: [
      { fields: ['fine_id'] },
      { fields: ['user_id'] },
      { fields: ['receipt_number'], unique: true },
    ],
  }
);

export default Payment;
