'use strict';
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    content: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {});
  Comment.associate = function(models) {
    Comment.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId'
    })
    Comment.belongsTo(models.Post, {
      as: 'post',
      foreignKey: 'postId'
    })
  };
  return Comment;
};