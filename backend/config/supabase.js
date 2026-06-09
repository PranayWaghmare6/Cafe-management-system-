// require("dotenv").config();

// const { createClient } = require("@supabase/supabase-js");

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseUrl) {
//   throw new Error("SUPABASE_URL is missing in .env");
// }

// if (!supabaseKey) {
//   throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in .env");
// }

// const supabase = createClient(supabaseUrl, supabaseKey);

// supabase
//   .channel("orders-channel")
//   .on(
//     "postgres_changes",
//     {
//       event: "INSERT",
//       schema: "public",
//       table: "orders"
//     },
//     payload => {
//       console.log("New Order", payload);
//       fetchOrders();
//     }
//   )
//   .subscribe();
// module.exports = supabase;
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is missing in .env");
}

if (!supabaseKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;