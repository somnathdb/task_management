const express = require("express")
const router = express.Router()
const groupController = require('../../controllers/group/groupController')
const CheckAuth = require('../../auth/check-auth')

router.post('/CreateGroup', groupController.CreateGroup)
router.post('/CreateLabel', groupController.CreateLabel)

router.get('/deleteGroupById', groupController.deleteGroupById)

router.post('/updateGroupById', groupController.updateGroupDetails)

router.get('/getAllGroup',groupController.getAllGroup)
router.get('/getAllLabel',groupController.getAllLabel)

router.get('/getGroupById', groupController.getGroupById)

router.get(
  '/getAllTaskByGroupId',
  groupController.getAllTaskByGroupId
);

module.exports = router