const subTaskModel = require('../../models/subTask/subTaskModel')
const admin = require("../../config/firebaseAdmin");

exports.CreateSubTask = async (req, res, next) => {
    try {
        const body = req.body
        let checkSubTask = await subTaskModel.findOne({
            subTaskName: body.subTaskName
        })
        if (checkSubTask) {
            res.status(400).json({
                title: "error",
                message: "Sub Task Already Exites",
                status: false
            })
        }else {
            var newSubTask = new subTaskModel({
                ...req.body
            })
            let saveData = await newSubTask.save()
            if (saveData) {
                res.status(201).json({
                    title: "success",
                    message: "SubTask Successfully Created",
                    status: true
                })
            }
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

exports.updateSubTaskDetails= async (req, res, next) => {
    try {
        const body = req.body;
        let records = await subTaskModel.findOneAndUpdate({
            _id: body._id
        },{$set:{
            subTaskName:body.subTaskName
        }})
        if (records) {
            return res.status(200).json({
                title: "success",
                message: "Data Updated",
                status: true
            })
        } 
    } catch (err) {
        return res.status(500).json({
            title: "error",
            message: "Internal Server Error",
            status: false
        })
    }
};

exports.deleteSubTaskById = async (req, res, next) => {
    try {
        const body = req.query
        let data = await subTaskModel.findOneAndRemove({
            _id:body.id
        })
        if (data) {
            res.status(200).json({
                title: "success",
                message: "SubTask Successfully Deleted",
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



exports.getAllSubTask = async (req, res, next) => {
    try {
        let data = await subTaskModel.find().limit(parseInt(10 * 1)).skip((parseInt(req.query.pageNo) - 1) * 10)
        if (data) {
            res.status(200).json({
                title: "success",
                message: "Data Successfully Fetched",
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

exports.getSubTaskById = async (req, res, next) => {
    try {
        const body = req.query
        let data = await subTaskModel.findOne({
            _id:body.id
        })
        if (data) {
            res.status(200).json({
                title: "success",
                message: "Data Successfully Fetched",
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