const express = require("express");
const router = express.Router();
const passport = require("passport");

const { User, Pet, Checkup } = require("./models");
const { missingField } = require("./missingField");

const jwtAuth = passport.authenticate('jwt', {session: false});


router.get("/", jwtAuth, (req, res) => {
	if (!req.user.id) {
		const message = `No user logged in`;
		console.error(message);
		return res.status(400).json({message: message});
	}
	User.findById(req.user.id)
		.then(user => {
			res.json(user.serialize());
		})
		.catch(err => res.status(500).json({ message: "Internal Server Error" }));
});

router.post("/", (req, res) => {
	// CHECK IF REQUIRED FIELDS ARE IN THE REQUEST
	const requiredFields = ["firstName", "email", "password"];
	const missingField_ = missingField(req.body, requiredFields);

	if (missingField_) {
		return res.status(422).json({ 
			code: 422,
			reason: "ValidationError",
			message: "Missing field",
			location: missingField_
		});
	}

	const stringFields = ["firstName", "email", "password"];
	const nonStringField = stringFields.find(
		field => field in req.body && typeof req.body[field] !== 'string'
	);

	if (nonStringField) {
		return res.status(422).json({
			code: 422,
			reason: "ValidationError",
			message: "Incorrect field type: expected string",
			location: nonStringField
		});
	}

	// ERROR IF WHITE SPACE IN PASSWORD
	if (req.body.password.trim() != req.body.password) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Cannot start or end with whitespace',
			location: 'password'
		});
	}
	// CHECK SIZE OF INPUT
	const sizedFields = {
		email:{
			min: 1
		},
		password: {
			min: 8,
			max: 72
		}
	};
	const tooSmallField = Object.keys(sizedFields).find(
		field => 
			'min' in sizedFields[field] &&
				req.body[field].trim().length < sizedFields[field].min
	);
	const tooLargeField = Object.keys(sizedFields).find(
		field =>
			'max' in sizedFields[field] &&
				req.body[field].trim().length > sizedFields[field].max
		);

	if (tooSmallField || tooLargeField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: tooSmallField
				? `Must be at least ${sizedFields[tooSmallField].min} characters long`
				: `Must be at most ${sizedFields[tooLargeField].max} characters long`,
				location: tooSmallField || tooLargeField
			});
	}

	let { email, password, firstName } = req.body;
	firstName = firstName.trim();
	email = email.trim();

	return User.find({email})
		.countDocuments()
		.then(count => {
			if (count > 0) {
				return Promise.reject({
					code: 422,
					reason: 'ValidationError',
					message: 'User already registered with that email',
					location: 'email'
				});
			}
			return User.hashPassword(password);
		})
		.then(hash => {
			return User.create({
				email,
				password: hash,
				firstName
			});
		})
		.then(user => {
			return res.status(201).json(user.serialize());
		})
		.catch(err => {
			if (err.reason === 'ValidationError') {
				return res.status(err.code).json(err);
			}
			res.status(500).json({code: 500, message: 'Internal server error'});
		});
});

router.put("/:id", jwtAuth, (req, res) => {
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

router.delete("/:id", jwtAuth, (req, res) => {
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