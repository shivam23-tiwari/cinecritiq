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
  
  // Go to user profile
  await page.goto('http://localhost:3000/user/I1LnEmTqpidk6x1dVCa8XMvr0Gw1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  
  await browser.close();
})();
