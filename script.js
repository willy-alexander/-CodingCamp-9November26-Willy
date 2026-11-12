const expenseForm = document.getElementById("expense-form");
const itemNameInput = document.getElementById("item-name");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const transactionList = document.getElementById("transaction-list");
const totalBalance = document.getElementById("total-balance");
const expenseChart = document.getElementById("expense-chart");

const themeToggle = document.getElementById("theme-toggle");
const budgetLimitInput = document.getElementById("budget-limit");
const saveLimitButton = document.getElementById("save-limit");
const budgetWarning = document.getElementById("budget-warning");
const budgetDisplay = document.getElementById("budget-display");
const spentDisplay = document.getElementById("spent-display");
const remainingDisplay = document.getElementById("remaining-display");
const sortTransactions = document.getElementById("sort-transactions");

let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];

function saveTransactions() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

function displayTransactions() {
    transactionList.innerHTML = "";

    let sortedTransactions = [...transactions];

    if (sortTransactions.value === "highest") {
        sortedTransactions.sort((a, b) => b.amount - a.amount);
    } else if (sortTransactions.value === "lowest") {
        sortedTransactions.sort((a, b) => a.amount - b.amount);
    } else if (sortTransactions.value === "name") {
        sortedTransactions.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }

    sortedTransactions.forEach(function(transaction) {
        const li = document.createElement("li");

        const name = document.createElement("span");
        name.textContent = transaction.name;

        const amount = document.createElement("span");
        amount.textContent = formatRupiah(transaction.amount);

        const category = document.createElement("span");
        category.textContent = transaction.category;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            deleteTransaction(transaction.id);
        });

        li.appendChild(name);
        li.appendChild(amount);
        li.appendChild(category);
        li.appendChild(deleteButton);

        transactionList.appendChild(li);
    });
}

function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);
}

function updateTotalBalance() {
    const total = transactions.reduce(function(sum, transaction) {
        return sum + transaction.amount;
    }, 0);

    totalBalance.textContent = formatRupiah(total);

    updateBudgetWarning();
}

function updateBudgetWarning() {
    const budgetLimit = Number(localStorage.getItem("budgetLimit")) || 0;

    const total = transactions.reduce(function(sum, transaction) {
        return sum + transaction.amount;
    }, 0);

    const remaining = budgetLimit - total;

    if (budgetLimit <= 0) {
        budgetDisplay.textContent = "Spending Limit: Not Set";
        spentDisplay.textContent = "Total Spent: " + formatRupiah(total);
        remainingDisplay.textContent = "Remaining Budget: Not Set";
        budgetWarning.textContent = "";
        return;
    }

    budgetDisplay.textContent = "Spending Limit: " + formatRupiah(budgetLimit);
    spentDisplay.textContent = "Total Spent: " + formatRupiah(total);
    remainingDisplay.textContent = "Remaining Budget: " + formatRupiah(Math.max(0, remaining));

    if (total > budgetLimit) {
        budgetWarning.textContent = "Warning! You have exceeded your spending limit.";
    } else {
        budgetWarning.textContent = "You are still within your spending limit.";
    }
}

function deleteTransaction(id) {
    transactions = transactions.filter(function(transaction) {
        return transaction.id !== id;
    });

    saveTransactions();
    displayTransactions();
    updateTotalBalance();
    updateChart();
}

expenseForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = itemNameInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;

    if (!name || !category || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter valid transaction details.");
        return;
    }

    const newTransaction = {
        id: Date.now(),
        name: name,
        amount: amount,
        category: category
    };

    transactions.push(newTransaction);

    saveTransactions();
    displayTransactions();
    updateTotalBalance();
    updateChart();

    expenseForm.reset();
});

const chart = new Chart(expenseChart, {
    type: "pie",
    data: {
        labels: ["Food", "Transport", "Fun"],
        datasets: [{
            label: "Expenses",
            data: [0, 0, 0],
            backgroundColor: [
                "#3B82F6",
                "#10B981",
                "#F59E0B"
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom"
            }
        }
    }
});

function updateChart() {
    const foodTotal = transactions
        .filter(transaction => transaction.category === "Food")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const transportTotal = transactions
        .filter(transaction => transaction.category === "Transport")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const funTotal = transactions
        .filter(transaction => transaction.category === "Fun")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    chart.data.datasets[0].data = [
        foodTotal,
        transportTotal,
        funTotal
    ];

    chart.update();
}

themeToggle.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    const isDarkMode = document.body.classList.contains("dark-mode");

    localStorage.setItem("darkMode", isDarkMode);
});

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
}

saveLimitButton.addEventListener("click", function() {
    const budgetLimit = Number(budgetLimitInput.value);

    if (!Number.isFinite(budgetLimit) || budgetLimit <= 0) {
        alert("Please enter a valid spending limit.");
        return;
    }

    localStorage.setItem("budgetLimit", budgetLimit);

    updateBudgetWarning();
    budgetLimitInput.value = "";
});

sortTransactions.addEventListener("change", function() {
    displayTransactions();
});

const savedBudget = localStorage.getItem("budgetLimit");

if (savedBudget) {
    budgetLimitInput.value = savedBudget;
}

displayTransactions();
updateTotalBalance();
updateChart();
