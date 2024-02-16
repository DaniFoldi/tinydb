import { z } from 'zod'
import { worker } from '../worker'


worker.route({
  method: 'GET',
  pathname: '/keys',
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

  return event.reply.ok(keys.keys.map(key => decodeURIComponent(key.name.replace(`${secret}/`, ''))).join('\n'))
})
