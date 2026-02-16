require('dotenv').config();

const express = require("express");
const fs = require("fs");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT||3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // for HTML + JS + CSS

// Transporter (dummy, you can configure your Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ===== DATA FUNCTIONS =====
function readData() {
  return JSON.parse(fs.readFileSync("members.json", "utf-8"));
}

function saveData(data) {
  fs.writeFileSync("members.json", JSON.stringify(data, null, 2));
}

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/data", (req, res) => {
  res.send(readData());
});

app.post("/add-solo", (req, res) => {
  const data = readData();
  data.solo.push({
    name: req.body.name,
    birthday: req.body.birthday,
    email: req.body.email
  });
  saveData(data);
  res.send("Solo member added!");
});

app.post("/add-group", (req, res) => {
  const data = readData();
  const group = {
    groupName: req.body.groupName,
    members: req.body.members
  };
  data.groups.push(group);
  saveData(data);
  res.send("Group added!");
});

app.post("/save-all", (req, res) => {
    fs.writeFileSync("members.json", JSON.stringify(req.body, null, 2));
    res.send("updated");
});


app.post("/delete-solo", (req, res) => {
    const data = readData();
    data.solo.splice(req.body.index, 1);
    saveData(data);
    res.send("Deleted");
});

// Delete group
app.post("/delete-group", (req, res) => {
    const data = readData();
    data.groups.splice(req.body.index, 1);
    saveData(data);
    res.send("Deleted");
});

// Delete group member
app.post("/delete-group-member", (req, res) => {
    const data = readData();
    const gIndex = req.body.gIndex;
    const mIndex = req.body.mIndex;
    data.groups[gIndex].members.splice(mIndex, 1);
    saveData(data);
    res.send("Deleted");
});

// ===== BIRTHDAY EMAILS =====
function sendBirthdayEmails() {
  const data = readData();
  const today = new Date();
  const todayStr = `${today.getMonth()+1}-${today.getDate()}`;

  // solo members
  data.solo.forEach(member => {
    const bday = new Date(member.birthday);
    const bdayStr = `${bday.getMonth()+1}-${bday.getDate()}`;
    if (bdayStr === todayStr) {
      transporter.sendMail({
        from: "yourgmail@gmail.com",
        to: member.email,
        subject:"Birthday Reminder 🎉🎂",
        text:`Today is ${member.name}'s birthday 🎂 send your wishes🥂🥳`
      });
    }
  });

  // group members
  data.groups.forEach(group => {
    group.members.forEach(birthdayMember => {
      const bday = new Date(birthdayMember.birthday);
      const bdayStr = `${bday.getMonth()+1}-${bday.getDate()}`;
      if (bdayStr === todayStr) {
        group.members.forEach(other => {
          if(other.email !== birthdayMember.email){
            transporter.sendMail({
              from: "yourgmail@gmail.com",
              to: other.email,
              subject: "Birthday Reminder 🎉🎂",
              text: `Today is ${birthdayMember.name}'s birthday 🎂!`
            });
          }
        });
      }
    });
  });

  console.log("Birthday check completed.");
}

// run every midnight
cron.schedule("0 21 * * *", sendBirthdayEmails);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));


