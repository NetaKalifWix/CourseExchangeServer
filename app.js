const fs = require("fs");
const fsPromises = require("fs").promises;
const Database = require("./db_utils");
const { log } = require("console");
const cors = require("cors");
const express = require("express");
const CourseExchangeGraph = require("./logic");
const mailHandle = require("./mail"); //TODO
const app = express();
app.use(express.json());
app.use(cors());
var db, courses, exchanges;

const emailsToAuthKeys = {};
const generateAuthKey = () => {
  let authKey = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    authKey += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return authKey;
}

app.get("/", async (req, res) => {
  console.log("get from ", req.get('host')," to /");
  exchanges = await db.get();
  return res.status(200).send({ exchanges, courses });
});

app.post("/login", async (req, res) => {
  // console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;
  if (emailsToAuthKeys[email] === password) {
    return res.status(200).send({ success: true});
  }
  return res.status(200).send({ success: false });
});

app.post("/getAuthKey", async (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  // - save auth
  const authKey = generateAuthKey();
  emailsToAuthKeys[email] = authKey;
  // - send email to user with auth key
  mailHandle.sendAuthKey(authKey ,email); //TODO
  return res.status(200).send({ success: true });
});

app.get("/cycles", async (req, res) => {
  console.log("get from ", req.get('host')," to /cycles");
  exchanges = await db.get();
  let cycles = CourseExchangeGraph.fromExchanges(exchanges).findCycles();
  return res.status(200).send(cycles);
});

app.patch("/delete", async (req, res) => {
  console.log("get from ", req.get('host')," to /delete");
  await db.delete({
    ...req.body.toDelete,
    currentcourse: req.body.toDelete.currentCourse,
    desiredcourse: req.body.toDelete.desiredCourse,
  });
  exchanges = await db.get();
  return res.status(200).send(exchanges);
});

app.patch("/add", async (req, res) => {
  console.log("get from ", req.get('host')," to /add");
  await db.add({
    currentcourse: req.body.exchange.currentCourse,
    desiredcourse: req.body.exchange.desiredCourse,
    name: req.body.exchange.name,
    phone: req.body.exchange.phone,
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
  console.log("get from ", req.get('host')," to /reset_db");
  res.send(await db.run_query("DELETE FROM exchanges"));
});

app.get("/backup", async (req, res) => {
  console.log("get from ", req.get('host'), " to /backup");
  const Readable = require("stream").Readable;
  const stream = new Readable();
  res.set({
    "Content-Disposition": `attachement; filename=${filename}`,
    "Content-Type": "application/octet-stream",
  });
  stream.pipe(res);
  stream.push(JSON.stringify(await db.get()));
  stream.push(null);
});

app.listen(80, '0.0.0.0' , async () => {
  db = await Database.connect();
  courses = await readFile("courses");
  console.log("server started");
});