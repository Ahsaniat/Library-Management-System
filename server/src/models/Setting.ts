import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SettingAttributes {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SettingCreationAttributes
  extends Optional<SettingAttributes, 'id' | 'description' | 'isPublic' | 'createdAt' | 'updatedAt'>
{}

class Setting
  extends Model<SettingAttributes, SettingCreationAttributes>
  implements SettingAttributes
{
  declare id: string;
  declare key: string;
  declare value: string;
  declare type: 'string' | 'number' | 'boolean' | 'json';
  declare description?: string;
  declare isPublic: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Setting.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
      defaultValue: 'string',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Setting',
    tableName: 'settings',
    indexes: [{ fields: ['key'], unique: true }],
  }
);

export default Setting;
