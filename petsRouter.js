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

const { missingField } = require("./missingField");
const { isEmail } = require("./isEmail");
const { findUserFromEmail } = require("./FindUserFromEmail");
const { findOwnersOfPets } = require("./findOwnersOfPets");

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
		req.body.owner = findUserFromEmail(req.body.owner);
	}
	// MAKE SURE THE OWNER EXISTS
	if (!Users.items[req.body.owner]) {
		const message = `\`${req.body.owner}\` cannot care for \`${req.body.name}\` because they do not exist`;
		console.error(message);
		return res.status(400).send(message);
	}
	// IF VERIFICATIONS PASS, CREATE THE PET
	const pet = Pets.create(req.body.name, req.body.species, req.body.breed, req.body.birthDate, req.body.weightUnits, req.body.photoUrl || false, req.body.owner);
	// NOW WE HAVE TO ADD THE PET ID TO THE USER'S PETS
	Users.items[req.body.owner].pets.push(pet.id);
	res.status(201).json(pet);
});

router.put("/:id", (req, res) => {
	// CHECK IF REQUIRED FIELDS ARE IN THE REQUEST
	const requiredFields = ["id", "name", "species", "breed", "weightUnits", "birthDate", "owners"];
	let message = missingField(req.body, requiredFields);
	if (message) {
		console.error(message);
		return res.status(400).send(message);
	}
	// CHECK IF ID IN PATH EXISTS
	if (!Pets.items[req.params.id]) {
		const message = `Cannot update pet \`${req.params.id}\` because they do not exist`;
		console.error(message);
		return res.status(400).send(message);
	}
	// CHECK IF ID IN BODY MATCHES ID IN PATH
	if (req.body.id != req.params.id) {
		const message = `ID in request path URL (\`${req.params.id}\` must match ID in the request body (\`${req.body.id}\`)`;
		console.error(message);
		return res.status(400).send(message);
	}
	// SET UP UPDATE OBJECT
	const updatedPet = {
		id: req.body.id,
		name: req.body.name,
		species: req.body.species,
		breed: req.body.breed,
		weightUnits: req.body.weightUnits,
		birthDate: req.body.birthDate,
		owners: req.body.owners
	}
	// CONVERT EMAILS TO IDS IN OWNERS ARRAY
	for(let i = 0; i < updatedPet.owners.length; i++) {
		if(isEmail(updatedPet.owners[i])) {
			updatedPet.owners[i] = findUserFromEmail(updatedPet.owners[i]);
		};
	}
	// ONLY USERS THAT EXIST SHOULD BE ABLE TO BE ADDED
	for (let i = 0; i < updatedPet.owners.length; i ++) {
		let user = updatedPet.owners[i];
		if (!Users.items[user]) {
			const message = `\`${user}\` cannot care for \`${req.body.name}\` because they do not exist`;
			console.error(message);
			return res.status(400).send(message);
		}
	}
	// ADD THE PET TO THE USER'S ARRAY IF IT'S NOT THERE ALREADY
	for (let i = 0; i < updatedPet.owners.length; i++) {
		let owner = updatedPet.owners[i];
		if (Users.items[owner].pets.indexOf(updatedPet.id) < 0) {
			Users.items[owner].pets.push(updatedPet.id);
		}
	}
	res.status(201).json(Pets.update(updatedPet));
});

router.delete("/:id", (req, res) => {
	// FIRST DELETE THE PET FROM EVERY USER WHO OWNS IT
	const owners = findOwnersOfPets(req.params.id);
	for (let i = 0; i < owners.length; i ++) {
		let pets = Users.items[owners[i]].pets;
		let index = pets.indexOf(req.params.id);
		if (index > -1) {
			pets.splice(index, 1);
		}
	}
	// NEXT DELETE THE CHECKUPS ASSOCIATED WITH THAT PET

	// NEXT, DELETE THE PET
	Pets.delete(req.params.id);
	res.status(204).end();
});

module.exports = router;