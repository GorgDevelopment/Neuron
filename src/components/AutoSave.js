import { useEffect, useRef } from 'react';

function useAutoSave(content, filePath, saveFunction, delay = 2000) {
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef(content);

  useEffect(() => {
    if (content !== lastSavedRef.current && filePath) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveFunction(filePath, content);
        lastSavedRef.current = content;
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, filePath, saveFunction, delay]);

  return null;
}

export default useAutoSave;
