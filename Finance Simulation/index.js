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

/// the const randomNumber will be used for expected return calc as M
/// Math.random give randomized value 0 to 1, so must multiply with number to customize
function generateMarketCondition() {
    const randomNumber = Math.random();
    if (randomNumber < 0.4) return { condition: 'Bull', M: Math.random() * (2 - 0.2) + 0.2 };
    else if (randomNumber < 0.7) return { condition: 'Bear', M: Math.random() * (6.5 - 4) + 4 };
    else return { condition: 'Neutral', M: Math.random() * (4 - 2) + 2 };
}

function updateMarketConditionDisplay(marketCondition) {
    const marketConditionElement = document.getElementById('marketCondition'); 
    marketConditionElement.innerText = marketCondition.condition;
}

function updateModalText(marketCondition) {
    const predefinedTexts = {
        'Bull': "Market is looking up! Great time to invest.",
        'Bear': "Caution: Market trends indicate a potential downturn.",
        'Neutral': "Stable market conditions. Proceed with planned investments."
    };
    const text = predefinedTexts[marketCondition.condition] || "Unpredictable market alert! Consider diversifying your portfolio.";
    document.getElementById('modalText').innerHTML = `<p>${text}</p>`;
}

/// function for percent allocation min-max range based on profile selection
function adjustInputRangesBasedOnRisk() {
    const urlParams = new URLSearchParams(window.location.search);
    const riskPreference = urlParams.get('risk');
    
    const highRiskRanges = [
        { min: 5, max: 35 }, // Nvidia
        { min: 5, max: 35 }, // Coca cola
        { min: 20, max: 40 }, // T Bond
        { min: 5, max: 35 }, // S&P 500 ETF
        { min: 5, max: 15 } // Bitcoin
    ];

    const lowRiskRanges = [
        { min: 0, max: 20 }, // Nvidia
        { min: 5, max: 20 }, // Coca cola
        { min: 40, max: 90 }, // T Bond
        { min: 0, max: 20 }, // S&P 500 ETF
        { min: 0, max: 5 } // Bitcoin
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
    'Nvidia': { alpha: 0.64, beta: -3.29, var:0.712 },
    'Coca cola': { alpha: 0.108, beta: -2.21, var:0.016 },
    'S&P 500 ETF': { alpha: 0.188, beta: -3.012, var:0.0257 },
    'T Bond': { alpha: 0.044, beta: -0.462, var: 0.0082 },
    'Bitcoin': { alpha: 22.683, beta: -341.953, var: 809.17 }
};

// Expected returns for each stock, initially empty
let expectedReturns = {
    'Nvidia': [],
    'Coca cola': [],
    'S&P 500 ETF': [],
    'T Bond': [],
    'Bitcoin': []
};

// Extend the updateMarketConditionAndModal function to include expected return calculations
function updateMarketConditionAndModal() {
    const marketCondition = generateMarketCondition();
    const M = Math.random(); // Reuse this value for expected return calculations
    calculateExpectedReturns(M);
    calculateCumulativeReturns(); // Calculate cumulative returns
    calculateSP500Returns();
    updateMarketConditionDisplay(marketCondition);
    updateModalText(marketCondition);
    updateChart();
}

// Utility function to generate random numbers with a normal distribution, The Box-Muller transform
// In finance, asset returns are often modeled as normally distributed, due to the Central Limit Theorem
function normalRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Calculate expected returns for each stock
function calculateExpectedReturns(M) {
    Object.keys(stockParameters).forEach(stock => {
        const { alpha, beta, var: variance } = stockParameters[stock];
        const randomComponent = Math.sqrt(variance) * normalRandom();
        const expectedReturn = alpha + beta * (0.01*M) + randomComponent;
        expectedReturns[stock].push(expectedReturn);
    });
}

let cumulativeReturns = []; // To store cumulative returns for each year

function calculateCumulativeReturns() {
    cumulativeReturns = [];
    const numberOfYears = expectedReturns['Nvidia'].length;
    
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

let yearlyCashBalances = [];

function updateCashBalance() {
    // Dummy implementation - Replace this logic with your actual cash balance update mechanism
    const cashBalanceElement = document.getElementById('currentCashBalance');
    let currentBalance = parseInt(cashBalanceElement.innerText.replace('$', '').replace(',', ''));

    // Calculate cash returns
    const cashReturns = calculateCashReturns();

    // Update cash balance
    const newBalance = currentBalance + cashReturns;
    yearlyCashBalances.push(newBalance); 
    cashBalanceElement.innerText = `$${newBalance.toLocaleString()}`;

    updateChart();

}

let sp500CumulativeReturns = [];

// New function to calculate S&P 500 ETF returns based on its allocation
function calculateSP500Returns() {
    const sp500Returns = expectedReturns['S&P 500 ETF'];
    const inputSelector = 'input[name="s&p-500-etf-allocated"]'; // Adjust the name based on your actual input naming convention
    const inputElement = document.querySelector(inputSelector);
    const percentAllocated = parseFloat(inputElement.value) / 100 || 0;
    sp500CumulativeReturns = sp500Returns.map(returnValue => returnValue * percentAllocated);
}

// Initialization of the charts moved to a function for dynamic updates
let myChart;
let mySecondChart;
let myThirdChart;

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
    
    // Initialize the second chart for cumulative expected returns and S&P 500 comparison
    const ctx2 = document.getElementById('mySecondChart');
    mySecondChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: [], // Will be updated with years as for the first chart
            datasets: [
                {
                    label: 'Cumulative Expected Return',
                    data: [], // Will be updated dynamically
                    borderWidth: 1,
                    borderColor: 'rgb(75, 192, 192)', // Example styling
                    backgroundColor: 'rgba(75, 192, 192, 0.2)' // Example styling
                },
                {
                    label: 'S&P 500 Returns',
                    data: [], // Will be updated with S&P 500 returns
                    borderWidth: 1,
                    borderColor: 'rgb(255, 99, 132)', // Different styling for distinction
                    backgroundColor: 'rgba(255, 99, 132, 0.2)'
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Initialize the third chart for yearly cash balance
    const ctx3 = document.getElementById('myThirdChart');
    myThirdChart = new Chart(ctx3, {
        type: 'bar', // Use a bar chart for the cash balance
        data: {
            labels: [], // Will be updated with years
            datasets: [{
                label: 'Yearly Cash Balance',
                data: [], // Will be updated dynamically
                backgroundColor: 'rgba(153, 102, 255, 0.2)', // Example styling
                borderColor: 'rgba(153, 102, 255, 1)', // Example styling
                borderWidth: 1
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
    myChart.data.labels = expectedReturns['Nvidia'].map((_, index) => `Year ${index + 1}`);
    myChart.data.datasets.forEach(dataset => {
        dataset.data = expectedReturns[dataset.label];
    });
    myChart.update();

    mySecondChart.data.labels = cumulativeReturns.map((_, index) => `Year ${index + 1}`);
    mySecondChart.data.datasets[0].data = cumulativeReturns;
    mySecondChart.data.datasets[1].data = sp500CumulativeReturns;
    console.log("Cumulative Returns:", mySecondChart.data.datasets[0].data); // Add this line for debugging
    console.log("S&P 500 Cumulative Returns:", sp500CumulativeReturns);
    mySecondChart.update();

    myThirdChart.data.labels = yearlyCashBalances.map((_, index) => `Year ${index + 1}`);
    myThirdChart.data.datasets[0].data = yearlyCashBalances;
    myThirdChart.update();
}


document.addEventListener('DOMContentLoaded', function() {
    // Other initialization code
    initializeCharts(); // Call this function to initialize the chart on document load
});
