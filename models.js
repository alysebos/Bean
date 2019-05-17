const uuid = require("uuid");

function StorageException(message) {
	this.message = message;
	this.name = "StorageException";
}

const Users = {
	create: function(firstName, email, password, notifications) {
		console.log("Creating a new user");
		const user = {
			id: uuid.v4(),
			firstName: firstName,
			email: email,
			password: password,
			profilePhoto: false,
			preferences: {
				notifications: notifications,
				language: "en-us",
				timeZone: "pacific"
			},
			pets: []
		};
		this.items[user.id] = user;
		return user;
	},
	get: function() {
		console.log("Retrieving users");
		return Object.keys(this.items).map(key => this.items[key]);
	},
	update: function(updatedUser) {
		console.log(`Updating user \`${updatedUser.id}\``);
		if(!(updatedUser.id in this.items)) {
			throw StorageException(
				`Can't update user \`${updatedUser.id}\` because no user exists`
				);
		};
		this.items[id].assign(updatedUser);
		return this.items[id];
	},
	delete: function(id) {
		console.log(`Deleting user \`${id}\``);
		delete this.items[id];
	}
};

function createUsers() {
	const storage = Object.create(Users);
	storage.items = {};
	return storage;
};

const Pets = {
	create: function(name, species, breed, birthDate, weightUnits, photoUrl, owner) {
		console.log("Creating a new pet");
		const pet = {
			id: uuid.v4(),
			name: name,
			species: species,
			breed: breed,
			birthDate: birthDate,
			weightUnits: weightUnits,
			photoUrl: photoUrl,
			owners: [owner],
			checkups: []
		};
		this.items[pet.id] = pet;
		return pet;
	},
	get: function() {
		console.log("Retrieving pets");
		return Object.keys(this.items).map(key => this.items[key])
	},
	update: function(updatedPet) {
		console.log(`Updating pet \`${updatedPet.id}\``);
		if(!(updatedPet.id in this.items)) {
			throw storageException(
				`Can't update pet \`${updatedPet.id}\` because no pet exists`
				);
		};
		this.items[id].assign(updatedPet);
		return this.items[id];
	},
	delete: function(id) {
		console.log(`deleting pet \`${id}\``);
		delete this.items[id];
	}
};

function createPets() {
	const storage = Object.create(Pets);
	storage.items = {};
	return storage;
};

module.exports = {
	Users: createUsers(),
	Pets: createPets()
}