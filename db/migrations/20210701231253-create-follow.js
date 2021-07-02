'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Follows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      followBelongsToUserID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id', }
      },
      followerUserID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id', }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Follows');
  }
};
