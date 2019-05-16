const express = require("express");
const router = express.Router();

const { Users } = require("./models");

Users.create("Alyse", "alyse.bos@gmail.com", "TurdTurd1", true);
Users.create("Alex", "eqaddictedfool@gmail.com", "LookAtMe1", false);
Users.create("Sarah", "sarahmariehamilton@gmail.com", "ImTheFavorite", true);

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