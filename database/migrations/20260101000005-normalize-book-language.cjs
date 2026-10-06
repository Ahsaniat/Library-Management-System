/** Normalizes legacy full-name language values to ISO 639-1 codes. */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `UPDATE books SET language = 'en' WHERE language = 'English'`
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `UPDATE books SET language = 'English' WHERE language = 'en'`
    );
  },
};
