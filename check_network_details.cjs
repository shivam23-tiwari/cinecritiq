const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() === 404) {
      console.log('404 URL:', response.url());
    }
  });
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED URL:', request.url(), request.failure()?.errorText);
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
  await browser.close();
})();
