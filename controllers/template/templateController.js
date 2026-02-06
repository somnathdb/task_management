const templateModel = require('../../models/template/templateModel')
const admin = require("../../config/firebaseAdmin");

exports.CreateTemplate = async (req, res, next) => {
    try {
            var newTemplate = await templateModel.create({
                ...req.body
            })
                res.status(201).json({
                    title: "success",
                    message: "Template Successfully Created",
                    status: true,
                    data: newTemplate
                })
    } catch (err) {
        res.status(500).json({
            title: "error",
            message: "Internal Server Error",
            status: false,
            error: err
        })
    }

}

exports.updateTemplateDetails= async (req, res, next) => {
    try {
        const body = req.body;
        let records = await templateModel.findOneAndUpdate({
            _id: body._id
        },{$set:{
            templateName:body.templateName,
            subTask:body.subTask
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

exports.deleteTemplateById = async (req, res, next) => {
    try {
        const body = req.query
        let data = await templateModel.findOneAndRemove({
            _id:body.id
        })
        if (data) {
            res.status(200).json({
                title: "success",
                message: "Template Successfully Deleted",
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



exports.getAllTemplate = async (req, res, next) => {
    try {
        let data = await templateModel.find().populate("subTask", "subTaskName").limit(parseInt(10 * 1)).skip((parseInt(req.query.pageNo) - 1) * 10)
        if (data) {
            res.status(200).json({
                title: "success",
                message: "Data Successfully Fetched",
                status: true,
                data: data
            })
        }
    } catch (err) {
        console.log("87",err)
        res.status(500).json({
            title: "error",
            message: "Internal Server Error",
            status: false,
            error: err
        })
    }
}

exports.getTemplateById = async (req, res, next) => {
    try {
        const body = req.query
        let data = await templateModel.findOne({
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