import { z } from 'zod'
import { worker } from '../worker'


worker.route({
  method: 'GET',
  pathname: '/list',
  query: z.strictObject({
    secret: z.string().regex(/[\w.-]{6,}/).max(256),
    key: z.string().max(256).default('')
  })
}, async ({ event, env }) => {
  const { key, secret } = event.query

  const keys = await env.KV.list({
    limit: 128,
    prefix: `${secret}/${encodeURIComponent(key)}`
  })
  const data: Record<string, unknown> = {}

  for (const key of keys.keys) {
    data[key.name.replace(`${secret}/`, '')] = await env.KV.get(key.name)
  }

  return event.reply.ok(data)
})
