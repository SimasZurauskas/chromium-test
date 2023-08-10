import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
// @ts-ignore
import chromium from 'chromium';
import puppeteer from 'puppeteer';
import encodeQueryParams from './encodeQueryParams';
import crypto from 'crypto';

const dataStore: { [key: string]: { isLloyds: boolean; data: {}; createdAt: Date } } = {};

type Body = {
  isLloyds: boolean;
  data: {};
};

// Express
const app = express();
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.send('ok');
});

app.post('/api/init', async (req, res) => {
  try {
    const body = req.body as Body;

    const { data, isLloyds } = body;

    if (!data) {
      res.status(400).send('Bad request');
    }

    const dataId = crypto.randomBytes(8).toString('hex');

    dataStore[dataId] = { isLloyds, data, createdAt: new Date() };

    console.log(dataStore);

    res.status(200).json({ data: { dataId } });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

app.get('/api/generate/:dataId', async (req, res) => {
  const dataId = req.params.dataId;

  if (!dataId) {
    res.status(400).send('Bad request');
    return;
  }

  const data = dataStore[dataId];

  if (!data) {
    res.status(500).send('Data not found');
    return;
  }

  try {
    const baseUrl = data.isLloyds ? process.env.URL_LLOYDS : process.env.URL_BBOS;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath:
        process.env.NODE_ENV === 'production' ? '/usr/bin/chromium-browser' : await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 800,
        height: 600
      }
    });
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/pdf/${dataId}`);

    await new Promise((resolve) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        resolve(null);
      }, 5000);
    });

    try {
      delete dataStore[dataId];
    } catch (error) {}

    const buffer = await page.pdf({ format: 'a4', printBackground: true });
    await browser.close();
    res.status(200).json({ pdfBuffer: buffer });
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

app.get('/api/pull/:dataId', async (req, res) => {
  const dataId = req.params.dataId;

  if (!dataId) {
    res.status(400).send('Bad request');
    return;
  }

  const data = dataStore[dataId];

  if (!data) {
    res.status(500).send('Data not found');
    return;
  }

  res.status(200).json({ data: data.data });
});

app.post('/api/generate', async (req, res) => {
  try {
    const body = req.body as Body;

    const { data, isLloyds } = body;

    if (!data) {
      res.status(400).send('Bad request');
    }

    console.log(data);
    const stringifiedData = JSON.stringify(data);
    const queryData = encodeQueryParams({ data: stringifiedData });
    const baseUrl = isLloyds ? process.env.URL_LLOYDS : process.env.URL_BBOS;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath:
        process.env.NODE_ENV === 'production' ? '/usr/bin/chromium-browser' : await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/pdf${queryData}`);

    await new Promise((resolve) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        resolve(null);
      }, 3000);
    });

    const buffer = await page.pdf({ format: 'a4', printBackground: true });
    await browser.close();
    res.status(200).json({ pdfBuffer: buffer });
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
  console.log(`Server running on port: ${PORT}`);
});
