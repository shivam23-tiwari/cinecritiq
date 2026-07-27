import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
       console.log('ERROR:', msg.text());
    } else {
       console.log('BROWSER:', msg.text());
    }
  });
  
  await page.goto('http://localhost:3000/movie/123', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
