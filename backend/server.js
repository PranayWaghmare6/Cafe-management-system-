// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Cafe Management Backend Running");
// });

// const PORT = process.env.PORT || 5000;

// app.get("/test", (req, res) => {
//   res.send("Server Working");
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
// const menuRoutes = require("./routes/menu");

// app.use("/api/menu", menuRoutes);

// const orderRoutes = require("./routes/orders");

// app.use("/api/orders", orderRoutes);

// require("./config/realtime");

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Cafe Management Backend Running");
});

app.get("/test", (req, res) => {
  res.send("Server Working");
});

require("./config/realtime");

const tableNumberRoutes = require("./routes/tableNumber");
app.use("/api", tableNumberRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});