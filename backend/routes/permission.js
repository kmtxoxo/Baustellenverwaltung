"use strict";
const {db, createNotification} = require("../controller/db");
const auth = require('../controller/auth');

let express = require("express");
let router = express.Router({ mergeParams: true });

/** Routes **/
router.get("/permission",auth.verifyToken, getPermissions);

/**
 * Returns notifications
 * Returns a array that includes the last 7 notifications
 *
 * returns List
 **/
async function getPermissions(req, res) {
  try {
      console.log('trying to get defined Permissions');
    const [result, fields] = await db
      .promise()
      .query("SELECT * FROM  `Permission`");
      console.log(result);

    res.send({
      status: "OK",
      data: result,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

module.exports = router;
