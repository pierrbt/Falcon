import { contextBridge } from 'electron'
import net from 'node:net'

type GetMessage = { type: 'message'; message: string; sender: string }
type ListMessage = { type: 'list'; messages: GetMessage[] }
type ListClients = { type: 'client'; clients: string[] }
type SocketData = ListClients | ListMessage | GetMessage | undefined

const clients: string[] = []
const messages: GetMessage[] = []

function read(data: Buffer): SocketData {
  try {
    const res = data.toString()
    const lines = res.split('\n').filter((line) => line)
    if (lines.length > 1) {
      for (const line of lines.toSpliced(0, 1)) {
        client.emit('data', Buffer.from(line))
      }
    }
    return JSON.parse(lines[0]) as SocketData
  } catch (error) {
    console.error(`[ERR] : while reading socket data: ${error}`)
    return undefined
  }
}

const client = net.createConnection(3000, '[::1]')

let clientListCallback: (clients: string[]) => void = (): void => {
  console.log('clientListCallback not set')
}
let messageCallback: (message: GetMessage) => void = (): void => {
  console.log('messageCallback not set')
}
let messagesCallback: (messages: GetMessage[]) => void = (): void => {
  console.log('messagesCallback not set')
}

client.on('data', async (data) => {
  const res = read(data)
  if (!res) return
  switch (res.type) {
    case 'client':
      clients.splice(0, clients.length, ...res.clients)
      clientListCallback(clients)
      break
    case 'list':
      messages.splice(0, messages.length, ...res.messages)
      messagesCallback(messages)
      break
    case 'message':
      messages.push(res)
      messageCallback(res)

      break
  }
})

contextBridge.exposeInMainWorld('api', {
  send: (message: string) => {
    client.write(JSON.stringify({ type: 'message', message }))
  },
  initData: () => {
    client.write(JSON.stringify({ type: 'list' }))
    client.write(JSON.stringify({ type: 'client' }))
  },
  onClientList: (callback: (clients: string[]) => void) => {
    clientListCallback = callback
  },
  onMessage: (callback: (message: GetMessage) => void) => {
    messageCallback = callback
  },
  onMessages: (callback: (messages: GetMessage[]) => void) => {
    messagesCallback = callback
  },
  setPseudo: (name: string) => {
    client.write(JSON.stringify({ type: 'name', name }))
  }
})
