const { jobModel, validateJobs } = require('../models/jobs.service');
const HTTP_STATUS = require('../constants/httpStatusCodes');

// get all jobs
const GET = async ( req, res, next ) => {
    try{
        const jobs = await jobModel.find().populate("createdBy", "name email").select('title company description deadline createdBy');
        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Jobs found successfully",
            data: jobs
        });
    }catch(err){
        next(err);
    };
}

// get by id 
const GETBYID = async ( req, res, next ) => {
    try{
        const id = req.params.id;
        const job = await jobModel.findById(id).populate("createdBy", "name email");
        if(!job) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Job not found" });
        }
        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Job found successfully",
            data: job
        });
    }catch(err){
        next(err);
    }
}

// create job
const POST = async (req, res, next)=>{
    try{
        const { title, company, description, deadline } = req.body;

        // Maadaama middleware-ku uu hubiyay inuu yahay 'company', ID-ga halkan ayaan ka helaynaa
        const createdBy = req.user.id;

        const { error } = validateJobs({ title, company, description, deadline, createdBy });
        if (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: error.details[0].message });
        }

        const newJob = new jobModel({
            title,
            company,
            description,
            deadline,
            createdBy
        });
        await newJob.save();

        res.status(HTTP_STATUS.CREATED).json({
            status: "true",
            message: "Job created successfully",
            data: newJob
        });
        
    }catch(err){
        next(err);
    }
}

// delete jobs
const DELETE = async (req , res, next) => {
    try{
        const id = req.params.id;
        const job = await jobModel.findById(id);

        if(!job){
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Job not found." });
        }

        // Amni: Kaliya shirkaddii abuurtay shaqada ayaa tirtiri karta
        if(job.createdBy.toString() !== req.user.id) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized. You can only delete your own jobs." });
        }

        await jobModel.findByIdAndDelete(id);

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Job deleted successfully"
        });
    }catch(err){
        next(err);
    }
}

module.exports = { 
    GET, 
    GETBYID, 
    POST, 
    DELETE 
};
