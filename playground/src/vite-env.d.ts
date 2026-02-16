/// <reference types="vite/client" />

declare module '*.sdl?raw' {
  const content: string;
  export default content;
}
