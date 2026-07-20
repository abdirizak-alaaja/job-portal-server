const mongoose = require('mongoose');
const joi = require('joi');

const applicationSchema = new mongoose.Schema({
    jobId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "job",
        required : true
    },
    status:{
        type: String,
        enum: ["applied","not aipplied"],
        required: true
    }, 
    studentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    }
    
});

const appliactionModel = mongoose.model("application",applicationSchema);

function validateJobs (application){
    const schema = joi.object({
        jobId:joi.string().required().max(50).min(6),
        status: joi.string().required().min(6).max(30),
        studentId: joi.string().required().min(5),

    })

    return(schema.validate(application));
}

module.exports = {
    appliactionModel,
    validateJobs
}