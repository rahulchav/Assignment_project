const mongoose = require("mongoose");
const Assignment = require("../Models/assignmentModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/apperror");


exports.getAdminAssignment = catchAsync(async (req, res, next) => {

  const userDetail = req.user;

  const adminId = new mongoose.Types.ObjectId(req.user.id);

  if(userDetail.admin){
    const allAssignments = await Assignment.find({adminId}).populate({
      path: 'userId',
      select: 'name email'
    });

    res.status(200).json({
      status: 'success',
      data : allAssignments
    });
  }else{
    return next(
      new AppError(
        "Only admins can access assignments list.",
        401
      )
    );
  }

});

exports.assignmentStatusChange = (type = null) => catchAsync(async (req, res, next) => {

  const userDetail = req.user;
  const assignmentId = req.params.id;

  if(userDetail.admin){
    const assignmentDetails = await Assignment.findOne({ _id : new mongoose.Types.ObjectId(assignmentId)});

    if(!assignmentDetails){
      return next(
        new AppError(
          "No Assignment Found for the given Id",
          401
        )
      );
    }

    if(assignmentDetails.status){
      return next(
        new AppError(
          `Assignment already ${assignmentDetails.status == "accept" ? "Accepted" : "Rejected"} on ${assignmentDetails.statusChangedAt}`,
          401
        )
      );
    }

    const updatedAssignment = await Assignment.findOneAndUpdate(
      { _id: assignmentId },
      { status: type },
      { new: true }
    );


    res.status(200).json({
      status: 'success',
      data : updatedAssignment
    });
  }else{
    return next(
      new AppError(
        "Only admins can access accept assignments.",
        401
      )
    );
  }

});