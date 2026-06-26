

const jwt = require("jsonwebtoken");
// middleware/kitchenAuth.js

module.exports = (req, res, next) => {

    if (
        req.user.role !== "admin" &&
        req.user.role !== "kitchen"
    ) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    next();
};