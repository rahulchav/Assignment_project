const AppError = require("../utils/apperror");

const sendErrorDev = (err, req, res) => {
  // if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  // }
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
};

const handleJwtError = () =>
  new AppError("Invalid token. please log in again", 401);
const handleJwtExpiredError = () =>
  new AppError("Expired token. please log in again", 401);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name; //err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //   console.log(err);
  const errors = Object.values(err.errors).map((el) => el.message);
  //   console.log(errors);
  const message = `Invalid input data. ${errors.join('. ')}`;
  //   console.log(message);
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
console.log(37373,process.env.NODE_ENV)
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, name: err.name, message: err.message };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    if (error.name === "JsonWebTokenError") error = handleJwtError();
    if (error.name === "TokenExpiredError") error = handleJwtExpiredError();

    sendErrorProd(error, req, res);
  }
};
