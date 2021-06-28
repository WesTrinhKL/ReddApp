'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username:  {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    hashedPassword: {
       type: DataTypes.STRING.BINARY,
      allowNull: false,
  }
}, {});
  User.associate = function(models) {
    User.hasMany(models.Post, {
      as: 'posts',
      foreignKey: 'userId',
    })
  };
  return User;
};
