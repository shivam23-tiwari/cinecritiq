const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.exposeFunction('logError', (msg, stack) => {
    console.log('REACT ERROR CATCH:', msg, stack);
  });

  await page.evaluateOnNewDocument(() => {
    window.addEventListener('error', event => {
      window.logError(event.error ? event.error.message : event.message, event.error ? event.error.stack : '');
    });
    window.addEventListener('unhandledrejection', event => {
      window.logError(event.reason ? event.reason.message : 'Unhandled Promise Rejection', event.reason ? event.reason.stack : '');
    });
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
  await browser.close();
})();
