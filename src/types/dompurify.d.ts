declare module 'dompurify' {
  interface DOMPurifyI {
    sanitize: (dirty: string, options?: any) => string;
  }
  
  const DOMPurify: DOMPurifyI;
  export default DOMPurify;
} 