const express = require("express");
const router = express.Router();
const passport = require("passport");

const { Pet, User, Checkup } = require("./models");
const { missingField } = require("./missingField");

const jwtAuth = passport.authenticate('jwt', {session: false});

router.get("/:id", jwtAuth, (req, res) => {
	// 
	if (!(req.user)) {
		const message = `Not logged in`;
		console.error(message);
		return res.status(400).json({ message: message });
	};
	Pet.findById(req.params.id)
		.then(pet => {
			if (!(req.user.id == pet.owner)) {
				const message = `${req.user.id} doesn't own ${req.params.id}`
				console.error(message);
				return res.status(400).json({ message: message });
			}
			else {
				Checkup.find({ pet: pet.id })
					.then(checkups => {
						res.json({ checkups: checkups });
					})
			}
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		})
});

router.get("/:id/:checkupId", jwtAuth, (req, res) => {
	// 
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
			else {
				Checkup.findById(req.params.checkupId)
					.then(checkup => res.json(checkup))
			}
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		})
});

router.post("/", jwtAuth, (req, res) => {
	// CHECK IF REQUIRED FIELDS ARE IN THE REQUEST
	const requiredFields = ["date", "vet", "owner", "pet"];
	let newCheckup = req.body;
	newCheckup.owner = req.user.id;
	let message = missingField(newCheckup, requiredFields);
	if (message) {
		console.error(message);
		return res.status(400).json({ message: message });
	}
	// Change the date to an actual date
	let date = newCheckup.date.split("-");
	let dateYear = date[0];
	let dateMonth = date[1] - 1;
	let dateDay = date[2];
	newCheckup.date = new Date (dateYear, dateMonth, dateDay);
	// MAKE SURE THE OWNER EXISTS
	User.findById(newCheckup.owner)
		.then(user => {
			if (!user.firstName) {
				const message = `No user with ID ${newCheckup.owner}`;
				console.error(message);
				res.status(400).json({ message: message });
			}
			else {
				// MAKE SURE THE PET EXISTS
				Pet.findById(newCheckup.pet)
					.then(pet => {
						if (!pet.name) {
							const message = `No pet with ID ${newCheckup.pet}`;
							console.error(message);
							res.status(400).json({ message: message });
						}
						else if (pet.owner != newCheckup.owner) {
							const message = `${newCheckup.owner} does not own ${newCheckup.pet}`
							console.error(message);
							res.status(400).json({ message: message });
						}
						else {
							Checkup
								.create(newCheckup)
								.then(checkup => {
									res.status(200).json(checkup);
								})
								.catch(err => {
									console.error(err);
									res.status(500).json({ message: "Internal server error" });
								});
						}
					})
					.catch(err => {
						let message = `Could not find pet ID ${req.body.pet}`;
						return res.status(400).json({ message: message });
					})
			}
		})
		.catch(err => res.status(400).json({ message: `Could not find user ID ${req.body.owner}`}));
});

router.put("/:id", jwtAuth, (req, res) => {
	// CHECK IF REQUIRED FIELDS ARE IN THE REQUEST
	const requiredFields = ["pet", "owner", "date", "vet", "id"];
	let message = missingField(req.body, requiredFields);
	if (message) {
		console.error(message);
		return res.status(400).json({ message: message });
	}
	// CHECK IF ID IN BODY AND PARAMS MATCH
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message =
			`Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
		console.error(message);
		return res.status(400).json({ message: message });
	}
	// SET UPDATE OBJECT AND FIELDS WE ARE ALLOWED TO UPDATE
	const newCheckup = req.body;
	
	if (newCheckup.date) {
		let date = newCheckup.date.split("-");
		let dateYear = date[0];
		let dateMonth = date[1] - 1;
		let dateDay = date[2];
		newCheckup.date = new Date (dateYear, dateMonth, dateDay);
	}
	// CHECK IF THE PET IS OWNED BY THIS OWNER
	// MAKE SURE THE OWNER EXISTS
	User.findById(req.body.owner)
		.then(user => {
			if (!user.firstName) {
				const message = `No user with ID ${req.body.owner}`;
				console.error(message);
				res.status(400).json({ message: message });
			}
			else {
				// MAKE SURE THE PET EXISTS
				Pet.findById(req.body.pet)
					.then(pet => {
						if (!pet.name) {
							const message = `No pet with ID ${req.body.owner}`;
							console.error(message);
							res.status(400).json({ message: message });
						}
						else if (pet.owner != req.body.owner) {
							const message = `${req.body.owner} does not own ${req.body.pet}`
							console.error(message);
							res.status(400).json({ message: message });
						}
						else {
							Checkup
								.findByIdAndUpdate(req.params.id, newCheckup)
								.then(checkup => res.status(204).end())
								.catch(err => {
									console.error(err);
									res.status(500).json({ message: "Internal server error" });
								});
						}
					})
					.catch(err => {
						let message = `Could not find pet ID ${req.body.pet}`;
						return res.status(400).json({ message: message });
					})
			}
		})
		.catch(err => res.status(400).json({ message: `Could not find user ID ${req.body.owner}`}));
});

router.delete("/:id", jwtAuth, (req, res) => {
	// MAKE SURE THE OWNER ID IS PROVIDED	
	if (!req.body.ownerId) {
		const message = `Missing ownerId in request body`;
		console.error(message);
		return res.status(400).json({ message: message });
	}
	// DELETE THE CHECKUP
	Checkup.findById(req.params.id)
		.then(checkup => {
			if (!(req.body.ownerId == checkup.owner)) {
				const message = `Owner ${req.body.ownerId} doesn't own ${req.params.id}`;
				console.error(message);
				return res.status(400).json({ message: message });
			}
			else {
				Checkup.findByIdAndRemove(req.params.id)
					.then(checkup => res.status(204).end())
			}
		})
		.catch(err => res.status(500).json({ message: "Not Found" }));
});

module.exports = router;