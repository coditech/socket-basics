const http = require('http')

const server = http.createServer()

const handleRequest = (req, res) => {
  res.end('ok')
}

server.on('request', handleRequest)
server.listen(8888, ()=> console.log(`server is ready`))

const io = require('socket.io')(server);

// const Socket = require('socket.io')
// const io = Socket(server)

// import Socket from 'socket.io'
// const io = Socket(server)

let globalNumber = 0
const messages = []

io.on('connection', (socket) => {
  
  console.log('a user connected')

  socket.on('increment', () => {
    globalNumber++
    io.emit('number:change',globalNumber)
  });

  socket.on('decrement', () => {
    globalNumber--
    io.emit('number:change',globalNumber)
  });

  socket.on('message', ( username, text ) => {
    const message = { username, text }
    messages.push(message) 
    io.emit('message', username, text )
  })

  socket.emit('number:change',globalNumber)
  socket.emit('old messages', messages)
});