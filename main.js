const { "tabs": bt } = browser;
const SC_EVERYTHING = "all";
const SC_BEFORE_CURRENT_TAB = "before";
const SC_AFTER_CURRENT_TAB = "after";
const SC_ATTENTION = "attention";
const SC_AUDIO = "audio";
const SC_HIDDEN = "hidden";
const SC_ARTICLE = "article";
const SC_READER = "reader";
const SC_MUTE = "mute";
const SC_PIN = "pin";

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

function handleScenario(data, name) {
    switch (name) {
    case SC_AUDIO:
        data["audible"] = true;
        break;
    case SC_HIDDEN:
        data["hidden"] = true;
        break;
    case SC_MUTE:
        data["muted"] = true;
        break;
    case SC_PIN:
        data["pinned"] = true;
        break;
    }
}

function filterTabsByScenario(tabs, name, flags) {
    const { skipCurrentTab } = flags;

    let result = [];

    let foundCurrent = false;
    for (const tab of tabs) {
        if (name === SC_BEFORE_CURRENT_TAB) {
            if (tab.active && skipCurrentTab) {
                foundActive = true;
                break;
            }
            result.push(tab);
        } else if (name === SC_AFTER_CURRENT_TAB) {
            if (tab.active) {
                foundActive = true;
            }
            if (!foundActive) {
                continue;
            }
            if (skipCurrentTab) {
                continue;
            }
            result.push(tab);
        } else if (name === SC_ATTENTION) {
            if (!tab.attention) {
                continue;
            }
            result.push(tab);
        } else if (name === SC_ARTICLE) {
            if (!tab.isArticle) {
                continue;
            }
            result.push(tab);
        } else if (name === SC_READER) {
            if (!tab.isInReaderMode) {
                continue;
            }
            result.push(tab);
        }
    }

    return result;
}

async function messageHandler(msg) {
    if (msg.command !== "reload") return;

    try {
        const { flags } = msg;
        const { scenario } = flags;
        const queryParams = {};

        if (!flags.allNormalWins) {
            queryParams["currentWindow"] = true;
        }
        handleScenario(queryParams, scenario);

        let tabs = await bt.query(queryParams);
        tabs = filterTabsByScenario(tabs, scenario, flags);

        if (flags.orderReload) {
            for (const loadPromise of reloadTabs(tabs, flags)) {
                await loadPromise;
            }
        } else {
            await reloadTabs(tabs, flags);
        }
    } catch (err) {
        console.error(jsonifyError(err));
    }
}

if (!window.hasRun) {
    main();
}
