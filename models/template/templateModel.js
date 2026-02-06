const mongoose = require('mongoose')
const Schema = mongoose.Schema

const templateSchema = new Schema({
    templateName:{
        type:String
    },
    subTask: [
      {
        type: Schema.Types.ObjectId,
        ref: "subtasks"
      }
    ],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('templates', templateSchema)