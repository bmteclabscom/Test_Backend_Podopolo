const request = require('supertest');
const { it, before, describe, afterEach } = require('mocha');
const sinon = require('sinon');

const { apiPrefix } = require('~/config/index');
const { User, Notes } = require('~/models/index');
const { start } = require('~/lib/app');
const { signToken } = require('~/utils/utils');

let app;
let agent;
const sandbox = sinon.createSandbox();

describe('[Notes]', () => {
  before(async () => {
    app = await start();
    agent = request.agent(app);
  });

  afterEach(async () => {
    sandbox.restore();
    Promise.all(
      [User, Notes].map((Model) =>
        Model.destroy({
          where: {},
          truncate: true,
        }),
      ),
    );
  });

  describe('Get All Notes', () => {
    it('Should reject if user does not authenticated', async () => {
      await agent.get(`${apiPrefix}/notes`).send().expect(401);
    });
    it('should reject if the token is invalid', async () => {
      await agent
        .get(`${apiPrefix}/notes`)
        .set('authorization', 'Bearer invalid_token')
        .send()
        .expect(401);
    });

    it('Should success otherwise', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);
      await agent
        .get(`${apiPrefix}/notes`)
        .set('authorization', `Bearer ${token}`)
        .send()
        .expect(200);
    });
  });

  describe('Create a Note', () => {
    it('Should reject if user does not authenticated', async () => {
      await agent
        .post(`${apiPrefix}/notes`)
        .send({
          content: 'Test Content',
        })
        .expect(401);
    });

    it('should reject if the token is invalid', async () => {
      await agent
        .post(`${apiPrefix}/notes`)
        .set('authorization', 'Bearer invalid_token')
        .send({
          content: 'Test Content',
        })
        .expect(401);
    });

    it('should not accept additional properties ', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);

      await agent
        .post(`${apiPrefix}/notes`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test Content',
          foo: 'foo',
        })
        .expect(400);
    });

    it('Should success otherwise', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);
      await agent
        .post(`${apiPrefix}/notes`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test Content',
        })
        .expect(200);
    });
  });

  describe('Get Note By ID', () => {
    it('Should reject if user does not authenticated', async () => {
      await agent.get(`${apiPrefix}/notes/123e4567-e89b-12d3-a456-426655443210`).send().expect(401);
    });

    it('should reject if the token is invalid', async () => {
      await agent
        .get(`${apiPrefix}/notes/123e4567-e89b-12d3-a456-426655443210`)
        .set('authorization', 'Bearer invalid_token')
        .send()
        .expect(401);
    });

    it('should reject if id is not UUID format', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);

      await agent
        .get(`${apiPrefix}/notes/1`)
        .set('authorization', `Bearer ${token}`)
        .send()
        .expect(400);
    });
    it('should reject if note does not exist', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);

      await agent
        .get(`${apiPrefix}/notes/123e4567-e89b-12d3-a456-426655443210`)
        .set('authorization', `Bearer ${token}`)
        .send()
        .expect(400);
    });

    it('Should success otherwise', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);
      const note = await agent
        .post(`${apiPrefix}/notes`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test Content',
        })
        .expect(200);
      const { id } = JSON.parse(note.text);
      await agent
        .get(`${apiPrefix}/notes/${id}`)
        .set('authorization', `Bearer ${token}`)
        .send()
        .expect(200);
    });
  });

  describe('Update Note By ID', () => {
    it('Should reject if user does not authenticated', async () => {
      await agent
        .put(`${apiPrefix}/notes/123e4567-e89b-12d3-a456-426655443210`)
        .send({
          content: 'Test',
        })
        .expect(401);
    });

    it('should reject if the token is invalid', async () => {
      await agent
        .put(`${apiPrefix}/notes/123e4567-e89b-12d3-a456-426655443210`)
        .set('authorization', 'Bearer invalid_token')
        .send({
          content: 'Test',
        })
        .expect(401);
    });

    it('should reject if id is not UUID format', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);

      await agent
        .put(`${apiPrefix}/notes/1`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test',
        })
        .expect(400);
    });

    it('should reject if note does not exist', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);

      await agent
        .put(`${apiPrefix}/notes/123e4567-e89b-12d3-a456-426655443210`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test',
        })
        .expect(400);
    });

    it('should not accept additional properties ', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);

      const note = await agent
        .post(`${apiPrefix}/notes`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test Content',
        })
        .expect(200);
      const { id } = JSON.parse(note.text);
      await agent
        .put(`${apiPrefix}/notes/${id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test',
          foo: 'foo',
        })
        .expect(400);
    });

    it('Should success otherwise', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);
      const note = await agent
        .post(`${apiPrefix}/notes`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test Content',
        })
        .expect(200);
      const { id } = JSON.parse(note.text);
      await agent
        .put(`${apiPrefix}/notes/${id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test',
        })
        .expect(200);
    });
  });

  describe('Delete Note By ID', () => {
    it('Should reject if user does not authenticated', async () => {
      await agent
        .delete(`${apiPrefix}/notes/123e4567-e89b-12d3-a456-426655443210`)
        .send()
        .expect(401);
    });

    it('should reject if the token is invalid', async () => {
      await agent
        .delete(`${apiPrefix}/notes/123e4567-e89b-12d3-a456-426655443210`)
        .set('authorization', 'Bearer invalid_token')
        .send()
        .expect(401);
    });

    it('should reject if id is not UUID format', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);

      await agent
        .delete(`${apiPrefix}/notes/1`)
        .set('authorization', `Bearer ${token}`)
        .send()
        .expect(400);
    });

    it('should reject if note does not exist', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);

      await agent
        .delete(`${apiPrefix}/notes/123e4567-e89b-12d3-a456-426655443210`)
        .set('authorization', `Bearer ${token}`)
        .send()
        .expect(400);
    });

    it('Should success otherwise', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);
      const note = await agent
        .post(`${apiPrefix}/notes`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test Content',
        })
        .expect(200);
      const { id } = JSON.parse(note.text);
      await agent
        .delete(`${apiPrefix}/notes/${id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test',
        })
        .expect(200);
    });
  });

  describe('Share Note', () => {
    it('Should reject if user does not authenticated', async () => {
      await agent
        .post(`${apiPrefix}/notes/123e4567-e89b-12d3-a456-426655443210/share`)
        .send({
          to: 1,
        })
        .expect(401);
    });

    it('should reject if the token is invalid', async () => {
      await agent
        .post(`${apiPrefix}/notes/123e4567-e89b-12d3-a456-426655443210/share`)
        .set('authorization', 'Bearer invalid_token')
        .send({
          to: 1,
        })
        .expect(401);
    });

    it('should reject if id is not UUID format', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);

      await agent
        .post(`${apiPrefix}/notes/1/share`)
        .set('authorization', `Bearer ${token}`)
        .send({
          to: 1,
        })
        .expect(400);
    });

    it('should reject if note does not exist', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);

      await agent
        .put(`${apiPrefix}/notes/123e4567-e89b-12d3-a456-426655443210/share`)
        .set('authorization', `Bearer ${token}`)
        .send({
          to: 1,
        })
        .expect(404);
    });

    it('should not accept additional properties ', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);

      const note = await agent
        .post(`${apiPrefix}/notes`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test Content',
        })
        .expect(200);
      const { id } = JSON.parse(note.text);
      await agent
        .post(`${apiPrefix}/notes/${id}/share`)
        .set('authorization', `Bearer ${token}`)
        .send({
          to: 1,
          foo: 'foo',
        })
        .expect(400);
    });
    it('Should reject if shared id is not integer', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);
      const note = await agent
        .post(`${apiPrefix}/notes`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test Content',
        })
        .expect(200);
      const { id } = JSON.parse(note.text);
      await agent
        .post(`${apiPrefix}/notes/${id}/share`)
        .set('authorization', `Bearer ${token}`)
        .send({
          to: '1',
        })
        .expect(400);
    });

    it('Should success otherwise', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);
      const note = await agent
        .post(`${apiPrefix}/notes`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test Content',
        })
        .expect(200);
      const { id } = JSON.parse(note.text);
      await agent
        .post(`${apiPrefix}/notes/${id}/share`)
        .set('authorization', `Bearer ${token}`)
        .send({
          to: 1,
        })
        .expect(200);
    });
  });

  describe('Search Note', () => {
    it('Should reject if user does not authenticated', async () => {
      await agent.get(`${apiPrefix}/search?q=for`).send().expect(401);
    });

    it('should reject if the token is invalid', async () => {
      await agent
        .get(`${apiPrefix}/search?q=for`)
        .set('authorization', 'Bearer invalid_token')
        .send()
        .expect(401);
    });

    it('Should success otherwise', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: '123456',
        active: true,
      });
      const token = await signToken(user.id);
      await agent
        .post(`${apiPrefix}/notes`)
        .set('authorization', `Bearer ${token}`)
        .send({
          content: 'Test Content',
        })
        .expect(200);
      await agent
        .get(`${apiPrefix}/search?q=test`)
        .set('authorization', `Bearer ${token}`)
        .send()
        .expect(200);
    });
  });
});
