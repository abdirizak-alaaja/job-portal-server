const { jobModel, validateJobs } = require('../models/jobs.service');

// get all jobs
const GET = async ( req, res ) => {
    try{
        const jobs = await jobModel.find().populate("createdBy", "name email").select('title company description deadline createdBy');
        res.status(200).json({
            status: "true",
            message: "Jobs found successfully",
            data: jobs
        });
    }catch(err){
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    };
}

// get by id 
const GETBYID = async ( req, res ) => {
    try{
        const id = req.params.id;
        const job = await jobModel.findById(id).populate("createdBy", "name email");
        if(!job) {
            return res.status(404).json({ status: "false", message: "Job not found" });
        }
        res.status(200).json({
            status: "true",
            message: "Job found successfully",
            data: job
        });
    }catch(err){
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// create job
const POST = async (req, res)=>{
    try{
        const { title, company, description, deadline } = req.body;

        // Maadaama middleware-ku uu hubiyay inuu yahay 'company', ID-ga halkan ayaan ka helaynaa
        const createdBy = req.user.id;

        const { error } = validateJobs({ title, company, description, deadline, createdBy });
        if (error) {
            return res.status(400).json({ status: "false", message: error.details[0].message });
        }

        const newJob = new jobModel({
            title,
            company,
            description,
            deadline,
            createdBy
        });
        await newJob.save();

        res.status(201).json({
            status: "true",
            message: "Job created successfully",
            data: newJob
        });
        
    }catch(err){
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// delete jobs
const DELETE = async (req , res) => {
    try{
        const id = req.params.id;
        const job = await jobModel.findById(id);

        if(!job){
            return res.status(404).json({ status: "false", message: "Job not found." });
        }

        // Amni: Kaliya shirkaddii abuurtay shaqada ayaa tirtiri karta
        if(job.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ status: "false", message: "Unauthorized. You can only delete your own jobs." });
        }

        await jobModel.findByIdAndDelete(id);

        res.status(200).json({
            status: "true",
            message: "Job deleted successfully"
        });
    }catch(err){
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

module.exports = { 
    GET, 
    GETBYID, 
    POST, 
    DELETE 
};
