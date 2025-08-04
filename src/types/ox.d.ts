// Type declaration to fix ox library compatibility issue
declare module 'ox/core/Authorization' {
  export function from(params: any): any;
}

declare module 'ox' {
  export * from 'ox/core/Authorization';
}