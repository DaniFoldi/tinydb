import { middleware } from '@neoaren/comet'


export const mwURL = middleware(({ event }) => {
  return event.next({
    url: new URL(event.request.url)
  })
})
