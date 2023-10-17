const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { body, validationResult } = require("express-validator");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});


const fileFilter = (req, file, cb) => {
  // mengecek jenis file yang diizinkan (jpg, png, dan pdf)
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Jenis file tidak diizinkan"), false);
  }
};


const upload = multer({ storage: storage, fileFilter: fileFilter });
const connection = require("../config/db");

router.get("/", function (req, res) {
  connection.query("SELECT a.nama, b.nama_jurusan AS jurusan FROM mahasiswa a JOIN jurusan b ON b.id_j = a.id_jurusan ORDER BY a.id_m DESC", function (err, rows) {
    if (err) {
      return res.status(500).json({ status: false, message: "Server Error" });
    } else {
      return res.status(200).json({ status: true, message: "Data Mahasiswa", data: rows });
    }
  });
});

router.post(
  "/store",
  upload.fields([{ name: 'gambar', maxCount: 1 }, { name: 'swa_foto', maxCount: 1 }]),
  [
    body("nama").notEmpty(),
    body("nrp").notEmpty(),
    body("id_jurusan").notEmpty(), // Menambahkan validasi untuk id_jurusan (foreign key)
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }
    let Data = {
      nama: req.body.nama,
      nrp: req.body.nrp,
      id_jurusan: req.body.id_jurusan,
      gambar: req.files.gambar[0].filename, 
      swa_foto: req.files.swa_foto[0].filename 
    };
    connection.query("INSERT INTO mahasiswa SET ?", Data, function (err, rows) {
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
  }
);

router.get("/(:id)", function (req, res) {
  let id = req.params.id;
  connection.query(`select * from mahasiswa where id_m = ${id}`, function (err, rows) {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
      });
    }
    if (rows.length <= 0) {
      return res.status(408).json({
        status: false,
        message: "not found",
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "data mahasiswa",
        data: rows[0],
      });
    }
  });
});

router.patch(
  "/update/:id",
  upload.fields([{ name: 'gambar', maxCount: 1 }, { name: 'swa_foto', maxCount: 1 }]),
  [
    body("nama").notEmpty(),
    body("nrp").notEmpty(),
    body("id_jurusan").notEmpty(), // Menambahkan validasi untuk id_jurusan (foreign key)
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }

    const id = req.params.id;

    connection.query(`SELECT * FROM mahasiswa WHERE id_m = ${id}`, function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server Error",
        });
      }
      if (rows.length === 0) {
        return res.status(404).json({
          status: false,
          message: "Not Found",
        });
      }

      const gambarLama = rows[0].gambar;
      const swaFotoLama = rows[0].swa_foto;

      const gambar = req.files['gambar'] ? req.files['gambar'][0].filename : null;
      const swa_foto = req.files['swa_foto'] ? req.files['swa_foto'][0].filename : null;

      // Hapus file lama jika ada
      if (gambarLama && gambar) {
        const pathGambar = path.join(__dirname, '../public/img', gambarLama);
        fs.unlinkSync(pathGambar);
      }

      if (swaFotoLama && swa_foto) {
        const pathSwaFoto = path.join(__dirname, '../public/img', swaFotoLama);
        fs.unlinkSync(pathSwaFoto);
      }

      let Data = {
        nama: req.body.nama,
        nrp: req.body.nrp,
        id_jurusan: req.body.id_jurusan, // Menambahkan id_jurusan (foreign key)
        gambar: gambar,
        swa_foto: swa_foto,
      };

      connection.query(`UPDATE mahasiswa SET ? WHERE id_m = ${id}`, Data, function (err, rows) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "Server Error",
          });
        } else {
          return res.status(200).json({
            status: true,
            message: "Data Berhasil Diubah!",
          });
        }
      });
    });
  }
);



router.delete("/delete/:id", (req, res) => {
  let id = req.params.id;

  connection.query(`SELECT * FROM mahasiswa WHERE id_m = ${id}`, (err, rows) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
      });
    }
    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Data Not Found",
      });
    }
    const gambarLama = rows[0].gambar;
    const swa_fotoLama = rows[0].swa_foto;

    // Hapus file lama jika ada
    if (gambarLama) {
      const pathGambarLama = path.join(__dirname, '../public/img', gambarLama);
      if (fs.existsSync(pathGambarLama)) {
        fs.unlinkSync(pathGambarLama);
      }
    }
    if (swa_fotoLama) {
      const pathSwaFotoLama = path.join(__dirname, '../public/img', swa_fotoLama);
      if (fs.existsSync(pathSwaFotoLama)) {
        fs.unlinkSync(pathSwaFotoLama);
      }
    }

    connection.query(`DELETE FROM mahasiswa WHERE id_m = ${id}`, (err, rows) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server Error",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Data Berhasil Dihapus!",
        });
      }
    });
  });
});


module.exports = router;
