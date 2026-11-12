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
  /** Danger index, 0 or more: the higher, the more dangerous. Null when unknown. */
  dangerLevel: number | null;
}

const DANGER_LEVEL_FIELD = "dangerLevel";

const DANGER_LEVEL_COLUMN = {
  type: DataTypes.INTEGER,
  allowNull: true
};

export interface PollutionCreationAttributes
  extends Optional<PollutionAttributes, "id"> {}

export interface PollutionInstance
  extends Model<PollutionAttributes, PollutionCreationAttributes>,
    PollutionAttributes {}

export type PollutionModel = ModelStatic<PollutionInstance>;

/**
 * Adds the danger level column to a table created before it existed,
 * since sync() never alters existing tables. Existing rows get null (unknown).
 */
export async function addDangerLevel(model: PollutionModel): Promise<void> {
  const queryInterface = model.sequelize!.getQueryInterface();
  const table = model.getTableName();

  const columns = await queryInterface.describeTable(table);
  if (DANGER_LEVEL_FIELD in columns) {
    return;
  }

  await queryInterface.addColumn(table, DANGER_LEVEL_FIELD, DANGER_LEVEL_COLUMN);
}

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
      },
      dangerLevel: DANGER_LEVEL_COLUMN
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
