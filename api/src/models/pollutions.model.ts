import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

export interface PollutionType {
  id: number;
  name: string;
}

export interface PollutionAttributes {
  id: number;
  label: string;
  type: PollutionType;
  description: string;
  date: string;
  place: string;
  latitude: string;
  longitude: string;
  image: string;
}

export interface PollutionCreationAttributes
  extends Optional<PollutionAttributes, "id"> {}

export interface PollutionInstance
  extends Model<PollutionAttributes, PollutionCreationAttributes>,
    PollutionAttributes {}

export type PollutionModel = ModelStatic<PollutionInstance>;

export default function definePollutions(
  sequelize: Sequelize,
  _seq?: typeof Sequelize
): PollutionModel {
  const Pollutions = sequelize.define<PollutionInstance>(
    "pollution",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.JSONB,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false
      },
      place: {
        type: DataTypes.STRING,
        allowNull: false
      },
      latitude: {
        type: DataTypes.STRING,
        allowNull: false
      },
      longitude: {
        type: DataTypes.STRING,
        allowNull: false
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
      }
    },
    {
      // New table: the legacy "pollution" table has an incompatible schema
      tableName: "pollutions",
      freezeTableName: true,
      timestamps: false
    }
  );

  return Pollutions;
}
