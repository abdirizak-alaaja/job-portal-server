const jwt = require('jsonwebtoken');

// Hubinta inuu isticmaalahu jiro oo token sax ah wato
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ status: "false", message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        req.user = decoded; // Halkan waxaa ku jira id, role, iwm.
        next();
    } catch (err) {
        res.status(400).json({ status: "false", message: "Invalid token." });
    }
};

// Hubinta doorka isticmaalaha (Roles)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                status: "false", 
                message: "Unauthorized access. You do not have permission." 
            });
        }
        next();
    };
};

module.exports = { authenticate, authorize };