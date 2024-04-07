document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.percentallocated .input-box');
    inputs.forEach(input => {
        input.addEventListener('input', validateInputValue);
    });

    const simulateButton = document.getElementById('simulateButton');
    simulateButton.addEventListener('click', function() {
        if (validateTotal()) {
            updateMarketConditionAndModal();
            incrementYear();
            updateCashBalance();
        }
    });

    // Initialize modal text
    updateMarketConditionAndModal();

    // Adjust input ranges based on risk preference
    adjustInputRangesBasedOnRisk();
});

function validateInputValue() {
    const value = parseInt(this.value, 10);
    if (isNaN(value)) this.value = '';
    else this.value = Math.max(0, Math.min(100, value));
}

function validateTotal() {
    const inputs = document.querySelectorAll('.percentallocated .input-box');
    const total = Array.from(inputs).reduce((acc, input) => acc + Number(input.value || 0), 0);

    let isWithinRange = true;
    inputs.forEach(input => {
        if (input.value < Number(input.min) || input.value > Number(input.max)) {
            isWithinRange = false;
        }
    });

    if (total !== 100) {
        alert('The total allocation must equal 100. Currently, it is ' + total + '.');
        return false;
    } else if (!isWithinRange) {
        alert('One or more inputs are outside the permitted range.');
        return false;
    }
    return true;
}


function incrementYear() {
    const currentYearElement = document.getElementById('currentYear'); 
    let currentYearText = currentYearElement.innerText; // e.g., "0/40"
    let currentYear = parseInt(currentYearText.split('/')[0]); // Extract the current year number

    if (currentYear < 40) {
        currentYear += 1; // Increment the year
        currentYearElement.innerText = `${currentYear}/40`; // Update the display
    } else {
        // Only show the alert if the year is exactly 40 and an attempt is made to go beyond
        alert('Maximum year reached.');
    }
}

/// generating randomised market condition as well as news headline
// function updateMarketConditionAndModal() {
//     const marketCondition = generateMarketCondition();
//     updateMarketConditionDisplay(marketCondition);
//     updateModalText(marketCondition);
// }

/// the const randomNumber will be used for expected return calc as M
function generateMarketCondition() {
    const randomNumber = Math.random();
    if (randomNumber < 0.4) return 'Bull';
    else if (randomNumber < 0.7) return 'Bear';
    else return 'Neutral';
}

function updateMarketConditionDisplay(marketCondition) {
    const marketConditionElement = document.getElementById('marketCondition'); 
    marketConditionElement.innerText = marketCondition;
}

function updateModalText(marketCondition) {
    const predefinedTexts = {
        'Bull': "Market is looking up! Great time to invest.",
        'Bear': "Caution: Market trends indicate a potential downturn.",
        'Neutral': "Stable market conditions. Proceed with planned investments."
    };
    const text = predefinedTexts[marketCondition] || "Unpredictable market alert! Consider diversifying your portfolio.";
    document.getElementById('modalText').innerHTML = `<p>${text}</p>`;
}

// function updateCashBalance() {
//     // Dummy implementation - Replace this logic with your actual cash balance update mechanism
//     var cashBalanceElement = document.getElementById('currentCashBalance');
//     var currentBalance = parseInt(cashBalanceElement.innerText.replace('$', '').replace(',', ''));
    
//     // For demonstration, let's just add a fixed amount
//     var newBalance = currentBalance + 1000; // Example logic, rn use 1000
//     cashBalanceElement.innerText = `$${newBalance.toLocaleString()}`;
// }

/// function for percent allocation min-max range based on profile selection
function adjustInputRangesBasedOnRisk() {
    const urlParams = new URLSearchParams(window.location.search);
    const riskPreference = urlParams.get('risk');
    
    const highRiskRanges = [
        { min: 20, max: 100 }, // Stock 1
        { min: 10, max: 100 }, // Stock 2
        { min: 0, max: 50 }, // SGS Bond
        { min: 5, max: 100 }, // S&P 500 ETF
        { min: 0, max: 70 } // Dogecoin
    ];

    const lowRiskRanges = [
        { min: 0, max: 40 }, // Stock 1
        { min: 0, max: 30 }, // Stock 2
        { min: 10, max: 100 }, // SGS Bond
        { min: 5, max: 50 }, // S&P 500 ETF
        { min: 0, max: 15 } // Dogecoin
    ];

    const inputs = document.querySelectorAll('.percentallocated .input-box');
    
    if (riskPreference === 'high') {
        inputs.forEach((input, index) => {
            input.min = highRiskRanges[index].min;
            input.max = highRiskRanges[index].max;
        });
    } else if (riskPreference === 'low') {
        inputs.forEach((input, index) => {
            input.min = lowRiskRanges[index].min;
            input.max = lowRiskRanges[index].max;
        });
    }
}

// Constants for alpha and beta values of each stock
const stockParameters = {
    'Stock 1': { alpha: -0.409, beta: 36.353 },
    'Stock 2': { alpha: 0.524, beta: -16.895 },
    'S&P 500 ETF': { alpha: 0.302, beta: -8.516 },
    'SGS Bond': { alpha: -0.0198, beta: 3.0001 },
    'Dogecoin': { alpha: 56.06, beta: -1281.893 }
};

// Expected returns for each stock, initially empty
let expectedReturns = {
    'Stock 1': [],
    'Stock 2': [],
    'S&P 500 ETF': [],
    'SGS Bond': [],
    'Dogecoin': []
};

// Extend the updateMarketConditionAndModal function to include expected return calculations
function updateMarketConditionAndModal() {
    const marketCondition = generateMarketCondition();
    const M = Math.random(); // Reuse this value for expected return calculations
    calculateExpectedReturns(M);
    calculateCumulativeReturns(); // Calculate cumulative returns
    updateMarketConditionDisplay(marketCondition);
    updateModalText(marketCondition);
    updateChart();
}

// Calculate expected returns for each stock
function calculateExpectedReturns(M) {
    Object.keys(stockParameters).forEach(stock => {
        const { alpha, beta } = stockParameters[stock];
        const expectedReturn = alpha + beta * M;
        expectedReturns[stock].push(expectedReturn);
    });
}

let cumulativeReturns = []; // To store cumulative returns for each year

function calculateCumulativeReturns() {
    cumulativeReturns = [];
    const numberOfYears = expectedReturns['Stock 1'].length;
    
    for (let year = 0; year < numberOfYears; year++) {
        let cumulativeReturnForYear = 0;
        Object.keys(expectedReturns).forEach(stock => {
            const inputSelector = `input[name="${stock.toLowerCase().replace(/ /g, '-')}-allocated"]`;
            const inputElement = document.querySelector(inputSelector);
            if (!inputElement) {
                console.error("Input element not found for selector:", inputSelector);
                return;
            }
            const percentAllocated = parseFloat(inputElement.value) / 100 || 0;
            const expectedReturn = expectedReturns[stock][year];
            
            console.log(`Year ${year + 1}, Stock: ${stock}, Percent Allocated: ${percentAllocated}, Expected Return: ${expectedReturn}`);
            
            cumulativeReturnForYear += percentAllocated * expectedReturn;
        });
        
        cumulativeReturns.push(cumulativeReturnForYear);
    }
    
    console.log("Cumulative Returns:", cumulativeReturns);
}

function calculateCashReturns() {
    // const cashAllocationPercentage = parseFloat(document.querySelector('input[name="cash-allocated"]').value) / 100 || 0;
    const previousCashBalance = parseInt(document.getElementById('currentCashBalance').innerText.replace('$', '').replace(',', ''));

    let cashReturns = 0;
    cumulativeReturns.forEach((cumulativeReturn, index) => {
        const expectedReturnInDollars = cumulativeReturn * previousCashBalance;
        cashReturns += expectedReturnInDollars;
    });

    return cashReturns;
}

function updateCashBalance() {
    // Dummy implementation - Replace this logic with your actual cash balance update mechanism
    const cashBalanceElement = document.getElementById('currentCashBalance');
    let currentBalance = parseInt(cashBalanceElement.innerText.replace('$', '').replace(',', ''));

    // Calculate cash returns
    const cashReturns = calculateCashReturns();

    // Update cash balance
    const newBalance = currentBalance + cashReturns;
    cashBalanceElement.innerText = `$${newBalance.toLocaleString()}`;
}



// Initialization of the charts moved to a function for dynamic updates
let myChart;
let mySecondChart;

function initializeCharts() {
    const ctx = document.getElementById('myChart');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Labels will be years
            datasets: Object.keys(expectedReturns).map(stock => ({
                label: stock,
                data: [],
                borderWidth: 1
            }))
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Initialize the second chart for cumulative expected returns
    const ctx2 = document.getElementById('mySecondChart');
    mySecondChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: [], // Will be updated with years as for the first chart
            datasets: [{
                label: 'Cumulative Expected Return',
                data: [], // Will be updated dynamically
                borderWidth: 1,
                borderColor: 'rgb(75, 192, 192)', // Example styling
                backgroundColor: 'rgba(75, 192, 192, 0.2)' // Example styling
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateChart() {
    console.log("Cumulative Returns:", cumulativeReturns); // Add this line for debugging
    myChart.data.labels = expectedReturns['Stock 1'].map((_, index) => `Year ${index + 1}`);
    myChart.data.datasets.forEach(dataset => {
        dataset.data = expectedReturns[dataset.label];
    });
    myChart.update();

    mySecondChart.data.labels = cumulativeReturns.map((_, index) => `Year ${index + 1}`);
    mySecondChart.data.datasets[0].data = cumulativeReturns;
    console.log("Second Chart Data:", mySecondChart.data.datasets[0].data); // Add this line for debugging
    mySecondChart.update();
}


document.addEventListener('DOMContentLoaded', function() {
    // Other initialization code
    initializeCharts(); // Call this function to initialize the chart on document load
});
