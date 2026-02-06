const mobileUserModel = require('../../models/mobileUser/mobileUserModel')
const groupModel = require('../../models/group/groupModel')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose')
const keys = require('../../config/keys').keys
const isWithinLoginTime = require("../../until/checkLoginTime");
const admin = require("../../config/firebaseAdmin");

// exports.addMobileUser = async (req, res, next) => {
//     try {
//         const body = req.body
//         let checkNumber = await mobileUserModel.findOne({
//             number: body.number
//         })
//         if (checkNumber) {
//             res.status(400).json({
//                 title: "error",
//                 message: "Mobile Number Already Exites",
//                 status: false
//             })
//         }else {
//             var newUser = new mobileUserModel({
//                 ...req.body
//             })
//             let saveData = await newUser.save()
//             if (saveData) {
//                 res.status(201).json({
//                     title: "success",
//                     message: "User Registartion Successfully Completed",
//                     status: true
//                 })
//             }
//         }
//     } catch (err) {
//         res.status(200).json({
//             title: "error",
//             message: "Internal Server Error",
//             status: false,
//             error: err
//         })
//     }

// }

exports.addMobileUser = async (req, res) => {
  try {
    const { number, groups } = req.body;

    if (!groups || !groups.length) {
      return res.status(400).json({
        title: "error",
        message: "Group ID is required",
        status: false
      });
    }

    const groupId = groups[0]; // 🔥 important

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        title: "error",
        message: "Invalid Group ID",
        status: false
      });
    }

    // Check number
    const checkNumber = await mobileUserModel.findOne({ number });
    if (checkNumber) {
      return res.status(400).json({
        title: "error",
        message: "Mobile Number Already Exists",
        status: false
      });
    }

    // Find group
    const group = await groupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({
        title: "error",
        message: "Group not found",
        status: false
      });
    }

    // Create user
    const user = new mobileUserModel(req.body);
    const savedUser = await user.save();

    // Add user to group
    await groupModel.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: savedUser._id } }
    );

    return res.status(201).json({
      title: "success",
      message: "User Registered Successfully",
      status: true,
      data: savedUser
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      title: "error",
      message: "Internal Server Error",
      status: false
    });
  }
};

exports.mobileUserLogin = async (req, res) => {
  try {
    let { number, password, fcmToken } = req.body;

    if (!number || !password) {
      return res.status(400).json({
        status: false,
        message: "Login and password are required"
      });
    }

    number = String(number).trim();

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(number);

    const query = isEmail
      ? { email: number }
      : { number };

    const user = await mobileUserModel.findOne(query);
    if (!user || !user.password) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials"
      });
    }
        if (user.role !== "admin") {
        if (!isWithinLoginTime()) {
            return res.status(403).json({
            status: false,
            message: "Login allowed only between 9 AM and 7 PM"
            });
        }
        }


    // 🔔 SAVE FCM TOKEN (if provided)
    if (fcmToken) {
      await mobileUserModel.updateOne(
        { _id: user._id },
        { $addToSet: { fcmToken: fcmToken } } // prevents duplicates
      );
    }
    const payload = {
      id: user._id,
      name: user.name,
      number: user.number,
      email: user.email,
      role: user.role
    };
    const token = jwt.sign(payload, keys, { expiresIn: "365d" });

    res.json({
      status: true,
      message: "Login successful",
      token: "Bearer " + token,
      payload
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      status: false,
      message: "Server error"
    });
  }
};

exports.updateUserPassword = async (req, res, next) => {
    try {
        const body = req.body;
        let records = await mobileUserModel.findOne({
            number: body.number
        })
        if (records) {
            const mobileuser = new mobileUserModel();
            const hashed = await mobileuser.change_password(body.newPassword);
            if (body.newPassword === body.confirmPassword) {
                var data = await mobileUserModel.findOneAndUpdate({
                    _id: records._id
                }, {
                    $set: {
                        password: hashed
                    },
                });
                if (data) {
                    return res.status(200).json({
                        title: "success",
                        message: "User Password Successfully Updated",
                        status: true
                    });
                }
            } else {
                return res.status(401).json({
                    title: "error",
                    message: "New password and confirm password is Mismatch",
                    status: false
                })
            }
        } else {
            return res.status(400).json({
                title: "error",
                message: "Mobile Number Not Exites",
                status: false
            })
        }
    } catch (err) {
        return res.status(200).json({
            title: "error",
            message: "Internal Server Error",
            status: false
        })
    }
};

exports.getAllMobileUser = async (req, res, next) => {
    try {
        let data = await mobileUserModel.find().limit(parseInt(10 * 1)).skip((parseInt(req.query.pageNo) - 1) * 10)
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

exports.getUserById = async (req, res, next) => {
    try {
        const body = req.query
        let data = await mobileUserModel.findOne({
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


exports.updateUserDetails= async (req, res, next) => {
    try {
        const body = req.query;
        let records = await mobileUserModel.findOneAndUpdate({
            _id: body.id
        },{$set:{
            number:body.number,
            name:body.name
        }})
        if (records) {
            return res.status(200).json({
                title: "error",
                message: "Internal Server Error",
                status: false
            })
        } 
    } catch (err) {
        return res.status(200).json({
            title: "error",
            message: "Internal Server Error",
            status: false
        })
    }
};

exports.deleteUserById = async (req, res, next) => {
    try {
        const body = req.query
        let data = await mobileUserModel.findOneAndRemove({
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


// exports.updateUserById = async (req, res, next) => {
//     try {
//         const body = req.body
//             var updateUsers = await mobileUserModel.findOneAndUpdate({
//                 _id:body._id
//             },{$set:{
//                 name:body.name,
//                 number:body.number
//             }})
//             if (updateUsers) {
//                 res.status(201).json({
//                     title: "success",
//                     message: "User Data Successfully Updated",
//                     status: true
//                 })
//             }
//     } catch (err) {
//         res.status(200).json({
//             title: "error",
//             message: "Internal Server Error",
//             status: false,
//             error: err
//         })
//     }

// }

exports.updateUserById = async (req, res) => {
  try {
    const { _id } = req.body; // user id
    const { groups, number } = req.body;

    // 1. Validate User ID
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        title: "error",
        message: "Invalid User ID",
        status: false
      });
    }

    // 2. Find existing user
    const existingUser = await mobileUserModel.findById(_id);
    if (!existingUser) {
      return res.status(404).json({
        title: "error",
        message: "User not found",
        status: false
      });
    }

    // 3. Check duplicate number (if changed)
    if (number && number !== existingUser.number) {
      const checkNumber = await mobileUserModel.findOne({ number });
      if (checkNumber) {
        return res.status(400).json({
          title: "error",
          message: "Mobile Number Already Exists",
          status: false
        });
      }
    }

    let oldGroups = existingUser.groups || [];
    let newGroups = groups || [];

    // 4. Validate group IDs
    for (let gid of newGroups) {
      if (!mongoose.Types.ObjectId.isValid(gid)) {
        return res.status(400).json({
          title: "error",
          message: "Invalid Group ID",
          status: false
        });
      }
    }

    // 5. Update user data
    const updatedUser = await mobileUserModel.findByIdAndUpdate(
      _id,
      { ...req.body },
      { new: true }
    );

    // 6. Remove user from old groups
    if (oldGroups.length) {
      await groupModel.updateMany(
        { _id: { $in: oldGroups } },
        { $pull: { members: _id } }
      );
    }

    // 7. Add user to new groups
    if (newGroups.length) {
      await groupModel.updateMany(
        { _id: { $in: newGroups } },
        { $addToSet: { members: _id } }
      );
    }

    return res.status(200).json({
      title: "success",
      message: "User Updated Successfully",
      status: true,
      data: updatedUser
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      title: "error",
      message: "Internal Server Error",
      status: false
    });
  }
};
exports.logoutUser = async (req, res) => {
  const { userId, fcm_token } = req.body;

  await mobileUserModel.updateOne(
    { _id: userId },
    { $pull: { fcm_tokens: fcm_token } }
  );

  res.json({ status: true, message: "Logged out" });
};


exports.sendNotificationToUser = async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await mobileUserModel.findById(userId);

    if (!user || !Array.isArray(user.fcmToken) || user.fcmToken.length === 0) {
      return res.status(404).json({ message: "No FCM tokens found" });
    }

    const message = {
      tokens: user.fcmToken, // ✅ MULTIPLE TOKENS
      notification: {
        title,
        body,
      },
    };

    // ✅ CORRECT METHOD
    const response = await admin
      .messaging()
      .sendEachForMulticast(message);

    console.log("Notification result:", response.successCount);

    // 🔥 Remove invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens = [];

      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          invalidTokens.push(user.fcmToken[index]);
        }
      });

      if (invalidTokens.length > 0) {
        user.fcmToken = user.fcmToken.filter(
          (token) => !invalidTokens.includes(token)
        );
        await user.save();
      }
    }

    return res.json({
      success: true,
      message: "Notification sent successfully",
      sent: response.successCount,
    });

  } catch (error) {
    console.error("FCM send error:", error);
    return res.status(500).json({ message: "FCM send failed" });
  }
};



