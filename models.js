"use strict";

const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	firstName: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true }
});

userSchema.methods.serialize = function() {
	return {
		id: this._id,
		firstName: this.firstName,
		email: this.email
	};
};

const petSchema = mongoose.Schema({
	name: { type: String, required: true },
	species: { type: String, required: true },
	breed: { type: String, required: true },
	birthDate: { type: String, required: true },
	weightUnits: { type: String, required: true },
	owner: { type: String, required: true}
});

petSchema.methods.serialize = function() {
	return {
		id: this._id,
		name: this.name,
		species: this.species,
		breed: this.breed,
		birthDate: this.birthDate,
		weightUnits: this.weightUnits,
		owner: this.owners
	};
};

const checkupSchema = mongoose.Schema({

});

checkupSchema.methods.serialize = function() {
	return {

	};
};

const User = mongoose.model("User", userSchema);
const Pet = mongoose.model("Pet", petSchema);
const Checkup = mongoose.model("Checkup", checkupSchema);

module.exports = { User, Pet, Checkup };