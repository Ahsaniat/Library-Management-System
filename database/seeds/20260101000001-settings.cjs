const path = require('path');
const { createRequire } = require('module');

const serverRequire = createRequire(path.resolve(__dirname, '../../server/package.json'));
serverRequire('ts-node/register/transpile-only');

function loadSetting() {
  const { Setting } = serverRequire(path.resolve(__dirname, '../../server/src/models'));
  return Setting;
}

const DEFAULTS = [
  {
    key: 'loan.periodDays',
    value: '14',
    type: 'number',
    description: 'Default loan period in days',
    isPublic: true,
  },
  {
    key: 'loan.maxActive',
    value: '5',
    type: 'number',
    description: 'Maximum concurrent active loans per member',
    isPublic: true,
  },
  {
    key: 'loan.maxRenewals',
    value: '2',
    type: 'number',
    description: 'Maximum renewals per loan',
    isPublic: true,
  },
  {
    key: 'fine.perDay',
    value: '0.5',
    type: 'number',
    description: 'Fine charged per started day overdue',
    isPublic: true,
  },
  {
    key: 'fine.currency',
    value: 'USD',
    type: 'string',
    description: 'Currency for fines and payments',
    isPublic: true,
  },
  {
    key: 'reservation.holdDays',
    value: '3',
    type: 'number',
    description: 'Days a ready reservation is held before expiring',
    isPublic: true,
  },
];

module.exports = {
  DEFAULTS,
  up: async () => {
    const Setting = loadSetting();
    for (const setting of DEFAULTS) {
      await Setting.findOrCreate({
        where: { key: setting.key },
        defaults: setting,
      });
    }
  },
  down: async () => {
    const { Op } = serverRequire('sequelize');
    await loadSetting().destroy({ where: { key: { [Op.in]: DEFAULTS.map((s) => s.key) } } });
  },
};
