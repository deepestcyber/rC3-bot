const CDP = require('chrome-remote-interface');
const chromeLauncher = require('chrome-launcher');
const atob = require('atob');
const btoa = require('btoa');
const assert = require('assert').strict;

// Optional: set logging level of launcher to see its output.
// Install it using: npm i --save lighthouse-logger
// const log = require('lighthouse-logger');
// log.setLevel('info');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Launches a debugging instance of Chrome.
 * @param {boolean=} headless True (default) launches Chrome in headless mode.
 *     False launches a full version of Chrome.
 * @return {Promise<ChromeLauncher>}
 */
function launchChrome(headless = false) {
    return chromeLauncher.launch({
        // port: 9222, // Uncomment to force a specific port of your choice.
        chromeFlags: [
            '--window-size=640,480',
            // '--disable-gpu',
            headless ? '--headless' : ''
        ]
    });
}

// launchChrome().then(chrome => {
//     console.log(`Chrome debuggable on port: ${chrome.port}`);
//   ...
//   // chrome.kill();
// });


(async function () {

    const chrome = await launchChrome();
    console.log(`Chrome debuggable on port: ${chrome.port}`);
    const protocol = await CDP({ port: chrome.port });

    // Extract the DevTools protocol domains we need and enable them.
    // See API docs: https://chromedevtools.github.io/devtools-protocol/
    const { Page, Runtime, Network, Input, DOM } = protocol;
    await Promise.all([Page.enable(), Runtime.enable(), Network.enable(), DOM.enable()]);

    // Network.responseReceived(async ({ requestId, response }) => {
    //     let url = response ? response.url : null;
    //     console.log(url);
    //     // if ((url.indexOf('.jpg') >= 0) || (url.indexOf('.png') >= 0)) {
    //     //   const {body, base64Encoded} = await Network.getResponseBody({ requestId }); // throws promise error returning null/undefined so can't destructure. Must be different in inspect shell to app?
    //     //   _pics.push({ url, body, base64Encoded });
    //     //   console.log(url, body, base64Encoded);
    //     // }
    // });

    await Network.setRequestInterception({
        patterns: [
            {
                urlPattern: '*.js*',
                resourceType: 'Script',
                interceptionStage: 'HeadersReceived'
            }
        ]
    });

    Network.requestIntercepted(async ({ interceptionId, request }) => {
        console.log(`Intercepted ${request.url} {interception id: ${interceptionId}}`);
        // const response = await Network.getResponseBodyForInterception({ interceptionId });
        // const bodyData = response.base64Encoded ? atob(response.body) : response.body;
        // const newBody = bodyData + `\nalert('Executed modified resource for ${request.url}');`;

        // const newHeaders = [
        //     'Date: ' + (new Date()).toUTCString(),
        //     'Connection: closed',
        //     'Content-Length: ' + newBody.length,
        //     'Content-Type: text/javascript'
        // ];

        // Network.continueInterceptedRequest({
        //     interceptionId,
        //     rawResponse: btoa(
        //         'HTTP/1.1 200 OK\r\n' +
        //         newHeaders.join('\r\n') +
        //         '\r\n\r\n' +
        //         newBody
        //     )
        // });

        Network.continueInterceptedRequest({ interceptionId });
    });

    //Page.navigate({ url: 'https://x3ro.de/compiling-keen-dreams-within-dosbox-on-os-x/' });

    Page.navigate({ url: 'https://test.visit.at.wa-test.rc3.cccv.de/_/global/raw.githubusercontent.com/deepestcyber/rC3-world/master/maps/map.json' });

    // Wait for window.onload before doing stuff.
    Page.loadEventFired(async () => {
        const js = "document.querySelector('title').textContent";
        // Evaluate the JS expression in the page.
        const result = await Runtime.evaluate({ expression: js });
        console.log('Title of page: ' + result.result.value);

        // console.log("waiting");
        // await sleep(2000);

        // let search = await DOM.performSearch({ query: "#game-overlay" });
        // assert(search.resultCount == 1);
        // let results = await DOM.getSearchResults({ searchId: search.searchId, fromIndex: 0, toIndex: 1 });

        // let rootNode = (await DOM.getDocument()).root;
        // console.log("root node", rootNode);

        // let nodeId = (await DOM.querySelector({ nodeId: rootNode.nodeId, selector: "#game-overlay" })).nodeId;
        // console.log(nodeId);
        // //let nodeId = results.nodeIds[0];
        // console.log(nodeId);

        // await DOM.focus({ nodeId: rootNode.nodeId });


        // await Input.dispatchMouseEvent({ type: 'mousePressed', x: 320, y: 240 });
        // await Input.dispatchMouseEvent({ type: 'mousePressed', x: 320, y: 240 });
        while (true) {
            let foo = await Input.dispatchKeyEvent({ type: 'char', text: 'A' });
            console.log(foo);
            await sleep(1000);

        }
        //await Input.insertText({ text: "foobar" });
        // await Input.dispatchKeyEvent({ type: 'keyUp' })

        console.log("done");

        protocol.close();
        //chrome.kill(); // Kill Chrome.
    });

})();
