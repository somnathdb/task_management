const Task = require("../../models/task/taskModel");
const TemplateModel = require('../../models/template/templateModel');
const groupModel = require('../../models/group/groupModel');
const mobileUserModel = require('../../models/mobileUser/mobileUserModel');
const subTask = require("../../models/subTask/subTaskModel");
const jwt = require("jsonwebtoken");
const keys = require('../../config/keys').keys
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const admin = require("../../config/firebaseAdmin");
const sendPushNotifications = require("../../bin/sendPushNotifaction");
const sendPushNotification = async (userIds, title, body) => {
  console.log("🔔 Sending notification to:", userIds);

  if (!userIds || !userIds.length) {
    console.log("❌ No users to notify");
    return;
  }

  const users = await mobileUserModel.find({
    _id: { $in: userIds }
  }).select("fcmToken");

  console.log("Users found:", users.length);

  const tokens = users.flatMap(u => u.fcmToken || []);

  console.log("FCM Tokens:", tokens);

  if (!tokens.length) {
    console.log("❌ No FCM tokens found");
    return;
  }

  const message = {
    tokens,
    notification: { title, body },
    android: { priority: "high" }
  };

  const response = await admin.messaging().sendEachForMulticast(message);

  console.log("FCM Response:", response);

  return response;
};

exports.createTask = async (req, res) => {
  try {
    const {
      userId,
      taskName,
      description,
      assignDate,
      dueDate,
      priority,
      status,
      taskType,
      groupId,
    } = req.body;

    const assignTo = JSON.parse(req.body.assignTo || "[]");
    const labels = JSON.parse(req.body.labels || "[]");
    const subTaskIds = JSON.parse(req.body.subTasks || "[]");
    const subTasksModelId = JSON.parse(req.body.subTasks || "[]");

    const id = mongoose.Types.ObjectId(subTaskIds[0]);

    const templatesTask = await TemplateModel
      .findById(id)
      .select("subTask");

    const subTasksId = await subTask.find({
      _id: { $in: templatesTask.subTask }
    }).select("_id subTaskName");

    const subTasks = subTasksId.map(task => ({
      taskId: task._id,
      taskName: task.subTaskName,
      completed: false
    }));

    const files = req.files
      ? req.files.map(file => `uploads/tasks/${file.filename}`)
      : [];

    // ✅ Create task
    const task = await Task.create({
      userId,
      taskName,
      description,
      assignDate,
      dueDate,
      assignTo,
      labels,
      subTasks,
      priority,
      taskType,
      status,
      files,
      subTasksModelId,
      groupId
    });

    /* ===============================
       🔔 PUSH NOTIFICATIONS
    ================================ */

    // 1️⃣ Notify assigned users
    await sendPushNotification(
      assignTo,
      "New Task Assigned",
      `You have been assigned a task: ${taskName}`
    );
        console.log("assignTo:", assignTo);
  console.log("groupId:", groupId);
    // 2️⃣ Notify group members
    if (groupId) {
      const group = await groupModel
        .findById(groupId)
        .select("members");

      if (group?.members?.length) {
        // avoid duplicate notifications
        const uniqueUsers = [
          ...new Set([...group.members.map(String), ...assignTo.map(String)])
        ];

        await sendPushNotification(
          uniqueUsers,
          "New Task Created",
          `A new task "${taskName}" was created in your group`
        );
      }
    }

    return res.status(201).json({
      status: true,
      message: "Task created successfully",
      data: task
    });

  } catch (error) {
    console.error("Create Task Error:", error);
    return res.status(500).json({
      status: false,
      message: "Error creating task",
      error: error.message
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const {
      taskId,
      taskName,
      description,
      assignDate,
      dueDate,
      priority,
      status,
      taskType,
        groupId,
    } = req.body;

    // Parse arrays
    const assignTo = JSON.parse(req.body.assignTo || "[]");
    const labels = JSON.parse(req.body.labels || "[]");
    const subTasks = JSON.parse(req.body.subTasks || "[]");
    const existingFiles = JSON.parse(req.body.existingFiles || "[]");

    // New uploaded files
    const newFiles = req.files
      ? req.files.map((file) => `uploads/tasks/${file.filename}`)
      : [];

    const files = [...existingFiles, ...newFiles];

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        taskName,
        description,
        assignDate,
        dueDate,
        assignTo,
        labels,
        subTasks,
        priority,
        taskType,
        status,
        files,
          groupId,
      },
      { new: true }
    );

    res.json({
      status: true,
      message: "Task updated successfully",
      data: task,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Error updating task",
      error: error.message,
    });
  }
};

exports.deleteTaskById = async (req, res, next) => {
    try {
        const body = req.query
        let data = await Task.findOneAndRemove({
            _id:body.id
        })
        if (data) {
            res.status(200).json({
                title: "success",
                message: "Task Successfully Deleted",
                status: true
            })
        }
    } catch (err) {
        res.status(500).json({
            title: "error",
            message: "Internal Server Error",
            status: false,
            error: err
        })
    }
}


exports.getTaskById = async (req, res, next) => {
    try {
        const body = req.query
        let data = await Task.findOne({
            _id:body.id
        }).populate("userId", "name email")
      .populate("assignTo", "name email")
      .populate("subTasks","subTaskName");
        if (data) {
            res.status(200).json({
                title: "success",
                message: "Task Successfully Fetched",
                status: true,
                data: data
            })
        }
    } catch (err) {
        res.status(200).json({
            title: "error",
            message: "Internal Server Error",
            status: false,
            error: err
        })
    }
}

exports.getAllTasks = async (req, res) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = 10;

    const tasks = await Task.find({ active: true })
      .populate("userId", "name email")
      .populate("assignTo", "name email")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      count: tasks.length,
      data: tasks
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId, userId, subTasks, comment, subTaskId } = req.body;

    if (!taskId || !Array.isArray(subTasks)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    /* ---------------- Decide Task Status ---------------- */

    const allSubTasksCompleted =
      subTasks.length > 0 &&
      subTasks.every(st => st.completed === true);

    const taskStatus = allSubTasksCompleted
      ? "completed"
      : "in-progress";

    /* ---------------- Update Data ---------------- */

    const updateData = {
      subTasks,
      status: taskStatus,
    };

    if (comment && comment.trim() !== "") {
      updateData.$push = {
        comments: {
          subTaskId,
          comment,
          commentedBy: userId,
        },
      };
    }

    /* ---------------- Update Task ---------------- */

    const task = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    /* ---------------- Fetch Admin Tokens ---------------- */

    const admins = await mobileUserModel.find({
      role: "admin",
      fcmToken: { $exists: true, $ne: null },
    }).select("fcmToken");

    const adminTokens = admins.map(a => a.fcmToken);

    /* ---------------- Assigned Users Tokens ---------------- */

    const assignedTokens = task.assignTo
      .map(u => u.fcmToken)
      .filter(Boolean);

    /* ---------------- Merge & Deduplicate ---------------- */

    const finalTokens = [
      ...new Set([...adminTokens, ...assignedTokens].flat().filter(Boolean))
    ];

    /* ---------------- Send Notification ---------------- */

    await sendPushNotifications(
      finalTokens,
      "Task Updated",
      `Task "${task.title}" marked as ${taskStatus}`,
      {
        taskId: task._id.toString(),
        taskName: task.title,
        status: taskStatus,
      }
    );

    /* ---------------- Response ---------------- */

    res.status(200).json({
      message: "Task status updated successfully",
      data: task,
    });

  } catch (err) {
    console.error("❌ updateTaskStatus error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


// exports.updateTaskStatus = async (req, res) => {
//   try {
//     const { taskId, userId, subTasks, comment,subTaskId } = req.body;

//     if (!taskId || !Array.isArray(subTasks)) {
//       return res.status(400).json({ message: "Invalid payload" });
//     }

//     /* ---------------- Update Task ---------------- */
//     const updateData = { subTasks };

//     if (comment && comment.trim() !== "") {
//       updateData.$push = {
//         comments: {
//           subTaskId,
//           comment,
//           commentedBy: userId,
//         },
//       };
//     }
//       const task = await Task.findByIdAndUpdate(
//       taskId,
//       {
//         ...updateData,
//         status: updateData.status ?? "in-progress",
//       },
//       { new: true }
//     );

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     /* ---------------- Fetch Admin Tokens ---------------- */

//     const admins = await mobileUserModel.find({
//       role: "admin",
//       fcmToken: { $exists: true, $ne: null },
//     }).select("fcmToken");

//     const adminTokens = admins.map(a => a.fcmToken);

//     /* ---------------- Assigned Users Tokens ---------------- */

//     const assignedTokens = task.assignTo
//       .map(u => u.fcmToken)
//       .filter(Boolean);

//     /* ---------------- Merge & Deduplicate ---------------- */

//     const allTokens = [...new Set([
//       ...adminTokens,
//       ...assignedTokens,
//     ])];

//     /* ---------------- Send Notification ---------------- */
// const finalTokens = [...new Set(allTokens.flat().filter(Boolean))];
//     await sendPushNotifications(
//       finalTokens,
//       "Task Updated",
//       `Task "${task.title}" status updated`,
//       {
//         taskId: task._id.toString(),
//         taskName: task.title,
//       }
//     );

//     /* ---------------- Response ---------------- */

//     res.status(200).json({
//       message: "Task status updated successfully",
//       data: task,
//     });

//   } catch (err) {
//     console.error("❌ updateTaskStatus error:", err);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: err.message,
//     });
//   }
// };

exports.getPendingTasks = async (req, res) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = 10;

    const tasks = await Task.find({ status:"pending",active: true })
      .populate("userId", "name email")
      .populate("assignTo", "name email")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      count: tasks.length,
      data: tasks
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
};

exports.getCompletedTasks = async (req, res) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = 10;

    const tasks = await Task.find({ status:"completed",active: true })
      .populate("userId", "name email")
      .populate("assignTo", "name email")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      count: tasks.length,
      data: tasks
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
};

exports.getInprogressTasks = async (req, res) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = 10;

    const tasks = await Task.find({ status:"in-progress",active: true })
      .populate("userId", "name email")
      .populate("assignTo", "name email")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      count: tasks.length,
      data: tasks
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
       if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Authorization token missing",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];
    // 3️⃣ Verify & decode token
    const decoded = jwt.verify(token, keys);
    // 4️⃣ Extract userId from token
    const userId = decoded.id;
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = 10;
    const id = req.headers.authorization;
    const tasks = await Task.find({ userId:userId,active: true })
      .populate("userId", "name email")
      .populate("assignTo", "name email")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      count: tasks.length,
      data: tasks
    });

  } catch (err) {
    console.log("468",err)
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
};

exports.getUpcomingTasks = async (req, res) => {
  try {
    // Start of today (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      assignDate: { $gte: today }
    })
      .populate("userId", "name email")
      .populate("assignTo", "name email")
      .sort({ assignDate: 1 }); // optional: upcoming first

    res.json({
      status: true,
      count: tasks.length,
      data: tasks
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
};


exports.getMyPendingTasks = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
       if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Authorization token missing",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];
    // 3️⃣ Verify & decode token
    const decoded = jwt.verify(token, keys);
    // 4️⃣ Extract userId from token
    const userId = decoded.id;
    console.log("626",userId)
    const tasks = await Task.find({ assignTo:mongoose.Types.ObjectId(userId),status:"pending",active: true  })
      .populate("userId", "name email")
      .populate("assignTo", "name email")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      count: tasks.length,
      data: tasks
    });

  } catch (err) {
    console.log("468",err)
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
};

exports.getMyCompletedTasks = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
       if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Authorization token missing",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];
    // 3️⃣ Verify & decode token
    const decoded = jwt.verify(token, keys);
    // 4️⃣ Extract userId from token
    const userId = decoded.id;
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = 10;
    const id = req.headers.authorization;
    const tasks = await Task.find({ assignTo:mongoose.Types.ObjectId(userId),status:"completed",active: true  })
      .populate("userId", "name email")
      .populate("assignTo", "name email")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      count: tasks.length,
      data: tasks
    });

  } catch (err) {
    console.log("468",err)
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
};

exports.getMyUpcomingTasks = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
       if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Authorization token missing",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];
    // 3️⃣ Verify & decode token
    const decoded = jwt.verify(token, keys);
    // 4️⃣ Extract userId from token
    const userId = decoded.id;
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = 10;
    const id = req.headers.authorization;
    const tasks = await Task.find({assignTo:mongoose.Types.ObjectId(userId),assignDate: { $gte: today },active: true })
      .populate("userId", "name email")
      .populate("assignTo", "name email")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      count: tasks.length,
      data: tasks
    });

  } catch (err) {
    console.log("468",err)
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
};

exports.getMyInProgressTasks = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
       if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Authorization token missing",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];
    // 3️⃣ Verify & decode token
    const decoded = jwt.verify(token, keys);
    // 4️⃣ Extract userId from token
    const userId = decoded.id;
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = 10;
    const id = req.headers.authorization;
    const tasks = await Task.find({assignTo:mongoose.Types.ObjectId(userId),status:"in-progress",active: true  })
      .populate("userId", "name email")
      .populate("assignTo", "name email")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      count: tasks.length,
      data: tasks
    });

  } catch (err) {
    console.log("468",err)
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
};