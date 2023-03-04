/**
 * Get the model
 * @param {import("sequelize").Sequelize} sequelize sequelize instance
 * @param {{ DataTypes: import("sequelize").DataTypes }} options sequelize options
 * @returns {import("sequelize").Model}
 */
const getVerifyCode = (sequelize, { DataTypes }) => {
  const VerifyCode = sequelize.define('verifycodes', {
    email: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    code: { type: DataTypes.INTEGER },
    nb_tries: { type: DataTypes.INTEGER, defaultValue: 0 },
    lastTryAt: { type: DataTypes.DATE },
    nb_resends: { type: DataTypes.INTEGER, defaultValue: 0 },
    lastResendAt: { type: DataTypes.DATE },
  });

  return VerifyCode;
};

module.exports = getVerifyCode;
