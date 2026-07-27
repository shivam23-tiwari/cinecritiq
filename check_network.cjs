const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() === 404) {
      console.log('404 URL:', response.url());
    }
  });

  page.on('console', msg => {
    console.log('LOG:', msg.text());
  });

  page.on('pageerror', error => {
    console.log('ERROR:', error.message);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
  
  await browser.close();
})();
