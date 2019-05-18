const express = require("express");
const router = express.Router();

const { Pets, Users } = require("./models");

// LATER ON, ONCE USERS ARE ACTUALLY WORKING, 
// PETS OWNER WILL BE THE ID OF THE PERSON SIGNED IN
// BUT FOR NOW IT IS JUST AN EMAIL


function createPets () {
	Users.items[Users.get()[0].id].pets.push(Pets.create("Turd", "Cat", "American Shorthair", "April 1, 2009", "pounds", "https://i.imgur.com/AD3MbBi.jpg", Users.get()[0].id).id);
	Users.items[Users.get()[1].id].pets.push(Pets.create("Bean", "Cat", "American Longhair", "August 31, 2001", "pounds", "https://i.imgur.com/AD3MbBi.jpg", Users.get()[1].id).id);
}
// this timeout allows the pets to be created after the users
setTimeout(createPets, 500);



router.get("/", (req, res) => {
	res.status(200).json(Pets.get());
});

router.get("/:id", (req, res) => {
	if (!Pets.items[req.params.id]) {
		const message = `\`${req.params.id}\` not found`;
		console.error(message);
		return res.status(404).send(message);
	};
	res.status(200).json(Pets.get(req.params.id));
});

router.post("/", (req, res) => {
	// CHECK IF REQUIRED FIELDS ARE IN THE REQUEST
	const requiredFields = ["name", "species", "breed", "weightUnits", "birthDate", "owner"];
	for (let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing required field \`${field}\``;
			console.error(message);
			return res.status(400).send(message);
		};
	};
	// MAKE SURE THE OWNER EXISTS
	if (!Users.items[req.body.owner]) {
		const message = `\`${req.body.owner}\` cannot care for \`${req.body.name}\` because they do not exist`;
		console.error(message);
		return res.status(400).send(message);
	};
	// IF VERIFICATIONS PASS, CREATE THE PET
	const item = Pets.create(req.body.name, req.body.species, req.body.breed, req.body.birthDate, req.body.weightUnits, req.body.photoUrl || false, req.body.owner);
	// NOW WE HAVE TO ADD THE PET ID TO THE USER'S PETS
	Users.items[req.body.owner].pets.push(item.id);
	res.status(201).json(item);
});

router.put("/:id", (req, res) => {

});

router.delete("/:id", (req, res) => {

});

module.exports = router;