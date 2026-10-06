/**
 * Adds an expiry for email verification tokens. Column checks keep the
 * migration idempotent on databases whose baseline was synced from models
 * that already include the column.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('users');
    if (!table.email_verification_expires) {
      await queryInterface.addColumn('users', 'email_verification_expires', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('users');
    if (table.email_verification_expires) {
      await queryInterface.removeColumn('users', 'email_verification_expires');
    }
  },
};
