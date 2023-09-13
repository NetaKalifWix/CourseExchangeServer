const fs = require("fs");
const fsPromises = require("fs").promises;
const { log } = require("console");
const cors = require("cors");
const express = require("express");
const CourseExchangeGraph = require("./logic");
const app = express();
app.use(express.json());
app.use(cors());

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
  cycles = graph.findAllCycles();
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
  cycles = graph.findAllCycles();
});
