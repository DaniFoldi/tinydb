import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'


describe('worker', () => {
  let worker: UnstableDevWorker

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true }
    })
  })

  afterAll(async () => {
    await worker.stop()
  })

  it('returns html', async () => {
    const response = await worker.fetch('/')
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/html')
    await expect(response.text()).resolves.toContain('TinyDB')
  })

  it('stores and retrieves a key with the same secret', async () => {
    const store = await worker.fetch('/set?secret=secret&key=key', {
      method: 'POST',
      body: 'value'
    })
    expect(store.status).toBe(200)
    const retrieve = await worker.fetch('/get?secret=secret&key=key')
    expect(retrieve.status).toBe(200)
    await expect(retrieve.text()).resolves.toBe('value')
  })

  it('stores the same key with a different secret separately', async () => {
    const store1 = await worker.fetch('/set?secret=111111&key=key', {
      method: 'POST',
      body: 'value1'
    })
    expect(store1.status).toBe(200)
    const store2 = await worker.fetch('/set?secret=222222&key=key', {
      method: 'POST',
      body: 'value2'
    })
    expect(store2.status).toBe(200)
    const retrieve1 = await worker.fetch('/get?secret=111111&key=key')
    expect(retrieve1.status).toBe(200)
    await expect(retrieve1.text()).resolves.toBe('value1')
    const retrieve2 = await worker.fetch('/get?secret=222222&key=key')
    expect(retrieve2.status).toBe(200)
    await expect(retrieve2.text()).resolves.toBe('value2')
  })

  it('lists keys with a given prefix', async () => {
    const store1 = await worker.fetch('/set?secret=secret&key=test1', {
      method: 'POST',
      body: 'value1'
    })
    expect(store1.status).toBe(200)
    const store2 = await worker.fetch('/set?secret=secret&key=test2', {
      method: 'POST',
      body: 'value2'
    })
    expect(store2.status).toBe(200)
    const list = await worker.fetch('/list?secret=secret&key=test')
    const data = await list.text()
    expect(data).toMatchInlineSnapshot(`"{"test1":"value1","test2":"value2"}"`)
  })
})
