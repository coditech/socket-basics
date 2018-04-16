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
    - express, which will help us answer http requests (e.g, `http://localhost:3000/some-path`)
    - socket.io, which will help us open permanent connections with browsers
    - nodemon, which will restart our server everytime we save

When we will want to run our app, we will need to run *both* the front-end webpack server and the back end express server

let's prepare a script to do that:

 1. in `project/`, run `npm init`
 2. then run `npm install --save npm-run-all`
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
