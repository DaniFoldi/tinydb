import { server } from '@neoaren/comet'
import { mwURL } from './middleware/url'


export const worker = server({
  before: [ mwURL ]
})
