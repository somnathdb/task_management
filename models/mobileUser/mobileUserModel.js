const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require("bcryptjs");
const SALT_I = 10;

const mobileUserSchema = new Schema({
    number: {
        type: String,
        default:null
    },
    name:{
        type:String
    },
    password: {
        type: String
    },
    imageUrl:{
        type: String,
        default:null
    },
    fcmToken:{
        type:[String],
        default:[]
    },
    email:{
        type:String
    },
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }],
    role:{
        type:String,
        default :"employee"
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

mobileUserSchema.pre("save",function(next){
    var mobileuser = this;
    if(mobileuser.isModified("password")){
        bcrypt.genSalt(SALT_I,function(err,salt){
            if(err){
                return next(err)
            }
            bcrypt.hash(mobileuser.password,salt,function(err,hash){
                if(err){
                    return next(err)
                }
                mobileuser.password = hash;
                next();
            })
        })
    }else{
        next();
    }
})


mobileUserSchema.methods.change_password = async (candidatePassword) => {
    //Creating a Hash
    var salt = bcrypt.genSaltSync(SALT_I);
    var hash = bcrypt.hashSync(candidatePassword, salt);
    return hash;
};

mobileUserSchema.methods.comparepassword = async (candidatePassword,cb) => {
   bcrypt.compare(candidatePassword,this.password,function(err,isMatch){
       if(err){
           return cb(err)
       }
       cb(null,isMatch)
   })
};

module.exports = mongoose.model('mobileusers', mobileUserSchema)