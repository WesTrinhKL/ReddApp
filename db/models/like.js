'use strict';
module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    liked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {});
  Like.associate = function(models) {
    Like.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId'
    })
    Like.belongsTo(models.Post, {
      as: 'post',
      foreignKey: 'postId'
    })
  };
  return Like;
};