const { afterEach, beforeEach, describe } = require("mocha");
const assert = require("assert");


function dummyGlobals() {
    global.browser = {};
    global.window = { "hasRun": true };
}


const bgTests = () => {
    beforeEach(dummyGlobals);
    afterEach(() => {
        delete global.browser;
        delete global.window;
    });

    it("main not called", () => {
        require("./main");
    });
};


describe("All tests", () => {
    describe("Background service", bgTests);
});
