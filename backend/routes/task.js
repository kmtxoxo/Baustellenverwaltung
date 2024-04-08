"use strict";
const {db, createNotification} = require("../controller/db");
const TaskDTO = require("../models/taskDTO");
const auth = require("../controller/auth");
const permission = require("../controller/permission");

let express = require("express");
let router = express.Router({ mergeParams: true });

/** Routes **/
router.get("/task", auth.verifyToken, getTasks);
router.get("/user/:userId/task", auth.verifyToken, getTasksByUserId);
router.get(
  "/constructionSite/:constructionSiteId/task",
  auth.verifyToken,
  permission.verifyPermission,
  getConstructionSiteTasks
);
router.post(
  "/constructionSite/:constructionSiteId/task",
  auth.verifyToken,
  permission.verifyPermission,
  addTask
);
router.put(
  "/constructionSite/:constructionSiteId/task/:taskId",
  auth.verifyToken,
  permission.verifyPermission,
  updateTask
);
router.delete(
  "/constructionSite/:constructionSiteId/task/:taskId",
  auth.verifyToken,
  permission.verifyPermission,
  deleteTask
);

/**
 * Returns all task for all construction sites
 * Returns a array of all tasks
 *
 * returns List
 **/
async function getTasks(req, res) {
  try {
    const [result, fields] = await db
      .promise()
      .query(
        "SELECT id, title, text, priority, status, createdBy,createdAt, modifiedAt, constructionSiteId FROM Task ORDER BY modifiedAt DESC"
      );

    const taskArray = result.map((taskEntry) => {
      return new TaskDTO(taskEntry);
    });
    res.send({
      status: "OK",
      data: taskArray,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Returns all task for user
 * Returns a array of all tasks
 *
 * userId Long ID of user
 * returns List
 **/
async function getTasksByUserId(req, res) {
  try {
    const userId = parseInt(req.params.userId);

    const [result, fields] = await db
      .promise()
      .query(
        `SELECT id, title, text, priority, status, createdBy,createdAt, modifiedAt,assignedTo, constructionSiteId FROM Task where assignedTo->"$.userId" = ? ORDER BY modifiedAt DESC`,[userId]
      );

    const taskArray = result.map((taskEntry) => {
      return new TaskDTO(taskEntry);
    });
    res.send({
      status: "OK",
      data: taskArray,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Returns all tasks for specified construction sites
 * Returns a array of tasks
 *
 * constructionSiteId Long ID of constructionSite
 * returns List
 **/
async function getConstructionSiteTasks(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;

    const [result, fields] = await db
      .promise()
      .query(
        `SELECT id, title, text, priority, status, createdBy,createdAt, modifiedAt,assignedTo, constructionSiteId FROM Task where constructionSiteId = ? ORDER BY modifiedAt DESC`,[constructionSiteId]
      );
    const taskArray = result.map((taskEntry) => {
      return new TaskDTO(taskEntry);
    });
    res.send({
      status: "OK",
      data: taskArray,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Add task to constructionSite
 *
 * body Task Task object that should be added to constructionSite
 * constructionSiteId Long ID of constructionSite
 * returns Task
 **/
async function addTask(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const task = new TaskDTO(req.body);
    task.createdBy = {
      user: req.name,
      userId: req.userId
    };
    task.createdAt = new Date().toISOString();
    task.modifiedAt = new Date().toISOString();

    const sql =
      "INSERT INTO Task ( title,text,priority,status, createdBy,createdAt, modifiedAt, assignedTo, constructionSiteId) VALUES (?) ";
    const [result, fields] = await db
      .promise()
      .query(sql, [
        [
          task.title,
          task.text?task.text: null,
          task.priority,
          task.status,
          JSON.stringify(task.createdBy),
          task.createdAt,
          task.modifiedAt,
          JSON.stringify(task.assignedTo),
          constructionSiteId,
        ],
      ]);

    task.id = result.insertId;

    res.send({
      status: "OK",
      data: task,
    });
    let text = {
      de: `${req.name} hat Aufgabe "${task.title.length > 30?task.title.slice(0,27)+'...':task.title}" hinzugefügt`,
      en: `${req.name} has added task "${task.title.length > 30?task.title.slice(0,27)+'...':task.title}"`,
    }
    createNotification('check_box',text, new Date().toISOString(), constructionSiteId);
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Delete task by ID
 * Deletes Task from construction Site
 *
 * constructionSiteId Long ID of constructionSite
 * taskId Long ID of task that needs to be deleted
 * no response value expected for this operation
 **/
async function deleteTask(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const taskId = req.params.taskId;

    const sql = `DELETE FROM Task WHERE id = ? and constructionSiteId = ?`;
    const [result, fields] = await db.promise().query(sql,[taskId,constructionSiteId]);
    if (result.affectedRows === 0) {
      throw "couldn't delete task";
    }

    res.send({
      status: "DELETED",
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Update task by ID
 * Update task
 *
 * body Task Task object that should be added to constructionSite
 * constructionSiteId Long ID of constructionSite
 * taskId Long ID of task that should be updated
 * returns Task
 **/
async function updateTask(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const taskId = req.params.taskId;
    const task = new TaskDTO(req.body);
    task.modifiedAt = new Date().toISOString();

    const sql = "UPDATE Task SET ? WHERE constructionSiteId = ? AND id = ? ";
    const [result, fields] = await db.promise().query(sql, [
      {
        title: task.title,
        text: task.text,
        status: task.status,
        priority: task.priority,
        assignedTo: JSON.stringify(task.assignedTo),
        modifiedAt: task.modifiedAt,
      },
      constructionSiteId,
      taskId,
    ]);
    if (result.changedRows === 0) {
      throw "couldn't update Task";
    }
    res.send({
      status: "OK",
      data: task,
    });
    let text = {
      de: `${req.name} hat Aufgabe "${task.title.length > 30?task.title.slice(0,27)+'...':task.title}" aktualisiert`,
      en: `${req.name} has updated task "${task.title.length > 30?task.title.slice(0,27)+'...':task.title}"`,
    }
    createNotification('check_box',text, new Date().toISOString(),constructionSiteId);
  } catch (e) {
    res.status(500).send(e);
  }
}
module.exports = router;
