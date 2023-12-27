import { z } from 'zod'
import { worker } from '../worker'


async function getBody(body: unknown, raw: unknown, request: Request): Promise<ArrayBuffer | string> {
  if (body instanceof ArrayBuffer) {
    return body
  }
  if (typeof body === 'string') {
    return body
  }
  if (typeof raw === 'string') {
    return raw
  }
  return await request.arrayBuffer()
}


worker.route({
  method: 'POST',
  pathname: '/set',
  query: z.strictObject({
    secret: z.string().regex(/[\w.-]{6,}/).max(256),
    key: z.string().max(256)
  })
}, async ({ event, env }) => {
  const { key, secret } = event.query
  const data = await getBody(event.body, event._raw, event.request)

  await env.KV.put(`${secret}/${encodeURIComponent(key)}`, data, { expirationTtl: 8 * 60 * 60 })

  return event.reply.ok()
})
