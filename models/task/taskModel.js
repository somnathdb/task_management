const mongoose = require("mongoose");
const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    // Task created by
    userId: {
      type: Schema.Types.ObjectId,
      ref: "mobileusers",
      required: true
    },
    groupId:{
      type:Schema.Types.ObjectId,
      ref: "groups"
    },
    taskName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    assignDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    // User(s) task assigned to
    assignTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "mobileusers"
      }
    ],
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low"
    },
    isShortage: {
    type: Boolean,
    default: false   // 👈 default value
  },
 labels: [
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    }
  }
],
    files: [
      {
        type: String
      }
    ],
    // Sub tasks (self reference)
    subTasksModelId: [
      {
        type: Schema.Types.ObjectId,
        ref: "tasks"
      }
    ],
        subTasks: [
      {
        taskId: {
          type: Schema.Types.ObjectId,
          ref: "tasks",
          required: true
        },
        taskName:{type:String},
        completed: {
          type: Boolean,
          default: false   // false initially, can update later
        }
      }
    ],
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending"
    },
    taskType:{
      type:String
    },
    comments: [
  {
    subTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    commentedBy: {
      type: Schema.Types.ObjectId,
      ref: "mobileusers",
      required: true
    },
    commentedAt: {
      type: Date,
      default: Date.now
    }
  }
],

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("tasks", TaskSchema);
