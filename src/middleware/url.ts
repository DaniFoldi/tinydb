import { middleware } from '@neoaren/comet'


export const mwURL = middleware({
  name: 'URL',
}, ({ event }) => {
  return event.next({
    url: new URL(event.request.url)
  })
})
