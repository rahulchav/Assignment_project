const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An assignment must have a userId'],
    },
    task: {
      type: String,
      required: [true, 'An assignment must have a task description'],
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An assignment must have an adminId'],
    },
    status: {
      type: String,
      enum: ['accept', 'reject'],
    },
    statusChangedAt: {
      type: Date,
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    versionKey: false,
  }
);

// Middleware to set statusChangedAt when status is updated
assignmentSchema.pre('findOneAndUpdate', function (next) {
  if (this.getUpdate().status) {
    this.setUpdate({ ...this.getUpdate(), statusChangedAt: new Date() });
  }
  next();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
