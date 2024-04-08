"use strict";
const { db, createNotification } = require("../controller/db");
const Json2csvParser = require("json2csv").Parser;
const MaterialDTO = require("../models/materialDTO");
const auth = require("../controller/auth");
const permission = require("../controller/permission");

let express = require("express");
let router = express.Router({ mergeParams: true });

/** Routes **/
router.get(
  "/constructionSite/:constructionSiteId/material",
  auth.verifyToken,
  permission.verifyPermission,
  getConstructionSiteMaterials
);
router.post(
  "/constructionSite/:constructionSiteId/material",
  auth.verifyToken,
  permission.verifyPermission,
  addConstructionSiteMaterial
);
router.put(
  "/constructionSite/:constructionSiteId/material/:materialId",
  auth.verifyToken,
  permission.verifyPermission,
  updateConstructionSiteMaterial
);
router.delete(
  "/constructionSite/:constructionSiteId/material/:materialId",
  auth.verifyToken,
  permission.verifyPermission,
  deleteConstructionSiteMaterial
);
router.delete(
  "/material/:materialName",
  auth.verifyToken,
  permission.verifyPermission,
  deleteMaterial
);
router.delete(
  "/unit/:unitName",
  auth.verifyToken,
  permission.verifyPermission,
  deleteUnit
);
router.get(
  "/material",
  auth.verifyToken,
  permission.verifyPermission,
  getMaterials
);
router.get("/unit", auth.verifyToken, permission.verifyPermission, getUnits);

/**
 * Add material to constructionSite
 *
 * body Material Task object that should be added to constructionSite
 * constructionSiteId Long ID of constructionSite
 * returns Material
 **/
async function addConstructionSiteMaterial(req, res) {
  try {

    const constructionSiteId = req.params.constructionSiteId;
    const material = new MaterialDTO(req.body);
    material.modifiedAt = new Date().toISOString();
    material.createdBy = {
      user: req.name,
      userId: req.userId,
    };
    console.log(material);
    const sql =
      "INSERT INTO Material (amount, name, unit, createdBy, modifiedAt, constructionSiteId) VALUES (?) ";
    let [result, fields] = await db
      .promise()
      .query(sql, [
        [
          material.amount,
          material.name,
          material.unit,
          JSON.stringify(material.createdBy),
          material.modifiedAt,
          constructionSiteId,
        ],
      ]);

    // Add Material to Autocomplete
    [
      result,
      fields,
    ] = await db
      .promise()
      .query("INSERT IGNORE INTO `MaterialAutocomplete` (name) VALUES (?) ", [
        [material.name],
      ]);

    if (material.unit) {
      [
        result,
        fields,
      ] = await db
        .promise()
        .query("INSERT IGNORE INTO UnitAutocomplete (name) VALUES (?) ", [
          [material.unit],
        ]);
    }


    material.id = result.insertId;
    let text = {
      de: `${req.name} hat Material "${material.name.length > 30?material.name.slice(0,27)+'...':material.name}" hinzugefügt`,
      en: `${req.name} has added Material "${material.name.length > 30?material.name.slice(0,27)+'...':material.name}"`,
    }
    createNotification('design_services',text, new Date().toISOString(),constructionSiteId);
    res.send({
      status: "OK",
      data: material,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/*
 * get material from Saved materials (Autocomplete)
 *
 **/
async function getMaterials(req, res) {
  try {
    const materialName = req.query.key + "%";

    const sql = `Select name FROM MaterialAutocomplete WHERE name LIKE ? LIMIT 5`;
    const [result, fields] = await db.promise().query(sql, [materialName]);
    const materials = result.map((material) => {
      return material.name;
    });
    res.send({
      status: "OK",
      data: materials,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/*
 * get units from Saved materials (Autocomplete)
 *
 **/
async function getUnits(req, res) {
  try {
    const unitName = req.query.key + "%";
    const sql = `Select name FROM UnitAutocomplete WHERE name LIKE ? LIMIT 5`;
    const [result, fields] = await db.promise().query(sql, [unitName]);
    console.log(result);
    const units = result.map((unit) => {
      return unit.name;
    });
    res.send({
      status: "OK",
      data: units,
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/*
 * Delete material from Saved materials (Autocomplete)
 *
 **/
async function deleteMaterial(req, res) {
  try {
    const materialName = req.params.materialName;

    const sql = `DELETE FROM MaterialAutocomplete WHERE LOWER(name) = ?`;
    const [result, fields] = await db
      .promise()
      .query(sql, [materialName.toLowerCase()]);

    res.send({
      status: "DELETED",
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/*
 * Delete material from Saved materials (Autocomplete)
 *
 **/
async function deleteUnit(req, res) {
  try {
    const unitName = req.params.unitName;

    const sql = `DELETE FROM UnitAutocomplete WHERE LOWER(name) = ?`;
    const [result, fields] = await db
      .promise()
      .query(sql, [unitName.toLowerCase()]);

    res.send({
      status: "DELETED",
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Delete material by ID
 * Deletes material from construction Site
 *
 * constructionSiteId Long ID of constructionSite
 * materialId Long ID of material that needs to be deleted
 * no response value expected for this operation
 **/
async function deleteConstructionSiteMaterial(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const materialId = parseInt(req.params.materialId);

    const sql = `DELETE FROM Material WHERE id = ? and constructionSiteId = ?`;
    const [result, fields] = await db
      .promise()
      .query(sql, [materialId, constructionSiteId]);
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
 * Returns all materials for specified construction sites
 * Returns a array of materials. If content type 'text/csv' is selected a csv file will be returned
 *
 * constructionSiteId Long ID of constructionSite
 * returns List
 **/
async function getConstructionSiteMaterials(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;

    const [
      result,
      fields,
    ] = await db
      .promise()
      .query(
        `SELECT id, name, amount, unit, createdBy, modifiedAt, constructionSiteId FROM Material where constructionSiteId = ? ORDER BY modifiedAt DESC`,
        [constructionSiteId]
      );

    const materialArray = result.map((materialEntry) => {
      return new MaterialDTO(materialEntry);
    });

    res.format({
      "text/csv": () => {
        console.log('csv');
        const csvArray = materialArray.reduce((basket, item) => {
          let itemName = item.name;
          let itemCount = item.amount;
          let itemUnit = item.unit;
          if (!basket[itemName + itemUnit]) {
            basket[itemName + itemUnit] = {
              name: itemName,
              amount: itemCount,
              unit: itemUnit,
            };
          } else {
            basket[itemName + itemUnit].amount += itemCount;
          }

          return basket;
        }, {});
        const fields = [
          {
            label: "Name",
            value: "name",
          },
          {
            label: "Einheit",
            value: "unit",
            default: "",
          },
          {
            label: "Anzahl",
            value: "amount",
          },
        ];
        const json2csvParser = new Json2csvParser({ fields, delimiter: ";" });
        const csv = json2csvParser.parse(Object.values(csvArray));
        res.status(200).attachment("Material.csv").send(csv);
      },
      json: function () {
        res.send({
          status: "OK",
          data: materialArray,
        });
      },
    });
  } catch (e) {
    res.status(500).send(e);
  }
}

/**
 * Update material by ID
 * Update Material
 *
 * body Material Material object that should be added to constructionSite
 * constructionSiteId Long ID of constructionSite
 * materialId Long ID of material that should be updated
 * returns Material
 **/
async function updateConstructionSiteMaterial(req, res) {
  try {
    const constructionSiteId = req.params.constructionSiteId;
    const material = new MaterialDTO(req.body);
    material.modifiedAt = new Date().toISOString();

    const sql =
      "UPDATE Material SET ? WHERE constructionSiteId = ? AND id = ? ";
    let [result, fields] = await db.promise().query(sql, [
      {
        name: material.name,
        amount: material.amount,
        unit: material.unit,
        createdBy: JSON.stringify(material.createdBy),
        modifiedAt: material.modifiedAt,
      },
      constructionSiteId,
      material.id,
    ]);
    if (result.changedRows === 0) {
      throw "couldn't update Material";
    }
    // Update Material/Unit to Autocomplete
    [
      result,
      fields,
    ] = await db
      .promise()
      .query("INSERT IGNORE INTO MaterialAutocomplete (name) VALUES (?) ", [
        [material.name],
      ]);
    if (material.unit) {
      [
        result,
        fields,
      ] = await db
        .promise()
        .query("INSERT IGNORE INTO UnitAutocomplete (name) VALUES (?) ", [
          [material.unit],
        ]);
    }

    let text = {
      de: `${req.name} hat Material "${material.name.length > 30?material.name.slice(0,27)+'...':material.name}" aktualisiert`,
      en: `${req.name} has updated Material "${material.name.length > 30?material.name.slice(0,27)+'...':material.name}"`,
    }
    createNotification('design_services',text, new Date().toISOString(),constructionSiteId);
    res.send({
      status: "OK",
      data: material,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
}

module.exports = router;
