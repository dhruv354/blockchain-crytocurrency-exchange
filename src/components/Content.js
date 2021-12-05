import React, { Component } from 'react'
import { connect } from 'react-redux'
// import { accountSelector } from '../store/selectors'
import { LoadAllOrders, subscribeToEvents } from '../store/interactions';
import exchange from '../abis/Exchange'
import { exchangeSelector } from '../store/selectors';
import Trades from './Trades';
import OrderBook from './OrderBook';
import MyTransactions from './MyTransactions';
import PriceChart from './PriceChart';
import Balance from './Balance';
import NewOrder from './NewOrder';
// exchangeSelector

class Content extends Component {

  componentWillMount(){
    this.loadBlockchainContractData(this.props.dispatch)
  }

  async loadBlockchainContractData(dispatch){

    await LoadAllOrders(this.props.exchange, dispatch)
    await subscribeToEvents(this.props.exchange, dispatch)
  }

  render() {
    // console.log(LoadAllOrders());
    return (
        <div className="content">
        <div className="vertical-split">
         <Balance />
         <NewOrder />
        </div>
        <OrderBook />
        <div className="vertical-split">
          <PriceChart />
          <MyTransactions /> 
        </div>
        <Trades />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    exchange: exchangeSelector(state)
  }
}

export default connect(mapStateToProps)(Content) 
// export default Content