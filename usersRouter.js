const express = require("express");
const router = express.Router();

const { User, Pet, Checkup } = require("./models");
const { missingField } = require("./missingField");

router.get("/:id", (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message =
			`Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
		console.error(message);
		return res.status(400).json({ message: message });
	}
	User.findById(req.params.id)
		.then(user => {
			res.json(user.serialize());
		})
		.catch(err => res.status(500).json({ message: "Internal Server Error" }));
});

router.post("/", (req, res) => {
	// CHECK IF REQUIRED FIELDS ARE IN THE REQUEST
	const requiredFields = ["firstName", "email", "password"];
	let message = missingField(req.body, requiredFields);
	if (message) {
		console.error(message);
		return res.status(400).json({ message: message });
	}
	else {
		User.create(req.body)
			.then(user => res.status(201).json(user.serialize()))
			.catch(err => res.status(500).json({ message: "Internal Server Error" }));
	}
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
	const newUser = {};
	const updateableFields = ["firstName", "email", "password"];
	// BUILD THE UPDATE OBJECT
	updateableFields.forEach(field => {
		if (field in req.body) {
			newUser[field] = req.body[field];
		}
	});
	// CHECK IF THE PET IS OWNED BY THIS OWNER
	User
		.findByIdAndUpdate(req.params.id, { $set: newUser })
		.then(user => res.status(204).end())
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.delete("/:id", (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message =
			`Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
		console.error(message);
		return res.status(400).json({ message: message });
	}
	// BUILD ARRAYS OF ALL THE USERS PETS AND ALL THOSE PETS CHECKUPS
	let usersPets = [];
	let petsCheckups = [];
	Pet.find({owner: req.params.id})
		.then(pets => {
			if (pets.length < 1) {
				// DELETE THE USER
				User.findByIdAndDelete(req.params.id)
					.then(res.status(204).end())
					.catch(err => res.status(500).json({ message: "Internal server error" }));
			}
			else {
				pets.forEach(pet => {
					usersPets.push(pet._id);
					Checkup.find({pet: pet._id})
						.then(checkups => {
							if (checkups.length < 1) {
								// DELETE THE USER'S PETS
								usersPets.forEach(petId => {
									Pet.findByIdAndDelete(petId)
										.then(pet => {
											// DELETE THE USER
											User.findByIdAndDelete(req.params.id)
												.then(res.status(204).end())
												.catch(err => res.status(500).json({ message: "Internal Server Error" }))
										})
									})
							}
							else {
								checkups.forEach(checkup => {
									petsCheckups.push(checkup._id)
								});
								// DELETE CHECKUPS FROM ALL USERS PETS
								petsCheckups.forEach(checkupId => {
									Checkup.findByIdAndDelete(checkupId)
										.then(checkup => {
											// DELETE ALL USERS PETS
											usersPets.forEach(petId => {
												Pet.findByIdAndDelete(petId)
													.then(pet => {
														// DELETE THE USER
														User.findByIdAndDelete(req.params.id)
															.then(res.status(204).end())
															.catch(err => res.status(500).json({ message: "Internal Server Error" }))
													})
											})
										})
								})
							}
						})
				})
			}
		})
		.catch(err => res.status(500).json({ message: "Internal Server Error" }));
});

module.exports = router;