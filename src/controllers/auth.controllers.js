const crypto = require('node:crypto');
const { sendError, signToken, getPublic } = require('~/utils/utils');
const log = require('debug')('app:controllers:auth');
const { security, publicUrl } = require('~/config/index');
const { User, VerifyCode } = require('~/models/index');
const sg = require('~/lib/sendgrid');
const env = require('~/lib/nunjucks');

/**
 *
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existUser = await User.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existUser) {
      return sendError(req, res, 400, 'User already exists.');
    }

    const code = crypto.randomInt(security.code.min, security.code.max);
    const template = env.render('verify-email.view.njk', {
      title: 'Email verification',
      code,
      link: `${publicUrl}/api/auth/verifyCode?email=${encodeURIComponent(
        email.toLowerCase(),
      )}&code=${code}`,
    });
    await User.create({ name, email: email.toLowerCase(), password });
    await VerifyCode.create({
      email: email.toLowerCase(),
      code,
    });

    await sg.sendMail(email.toLowerCase(), 'Activate your account', template);
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user_exist = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user_exist) {
      return res.status(400).json({ success: false, message: 'User does not exist' });
    }

    const non_activated_user = await User.findOne({
      where: { email: email.toLowerCase(), active: false },
    });

    if (non_activated_user) {
      return res.status(400).json({ success: false, message: 'Please verify your email' });
    }

    const user = await User.scope('withPassword').findOne({
      where: { email: email.toLowerCase(), active: true },
    });

    if (!(await user.correctPassword(password, user.password)))
      return res.status(400).json({ success: false, message: 'Email/Password does not match' });

    const token = await signToken(user.id);

    return res.status(200).json({ success: true, user: getPublic(user, 'user'), token });
  } catch (err) {
    log('Error while login the user', err);
    return sendError(req, res, 400, 'Invalid user data');
  }
};

/**
 * @param {'body' | 'query'} placement
 */
exports.activateAccount = function activateAccount(placement = 'body') {
  return async (req, res) => {
    const { email } = req[placement];
    try {
      await User.update(
        {
          active: true,
        },
        {
          where: { email: email.toLowerCase() },
        },
      );

      return res.status(200).format({
        json() {
          return res.send({ success: true });
        },
        html() {
          const template = env.render('message.view.njk', {
            title: 'Email verified',
            className: 'success',
            subtitle: 'Success!',
            message: 'Your email address has been verified.',
          });
          return res.send(template);
        },
      });
    } catch (err) {
      log('error', 'err:', err);
      return res.status(200).format({
        json() {
          return sendError(req, res, 400, 'Invalid verification code');
        },
        html() {
          const template = env.render('message.view.njk', {
            title: 'Email verification failed',
            className: 'error',
            subtitle: 'Error!',
            message: 'Invalid verification code',
          });
          return res.send(template);
        },
      });
    }
  };
};

exports.checkCode = function checkCode(
  isCheckUserActive = true,
  /**
   * @type {'body' | 'query'}
   */
  placement = 'body',
) {
  return async (req, res, next) => {
    const { email, code } = req[placement];
    const message = 'Invalid code or email address';

    try {
      const filter = isCheckUserActive
        ? { email: email.toLowerCase(), active: true }
        : { email: email.toLowerCase() };
      const user = await User.findOne({ where: filter });

      if (!user) {
        log('trying to validate invalid user account', email);
        return res.status(400).format({
          json() {
            return sendError(req, res, 400, message);
          },
          html() {
            const template = env.render('message.view.njk', {
              title: 'Email verification failed',
              className: 'error',
              subtitle: 'Error!',
              message,
            });
            return res.send(template);
          },
        });
      }

      const verifyCode = await VerifyCode.findOne({
        where: {
          email: email.toLowerCase(),
        },
      });

      if (!verifyCode) {
        log('trying to validate a user account with invalid code', email, code);
        return res.status(400).format({
          json() {
            return sendError(req, res, 400, message);
          },
          html() {
            const template = env.render('message.view.njk', {
              title: 'Email verification failed',
              className: 'error',
              subtitle: 'Error!',
              message,
            });
            return res.send(template);
          },
        });
      }

      if (Date.now() - verifyCode.createdAt.getTime() > security.code.ttl) {
        await verifyCode.destroy();
        return res.status(400).format({
          json() {
            return sendError(req, res, 400, 'Code expired');
          },
          html() {
            const template = env.render('message.view.njk', {
              title: 'Email verification failed',
              className: 'error',
              subtitle: 'Error!',
              message: 'Code expired',
            });
            return res.send(template);
          },
        });
      }

      if (verifyCode.nb_tries >= security.code.maxTries)
        return res.status(400).format({
          json() {
            return sendError(req, res, 400, 'Max tries reached');
          },
          html() {
            const template = env.render('message.view.njk', {
              title: 'Email verification failed',
              className: 'error',
              subtitle: 'Error!',
              message: 'Max tries reached',
            });
            return res.send(template);
          },
        });

      if (
        verifyCode.lastTryAt &&
        Date.now() - verifyCode.lastTryAt.getTime() <= security.code.tryDelay
      )
        return res.status(400).format({
          json() {
            return sendError(req, res, 400, 'Too quick, please wait and try again');
          },
          html() {
            const template = env.render('message.view.njk', {
              title: 'Email verification failed',
              className: 'error',
              subtitle: 'Error!',
              message: 'Too quick, please wait and try again',
            });
            return res.send(template);
          },
        });

      if (verifyCode.code !== +code) {
        verifyCode.lastTryAt = new Date();
        verifyCode.nb_tries += 1;

        await verifyCode.save();
        return res.status(400).format({
          json() {
            return sendError(req, res, 400, message);
          },
          html() {
            const template = env.render('message.view.njk', {
              title: 'Email verification failed',
              className: 'error',
              subtitle: 'Error!',
              message,
            });
            return res.send(template);
          },
        });
      }

      await verifyCode.destroy();
    } catch (err) {
      log('error', 'err:', err);
      return sendError(req, res, 400, 'Invalid user data: ');
    }

    return next();
  };
};
