"use strict";
const {db, createNotification} = require("../controller/db");
const p2r = require("path-to-regexp");

/* Model of Permission-setings:
{
   "constructionSite":{
      "write":false,
      "read":true
   },
   "worktime":{
      "write":true,
      "read":true
   },
   "task":{
      "write":true,
      "read":true
   },
   "note":{
      "write":true,
      "read":true
   },
   "material":{
      "write":true,
      "read":true
   },
   "imageUpload":{
      "write":true,
      "read":true
   },
   "users":{
      "write":false,
      "read":true
   },
   "notification":{
      "read":true
   }
}
*/
exports.verifyPermission = async (req, res, next) => {
  try {
    // check if user is admin if so he can do anything

    const userSql =
      "SELECT role, permissions FROM `User`, `Permission` WHERE id = ? and `Permission`.name = role";
    const [userPermission, userfields] = await db
      .promise()
      .query(userSql, [req.userId]);

    req.role = userPermission[0].role.toLowerCase();

    // Admin darf alles
    if(req.role == 'admin'){
      return next();
    }

    // check user permission

    if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/worktime")
        .test(req.path) &&
      req.method == "GET"
    ) {
      if (!userPermission[0].permissions.worktime.read) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      // wenn man eingetragen ist
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/worktime")
        .test(req.path) &&
      req.method == "POST"
    ) {
      if (!userPermission[0].permissions.worktime.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      // wenn man eingetragen ist
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp(
          "/constructionSite/:constructionSiteId/worktime/:worktimeId"
        )
        .test(req.path) &&
      req.method == "PUT"
    ) {
      // nur von einem selbst erstellt ist oder admin
      if (!userPermission[0].permissions.worktime.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const worktimeId = req.params.worktimeId;
      const sql =
        "SELECT * FROM `Worktime` WHERE `constructionSiteId` = ? and id = ? and createdBy->'$.userId' = ? ";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, worktimeId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp(
          "/constructionSite/:constructionSiteId/worktime/:worktimeId"
        )
        .test(req.path) &&
      req.method == "DELETE"
    ) {
      // nur von einem selbst erstellt ist oder admin
      if (!userPermission[0].permissions.worktime.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const worktimeId = req.params.worktimeId;
      const sql =
        "SELECT * FROM `Worktime` WHERE `constructionSiteId` = ? and id = ? and createdBy->'$.userId' = ? ";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, worktimeId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r.pathToRegexp("/constructionSite").test(req.path) &&
      req.method == "GET"
    ) {
      // Darf jeder aber content wird abhängig davon angezeigt ob man eingetragen ist oder admin ist
    } else if (
      p2r.pathToRegexp("/constructionSite").test(req.path) &&
      req.method == "POST"
    ) {
      // only admin and......ToDo
      if (!userPermission[0].permissions.constructionSite.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId")
        .test(req.path) &&
      req.method == "DELETE"
    ) {
      // nur admin bzw. ersteller bzw. mit rolle...ToDo
      if (!userPermission[0].permissions.constructionSite.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId")
        .test(req.path) &&
      req.method == "PUT"
    ) {
      // nur admin bzw. ersteller bzw. mit rolle...ToDo
      if (!userPermission[0].permissions.constructionSite.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId")
        .test(req.path) &&
      req.method == "GET"
    ) {
      // nur admin bzw. ersteller bzw. mit rolle...ToDo
      if (!userPermission[0].permissions.constructionSite.read) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }

      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ? ";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/uploadImage")
        .test(req.path) &&
      req.method == "PUT"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.imageUpload.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if ( p2r.pathToRegexp("/constructionSite/:constructionSiteId/image").test(req.path) && req.method == "GET"){
      // check if eingetragener arbeiter
       // nur admin bzw. ersteller bzw. mit rolle...ToDo
       if (!userPermission[0].permissions.constructionSite.read) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }

      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ? ";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/worker")
        .test(req.path) &&
      req.method == "POST"
    ) {
      // nur admin bzw. ersteller bzw. mit rolle...
      if (!userPermission[0].permissions.constructionSite.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/worker/:workerId")
        .test(req.path) &&
      req.method == "DELETE"
    ) {
      // nur admin bzw. ersteller bzw. mit rolle...
      if (!userPermission[0].permissions.constructionSite.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r.pathToRegexp("/account/invite").test(req.path) &&
      req.method == "POST"
    ) {
      // nur admin bzw chef
      if (!userPermission[0].permissions.users.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r.pathToRegexp("/notification").test(req.path) &&
      req.method == "GET"
    ) {
      // jeder
      if (!userPermission[0].permissions.notification.read) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r.pathToRegexp("/user").test(req.path) &&
      req.method == "GET"
    ) {
      // jeder
      if (!userPermission[0].permissions.users.read) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r.pathToRegexp("/user/:userId").test(req.path) &&
      req.method == "GET"
    ) {
      // man selbst
      const userId = req.params.userId;
      if (!req.userId == userId) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r.pathToRegexp("/user").test(req.path) &&
      req.method == "POST"
    ) {
      // jeder der accessToken hat bzw registrierungslink (AccessToken wird nur über einladung generiert)
    } else if (
      p2r.pathToRegexp("/user/:userId").test(req.path) &&
      req.method == "PUT"
    ) {
      // admin und man selbst
      const userId = req.params.userId;
      delete req.body.id;

      if ((!req.userId == userId) || ( req.body.role && req.userId == userId)) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r.pathToRegexp("/user/:userId").test(req.path) &&
      req.method == "DELETE"
    ) {
      // admin und man selbst
      const userId = req.params.userId;
      if (!req.userId == userId) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r.pathToRegexp("/user/:userId/task").test(req.path) &&
      req.method == "GET"
    ) {
      // admin und man selbst
      const userId = req.params.userId;
      if (!req.userId == userId || !userPermission[0].permissions.task.read) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r.pathToRegexp("/user/:userId/worktime").test(req.path) &&
      req.method == "GET"
    ) {
      // admin und man selbst
      const userId = req.params.userId;
      if (
        !req.userId == userId ||
        !userPermission[0].permissions.worktime.read
      ) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r.pathToRegexp("/task").test(req.path) &&
      req.method == "GET"
    ) {
      // jeder wird aber ausgefiltert ob man eingetragen ist
      if (!userPermission[0].permissions.task.read) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/task")
        .test(req.path) &&
      req.method == "GET"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.task.read) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/task")
        .test(req.path) &&
      req.method == "POST"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.task.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/task/:taskId")
        .test(req.path) &&
      req.method == "PUT"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.task.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/task/:taskId")
        .test(req.path) &&
      req.method == "DELETE"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.task.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/note")
        .test(req.path) &&
      req.method == "GET"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.note.read) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/note")
        .test(req.path) &&
      req.method == "POST"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.note.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/note/:noteId")
        .test(req.path) &&
      req.method == "PUT"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.note.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/note/:noteId")
        .test(req.path) &&
      req.method == "DELETE"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.note.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/material")
        .test(req.path) &&
      req.method == "GET"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.material.read) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      (p2r.pathToRegexp("/material").test(req.path) && req.method == "GET") ||
      (p2r.pathToRegexp("/unit").test(req.path) && req.method == "GET")
    ) {
      if (!userPermission[0].permissions.material.read) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      (p2r.pathToRegexp("/material/:materialName").test(req.path) &&
        req.method == "DELETE") ||
      (p2r.pathToRegexp("/unit/:unitName").test(req.path) &&
        req.method == "DELETE")
    ) {
      if (!userPermission[0].permissions.material.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp("/constructionSite/:constructionSiteId/material")
        .test(req.path) &&
      req.method == "POST"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.material.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp(
          "/constructionSite/:constructionSiteId/material/:materialId"
        )
        .test(req.path) &&
      req.method == "PUT"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.material.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else if (
      p2r
        .pathToRegexp(
          "/constructionSite/:constructionSiteId/material/:materialId"
        )
        .test(req.path) &&
      req.method == "DELETE"
    ) {
      // wenn man eingetragen ist
      if (!userPermission[0].permissions.material.write) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
      const constructionSiteId = req.params.constructionSiteId;
      const sql =
        "SELECT * FROM `ConstructionSiteWorker` WHERE `constructionSiteId` = ? and userId = ?";
      const [results, fields] = await db
        .promise()
        .query(sql, [constructionSiteId, req.userId]);
      if (results.length <= 0) {
        return res.status(403).send({
          message:
            "You do not have the necessary rights to access the resource.",
        });
      }
    } else {
      console.log("default called");
      console.log(req.path);
      return res.status(403).send({
        message: "You do not have the necessary rights to access the resource.",
      });
    }
    /* User has the needed permissions. */
    next();
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};
