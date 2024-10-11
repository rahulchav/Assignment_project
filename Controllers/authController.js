const jwt = require('jsonwebtoken');
const catchAsync = require("../utils/catchAsync");
const User = require('../Models/userModel');
const { promisify } = require("util");
const AppError = require('../utils/apperror');

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

const signToken = (id, tokenVersion) =>
jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});

const incrementTokenVersion = async (userId, tokenVersion) => {
  const updatedUser = await User.findOneAndUpdate(
    { _id : userId },
    { tokenVersion },
  );

  if (!updatedUser) {
    throw new AppError('User not found');
  }

  return updatedUser;
};

const createSendToken = async(user, statuscode, req, res) => {
  const tokenVersion = user.tokenVersion ? ++user.tokenVersion : 1;
  const token = signToken(user._id, tokenVersion);

  await incrementTokenVersion(user._id, tokenVersion);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // Remove password from output
  user.password = undefined;

  res.status(statuscode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {

  const { name, email, password, admin } = req.body;

  // Validation checks
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return next(new AppError('Invalid Name for creating user!', 400));
  }
  
  if (!email || !emailRegex.test(email)) {
    return next(new AppError('Invalid email address!', 400));
  }
  if (!password || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long!', 400));
  }
  if (admin !== undefined && typeof admin !== 'boolean') {
    return next(new AppError('Admin must be a boolean value!', 400));
  }

  const newUser = await User.create({
    name,
    email,
    password,
    admin,
  });

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // if varibal name is same as the value then user destructuring
  const { email, password } = req.body;

  if (!email || !emailRegex.test(email)) {
    return next(new AppError('Invalid email address!', 400));
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    return next(new AppError('Invalid password!', 400));
  }

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password +tokenVersion');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.protect = (extraParam = null) => catchAsync(async (req, res, next) => {
  // 1 get the token and check is its exist or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // 2 return error if token is not exist
  if (!token) {
    return next(
      new AppError("You are not logged in please log in to get access", 401)
    );
  }

  // 4 dedode and find the user to set it in req.user
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
  const currentUser = await User.findOne({ _id : decoded.id }).select('+tokenVersion');
  if(decoded?.tokenVersion != currentUser?.tokenVersion){
    return next(
      new AppError(
        "The token is blacklisted.",
        401
      )
    );
  }

  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  if(extraParam == "admin" && !currentUser.admin){
    return next(
      new AppError(
        "Only admins authorize for this action.",
        401
      )
    );
  }


  req.user = currentUser
  next();
});