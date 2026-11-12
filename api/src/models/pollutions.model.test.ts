import { test } from "node:test";
import assert from "node:assert/strict";
import { addDangerLevel, PollutionModel } from "./pollutions.model";

/** Model double recording the column added to a table that lacks it. */
function fakeModel(added: Record<string, unknown>[]): PollutionModel {
  const queryInterface = {
    describeTable: async () => ({}),
    addColumn: async (_table: string, _field: string, column: Record<string, unknown>) => {
      added.push(column);
    }
  };

  return {
    sequelize: { getQueryInterface: () => queryInterface },
    getTableName: () => "pollutions"
  } as unknown as PollutionModel;
}

test("leaves the danger level of existing rows unknown", async () => {
  const added: Record<string, unknown>[] = [];

  await addDangerLevel(fakeModel(added));

  assert.equal(added.length, 1);
  assert.equal(added[0].allowNull, true);
  assert.equal("defaultValue" in added[0], false);
});
