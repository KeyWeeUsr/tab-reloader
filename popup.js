const { "tabs": bt } = browser;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function reloadTabs(tabs, flags) {
    const props = {};
    const { delayMs } = flags;
    if (flags.noCache) {
        props["bypassCache"] = true;
    }

    const reloading = [];
    for (const tab of tabs) {
        const reloadPromise = bt.reload(tab.id, props);
        if (delayMs > 0) {
            await reloadPromise;
            await sleep(delayMs);
            reloading.push(reloadPromise);
        } else {
            reloading.push(reloadPromise);
        }
    }
    return Promise.all(reloading);
}

function normalizeFormData() {
    const defaults = { "delayMs": 0, "noCache": false, "orderReload": false };
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
