const nameInput = document.getElementById("nameInput");
const numberInput = document.getElementById("numberInput");
const deleteButton = document.getElementById("deleteButton");

const nameInitialValue = nameInput.value;
const numberInitialValue = numberInput.value;
console.log("🚀 ~ file: script.js:7 ~ numberInitialValue:", numberInitialValue)
console.log("🚀 ~ file: script.js:7 ~ numberInitialValue:", numberInitialValue)

function updateInputHandler(e) {
    if (nameInput.value === nameInitialValue && numberInput.value === numberInitialValue) {
        deleteButton.disabled = false;
    } else {
        deleteButton.disabled = true;
    }
}

nameInput.addEventListener("input", updateInputHandler);
numberInput.addEventListener("input", updateInputHandler);