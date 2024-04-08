/** Package imports */
"use strict";
const { db, createNotification } = require("../controller/db");
const WorktimeDTO = require("../models/worktimeDTO");
const Json2csvParser = require("json2csv").Parser;
let express = require("express");
let router = express.Router({ mergeParams: true });
const auth = require("../controller/auth");
const permission = require("../controller/permission");
/** Routes **/
router.get(
  "/worktime",
  auth.verifyToken,
  permission.verifyPermission,
  getWorktime
);
router.get(
  "/user/:userId/worktime",
  auth.verifyToken,
  permission.verifyPermission,
  getWorktimeByUser
);
router.get(
  "/constructionSite/:constructionSiteId/worktime",
  auth.verifyToken,
  permission.verifyPermission,
  getConstructionSiteWorktimes
);
router.post(
  "/constructionSite/:constructionSiteId/worktime",
  auth.verifyToken,
  permission.verifyPermission,
  bookWorktime
);
router.put(
  "/constructionSite/:constructionSiteId/worktime/:worktimeId",
  auth.verifyToken,
  permission.verifyPermission,
  updateWorktime
);
router.delete(
  "/constructionSite/:constructionSiteId/worktime/:worktimeId",
  auth.verifyToken,
  permission.verifyPermission,
  deleteWorktime
);

/**
 * Returns booked worktime for all construction sites
 * Returns a array of booked worktime
 *
 * returns List
 **/
async function getWorktime(req, res) {
  try {

    const users =  typeof req.query.users === 'string'? req.query.users.split(","):req.query.users;
    const from =  req.query.from;
    const to =  req.query.to;
    let sql = "";
    let params = [];

    
    if (from && to && users) {
      var selectedUsers = users.map(function (x) { 
        return parseInt(x, 10); 
      });

      sql =
        //'SELECT id, hours, text, minutes, start, end, createdBy, modifiedAt, constructionSiteId  FROM `Worktime` WHERE CONVERT(?, DATE) <= CONVERT(start, DATE) and CONVERT(end, DATE) <= CONVERT(?, DATE) and createdBy->"$.userId" IN (?) ORDER BY end desc';
        'SELECT id, hours, text, minutes, start, end, createdBy, modifiedAt, constructionSiteId  FROM `Worktime` WHERE CONVERT(?, DATE) <= CONVERT(start, DATE) and CONVERT(end, DATE) <= CONVERT(?, DATE) and createdBy->"$.userId" IN (?) ORDER BY end desc';
        params = [from, to, selectedUsers];
    } else if (from && to && !users) {
      sql =
      'SELECT id, hours, text, minutes, start, end, createdBy, modifiedAt, constructionSiteId  FROM `Worktime` WHERE CONVERT(?, DATE) <= CONVERT(start, DATE) and CONVERT(end, DATE) <= CONVERT(?, DATE) ORDER BY end desc';
      params = [from, to];
    }

    const [result, fields] = await db
      .promise()
      .query(
        sql, params
      );
      console.log(result);
    const worktimeArray = result.map((worktimeEntry) => {
      return new WorktimeDTO(worktimeEntry);
    });

    res.format({
      "text/csv": () => {
        const fields = [
          {
            label: "Name",
            value: "createdBy.user",
          },
          {
            label: "Zeit (Stunden)",
            value: (item) =>
              (item.hours + item.minutes / 60).toString().replace(".", ","),
            default: 0,
          },
          {
            label: "Start",
            value: (item) => new Date(item.start).toLocaleString("de-DE"),
          },
          {
            label: "Ende",
            value: (item) => new Date(item.end).toLocaleString("de-DE"),
          },
          {
            label: "Durchgefuehrte Arbeiten",
            value: 'text',
          },
          {
            label: "Eingetragen am",
            value: (item) => new Date(item.modifiedAt).toLocaleString("de-DE"),
          },
        ];

        const json2csvParser = new Json2csvParser({ fields, delimiter: ";" });
        const csv = json2csvParser.parse(worktimeArray);
        res.attachment("Zeiten.csv");
        res.status(200).send(csv);
      },
      json: function () {
        res.send({
          status: "OK",
          data: worktimeArray,
        });
      },
    });

  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Returns booked worktime by user
 * Returns a array of booked worktime
 *
 * userId Long ID of user
 * returns List
 **/
async function getWorktimeByUser(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const from = req.query.from;
    const to = req.query.to;
    let sql = "";
    let params = [];
    if (from && to) {
      sql =
        'SELECT id, hours, text, minutes, start, end, createdBy, modifiedAt, constructionSiteId  FROM `Worktime` WHERE CONVERT(?, DATE) <= CONVERT(start, DATE) and CONVERT(end, DATE) <= CONVERT(?, DATE) and createdBy->"$.userId" = ? ORDER BY end desc';
      params = [from, to, userId];
    } else if (from) {
      sql =
        'SELECT id, hours, text, minutes, start, end, createdBy, modifiedAt, constructionSiteId  FROM `Worktime` WHERE CONVERT(?, DATE) <= CONVERT(start, DATE) and createdBy->"$.userId" = ? ORDER BY end desc';
      params = [from, userId];
    } else {
      sql =
        'SELECT id, hours, text, minutes, start, end, createdBy, modifiedAt, constructionSiteId FROM Worktime where createdBy->"$.userId" = ? ORDER BY end desc';
      params = [userId];
    }
    const [result, fields] = await db.promise().query(sql, params);

    const worktimeArray = result.map((worktimeEntry) => {
      return new WorktimeDTO(worktimeEntry);
    });

    res.send({
      status: "OK",
      data: worktimeArray,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Returns booked worktime for specified construction sites
 * Returns a array of booked worktime
 *
 * constructionSiteId Long ID of constructionSite
 * returns List
 **/
async function getConstructionSiteWorktimes(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;

    const [result, fields] = await db
      .promise()
      .query(
        `SELECT id, hours, text, minutes, start, end, createdBy, modifiedAt, constructionSiteId FROM Worktime where constructionSiteId = ? ORDER BY modifiedAt DESC`, [constructionSiteId]
      );

    const worktimeArray = result.map((worktimeEntry) => {
      return new WorktimeDTO(worktimeEntry);
    });

    res.format({
      "text/csv": () => {
        const fields = [
          {
            label: "Name",
            value: "createdBy.user",
          },
          {
            label: "Zeit (Stunden)",
            value: (item) =>
              (item.hours + item.minutes / 60).toString().replace(".", ","),
            default: 0,
          },
          {
            label: "Start",
            value: (item) => new Date(item.start).toLocaleString("de-DE"),
          },
          {
            label: "Ende",
            value: (item) => new Date(item.end).toLocaleString("de-DE"),
          },
          {
            label: "Durchgefuehrte Arbeiten",
            value: 'text',
          },
          {
            label: "Eingetragen am",
            value: (item) => new Date(item.modifiedAt).toLocaleString("de-DE"),
          },
        ];

        const json2csvParser = new Json2csvParser({ fields, delimiter: ";" });
        const csv = json2csvParser.parse(worktimeArray);
        res.attachment("Zeiten.csv");
        res.status(200).send(csv);
      },
      json: function () {
        res.send({
          status: "OK",
          data: worktimeArray,
        });
      },
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Book worktime for constructionSite
 *
 * body Worktime Worktime object that should be added to constructionSite
 * constructionSiteId Long ID of constructionSite
 * returns Worktime
 **/
async function bookWorktime(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const worktime = new WorktimeDTO(req.body);
    worktime.modifiedAt = new Date().toISOString();
    if(worktime.start >= worktime.end) {
      throw 'start is greater or equal end!';
    }

    const sql =
      "INSERT INTO Worktime (hours, minutes, start, end, text, createdBy, modifiedAt, constructionSiteId) VALUES (?) ";
    const [result, fields] = await db
      .promise()
      .query(sql, [
        [
          worktime.hours,
          worktime.minutes,
          worktime.start,
          worktime.end,
          worktime.text,
          JSON.stringify(worktime.createdBy),
          worktime.modifiedAt,
          constructionSiteId,
        ],
      ]);
    worktime.id = result.insertId;
    res.send({
      status: "OK",
      data: worktime,
    });
    let text;
    if (worktime.minutes && worktime.hours) {
      text = {
        de: `${req.name} hat ${worktime.hours} Stunden und ${worktime.minutes} Minuten als Arbeitszeit eingetragen`,
        en: `${req.name} has booked ${worktime.hours} hours and ${worktime.minutes} minutes as working time`,
      };
    } else if (worktime.hours) {
      text = {
        de: `${req.name} hat ${worktime.hours} Stunden als Arbeitszeit eingetragen`,
        en: `${req.name} has booked ${worktime.hours} hours as working time`,
      };
    } else if (worktime.minutes) {
      text = {
        de: `${req.name} hat ${worktime.minutes} Minuten als Arbeitszeit eingetragen`,
        en: `${req.name} has booked ${worktime.minutes} minutes as working time`,
      };
    }
    if (text) {
      createNotification("access_time", text, new Date().toISOString(), constructionSiteId);
    }
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Update worktime by ID
 * Update booked worktime
 *
 * body Worktime Worktime object that should be added to constructionSite
 * constructionSiteId Long ID of constructionSite
 * worktimeId Long ID of the worktime that needs to be updated
 * returns Worktime
 **/
async function updateWorktime(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const worktimeId = req.params.worktimeId;
    const worktime = new WorktimeDTO(req.body);

    worktime.id = worktimeId;
    worktime.modifiedAt = new Date().toISOString();
    const sql =
      "UPDATE Worktime SET ? WHERE constructionSiteId = ? AND id = ? ";
    const [rows, fields] = await db.promise().query(sql, [
      {
        hours: worktime.hours,
        minutes: worktime.minutes,
        start: worktime.start,
        end: worktime.end,
        text: worktime.text,
        createdBy: JSON.stringify(worktime.createdBy),
        modifiedAt: worktime.modifiedAt,
      },
      constructionSiteId,
      worktimeId,
    ]);
    if (rows.changedRows > 0) {
      res.send({
        status: "OK",
        data: worktime,
      });
      let text;
      if (worktime.minutes && worktime.hours) {
        text = {
          de: `${req.name} hat seine Arbeitszeit auf ${worktime.hours} Stunden und ${worktime.minutes} Minuten aktualisiert`,
          en: `${req.name} has updated his working time to ${worktime.hours} hours and ${worktime.minutes} minutes`,
        };
      } else if (worktime.hours) {
        text = {
          de: `${req.name} hat seine Arbeitszeit auf ${worktime.hours} Stunden aktualisiert`,
          en: `${req.name} has updated his working time to ${worktime.hours} hours`,
        };
      } else if (worktime.minutes) {
        text = {
          de: `${req.name} hat seine Arbeitszeit auf ${worktime.minutes} Minuten aktualisiert`,
          en: `${req.name} has updated his working time to ${worktime.minutes} minutes`,
        };
      }
      if (text) {
        createNotification("access_time", text, new Date().toISOString(), constructionSiteId);
      }
    } else {
      throw "update failed";
    }
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Delete worktime by ID
 * Deletes booked worktime
 *
 * constructionSiteId Long ID of constructionSite
 * worktimeId Long ID of the worktime that needs to be deleted
 * no response value expected for this operation
 **/
async function deleteWorktime(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const worktimeId = req.params.worktimeId;

    const sql = `DELETE FROM Worktime WHERE id = ? and constructionSiteId = ?`;
    const [rows, fields] = await db.promise().query(sql,[worktimeId, constructionSiteId]);
    res.send({
      status: "DELETED",
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

module.exports = router;
