import indexHtml from '../pages/index.html'
import { worker } from '../worker'


worker.route({
  method: 'GET',
  pathname: '/'
}, async ({ event }) => {
  return event.reply.raw(new Response(indexHtml, { status: 200, headers: { 'content-type': 'text/html' } }))
})
