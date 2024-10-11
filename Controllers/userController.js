const Assignment = require("../Models/assignmentModel");
const User = require("../Models/userModel");
const AppError = require("../utils/apperror");
const catchAsync = require("../utils/catchAsync");

exports.getAllAdmins = catchAsync(async (req, res, next) => {

  const adminData = await User.find({ admin : true})

  res.status(200).json({
    status: 'success',
    data : adminData
  });

});

exports.uploadAssignment = catchAsync(async (req, res, next) => {

  const user = req.user;

  if(user.admin)
    return next(new AppError("Admins can not Upload Assignments.", 401));

  const { task, admin } = req.body;

  if (!task || typeof task !== 'string' || task.trim() === '') {
    return next(new AppError('Invalid Assignment Detail!', 400));
  }

  if (!admin || typeof admin !== 'string' || admin.trim() === '') {
    return next(new AppError('Invalid Admin Name!', 400));
  }

  const adminData = await User.findOne({ name : admin})

  if(adminData?.admin){
    const newAssignment = await Assignment.create({
      userId: user._id,
      adminId: adminData._id,
      task
    });

    res.status(200).json({
      status: 'success',
      data : newAssignment
    });
  }else{
    return next(new AppError("No admin Found with this name", 401));
  }
});