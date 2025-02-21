import { instrumentWorker } from '@comment-team/libworker-lib/opentelemetry'
import { withUnilog } from '@comment-team/unilog-worker'
import { name, version } from '../package.json'
import { worker } from './worker'

import './routes'
import { WorkerEntrypoint } from 'cloudflare:workers'


const handler = <ExportedHandler<Environment>>{
  async fetch(request, env, ctx) {
    return worker.handler(request, env, ctx)
  }
}

class HandlerRpc extends WorkerEntrypoint<Environment> {
  override async fetch(request: Request) {
    return worker.handler(request, this.env, this.ctx)
  }
}

const otelConfig = (env: Environment) => {
  return {
    exporter: {
      url: 'https://api.axiom.co/v1/traces',
      headers: {
        'Authorization': `Bearer ${env.AXIOM_INGEST}`,
        'X-Axiom-Dataset': 'tinydb-otel'
      }
    },
    service: {
      name,
      namespace: 'tinydb',
      version
    }
  }
}

export default withUnilog(instrumentWorker(handler, otelConfig), {
  serviceEnvironment: {
    'tinydb': 'production'
  }
})

export const Test = withUnilog(HandlerRpc, {
  serviceEnvironment: {
    'tinydb': 'production'
  }
})
