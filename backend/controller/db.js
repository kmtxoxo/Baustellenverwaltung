"use strict";

var mysql = require("mysql2");
var environment = require("../environment");

var connection = mysql.createPool({
  host: environment.databaseHost,
  user: environment.databaseUser,
  database: environment.databaseName,
  password: environment.databasePassword,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

connection.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    }
  } else {
    console.log("Connected to Mysql-Database");
  }
});

/* 
* Delete Invitations that are older than 7 days
* (function runs every 12 hours)
*/
async function deleteOldInvitations() {
  try {
    console.log('trying to delete old invitations...')
    let deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() - 7);
    const sql = `Select email FROM AccessCodes WHERE createdAt < ? and reason = "invitation"`;
    let [results, fields] = await connection.promise().query(sql,[deleteDate]);
    let userEmails = results.map((entry)=> entry.email)

    if(userEmails.length > 0) {
      const deleteUserSql = `DELETE FROM User WHERE email IN (?)`;
      [results, fields] = await connection.promise().query(deleteUserSql,[userEmails]);

      const deleteInvitations = `DELETE FROM AccessCodes WHERE createdAt < ?`;
      [results, fields] = await connection.promise().query(deleteInvitations,[deleteDate]);
      console.log('deleted old invitations');
    }else {
      console.log('no old invitations found.');
    }
  } catch (e) {
    console.log('could not delete old invitations!');
    console.log(e);
  }
}

async function createNotification(type, text, timestamp, constructionSiteId = null) {

  /*
  types= [
    'access_time',  //arbeitszeit
    'person_add', // einladung, Account erstellung
    'person_remove', // Benutzer wurde gelöscht/einladung zurückgezogen
    'check_box', // Aufgabe
    'build', // Baustelle & Werkzeug
  ]
  */
 try {
  
  const sql =
      "INSERT INTO Notification (type, text, timestamp, constructionSiteId) VALUES (?) ";
    const [result, fields] = await connection
      .promise()
      .query(sql, [
        [
          type,
          JSON.stringify(text),
          timestamp,
          constructionSiteId
        ],
      ]);
  } catch (e) {
    console.log('Notification could not be created');
  }
}

deleteOldInvitations();
setInterval(deleteOldInvitations, ( 1000 * 60 * 60 * 12));
module.exports = {db:connection, createNotification};
