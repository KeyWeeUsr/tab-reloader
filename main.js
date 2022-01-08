const { "tabs": bt } = browser;

function main() {
    // prevent duplicate loading
    window.hasRun = true;
    browser.runtime.onMessage.addListener(messageHandler);
}

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

function jsonifyError(err) {
    return Object.getOwnPropertyNames(err).reduce((data, key) => {
        data[key] = err[key];
        return data;
    }, {})
}

async function messageHandler(msg) {
    if (msg.command !== "reload") return;

    try {
        const queryParams = {};

        if (true /* !flags.allWindows */) {
            queryParams["currentWindow"] = true;
        }

        const tabs = await bt.query(queryParams);
        await reloadTabs(tabs, msg.flags);
    } catch (err) {
        console.error(jsonifyError(err));
    }
}

if (!window.hasRun) {
    main();
}
