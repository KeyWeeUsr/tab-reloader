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
    const { delaySec } = flags;
    if (flags.noCache) {
        props["bypassCache"] = true;
    }

    const reloading = [];
    for (const tab of tabs) {
        if (tab.url.includes("about:")) {
            console.warn("about:* pages break the refreshing, skipping!");
            continue;
        }

        const { id } = tab;
        const reloadPromise = bt.reload(id, props);

        if (delaySec > 0) {
            if (flags.waitForLoad) {
                await reloadPromise;
                const scriptOpts = {
                    "allFrames": true,
                    "code": `true`,
                    "runAt": "document_idle"
                };
                let loaded = (await bt.executeScript(id, scriptOpts))[0];

                while (loaded != true || tab.status != "complete") {
                    console.warn(id, "sleep", loaded, tab.status);
                    await sleep(100);
                    loaded = (await bt.executeScript(id, scriptOpts))[0];
                };
            }
            await sleep(delaySec * 1000);
            reloading.push(reloadPromise);
        } else {
            reloading.push(reloadPromise);
        }
    }

    if (flags.orderReload) {
        return reloading;
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

        if (!flags.allNormalWins) {
            queryParams["currentWindow"] = true;
        }

        const tabs = await bt.query(queryParams);
        const { flags } = msg;
        if (flags.orderReload) {
            for (const loadPromise of reloadTabs(tabs, flags)) {
                await loadPromise;
            }
        } else {
            await reloadTabs(tabs, msg.flags);
        }
    } catch (err) {
        console.error(jsonifyError(err));
    }
}

if (!window.hasRun) {
    main();
}
