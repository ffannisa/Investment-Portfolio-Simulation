document.addEventListener('DOMContentLoaded', function() {
    var inputs = document.querySelectorAll('.percentallocated .input-box');

    inputs.forEach(function(input) {
        input.addEventListener('input', function() {
            var value = parseInt(this.value, 10);

            if (isNaN(value)) { // Reset if not a number
                this.value = '';
            } else if (value < 0) { // Correct negative values
                this.value = 0;
            } else if (value > 100) { // Correct values over 100
                this.value = 100;
            }
        });
    });

    // Add event listener to the Simulate button to update modal text
    var simulateButton = document.querySelector('.btn-success.btn-icon-split');
    simulateButton.addEventListener('click', updateModalText);
});

function updateModalText() {
    var predefinedTexts = [
        "Market is looking up! Great time to invest.",
        "Caution: Market trends indicate a potential downturn.",
        "Stable market conditions. Proceed with planned investments.",
        "Unpredictable market alert! Consider diversifying your portfolio.",
        "Bull market on the horizon! Increase your stock investments."
    ];

    // Select a random text from predefinedTexts
    var randomText = predefinedTexts[Math.floor(Math.random() * predefinedTexts.length)];

    // Update the modal's text with the selected random text
    document.getElementById('modalText').innerHTML = `<p>${randomText}</p>`;
}

updateModalText()

function validateTotal() {
    var inputs = document.querySelectorAll('.percentallocated .input-box');
    var total = 0;
    var emptyFields = []; // Array to store names of empty fields

    // Check for empty inputs and calculate total in the same loop
    inputs.forEach(function(input) {
        if (input.value === '') {
            emptyFields.push(input.placeholder); // Add placeholder name to the array
        } else {
            total += Number(input.value);
        }
    });

    // Check if there are any empty fields
    if (emptyFields.length > 0) {
        // Create a message listing all empty fields
        var message = 'Please fill the following fields: ' + emptyFields.join(', ');
        alert(message);
        return; // Stop the function if there are empty fields
    }

    // Proceed with total validation only if all fields are filled
    if (total === 100) {
        alert('The total allocation is valid.');
        // Further actions here (e.g., form submission)
    } else {
        alert('The total allocation must equal 100. Currently, it is ' + total + '.');
    }
}