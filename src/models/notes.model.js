const User = require('./users.model');
/**
 * Get the model
 * @param {import("sequelize").Sequelize} sequelize sequelize instance
 * @param {{ DataTypes: import("sequelize").DataTypes }} options sequelize options
 * @returns {import("sequelize").Model}
 */
const getNotesModel = (sequelize, { DataTypes }) => {
  const Notes = sequelize.define('notes', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: { type: DataTypes.INTEGER },
    content: { type: DataTypes.STRING },
    share: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    shared_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  Notes.associate = () => {
    Notes.belongsTo(User, {
      foreignKey: 'user_id',
    });

    Notes.belongsTo(User, {
      foreignKey: 'shared_id',
    });
  };

  return Notes;
};

module.exports = getNotesModel;
