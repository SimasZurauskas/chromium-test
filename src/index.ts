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

const generatePDF = async ({ originUlr }: any) => {
  // const pahas = await chromium.executablePath;

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // args: chromium.args,
    // defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    // executablePath:
    //   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    ignoreHTTPSErrors: true

    // channel: 'chrome-beta'
  });
  const page = await browser.newPage();

  await page.goto(`${originUlr}`);
  // await page.waitFor(500);

  const pdf = await page.pdf({ format: 'a4', printBackground: false });

  await browser.close();
  return pdf;
};

// Express
const app = express();
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '100mb' }));

app.get('/', (req, res) => {
  res.send('OK');
});

app.get('/pdf', async (req, res) => {
  const buffer = await generatePDF({ originUlr: 'https://www.google.com' });

  console.log('DONE');
  res.send(`PDF SIZE: ${buffer.length} bytes`);
});

// TODO should be /_health
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
