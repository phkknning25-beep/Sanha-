/// <reference types="vite/client" />

declare module 'vite/client' {
  interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}