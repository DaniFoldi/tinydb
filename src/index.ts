import { instrument, type ResolveConfigFn } from '@microlabs/otel-cf-workers'
import { name, version } from '../package.json'
import { worker } from './worker'

import './routes'


const handler = <ExportedHandler<Environment>>{
  async fetch(request, env, ctx) {
    return worker.handler(request, env, ctx)
  }
}

const otelConfig: ResolveConfigFn = (env: Environment, _trigger) => {
  return {
    exporter: {
      url: 'https://api.axiom.co/v1/traces',
      headers: {
        'Authorization': `Bearer ${env.AXIOM_INGEST}`,
        'X-Axiom-Dataset': 'tinydb-otel'
      }
    },
    fetch: {
      includeTraceContext(request) {
        return new URL(request.url).hostname === 'tinydb.danifoldi.com'
      }
    },
    handlers: {
      fetch: {
        acceptTraceContext: false
      }
    },
    service: {
      name: name,
      namespace: 'tinydb.danifoldi.com',
      version
    }
  }
}

export default handler // instrument(handler, otelConfig)
