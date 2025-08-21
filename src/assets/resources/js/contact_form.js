function checkValue(input) {
    const field = document.getElementById(input).value;

    switch (input) {
        case "inputName":
            // Check if the name field is not empty
            return field !== null && field.trim() !== "";

        case "inputEmail":
            // Check if the email ends with "@gmail.com"
            return field.endsWith("@gmail.com");

        case "inputPhone":
            // Check if the phone field has exactly 10 digits (assuming it's a string of numbers)
            return field.length === 10 && !isNaN(field);
        
        case "inputTopic":
            return field != 0;

        case "inputMsg":
            return field !== null && field.trim() !== "";

        default:
            return false;
    }
}

function addIcon(input, display) {
    const iconDisplay = document.getElementById(display);
    if (checkValue(input)) {
        // If the icon does not already have the success classes, add them
        if (!iconDisplay.classList.contains("bi-check-circle-fill", "text-success")) {
            iconDisplay.classList.remove("bi-x-circle-fill", "text-danger"); // Remove error classes if present
            iconDisplay.classList.add("bi-check-circle-fill", "text-success"); // Add success classes
        }
    }
    else {
        // If the input is invalid, show the error icon
        if (!iconDisplay.classList.contains("bi-x-circle-fill", "text-danger")) {
            iconDisplay.classList.remove("bi-check-circle-fill", "text-success"); // Remove success classes if present
            iconDisplay.classList.add("bi-x-circle-fill", "text-danger"); // Add error classes
        }
    }
}