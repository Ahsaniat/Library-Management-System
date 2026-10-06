import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { UserRole } from '../types';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  profilePhoto?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  tokenVersion: number;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  libraryId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<
    UserAttributes,
    | 'id'
    | 'role'
    | 'isActive'
    | 'isEmailVerified'
    | 'tokenVersion'
    | 'phone'
    | 'address'
    | 'profilePhoto'
    | 'emailVerificationToken'
    | 'emailVerificationExpires'
    | 'passwordResetToken'
    | 'passwordResetExpires'
    | 'lastLoginAt'
    | 'libraryId'
    | 'createdAt'
    | 'updatedAt'
  >;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password: string;
  declare firstName: string;
  declare lastName: string;
  declare role: UserRole;
  declare phone?: string;
  declare address?: string;
  declare profilePhoto?: string;
  declare isActive: boolean;
  declare isEmailVerified: boolean;
  declare tokenVersion: number;
  declare emailVerificationToken?: string;
  declare emailVerificationExpires?: Date;
  declare passwordResetToken?: string;
  declare passwordResetExpires?: Date;
  declare lastLoginAt?: Date;
  declare libraryId?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  toJSON(): Omit<UserAttributes, 'password' | 'emailVerificationToken' | 'passwordResetToken'> {
    const values = { ...this.get() };
    delete (values as Partial<UserAttributes>).password;
    delete (values as Partial<UserAttributes>).emailVerificationToken;
    delete (values as Partial<UserAttributes>).passwordResetToken;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      defaultValue: UserRole.MEMBER,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profilePhoto: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tokenVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    libraryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['role'] },
      { fields: ['is_active'] },
      { fields: ['library_id'] },
    ],
  }
);

export default User;
