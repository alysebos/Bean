const express = require("express");
const router = express.Router();

const { Pets, Users } = require("./models");

// I TRIED TO MAKE IT CREATE A PET AT THE SAME
// TIME THAT IT ADDS THE PET TO THE USER'S ARRAY

Users.create("Alyse", "alyse.bos@gmail.com", "TurdTurd1", true);
Users.create("Alex", "eqaddictedfool@gmail.com", "LookAtMe1", false);
Users.create("Sarah", "sarahmariehamilton@gmail.com", "ImTheFavorite", true);
Users.items[Users.get()[0].id].pets.push(Pets.create("Turd", "Cat", "American Shorthair", "April 1, 2009", "pounds", "https://i.imgur.com/AD3MbBi.jpg", Users.get()[0].id).id);
Users.items[Users.get()[1].id].pets.push(Pets.create("Bean", "Cat", "American Longhair", "August 31, 2001", "pounds", "https://i.imgur.com/AD3MbBi.jpg", Users.get()[1].id).id);

function missingField(object, fields) {
	for (let i = 0; i < fields.length; i++) {
		const field = fields[i];
		if (!(field in object)) {
			return `Missing required field \`${field}\``;
		};
	};
	return false;
}

function isEmail(string) {
	let regEx = /[\w-]+@([\w-]+\.)+[\w-]+/;
	return regEx.test(string);
}

function findUserFromEmail(email) {
	return Users.get().find(user => {
		return user.email === email;
	})
}

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
	let message = missingField(req.body, requiredFields);
	if (message) {
		console.error(message);
		return res.status(400).send(message);
	}
	// IF THE OWNER IS AN EMAIL, GET THE ID
	if (isEmail(req.body.owner)) {
		req.body.owner = findUserFromEmail(req.body.owner).id;
	}
	// MAKE SURE THE OWNER EXISTS
	else if (!Users.items[req.body.owner]) {
		const message = `\`${req.body.owner}\` cannot care for \`${req.body.name}\` because they do not exist`;
		console.error(message);
		return res.status(400).send(message);
	};
	// IF VERIFICATIONS PASS, CREATE THE PET
	const pet = Pets.create(req.body.name, req.body.species, req.body.breed, req.body.birthDate, req.body.weightUnits, req.body.photoUrl || false, req.body.owner);
	// NOW WE HAVE TO ADD THE PET ID TO THE USER'S PETS
	Users.items[req.body.owner].pets.push(pet.id);
	res.status(201).json(pet);
});

router.put("/:id", (req, res) => {
});

router.delete("/:id", (req, res) => {

});

module.exports = router;