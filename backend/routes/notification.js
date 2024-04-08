"use strict";
const {db, createNotification} = require("../controller/db");
const NotificationDTO = require("../models/notificationDTO");
const auth = require('../controller/auth');
const permission = require('../controller/permission');

let express = require("express");
let router = express.Router({ mergeParams: true });

/** Routes **/
router.get("/notification",auth.verifyToken,permission.verifyPermission, getNotifications);

/**
 * Returns notifications
 * Returns a array that includes the last 7 notifications
 *
 * returns List
 **/
async function getNotifications(req, res) {
  try {
    let sql = '';
    if(req.role == 'admin'){
      sql = 'SELECT * FROM Notification ORDER BY timestamp DESC LIMIT 6'
    } else {
      sql = `SELECT DISTINCT id, type, text, Notification.constructionSiteId, timestamp FROM Notification, ConstructionSiteWorker WHERE
      (Notification.constructionSiteId = ConstructionSiteWorker.constructionSiteId and ConstructionSiteWorker.userId = ? ) or 
      (Notification.constructionSiteId IS NULL OR Notification.constructionSiteId = ' ')  ORDER BY timestamp DESC LIMIT 6
      `
    }

    const [result, fields] = await db
      .promise()
      .query(sql,[req.userId]);

    const notifications = result.map((notification) => {
      notification.text = typeof notification.text === 'string' || notification.text instanceof String? JSON.parse(notification.text): notification.text;
      return new NotificationDTO(notification);
    });
    res.send({
      status: "OK",
      data: notifications,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

module.exports = router;
