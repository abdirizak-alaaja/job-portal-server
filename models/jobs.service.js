const mongoose = require('mongoose');
const joi = require('joi');

const jobSchema = new mongoose.Schema({
    title:{
        type : String,
        required : true
    },
    company:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    }, 
    deadline:{
        type: String,
        required: true
    }, 
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    }
},{ timestamps: true }) ;

const jobModel = mongoose.model("jobs",jobSchema);

function validateJobs (jobs){
    const schema = joi.object({
        title:joi.String().required().max(50).min(6),
        company: joi.String().required().min(6).max(30),
        description: joi.String().required().min(5),
        deadline: joi.String().required(),
        createdBy: joi.string.valid("company").required()
    })

    return(schema.validate(jobs));
}

module.exports= {
    jobModel,
    validateJobs,
}