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
