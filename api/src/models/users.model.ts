import { Sequelize, DataTypes, Model, Optional, ModelStatic, WhereOptions, col, fn, where } from "sequelize";

export interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  /** scrypt hash, see utils/password.ts. Never sent to clients. */
  passwordHash: string;
}

export interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

export type UserModel = ModelStatic<UserInstance>;

/** User as sent to clients: everything but the password hash. */
export type PublicUser = Omit<UserAttributes, "passwordHash">;

/** Canonical form of an email, so case and spaces never split one account in two. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Case-insensitive match on email, covering accounts stored before normalization. */
export function byEmail(email: string): WhereOptions<UserAttributes> {
  return where(fn("lower", col("email")), normalizeEmail(email));
}

/** Strips the password hash before a user leaves the API. */
export function toPublicUser({ id, firstName, lastName, email }: UserInstance): PublicUser {
  return { id, firstName, lastName, email };
}

export default function defineUsers(sequelize: Sequelize): UserModel {
  return sequelize.define<UserInstance>(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: "users",
      freezeTableName: true,
      timestamps: false
    }
  );
}
