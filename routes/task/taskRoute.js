const express = require("express");
const router = express.Router();
const taskController = require("../../controllers/task/taskController");
const upload = require("../../middlewares/taskUpload");

router.post(
  "/create",
  upload.array("files", 5),
  taskController.createTask
);

router.post(
  "/update",
  upload.array("files", 5),
  taskController.updateTask
);
router.post(
  "/updateTaskStatus",
  taskController.updateTaskStatus
);

router.get('/getTaskById', taskController.getTaskById)
router.get("/", taskController.getAllTasks);
router.get("/pending", taskController.getPendingTasks);
router.get("/completed", taskController.getCompletedTasks);
router.get("/inprogress", taskController.getInprogressTasks);
router.get("/getUpcomingTasks", taskController.getUpcomingTasks);
router.get("/mypending", taskController.getMyPendingTasks);
router.get("/mycompleted", taskController.getMyCompletedTasks);
router.get("/myinprogress", taskController.getMyInProgressTasks);
router.get("/mygetUpcomingTasks", taskController.getMyUpcomingTasks);
router.get("/getMyTasks", taskController.getMyTasks);
router.get('/deleteTaskById', taskController.deleteTaskById)
module.exports = router;
