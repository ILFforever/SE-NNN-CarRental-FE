import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);
}