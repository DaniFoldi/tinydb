import { z } from 'zod'
import { worker } from '../worker'


worker.route({
  method: 'GET',
  pathname: '/get',
  query: z.strictObject({
    secret: z.string().regex(/[\w.-]{6,}/).max(256),
    key: z.string().max(256)
  })
}, async ({ event, env }) => {
  const { key, secret } = event.query

  const value = await env.KV.get(`${secret}/${encodeURIComponent(key)}`)
  return event.reply.raw(new Response(value, { status: 200 }))
})
