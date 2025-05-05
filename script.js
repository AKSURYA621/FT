// Global variables
let records = [];
let savingsGoal = 0;
let delayedExpenses = [];
let roomExpenses = [];
let moneyGiven = [];
let moneyTaken = [];

// Event Listeners
document.getElementById('financialForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const record = {
        date: document.getElementById('date').value,
        monthlyIncome: parseFloat(document.getElementById('monthlyIncome').value),
        rent: parseFloat(document.getElementById('rent').value),
        otherExpenses: parseFloat(document.getElementById('otherExpenses').value),
        roomExpenses: parseFloat(document.getElementById('roomExpenses').value),
        sipAmount: parseFloat(document.getElementById('sipAmount').value)
    };

    records.push(record);
    updateTable();
    updateSummary();
    this.reset();
});

document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const expense = {
        date: document.getElementById('expenseDate').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        type: document.getElementById('expenseType').value
    };

    if (expense.type === 'delayed') {
        delayedExpenses.push(expense);
    } else {
        roomExpenses.push(expense);
    }

    updateExpenseTables();
    updateExpenseSummary();
    this.reset();
});

document.getElementById('transactionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const transaction = {
        type: document.getElementById('transactionType').value,
        personName: document.getElementById('personName').value,
        date: document.getElementById('transactionDate').value,
        amount: parseFloat(document.getElementById('transactionAmount').value),
        recoveryDate: document.getElementById('recoveryDate').value,
        status: document.getElementById('transactionStatus').value
    };

    if (transaction.type === 'given') {
        moneyGiven.push(transaction);
    } else {
        moneyTaken.push(transaction);
    }

    updateTransactionTables();
    updateTransactionSummary();
    this.reset();
});

// Update Functions
function updateTable() {
    const tbody = document.getElementById('recordsTable');
    tbody.innerHTML = '';
    
    let totalIncome = 0;
    let totalRent = 0;
    let totalOtherExpenses = 0;
    let totalRoomExpenses = 0;
    let totalSIP = 0;
    let totalNetSaving = 0;

    records.forEach((record, index) => {
        const netSaving = record.monthlyIncome - record.rent - record.otherExpenses - record.roomExpenses - record.sipAmount;

        totalIncome += record.monthlyIncome;
        totalRent += record.rent;
        totalOtherExpenses += record.otherExpenses;
        totalRoomExpenses += record.roomExpenses;
        totalSIP += record.sipAmount;
        totalNetSaving += netSaving;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>₹${record.monthlyIncome.toFixed(2)}</td>
            <td>₹${record.rent.toFixed(2)}</td>
            <td>₹${record.otherExpenses.toFixed(2)}</td>
            <td>₹${record.roomExpenses.toFixed(2)}</td>
            <td>₹${record.sipAmount.toFixed(2)}</td>
            <td>₹${netSaving.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteRecord(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('totalIncomeTable').textContent = `₹${totalIncome.toFixed(2)}`;
    document.getElementById('totalRentTable').textContent = `₹${totalRent.toFixed(2)}`;
    document.getElementById('totalOtherExpensesTable').textContent = `₹${totalOtherExpenses.toFixed(2)}`;
    document.getElementById('totalRoomExpensesTable').textContent = `₹${totalRoomExpenses.toFixed(2)}`;
    document.getElementById('totalSIPTable').textContent = `₹${totalSIP.toFixed(2)}`;
    document.getElementById('totalNetSavingTable').textContent = `₹${totalNetSaving.toFixed(2)}`;
}

function updateExpenseTables() {
    const delayedTbody = document.getElementById('delayedExpensesTable');
    const roomTbody = document.getElementById('roomExpensesTable');
    
    delayedTbody.innerHTML = '';
    roomTbody.innerHTML = '';

    let totalDelayed = 0;
    let totalRoom = 0;

    delayedExpenses.forEach((expense, index) => {
        totalDelayed += expense.amount;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.date}</td>
            <td>₹${expense.amount.toFixed(2)}</td>
            <td>₹${totalDelayed.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteDelayedExpense(${index})">Delete</button>
            </td>
        `;
        delayedTbody.appendChild(row);
    });

    roomExpenses.forEach((expense, index) => {
        totalRoom += expense.amount;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.date}</td>
            <td>₹${expense.amount.toFixed(2)}</td>
            <td>₹${totalRoom.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteRoomExpense(${index})">Delete</button>
            </td>
        `;
        roomTbody.appendChild(row);
    });
}

function updateExpenseSummary() {
    let totalDelayed = delayedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    let totalRoom = roomExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    let totalToPay = totalDelayed + totalRoom;

    document.getElementById('totalDelayedExpenses').textContent = totalDelayed.toFixed(2);
    document.getElementById('totalRoomExpensesSummary').textContent = totalRoom.toFixed(2);
    document.getElementById('totalAmountToPay').textContent = totalToPay.toFixed(2);
}

function updateTransactionTables() {
    const givenTbody = document.getElementById('moneyGivenTable');
    const takenTbody = document.getElementById('moneyTakenTable');
    
    givenTbody.innerHTML = '';
    takenTbody.innerHTML = '';

    moneyGiven.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.personName}</td>
            <td>₹${transaction.amount.toFixed(2)}</td>
            <td>${transaction.recoveryDate}</td>
            <td class="status-${transaction.status}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteMoneyGiven(${index})">Delete</button>
                <button class="btn btn-info btn-sm" onclick="updateStatus(${index}, 'given')">Update Status</button>
            </td>
        `;
        givenTbody.appendChild(row);
    });

    moneyTaken.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.personName}</td>
            <td>₹${transaction.amount.toFixed(2)}</td>
            <td>${transaction.recoveryDate}</td>
            <td class="status-${transaction.status}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteMoneyTaken(${index})">Delete</button>
                <button class="btn btn-info btn-sm" onclick="updateStatus(${index}, 'taken')">Update Status</button>
            </td>
        `;
        takenTbody.appendChild(row);
    });
}

function updateTransactionSummary() {
    let totalToReceive = moneyGiven.reduce((sum, transaction) => 
        transaction.status === 'pending' ? sum + transaction.amount : sum, 0);
    let totalToPay = moneyTaken.reduce((sum, transaction) => 
        transaction.status === 'pending' ? sum + transaction.amount : sum, 0);

    document.getElementById('totalToReceive').textContent = totalToReceive.toFixed(2);
    document.getElementById('totalToPay').textContent = totalToPay.toFixed(2);
}

function updateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavings = 0;

    records.forEach(record => {
        totalIncome += record.monthlyIncome;
        totalExpenses += record.rent + record.otherExpenses + record.roomExpenses + record.sipAmount;
        totalSavings += record.monthlyIncome - (record.rent + record.otherExpenses + record.roomExpenses + record.sipAmount);
    });

    document.getElementById('totalIncome').textContent = totalIncome.toFixed(2);
    document.getElementById('totalExpenses').textContent = totalExpenses.toFixed(2);
    document.getElementById('totalSavings').textContent = totalSavings.toFixed(2);
    document.getElementById('savingsGoal').textContent = savingsGoal.toFixed(2);

    const progress = savingsGoal > 0 ? (totalSavings / savingsGoal) * 100 : 0;
    document.querySelector('.progress-bar').style.width = `${Math.min(progress, 100)}%`;
}

// Delete Functions
function deleteRecord(index) {
    records.splice(index, 1);
    updateTable();
    updateSummary();
}

function deleteDelayedExpense(index) {
    delayedExpenses.splice(index, 1);
    updateExpenseTables();
    updateExpenseSummary();
}

function deleteRoomExpense(index) {
    roomExpenses.splice(index, 1);
    updateExpenseTables();
    updateExpenseSummary();
}

function deleteMoneyGiven(index) {
    moneyGiven.splice(index, 1);
    updateTransactionTables();
    updateTransactionSummary();
}

function deleteMoneyTaken(index) {
    moneyTaken.splice(index, 1);
    updateTransactionTables();
    updateTransactionSummary();
}

// Other Functions
function setSavingsGoal() {
    savingsGoal = parseFloat(document.getElementById('savingsGoalInput').value) || 0;
    updateSummary();
}

function updateStatus(index, type) {
    const transactions = type === 'given' ? moneyGiven : moneyTaken;
    const currentStatus = transactions[index].status;
    transactions[index].status = currentStatus === 'pending' ? 'completed' : 'pending';
    updateTransactionTables();
    updateTransactionSummary();
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

function exportToExcel() {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert records to worksheet
    const ws_data = [
        ['Date', 'Monthly Income', 'Rent', 'Other Expenses', 'Room Expenses', 'SIP Amount', 'Net Saving']
    ];
    
    records.forEach(record => {
        const netSaving = record.monthlyIncome - record.rent - record.otherExpenses - record.roomExpenses - record.sipAmount;
        ws_data.push([
            record.date,
            record.monthlyIncome,
            record.rent,
            record.otherExpenses,
            record.roomExpenses,
            record.sipAmount,
            netSaving
        ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Financial Records");
    
    // Generate Excel file
    XLSX.writeFile(wb, "financial_records.xlsx");
}

function exportIncomeExpensesToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Income & Expenses Report", 14, 15);
    
    // Add table
    const tableData = [
        ['Date', 'Monthly Income', 'Rent', 'Other Expenses', 'Room Expenses', 'SIP Amount', 'Net Saving']
    ];
    
    records.forEach(record => {
        const netSaving = record.monthlyIncome - record.rent - record.otherExpenses - record.roomExpenses - record.sipAmount;
        tableData.push([
            record.date,
            `₹${record.monthlyIncome.toFixed(2)}`,
            `₹${record.rent.toFixed(2)}`,
            `₹${record.otherExpenses.toFixed(2)}`,
            `₹${record.roomExpenses.toFixed(2)}`,
            `₹${record.sipAmount.toFixed(2)}`,
            `₹${netSaving.toFixed(2)}`
        ]);
    });
    
    doc.autoTable({
        head: [tableData[0]],
        body: tableData.slice(1),
        startY: 25,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 }
    });
    
    // Save the PDF
    doc.save("income_expenses_report.pdf");
}

function exportMonthlyExpensesToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Monthly Expenses Report", 14, 15);
    
    // Add Delayed Expenses table
    doc.setFontSize(12);
    doc.text("Delayed Expenses", 14, 30);
    
    const delayedTableData = [
        ['Date', 'Amount', 'Total']
    ];
    
    let totalDelayed = 0;
    delayedExpenses.forEach(expense => {
        totalDelayed += expense.amount;
        delayedTableData.push([
            expense.date,
            `₹${expense.amount.toFixed(2)}`,
            `₹${totalDelayed.toFixed(2)}`
        ]);
    });
    
    doc.autoTable({
        head: [delayedTableData[0]],
        body: delayedTableData.slice(1),
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 }
    });
    
    // Add Room Expenses table
    doc.setFontSize(12);
    doc.text("Room Expenses", 14, doc.autoTable.previous.finalY + 10);
    
    const roomTableData = [
        ['Date', 'Amount', 'Total']
    ];
    
    let totalRoom = 0;
    roomExpenses.forEach(expense => {
        totalRoom += expense.amount;
        roomTableData.push([
            expense.date,
            `₹${expense.amount.toFixed(2)}`,
            `₹${totalRoom.toFixed(2)}`
        ]);
    });
    
    doc.autoTable({
        head: [roomTableData[0]],
        body: roomTableData.slice(1),
        startY: doc.autoTable.previous.finalY + 15,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 }
    });
    
    // Save the PDF
    doc.save("monthly_expenses_report.pdf");
}

function exportMoneyTransactionsToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Money Transactions Report", 14, 15);
    
    // Add Money Given table
    doc.setFontSize(12);
    doc.text("Money Given", 14, 30);
    
    const givenTableData = [
        ['Date', 'Person Name', 'Amount', 'Recovery Date', 'Status']
    ];
    
    moneyGiven.forEach(transaction => {
        givenTableData.push([
            transaction.date,
            transaction.personName,
            `₹${transaction.amount.toFixed(2)}`,
            transaction.recoveryDate,
            transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
        ]);
    });
    
    doc.autoTable({
        head: [givenTableData[0]],
        body: givenTableData.slice(1),
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 }
    });
    
    // Add Money Taken table
    doc.setFontSize(12);
    doc.text("Money Taken", 14, doc.autoTable.previous.finalY + 10);
    
    const takenTableData = [
        ['Date', 'Person Name', 'Amount', 'Return Date', 'Status']
    ];
    
    moneyTaken.forEach(transaction => {
        takenTableData.push([
            transaction.date,
            transaction.personName,
            `₹${transaction.amount.toFixed(2)}`,
            transaction.recoveryDate,
            transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
        ]);
    });
    
    doc.autoTable({
        head: [takenTableData[0]],
        body: takenTableData.slice(1),
        startY: doc.autoTable.previous.finalY + 15,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 }
    });
    
    // Save the PDF
    doc.save("money_transactions_report.pdf");
}

function exportAllToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add main title
    doc.setFontSize(20);
    doc.text("Financial Tracker Report", 14, 15);
    
    // Income & Expenses Section
    doc.setFontSize(16);
    doc.text("1. Income & Expenses", 14, 30);
    
    const incomeTableData = [
        ['Date', 'Monthly Income', 'Rent', 'Other Expenses', 'Room Expenses', 'SIP Amount', 'Net Saving']
    ];
    
    records.forEach(record => {
        const netSaving = record.monthlyIncome - record.rent - record.otherExpenses - record.roomExpenses - record.sipAmount;
        incomeTableData.push([
            record.date,
            `₹${record.monthlyIncome.toFixed(2)}`,
            `₹${record.rent.toFixed(2)}`,
            `₹${record.otherExpenses.toFixed(2)}`,
            `₹${record.roomExpenses.toFixed(2)}`,
            `₹${record.sipAmount.toFixed(2)}`,
            `₹${netSaving.toFixed(2)}`
        ]);
    });
    
    doc.autoTable({
        head: [incomeTableData[0]],
        body: incomeTableData.slice(1),
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 }
    });
    
    // Monthly Expenses Section
    doc.setFontSize(16);
    doc.text("2. Monthly Expenses", 14, doc.autoTable.previous.finalY + 15);
    
    // Delayed Expenses
    doc.setFontSize(12);
    doc.text("Delayed Expenses", 14, doc.autoTable.previous.finalY + 25);
    
    const delayedTableData = [
        ['Date', 'Amount', 'Total']
    ];
    
    let totalDelayed = 0;
    delayedExpenses.forEach(expense => {
        totalDelayed += expense.amount;
        delayedTableData.push([
            expense.date,
            `₹${expense.amount.toFixed(2)}`,
            `₹${totalDelayed.toFixed(2)}`
        ]);
    });
    
    doc.autoTable({
        head: [delayedTableData[0]],
        body: delayedTableData.slice(1),
        startY: doc.autoTable.previous.finalY + 30,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 }
    });
    
    // Room Expenses
    doc.setFontSize(12);
    doc.text("Room Expenses", 14, doc.autoTable.previous.finalY + 10);
    
    const roomTableData = [
        ['Date', 'Amount', 'Total']
    ];
    
    let totalRoom = 0;
    roomExpenses.forEach(expense => {
        totalRoom += expense.amount;
        roomTableData.push([
            expense.date,
            `₹${expense.amount.toFixed(2)}`,
            `₹${totalRoom.toFixed(2)}`
        ]);
    });
    
    doc.autoTable({
        head: [roomTableData[0]],
        body: roomTableData.slice(1),
        startY: doc.autoTable.previous.finalY + 15,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 }
    });
    
    // Money Transactions Section
    doc.setFontSize(16);
    doc.text("3. Money Transactions", 14, doc.autoTable.previous.finalY + 15);
    
    // Money Given
    doc.setFontSize(12);
    doc.text("Money Given", 14, doc.autoTable.previous.finalY + 25);
    
    const givenTableData = [
        ['Date', 'Person Name', 'Amount', 'Recovery Date', 'Status']
    ];
    
    moneyGiven.forEach(transaction => {
        givenTableData.push([
            transaction.date,
            transaction.personName,
            `₹${transaction.amount.toFixed(2)}`,
            transaction.recoveryDate,
            transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
        ]);
    });
    
    doc.autoTable({
        head: [givenTableData[0]],
        body: givenTableData.slice(1),
        startY: doc.autoTable.previous.finalY + 30,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 }
    });
    
    // Money Taken
    doc.setFontSize(12);
    doc.text("Money Taken", 14, doc.autoTable.previous.finalY + 10);
    
    const takenTableData = [
        ['Date', 'Person Name', 'Amount', 'Return Date', 'Status']
    ];
    
    moneyTaken.forEach(transaction => {
        takenTableData.push([
            transaction.date,
            transaction.personName,
            `₹${transaction.amount.toFixed(2)}`,
            transaction.recoveryDate,
            transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
        ]);
    });
    
    doc.autoTable({
        head: [takenTableData[0]],
        body: takenTableData.slice(1),
        startY: doc.autoTable.previous.finalY + 15,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 }
    });
    
    // Save the PDF
    doc.save("financial_tracker_report.pdf");
}

function downloadFile(filename) {
    // Create a link element
    const link = document.createElement('a');
    link.href = filename;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function editSavingsGoal() {
    const currentGoal = savingsGoal;
    const newGoal = prompt("Enter new savings goal (₹):", currentGoal);
    
    if (newGoal !== null) {
        const parsedGoal = parseFloat(newGoal);
        if (!isNaN(parsedGoal) && parsedGoal >= 0) {
            savingsGoal = parsedGoal;
            updateSummary();
        } else {
            alert("Please enter a valid number greater than or equal to 0");
        }
    }
} 