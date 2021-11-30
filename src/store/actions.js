// WEB3
export function web3Loaded(connection) {
    return {
      type: 'WEB3_LOADED',
      connection
    }
  }
  
export function web3AccountLoaded(account) {
    return {
      type: 'WEB3_ACCOUNT_LOADED',
      account
    }
  }
  
  // TOKEN
export function tokenLoaded(contract) {
  return {
      type: 'TOKEN_LOADED',
      contract
    }
  }
  
  // EXCHANGE
export function exchangeLoaded(contract) {
  return {
      type: 'EXCHANGE_LOADED',
      contract
    }
  }

  //cancelled orders
export function CancelOrdersLoaded(orders) {
  return {
      type: 'CANCEL_ORDERS_LOADED',
      orders
    }
  }


  //traded ordered

export function TradedOrdersLoaded(orders) {
  return {
      type: 'TRADED_ORDERS_LOADED',
      orders
    }
  }


   //traded ordered

export function AllOrdersLoaded(orders) {
  return {
      type: 'ALL_ORDERS_LOADED',
      orders
    }
  }


// action to dispatch when a order is cancelling

export function orderCancelling() {
  return {
    type: 'ORDER_CANCELLING',
  }
}

export function orderCancelled(order) {
  return {
    type: 'ORDER_CANCELLED',
    order
  }
}