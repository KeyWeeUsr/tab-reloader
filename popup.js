const { "tabs": bt } = browser;

async function reloadTabs(tabs, flags) {
    const props = {};
    if (flags.noCache) {
        props["bypassCache"] = true;
    }

    const reloading = [];
    for (const tab of tabs) {
        reloading.push(bt.reload(tab.id, props));
    }
    return Promise.all(reloading);
}

function normalizeFormData() {
    const defaults = { "noCache": false, "orderReload": false };
    const result = {};
    for (const [key, value] of new FormData(event.target)) {
        result[key] = JSON.parse(value);
    }
    return Object.assign(defaults, result);
}

function jsonifyError(err) {
    return Object.getOwnPropertyNames(err).reduce((data, key) => {
        data[key] = err[key];
        return data;
    }, {})
}

async function onFormSubmit(event) {
    const submitButton = "reloadSubmit";
    document.getElementById(submitButton).disabled = true;

    try {
        const flags = normalizeFormData(event);
        const queryParams = {};

        if (true /* !flags.allWindows */) {
            queryParams["currentWindow"] = true;
        }

        const tabs = await bt.query(queryParams);
        await reloadTabs(tabs, flags);
    } catch (err) {
        console.error(jsonifyError(err));
    } finally {
        document.getElementById(submitButton).disabled = false;
    }
}

function addListeners() {
    const form = document.getElementById("reloadForm");
    form.addEventListener("submit", onFormSubmit);
}

function main() {
    addListeners();
}
main();
