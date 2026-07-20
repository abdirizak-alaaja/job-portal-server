const { appliactionModel } = require('../models/applications.service');
const { jobModel } = require('../models/jobs.service');

const createApplication = async (req, res) => {
    try {
        const { jobId } = req.body;
        const studentId = req.user.id; // Laga helay token-ka

        // Hubi in shaqadu jirto
        const jobExists = await jobModel.findById(jobId);
        if (!jobExists) {
            return res.status(404).json({ status: "false", message: "Job not found." });
        }

        // Hubi haddii uu ardaygu mar hore codsaday shaqadan
        const alreadyApplied = await appliactionModel.findOne({ jobId, studentId });
        if (alreadyApplied) {
            return res.status(400).json({ status: "false", message: "You have already applied for this job." });
        }

        const newApplication = new appliactionModel({
            jobId,
            studentId,
            status: 'pending' // Default ahaan waa pending
        });

        await newApplication.save();

        res.status(201).json({
            status: "true",
            message: "Application submitted successfully",
            data: newApplication
        });
    } catch (err) {
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

const getApplications = async (req, res) => {
    try {
        let applications;
        
        // Haddii uu yahay shirkad, tusi kaliya application-ada loo soo diray shaqooyinkeeda
        if (req.user.role === 'company') {
            const myJobs = await jobModel.find({ createdBy: req.user.id }).select('_id');
            const jobIds = myJobs.map(job => job._id);
            applications = await appliactionModel.find({ jobId: { $in: jobIds } })
                .populate("jobId", "title company")
                .populate("studentId", "name email");
        } else {
            // Haddii uu yahay admin ama ardayga qudhiisa (Ardaygu wuxuu arki karaa kuwisa kaliya haddii loo xaddido)
            applications = await appliactionModel.find()
                .populate("jobId", "title company")
                .populate("studentId", "name email");
        }

        res.status(200).json({
            status: "true",
            message: "Applications retrieved successfully",
            data: applications
        });
    } catch (err) {
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await appliactionModel.findById(id)
            .populate("jobId", "title company createdBy")
            .populate("studentId", "name email");

        if (!application) {
            return res.status(404).json({ status: "false", message: "Application not found" });
        }

        // Amni: Kaliya qofkii codsaday ama shirkadii shaqada lahayd ayaa arki karta
        if (application.studentId._id.toString() !== req.user.id && application.jobId.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ status: "false", message: "Unauthorized to view this application." });
        }

        res.status(200).json({
            status: "true",
            message: "Application retrieved successfully",
            data: application
        });
    } catch (err) {
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // tusaale: 'accepted' ama 'rejected'

        const application = await appliactionModel.findById(id).populate("jobId");
        if (!application) {
            return res.status(404).json({ status: "false", message: "Application not found" });
        }

        // Amni: Kaliya shirkaddii shaqada iska lahayd ayaa bedeli karta status-ka
        if (application.jobId.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ status: "false", message: "Unauthorized. Only the job owner can update status." });
        }

        application.status = status;
        await application.save();

        res.status(200).json({
            status: "true",
            message: "Application status updated successfully",
            data: application
        });
    } catch (err) {
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await appliactionModel.findById(id);

        if (!application) {
            return res.status(404).json({ status: "false", message: "Application not found" });
        }

        // Kaliya ardayga codsaday ayaa kansali kara (tirtiri kara)
        if (application.studentId.toString() !== req.user.id) {
            return res.status(403).json({ status: "false", message: "Unauthorized to delete this application." });
        }

        await appliactionModel.findByIdAndDelete(id);

        res.status(200).json({
            status: "true",
            message: "Application deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

module.exports = { 
    createApplication, 
    getApplications, 
    getApplicationById, 
    updateApplicationStatus, 
    deleteApplication 
};