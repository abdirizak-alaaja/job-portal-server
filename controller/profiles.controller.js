const { profileModel } = require('../models/profiles.service');

const createProfile = async (req, res) => {
    try {
        const { bio, education, experience, CV } = req.body;
        const userId = req.user.id; // Laga soo qaatay Token-ka

        // Hubi haddii uu horey u lahaa profile
        const existingProfile = await profileModel.findOne({ userId });
        if (existingProfile) {
            return res.status(400).json({ status: "false", message: "Profile already exists for this user." });
        }

        const newProfile = new profileModel({
            userId,
            bio,
            education,
            experience,
            CV
        });

        await newProfile.save();

        res.status(201).json({
            status: "true",
            message: "Profile created successfully",
            data: newProfile
        });
    } catch (err) {
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

// get all profiles
const GET = async ( req, res ) => {
    try{
        const profiles = await profileModel.find().populate("userId", "name email role");
        res.status(200).json({
            status: "true",
            message: "Profiles found successfully",
            data: profiles
        });
    }catch(err){
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    };
}

const getProfileByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await profileModel.findOne({ userId }).populate("userId", "name email role skills");

        if (!profile) {
            return res.status(404).json({ status: "false", message: "Profile not found" });
        }

        res.status(200).json({
            status: "true",
            message: "Profile retrieved successfully",
            data: profile
        });
    } catch (err) {
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { bio, education, experience, CV } = req.body;

        const profile = await profileModel.findById(id);
        if (!profile) {
            return res.status(404).json({ status: "false", message: "Profile not found" });
        }

        // Amni: Hubi in profile-kan uu isagu leeyahay
        if (profile.userId.toString() !== req.user.id) {
            return res.status(403).json({ status: "false", message: "Unauthorized to update this profile." });
        }

        const updatedProfile = await profileModel.findByIdAndUpdate(
            id,
            { bio, education, experience, CV },
            { new: true }
        );

        res.status(200).json({
            status: "true",
            message: "Profile updated successfully",
            data: updatedProfile
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
    createProfile, 
    getProfileByUserId, 
    updateProfile, 
    GET };
