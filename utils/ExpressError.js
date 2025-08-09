class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

// Named export
// module.exports.ExpressError = ExpressError; // This makes ExpressError a NAMED export and can be destructred while requiring (importing) in other files
module.exports = ExpressError;