import React, { Component } from 'react';
import io from 'socket.io-client'
import './App.css';

class App extends Component {
  state = {
    socket:null,
    globalNumber:0,
    texts:[
      { username:'computer', text:'welcome to my chat' }
    ]
  }
  componentDidMount(){
    
    const socket = io('http://192.168.1.121:8888');

    this.setState({socket})

    socket.on('number:change',( globalNumber )=>{
      this.setState({ globalNumber })
    })

    socket.on('message', ( username, text ) => {
      const message = { username, text }
      const texts = [...this.state.texts, message]
      this.setState({texts})
    })

    socket.on('old messages', (messages) => {
      const texts = [ ...this.state.texts, ...messages]
      this.setState({texts})
    })
  }
  increment = () => {
    this.state.socket.emit('increment')
  }
  decrement = () => {
    this.state.socket.emit('decrement')
  }
  onSubmit = (event) =>{
    // stops the form from refreshing the page
    event.preventDefault();
    // extract the text input from the form 
    const input = event.target.text
    // extract the value from the text input
    const text = input.value
    // if there's no value, do nothing
    if(!text){ return; }
    // empty the text input
    input.value = '';
    // extract the username from the username input
    const username = event.target.username.value
    this.state.socket.emit('message',username,text)
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">
            <button onClick={this.decrement}>-</button>
            { this.state.globalNumber }
            <button onClick={this.increment}>+</button>
          </h1>
          <form onSubmit={this.onSubmit}>
            <input name="username" defaultValue="batata"/>
            <input name="text"/>
            <button>ok</button>
          </form>
        </header>
        <div style={{width:'100%',height:500}}>
          { this.state.texts.map( 
            (message) => 
              <div>
                <p>
                <strong>{message.username}</strong>:
                {message.text}
                </p>
              </div>)
          }
        </div>
      </div>
    );
  }
}

export default App;
