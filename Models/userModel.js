const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/apperror');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
    },
    email: {
      type: String,
      required: [true, 'A user must have a email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      select: false,
      minlength: 8,
    },
    admin: {
      type: Boolean,
      select: false,
    },
    tokenVersion: {
      type: Number,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new AppError('Email already exists. Please use a different email address.', 400));
  } else {
    next();
  }
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
