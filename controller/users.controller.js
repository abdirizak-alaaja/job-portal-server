const { usersModel, validateUsers } = require('../models/users.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// get all users
const GET = async (req , res) => {
    try{
        const users = await usersModel.find({status: 'active'})
        .select('name email role skills status');
        res.status(200).json({
            status: "true",
            message: "Users found successfully",
            data: users
        });
    }catch(err){
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// get by skill
const GETBYSKILL = async (req , res) => {
    try{
        const skill = req.params.skills;
        const users = await usersModel.find({status:'active', skills: skill})
        .select('name email role skills ');
        if(!users || users.length === 0){
            return res.status(404).json({
                status: "false",
                message: "Users not found"
            });
        }
        res.status(200).json({
            status: "true",
            message: "Users found successfully",
            data: users
        });
    }catch(err){
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// get user by id
const GETBYID = async ( req , res) => {
    try{
        const userById = req.params.id;
        const user = await usersModel.findOne({ _id: userById, status: 'active' })
        .select('name email role skills ');
        if(!user){
            return res.status(404).json({ status: "false", message: "User not found" });
        }
        res.status(200).json({
            status: "true",
            message: "User found successfully",
            data: user
        });
    }catch(err){
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// create user
const POST = async (req , res) => {
    try{
        const { error } = validateUsers(req.body);
        if (error) {
            return res.status(400).json({ status: "false", message: error.details[0].message });
        }

        const { name, email, role, skills, password } = req.body;

        // Hubi haddii uu hore u jiray email-kan
        const existingUser = await usersModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: "false", message: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new usersModel({
            name,
            email,
            role,
            skills: role === "company" ? undefined : skills, // Shirkaduhu uma baahna skills
            password: hashedPassword
        });
        
        await newUser.save();

        let userResponse = newUser.toObject();
        delete userResponse.password; 
        delete userResponse.__v;

        res.status(201).json({
            status: "true",
            message: "User created successfully",
            data: userResponse
        });
    }catch(err){
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// post user login
const POSTLOGIN = async (req , res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({ status: "false", message: "Email and password are required" });
        }
        
        const user = await usersModel.findOne({email});
        if(!user || user.status === 'deleted'){
            return res.status(400).json({ status: "false", message: "Email or password is incorrect" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ status: "false", message: "Email or password is incorrect" });
        }

        // Soo saar JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            status: "true", 
            message: "User logged in successfully",
            token: token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                skills: user.skills
            }
        });
    }catch(err){
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// update user
const PUT = async (req , res) => {
    try{
        const id = req.params.id;
        
        // Amni: Isticmaalahu wuxuu bedeli karaa kaliya xogtiisa (haddii uusan admin ahayn)
        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(403).json({ status: "false", message: "Unauthorized to update this user." });
        }

        const {name, email, role, skills, password, status} = req.body;
        let updateData = { name, email, role, skills, status };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updateUser = await usersModel.findByIdAndUpdate(id, updateData, { new: true })
            .select('_id name email role skills status');

        if(!updateUser){
            return res.status(404).json({ status: "false", message: "User not found" });
        }

        res.status(200).json({
            status: "true",
            message: "User updated successfully",
            data: updateUser
        });
    }catch(err){
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// delete user by id
const DELETE = async (req , res) => {
    try{
        const id = req.params.id;

        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(403).json({ status: "false", message: "Unauthorized to delete this account." });
        }

        const deleteUser = await usersModel.findByIdAndUpdate(id, { status: 'deleted' }, { new: true })
            .select('_id name email role skills status');
            
        res.status(200).json({
            status: "true",
            message: "User deleted successfully",
            data: deleteUser
        });
    }catch(err){
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

module.exports = { GET, 
    GETBYSKILL, 
    GETBYID, 
    POST, 
    POSTLOGIN, 
    PUT, 
    DELETE 
};
