const fs = require("fs");
const fsPromises = require("fs").promises;
const Database = require("./db_utils");
const { log } = require("console");
const cors = require("cors");
const express = require("express");
const CourseExchangeGraph = require("./logic");
const app = express();
app.use(express.json());
app.use(cors());
var db, courses, exchanges;
app.get("/", async (req, res) => {
  exchanges = await db.get();
  return res.status(200).send({ exchanges, courses });
});
app.get("/cycles", async (req, res) => {
  exchanges = await db.get();
  let cycles = CourseExchangeGraph.fromExchanges(exchanges).findCycles();
  return res.status(200).send(cycles);
});
app.patch("/delete", async (req, res) => {
  await db.delete({...req.body.toDelete,
    currentcourse: req.body.toDelete.currentCourse,
    desiredcourse: req.body.toDelete.desiredCourse,
  });
  exchanges = await db.get();
  return res.status(200).send(exchanges);
});

app.patch("/add", async (req, res) => {
  await db.add({
    currentcourse: req.body.exchange.currentCourse,
    desiredcourse: req.body.exchange.desiredCourse,
    name: req.body.exchange.name,
    phone: req.body.exchange.phone
  });
  exchanges = await db.get();
  return res.status(200).send(exchanges);
});

const readFile = async (filename) => {
  const dataBuffer = await fsPromises.readFile(filename + ".json");
  const dataJson = dataBuffer.toString();
  return JSON.parse(dataJson);
};

app.get("/reset_db", async (req, res) => {
  res.send(await db.run_query("DELETE FROM exchanges"));
});

app.get("/backup", async (req, res) => {
  const Readable = require('stream').Readable;
  const stream = new Readable();
  res.set({
    "Content-Disposition": `attachement; filename=${filename}`,
    "Content-Type": "application/octet-stream",
  });
  stream.pipe(res);
  stream.push(JSON.stringify(await db.get()));
  stream.push(null);
});

app.listen(80, '0.0.0.0', async () => {
  db = await Database.connect();
  courses = await readFile("courses");
  console.log("server started");
});
