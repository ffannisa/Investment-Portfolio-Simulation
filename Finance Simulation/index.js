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
        }
    });

    // Initialize modal text
    updateMarketConditionAndModal();
});

function validateInputValue() {
    const value = parseInt(this.value, 10);
    if (isNaN(value)) this.value = '';
    else this.value = Math.max(0, Math.min(100, value));
}

function validateTotal() {
    const inputs = document.querySelectorAll('.percentallocated .input-box');
    const total = Array.from(inputs).reduce((acc, input) => acc + Number(input.value || 0), 0);

    if (total !== 100) {
        alert('The total allocation must equal 100. Currently, it is ' + total + '.');
        return false;
    }
    return true;
}

function incrementYear() {
    const currentYearElement = document.getElementById('currentYear'); // Ensure this ID matches your HTML element
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


function updateMarketConditionAndModal() {
    const marketCondition = generateMarketCondition();
    updateMarketConditionDisplay(marketCondition);
    updateModalText(marketCondition);
}

function generateMarketCondition() {
    const randomNumber = Math.random();
    if (randomNumber < 0.4) return 'Bull';
    else if (randomNumber < 0.7) return 'Bear';
    else return 'Neutral';
}

function updateMarketConditionDisplay(marketCondition) {
    const marketConditionElement = document.getElementById('marketCondition'); // Assuming the ID is 'marketCondition' for the market condition display element
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
