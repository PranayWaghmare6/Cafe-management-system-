const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

router.post("/", async (req, res) => {
  try {
    const { tableCode, items, totalAmount } = req.body;
    
    // Validation
    if (!tableCode || !items || items.length === 0) {
      return res.status(400).json({
        success: false, 
        message: "Invalid order data"
      });
    }

    const { data: tableData, error: tableError } = await supabase
      .from("tables")
      .select("table_number")
      .eq("table_code", tableCode)
      .single();

     

    if (tableError || !tableData) {
      return res.status(400).json({
        success: false,
        message: "Invalid table code"
      });
    }
    
    const tableNumber = tableData.table_number;

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    const gst = Math.round(subtotal * 0.05);

    const totalQuantity = items.reduce(
      (sum, item) => sum + item.qty,
      0
    );

    const now = new Date();

    const orderId =
      `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}` +
      `-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}` +
      `-T${tableNumber}`;

    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_id: orderId,
        table_number: tableNumber,
        items,
        total_quantity: totalQuantity,
        subtotal,
        gst,
        total_amount: totalAmount,
        status: "pending"
      })
      .select();
    

    if (error) throw error;

    res.json({
      success: true,
      orderId,
      order: formatOrders(data)[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  

  if (error) {
    return res.status(500).json(error);
  }

  res.json({
    success: true,
    orders: formatOrders(data)
  });
});
router.get("/pending", async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    return res.status(500).json(error);
  }

  res.json({
    success: true,
    orders: formatOrders(data)
  });
});


router.get("/completed", async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "completed")
    .order("created_at", { ascending: false })

  if (error) {
    return res.status(500).json(error);
  }

  res.json({
    success: true,
    orders: formatOrders(data)
  });
});

router.put("/:id/complete", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "completed"
    })
    .eq("id", id)
    .select();

  if (error) {
    return res.status(500).json(error);
  }

  res.json({
    success: true,
    order: formatOrders(data)[0]
  });
});
function formatOrders(data = []) {
  return data.map(order => ({
    id: order.id,
    orderId: order.order_id,
    tableNumber: order.table_number,
    created_at: order.created_at,

    orderDate: new Date(order.created_at).toLocaleDateString("en-IN"),

    orderTime: new Date(order.created_at).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    }),

    items: order.items || [],
    totalQuantity: order.total_quantity,
    totalAmount: order.total_amount,
    status: order.status
  }));
}

module.exports = router;  