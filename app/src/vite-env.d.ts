/// <reference types="vite/client" />

declare module "cytoscape-cose-bilkent" {
  import cytoscape from "cytoscape";
  const coseBilkent: cytoscape.Ext;
  export = coseBilkent;
}

declare module "cytoscape-klay" {
  import cytoscape from "cytoscape";
  const klay: cytoscape.Ext;
  export = klay;
}

interface ImportMetaEnv {
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
