import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ReservationStatus } from '../types';

interface ReservationAttributes {
  id: string;
  bookId: string;
  userId: string;
  status: ReservationStatus;
  queuePosition: number;
  reservedAt: Date;
  expiresAt?: Date;
  fulfilledAt?: Date;
  notifiedAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReservationCreationAttributes
  extends Optional<
    ReservationAttributes,
    | 'id'
    | 'status'
    | 'queuePosition'
    | 'reservedAt'
    | 'expiresAt'
    | 'fulfilledAt'
    | 'notifiedAt'
    | 'notes'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Reservation
  extends Model<ReservationAttributes, ReservationCreationAttributes>
  implements ReservationAttributes
{
  declare id: string;
  declare bookId: string;
  declare userId: string;
  declare status: ReservationStatus;
  declare queuePosition: number;
  declare reservedAt: Date;
  declare expiresAt?: Date;
  declare fulfilledAt?: Date;
  declare notifiedAt?: Date;
  declare notes?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Reservation.init(
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
    status: {
      type: DataTypes.ENUM(...Object.values(ReservationStatus)),
      defaultValue: ReservationStatus.PENDING,
    },
    queuePosition: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    reservedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fulfilledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Reservation',
    tableName: 'reservations',
    indexes: [
      { fields: ['book_id'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['queue_position'] },
    ],
  }
);

export default Reservation;
