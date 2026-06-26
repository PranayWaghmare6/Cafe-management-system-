

// module.exports = router;
const auth = require("../middleware/auth");
require("dotenv").config();
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("food_items")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});
router.post("/", auth, async (req, res) => {
    if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only"
    });
  }
  try {
    const {
      name,
      category,
      price,
      description,
      image,
      available
    } = req.body;

    const { data, error } = await supabase
      .from("food_items")
      .insert([
        {
          name,
          category,
          price,
          description,
          image,
          available
        }
      ])
      .select();

    if (error) throw error;

    res.json(data[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {

    const { id } = req.params;

    const {
      name,
      category,
      price,
      description,
      image,
      available
    } = req.body;

    const { data, error } = await supabase
      .from("food_items")
      .update({
        name,
        category,
        price,
        description,
        image,
        available
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.json(data[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {

    const { id } = req.params;

    const { error } = await supabase
      .from("food_items")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({
      success: true
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;


