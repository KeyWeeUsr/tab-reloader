function normalizeFormData() {
    const defaults = { "delayMs": 0, "noCache": false, "orderReload": false };
    const result = {};
    for (const [key, value] of new FormData(event.target)) {
        result[key] = JSON.parse(value);
    }
    return Object.assign(defaults, result);
}

async function onFormSubmit(event) {
    const flags = normalizeFormData(event);
    await browser.runtime.sendMessage({
        "command": "reload",
        "flags": flags
    });
}

function addListeners() {
    const form = document.getElementById("reloadForm");
    form.addEventListener("submit", onFormSubmit);
}

function main() {
    addListeners();
}
main();
