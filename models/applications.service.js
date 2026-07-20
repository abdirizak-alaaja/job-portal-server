const mongoose = require('mongoose');
const joi = require('joi');

const applicationSchema = new mongoose.Schema({
    jobId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "jobs",
        required : true
    },
    status:{
        type: String,
        enum: ["pending","accepted","rejected"],
        default: "pending",
        required: true
    },
    studentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    }
    
});

const appliactionModel = mongoose.model("application",applicationSchema);

function validateApplication (application){
    const schema = joi.object({
        jobId:joi.string().required(),
        status: joi.string().valid("pending","accepted","rejected").optional(),
        studentId: joi.string().required(),
    })

    return(schema.validate(application));
}

module.exports = {
    appliactionModel,
    validateApplication
}