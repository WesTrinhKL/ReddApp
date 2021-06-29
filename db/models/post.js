'use strict';
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    header: {
      type: DataTypes.STRING(100),
      allowNull:false
    },
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
  };
  return Post;
};
