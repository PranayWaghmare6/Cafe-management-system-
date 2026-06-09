const params = new URLSearchParams(window.location.search);
const tableCode = params.get("code");

const CART_KEY = `cafe_cart_${tableCode}`;

document.getElementById("tableNumber").textContent = tableCode;
// ===== MENU DATA =====
document
    .getElementById("floatingCartBtn")
    .addEventListener("click", openCart);
    let tableNumber = "";
let menu = [
    
];
async function loadMenu() {
    try {
        const response = await fetch("http://localhost:5000/api/menu");

        const data = await response.json();

        console.log("MENU DATA:", data);

        menu = data;

        renderCategories();
        renderMenu();
    } catch (error) {
        console.error(error);
    }
}
async function loadTableNumber() {
  const res = await fetch(
    `http://localhost:5000/api/table/${tableCode}`
  );

  const data = await res.json();

  if (data.success) {
    tableNumber = data.tableNumber; // save globally

    document.getElementById("tableNumber").textContent =
      `Table ${tableNumber}`;
  }
}


loadTableNumber();
const categories = ["All", "Pizza", "Burgers", "Beverages", "Desserts", "Snacks"];
let activeCategory = "All";
let searchQuery = "";
// ===== CART =====
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    renderCart();
    updateCartCount();
    renderMenu();
}
function addToCart(id) {
    const item = menu.find(m => m.id === id);
    const existing = cart.find(c => c.id === id);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }

    saveCart();
}
function changeQty(id, delta) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
    saveCart();
}
function removeItem(id) {
    cart = cart.filter(c => c.id !== id);
    saveCart();
}
function clearCart() {
    cart = [];
    saveCart();
}
// ===== RENDER MENU =====
function renderCategories() {
    const wrap = document.getElementById("categories");
    wrap.innerHTML = categories.map(cat => `
    <button class="cat-btn ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">${cat}</button>
  `).join("");
    wrap.querySelectorAll(".cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            activeCategory = btn.dataset.cat;
            renderCategories();
            renderMenu();
        });
    });
}
function renderMenu() {
    const grid = document.getElementById("menuGrid");
    const filtered = menu.filter(item => {
        const matchCat = activeCategory === "All" || item.category === activeCategory;
        const matchSearch = item.name.toLowerCase().includes(searchQuery) ||
            item.description.toLowerCase().includes(searchQuery);
        return matchCat && matchSearch;
    });
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty">No items found. Try a different search.</div>`;
        return;
    }
    grid.innerHTML = filtered.map(item => `
    <div class="food-card">
      <img class="food-img" src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="food-body">
        <div class="food-cat">${item.category}</div>
        <div class="food-title">${item.name}</div>
        <div class="food-desc">${item.description}</div>
        <div class="food-footer">
          <div class="food-price">₹${item.price}</div>
          ${cart.find(c => c.id === item.id)
            ? `
      <div class="card-qty-controls">
        <button class="card-qty-btn dec" data-id="${item.id}">−</button>
        <span class="card-qty">
          ${cart.find(c => c.id === item.id).qty}
        </span>
        <button class="card-qty-btn inc" data-id="${item.id}">+</button>
      </div>
    `
            : `
      <button class="add-btn" data-id="${item.id}">
        Add +
      </button>
    `
        }
        </div>
      </div>
    </div>
  `).join("");
    grid.querySelectorAll(".add-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            addToCart(+btn.dataset.id);
        });
    });

    grid.querySelectorAll(".card-qty-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = +btn.dataset.id;

            if (btn.classList.contains("inc")) {
                changeQty(id, 1);
            } else {
                changeQty(id, -1);
            }
        });
    });
}
// ===== RENDER CART =====
function updateCartCount() {
    const count = cart.reduce((s, i) => s + i.qty, 0);

    document.getElementById("cartCount").textContent = count;

    document.getElementById("floatingCartCount").textContent = count;

    const floatingBtn =
        document.getElementById("floatingCartBtn");

    if (count > 0) {
        floatingBtn.classList.add("show");
    } else {
        floatingBtn.classList.remove("show");
    }
}
function renderCart() {
    const wrap = document.getElementById("cartItems");
    const footer = document.getElementById("cartFooter");
    if (cart.length === 0) {
        wrap.innerHTML = `
      <div class="cart-empty">
        <div class="icon">🛒</div>
        <p>Your cart is empty</p>
      </div>`;
        footer.style.display = "none";
        return;
    }
    footer.style.display = "block";
    wrap.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price * item.qty}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
          <span class="qty">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
          <button class="remove-btn" data-action="rem" data-id="${item.id}">Remove</button>
        </div>
      </div>
    </div>
  `).join("");
    wrap.querySelectorAll("[data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = +btn.dataset.id;
            const action = btn.dataset.action;
            if (action === "inc") changeQty(id, 1);
            else if (action === "dec") changeQty(id, -1);
            else if (action === "rem") removeItem(id);
        });
    });
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const gst = Math.round(subtotal * 0.05);
    const grand = subtotal + gst;
    document.getElementById("subtotal").textContent = `₹${subtotal}`;
    document.getElementById("gst").textContent = `₹${gst}`;
    document.getElementById("grandTotal").textContent = `₹${grand}`;
}
// ===== DRAWER & MODALS =====
function openCart() {
    document.getElementById("cartDrawer").classList.add("open");
    document.getElementById("overlay").classList.add("active");
}
function closeCart() {
    document.getElementById("cartDrawer").classList.remove("open");
    document.getElementById("overlay").classList.remove("active");
}
document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("overlay").addEventListener("click", closeCart);
document.getElementById("clearCart").addEventListener("click", clearCart);
document.getElementById("searchInput").addEventListener("input", e => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderMenu();
});



// document.getElementById("orderId").textContent =
//   data.orderId;
// CHECKOUT
document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + gst;
    document.getElementById("checkoutTable").textContent =
  tableNumber;
    document.getElementById("checkoutItems").innerHTML = cart.map(i => `
    <div class="checkout-item">
      <span>${i.name} × ${i.qty}</span>
      <span>₹${i.price * i.qty}</span>
    </div>
  `).join("") + `
    <div class="checkout-item"><span>GST (5%)</span><span>₹${gst}</span></div>
  `;
    document.getElementById("checkoutTotal").textContent = `₹${total}`;
    document.getElementById("checkoutModal").classList.add("active");
    closeCart();
});
document.getElementById("closeCheckout").addEventListener("click", () => {
    document.getElementById("checkoutModal").classList.remove("active");
});
// PAYMENT
document.getElementById("payBtn").addEventListener("click", async () => {

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + gst;

    

    const response = await fetch(
        "http://localhost:5000/api/orders",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableCode,
                items: cart,
                totalAmount: total
            })
        }
    );

    const data = await response.json();

    document.getElementById("orderId").textContent =
        data.orderId;
    
    document.getElementById("successTable").textContent =
  tableNumber;

    document.getElementById("successAmount").textContent =
        `₹${total}`;

    document.getElementById("checkoutModal").classList.remove("active");
    document.getElementById("successModal").classList.add("active");

    cart = [];
    saveCart();
});
document.getElementById("newOrderBtn").addEventListener("click", () => {
    document.getElementById("successModal").classList.remove("active");
});
// INIT
renderCart();
updateCartCount();
loadMenu();