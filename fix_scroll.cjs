const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const updatedScrollHook = `
  useEffect(() => {
    // Restore window scroll
    const handleScroll = () => {
      sessionStorage.setItem('home_scroll_y', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    let carouselListeners = [];
    
    // Attempt restore
    setTimeout(() => {
      const scrollY = sessionStorage.getItem('home_scroll_y');
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
      }
      
      const carousels = document.querySelectorAll('.overflow-x-auto');
      carousels.forEach((c, i) => {
        const scrollX = sessionStorage.getItem(\`home_carousel_\${i}\`);
        if (scrollX) {
          c.scrollLeft = parseInt(scrollX);
        }
        
        const cScroll = () => {
          sessionStorage.setItem(\`home_carousel_\${i}\`, c.scrollLeft.toString());
        };
        
        c.addEventListener('scroll', cScroll, { passive: true });
        carouselListeners.push({ c, cScroll });
      });
    }, 150);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      carouselListeners.forEach(({ c, cScroll }) => {
        c.removeEventListener('scroll', cScroll);
      });
    };
  }, [trending]);
`;

code = code.replace(/useEffect\(\(\) => \{\n    \/\/ Restore window scroll[\s\S]*?\}, \[trending\]\);/, updatedScrollHook.trim());

fs.writeFileSync('src/pages/Home.tsx', code);
