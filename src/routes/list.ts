import { PromiseQueue } from 'flareutils'
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
  const queue = new PromiseQueue()
  const data: Record<string, unknown> = {}
  for (const key of keys.keys) {
    await queue.add(env.KV.get(key.name).then(value => data[key.name.replace(`${secret}/`, '')] = value))
  }
  await queue.flush()
  return event.reply.ok(data)
})
