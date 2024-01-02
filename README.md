# Falcon Chat Application

## Table of Contents

- [Introduction](#introduction)
- [Technologies](#technologies)
- [Architecture](#architecture)
    - [Client](#client)
    - [Server](#server)
- [Setup](#setup)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Falcon is a real-time chat application built with Electron, React, and TypeScript. The application allows users to send and receive messages in real-time. The project is divided into two main parts: the client and the server.

## Technologies

The following technologies were used in this project:

- **Electron**: A framework for creating native applications with web technologies like JavaScript, HTML, and CSS.
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Bun**: A fast all-in-one JavaScript runtime, also used for TcpServer.
- **uuid**: A library to generate RFC4122 UUIDs.
- **net**: A module providing an asynchronous network API for creating TcpSockets on the client

## Architecture

### Client

The client side of the application is built with Electron and React. Electron allows us to build a desktop application with web technologies, while React is used for building the user interface.

The client application is structured as follows:

- `main.tsx`: This is the entry point of the application. It renders the main `App` component.
- `App.tsx`: This is the main component of the application. It handles the application state and renders the user interface.
- `preload/index.ts`: This file is responsible for setting up the IPC communication between the main process and the renderer process.

The client uses the `contextBridge` module from Electron to send and receive messages from the server. The `net` module is used to create a socket connection to the server.

### Server

The server side of the application is built only with Bun. It is responsible for handling incoming connections and messages from clients.

The server application is structured as follows:

- `index.ts`: This is the entry point of the server. It sets up the server and handles incoming connections and messages.

The server uses the `Bun TCP API ` module from Bun to create a TCP server. It uses the `uuid` library to generate unique session IDs for each client.

## Setup

To set up the project on your local machine, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the `client` directory and run `pnpm install` to install the client dependencies.
3. Navigate to the `server` directory and run `bun install` to install the server dependencies.
4. To start the client, navigate to the `client` directory and run `pnpm dev`.
5. To start the server, navigate to the `server` directory and run `bun run index.ts`.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is open source and available under the [MIT License](LICENSE).

---

Created by [pierrbt](https://github.com/pierrbt)