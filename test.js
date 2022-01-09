const { afterEach, beforeEach, describe } = require("mocha");
const sinon = require("sinon");
const assert = require("assert");


function clearCache() {
    const keys = Object.keys(require.cache).filter(
        item => !item.includes("node_modules") && item != module.filename
    );
    for (const mod of keys) {
        delete require.cache[mod];
    }
}


function dummyGlobals() {
    global.browser = {};
    global.window = { "hasRun": true };
}


const bgTests = () => {
    beforeEach(() => {
        assert(global.browser === undefined);
        assert(global.window === undefined);
        dummyGlobals();
        assert(global.browser !== undefined);
        assert(global.window !== undefined);
    });

    afterEach(() => {
        sinon.restore();
        delete global.browser;
        delete global.window;
        clearCache();
    });

    it("main not called", () => {
        require("./main");
    });

    it("message handler set up", () => {
        const addListener = sinon.stub();
        global.browser = { "runtime": { "onMessage": { addListener } } };
        global.window = { "hasRun": false };

        const module = require("./main");
        assert(addListener.calledOnceWith(module.messageHandler));
    });

    it("sleep hangs", async () => {
        const ms = 100;
        const start = new Date().getUTCMilliseconds();
        const { sleep } = require("./main");
        await sleep(ms);
        const end = new Date().getUTCMilliseconds();
        assert(end - start > (ms - 10));
    });

    it("Error jsonified", () => {
        const module = require("./main");
        const obj = module.jsonifyError(new Error("test"));
        assert(obj.stack.includes("Error: test\n    at Context.<anonymous>"));
        assert(obj.message === "test");
    });

    it("set query() params by scenario", () => {
        const module = require("./main");
        const mapping = {
            [module.SC_AUDIO]: "audible",
            [module.SC_HIDDEN]: "hidden",
            [module.SC_MUTE]: "muted",
            [module.SC_PIN]: "pinned"
        };
        for (const [key, val] of Object.entries(mapping)) {
            const data = {};
            module.handleScenario(data, key);
            assert(data[val]);
        }
    });

    it("no tabs to reload", async () => {
        const module = require("./main");
        const result = await module.reloadTabs([], {});
        assert(result.length === 0);
    });
};


describe("All tests", () => {
    describe("Background service", bgTests);
});
