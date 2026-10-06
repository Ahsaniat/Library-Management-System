/**
 * Adds the `cancelled` value to the book request status enum. Postgres cannot
 * remove enum values, so `down` is intentionally a no-op.
 */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_book_requests_status" ADD VALUE IF NOT EXISTS 'cancelled'`
    );
  },

  down: async () => {
    // Enum values cannot be removed without recreating the type.
  },
};
