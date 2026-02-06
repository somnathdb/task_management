const mongoose = require('mongoose')
const Schema = mongoose.Schema

const groupSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        default:null,
         ref: "User"
    },
    groupName:{
        type:String
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('groups', groupSchema)