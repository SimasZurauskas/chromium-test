import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
// @ts-ignore
import chromium from 'chromium';
import puppeteer from 'puppeteer';
import encodeQueryParams from './encodeQueryParams';

type Body = {
  isLloyds: boolean;
  data: {};
};

// Express
const app = express();
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '100mb' }));

app.get('/', (req, res) => {
  res.send('ok');
});

app.post('/api/generate', async (req, res) => {
  try {
    const body = req.body as Body;

    const { data, isLloyds } = body;

    if (!data) {
      res.status(400).send('Bad request');
    }

    // console.log(data);

    const stringifiedData = JSON.stringify(data);
    const queryData = encodeQueryParams({ data: stringifiedData });

    // console.log(queryData);

    // res.sendStatus(200);

    const baseUrl = isLloyds ? process.env.URL_LLOYDS : process.env.URL_BBOS;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1016, height: 800 },
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
      }, 2000);
    });

    const buffer = await page.pdf({ format: 'a4', printBackground: true });

    await browser.close();

    res.status(200).json({ pdfBuffer: buffer });

    // res.setHeader('Content-Type', 'application/octet-stream');
    // res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');
    // res.end(buffer);
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
