'use client';

import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  // This is a temporary fix for `beforeUnload` because router.events do not exist in NextJS v13
  useEffect(() => {
    const handleAnchorClick = (e: any) => {
      const targetUrl = e.currentTarget.href,
        currentUrl = window.location.href;
      if (targetUrl !== currentUrl) {
        if (window.onbeforeunload) {
          const res = window.onbeforeunload(e);
          if (!res) e.preventDefault();
        }
      }
    };

    const handleMutation = () => {
      const anchorElements = document.querySelectorAll('a[href]');
      anchorElements.forEach((anchor) => anchor.addEventListener('click', handleAnchorClick));
    };

    const mutationObserver = new MutationObserver(handleMutation);
    mutationObserver.observe(document, { childList: true, subtree: true });
  }, []);

  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
