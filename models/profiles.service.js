const mongoose = require('mongoose');
const joi = require('joi');

const profileSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    bio:{
        type : String,
        required : true
    },
    education:{
        type: String,
        required: true
    },
    experience:{
        type: String,
        required: true
    }, 
    CV:{
        type: String,
        required: true
    }
},{ timestamps: true }) ;

const profileModel = mongoose.model("profile",profileSchema);

function validateProfile (profile){
    const schema = joi.object({
        bio:joi.string().required().max(50).min(6),
        education: joi.string().required().min(6).max(30),
        experience: joi.string().required().min(5),
        CV: joi.string().required(),
        userId: joi.string().required()
    })

    return(schema.validate(profile));
}
module.exports = {
    profileModel,
    validateProfile,
}
