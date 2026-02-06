const express = require("express")
const router = express.Router()
const subTaskController = require('../../controllers/subTask/subTaskController')
const CheckAuth = require('../../auth/check-auth')

router.post('/CreateSubTask', subTaskController.CreateSubTask)

router.get('/deleteSubTaskById', subTaskController.deleteSubTaskById)

router.post('/updateSubTaskDetails', subTaskController.updateSubTaskDetails)

router.get('/getAllSubTask',subTaskController.getAllSubTask)

router.get('/getSubTaskById', subTaskController.getSubTaskById)

module.exports = router