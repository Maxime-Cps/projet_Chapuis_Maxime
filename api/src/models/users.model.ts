import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

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
