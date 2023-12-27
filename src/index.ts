import { worker } from './worker'
// eslint-disable-next-line import/order
import './routes'


export default <ExportedHandler<Environment>>{
  async fetch(request, env, ctx) {
    return worker.handler(request, env, ctx)
  }
}
