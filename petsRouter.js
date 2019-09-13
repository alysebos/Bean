const express = require("express");
const router = express.Router();

const { Pet, User, Checkup } = require("./models");

// I TRIED TO MAKE IT CREATE A PET AT THE SAME
// TIME THAT IT ADDS THE PET TO THE USER'S ARRAY

const { missingField } = require("./missingField");

router.get("/", (req, res) => {
	if (!(req.body.ownerId)) {
		const message = `Missing ownerId in request body`;
		console.error(message);
		return res.status(400).json({ message: message });
	};
	Pet.find({ owners: req.body.ownerId })
		.then(pets => {
			res.json({
				pets: pets.map(pet => pet.serialize())
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.get("/:id", (req, res) => {
	if (!(req.body.ownerId)) {
		const message = `Missing ownerId in request body`;
		console.error(message);
		return res.status(400).json({ message: message });
	};
	Pet.findById(req.params.id)
		.then(pet => {
			if (!(req.body.ownerId == pet.owner)) {
				const message = `${req.body.ownerId} doesn't own ${req.params.id}`
				console.error(message);
				return res.status(400).json({ message: message });
			}
			res.json(pet.serialize())
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		})
});

router.post("/", (req, res) => {
	// CHECK IF REQUIRED FIELDS ARE IN THE REQUEST
	const requiredFields = ["name", "species", "breed", "weightUnits", "birthDate", "ownerId"];
	let message = missingField(req.body, requiredFields);
	if (message) {
		console.error(message);
		return res.status(400).json({ message: message });
	}
	// MAKE SURE THE OWNER EXISTS
	User.findById(req.body.owner)
		.then(user => {
			Pet
				.create({
					name: req.body.name,
					species: req.body.species,
					breed: req.body.breed,
					birthDate: new Date(req.body.birthDate),
					weightUnits: req.body.weightUnits,
					owner: req.body.ownerId})
				.then(pet => {
					res.status(200).json(pet.serialize());
				})
				.catch(err => {
					console.error(err);
					res.status(500).json({ message: "Internal server error" });
				});
		})
		.catch(err => {
			let message = `No user with that ID`;
			return res.status(400).json({ message: message });
		})
});

router.put("/:id", (req, res) => {
	// CHECK IF ID IN BODY AND PARAMS MATCH
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message =
			`Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
		console.error(message);
		return res.status(400).json({ message: message });
	}
	// SET UPDATE OBJECT AND FIELDS WE ARE ALLOWED TO UPDATE
	const newPet = {};
	const updateableFields = ["name", "species", "breed", "birthDate", "weightUnits"];
	// BUILD THE UPDATE OBJECT
	updateableFields.forEach(field => {
		if (field in req.body) {
			newPet[field] = req.body[field];
		}
	});
	// DO THE UPDATE
	Pet
		.findByIdAndUpdate(req.params.id, {$set: newPet })
		.then(pet => res.status(204).end())
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.delete("/:id", (req, res) => {
	// DELETE ANY CHECKUPS ASSOCIATED WITH THE PET

	// DELETE THE PET
	Pet.findById(req.params.id)
		.then(pet => {
			if (!(req.body.ownerId == pet.owner)) {
				const message = `Owner ${req.body.ownerId} doesn't own ${req.params.id}`;
				console.error(message);
				return res.status(400).json({ message: message });
			}
			Pet.findByIdAndRemove(req.params.id)
				.then(pet => res.status(204).end())
		})
		.catch(err => res.status(500).json({ message: "Not Found" }));
});

module.exports = router;