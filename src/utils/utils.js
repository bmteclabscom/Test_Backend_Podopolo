const jwt = require('jsonwebtoken');
const { pick } = require('lodash');
const { jwt: jwtConfig } = require('~/config/index');
const { Session } = require('~/models/index');
/**
 * Create signed token
 * @param {string} id the user identifier
 * @param {object} payload the payload
 * @returns {string} the token
 */
exports.signToken = async (id, payload = {}, desc = '') => {
  const session = await Session.create({
    user_id: id,
    desc,
  });
  return jwt.sign(
    {
      iss: jwtConfig.iss,
      aud: jwtConfig.aud,
      exp: Math.floor(Date.now() / 1000) + jwtConfig.exp,
      ...payload,
      sub: id,
      jti: session.id,
    },
    jwtConfig.privateKey,
    {
      algorithm: 'ES512',
    },
  );
};

/**
 * Get the sanitized object
 * @param {Object} object The object
 * @param {'user'} type Object type
 * @returns sanitized object
 */
exports.getPublic = (object, type = 'user') => {
  switch (type) {
    case 'user':
      return pick(object, ['id', 'name', 'email', 'active']);
    default:
      return object;
  }
};

exports.sendError = (req, res, statusCode, message, err) => {
  res.status(statusCode || 500).json({
    success: false,
    message: message || err.message,
  });
};
