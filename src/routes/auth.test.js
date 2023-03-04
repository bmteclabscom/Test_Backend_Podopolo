const request = require('supertest');
const { it, before, describe, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');

const { apiPrefix, security } = require('~/config/index');
const { User, VerifyCode, Session } = require('~/models/index');
const { start } = require('~/lib/app');
const sg = require('~/lib/sendgrid');

let app;
let agent;
const sandbox = sinon.createSandbox();

describe('[Auth]', () => {
  before(async () => {
    app = await start();
    agent = request.agent(app);
  });

  beforeEach(() => {
    sandbox.stub(sg, 'sendMail').returns(Promise.resolve(true));
  });

  afterEach(async () => {
    sandbox.restore();
    Promise.all(
      [User, VerifyCode, Session].map((Model) =>
        Model.destroy({
          where: {},
          truncate: true,
        }),
      ),
    );
  });

  describe('Login API', () => {
    it('email and password are required', async () => {
      const res = await agent.post(`${apiPrefix}/auth/login`).send({}).expect(400);
      const { success, errors } = res.body;
      expect(success).to.eq(false);
      expect(errors).to.have.nested.property('[0].message', "must have required property 'email'");
      expect(errors).to.have.nested.property(
        '[1].message',
        "must have required property 'password'",
      );
    });

    it('reject invalid email address', async () => {
      const res = await agent
        .post(`${apiPrefix}/auth/login`)
        .send({
          email: 'invalid email address',
          password: '123456',
        })
        .expect(400);
      const { success, errors } = res.body;
      expect(success).to.eq(false);
      expect(errors).to.have.nested.property('[0].message', 'Invalid email address');
    });

    it('should not accept additional properties', async () => {
      const res = await agent
        .post(`${apiPrefix}/auth/login`)
        .send({
          email: 'test@example.com',
          password: '123456',
          foo: 'bar',
        })
        .expect(400);
      const { success, errors } = res.body;
      expect(success).to.eq(false);
      expect(errors).to.have.nested.property('[0].message', 'must NOT have additional properties');
    });

    it('should succeed if the user does exist', async () => {
      await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const res = await agent
        .post(`${apiPrefix}/auth/login`)
        .send({
          email: 'test@example.com',
          password: '123456',
        })
        .expect(200);
      const { success, token, user } = res.body;
      expect(success).to.eq(true);
      expect(user).to.be.an('object');
      expect(token).to.be.a('string');
    });

    it('email is case insensitive', async () => {
      await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const res = await agent
        .post(`${apiPrefix}/auth/login`)
        .send({
          email: 'TeSt@ExAmPle.COM',
          password: '123456',
        })
        .expect(200);
      const { success, token, user } = res.body;
      expect(success).to.eq(true);
      expect(user).to.be.an('object');
      expect(token).to.be.a('string');
    });

    it('should not succeed if the user does exist but not active', async () => {
      await User.create({
        email: 'test@example.com',
        password: '123456',
        active: false,
      });
      const res = await agent
        .post(`${apiPrefix}/auth/login`)
        .send({
          email: 'test@example.com',
          password: '123456',
        })
        .expect(400);
      expect(res.body).to.eql({
        success: false,
        message: 'Please verify your email',
      });
    });

    it('should not succeed if the user does not exist', async () => {
      const res = await agent
        .post(`${apiPrefix}/auth/login`)
        .send({
          email: 'test@example.com',
          password: '123456',
        })
        .expect(400);
      expect(res.body).to.eql({
        success: false,
        message: 'User does not exist',
      });
    });

    it('should not succeed if the password is not correct', async () => {
      await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const res = await agent
        .post(`${apiPrefix}/auth/login`)
        .send({
          email: 'test@example.com',
          password: 'wrong_password',
        })
        .expect(400);
      expect(res.body).to.eql({
        success: false,
        message: 'Email/Password does not match',
      });
    });
  });

  describe('Register API', () => {
    it('email, name and password are required', async () => {
      const res = await agent.post(`${apiPrefix}/auth/register`).send({}).expect(400);
      const { success, errors } = res.body;
      expect(success).to.eq(false);
      expect(errors).to.have.nested.property('[0].message', "must have required property 'name'");
      expect(errors).to.have.nested.property('[1].message', "must have required property 'email'");
      expect(errors).to.have.nested.property(
        '[2].message',
        "must have required property 'password'",
      );
    });

    it('reject invalid email address', async () => {
      const res = await agent
        .post(`${apiPrefix}/auth/register`)
        .send({
          name: 'John Doe',
          email: 'invalid email address',
          password: '123456',
        })
        .expect(400);
      const { success, errors } = res.body;
      expect(success).to.eq(false);
      expect(errors).to.have.nested.property('[0].message', 'Invalid email address');
    });

    it('should reject if the name is invalid', async () => {
      const res = await agent
        .post(`${apiPrefix}/auth/register`)
        .send({
          name: 'John*Doe',
          email: 'test@example.com',
          password: '123456',
        })
        .expect(400);
      const { success, errors } = res.body;
      expect(success).to.eq(false);
      expect(errors).to.have.nested.property('[0].message', 'Please enter a valid name');
    });

    it('should not accept additional properties', async () => {
      const res = await agent
        .post(`${apiPrefix}/auth/register`)
        .send({
          name: 'John Doe',
          email: 'test@example.com',
          password: '123456',
          foo: 'bar',
        })
        .expect(400);
      const { success, errors } = res.body;
      expect(success).to.eq(false);
      expect(errors).to.have.nested.property('[0].message', 'must NOT have additional properties');
    });

    it('should reject if the user already exist', async () => {
      await User.create({
        name: 'John Doe',
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const res = await agent
        .post(`${apiPrefix}/auth/register`)
        .send({
          name: 'John Doe',
          email: 'test@example.com',
          password: '123456',
        })
        .expect(400);
      const { message } = res.body;
      expect(message).to.eql('User already exists.');
    });

    it('should succeed if the user does not exist', async () => {
      const res = await agent
        .post(`${apiPrefix}/auth/register`)
        .send({
          name: 'John Doe',
          email: 'test@example.com',
          password: '123456',
        })
        .expect(200);
      const { success } = res.body;
      expect(success).to.eql(true);
      const code = await VerifyCode.findOne({
        where: {
          email: 'test@example.com',
        },
      });

      expect(code).is.not.eql(null);
      sandbox.assert.calledWith(sg.sendMail, 'test@example.com', 'Activate your account');
    });
  });

  describe('Confirm Verify Code', () => {
    it('should reject if the user does not exist', async () => {
      const { body } = await agent
        .post(`${apiPrefix}/auth/verifyCode`)
        .send({
          email: 'test@example.com',
          code: 123456,
        })
        .expect(400);

      expect(body.success).to.eql(false);
      expect(body.message).to.eql('Invalid code or email address');
    });

    it('should reject if the user is already active', async () => {
      await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const { body } = await agent
        .post(`${apiPrefix}/auth/verifyCode`)
        .send({
          email: 'test@example.com',
          code: 123456,
        })
        .expect(400);

      expect(body.success).to.eql(false);
      expect(body.message).to.eql('Invalid code or email address');
    });

    it('should reject if the user has not created a verification code', async () => {
      await User.create({
        name: 'John Doe',
        email: 'test@example.com',
        password: '123456',
        active: false,
      });
      const { body } = await agent
        .post(`${apiPrefix}/auth/verifyCode`)
        .send({
          email: 'test@example.com',
          code: 123456,
        })
        .expect(400);

      expect(body.success).to.eql(false);
      expect(body.message).to.eql('Invalid code or email address');
    });

    it('should reject if the code has expired', async () => {
      await User.create({
        name: 'John Doe',
        email: 'test@example.com',
        password: '123456',
        active: false,
      });
      await VerifyCode.create({
        email: 'test@example.com',
        code: 123456,
        createdAt: new Date(Date.now() - security.code.ttl - 1),
      });
      const { body } = await agent
        .post(`${apiPrefix}/auth/verifyCode`)
        .send({
          email: 'test@example.com',
          code: 123456,
        })
        .expect(400);

      expect(body.success).to.eql(false);
      expect(body.message).to.eql('Code expired');
    });

    it('should reject if max tries exceeded', async () => {
      await User.create({
        name: 'John Doe',
        email: 'test@example.com',
        password: '123456',
        active: false,
      });
      await VerifyCode.create({
        email: 'test@example.com',
        code: 123456,
        createdAt: new Date(),
        nb_tries: security.code.maxTries,
      });
      const { body } = await agent
        .post(`${apiPrefix}/auth/verifyCode`)
        .send({
          email: 'test@example.com',
          code: 123456,
        })
        .expect(400);

      expect(body.success).to.eql(false);
      expect(body.message).to.eql('Max tries reached');
    });

    it('should reject if tried too quickly', async () => {
      await User.create({
        name: 'John Doe',
        email: 'test@example.com',
        password: '123456',
        active: false,
      });
      await VerifyCode.create({
        email: 'test@example.com',
        code: 123456,
        createdAt: new Date(),
        nb_tries: 0,
        lastTryAt: new Date(),
      });
      const { body } = await agent
        .post(`${apiPrefix}/auth/verifyCode`)
        .send({
          email: 'test@example.com',
          code: 123456,
        })
        .expect(400);

      expect(body.success).to.eql(false);
      expect(body.message).to.eql('Too quick, please wait and try again');
    });

    it('should reject if the code is invalid', async () => {
      await User.create({
        name: 'John Doe',
        email: 'test@example.com',
        password: '123456',
        active: false,
      });
      const code = await VerifyCode.create({
        email: 'test@example.com',
        code: 123456,
        createdAt: new Date(Date.now() - 30000),
        nb_tries: 0,
        lastTryAt: new Date(Date.now() - 30000),
      });
      const now = new Date();
      const { body } = await agent
        .post(`${apiPrefix}/auth/verifyCode`)
        .send({
          email: 'test@example.com',
          code: 321654,
        })
        .expect(400);

      expect(body.success).to.eql(false);
      expect(body.message).to.eql('Invalid code or email address');
      await code.reload();
      expect(code.lastTryAt > now).to.eql(true);
      expect(code.nb_tries).to.eql(1);
    });

    it('should succeed otherwise', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'test@example.com',
        password: '123456',
        active: false,
      });
      const code = await VerifyCode.create({
        email: 'test@example.com',
        code: 123456,
      });
      const { body } = await agent
        .post(`${apiPrefix}/auth/verifyCode`)
        .send({
          email: 'test@example.com',
          code: 123456,
        })
        .expect(200);

      expect(body.success).to.eql(true);
      let err;
      try {
        await code.reload();
      } catch (e) {
        err = e;
      }
      expect(err).to.be.an('Error');
      await user.reload();
      expect(user.active).to.eql(true);
    });
  });
});
