import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AuthorAttributes {
  id: string;
  name: string;
  biography?: string;
  birthDate?: Date;
  deathDate?: Date;
  nationality?: string;
  website?: string;
  photo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthorCreationAttributes
  extends Optional<
    AuthorAttributes,
    | 'id'
    | 'biography'
    | 'birthDate'
    | 'deathDate'
    | 'nationality'
    | 'website'
    | 'photo'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Author extends Model<AuthorAttributes, AuthorCreationAttributes> implements AuthorAttributes {
  declare id: string;
  declare name: string;
  declare biography?: string;
  declare birthDate?: Date;
  declare deathDate?: Date;
  declare nationality?: string;
  declare website?: string;
  declare photo?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Author.init(
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
    biography: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    deathDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nationality: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Author',
    tableName: 'authors',
    indexes: [{ fields: ['name'] }],
  }
);

export default Author;
