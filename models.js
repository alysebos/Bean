"use strict";

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	firstName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true }
});

userSchema.methods.serialize = function() {
	return {
		id: this._id,
		firstName: this.firstName,
		email: this.email
	};
};

userSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
	return bcrypt.hash(password, 10);
};

const petSchema = mongoose.Schema({
	name: { type: String, required: true },
	species: { type: String, required: true },
	breed: { type: String, required: true },
	birthDate: { type: String, required: true },
	weightUnits: { type: String, required: true },
	owner: { type: String, required: true}
});

const checkupSchema = mongoose.Schema({
	pet: { type: String, required: true },
	owner: { type: String, required: true },
	date: { type: String, required: true },
	vet:  { type: Boolean, required: true },
	weight: { type: String, required: true },
	temperature: String,
	pulse: String,
	respiration: String,
	abdomen: String,
	legs: String,
	feet: String,
	joints: String,
	genitals: String,
	anus: String,
	ears: String,
	eyes: String,
	mouth: String,
	coat: String,
	waste: String,
	claws: String,
	temperament: String,
	diet: String,
	wasteHabits: String,
	energyLevel: String,
	miscNotes: String
});

const User = mongoose.model("User", userSchema);
const Pet = mongoose.model("Pet", petSchema);
const Checkup = mongoose.model("Checkup", checkupSchema);

module.exports = { User, Pet, Checkup };