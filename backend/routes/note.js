"use strict";
const {db, createNotification} = require("../controller/db");
const NoteDTO = require("../models/noteDTO");
const auth = require("../controller/auth");
const permission = require("../controller/permission");

let express = require("express");
let router = express.Router({ mergeParams: true });

/** Routes **/
router.get(
  "/constructionSite/:constructionSiteId/note",
  auth.verifyToken,
  permission.verifyPermission,
  getConstructionSiteNotes
);
router.post(
  "/constructionSite/:constructionSiteId/note",
  auth.verifyToken,
  permission.verifyPermission,
  addNote
);
router.put(
  "/constructionSite/:constructionSiteId/note/:noteId",
  auth.verifyToken,
  permission.verifyPermission,
  updateNote
);
router.delete(
  "/constructionSite/:constructionSiteId/note/:noteId",
  auth.verifyToken,
  permission.verifyPermission,
  deleteNote
);

/**
 * Returns all notes for specified construction sites
 * Returns a array of notes.
 *
 * constructionSiteId Long ID of constructionSite
 * returns List
 **/
async function getConstructionSiteNotes(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;

    const [result, fields] = await db
      .promise()
      .query(
        `SELECT id, title, text, createdBy, modifiedAt, constructionSiteId FROM Note where constructionSiteId = ? ORDER BY modifiedAt DESC`, [constructionSiteId]
      );

    const noteArray = result.map((noteEntry) => {
      return new NoteDTO(noteEntry);
    });
    res.send({
      status: "OK",
      data: noteArray,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Add note to constructionSite
 *
 * body Note Note object that should be added to constructionSite
 * constructionSiteId Long ID of constructionSite
 * returns Note
 **/
async function addNote(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const note = new NoteDTO(req.body);
    note.modifiedAt = new Date().toISOString();

    const sql =
      "INSERT INTO Note ( title, text, createdBy, modifiedAt, constructionSiteId) VALUES (?) ";
    const [result, fields] = await db
      .promise()
      .query(sql, [
        [
          note.title,
          note.text,
          JSON.stringify(note.createdBy),
          note.modifiedAt,
          constructionSiteId,
        ],
      ]);

    note.id = result.insertId;
    let text = {
      de: `${req.name} hat Notiz "${note.title.length > 30?note.title.slice(0,27)+'...':note.title}" hinzugefügt`,
      en: `${req.name} has added Note "${note.title.length > 30?note.title.slice(0,27)+'...':note.title}"`,
    }
    createNotification('comment',text, new Date().toISOString(),constructionSiteId);

    res.send({
      status: "OK",
      data: note,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Delete note by ID
 * Deletes note from construction Site
 *
 * constructionSiteId Long ID of constructionSite
 * noteId Long ID of note that needs to be deleted
 * no response value expected for this operation
 **/
async function deleteNote(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const noteId = req.params.noteId;

    const sql = `DELETE FROM Note WHERE id = ? and constructionSiteId = ?`;
    const [result, fields] = await db.promise().query(sql,[noteId, constructionSiteId]);
    if (result.affectedRows === 0) {
      throw "couldn't delete note";
    }

    res.send({
      status: "DELETED",
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Update note by ID
 * Update Note
 *
 * body Note Note object that should be added to constructionSite
 * constructionSiteId Long ID of constructionSite
 * noteId Long ID of note that should be updated
 * returns Note
 **/
async function updateNote(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const noteId = req.params.noteId;
    const note = new NoteDTO(req.body);
    note.modifiedAt = new Date().toISOString();

    const sql = "UPDATE Note SET ? WHERE constructionSiteId = ? AND id = ? ";
    const [result, fields] = await db
      .promise()
      .query(sql, [
        { title: note.title, text: note.text, modifiedAt: note.modifiedAt },
        constructionSiteId,
        noteId,
      ]);
    if (result.changedRows === 0) {
      throw "couldn't update Note";
    }
    let text = {
      de: `${req.name} hat Notiz "${note.title.length > 30?note.title.slice(0,27)+'...':note.title}" aktualisiert`,
      en: `${req.name} has updated Note "${note.title.length > 30?note.title.slice(0,27)+'...':note.title}"`,
    }
    createNotification('comment',text, new Date().toISOString(),constructionSiteId);
    res.send({
      status: "DELETED",
      data: note,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

module.exports = router;
