/* ====== CLOCK ====== */
const user = JSON.parse(
    localStorage.getItem("user")
);

if (!user) {
    window.location.href = "/frontend/login/index.html";
}

if (user.role !== "admin") {
    alert("Access Denied");
    window.location.href = "index.html";
}

function updateClock() {
    const now = new Date();
    document.getElementById('clockTime').textContent = now.toLocaleTimeString('en-IN', { hour12: false });
    document.getElementById('clockDate').textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
setInterval(updateClock, 1000); updateClock();
/* ====== TABS ====== */
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab + 'Page').classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
/* ====== SAMPLE DATA ====== */
const today = new Date();
function dateNDaysAgo(n) { const d = new Date(today); d.setDate(d.getDate() - n); return d; }
function timeStr(d) { return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
function dateKey(d) { return d.toISOString().slice(0, 10); }
// const ORDERS = [];
let counter = 1000;
// Generate orders for last 30 days
let ORDERS = [];

async function loadOrders() {
    try {
        const res = await fetch(
            "https://cafe-management-system-1-uc3b.onrender.com/api/orders"
        );

        const data = await res.json();

        ORDERS = data.orders.map(order => ({
    id: order.orderId,
    table: order.tableNumber,
    time: new Date(order.created_at || Date.now()),
    amount: Number(order.totalAmount),
    status: order.status,
    items: order.items || []
}));
        // console.log("ORDERS:", ORDERS);
        // console.log(
        //   "Pending:",
        //   ORDERS.filter(o => o.status === "pending")
        // );

        // console.log(
        //   "Completed:",
        //   ORDERS.filter(o => o.status === "completed")
        // );
        renderOverview();
        renderAnalysisStats();
        renderCalendar();
        renderSelectedDate();
        renderWeeklyChart();
        renderBestSellers();

    } catch (err) {
        console.error(err);
    }
}

let MENU = [];

async function loadMenu() {
    try {
        const res = await fetch(
            "https://cafe-management-system-1-uc3b.onrender.com/api/menu"
        );

        MENU = await res.json();
        // console.log(MENU);
        renderMenuGrid();
        renderBestSellers();

    } catch (err) {
        console.error(err);
    }
}
let nextMenuId = 7;
/* ====== HELPERS ====== */
const $ = id => document.getElementById(id);
const inr = n => '₹' + n.toLocaleString('en-IN');
function isSameDay(a, b) { return a.toDateString() === b.toDateString(); }
function withinDays(d, days) { const diff = (today - d) / 86400000; return diff >= 0 && diff < days; }
function getFilteredOrders(range) {
    if (range === 'today') return ORDERS.filter(o => isSameDay(o.time, today));
    if (range === '7days') return ORDERS.filter(o => withinDays(o.time, 7));
    return ORDERS.filter(o => withinDays(o.time, 30));
}
/* ====== OVERVIEW ====== */
function renderOverview() {
    const range = $('rangeFilter').value;
    const filtered = getFilteredOrders(range);

    const pending = filtered.filter(o => o.status === 'pending');
    const completed = filtered.filter(o => o.status === 'completed');

    const todayOrders = ORDERS.filter(o => isSameDay(o.time, today));

    const todayEarn = todayOrders
        .filter(o => o.status === 'completed')
        .reduce((s, o) => s + o.amount, 0);

    const totalEarn = filtered
        .filter(o => o.status === 'completed')
        .reduce((s, o) => s + o.amount, 0);

    $('todayEarnings').textContent = inr(todayEarn);
    $('totalEarnings').textContent = inr(totalEarn);

    $('pendingCount').textContent = pending.length;
    $('completedCount').textContent = completed.length;

    $('pendingPill').textContent = pending.length;
    $('completedPill').textContent = completed.length;

    $('pendingList').innerHTML = pending.length
        ? pending.sort((a, b) => b.time - a.time).map(o => orderRow(o, false)).join('')
        : '<div class="empty">No pending orders</div>';

    $('completedList').innerHTML = completed.length
        ? completed.sort((a, b) => b.time - a.time).slice(0, 50).map(o => orderRow(o, true)).join('')
        : '<div class="empty">No completed orders</div>';
}
function orderRow(o, done = false) {

    const itemsHtml = (o.items || []).map(item => `
        <div class="order-item">
            ${item.qty} × ${item.name}
        </div>
    `).join('');

    return `
    <div class="order-row ${done ? 'completed' : ''}">

        <div class="oid">
            ${o.id}
            <small>${o.time.toLocaleDateString('en-IN')}</small>
        </div>

        <div class="table-tag">
            Table ${o.table}
        </div>

        <div class="otime">
            ${done ? 'Done ' : ''}
            ${timeStr(o.time)}
        </div>

        <div class="amount">
            ${inr(o.amount)}
        </div>

        <div class="order-items">
            ${itemsHtml}
        </div>

    </div>
    `;
}
$('rangeFilter').addEventListener('change', renderOverview);
/* ====== ANALYSIS ====== */
let calYear = today.getFullYear(), calMonth = today.getMonth();
let selectedDate = new Date(today);
function renderAnalysisStats() {
    const todayOrders = ORDERS.filter(o => isSameDay(o.time, today));
    const todayEarn = todayOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.amount, 0);
    const totalEarn = ORDERS.filter(o => o.status === 'completed').reduce((s, o) => s + o.amount, 0);
    $('aTodayEarnings').textContent = inr(todayEarn);
    $('aTotalEarnings').textContent = inr(totalEarn);
}
function renderCalendar() {
    const first = new Date(calYear, calMonth, 1);
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const startDow = first.getDay();
    $('monthLabel').textContent = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const dows = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    let html = dows.map(d => `<div class="cal-dow">${d}</div>`).join('');
    for (let i = 0; i < startDow; i++) html += `<div class="cal-day empty-day"></div>`;
    for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(calYear, calMonth, day);
        const has = ORDERS.some(o => isSameDay(o.time, d));
        const isToday = isSameDay(d, today);
        const isSel = isSameDay(d, selectedDate);
        html += `<div class="cal-day ${has ? 'has-data' : ''} ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''}" data-day="${day}">${day}</div>`;
    }
    $('calendar').innerHTML = html;
    $('calendar').querySelectorAll('.cal-day[data-day]').forEach(el => {
        el.addEventListener('click', () => {
            selectedDate = new Date(calYear, calMonth, +el.dataset.day);
            renderCalendar(); renderSelectedDate();
        });
    });
}
function renderSelectedDate() {
    const orders = ORDERS.filter(o => isSameDay(o.time, selectedDate) && o.status === 'completed');
    $('selDate').textContent = selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    $('selOrders').textContent = orders.length;
    $('selEarnings').textContent = inr(orders.reduce((s, o) => s + o.amount, 0));
}
$('prevMonth').addEventListener('click', () => {
    calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
});
$('nextMonth').addEventListener('click', () => {
    calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
});
let weeklyChart;
function renderWeeklyChart() {
    const labels = []; const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = dateNDaysAgo(i);
        labels.push(d.toLocaleDateString('en-IN', { weekday: 'short' }));
        const total = ORDERS.filter(o => isSameDay(o.time, d) && o.status === 'completed')
            .reduce((s, o) => s + o.amount, 0);
        data.push(total);
    }
    const ctx = $('weeklyChart').getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 320);
    grad.addColorStop(0, '#ff6b35'); grad.addColorStop(1, '#ff8c5a');
    if (weeklyChart) weeklyChart.destroy();
    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Revenue (₹)', data, backgroundColor: grad, borderRadius: 10, maxBarThickness: 56 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 900, easing: 'easeOutQuart' },
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => '₹' + c.parsed.y.toLocaleString('en-IN') } } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#eef0f3' }, ticks: { callback: v => '₹' + v } },
                x: { grid: { display: false } }
            }
        }
    });
}
function renderBestSellers() {

    const itemStats = {};

    ORDERS.forEach(order => {

        if (order.status !== "completed") return;

        (order.items || []).forEach(item => {

            const qty = Number(item.quantity || 1);

            if (!itemStats[item.name]) {
                itemStats[item.name] = {
                    name: item.name,
                    orders: 0,
                    revenue: 0
                };
            }

            itemStats[item.name].orders += qty;
            itemStats[item.name].revenue += qty * Number(item.price || 0);
        });
    });

    const bestItems = Object.values(itemStats)
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);

    $('bestList').innerHTML = bestItems.length
        ? bestItems.map((item, i) => `
            <div class="best-item">
                <div class="rank ${i < 3 ? 'r' + (i + 1) : ''}">
                    #${i + 1}
                </div>

                <div>
                    <div class="best-name">${item.name}</div>
                </div>

                <div class="best-orders">
                    ${item.orders} sold
                </div>

                <div class="best-rev">
                    ${inr(item.revenue)}
                </div>
            </div>
        `).join('')
        : '<div class="empty">No sales data available</div>';
}
/* ====== EDIT MENU ====== */
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600';
let editingId = null;
function resetForm() {
    editingId = null;
    $('fName').value = ''; $('fCategory').value = ''; $('fPrice').value = '';
    $('fDesc').value = ''; $('fAvail').checked = true;
    $('imgPreview').src = DEFAULT_IMG;
    $('imgPreview').dataset.url = DEFAULT_IMG;
    document.querySelector('.img-upload').classList.remove('has-image');
    $('updateBtn').disabled = true; $('deleteBtn').disabled = true;
    $('saveBtn').disabled = false;
}
$('imgInput').addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => {
        $('imgPreview').src = ev.target.result;
        $('imgPreview').dataset.url = ev.target.result;
        document.querySelector('.img-upload').classList.add('has-image');
    };
    r.readAsDataURL(file);
});
function readForm() {
    return {
        name: $('fName').value.trim(),
        category: $('fCategory').value,
        desc: $('fDesc').value.trim(),
        price: +$('fPrice').value || 0,
        available: $('fAvail').checked,
        image: $('imgPreview').dataset.url || DEFAULT_IMG,
    };
}
$('saveBtn').addEventListener('click', async () => {

    const data = readForm();

    if (!data.name || !data.category || !data.price) {
        alert('Please fill name, category and price.');
        return;
    }

    try {

        const res = await fetch(
            "https://cafe-management-system-1-uc3b.onrender.com/api/menu",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );

        const newItem = await res.json();

        MENU.push(newItem);

        resetForm();
        renderMenuGrid();

        alert("Menu item added successfully");

    } catch (err) {
        console.error(err);
        alert("Failed to save menu item");
    }
});
$('updateBtn').addEventListener('click', async () => {

    if (!editingId) return;

    const data = readForm();

    try {

        const res = await fetch(
            `https://cafe-management-system-1-uc3b.onrender.com/api/menu/${editingId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );

        const updated = await res.json();

        const idx = MENU.findIndex(
            m => m.id === editingId
        );

        if (idx >= 0) {
            MENU[idx] = updated;
        }

        resetForm();
        renderMenuGrid();

        alert("Menu item updated");

    } catch (err) {
        console.error(err);
        alert("Update failed");
    }
});
$('deleteBtn').addEventListener('click', async () => {

    if (!editingId) return;

    if (!confirm("Delete this item?")) return;

    try {

        await fetch(
            `https://cafe-management-system-1-uc3b.onrender.com/api/menu/${editingId}`,
            {
                method: "DELETE"
            }
        );

        MENU = MENU.filter(
            item => item.id !== editingId
        );

        resetForm();
        renderMenuGrid();

        alert("Item deleted");

    } catch (err) {
        console.error(err);
        alert("Delete failed");
    }
});
$('clearBtn').addEventListener('click', resetForm);
function loadIntoForm(id) {
    const m = MENU.find(x => x.id === id); if (!m) return;
    editingId = id;
    $('fName').value = m.name; $('fCategory').value = m.category;
    $('fPrice').value = m.price; $('fDesc').value = m.desc;
    $('fAvail').checked = m.available;
    $('imgPreview').src = m.image; $('imgPreview').dataset.url = m.image;
    document.querySelector('.img-upload').classList.add('has-image');
    $('updateBtn').disabled = false; $('deleteBtn').disabled = false;
    $('saveBtn').disabled = true;
    document.querySelector('.menu-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function renderMenuGrid() {
    $('menuCount').textContent = MENU.length;
    $('menuGrid').innerHTML = MENU.map(m => `
    <div class="menu-card">
      <img class="thumb" src="${m.image}" alt="${m.name}" onerror="this.src='${DEFAULT_IMG}'" />
      <div class="body">
        <div class="cat">${m.category}</div>
        <h4>${m.name}</h4>
        <div class="price-row">
          <div class="price">${inr(m.price)}</div>
          <span class="avail-badge ${m.available ? 'on' : 'off'}">${m.available ? 'Available' : 'Unavailable'}</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn ghost" data-edit="${m.id}">✏️ Edit</button>
        <button class="btn danger" data-del="${m.id}">🗑️</button>
      </div>
    </div>
  `).join('');
    $('menuGrid').querySelectorAll('[data-edit]').forEach(b =>
        b.addEventListener('click', () => loadIntoForm(+b.dataset.edit)));
    $('menuGrid').querySelectorAll('[data-del]').forEach(b =>
        b.addEventListener('click', () => {
            if (!confirm('Delete this item?')) return;
            const idx = MENU.findIndex(m => m.id === +b.dataset.del);
            if (idx >= 0) MENU.splice(idx, 1);
            renderMenuGrid();
            if (editingId === +b.dataset.del) resetForm();
        }));
}
/* ====== INIT ====== */
// resetForm();
// renderOverview();
// renderAnalysisStats();
// renderCalendar();
// renderSelectedDate();
// renderWeeklyChart();
// renderBestSellers();
// renderMenuGrid();
loadOrders();
loadMenu();

setInterval(loadOrders, 5000); 