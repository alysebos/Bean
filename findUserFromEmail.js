const { Users } = require('./models');

function findUserFromEmail(email) {
	const userList = Users.get();
	for (let i = 0; i < userList.length; i++) {
		if (userList[i].email == email) {
			return userList[i].id;
		}
	}
	return email;
}

module.exports = { findUserFromEmail };