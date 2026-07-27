import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollRestorer() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    let scrollTimeout: any;
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollPositions.current[location.pathname] = window.scrollY;
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (navigationType === 'POP' || navigationType === 'PUSH') {
      const savedPosition = scrollPositions.current[location.pathname] || 0;
      
      // We need to wait a bit for React to render the cached content
      // A small timeout followed by a retry mechanism ensures it scrolls down even if images are loading
      let attempts = 0;
      const restoreScroll = () => {
        if (window.scrollY === savedPosition) return;
        
        window.scrollTo(0, savedPosition);
        attempts++;
        
        // If the page hasn't reached the required height yet, retry up to 5 times (500ms)
        if (window.scrollY < savedPosition && attempts < 10) {
          setTimeout(restoreScroll, 50);
        }
      };
      
      setTimeout(restoreScroll, 10);
    } else {
      // If it's a completely new navigation (not back/forward), scroll to top
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navigationType]);

  return null;
}
