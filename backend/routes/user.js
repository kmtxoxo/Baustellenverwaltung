"use strict";
const {db, createNotification} = require("../controller/db");
const UserDTO = require("../models/userDTO");
const bcrypt = require("bcrypt");
const auth = require("../controller/auth");
const permission = require("../controller/permission");
const environment = require("../environment");
let express = require("express");
let router = express.Router({ mergeParams: true });

/** Routes **/
router.get("/user", auth.verifyToken, permission.verifyPermission, getUsers);
router.get("/user/:userId", auth.verifyToken, permission.verifyPermission, getUserById);
router.post("/user", addUser);
router.put(
  "/user/:userId",
  auth.verifyToken,
  permission.verifyPermission,
  updateUser
);
router.delete(
  "/user/:userId",
  auth.verifyToken,
  permission.verifyPermission,
  deleteUser
);

/**
 * Returns all users
 * Returns a array of users
 *
 * returns List
 **/
async function getUsers(req, res) {
  try {
    const [result, fields] = await db
      .promise()
      .query(
        "SELECT id, name, email, address, zip, city, phone, language, status, role FROM `User`"
      );

    const userArray = result.map((userEntry) => {
      return new UserDTO(userEntry);
    });
    res.send({
      status: "OK",
      data: userArray,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Returns user
 *
 * returns List
 **/
async function getUserById(req, res) {
  try {
    const userId = req.params.userId;
    const [result, fields] = await db
      .promise()
      .query(
        "SELECT id, `User`.name, email, address, zip, city, phone, language, status, role, permissions FROM `User`,`Permission` where id = ? and `Permission`.name = role", [userId]
      );

    const userArray = result.map((userEntry) => {
      return new UserDTO(userEntry);
    });
    res.send({
      status: "OK",
      data: userArray,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Add user
 *
 * body AccountRegistration ConstructionSite object that should be added
 * returns User
 **/
async function addUser(req, res) {
  const accessCodeSQL =
    "Select * FROM `AccessCodes` Where token = ? and reason = 'invitation'";
  const [accessCode, fields] = await db
    .promise()
    .query(accessCodeSQL, [req.body.verificationId]);
 
  if (accessCode.length > 0) {
    const sql = "UPDATE `User` SET ? WHERE email = ?";
    const hash = await bcrypt.hash(req.body.password, environment.saltRounds);
    await db.promise().query(sql, [
      {
        email: req.body.email.toLowerCase().trim(),
        name: req.body.name.trim(),
        address: req.body.address,
        zip: req.body.zip,
        city: req.body.city,
        phone: req.body.phone,
        language: req.body.language,
        password: hash,
        status: 'active'
      },
      accessCode[0].email,
    ]);

    const deleteInvitationSql = `DELETE FROM AccessCodes WHERE token = ?`;
    db.query(deleteInvitationSql,[req.body.verificationId]);
    res.send({
      status: "OK",
    });
    let text = {
        de: `${req.body.name} ist nun Teil des Teams`,
        en: `${req.body.name} is now part of the team`,
    
      }
    if(text) {
      createNotification('person_add',text, new Date().toISOString());
    }
  } else {
    res.status(500).send({ status: "verificationId is wrong or expired" });
  }
}

/**
 * Update user
 * Update user
 *
 * body ConstructionSite updated user object
 * userId Long ID of constructionSite
 * returns User
 **/
async function updateUser(req, res) {
  try {
    const userId = req.params.userId;
    const user = new UserDTO(req.body);
    user.id = userId;
    let hash = null;
    if (req.body.password) {
      hash = await bcrypt.hash(req.body.password, environment.saltRounds);
    }

    const sql = "UPDATE User SET ? WHERE id = ? ";
    const [updatedUsers, fields] = await db.promise().query(sql, [
      req.body.password
        ? { password: hash }
        : 
           req.body
          ,
      userId,
    ]);
    if (updatedUsers.changedRows === 0) {
      throw "couldn't update User";
    }
    if(req.body.password){
      res.send({
        status: "OK"
      });
    } else {
      res.send({
        status: "OK",
        data: user,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(400).send({ status: "verificationId is wrong or expired" });
  }
}

/**
 * Delete user by ID
 * Deletes user
 *
 * userId Long ID of user
 * no response value expected for this operation
 **/
async function deleteUser(req, res) {
  try {
    const userId = req.params.userId;

    const sql = `Select email, name FROM User WHERE id = ?`;
    let [results, fields] = await db.promise().query(sql, [userId]);

    if (results.length === 0) {
      return res.status(404).send("user not found");
    }
    const userEmail = results[0].email;
    const userName = results[0].name;

    const deleteUserSql = `DELETE FROM User WHERE id = ?`;
    [results, fields] = await db.promise().query(deleteUserSql, [userId]);
    if (results.affectedRows === 0) {
      throw "couldn't delete user";
    }

    const deleteInvitations = `DELETE FROM AccessCodes WHERE email = ?`;
    [results, fields] = await db
      .promise()
      .query(deleteInvitations, [userEmail]);

    res.send({
      status: "DELETED",
    });
    let text = {
      de: `Benutzer '${userName}' wurde entfernt`,
      en: `User '${userName}' was removed`,
    }
    createNotification('person_remove',text, new Date().toISOString());
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
}

module.exports = router;
