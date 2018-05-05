import {render} from 'react-dom';
import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';

class Bidder extends Component {
  constructor(props) {
    super(props);
    this.state ={
      price: 0
    };
  }

  increment() {
    let price = this.state.price;
    this.setState({price: price+1});
  }

  decrement() {
    let price = this.state.price;
    price = Math.max(price-1,0);
    this.setState({price: price});
  }

  render() {
    return (<div className="bidder">
      <div className="button button-increment" onClick={this.increment.bind(this)}>+</div>
      <h2>{this.state.price.toLocaleString("en-US", {style: "currency", currency: "USD"})}</h2>
      <div className="button button-decrement" onClick={this.decrement.bind(this)}>-</div>
      <h3 className="button buy-button">{this.props.name}</h3>
    </div>);
  }
}

class Trader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shares: 100,
      price: 1248
    }
  }

  render() {
    let data = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [{
        label: "Phosphate Price",
        borderColor: "#42b642",
        data: [65, 59, 80, 81, 56, 55, 40]
      }]
    };

    return (<div>
      <Line data={data} />
      <div className="trader-trading">
        <div>
          <div className="trader-section">
            <h3 className="trader-shares-title">Current price</h3>
            <h2 className="trader-shares">{(this.state.price/100).toLocaleString("en-US", {style: "currency", currency: "USD"})}</h2>
          </div>
          <div className="trader-section">
            <h3 className="trader-shares-title">Your shares</h3>
            <h2 className="trader-shares">{this.state.shares}</h2>
          </div>
          <div className="trader-section">
            <h3 className="trader-shares-title">Market value</h3>
            <h2 className="trader-shares">{((this.state.shares * this.state.price)/100).toLocaleString("en-US", {style: "currency", currency: "USD"})}</h2>
          </div>
        </div>
        <Bidder name="Sell" />
        <Bidder name="Buy" />
      </div>
    </div>);
  }
}

render(<Trader />, document.getElementById('trader-main'));
