# puppeteer-recorder

Record frame-by-frame animations using puppeteer. Based on electron-recorder.

# Usage

```javascript
const { record } = require('@yoannarres/puppeteer-recorder');

// In this example an animation is displayed at http://0.0.0.0:4200
// The node server is then launched to record the animation to video:
const capture = async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
  await page.goto('http://0.0.0.0:4200'); // The page to be captured
  const framerate = 10;
  const durationInSeconds = 3; // Duration of the recording
  await record({
    browser: browser, // Optional: a puppeteer Browser instance,
    page: page, // Optional: a puppeteer Page instance,
    output: 'output.avi',
    fps: framerate,
    selectedElement: '#myUniqueId', // Optional, should be unique; limits the render to specified DOM element
    logEachFrame: true, // Optional, FFMPEG logging info if true
    frames: framerate * durationInSeconds, // 3 seconds at 10 fps
    prepare: function(browser, page) {
      /* executed before first capture */
    },
    render: function(browser, page, frame) {
      /* executed before each capture */
    }
  });
};

capture();
```

# Lint

```shell
npm run lint

```
