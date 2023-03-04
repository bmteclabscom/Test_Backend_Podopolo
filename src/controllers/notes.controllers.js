const { sendError } = require('~/utils/utils');
const log = require('debug')('app:controllers:notes');
const { Notes } = require('~/models/index');
/**
 *
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
// eslint-disable-next-line func-names
exports.getAllNotes = async function (req, res) {
  const { user } = req;
  try {
    const notes = await Notes.findAll({
      where: {
        user_id: user.id,
      },
    });
    const shared_notes = await Notes.findAll({
      where: {
        share: true,
        shared_id: user.id,
      },
    });
    return res.json({ success: true, notes, shared_notes });
  } catch (err) {
    log('Error while getting all of notes', err);
    return sendError(req, res, 400, 'Invalid Request in getting all notes');
  }
};

// eslint-disable-next-line func-names
exports.createNote = async function (req, res) {
  const { user } = req;
  const { content } = req.body;
  try {
    const newNote = await Notes.create({ content, user_id: user.id });
    return res.json({ success: true, id: newNote.id });
  } catch (err) {
    log('Error while creating note', err);
    return sendError(req, res, 400, 'Invalid Request in creating note');
  }
};

// eslint-disable-next-line func-names
exports.getNoteByID = async function (req, res) {
  const { user } = req;
  const { id } = req.params;
  try {
    const note = await Notes.findOne({
      where: {
        id,
        user_id: user.id,
      },
    });
    if (!note) {
      return sendError(req, res, 400, 'Note does not exist');
    }
    return res.json({ success: true, note });
  } catch (err) {
    log('Error while getting note', err);
    return sendError(req, res, 400, 'Invalid Request in getting note');
  }
};

// eslint-disable-next-line func-names
exports.updateNote = async function (req, res) {
  const { user } = req;
  const { id } = req.params;
  const { content } = req.body;
  try {
    const note = await Notes.findOne({
      where: {
        id,
        user_id: user.id,
      },
    });
    if (!note) {
      return sendError(req, res, 400, 'Note does not exist');
    }
    await note.update({ content });
    return res.json({ success: true, content });
  } catch (err) {
    log('Error while updating note', err);
    return sendError(req, res, 400, 'Invalid Request in updating note');
  }
};

// eslint-disable-next-line func-names
exports.deleteNote = async function (req, res) {
  const { user } = req;
  const { id } = req.params;
  try {
    const note = await Notes.findOne({
      where: {
        id,
        user_id: user.id,
      },
    });
    if (!note) {
      return sendError(req, res, 400, 'Note does not exist');
    }
    await Notes.destroy({
      where: {
        id,
        user_id: user.id,
      },
    });
    return res.json({ success: true });
  } catch (err) {
    log('Error while deleting note', err);
    return sendError(req, res, 400, 'Invalid Request in deleting note');
  }
};

// eslint-disable-next-line func-names
exports.shareNote = async function (req, res) {
  const { user } = req;
  const { id } = req.params;
  const { to } = req.body;
  try {
    const note = await Notes.findOne({
      where: {
        id,
        user_id: user.id,
      },
    });
    if (!note) {
      return sendError(req, res, 400, 'Note does not exist');
    }
    await note.update({ share: true, shared_id: to });
    return res.json({ success: true });
  } catch (err) {
    log('Error while sharing note', err);
    return sendError(req, res, 400, 'Invalid Request in sharing note');
  }
};

// eslint-disable-next-line func-names
exports.search = async function (req, res) {
  const { user } = req;
  const filters = req.query;
  try {
    const notes = await Notes.findAll({
      where: {
        user_id: user.id,
      },
    });
    if (!notes) {
      return sendError(req, res, 400, 'Notes do not exist');
    }

    const filteredNote = notes.filter((note) => {
      if (note.content.includes(filters.q)) {
        return note;
      }
      return null;
    });
    return res.json({ success: true, filteredNote });
  } catch (err) {
    log('Error while sharing note', err);
    return sendError(req, res, 400, 'Invalid Request in sharing note');
  }
};
