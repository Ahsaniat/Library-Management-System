/**
 * Soft-delete columns for users and books. Existing rows keep their history;
 * deleted records are hidden from default queries.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const table of ['users', 'books']) {
      const columns = await queryInterface.describeTable(table);
      if (!columns.deleted_at) {
        await queryInterface.addColumn(table, 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true,
        });
      }
    }
  },

  down: async (queryInterface) => {
    for (const table of ['users', 'books']) {
      const columns = await queryInterface.describeTable(table);
      if (columns.deleted_at) {
        await queryInterface.removeColumn(table, 'deleted_at');
      }
    }
  },
};
