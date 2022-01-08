function normalizeFormData() {
    const defaults = { "noCache": false, "orderReload": false };
    const result = {};
    for (const [key, value] of new FormData(event.target)) {
        result[key] = JSON.parse(value);
    }
    return Object.assign(defaults, result);
}

function onFormSubmit(event) {
    const flags = normalizeFormData(event);
    console.log(flags);
}

function addListeners() {
    const form = document.getElementById("reloadForm");
    form.addEventListener("submit", onFormSubmit);
}

function main() {
    addListeners();
}
main();
