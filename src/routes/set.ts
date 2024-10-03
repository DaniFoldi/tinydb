import { z } from 'zod'
import { worker } from '../worker'


async function getBody(body: unknown, raw: unknown, request: Request): Promise<string | ArrayBuffer> {
  if (raw === null && body === null) {
    return ''
  }

  if (typeof raw === 'string') {
    return raw
  }

  if (typeof body === 'string') {
    return body
  }

  console.log(typeof raw, typeof body, raw, body, request.headers.get('content-type'))

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
  try {
    const { key, secret } = event.query
    const data = await getBody(event.body, event._raw, event.request)

    await env.KV.put(`${secret}/${encodeURIComponent(key)}`, data, { expirationTtl: 8 * 60 * 60 })
  } catch (error) {
    console.error(error)
  }

  return event.reply.ok()
})
