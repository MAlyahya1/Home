(() => {
  const STORAGE_KEY = "home-app-state-v1";

  const defaultState = {
    chores: [],
    shopping: [],
    bills: [],
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      return { ...structuredClone(defaultState), ...parsed };
    } catch {
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const state = loadState();

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Tabs ----------
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // ---------- Chores ----------
  const choreForm = document.getElementById("chore-form");
  const choreList = document.getElementById("chore-list");

  function nextDueDate(recurrence, from = new Date()) {
    const d = new Date(from);
    if (recurrence === "daily") d.setDate(d.getDate() + 1);
    else if (recurrence === "weekly") d.setDate(d.getDate() + 7);
    else if (recurrence === "monthly") d.setMonth(d.getMonth() + 1);
    return d.toISOString();
  }

  choreForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("chore-name").value.trim();
    const assignee = document.getElementById("chore-assignee").value.trim();
    const recurrence = document.getElementById("chore-recurrence").value;
    if (!name) return;
    state.chores.push({
      id: uid(),
      name,
      assignee,
      recurrence,
      done: false,
      createdAt: new Date().toISOString(),
    });
    saveState();
    choreForm.reset();
    renderChores();
  });

  function toggleChore(id) {
    const chore = state.chores.find((c) => c.id === id);
    if (!chore) return;
    if (chore.recurrence !== "none" && !chore.done) {
      // recurring chore completed: reset for next occurrence instead of staying done
      chore.done = false;
      chore.lastCompletedAt = new Date().toISOString();
    } else {
      chore.done = !chore.done;
    }
    saveState();
    renderChores();
  }

  function deleteChore(id) {
    state.chores = state.chores.filter((c) => c.id !== id);
    saveState();
    renderChores();
  }

  function renderChores() {
    choreList.innerHTML = "";
    if (state.chores.length === 0) {
      choreList.innerHTML = '<li class="empty-state">No chores yet — add one above.</li>';
      return;
    }
    const sorted = [...state.chores].sort((a, b) => Number(a.done) - Number(b.done));
    for (const chore of sorted) {
      const li = document.createElement("li");
      li.className = "item-row" + (chore.done ? " done" : "");
      const metaParts = [];
      if (chore.assignee) metaParts.push(escapeHtml(chore.assignee));
      if (chore.recurrence !== "none") metaParts.push(chore.recurrence);
      if (chore.lastCompletedAt) {
        metaParts.push("last done " + new Date(chore.lastCompletedAt).toLocaleDateString());
      }
      li.innerHTML = `
        <input type="checkbox" ${chore.done ? "checked" : ""} data-id="${chore.id}" class="chore-check">
        <div class="item-main">
          <div class="item-title">${escapeHtml(chore.name)}</div>
          ${metaParts.length ? `<div class="item-meta">${metaParts.join(" · ")}</div>` : ""}
        </div>
        <button class="delete-btn" data-id="${chore.id}" title="Delete">×</button>
      `;
      choreList.appendChild(li);
    }
    choreList.querySelectorAll(".chore-check").forEach((cb) => {
      cb.addEventListener("change", () => toggleChore(cb.dataset.id));
    });
    choreList.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteChore(btn.dataset.id));
    });
  }

  // ---------- Shopping ----------
  const shoppingForm = document.getElementById("shopping-form");
  const shoppingList = document.getElementById("shopping-list");
  const clearCheckedBtn = document.getElementById("clear-checked");

  shoppingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("shopping-name").value.trim();
    const category = document.getElementById("shopping-category").value.trim();
    if (!name) return;
    state.shopping.push({ id: uid(), name, category, checked: false });
    saveState();
    shoppingForm.reset();
    renderShopping();
  });

  clearCheckedBtn.addEventListener("click", () => {
    state.shopping = state.shopping.filter((i) => !i.checked);
    saveState();
    renderShopping();
  });

  function toggleShoppingItem(id) {
    const item = state.shopping.find((i) => i.id === id);
    if (!item) return;
    item.checked = !item.checked;
    saveState();
    renderShopping();
  }

  function deleteShoppingItem(id) {
    state.shopping = state.shopping.filter((i) => i.id !== id);
    saveState();
    renderShopping();
  }

  function renderShopping() {
    shoppingList.innerHTML = "";
    if (state.shopping.length === 0) {
      shoppingList.innerHTML = '<li class="empty-state">Shopping list is empty.</li>';
      return;
    }
    const groups = new Map();
    for (const item of state.shopping) {
      const key = item.category || "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    for (const [category, items] of groups) {
      const header = document.createElement("li");
      header.className = "item-meta";
      header.style.marginTop = "0.5rem";
      header.textContent = category;
      shoppingList.appendChild(header);
      for (const item of items) {
        const li = document.createElement("li");
        li.className = "item-row" + (item.checked ? " done" : "");
        li.innerHTML = `
          <input type="checkbox" ${item.checked ? "checked" : ""} data-id="${item.id}" class="shopping-check">
          <div class="item-main">
            <div class="item-title">${escapeHtml(item.name)}</div>
          </div>
          <button class="delete-btn" data-id="${item.id}" title="Delete">×</button>
        `;
        shoppingList.appendChild(li);
      }
    }
    shoppingList.querySelectorAll(".shopping-check").forEach((cb) => {
      cb.addEventListener("change", () => toggleShoppingItem(cb.dataset.id));
    });
    shoppingList.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteShoppingItem(btn.dataset.id));
    });
  }

  // ---------- Bills ----------
  const billForm = document.getElementById("bill-form");
  const billList = document.getElementById("bill-list");

  billForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("bill-name").value.trim();
    const due = document.getElementById("bill-due").value;
    const amount = document.getElementById("bill-amount").value;
    if (!name || !due) return;
    state.bills.push({
      id: uid(),
      name,
      due,
      amount: amount ? Number(amount) : null,
      paid: false,
    });
    saveState();
    billForm.reset();
    renderBills();
  });

  function toggleBill(id) {
    const bill = state.bills.find((b) => b.id === id);
    if (!bill) return;
    bill.paid = !bill.paid;
    saveState();
    renderBills();
  }

  function deleteBill(id) {
    state.bills = state.bills.filter((b) => b.id !== id);
    saveState();
    renderBills();
  }

  function daysUntil(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    return Math.round((due - today) / (1000 * 60 * 60 * 24));
  }

  function renderBills() {
    billList.innerHTML = "";
    if (state.bills.length === 0) {
      billList.innerHTML = '<li class="empty-state">No bills tracked yet.</li>';
      return;
    }
    const sorted = [...state.bills].sort((a, b) => new Date(a.due) - new Date(b.due));
    for (const bill of sorted) {
      const days = daysUntil(bill.due);
      const overdue = !bill.paid && days < 0;
      const li = document.createElement("li");
      li.className = "item-row" + (bill.paid ? " done" : "") + (overdue ? " overdue" : "");
      let dueText;
      if (bill.paid) dueText = "paid";
      else if (days === 0) dueText = "due today";
      else if (days < 0) dueText = `overdue by ${Math.abs(days)}d`;
      else dueText = `due in ${days}d`;
      const amountText = bill.amount != null ? ` · $${bill.amount.toFixed(2)}` : "";
      li.innerHTML = `
        <input type="checkbox" ${bill.paid ? "checked" : ""} data-id="${bill.id}" class="bill-check">
        <div class="item-main">
          <div class="item-title">${escapeHtml(bill.name)}</div>
          <div class="item-meta${overdue ? " overdue-text" : ""}">${new Date(bill.due).toLocaleDateString()} · ${dueText}${amountText}</div>
        </div>
        <button class="delete-btn" data-id="${bill.id}" title="Delete">×</button>
      `;
      billList.appendChild(li);
    }
    billList.querySelectorAll(".bill-check").forEach((cb) => {
      cb.addEventListener("change", () => toggleBill(cb.dataset.id));
    });
    billList.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteBill(btn.dataset.id));
    });
  }

  renderChores();
  renderShopping();
  renderBills();
})();
