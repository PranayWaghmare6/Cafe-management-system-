const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");


router.get("/table/:code", async (req, res) => {
  const { code } = req.params;

  const { data, error } = await supabase
    .from("tables")
    .select("table_number")
    .eq("table_code", code)
    .single();

  if (error || !data) {
    return res.status(404).json({
      success: false,
      message: "Table not found"
    });
  }

  res.json({
    success: true,
    tableNumber: data.table_number
  });
});

module.exports = router;