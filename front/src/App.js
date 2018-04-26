import React, { Component } from 'react';
import logo from './logo.svg';
import io from 'socket.io-client';
import './App.css';


class App extends Component {

  state = { socket:null, globalNumber:0, username:'' }

  componentDidMount(){
    const socket = io('http://localhost:8888');

    this.setState({socket})

    socket.on('number:change', (globalNumber) => {
      this.setState({globalNumber})
    })

    socket.on('user:new', (username)=>{
      console.log('a user called '+username+' has connected')
    })

    socket.on('user:me', (username)=>{
      this.setState({username})
    })

  }

  onIncrement = () => this.state.socket.emit('increment')

  onDecrement = () => this.state.socket.emit('decrement')

  render(){
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
	      <h1>{this.state.globalNumber}</h1>
        <p className="App-intro">
          username:{ this.state.username }
          <button onClick={this.onIncrement}>+</button>
          <button onClick={this.onDecrement}>-</button>
        </p>
      </div>
    );
  }
}

export default App;
