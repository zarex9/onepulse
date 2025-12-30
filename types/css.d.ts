declare module "*.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.scss" {
  const content: { readonly [key: string]: string };
  export default content;
}

declare module "@coinbase/onchainkit/styles.css" {
  const content: never;
  export default content;
}
