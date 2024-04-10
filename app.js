const fs = require("fs");
const fsPromises = require("fs").promises;
const { log } = require("console");
const cors = require("cors");
const express = require("express");
const CourseExchangeGraph = require("./logic");
const app = express();
app.use(express.json());
app.use(cors());


const emailsToAuthKeys = {};

const generateAuthKey = () => {
  let authKey = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    authKey += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return authKey;
}

app.get("", (req, res) => {
  return res.status(200).send({ exchanges, courses });
});
app.get("/cycles", (req, res) => {
  return res.status(200).send(cycles);
});
app.patch("/delete", async (req, res) => {
  const toDelete = req.body.toDelete;

  exchanges = exchanges.filter(
    (person) =>
      person.name !== toDelete.name ||
      person.phone !== toDelete.phone ||
      person.currentCourse !== toDelete.currentCourse ||
      person.desiredCourse !== toDelete.desiredCourse
  );
  await fsPromises.writeFile("exchanges.json", JSON.stringify(exchanges));
  graph.deleteExchange(
    toDelete.currentCourse,
    toDelete.desiredCourse,
    toDelete.name,
    toDelete.phone
  );
  cycles = graph.findCycles();
  return res.status(200).send(exchanges);
});

app.patch("/add", async (req, res) => {
  exchanges.push(req.body.exchange);
  await fsPromises.writeFile("exchanges.json", JSON.stringify(exchanges));
  graph.addExchange(
    req.body.exchange.currentCourse,
    req.body.exchange.desiredCourse,
    req.body.exchange.name,
    req.body.exchange.phone
  );
  cycles = graph.findCycles();
  return res.status(200).send(exchanges);
});

const readFile = async (filename) => {
  const dataBuffer = await fsPromises.readFile(filename + ".json");
  const dataJson = dataBuffer.toString();
  return JSON.parse(dataJson);
};

app.get("/backup", async (req, res) => {
  const filename = "exchanges.json";
  const stream = fs.createReadStream(filename);
  res.set({
    "Content-Disposition": `attachement; filename=${filename}`,
    "Content-Type": "application/octet-stream",
  });
  stream.pipe(res);
});

app.post("/login", async (req, res) => {

  // console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;
  // TODO validate user
  if (emailsToAuthKeys[email] === password) {
    // case success
    return res.status(200).send({ success: true});
  }
  //case failure
  return res.status(200).send({ success: false });



});

app.post("/getAuthKey", async (req, res) => {
  // console.log(req.body);
  const email = req.body.email;
  // const name = req.body.name;

  // TODO validate user
  // - send email to user with auth key
  // - save auth

  const authKey = generateAuthKey();
  emailsToAuthKeys[email] = authKey;

  // case success
  return res.status(200).send({ success: true });

  // case failure
  // return res.status(200).send({ success: false });
});




let exchanges, courses, cycles;
const graph = new CourseExchangeGraph();

app.listen(3002, async () => {
  console.log("server started");
  exchanges = await readFile("exchanges");
  courses = await readFile("courses");
  exchanges.map((person) =>
    graph.addExchange(
      person.currentCourse,
      person.desiredCourse,
      person.name,
      person.phone
    )
  );
  cycles = graph.findCycles();
});
