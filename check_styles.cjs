const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
  const bg = await page.evaluate(() => {
    const el = document.querySelector('div.bg-\\[\\#050505\\]');
    if (el) return window.getComputedStyle(el).backgroundColor;
    return 'not found';
  });
  console.log('Background color:', bg);
  await browser.close();
})();
