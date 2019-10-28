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
/*
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
					return Checkup.find({owner: userId});
				})
				.then(function(checkups) {
					expect(checkups.length).to.equal(0);
				})
		})
	})

	describe("Pet endpoints", function() {
		it("should list logged in user's pets on GET", function() {
			return chai.request(app)
				.get('/pets')
				.send({ownerId: userId})
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body.pets.length).to.be.gt(0);
					res.body.pets.forEach(function (pet) {
						expect(pet.owner).to.equal(userId.toString());
					})
					return res.body.pets[0];
				})
				.then(function (pet) {
					expect(pet).to.be.an("object");
					expect(pet).to.include.keys("_id","name","species","breed","weightUnits","birthDate","owner");
				})
		})

		it("should list details of a specific pet on GET /:id", function() {
			return chai.request(app)
				.get(`/pets/${petId}`)
				.send({ownerId: userId})
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.an("object");
					expect(res.body).to.include.keys("_id","name","species","breed","weightUnits","birthDate","owner");
				})
		})

		it("should post a new pet on POST", function() {
			const newPet = generatePetData();
			return chai.request(app)
				.post('/pets')
				.send(newPet)
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.an('object');
					expect(res.body).to.include.keys("_id","name","species","breed","weightUnits","birthDate","owner");
					expect(res.body.name).to.equal(newPet.name);
					expect(res.body.species).to.equal(newPet.species);
					expect(res.body.breed).to.equal(newPet.breed);
					expect(res.body.weightUnits).to.equal(newPet.weightUnits);
					expect(res.body.owner).to.equal(newPet.owner.toString());
				})
		})

		it("should update existing pet on PUT /:id", function() {
			const updatedPet = generatePetData();
			updatedPet.id = petId;
			return chai.request(app)
				.put(`/pets/${petId}`)
				.send(updatedPet)
				.then(function (res) {
					expect(res).to.have.status(204);
					return Pet.findOne(petId);
				})
				.then(function (pet) {
					expect(pet).to.be.an("object");
					expect(pet.name).to.equal(updatedPet.name);
					expect(pet.species).to.equal(updatedPet.species);
					expect(pet.breed).to.equal(updatedPet.breed);
					expect(pet.weightUnits).to.equal(updatedPet.weightUnits);
					expect(pet.owner.toString()).to.equal(updatedPet.owner.toString());
					expect(pet._id.toString()).to.equal(updatedPet.id.toString());
				})
		})

		it("should delete a pet on DELETE /:id", function() {
			return chai.request(app)
				.delete(`/pets/${petId}`)
				.send({ ownerId: userId })
				.then(function (res) {
					expect(res).to.have.status(204);
					return Pet.findOne(petId);
				})
				.then(function (pet) {
					expect(pet).to.equal(null);
					return Checkup.find({pet: petId});
				})
				.then(function (checkups) {
					expect(checkups.length).to.equal(0);
				})
		})
	})

	describe("Checkup endpoints", function() {
		it("should display all checkups for a pet on GET /:id", function () {
			return chai.request(app)
				.get(`/checkups/${petId}`)
				.send({ownerId: userId})
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body.checkups.length).to.be.gt(0);
					res.body.checkups.forEach(function(checkup) {
						expect(checkup.pet.toString()).to.equal(petId.toString());
						expect(checkup.owner.toString()).to.equal(userId.toString());
					})
					return res.body.checkups[0];
				})
				.then(function(checkup) {
					expect(checkup).to.be.an("object");
					expect(checkup).to.include.keys("pet","owner","_id","vet","date");
				})
		})

		it("should display checkup details for a specific checkup on GET /:id/:checkupid", function () {
			return chai.request(app)
				.get(`/checkups/${petId}/${checkupId}`)
				.send({ownerId: userId})
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.an("object");
					expect(res.body).to.include.keys("pet","owner","_id","vet","date");
					expect(res.body.owner.toString()).to.equal(userId.toString());
					expect(res.body.pet.toString()).to.equal(petId.toString());
				})
		})

		it("should post a new checkup on POST", function() {
			const newCheckup = generateCheckupData();
			return chai.request(app)
				.post('/checkups')
				.send(newCheckup)
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.an('object');
					expect(res.body).to.include.keys("pet","owner","_id","vet","date");
					expect(res.body.pet.toString()).to.equal(newCheckup.pet.toString());
					expect(res.body.owner.toString()).to.equal(newCheckup.owner.toString());
					expect(res.body.vet).to.equal(newCheckup.vet);
				})
		})

		it("should update an existing checkup on PUT /:id", function() {
			const updatedCheckup = generateCheckupData();
			updatedCheckup.id = checkupId;
			return chai.request(app)
				.put(`/checkups/${checkupId}`)
				.send(updatedCheckup)
				.then(function(res) {
					expect(res).to.have.status(204);
					return Checkup.findOne(checkupId);
				})
				.then(function(checkup) {
					expect(checkup).to.be.an("object");
					expect(checkup.pet.toString()).to.equal(updatedCheckup.pet.toString());
					expect(checkup.owner.toString()).to.equal(updatedCheckup.owner.toString());
					expect(checkup.vet).to.equal(updatedCheckup.vet);
					expect(checkup._id.toString()).to.equal(updatedCheckup.id.toString());
				})
		})

		it("should delete a checkup on DELETE /:id", function() {
			return chai.request(app)
				.delete(`/checkups/${checkupId}`)
				.send({ ownerId: userId })
				.then(function (res) {
					expect(res).to.have.status(204);
					return Checkup.findOne(checkupId);
				})
				.then(function (pet) {
					expect(pet).to.equal(null);
				})
		})
	})
	*/

})