const http = require('http')
const catNames = require('cat-names');
const server = http.createServer()


const handleRequest = (req, res) => {
  res.end('ok!')
}

server.on('request', handleRequest)
server.listen(8888, ()=> console.log(`server is ready`))


let globalNumber = 0

const io = require('socket.io')(server);

io.on('connection', (socket) => {

  const username = catNames.random()

  console.log('a user connected')
  
  io.emit('user:new',username)
  socket.emit('user:me',username)
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
	
  socket.on('increment', () => {
    globalNumber++
    io.emit('number:change',globalNumber)
    console.log('number has changed:',globalNumber)
  });

  socket.on('decrement', () => {
    globalNumber--
    io.emit('number:change',globalNumber)
    console.log('number has changed:',globalNumber)
  });

  socket.emit('number:change',globalNumber)

});
