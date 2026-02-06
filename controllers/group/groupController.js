const groupModel = require('../../models/group/groupModel');
const labelModel = require('../../models/label/labelModel');
const taskModel = require('../../models/task/taskModel');
const admin = require("../../config/firebaseAdmin");
const mongoose = require('mongoose')

exports.CreateLabel = async (req, res, next) => {
    try {
        const body = req.body
        let checkLabel = await labelModel.findOne({
            name: body.name
        })
        if (checkLabel) {
            res.status(400).json({
                title: "error",
                message: "Label Already Exites",
                status: false
            })
        }else {
            var newLabel = new labelModel({
                ...req.body
            })
            let saveData = await newLabel.save()
            if (saveData) {
                res.status(201).json({
                    title: "success",
                    message: "Label Successfully Created",
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

exports.CreateGroup = async (req, res, next) => {
    try {
        const body = req.body
        let checkGroup = await groupModel.findOne({
            groupName: body.groupName
        })
        if (checkGroup) {
            res.status(400).json({
                title: "error",
                message: "Group Already Exites",
                status: false
            })
        }else {
            var newGroup = new groupModel({
                ...req.body
            })
            let saveData = await newGroup.save()
            if (saveData) {
                res.status(201).json({
                    title: "success",
                    message: "Group Successfully Created",
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

exports.updateGroupDetails= async (req, res, next) => {
    try {
        const body = req.body;
        console.log("43",body)
        let records = await groupModel.findOneAndUpdate({
            _id: body._id
        },{$set:{
            groupName:body.groupName
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

exports.deleteGroupById = async (req, res, next) => {
    try {
        const body = req.query
        let data = await groupModel.findOneAndRemove({
            _id:body.id
        })
        if (data) {
            res.status(200).json({
                title: "success",
                message: "Group Successfully Deleted",
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

exports.getGroupById = async (req, res, next) => {
    try {
        const body = req.query
        let data = await groupModel.findOne({
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


exports.getAllGroup = async (req, res) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = 10;

    const data = await groupModel.aggregate([
      {
        $lookup: {
          from: "mobileusers",           // collection name
          localField: "_id",
          foreignField: "groups",
          as: "users"
        }
      },
      { $skip: (pageNo - 1) * limit },
      { $limit: limit }
    ]);

    res.status(200).json({
      title: "success",
      message: "Data Successfully Fetched",
      status: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      title: "error",
      message: "Internal Server Error",
      status: false,
      error: err.message
    });
  }
};


exports.getAllLabel = async (req, res) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = 10;

    const data = await labelModel.aggregate([
      {
        $lookup: {
          from: "mobileusers",           // collection name
          localField: "_id",
          foreignField: "groups",
          as: "users"
        }
      },
      { $skip: (pageNo - 1) * limit },
      { $limit: limit }
    ]);

    res.status(200).json({
      title: "success",
      message: "Data Successfully Fetched",
      status: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      title: "error",
      message: "Internal Server Error",
      status: false,
      error: err.message
    });
  }
};

exports.getAllTaskByGroupId = async (req, res) => {
  try {
    console.log("225",req.query)
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = 10;

    const data = await taskModel.aggregate([
        {
            $match:{
                groupId:mongoose.Types.ObjectId(req.query.id)
            }
        },
      { $skip: (pageNo - 1) * limit },
      { $limit: limit }
    ]);

    res.status(200).json({
      title: "success",
      message: "Data Successfully Fetched",
      status: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      title: "error",
      message: "Internal Server Error",
      status: false,
      error: err.message
    });
  }
};