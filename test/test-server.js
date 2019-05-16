const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Users", function() {
	before(function() {
		return runServer();
	});

	after(function() {
		return closeServer();
	});

	it("should list users on GET", function() {
		return chai
			.request(app)
			.get("/users")
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.an("array");
				expect(res.body.length).to.be.at.least(1);
				const expectedKeys = ["id", "firstName", "email", "preferences", "profilePhoto", "pets"];
				res.body.forEach(function(user) {
					expect(user).to.include.keys(expectedKeys);
				});
			})
		})
});