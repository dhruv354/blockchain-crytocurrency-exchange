import React, { Component } from 'react'
import { connect } from 'react-redux'
import { accountSelector, tradedOrderLoadedSelector, tradedOrderSelector } from '../store/selectors'
import Spinner from './Spinner'


const showTradedOrders = (tradedOrders) => {
  return (
    <tbody>
      {tradedOrders.map(order => {
        return(
          <tr className={`order-${order.id}`} key={order.id}>
            <td className='text-muted token-amount'>{order.formatedTimeStamp}</td>
            <td className='token-amount'> {order.tokenAmount}</td>
            <td className={`text-${order.tokenPriceClass}  token-amount`}>{order.tokenPrice}</td>
          </tr>
        )
      })}
    </tbody>
  )
}

class Trades extends Component {
  render() {
    return (
      <div className="vertical">
      <div className="card bg-dark text-white">
        <div className="card-header">
          Trades
        </div>
        <div className="card-body">
          <table className="table table-dark table-sm small">
            <thead>
              <tr>
                <th>Time</th>
                <th>DAPP</th>
                <th>DAPP/ETH</th>
              </tr>
            </thead>
            { this.props.tradedOrderLoaded ? showTradedOrders(this.props.tradedOrders) : <Spinner type="table" />}
          </table>
        </div>
      </div>
    </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    tradedOrderLoaded: tradedOrderLoadedSelector(state),
    tradedOrders: tradedOrderSelector(state)
  }
}

export default connect(mapStateToProps)(Trades) 