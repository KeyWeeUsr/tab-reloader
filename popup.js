function onFormSubmit(event) {
    console.log("form submit event", event.target.innerHTML);
}

function addListeners() {
    const form = document.getElementById("reloadForm");
    form.addEventListener("submit", onFormSubmit);
}

function main() {
    addListeners();
}
main();
