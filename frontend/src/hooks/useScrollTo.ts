import { useCallback } from 'react';

export const useScrollTo = () => {
  const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior
    });
  }, []);

  const scrollToElement = useCallback((elementId: string, behavior: ScrollBehavior = 'smooth') => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior,
        block: 'start'
      });
    }
  }, []);

  const scrollToPosition = useCallback((top: number, behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({
      top,
      left: 0,
      behavior
    });
  }, []);

  return {
    scrollToTop,
    scrollToElement,
    scrollToPosition
  };
};

export default useScrollTo;