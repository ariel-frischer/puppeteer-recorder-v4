import * as childProcess from 'child_process';

const puppeteer = require('puppeteer');

export const record = async function(options) {
  const browser = options.browser || (await puppeteer.launch());
  const page = options.page || (await browser.newPage());

  await options.prepare(browser, page);

  const ffmpegPath = options.ffmpeg || 'ffmpeg';

  const fps = options.fps || 60;

  const outFile = options.output;

  const args = ffmpegArgs(fps);

  if ('format' in options) args.push('-f', options.format);
  else if (!outFile) args.push('-f', 'matroska');

  args.push(outFile || '-');

  const ffmpeg = childProcess.spawn(ffmpegPath, args);

  if (options.pipeOutput) {
    ffmpeg.stdout.pipe(process.stdout);
    ffmpeg.stderr.pipe(process.stderr);
  }

  const closed = new Promise((resolve, reject) => {
    ffmpeg.on('error', reject);
    ffmpeg.on('close', resolve);
  });

  for (let i = 1; i <= options.frames; i++) {
    if (options.logEachFrame)
      console.log(
        `[puppeteer-recorder] rendering frame ${i} of ${options.frames}.`
      );

    await options.render(browser, page, i);
    // Take a screenshot of the selected element if option is present
    let screenshot = await page.screenshot({ omitBackground: true });
    if (options.selectedElement && options.selectedElement !== '') {
      const selectedElement = await page.$(options.selectedElement);

      if (selectedElement !== null) {
        screenshot = await selectedElement.screenshot({
          omitBackground: true
        });
      }
    }

    await write(ffmpeg.stdin, screenshot);
  }

  ffmpeg.stdin.end();

  await closed;
  try {
    await browser.close();
  } catch (error) {
    console.error('ERROR', error);
  }
};

const ffmpegArgs = fps => [
  '-y',
  '-f',
  'image2pipe',
  '-r',
  `${+fps}`,
  '-i',
  '-',
  '-c:v',
  'libx264', // h264 codec
  '-auto-alt-ref',
  '0',
  '-s:v',
  '1280x720',
  '-crf',
  '20',
  '-pix_fmt',
  'yuv420p',
  '-metadata:s:v:0',
  'alpha_mode="1"',
  '-tune',
  'stillimage',
  '-movflags',
  '+faststart'
];

const write = (stream, buffer) =>
  new Promise((resolve, reject) => {
    stream.write(buffer, error => {
      if (error) reject(error);
      else resolve();
    });
  });
