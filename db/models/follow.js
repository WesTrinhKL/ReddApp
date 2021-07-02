'use strict';
module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define('Follow', {
    followBelongsToUserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    followerUserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {});
  Follow.associate = function(models) {
    // associations can be defined here
    Follow.belongsTo(models.User, {
      foreignKey: 'followBelongsToUserID'
    })
    Follow.belongsTo(models.User, {
      foreignKey: 'followerUserID'
    })
  };
  return Follow;
};
