"use strict";
const {db, createNotification} = require("../controller/db");
const ConstructionSiteDTO = require("../models/constructionSiteDTO");
const auth = require("../controller/auth");
const permission = require("../controller/permission");
const fs = require("fs");
const path = require("path");
var multer  = require('multer');
const { v4: uuidv4 } = require("uuid");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname))
  }
});
var upload = multer({storage: storage})
let express = require("express");
let router = express.Router({ mergeParams: true });

/** Routes **/
router.get(
  "/constructionSite",
  auth.verifyToken,
  permission.verifyPermission,
  getConstructionSites
);
router.get(
  "/constructionSite/:constructionSiteId",
  auth.verifyToken,
  permission.verifyPermission,
  getConstructionSiteById
);
router.post(
  "/constructionSite",
  auth.verifyToken,
  permission.verifyPermission,
  addConstructionSite
);
router.post(
  "/constructionSite/:constructionSiteId/image",
  auth.verifyToken,
  permission.verifyPermission,
  upload.array('images',5),
  uploadImageToConstructionSite
);
router.put(
  "/constructionSite/:constructionSiteId",
  auth.verifyToken,
  permission.verifyPermission,
  updateConstructionSite
);
router.delete(
  "/constructionSite/:constructionSiteId",
  auth.verifyToken,
  permission.verifyPermission,
  deleteConstructionSite
);
router.post(
  "/constructionSite/:constructionSiteId/worker",
  auth.verifyToken,
  permission.verifyPermission,
  addWorker
);
router.delete(
  "/constructionSite/:constructionSiteId/worker/:workerId",
  auth.verifyToken,
  permission.verifyPermission,
  removeWorker
);

router.get(
  "/constructionSite/:constructionSiteId/image",
  auth.verifyToken,
  permission.verifyPermission,
  getConstructionSiteImages
)

/**
 * Add constructionSite
 *
 * body ConstructionSite ConstructionSite object that should be added
 * returns ConstructionSite
 **/
async function addConstructionSite(req, res) {
  try {

    const constructionSite = new ConstructionSiteDTO(req.body);

    constructionSite.modifiedAt = new Date().toISOString();
    constructionSite.status = 'open';
    constructionSite.createdBy = {
      user: req.name,
      userId: req.userId
    };

    const sql =
      "INSERT INTO ConstructionSite (name, status, createdBy, customerName, customerEmail, customerZip, customerCity, customerPhone, customerAddress, modifiedAt) VALUES  (?)";

    const [result, fields] = await db
      .promise()
      .query(sql, [
        [
          constructionSite.name,
          constructionSite.status,
          JSON.stringify(constructionSite.createdBy),
          constructionSite.contact.name,
          constructionSite.contact.email,
          constructionSite.contact.zip,
          constructionSite.contact.city,
          constructionSite.contact.phone,
          constructionSite.contact.address,
          constructionSite.modifiedAt,
        ],
      ]);
    constructionSite.id = result.insertId;
    res.send({
      status: "OK",
      data: constructionSite,
    });
    let text = {
      de: `${req.name} hat Baustelle "${constructionSite.name.length > 30?constructionSite.name.slice(0,27)+'...':constructionSite.name}" angelegt`,
      en: `${req.name} has created Construction site "${constructionSite.name.length > 30?constructionSite.name.slice(0,27)+'...':constructionSite.name}"`,
    }
    createNotification('build',text, new Date().toISOString(),constructionSite.id);
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Delete construction site by ID
 * Deletes construction Site
 *
 * constructionSiteId Long ID of constructionSite
 * no response value expected for this operation
 **/
async function deleteConstructionSite(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const sql = `DELETE FROM ConstructionSite WHERE id = ?`;

    const [result, fields] = await db.promise().query(sql, [constructionSiteId]);
    if (result.affectedRows === 0) {
      throw "couldn't delete construction Site";
    }
    res.send({
      status: "DELETED",
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Returns all construction sites
 * Returns a array of all construction sites
 *
 * returns List
 **/
async function getConstructionSites(req, res) {
  try {
    let sql = '';
    if(req.role == 'admin'){
      sql = `SELECT c.id, c.name, modifiedAt, c.status, createdBy, customerName, customerEmail,
      customerAddress, customerZip, customerCity, customerPhone, u.name as workername, u.email as workeremail, u.id as userId
      FROM ConstructionSite as c, ConstructionSiteWorker as w, User as u
      WHERE c.id = w.constructionSiteId and u.id = w.userId ORDER BY c.modifiedAt DESC`;
    } else {
      sql = `SELECT c.id, c.name, modifiedAt, c.status, createdBy, customerName, customerEmail,
      customerAddress, customerZip, customerCity, customerPhone, u.name as workername, u.email as workeremail, u.id as userId
      FROM ConstructionSite as c, ConstructionSiteWorker as w, User as u
      WHERE c.id = w.constructionSiteId and u.id = w.userId and u.id = ? ORDER BY c.modifiedAt DESC`;
    }
    const [result, fields] = await db.promise().query(sql,[req.userId]);

    const constructionSites = result.reduce(function (carry, item) {
      if (!carry[item.id]) {
        carry[item.id] = new ConstructionSiteDTO(item);
        carry[item.id].users = [
          {
            userId: item.userId,
            name: item.workername,
            email: item.workeremail,
          },
        ];
      } else {
        carry[item.id].users.push({
          userId: item.userId,
          name: item.workername,
          email: item.workeremail,
        });
      }
      return carry;
    }, {});

    res.send({
      status: "OK",
      data: Object.values(constructionSites),
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Return constructionSite 
 *
 * returns List
 **/
async function getConstructionSiteById(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const sql = `SELECT c.id, c.name, modifiedAt, c.status, createdBy, customerName, customerEmail,
      customerAddress, customerZip, customerCity, customerPhone, u.name as workername, u.email as workeremail, u.id as userId
      FROM ConstructionSite as c, ConstructionSiteWorker as w, User as u
      WHERE c.id = ? and w.constructionSiteId = ? and u.id = w.userId `;
    const [result, fields] = await db.promise().query(sql, [constructionSiteId,constructionSiteId]);


    const constructionSites = result.reduce(function (carry, item) {
      if (!carry[item.id]) {
        carry[item.id] = new ConstructionSiteDTO(item);
        carry[item.id].users = [
          {
            userId: item.userId,
            name: item.workername,
            email: item.workeremail,
          },
        ];
      } else {
        carry[item.id].users.push({
          userId: item.userId,
          name: item.workername,
          email: item.workeremail,
        });
      }
      return carry;
    }, {});

    res.send({
      status: "OK",
      data: Object.values(constructionSites),
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Update constructionSite
 * Update Construction site
 *
 * body ConstructionSite ConstructionSite object that should be added
 * constructionSiteId Long ID of constructionSite
 * returns ConstructionSite
 **/
async function updateConstructionSite( req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const constructionSite = new ConstructionSiteDTO(req.body);
    constructionSite.modifiedAt = new Date().toISOString();

    const sql = "UPDATE ConstructionSite SET ? WHERE id = ?";

    const [result, fields] = await db.promise().query(sql, [
      {
        name: constructionSite.name,
        status: constructionSite.status,
        customerName: constructionSite.contact.name,
        customerEmail: constructionSite.contact.email,
        customerZip: constructionSite.contact.zip,
        customerCity: constructionSite.contact.city,
        customerPhone: constructionSite.contact.phone,
        customerAddress: constructionSite.contact.address,
        modifiedAt: constructionSite.modifiedAt,
      },
      constructionSiteId,
    ]);

    constructionSite.id = constructionSiteId;
    if (result.changedRows === 0) {
      throw "couldn't update construction site";
    }
    res.send({
      status: "OK",
      data: constructionSite,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * uploads an image
 *
 * constructionSiteId Long ID of constructionSiteId
 * no response value expected for this operation
 **/
async function uploadImageToConstructionSite(req, res) {
  const constructionSiteId = req.params.constructionSiteId;
  try {

    if(req.files && constructionSiteId){

      let imageSqlArray = []
      const images = req.files.map((image)=> {
        imageSqlArray.push([image.filename,constructionSiteId]);
        return image.filename;
      });

      const sql =
      "INSERT INTO ConstructionSiteImage (imagename, constructionSiteId) VALUES  (?)";
      await db.promise().query(sql, imageSqlArray);

      res.send({
        status: "OK",
        data: images
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
}



/**
 * uploads an image
 *
 * constructionSiteId Long ID of constructionSiteId
 * no response value expected for this operation
 **/
async function getConstructionSiteImages(req, res) {
  const constructionSiteId = req.params.constructionSiteId;
  try {

      const sql = "Select imagename, constructionSiteId FROM ConstructionSiteImage WHERE constructionSiteId = ?";
      const[ results, fields] = await db.promise().query(sql, [constructionSiteId]);

      const images = results.map((image)=> {
        return image.imagename;
      });
      res.send({
        status: "OK",
        data: images
      });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
}

/**
 * Add worker to constructionSite
 *
 * constructionSiteId Long ID of constructionSiteId
 * accepts array of userIds that should be added to construction Site
 **/
async function addWorker(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const workers = req.body.map((entry) => {
      return [entry, constructionSiteId];
    });

    const sql =
      "INSERT INTO ConstructionSiteWorker (userId, constructionSiteId) VALUES  (?)";
    await db.promise().query(sql, workers);

    const getUpdatedConstructionSite =
      "SELECT u.name as workername, u.email as workeremail, u.id as userId FROM `ConstructionSite` as c, `ConstructionSiteWorker` as w, `User` as u WHERE c.id = ? and w.constructionSiteId = ? and u.id = w.userId";

    const [
      result,
      fields,
    ] = await db
      .promise()
      .query(getUpdatedConstructionSite, [
        constructionSiteId,
        constructionSiteId,
      ]);

    const UpdatedUsers = result.map((item) => {
      return {
        userId: item.userId,
        name: item.workername,
        email: item.workeremail,
      };
    });
    res.send({
      status: "OK",
      data: UpdatedUsers,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Add worker to constructionSite
 *
 * constructionSiteId Long ID of constructionSiteId
 * accepts array of userIds that should be added to construction Site
 **/
async function removeWorker(req, res) {
  try {
    const constructionSiteId = parseInt(req.params.constructionSiteId);
    const workerId = parseInt(req.params.workerId);


    let sql =
    "select * FROM ConstructionSiteWorker WHERE constructionSiteId = ?";
    let [results, fields] = await db.promise().query(sql, [constructionSiteId]);

    if(results.length === 1 ) {
      throw 'can not remove last worker from construction site';
    }

    sql =
      "DELETE FROM ConstructionSiteWorker WHERE userId = ? and constructionSiteId = ?";
    [results, fields] = await db.promise().query(sql, [workerId, constructionSiteId]);

    if (results.affectedRows === 0) {
      throw "couldn't remove Worker";
    }

    sql =
    'UPDATE `Task` SET `assignedTo` = ? WHERE `assignedTo`->"$.userId" = ? and `constructionSiteId` = ?';
    [results, fields] = await db.promise().query(sql, [ JSON.stringify({ "user": null, "userId": null }), workerId, constructionSiteId]);

    res.send({
      status: "DELETED",
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

module.exports = router;
