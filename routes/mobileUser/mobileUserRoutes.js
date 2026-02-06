const express = require("express")
const router = express.Router()
const mobileUserController = require('../../controllers/mobileUser/mobileUserController')
const CheckAuth = require('../../auth/check-auth')

router.post('/addMobileUser', mobileUserController.addMobileUser)

router.post('/mobileUserLogin', mobileUserController.mobileUserLogin)

router.post('/updatePassword',mobileUserController.updateUserPassword)

router.get('/getAllMobileUser',mobileUserController.getAllMobileUser)

router.get('/getUserById', mobileUserController.getUserById)

router.get('/deleteUserById', mobileUserController.deleteUserById)

router.post('/updateUserById', mobileUserController.updateUserById)

router.post('/sendNotification',mobileUserController.sendNotificationToUser)

module.exports = router