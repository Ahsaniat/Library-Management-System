/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { createRequire } = require('module');

// Migrations run from the repository root (sequelize-cli) but the models live
// in the server workspace. Resolve the server's dependencies explicitly so
// ts-node and sequelize are loaded from the correct node_modules tree.
const serverRequire = createRequire(path.resolve(__dirname, '../../server/package.json'));
serverRequire('ts-node/register/transpile-only');

function loadSequelize() {
  const { sequelize } = serverRequire(path.resolve(__dirname, '../../server/src/models'));
  return sequelize;
}

/**
 * Baseline schema created from the Sequelize models so the initial migration
 * cannot drift from the model definitions. Every subsequent schema change must
 * be an explicit migration; the application no longer syncs at startup.
 */
module.exports = {
  up: async () => {
    await loadSequelize().sync();
  },
  down: async () => {
    await loadSequelize().drop();
  },
};
