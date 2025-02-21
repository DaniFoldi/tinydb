declare module '*.html' {
  const content: string
  export default content
}

declare interface Environment {
  AXIOM_INGEST: string
  KV: KVNamespace
  UNILOG: Service<import('@comment-team/unilog-worker').default>
}
