const { Users, Pets } = require("./models");

function findOwnersOfPets (petId) {
	const userList = Users.get();

	const owners = [];

	for (let i = 0; i < userList.length; i++) {
		if (userList[i].pets.indexOf(petId) > -1)  {
			owners.push(userList[i].id);
		}
	}

	return owners;
}

module.exports = { findOwnersOfPets };