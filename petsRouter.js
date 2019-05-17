const express = require("express");
const router = express.Router();

const { Pets } = require("./models");

// LATER ON, ONCE USERS ARE ACTUALLY WORKING, 
// PETS OWNER WILL BE THE ID OF THE PERSON SIGNED IN
// BUT FOR NOW IT IS JUST AN EMAIL

Pets.create("Turd", "Cat", "American Shorthair", "April 1, 2009", "pounds", "https://i.imgur.com/AD3MbBi.jpg", "alyse.bos@gmail.com");
Pets.create("Bean", "Cat", "American Longhair", "August 1, 2001", "pounds", "https://i.imgur.com/xjaMIKB.png", "eqaddictedfool@gmail.com");

router.get("/", (req, res) => {
	res.status(200).json(Pets.get());
});

router.post("/", (req, res) => {

});

router.put("/:id", (req, res) => {

});

router.delete("/:id", (req, res) => {

});

module.exports = router;