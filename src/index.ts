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
import encodeQueryParams from './encodeQueryParams';

const isProd = process.env.NODE_ENV === 'production';

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
    // const buffer = await generatePDF({ originUlr: 'https://www.google.com' });

    const body = req.body as Body;

    if (!body) {
      res.status(400).send('bad request');
    }

    const { data, isLloyds } = body;

    // console.log(data);

    const stringifiedData = JSON.stringify(data);
    const queryData = encodeQueryParams({ data: stringifiedData });

    // console.log(queryData);

    // res.sendStatus(200);

    const baseUrl = isLloyds ? 'https://wcm-lloyds.radical-test.co.uk' : 'https://wcm-bos.radical-test.co.uk';

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: isProd ? '/usr/bin/chromium-browser' : await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();

    await page.goto(`${baseUrl}/pdf${queryData}`);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const buffer = await page.pdf({ format: 'a4', printBackground: true });

    await browser.close();

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');
    res.end(buffer);

    // console.log('DONE');
    // res.send(`PDF SIZE: ${buffer.length} bytes`);
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
