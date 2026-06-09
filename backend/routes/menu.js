// const express = require("express");
// const router = express.Router();

// const menu = [
//   {
//     id: 1,
//     name: "Margherita Pizza",
//     category: "Pizza",
//     price: 299,
//     description: "Classic delight with mozzarella & fresh basil",
//     image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80"
//   },
//   {
//     id: 2,
//     name: "Pepperoni Pizza",
//     category: "Pizza",
//     price: 399,
//     description: "Loaded with pepperoni and melted cheese",
//     image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80"
//   },
//   {
//     id: 3,
//     name: "BBQ Chicken Pizza",
//     category: "Pizza",
//     price: 449,
//     description: "Smoky BBQ chicken with onions and cilantro",
//     image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80"
//   },
//   {
//     id: 4,
//     name: "Classic Cheeseburger",
//     category: "Burgers",
//     price: 249,
//     description: "Juicy beef patty with cheddar and pickles",
//     image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80"
//   },
//   {
//     id: 5,
//     name: "Crispy Chicken Burger",
//     category: "Burgers",
//     price: 229,
//     description: "Crunchy fried chicken with creamy mayo",
//     image: "https://images.unsplash.com/photo-1606131731446-5568d87113aa?w=600&q=80"
//   },
//   {
//     id: 6,
//     name: "Veggie Burger",
//     category: "Burgers",
//     price: 199,
//     description: "Grilled veggie patty with fresh greens",
//     image: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&q=80"
//   },
//   {
//     id: 7,
//     name: "Iced Caramel Latte",
//     category: "Beverages",
//     price: 159,
//     description: "Chilled espresso with caramel and milk",
//     image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80"
//   },
//   {
//     id: 8,
//     name: "Fresh Mango Smoothie",
//     category: "Beverages",
//     price: 139,
//     description: "Refreshing mango blended with yogurt",
//     image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80"
//   },
//   {
//     id: 9,
//     name: "Chocolate Lava Cake",
//     category: "Desserts",
//     price: 179,
//     description: "Warm cake with molten chocolate center",
//     image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80"
//   },
//   {
//     id: 10,
//     name: "New York Cheesecake",
//     category: "Desserts",
//     price: 199,
//     description: "Creamy cheesecake with berry topping",
//     image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80"
//   },
//   {
//     id: 11,
//     name: "Loaded Nachos",
//     category: "Snacks",
//     price: 189,
//     description: "Crispy nachos with cheese, salsa & jalapeños",
//     image: "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=600&q=80"
//   },
//   {
//     id: 12,
//     name: "French Fries",
//     category: "Snacks",
//     price: 129,
//     description: "Golden crispy fries with seasoning",
//     image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80"
//   },
//   {
//     id: 13,
//     name: "Cappuccino",
//     category: "Beverages",
//     price: 119,
//     description: "Rich espresso topped with creamy foam",
//     image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80"
//   },
//   {
//     id: 14,
//     name: "Tiramisu",
//     category: "Desserts",
//     price: 219,
//     description: "Italian classic with coffee and mascarpone",
//     image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80"
//   }
// ];

// // GET ALL MENU ITEMS
// router.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     count: menu.length,
//     data: menu
//   });
// });

// // GET SINGLE ITEM
// router.get("/:id", (req, res) => {
//   const item = menu.find(
//     food => food.id === parseInt(req.params.id)
//   );

//   if (!item) {
//     return res.status(404).json({
//       success: false,
//       message: "Menu item not found"
//     });
//   }

//   res.status(200).json({
//     success: true,
//     data: item
//   });
// });

// module.exports = router;
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
router.post("/", async (req, res) => {
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

router.put("/:id", async (req, res) => {
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

router.delete("/:id", async (req, res) => {
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


