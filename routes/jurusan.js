const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");

const connection = require("../config/db");

router.get('/(:id)', function  (req, res){
    let id = req.params.id;
    connection.query(`select * from jurusan where id_j = ${id}`, function (err, rows) {
      if(err){
        return res.status(500).json({
          status: false,
          message: "Server Error",
        })
      }
      if(rows.length <=0){
        return res.status(408).json({
          status: false,
          message: "not found",
        })
      }else{
        return res.status(200).json({
          status: true,
          message: "data jurusan",
          data: rows[0]
        })
      }
    })
  });

  router.post("/store", [
    body("id_j").notEmpty(),
    body("nama_jurusan").notEmpty(),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }
    let Data = {
      id_j: req.body.id_j,
      nama_jurusan: req.body.nama_jurusan,
    };
    connection.query("INSERT INTO jurusan SET ?", Data, function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server Error",
        });
      } else {
        return res.status(201).json({
          status: true,
          message: "Success!",
          data: rows[0],
        });
      }
    });
  });

  router.patch("/update/:id", [
    body("nama_jurusan").notEmpty(),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }
  
    let id = req.params.id;
    let Data = {
      nama_jurusan: req.body.nama_jurusan
    };
  
    connection.query("UPDATE jurusan SET ? WHERE id_j = ?", [Data, id], function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server Error",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Update Success!",
        });
      }
    });
  });
  
  router.delete("/:id", (req, res) => {
    const id = req.params.id;
    const sqlQuery = "DELETE FROM jurusan WHERE id_j = ?";
  
    connection.query(sqlQuery, [id], (err, result) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server Error",
          error: err
        });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: false,
          message: "Data not found"
        });
      }
  
      return res.status(200).json({
        status: true,
        message: "Data data berhasil dihapus"
      });
    });
  });
  

module.exports = router;