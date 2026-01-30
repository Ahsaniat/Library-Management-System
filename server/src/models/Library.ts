import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface LibraryAttributes {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
  isMain: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LibraryCreationAttributes
  extends Optional<
    LibraryAttributes,
    | 'id'
    | 'address'
    | 'city'
    | 'state'
    | 'country'
    | 'zipCode'
    | 'phone'
    | 'email'
    | 'website'
    | 'openingHours'
    | 'isMain'
    | 'isActive'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Library
  extends Model<LibraryAttributes, LibraryCreationAttributes>
  implements LibraryAttributes
{
  declare id: string;
  declare name: string;
  declare code: string;
  declare address?: string;
  declare city?: string;
  declare state?: string;
  declare country?: string;
  declare zipCode?: string;
  declare phone?: string;
  declare email?: string;
  declare website?: string;
  declare openingHours?: string;
  declare isMain: boolean;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Library.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    openingHours: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isMain: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Library',
    tableName: 'libraries',
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['is_active'] },
    ],
  }
);

export default Library;
