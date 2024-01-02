import { v4 as uuid } from "uuid"
import {Socket} from "bun";

type SocketInfo = { sessionId: string, name: string }
type Client = Socket<SocketInfo>

type SocketData =
  { type: "message", message: string } |
  { type: "name", name: string } |
  { type: "list" } |
  { type: "client" } |
  undefined;

type SentMessage = { type: "message", message: string, sender: string }
type ListMessage = { type: "list", messages: SentMessage[] }
type ListClients = { type: "client", clients: string[] }

const clients = [] as Client[]
const messages = [] as SentMessage[]

function read(socket: Socket<SocketInfo>, data: Buffer) {
  try {
    const res = data.toString();
    const lines = res.split("\n")
    if(lines.length > 1) {
      lines.toSpliced(1, lines.length - 1).forEach(line => {
        dataHandler(socket, Buffer.from(line))
      });
    }

    return JSON.parse(lines[0]) as SocketData
  }
  catch (error) {
    console.error(`[ERR] : while reading socket data: ${error}`)
    return undefined
  }
}
function connect(socket: Socket<SocketInfo>) {
  socket.data = { sessionId: uuid(), name: "Inconnu" }
  console.log(`[INFO] : ${socket.data.sessionId} connected from ${socket.remoteAddress}:${socket.localPort}`)
}
function disconnect(socket: Socket<SocketInfo>, error?: Error) {
  const index = clients.indexOf(socket)
  if (index !== -1) clients.splice(index, 1)
  if(error) console.error(`[ERR] : ${socket.data.sessionId} disconnected: ${error}`)
  else console.log(`[INFO] : ${socket.data.sessionId} disconnected`)
  broadcastMessage(`${socket.data.name} left the chat`, "Server", true)
  updateClientList()
}
function broadcastMessage(message: string, sender: string, doNotSend?: boolean) {
  if(!doNotSend) messages.push({ type: "message", message, sender })
  for (const client of clients) {
    client.write(JSON.stringify({ type: "message", message, sender }) + "\n")
    client.flush()
  }
}

function updateClientList() {
  const names = clients.map(client => client.data.name)
  for(const client of clients) {
    client.write(JSON.stringify({ type: "client", clients: names }) + "\n")
    client.flush()
  }
}

function dataHandler(socket: Socket<SocketInfo>, data: Buffer) {
  const res = read(socket, data)
  if (!res) return
  switch (res.type) {
    case "message":
      console.log(`[INFO] : ${socket.data.name} sent a message: ${res.message}`)
      broadcastMessage(res.message, socket.data.name)
      break
    case "name":
      socket.data.name = res.name
      clients.push(socket)
      console.log(`[INFO] : ${socket.data.sessionId} is now known as ${res.name}`)
      broadcastMessage(`${res.name} joined the chat`, "Server", true)
      updateClientList()
      break
    case "list": // List messages
      console.log(`[INFO] : ${socket.data.name} requested the list of messages`)
      socket.write(JSON.stringify({ type: "list", messages }) + "\n")
      socket.flush()
      break
    case "client": // List clients
      console.log(`[INFO] : ${socket.data.name} requested the list of clients`)
      socket.write(JSON.stringify({ type: "client", clients: clients.map(client => client.data.name) }) + "\n")
      break
  }
}

const server = Bun.listen<SocketInfo>({
  hostname: "0.0.0.0",
  port: 3000,
  socket: {
    data: dataHandler,
    open: connect,
    close: disconnect,
    error: disconnect,
  }
})

console.log(`[INFO] : Server listening on ${server.hostname}:${server.port}`)