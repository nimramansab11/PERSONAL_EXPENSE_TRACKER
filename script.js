// ===============================
// Firebase Firestore Connection
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBC3zjr1r9qrY33bKb6VT4aoOedZ10h8D4",
    authDomain: "personal-expense-tracker-26c54.firebaseapp.com",
    databaseURL: "https://personal-expense-tracker-26c54-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "personal-expense-tracker-26c54",
    storageBucket: "personal-expense-tracker-26c54.firebasestorage.app",
    messagingSenderId: "278891137004",
    appId: "1:278891137004:web:384c1ac99b810c6e3622c9",
    measurementId: "G-TFKRTZQKX7"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

console.log("Firebase connected");
console.log("Firestore connected");


// ===============================
// Get HTML Elements
// ===============================

const expenseForm = document.getElementById("expenseForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const tableBody = document.getElementById("expenseTableBody");

const totalExpensesElement =
    document.getElementById("totalExpenses");

const totalAmountElement =
    document.getElementById("totalAmount");


// ===============================
// Set Today's Date
// ===============================

const today = new Date().toISOString().split("T")[0];

if (dateInput) {
    dateInput.value = today;
}


// ===============================
// Add Expense
// ===============================

expenseForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;


    // Validation
    if (
        title === "" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        category === "" ||
        date === ""
    ) {
        alert("Please fill all fields correctly.");
        return;
    }


    try {

        // Save expense to Firestore
        await addDoc(collection(db, "expenses"), {

            title: title,

            amount: amount,

            category: category,

            date: date

        });


        alert("Expense added successfully!");

        // Clear form
        expenseForm.reset();

        // Set today's date again
        dateInput.value = today;


    } catch (error) {

        console.error("Error adding expense:", error);

        alert(
            "Expense could not be added. Please check your Firestore rules."
        );
    }

});


// ===============================
// Display Expenses
// ===============================

const expensesCollection = collection(db, "expenses");

onSnapshot(
    expensesCollection,

    (snapshot) => {

        // Clear table
        tableBody.innerHTML = "";

        let totalExpenses = 0;
        let totalAmount = 0;


        // No expenses
        if (snapshot.empty) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No expenses yet.
                    </td>
                </tr>
            `;

            totalExpensesElement.textContent = "0";
            totalAmountElement.textContent = "0";

            return;
        }


        // Store documents
        const expenses = [];

        snapshot.forEach((expenseDoc) => {

            expenses.push({

                id: expenseDoc.id,

                ...expenseDoc.data()

            });

        });


        // Sort newest date first
        expenses.sort((a, b) => {

            return new Date(b.date) - new Date(a.date);

        });


        // Display each expense
        expenses.forEach((expense) => {

            totalExpenses++;

            totalAmount += Number(expense.amount) || 0;


            const row = document.createElement("tr");


            // Title
            const titleCell = document.createElement("td");

            titleCell.textContent = expense.title;


            // Amount
            const amountCell = document.createElement("td");

            amountCell.textContent =
                `PKR ${Number(expense.amount).toLocaleString()}`;


            // Category
            const categoryCell = document.createElement("td");

            categoryCell.textContent = expense.category;


            // Date
            const dateCell = document.createElement("td");

            dateCell.textContent = expense.date;


            // Delete button
            const actionCell = document.createElement("td");

            const deleteButton =
                document.createElement("button");

            deleteButton.textContent = "Delete";

            deleteButton.className = "delete-btn";


            deleteButton.addEventListener("click", async () => {

                const confirmDelete = confirm(
                    "Are you sure you want to delete this expense?"
                );


                if (!confirmDelete) {
                    return;
                }


                try {

                    await deleteDoc(
                        doc(db, "expenses", expense.id)
                    );

                    alert("Expense deleted successfully!");


                } catch (error) {

                    console.error(
                        "Error deleting expense:",
                        error
                    );

                    alert("Failed to delete expense.");

                }

            });


            actionCell.appendChild(deleteButton);


            // Add cells to row
            row.appendChild(titleCell);

            row.appendChild(amountCell);

            row.appendChild(categoryCell);

            row.appendChild(dateCell);

            row.appendChild(actionCell);


            // Add row to table
            tableBody.appendChild(row);

        });


        // ===============================
        // Update Totals
        // ===============================

        totalExpensesElement.textContent =
            totalExpenses;

        totalAmountElement.textContent =
            totalAmount.toLocaleString();

    },


    // Firestore error
    (error) => {

        console.error(
            "Firestore error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load expenses.
                </td>
            </tr>
        `;

    }
);