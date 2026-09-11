let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let currency =
    localStorage.getItem("currency") || "$";


const modal =
    document.getElementById("transactionModal");

const openModal =
    document.getElementById("openModal");

const closeModal =
    document.getElementById("closeModal");

const form =
    document.getElementById("transactionForm");

const table =
    document.getElementById("transactionTable");

const table2 =
    document.getElementById("transactionTable2");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");


openModal.addEventListener("click", () => {

    modal.classList.add("show");

});


closeModal.addEventListener("click", () => {

    modal.classList.remove("show");

});


modal.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.classList.remove("show");

    }

});


form.addEventListener("submit", (e) => {

    e.preventDefault();

    const type =
        document.getElementById("transactionType").value;

    const description =
        document.getElementById("description").value;

    const amount =
        Number(document.getElementById("amount").value);

    const date =
        document.getElementById("date").value;

    const category =
        document.getElementById("category").value;


    const transaction = {

        id: Date.now(),

        type,

        description,

        amount,

        date,

        category

    };


    transactions.push(transaction);

    saveTransactions();

    form.reset();

    modal.classList.remove("show");

    renderTransactions();

    updateDashboard();

});


function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


function renderTransactions() {

    const search =
        searchInput.value.toLowerCase();

    const category =
        categoryFilter.value;


    const filtered =
        transactions.filter((transaction) => {

            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(search);

            const matchesCategory =
                category === "all" ||
                transaction.category === category;

            return matchesSearch && matchesCategory;

        });


    table.innerHTML = "";

    table2.innerHTML = "";


    if (filtered.length === 0) {

        document.getElementById("emptyState")
            .style.display = "block";

        return;

    }


    document.getElementById("emptyState")
        .style.display = "none";


    filtered
        .sort((a, b) =>
            new Date(b.date) -
            new Date(a.date)
        )
        .forEach(transaction => {

            const row =
                createTransactionRow(transaction);

            table.appendChild(row);

            table2.appendChild(
                createTransactionRow(transaction)
            );

        });

}


function createTransactionRow(transaction) {

    const row =
        document.createElement("tr");


    const amountClass =
        transaction.type === "income"
            ? "amount-income"
            : "amount-expense";


    const sign =
        transaction.type === "income"
            ? "+"
            : "-";


    row.innerHTML = `

        <td>
            ${formatDate(transaction.date)}
        </td>

        <td>
            <strong>
                ${escapeHTML(transaction.description)}
            </strong>
        </td>

        <td>
            <span class="badge">
                ${transaction.category}
            </span>
        </td>

        <td>
            ${transaction.type}
        </td>

        <td class="${amountClass}">
            ${sign}${currency}${transaction.amount.toFixed(2)}
        </td>

        <td>

            <button
                class="action-btn"
                onclick="deleteTransaction(${transaction.id})"
            >

                <i class="fa-solid fa-trash"></i>

            </button>

        </td>

    `;


    return row;

}


function deleteTransaction(id) {

    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveTransactions();

    renderTransactions();

    updateDashboard();

}


function updateDashboard() {

    let income = 0;

    let expense = 0;


    transactions.forEach(transaction => {

        if (transaction.type === "income") {

            income += transaction.amount;

        } else {

            expense += transaction.amount;

        }

    });


    const balance =
        income - expense;


    document.getElementById("balance")
        .textContent =
        `${currency}${balance.toFixed(2)}`;


    document.getElementById("income")
        .textContent =
        `${currency}${income.toFixed(2)}`;


    document.getElementById("expense")
        .textContent =
        `${currency}${expense.toFixed(2)}`;


    document.getElementById("transactionCount")
        .textContent =
        transactions.length;


    updateChart(income, expense);

}


let cashFlowChart;


function updateChart(income, expense) {

    const ctx =
        document
            .getElementById("cashFlowChart")
            .getContext("2d");


    if (cashFlowChart) {

        cashFlowChart.destroy();

    }


    cashFlowChart =
        new Chart(ctx, {

            type: "bar",

            data: {

                labels: [
                    "Income",
                    "Expense"
                ],

                datasets: [

                    {

                        label: "Cash Flow",

                        data: [
                            income,
                            expense
                        ],

                        borderRadius: 7

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                }

            }

        });

}


searchInput.addEventListener(
    "input",
    renderTransactions
);


categoryFilter.addEventListener(
    "change",
    renderTransactions
);


const navItems =
    document.querySelectorAll(".nav-item[data-section]");


navItems.forEach(item => {

    item.addEventListener("click", () => {

        const section =
            item.dataset.section;


        document
            .querySelectorAll(".section")
            .forEach(section =>
                section.classList.remove("active")
            );


        document
            .getElementById(section)
            .classList.add("active");


        navItems.forEach(nav =>
            nav.classList.remove("active")
        );


        item.classList.add("active");


        const titles = {

            dashboard:
                "Financial Overview",

            transactions:
                "All Transactions",

            settings:
                "Settings"

        };


        document.getElementById("pageTitle")
            .textContent =
            titles[section];

    });

});


document
    .getElementById("darkModeBtn")
    .addEventListener("click", () => {

        document.body.classList.toggle("dark");

        localStorage.setItem(
            "darkMode",
            document.body.classList.contains("dark")
        );

    });


if (
    localStorage.getItem("darkMode") === "true"
) {

    document.body.classList.add("dark");

}


document
    .getElementById("saveSettings")
    .addEventListener("click", () => {

        currency =
            document.getElementById("currency").value;

        localStorage.setItem(
            "currency",
            currency
        );

        updateDashboard();

        renderTransactions();

        alert("Settings saved successfully!");

    });


function formatDate(date) {

    return new Date(date)
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


renderTransactions();

updateDashboard();


const logoutButton =
    document.querySelector(".logout");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem("isLoggedIn");

            localStorage.removeItem("loggedInUser");

            window.location.href =
                "login.html";

        }
    );

}


function togglePassword(inputId, button) {

    const input =
        document.getElementById(inputId);

    const icon =
        button.querySelector("i");


    if (input.type === "password") {

        input.type = "text";

        icon.classList.remove("fa-eye");

        icon.classList.add("fa-eye-slash");

    } else {

        input.type = "password";

        icon.classList.remove("fa-eye-slash");

        icon.classList.add("fa-eye");

    }

}


const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const name =
                document
                    .getElementById("registerName")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("registerEmail")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("registerPassword")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            if (password !== confirmPassword) {

                alert("Passwords do not match.");

                return;

            }


            const existingUser =
                JSON.parse(
                    localStorage.getItem("fintrackUser")
                );


            if (
                existingUser &&
                existingUser.email === email
            ) {

                alert(
                    "An account with this email already exists."
                );

                return;

            }


            const user = {

                name: name,

                email: email,

                password: password

            };


            localStorage.setItem(
                "fintrackUser",
                JSON.stringify(user)
            );


            alert(
                "Account created successfully!"
            );


            window.location.href =
                "login.html";

        }
    );

}


const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            const user =
                JSON.parse(
                    localStorage.getItem("fintrackUser")
                );


            if (!user) {

                alert(
                    "No account found. Please register first."
                );

                return;

            }


            if (
                user.email !== email ||
                user.password !== password
            ) {

                alert(
                    "Invalid email or password."
                );

                return;

            }


            localStorage.setItem(
                "isLoggedIn",
                "true"
            );


            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(user)
            );


            window.location.href =
                "index.html";

        }
    );

}


const forgotPassword =
    document.getElementById("forgotPassword");


if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        function (e) {

            e.preventDefault();

            alert(
                "Password reset will be available after backend authentication is added."
            );

        }
    );

}

