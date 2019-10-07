"use strict";

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require("./config");
const { User, Pet, Checkup } = require("./models");

const app = express();
app.use(express.json());

const { router: authRouter, localStrategy, jwtStrategy } = require("./auth");
const petsRouter = require("./petsRouter");
const usersRouter = require("./usersRouter");
const checkupsRouter = require("./checkupsRouter");

app.use(morgan("common"));

app.use(express.static("public"));

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use("/auth", authRouter);
app.use("/pets", petsRouter);
app.use("/users", usersRouter);
app.use("/checkups", checkupsRouter);

const jwtAuth = passport.authenticate('jwt', {session: false});

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.use('*', (req, res) => {
	return res.status(404).json({ message: 'Not Found' });
});

let server;

function runServer(databaseUrl, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(
			databaseUrl,
			err => {
				if (err) {
					return reject(err);
				}
				server = app
					.listen(port, () => {
						console.log(`Your app is listening on port ${port}`);
						resolve();
					})
					.on("error", err => {
						mongoose.disconnect();
						reject(err);
					});
			});
	});
};

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };