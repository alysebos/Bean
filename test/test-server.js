const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");
const { User, Pet, Checkup } = require("../models");
const { TEST_DATABASE_URL } = require("../config");

const mongoose = require("mongoose");
const faker = require("faker");

const expect = chai.expect;

chai.use(chaiHttp);

let userId;
let petId;
let checkupId;

function setUserId () {
	return User.findOne()._id;
}

function setPetId () {
	return Pet.findOne()._id;
}

function setCheckupId () {
	return Checkup.findOne()._id;
}

function seedUserData () {
	console.info("seeding user data");
	const seedData = [];

	for (let i = 0; i < 10; i++) {
		seedData.push(generateRestaurantData());
	}

	return Restaurant.insertMany(seedData);
}

function generateUserDate () {
	return {
		firstName: faker.name.firstName(),
		email: faker.internet.email(),
		password: faker.internet.password()
	}
}

function seedPetData () {
	console.info("seeding pet data");
	const seedData = [];

	for (let i = 0; i < 10; i++) {
		seedData.push(generatePetData());
	}

	return Pet.insertMany(seedData);
}

function generatePetData () {
	return {
		name: faker.name.firstName(),
		species: faker.address.country(),
		breed: faker.address.city(),
		weightUnits: "lbs",
		birthDate: faker.date.past(),
		ownerId: userId
	}
}

function seedCheckupData () {
	console.info("seeding checkup data");
	const seedData = [];

	for (let i = 0; i < 10; i++) {
		seedData.push(generateCheckupData());
	}

	return Checkup.insertMany(seedData);
}

function generateCheckupData () {
	return {
		pet: petId,
		owner: userId,
		date: faker.date.recent(),
		vet: faker.random.boolean(),
		physical: {

		}
	}
}

function tearDownDB () {

}

describe("Bean Application", function () {
	before(function () {
		return runServer(TEST_DATABASE_URL)
	})
	beforeEach(function () {
		seedUserData()
			.then(users => {
				userId = setUserId();
				seedPetData()
				.then(pets => {
					petId = setPetId();
					seedCheckupData()
						.then(checkups => {
							checkupId = setCheckupId();
						})
				})
			})
	})
})