function isEmail(string) {
	const regEx = /[\w-]+@([\w-]+\.)+[\w-]+/;
	return regEx.test(string);
}
module.exports = { isEmail };