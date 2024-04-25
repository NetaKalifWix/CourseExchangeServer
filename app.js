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
let cycles;

  /*
  ==============================================
              internal functions
  ==============================================
  */

const emailsToAuthKeys = {};
const generateAuthKey = () => {
  let authKey = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    authKey += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return authKey;
}
const readFile = async (filename) => {
  const dataBuffer = await fsPromises.readFile(filename + ".json");
  const dataJson = dataBuffer.toString();
  return JSON.parse(dataJson);
};


  /*
  ==============================================
        user log-in and get data functions
  ==============================================
  */

app.get("/", async (req, res) => {
  // console.log("get from ", req.get('host')," to /");
  exchanges = await db.get();
  courses = await db.get_all_courses();
  return res.status(200).send({ exchanges, courses });
});

app.post("/login", async (req, res) => {
  // console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;
  console.log("/login from name:", req.body.name, " email:", email, " password:", password);
  if (emailsToAuthKeys[email] === password) {
    return res.status(200).send({ success: true, isAdmin: (email==process.env.ADMIN_EMAIL) });
  }
  return res.status(200).send({ success: false, isAdmin: (email==process.env.ADMIN_EMAIL) });
});

// sends auth key to email
// for admin ("admin@gmail.com") auth_key is NetaMetaKeta 
app.post("/getAuthKey", async (req, res) => {
  const email = req.body.email;
  // - save auth
  let isAdmin = false;
  let authKey = generateAuthKey();
  if(email == process.env.ADMIN_EMAIL) {
    isAdmin = true;
    authKey = process.env.ADMIN_PASS;
  }
  emailsToAuthKeys[email] = authKey;
  //log:
  console.log("/getAuthKey from email:", email, " got in return authKey:", authKey);
  // - send email to user with auth key
  try {
    if(!isAdmin){
      mailHandle.sendAuthKey(authKey ,email);
    }
  }
  catch(err) {
    console.log(err.message)
  }
  return res.status(200).send({ success: true, isAdminAns: isAdmin });
});

app.get("/cycles", async (req, res) => {
  // console.log("/cycles from email:", req.body.email);
  // console.log("answear:", cycles);
  return res.status(200).send(cycles);
});

  /*
  ==============================================
                exchanges table
  ==============================================
  */

app.patch("/delete", async (req, res) => {
  console.log("get from ", req.get('host')," to /delete");
  await db.delete({
    ...req.body.toDelete,
    currentcourse: req.body.toDelete.currentCourse,
    desiredcourse: req.body.toDelete.desiredCourse,
  });
  exchanges = await db.get();
  cycles = CourseExchangeGraph.fromExchanges(exchanges).findCycles();
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
  cycles = CourseExchangeGraph.fromExchanges(exchanges).findCycles();
  return res.status(200).send(exchanges);
});

app.delete("/erase_all_exchanges", async (req, res) => {
  console.log("Request from:", req.get('host'), "to /erase_all_exchanges");

  try {
    await db.erase_all_data();
    exchanges = await db.get();
    cycles = CourseExchangeGraph.fromExchanges(exchanges).findCycles();
    return res.status(200).send("All data in the exchanges table erased successfully.");
  } catch (error) {
    console.error("Error erasing data in exchanges table:", error);
    return res.status(500).send("Failed to erase data in exchanges table.");
  }
});

app.get("/reset_db", async (req, res) => {
  console.log("get from ", req.get('host')," to /reset_db");
  res.send(await db.run_query("DELETE FROM exchanges"));
  exchanges = await db.get();
  cycles = CourseExchangeGraph.fromExchanges(exchanges).findCycles();
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


  /*
  ==============================================
                courses table
  ==============================================
  */

app.patch("/add_course", async (req, res) => {
  console.log("Request from:", req.get('host'), "to /add_course ", req.body.course);
  
  // console.log("C = ", req.body.course, " type is =", typeof req.body.course);
  const course = req.body.course;

  // Check if the course is provided
  if (!course) {
    return res.status(400).send("Course data is required.");
  }

  try {
    await db.add_course(course);
    const courses = await db.get_all_courses(); // Get updated list of courses
    exchanges = await db.get();
    cycles = CourseExchangeGraph.fromExchanges(exchanges).findCycles();
    return res.status(200).send(courses);
  } catch (error) {
    console.error("Error adding course:", error);
    return res.status(500).send("Failed to add course.");
  }
});

app.delete("/erase_courses_table", async (req, res) => {
  console.log("Request from:", req.get('host'), "to /erase_courses_table");

  try {
    await db.erase_courses_table();
    exchanges = await db.get();
    cycles = CourseExchangeGraph.fromExchanges(exchanges).findCycles();
    return res.status(200).send("Courses table erased successfully.");
  } catch (error) {
    console.error("Error erasing courses table:", error);
    return res.status(500).send("Failed to erase courses table.");
  }
});

app.delete("/remove_course/:courseName", async (req, res) => {
  console.log("Request from:", req.get('host'), "to /remove_course ", req.params.courseName);

  const courseName = req.params.courseName;

  // Check if the course name is provided
  if (!courseName) {
    return res.status(400).send("Course name is required.");
  }

  try {
    await db.remove_course(courseName);
    const courses = await db.get_all_courses(); // Get updated list of courses
    exchanges = await db.get();
    cycles = CourseExchangeGraph.fromExchanges(exchanges).findCycles();
    return res.status(200).send(courses);
  } catch (error) {
    console.error("Error removing course:", error);
    return res.status(500).send("Failed to remove course.");
  }
});

app.put("/rename_course/:oldCourseName/:newCourseName", async (req, res) => {
  console.log("Request from:", req.get('host'), "to /rename_course ", req.params.oldCourseName, req.params.newCourseName);

  const oldCourseName = req.params.oldCourseName;
  const newCourseName = req.params.newCourseName;

  // Check if both old and new course names are provided
  if (!oldCourseName || !newCourseName) {
    return res.status(400).send("Both old and new course names are required.");
  }

  try {
    await db.rename_course(oldCourseName, newCourseName);
    const courses = await db.get_all_courses(); // Get updated list of courses
    exchanges = await db.get();
    cycles = CourseExchangeGraph.fromExchanges(exchanges).findCycles();
    return res.status(200).send(courses);
  } catch (error) {
    console.error("Error renaming course:", error);
    return res.status(500).send("Failed to rename course.");
  }
});


  /*
  ==============================================
                  listen
  ==============================================
  */

app.listen(3002 , async () => {
  db = await Database.connect();
  exchanges = await db.get();
  cycles = CourseExchangeGraph.fromExchanges(exchanges).findCycles();
  // courses = await readFile("courses"); <- changed it to table and not json
  console.log("server started");
});

