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

function seedUserData () {
	console.info("seeding user data");
	const seedData = [];

	for (let i = 0; i < 10; i++) {
		seedData.push(generateUserData());
	}

	return User.insertMany(seedData);
}

function generateUserData () {
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
		owner: userId
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
	console.warn("Deleting test database");
	return mongoose.connection.dropDatabase();
}

describe("Bean Application", function () {

	before(function () {
		return runServer(TEST_DATABASE_URL)
	})

	beforeEach(function () {
		return seedUserData()
			.then(function (users) {
				userId = users[0]._id;
				return seedPetData()
					.then(function (pets) {
						petId = pets[0]._id;
						return seedCheckupData()
							.then(function (checkups) {
								checkupId = checkups[0]._id;
							})
					})
			})
	})

	afterEach(function () {
		return tearDownDB();
	})

	after(function () {
		return closeServer();
	})

	describe("Users Endpoints", function() {
		it("should return current user on GET /:id", function() {
			return chai.request(app)
				.get(`/users/${userId}`)
				.send({ id: userId })
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.an('object');
					expect(res.body).to.include.keys('firstName','id','email');
				})
		})
		it("should post new users on POST", function() {
			const newUser = generateUserData();
			return chai.request(app)
				.post('/users')
				.send(newUser)
				.then(function (res) {
					expect(res).to.have.status(201);
					expect(res).to.be.json;
					expect(res.body).to.be.an('object');
					expect(res.body).to.include.keys('firstName','id','email');
					expect(res.body.firstName).to.equal(newUser.firstName);
					expect(res.body.email).to.equal(newUser.email);
					expect(res.body.password).to.equal(undefined);
				})
		})
		it("should update an existing user on PUT", function() {
			const updatedUser = generateUserData();
			updatedUser.id = userId;
			return chai.request(app)
				.put(`/users/${userId}`)
				.send(updatedUser)
				.then(function (res) {
					expect(res).to.have.status(204);
					return User.findOne(userId);
				})
				.then(function (user) {
					expect(user.firstName).to.equal(updatedUser.firstName);
					expect(user.email).to.equal(updatedUser.email);
					expect(user.password).to.equal(updatedUser.password);
				})
		})
		it("should delete an existing user on DELETE", function() {
			return chai.request(app)
				.delete(`/users/${userId}`)
				.send({ id: userId })
				.then(function (res) {
					expect(res).to.have.status(204);
					return User.findOne(userId);
				})
				.then(function (user) {
					expect(user).to.equal(null);
					return Pet.find({owner: userId});
				})
				.then(function (pets) {
					expect(pets.length).to.equal(0);
				})
		})
	})

})