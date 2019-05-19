function missingField(object, fields) {
	for (let i = 0; i < fields.length; i++) {
		const field = fields[i];
		if (!(field in object)) {
			return `Missing required field \`${field}\``;
		};
	};
	return false;
}
module.exports = { missingField };