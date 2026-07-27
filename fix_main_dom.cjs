const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

code = `
window.addEventListener('error', (event) => {
  const msg = String(event.error?.message || event.message || "");
  if (!msg.includes('Quota')) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.background = 'red';
    el.style.color = 'white';
    el.style.zIndex = '9999';
    el.style.padding = '20px';
    el.innerText = 'Global Error: ' + msg;
    document.body.appendChild(el);
  }
});
window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event.reason?.message || event.reason || "");
  if (!msg.includes('Quota')) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.top = '40px';
    el.style.left = '0';
    el.style.background = 'orange';
    el.style.color = 'white';
    el.style.zIndex = '9999';
    el.style.padding = '20px';
    el.innerText = 'Global Promise Rejection: ' + msg;
    document.body.appendChild(el);
  }
});
` + code;

fs.writeFileSync('src/main.tsx', code);
