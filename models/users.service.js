const mongoose = require('mongoose');
const joi = require('joi');

const usersSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,

    },
    password:{
        type: String,
        required: true,

    },
    role:{
        enum:['student','company'],
        type: String,
        required: true
    },
    skills:{
        type: [String],
        required: true,
    },
    status:{
        type: String,
        default: 'active',
        enum: ['active', 'deleted']
    }
},{ timestamps: true })

const usersModel = mongoose.model('Users',usersSchema);

function validateUsers(users){
    const schema =joi.object({
        name:joi.string().required(),
        email:joi.string().email().required(),
        password:joi.string().min(6).required(),
        role:joi.string().valid('student', 'company').required(),
        skills:joi.array().items(joi.string()),
        status:joi.string().valid('active', 'deleted').optional()
    })
    return(schema.validate(users))
}
module.exports = {
    usersModel,
    validateUsers
};