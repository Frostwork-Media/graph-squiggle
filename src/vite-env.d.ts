/// <reference types="vite/client" />

declare module "cytoscape-klay" {
  const klay: any;
  export default klay;
}

interface ImportMetaEnv {
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
