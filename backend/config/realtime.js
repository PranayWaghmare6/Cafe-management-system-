const supabase = require("./supabase");

supabase
  .channel("orders-channel")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "orders"
    },
    payload => {
      console.log("New Order", payload);
    }
  )
  .subscribe();