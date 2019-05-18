const express = require("express");
const router = express.Router();

const { Users } = require("./models");

router.get("/", (req, res) => {
	res.status(200).json(Users.get());
	// RIGHT NOW THIS DISPLAYS PASSWORDS.
	// I WANT TO AVOID SHOWING PASSWORDS, EVEN ENCRYPTED AND FAKE ONES.
});

router.post("/", (req, res) => {

});

router.put("/:id", (req, res) => {

});

router.delete("/:id", (req, res) => {

});

module.exports = router;