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
		console.log("Retrieving list of users");
		return Object.keys(this.items).map(key => this.items[key]);
	},
	update: function(updatedUser) {
		console.log(`Updating user \`${id}\``);
		if(!(updatedUser.id in this.items)) {
			throw StorageException(
				`Can't update user \`${id}\` because no user exists`
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
}

module.exports = {
	Users: createUsers()
}