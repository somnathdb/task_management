const mongoose = require('mongoose')
const Schema = mongoose.Schema

const subTaskSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        default:null
    },
    subTaskName:{
        type:String
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('subtasks', subTaskSchema)