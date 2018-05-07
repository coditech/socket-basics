## 1 - Preparing

In order to test our react app connected to a server, we need to run **two** servers:

- the first is our actual server, and takes care of answering requests
- the second is a server that we use only to refresh our react app every time we change something. This second server *is not useful* in production, but it is useful as long as we're developing.

Luckily, we don't have to invent the second one; `create-react-app` does it for us.

So:

 1. create a directory for the project (`> mkdir project`) and enter it (`> cd project`)
 2. use create-react-app to create a front end application (e.g. `> create-react-app --use-npm front`)
 3. create a new server project:
	- create the directory (e.g. `> mkdir back` and `> cd back`)
	- run `npm init`
	- install the necessary stuff: `npm install --save express socket.io nodemon`
	- create a new file `index.js` to store our server
 4. you should have the following structure:
```
project
│
├── back
│   ├── node_modules
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
└── front
    ├── node_modules
    ├── package.json
    ├── public
    ├── README.md
    ├── src
    │   │
    │   └── ... a few files
    └── package-lock.json

```

### Prepare the server

 1. in `back/package.json`, locate the `scripts` area. It should look like this:
```json
{
 ...
 "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  ...
}
```

add a script to run `nodemon`:
```json
{
 ...
 "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon index.js"
  },
  ...
}
```

this will allow us to run `npm start` to start the project

2. in `back/index.js`, create a very simple server:
```js
const http = require('http')

const server = http.createServer()

const handleRequest = (req, res) => {
  res.end('ok')
}

server.on('request', handleRequest)
server.listen(8888, ()=> console.log(`server is ready`))

```

We are using the port `8888` because the port `3000` will be used by `create-react-app`

Let's try it:
```bash
> npm start
```
then go to [http://localhost:8888/](http://localhost:8888/). If everything works correctly, you should see "ok".

Then, edit `index.js` and change the `"ok"` to `"ok!"`. Save; nodemon should restart the server automatically. Go to `http://locahost:8888` again, and verify the text has changed.


### What did we just install?

 1. in `front`, we installed:
    - React, to write dynamic front-end applications using HTML instead of javascript (JSX)
    - Webpack, which recompiles our files everytime we save a file
    - Webpack server, which runs our front-end and restarts it everytime we save a file 
 2. in `back`, we installed:
    - express, which will help us answer http requests (e.g, `http://localhost:3000/some-path`). We will not really use it in this exercise.
    - socket.io, which will help us open permanent connections with browsers
    - nodemon, which will restart our server everytime we save

When we will want to run our app, we will need to run *both* the front-end webpack server and the back end express server

let's prepare a script to do that:

 1. in `project/`, run `npm init`
 2. then run `npm install --save concurrently`
 3. open `package.json`, locate the `scripts` objects, and add:
```json
{
  ...
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "server": "cd back && npm start",
    "client": "cd front && npm start",
    "start": "concurrently --kill-others-on-fail --names \"server client\" \"npm run server\" \"npm run client\""
  },
 ...

}
```

Now, running `npm run server` will run the server; `npm run client` will run create-react-app. And `npm start` will run both

### Wrapping it up

 1. in the main directory ("project"), run `git init`
 2. in the main directory, create a file `.gitignore`, and write in it: `**/*node_modules`. This instructs git to not look for what is in this folder
 3. try it: run `git add -A -n` to test what files would be added. It should be the files above. If you see a lot of files from node_modules, you're doing something wrong
 4. if everything is ok, run `git add -A` to actually add the files. Then run `git commit -m "first commit"`. 
 5. congrats! you're ready to go


### What other alternatives do we have?

1. use Razzle. Razzle comes pre-packaged with a server and a client and everything just works with one command. However, Razzle doesn't play nice with socket.io, so it would be a bother to use in this example
2. use this repo :) but I prefer you do the work


## - Simple Server Testing

### Prepare the server:

in `back/index.js`, set up a super-simple socket server. Add to the bottom of the file:

```js
const io = require('socket.io')(server);

let globalNumber = 0

io.on('connection', (socket) => {
  
  console.log('a user connected')
	
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
	
  socket.on('increment', () => {
    globalNumber++
    io.emit('number:change',globalNumber)
  });

  socket.on('decrement', () => {
    globalNumber--
    io.emit('number:change',globalNumber)
  });

  socket.emit('number:change',globalNumber)

});
```

### Prepare the client:
 In order for the client (browser) to communicate with the server, we're going to need to install socket.io in the client too. So, go to `/front`, and run:`npm install --save socket.io-client`
 then, import it in `front/src/App.js`

add:
 - `import io from 'socket.io-client'` towards the top of the file
 - in the `App` class, add:
```js
class App extends Component{

  state = { socket:null, globalNumber:0 }

  componentDidMount(){
    const socket = io('http://localhost:8888');

    this.setState({socket})

    socket.on('number:change', (globalNumber) => {
	this.setState({globalNumber})
    })

  }

  onIncrement = () => this.state.socket.emit('increment')
  onDecrement = () => this.state.socket.emit('decrement')
  render(){
	// do something here to show the globalNumber and use increment and decrement
  }
}
```

### Done for part 1

At this state, you have a working server, a working client, and they communicate together

** don't forget to commit **
 
This would be a good moment to create a repository on github and backup your code

# Part 02 - The App

Let's make it so peeps can connect and write some text together.

Here are the specifications of the app:

1 - when a user connects, all users should be notified.
2 - when a user sends a text, all users should receive the letter
3 - the text should know who sent it.

BONUS: allow user to set a username for themselves

## 1 - User Connects

So, let's think a bit. We need to design our API.

When a user connects, he needs to send a signal to the server. We know this signal is already prepared in Socket.io, it's called 'connect'. You remember this part?

```js
// back/index.js

const io = require('socket.io')(server);

io.on('connection', (socket) => {
    // user has connected 
}
```

Good. But we don't have a way to tell other users that a user has connected.

Let's fix that. We need to re-send this signal to our users. We could just call it something simple like `"connection"`, but it might be confusing to use something that is native to Socket.io. Let's call this `user:new`. This is a nice format, because this way, we can later use `user:nickname` for when the user changes their nickname, `user:quit` for when they quit, and so on.

*important*: this is just "a" way of writing those. It can be absolutely anything. If you decide to use

```js
socket.emit('user has connected yeaaaah')
```

No one is going to stop you (actually, I will stop you). But it's better to be organized.

So, when a user connects, you need to `emit` that he has connected.

Add this inside the `io.on('connection')` block:

```js
// back/index.js
// ...
io.on('connection', (socket) => {

  console.log('a user connected')
    io.emit('user:new')
    // ...
```

Very good, now the server emits to all users that a new user has entered.

However, we aren't listening on the user side, so nothing will happen. Let's fix that.

```js
// front/src/App.js
  //...
  componentDidMount(){
    const socket = io('http://localhost:8888');

    this.setState({socket})

    socket.on('number:change', (globalNumber) => {
      this.setState({globalNumber})
    })

    socket.on('user:new', ()=>{
      console.log('a user has connected')
    })
  // ...
```

Now, run the whole app and open your console. Open a second window, you should see "a user has connected"

**What Happened?**: 

1. A user connects. He sends the native Socket.io `connection` signal to the server
2. The server receives the signal (`on('connection')`)
3. The server sends sends to all users a signal we called `user:new`
4. Every connected user receives `user:new`
5. Every user uses console.log to write `a user has connected` to the console. 

Now let's give a number, or name, to that user.

First, install the [cat-names](https://github.com/sindresorhus/cat-names) library:

```sh
npm install --save cat-names
```

Then, in the server's index.js, put somewhere at the top:

```js
// back/index.js
const catNames = require('cat-names');
```

and, below, where users connect:

```js
// back/index.js
//...
io.on('connection', (socket) => {

  const username = catNames.random()
//...
```

Send the username to all the users with the signal: change `io.emit('user:new')` to `io.emit('user:new',username)`.

Now, when a user connects, the server chooses a random cat name for him/her, and sends it to everyone.
But, and this is important, the user themselves doesn't know their own name. So let's invent a new signal, called `user:me`, to send the user info:

```js
// back/index.js
io.emit('user:new',username)
socket.emit('user:me',username) 
```

Finally, catch those on the client:

```js
// front/src/App.js
//...
    socket.on('user:new', (username)=>{
      console.log('a user called '+username+' has connected')
    })

    socket.on('user:me', (username)=>{
      this.setState({username})
    })
//...
```

Don't forget to show this somewhere in the `render` function, or else nothing will show 

**What is happening?**:
1. The user connects and sends a "connect" signal
2. The server receives the signal and chooses a random cat name
3. The server sends to every users the new name
4. Every user receives the signal that a new user has connected, and their name  
5. The server sends to the user themselves their own name
6. The user receives their own name and sets in `state`

Notice: on the *server*, there are TWO object that can `emit`:

- `io.emit(message)` sends a message to ALL users
- `socket.emit(message)` sends a message to the CONNECTED user

On the client, there's only `socket.emit(message)`, which sends a message to the server.

Congrats! Now users can connect and acquire a user name!

*important*: Lastly, put the socket in the state so we can use it elsewhere in our Component:

`this.setState({socket:socket})`

Now, let's create the chat proper:

## 2 - Chat Box - Preparing

1 - in the React App, create a div to store the text
2 - in the Ract App, create a form, put inside the text input, and a button
3 - when the form is submit:
  - acquire the value of the text box
  - display it in console.log
  - emit a `text` message (`this.state.socket.emit('text',theTextToSend)`). 
4 - put a listener for when a message is received (`socket.on('text',(text)=>{ console.log(text) })`)
5 - on the server, when a text is received, re-emit it for everyone
6 - Try it. Does it work? Do you see the message in your console? If yes, great!Add it to an array in the state, and display it in `render`

...You almost have a chat.

Now, make it so the username is sent with the message

