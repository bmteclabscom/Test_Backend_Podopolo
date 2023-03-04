const bcrypt = require('bcryptjs');
const log = require('debug')('app:models:user');
/**
 * Get the model
 * @param {import("sequelize").Sequelize} sequelize sequelize instance
 * @param {{ DataTypes: import("sequelize").DataTypes }} options sequelize options
 * @returns {import("sequelize").Model}
 */
const getUserModel = (sequelize, { DataTypes }) => {
  const Users = sequelize.define(
    'users',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: { type: DataTypes.STRING },
      active: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      hooks: {
        beforeSave: async (user) => {
          const u = user;
          u.email = (u.email || '').toLowerCase();
          if (!user.password) return;
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(user.password, salt);
          u.password = hash;
        },
      },
      defaultScope: {
        attributes: {
          exclude: ['password'],
        },
      },
      scopes: {
        withPassword: {
          attributes: {
            include: ['password'],
          },
        },
      },
    },
  );
  Users.prototype.correctPassword = async (inputPassword, userPassword) =>
    bcrypt.compare(inputPassword, userPassword);

  Users.prototype.correct = () => {
    log('correct');
  };
  return Users;
};

module.exports = getUserModel;
