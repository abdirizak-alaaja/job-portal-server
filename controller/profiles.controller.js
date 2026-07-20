const { profileModel, validateProfile } = require('../models/profiles.service');
const HTTP_STATUS = require('../constants/httpStatusCodes');

const createProfile = async (req, res, next) => {
    try {
        const { bio, education, experience, CV } = req.body;
        const userId = req.user.id; // Laga soo qaatay Token-ka

        const { error } = validateProfile({ bio, education, experience, CV, userId });
        if (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: error.details[0].message });
        }

        // Hubi haddii uu horey u lahaa profile
        const existingProfile = await profileModel.findOne({ userId });
        if (existingProfile) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: "Profile already exists for this user." });
        }

        const newProfile = new profileModel({
            userId,
            bio,
            education,
            experience,
            CV
        });

        await newProfile.save();

        res.status(HTTP_STATUS.CREATED).json({
            status: "true",
            message: "Profile created successfully",
            data: newProfile
        });
    } catch (err) {
        next(err);
    }
};

// get all profiles
const GET = async ( req, res, next ) => {
    try{
        const profiles = await profileModel.find().populate("userId", "name email role");
        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Profiles found successfully",
            data: profiles
        });
    }catch(err){
        next(err);
    }
}

const getProfileByUserId = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const profile = await profileModel.findOne({ userId }).populate("userId", "name email role skills");

        if (!profile) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Profile not found" });
        }

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Profile retrieved successfully",
            data: profile
        });
    } catch (err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { bio, education, experience, CV } = req.body;

        const profile = await profileModel.findById(id);
        if (!profile) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Profile not found" });
        }

        // Amni: Hubi in profile-kan uu isagu leeyahay
        if (profile.userId.toString() !== req.user.id) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized to update this profile." });
        }

        const { error } = validateProfile({ bio, education, experience, CV, userId: profile.userId.toString() });
        if (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: error.details[0].message });
        }

        const updatedProfile = await profileModel.findByIdAndUpdate(
            id,
            { bio, education, experience, CV },
            { new: true }
        );

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Profile updated successfully",
            data: updatedProfile
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { 
    createProfile, 
    getProfileByUserId, 
    updateProfile, 
    GET };
