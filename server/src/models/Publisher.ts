import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PublisherAttributes {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PublisherCreationAttributes
  extends Optional<
    PublisherAttributes,
    | 'id'
    | 'address'
    | 'city'
    | 'country'
    | 'phone'
    | 'email'
    | 'website'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Publisher
  extends Model<PublisherAttributes, PublisherCreationAttributes>
  implements PublisherAttributes
{
  declare id: string;
  declare name: string;
  declare address?: string;
  declare city?: string;
  declare country?: string;
  declare phone?: string;
  declare email?: string;
  declare website?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Publisher.init(
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
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
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
  },
  {
    sequelize,
    modelName: 'Publisher',
    tableName: 'publishers',
    indexes: [{ fields: ['name'] }],
  }
);

export default Publisher;
