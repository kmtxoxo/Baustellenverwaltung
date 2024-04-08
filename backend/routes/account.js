"use strict";
const nodemailer = require("nodemailer");
const {db, createNotification} = require("../controller/db");
const UserDTO = require("../models/userDTO");
const { v4: uuidv4 } = require("uuid");
const environment = require("../environment");
const baseUrl = `${environment.base_url}`;
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const fs = require('fs')
const path = require("path");
const auth = require('../controller/auth');
const permission = require('../controller/permission');

let express = require("express");
let router = express.Router({ mergeParams: true });

/** Routes **/
router.post("/account/login",login);
router.post("/account/reset", resetUser);
router.put("/account/password",updatePassword);
router.post( "/account/invite",auth.verifyToken, permission.verifyPermission, inviteUser);


var transporter = nodemailer.createTransport({
  host: environment.serviceMailHost,
  port: environment.serviceMailPort,
  secure: false,
  ignoreTLS: false,
  auth: {
    user: environment.serviceMailAddress,
    pass: environment.serviceMailPassword,
  },
});

/**
 * Invite a User
 *
 * body AccountInvite Email,Name and Role of Person that you want to invite
 * no response value expected for this operation
 **/
async function inviteUser(req, res) {
  try {
    const token = uuidv4();
    const invitedUser = new UserDTO(req.body);
    invitedUser.status = "invited";
    const userSQL =
      "INSERT INTO `User`( `name`, `email`, `status`, `role`) VALUES (?)";
    const [rows, fields] = await db
      .promise()
      .query(userSQL, [
        [
          invitedUser.name,
          invitedUser.email,
          invitedUser.status,
          invitedUser.role,
        ],
      ]);

    invitedUser.id = rows.insertId;

    const deleteInvitationSQL = "DELETE FROM `AccessCodes` WHERE email = ?";
    await db.promise().query(deleteInvitationSQL, [[invitedUser.email]]);

    const invitationSQL =
      "INSERT INTO AccessCodes (token, email, reason, createdAt, permission) VALUES (?)";
    await db
      .promise()
      .query(invitationSQL, [
        [token, invitedUser.email, "invitation", new Date(), invitedUser.role],
      ]);

    var mailOptions = {
      from: environment.serviceMailAddress,
      to: req.body.email,
      subject: "Einladung zu Baustellenverwaltung",
      text:
        "Sie wurden zur Baustellenverwaltung eingeladen.\n Erstellen sie einen Account über folgenden Link:\n " +
        baseUrl +
        "?verificationId=" +
        token,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    console.log(
      "E-Mail Verification_Id: " +
        token +
        ", for Mitarbeiter: " +
        invitedUser.name
    );
    res.send({
        status: "OK",
        data: new UserDTO(invitedUser)
      });
      let text = {
        de: `${invitedUser.name} wurde eingeladen`,
        en: `${invitedUser.name} has been invited`,
      }
      createNotification('person_add',text, new Date().toISOString());
  } catch (e) {
    console.log(e);
    res.status(500).send({
        status: "error - couldn't create User",
      });
  }
};

/**
 * Request account reset
 *
 * body AccountReset Email of registered Account that requests to reset his Login information
 * returns ConstructionSite
 **/
async function resetUser(req, res) {
  try {
    const token = uuidv4();
    const userSQL = "Select * FROM `User` Where email = ?";
    const [foundUsers, fields] = await db
      .promise()
      .query(userSQL, [[req.body.email]]);
    if (foundUsers.length > 0) {
      const deleteInvitationSQL = "DELETE FROM `AccessCodes` WHERE email = ?";
      await db.promise().query(deleteInvitationSQL, [[req.body.email]]);

      const invitationSQL =
        "INSERT INTO AccessCodes (token, email, reason, createdAt) VALUES (?)";
      await db
        .promise()
        .query(invitationSQL, [[token, req.body.email, "reset", new Date()]]);

      console.log("E-Mail Reset-Verification_Id: " + token + " sent");
      var mailOptions = {
        from: environment.serviceMailAddress,
        to: req.body.email,
        subject: "Passwort zurücksetzen",
        text:
          "Hallo \nEs wurde angefordert Ihr Passwort zurück zu setzen. Wenn diese Anfrage nicht von ihnen kommt, ignorieren sie diese.\n Setzen Sie ihr Passwort über folgenden Link zurück:\n " +
          baseUrl +
          "?resetId=" +
          token,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("failed to send mail");
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.send({
        status: "OK",
      });
    } else {
      throw { status: "not Found" };
    }
  } catch (e) {
    res.status(400).send(e);
  }
};

/**
 * Update user password
 *
 * body AccountUpdatedPassword Object needs to contain new Password and resetId
 * no response value expected for this operation
 **/
async function updatePassword(req, res) {
  try {
    const accessCodeSQL =
      "Select * FROM `AccessCodes` Where token = ? and reason = 'reset'";
    const [accessCode, fields] = await db
      .promise()
      .query(accessCodeSQL, [[req.body.resetId]]);

    if (accessCode.length > 0) {
      const hash = await bcrypt.hash(req.body.password, environment.saltRounds);

      const sql = "UPDATE User SET ? WHERE email = ?";
      const [updatedUsers, fields] = await db.promise().query(sql, [{password: hash}, accessCode[0].email]);

      if(updatedUsers.changedRows > 0 ) {
          const sql = `DELETE FROM AccessCodes WHERE token = ?`;
          await db.promise().query(sql,[[req.body.resetId]]);
          res.send({
            status: "OK",
          });
      } else {
        throw 'failed to update user password';
      }
    } else {
        throw 'resetId is wrong';
    }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

/**
 * Login
 *
 * body needs to contain password and email
 * authentication token will be returned
 **/
async function login(req, res) {

  try {
    const sql = "Select * from `User` WHERE email = ?";
    const [result, fields] = await db.promise().query(sql, [req.body.email]);
    if (result.length === 0) {
      throw 'invalid password/username';
    }

    const passwordIsValid = await bcrypt.compare(
    req.body.password,
      result[0].password
    );

    if (passwordIsValid) {
      var privateKey = fs.readFileSync(path.resolve(__dirname, '../private.key'));
      const token = jwt.sign({ email: result[0].email, name: result[0].name, role: result[0].role,status:result[0].status, userId:result[0].id }, privateKey, { algorithm: 'RS256',expiresIn:environment.jwt_ExpirationTime});
 
      res.send({
        status: 200,
        data: {accessToken: token}
      });
    } else {
      throw 'invalid password/username';
    }
  } catch (e) {
    console.log(e);
    res.status(403).send('Email or password are wrong');
  }
};

module.exports = router;