import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Analytics() {
  const location = useLocation();

  useEffect(() => {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_path: location.pathname + location.search,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    } catch (error) {
      // Silently ignore tracking failures
    }
  }, [location.pathname, location.search]);

  return null;
}

export default Analytics;
