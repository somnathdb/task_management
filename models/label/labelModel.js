const mongoose = require('mongoose')
const Schema = mongoose.Schema

const labelSchema = new Schema({
    name:{
        type:String
    },

    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('labels', labelSchema)