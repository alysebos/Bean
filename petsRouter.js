const express = require("express");
const router = express.Router();
const passport = require("passport");

const { Pet, User, Checkup } = require("./models");
const { missingField } = require("./missingField");

const jwtAuth = passport.authenticate('jwt', {session: false});

router.get("/", jwtAuth, (req, res) => {
	if (!(req.user)) {
		const message = `Not logged in`;
		console.error(message);
		return res.status(400).json({ message: message });
	};
	Pet.find({ owner: req.user.id })
		.then(pets => {
			res.json({
				pets: pets
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.get("/:id", jwtAuth, (req, res) => {
	if (!(req.user)) {
		const message = `User is nog logged in`;
		console.error(message);
		return res.status(400).json({ message: message });
	};
	Pet.findById(req.params.id)
		.then(pet => {
			if (req.user.id != pet.owner) {
				const message = `${req.user.id} doesn't own ${req.params.id}`
				console.error(message);
				return res.status(400).json({ message: message });
			}
			else { res.json(pet) };
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		})
});

router.post("/", jwtAuth, (req, res) => {
	// CHECK IF REQUIRED FIELDS ARE IN THE REQUEST
	const requiredFields = ["name", "species", "breed", "weightUnits", "birthDate"];
	let message = missingField(req.body, requiredFields);
	if (message) {
		console.error(message);4
		return res.status(400).json({ message: message });
	}
	else {
	// Format the date properly
		let date = req.body.birthDate.split("-");
		let dateYear = date[0];
		let dateMonth = date[1] - 1;
		let dateDay = date[2];
		req.body.date = new Date (Date.UTC(dateYear, dateMonth, dateDay));
	// MAKE SURE THE OWNER EXISTS
		User.findById(req.user.id)
			.then(user => {
				if (!user) {
					let message = `No user with that ID`;
					console.error(message);
					return res.status(400).json({ message: message });
				}
				else {
					Pet
						.create({
							name: req.body.name,
							species: req.body.species,
							breed: req.body.breed,
							birthDate: req.body.date,
							weightUnits: req.body.weightUnits,
							owner: user._id})
						.then(pet => {
							res.status(200).json(pet);
						})
						.catch(err => {
							console.error(err);
							res.status(500).json({ message: "Internal server error" });
						});
				}
			})
			.catch(err => {
				let message = `No user with that ID`;
				return res.status(400).json({ message: message });
			})
	}
});

router.put("/:id", jwtAuth, (req, res) => {
	// CHECK IF ID IN BODY AND PARAMS MATCH
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message =
			`Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
		console.error(message);
		return res.status(400).json({ message: message });
	}
	// MAKE SURE THE OWNER ID EXISTS
	if (!req.user) {
		const message = `Not logged in`;
		console.error(message);
		return res.status(400).json({ message: message });
	}
	// SET UPDATE OBJECT AND FIELDS WE ARE ALLOWED TO UPDATE
	const newPet = req.body;
	const updateableFields = ["name", "species", "breed", "birthDate", "weightUnits"];
	// BUILD THE UPDATE OBJECT
	updateableFields.forEach(field => {
		if (field in newPet) {
			if (field === "birthDate") {
				let date = newPet[field].split("-");
				let dateYear = date[0];
				let dateMonth = date[1] - 1;
				let dateDay = date[2];
				newPet[field] = new Date (Date.UTC(dateYear, dateMonth, dateDay));
			}
			else {
				newPet[field] = req.body[field];
			}
		}
	});
	// CHECK IF THE PET IS OWNED BY THIS OWNER
	Pet
		.findById(req.params.id)
			.then(pet =>{
				if (pet.owner != req.user.id) {
					const message = `${req.user.id} doesn't own ${req.params.id}`;
					console.error(message);
					return res.status(400).json({ message: message });
				}
				else {	
					// DO THE UPDATE
					Pet
						.findByIdAndUpdate(req.params.id, { $set: newPet })
						.then(pet => res.status(204).end())
						.catch(err => res.status(500).json({ message: "Internal server error" }));
				}
			})
});

router.delete("/:id", jwtAuth, (req, res) => {
	// MAKE SURE THE OWNER ID IS PROVIDED	
	if (!req.user) {
		const message = `Not logged in`;
		console.error(message);
		return res.status(400).json({ message: message });
	}
	// DELETE THE PET
	Pet.findById(req.params.id)
		.then(pet => {
			if (req.user.id != pet.owner) {
				const message = `Owner ${req.user.id} doesn't own ${req.params.id}`;
				console.error(message);
				return res.status(400).json({ message: message });
			}
			else {
				// DELETE ANY CHECKUPS FROM THAT PET
				Checkup.deleteMany({ pet: req.params.id })
					.then(checkup => {
						Pet.findByIdAndRemove(req.params.id)
						.then(pet => res.status(204).end())
					})
			}
		})
		.catch(err => res.status(500).json({ message: "Not Found" }));
});

module.exports = router;