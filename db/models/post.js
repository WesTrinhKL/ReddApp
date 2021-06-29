'use strict';
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {});
  Post.associate = function(models) {
    Post.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId',
     })
    Post.hasMany(models.Comment, {
      as: 'comments',
      foreignKey: 'commentId'
    })
  };
  return Post;
};
