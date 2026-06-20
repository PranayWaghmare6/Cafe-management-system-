// routes/auth.js

const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

    if (error || !data) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    res.json({
        success: true,
        user: {
            email: data.email,
            role: data.role
        }
    });
});
router.get("/login", (req, res) => {
    res.send("Login Route Working");
});
module.exports = router;