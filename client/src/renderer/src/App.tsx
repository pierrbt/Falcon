declare const api: {
  send: (message: string) => void
  onClientList: (callback: (clients: string[]) => void) => void
  onMessage: (callback: (message: GetMessage) => void) => void
  onMessages: (callback: (messages: GetMessage[]) => void) => void
  setPseudo: (pseudo: string) => void
  initData: () => void
}

import React, { useState, useEffect } from 'react'
import './assets/main.css'
type GetMessage = { type: 'message'; message: string; sender: string }

function App(): React.ReactNode {
  const [registered, setRegistered] = useState(false)
  const [messages, setMessages] = useState<GetMessage[]>([])
  const [users, setUsers] = useState<string[]>([])

  useEffect(() => {
    api.onClientList((clients) => setUsers(clients))
    api.onMessages((messages) => setMessages(messages))
    api.onMessage((message) => setMessages((messages) => [...messages, message]))

    return (): void => {
      api.onClientList(() => {})
      api.onMessages(() => {})
      api.onMessage(() => {})
    }
  }, [])

  useEffect(() => {
    if (registered) {
      api.initData()
    }
  }, [registered])

  return (
    <div>
      <h1>SuperChat</h1>
      <main>
        <section>
          {registered ? (
            <>
              <ul>
                {messages.map(({ sender, message }) => (
                  <li key={sender + message}>
                    <span>{sender} :</span> {message}
                  </li>
                ))}
              </ul>
              <input
                type="text"
                placeholder="message"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement
                    if (target.value) api.send(target.value)
                    target.value = ''
                  }
                }}
              />
            </>
          ) : (
            <>
              <h2 style={{ marginLeft: '10%' }}>Entrez un pseudo pour commencer</h2>
              <input
                type="text"
                placeholder="Pseudo"
                style={{ width: '80%', borderRadius: '8px', margin: '10px auto' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement
                    if (target.value && target.value !== 'Server') {
                      api.setPseudo(target.value)
                      setRegistered(true)
                    }
                    target.value = ''
                  }
                }}
              />
            </>
          )}
        </section>

        <aside>
          {registered ? (
            <>
              <h2>En ligne</h2>
              {users.length === 0 && <p>Personne n{"'"}est en ligne</p>}
              <ul>
                {users.map((user) => (
                  <li key={user}>🟢&nbsp;{user}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h2>Hors Ligne</h2>
            </>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App
