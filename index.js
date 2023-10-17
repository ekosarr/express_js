const express = require("express");
const app = express();
const port = 3000;

// membuat route baru dengan method GET yang isinya kalimat halo dek
const bodyPs = require("body-parser");
app.use(bodyPs.urlencoded({ extended: false }));
app.use(bodyPs.json());
const cors = require('cors')

app.use(cors())
// import route posts
const mhsRouter = require("./routes/mahasiswa");
app.use("/api/mhs", mhsRouter);

const jurusanRouter = require("./routes/jurusan");
app.use("/api/jurusan", jurusanRouter);

app.listen(port, () => {
  console.log(`aplikasi berjalan di http://localhost:${port}`);
});
