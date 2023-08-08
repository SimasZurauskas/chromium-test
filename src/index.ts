import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
// @ts-ignore
import helmet from 'helmet';
// @ts-ignore
import cors from 'cors';
// @ts-ignore
import chromium from 'chromium';
import puppeteer from 'puppeteer';

const isProd = process.env.NODE_ENV === 'production';

// Express
const app = express();
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '100mb' }));

app.get('/', (req, res) => {
  res.send('ok');
});

console.log(chromium.defaultViewport);

app.get('/pdf', async (req, res) => {
  try {
    // const buffer = await generatePDF({ originUlr: 'https://www.google.com' });

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // args: chromium.args,
      // defaultViewport: { width: 1400, height: 1200 },
      executablePath: isProd ? '/usr/bin/chromium-browser' : await chromium.executablePath,
      // executablePath: await chromium.executablePath,
      // executablePath: await chromium.executablePath,
      // executablePath:
      //   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: true,
      ignoreHTTPSErrors: true

      // channel: 'chrome-beta'
    });
    const page = await browser.newPage();

    await page.goto('https://wcm-lloyds.radical-test.co.uk/');
    // await page.waitFor(500);

    const buffer = await page.pdf({ format: 'a4', printBackground: true });

    await browser.close();

    // res.setHeader('Content-Type', 'application/octet-stream');
    // res.setHeader('Content-Disposition', 'attachment; filename=myfile.pdf');
    // res.end(buffer);

    console.log('DONE');
    res.send(`PDF SIZE: ${buffer.length} bytes`);
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

app.get('/_health', (req, res) => {
  res.sendStatus(200);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
