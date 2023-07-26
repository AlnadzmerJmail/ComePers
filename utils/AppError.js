class AppError extends Error {
	constructor(messsage, status) {
		super();
		this.message = messsage;
		this.statusCode = status;
	}
}

module.exports = AppError;
