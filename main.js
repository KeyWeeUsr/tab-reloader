function main() {
    // prevent duplicate loading
    window.hasRun = true;
    browser.runtime.onMessage.addListener(messageHandler);
}


async function messageHandler(msg) {
    console.log(msg);
}

if (!window.hasRun) {
    main();
}
