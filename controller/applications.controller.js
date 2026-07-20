const { appliactionModel, validateApplication } = require('../models/applications.service');
const { jobModel } = require('../models/jobs.service');
const HTTP_STATUS = require('../constants/httpStatusCodes');

const createApplication = async (req, res, next) => {
    try {
        const { jobId } = req.body;
        const studentId = req.user.id; // Laga helay token-ka

        const { error } = validateApplication({ jobId, studentId });
        if (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: error.details[0].message });
        }

        // Hubi in shaqadu jirto
        const jobExists = await jobModel.findById(jobId);
        if (!jobExists) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Job not found." });
        }

        // Hubi haddii uu ardaygu mar hore codsaday shaqadan
        const alreadyApplied = await appliactionModel.findOne({ jobId, studentId });
        if (alreadyApplied) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: "You have already applied for this job." });
        }

        const newApplication = new appliactionModel({
            jobId,
            studentId,
            status: 'pending' // Default ahaan waa pending
        });

        await newApplication.save();

        res.status(HTTP_STATUS.CREATED).json({
            status: "true",
            message: "Application submitted successfully",
            data: newApplication
        });
    } catch (err) {
        next(err);
    }
};

const getApplications = async (req, res, next) => {
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

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Applications retrieved successfully",
            data: applications
        });
    } catch (err) {
        next(err);
    }
};

const getApplicationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await appliactionModel.findById(id)
            .populate("jobId", "title company createdBy")
            .populate("studentId", "name email");

        if (!application) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Application not found" });
        }

        // Amni: Kaliya qofkii codsaday ama shirkadii shaqada lahayd ayaa arki karta
        if (application.studentId._id.toString() !== req.user.id && application.jobId.createdBy.toString() !== req.user.id) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized to view this application." });
        }

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Application retrieved successfully",
            data: application
        });
    } catch (err) {
        next(err);
    }
};

const updateApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // tusaale: 'accepted' ama 'rejected'

        const application = await appliactionModel.findById(id).populate("jobId");
        if (!application) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Application not found" });
        }

        // Amni: Kaliya shirkaddii shaqada iska lahayd ayaa bedeli karta status-ka
        if (application.jobId.createdBy.toString() !== req.user.id) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized. Only the job owner can update status." });
        }

        application.status = status;
        await application.save();

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Application status updated successfully",
            data: application
        });
    } catch (err) {
        next(err);
    }
};

const deleteApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await appliactionModel.findById(id);

        if (!application) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Application not found" });
        }

        // Kaliya ardayga codsaday ayaa kansali kara (tirtiri kara)
        if (application.studentId.toString() !== req.user.id) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized to delete this application." });
        }

        await appliactionModel.findByIdAndDelete(id);

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Application deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { 
    createApplication, 
    getApplications, 
    getApplicationById, 
    updateApplicationStatus, 
    deleteApplication 
};