import { get, groupBy, reject, maxBy, minBy } from 'lodash'
import { createSelector } from 'reselect'
// import moment from 'moment'
import { ether_address, ether, tokens, GREEN, RED, formatBalance } from '../helpers'
import moment from 'moment'
const web3 = state => get(state, 'web3.connection')
export const web3Selector = createSelector(web3, web3 => web3)

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e)

const token = state => get(state, 'token.contract')
export const tokenSelector = createSelector(token, data => data)

export const contractsLoadedSelector = createSelector(
  tokenLoaded,
  exchangeLoaded,
  (tl, el) => (tl && el)
)


//all the orders that are cancelled
const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false)
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, loaded => loaded)

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
export const cancelledOrdersSelector = createSelector(cancelledOrders, orders => orders)

//all the orders that are placed whether cancelled or traded
const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false)
// export const allOrdersLoadedSelector = createSelector(allOrdersLoaded, loaded => loaded)

const allOrders = state => get(state, 'exchange.allOrders.data', [])
// export const allOrdersSelector = createSelector(allOrders, orders => orders)

const tradedOrdersLoaded = state => get(state, 'exchange.tradedOrders.loaded', false)
export const tradedOrderLoadedSelector = createSelector(tradedOrdersLoaded, loaded => loaded)


const tradedOrders = state => get(state, 'exchange.tradedOrders.data', [])
export const tradedOrderSelector = createSelector(tradedOrders, orders => {
  //sort in ascending order to compare current token price with previous
  orders = orders.sort((a, b) => b.timestamp - a.timestamp)
  orders = decorateTradedOrders(orders)
  //sort in descending order to view latest order first
  orders = orders.sort((a, b) => b.timestamp - a.timestamp)
  console.log("inside tadedorder-selector", orders)
  return orders
})

const decorateTradedOrders = (orders) => {
  let previousOrder
  return (
    orders.map(order => {
     order =  decorateOrder(order)
     order = tokenPriceChecker(order, previousOrder)
     previousOrder = order
     return order
    //  return order
    })
  )
}

const decorateOrder = (order) => {
  // return order
  //if given amount by  the user is ether in exchange of
  //Dapp token by the user
  let etherAmount
  let tokenAmount
  // console.log("wdkjfqbeirufbh1isdbefbieurfhikeurhfikeurhfkieufhikeuvhieuvieuviu");
  if(order.tokenGive == ether_address){
    // console.log("logging a particular order", order);
    etherAmount = order.amountGive
    tokenAmount = order.amountGet
  }
  //he gets ether in exchnage of Dapp token
  else{
    // console.log("logging a particular order2", order);
    etherAmount = order.amountGet
    tokenAmount = order.amountGive
  }
  const precision = 100000
  let tokenPrice = etherAmount / tokenAmount
  tokenPrice = Math.round(tokenPrice * precision) / precision
  let newTimeStamp = moment.unix(order.timestamp).format('h:mm:ss a M/D')

  //return the update order object
  
  return {
        ...order,
        etherAmount: ether(etherAmount), 
        tokenAmount: tokens(tokenAmount), 
        tokenPrice, 
        formatedTimeStamp: newTimeStamp
      }
}

const tokenPriceChecker = (order, previousOrder) => {
  return({
    ...order,
    tokenPriceClass: tokenPriceCheckerHelper(order.tokenPrice, order.id, previousOrder)

  })
}

const tokenPriceCheckerHelper = (curTokenPrice, id, previousOrder) => {

  //if there is no price previous order
  //and current irder is the first one
  if(!previousOrder){
    return GREEN
  }

  //if current token Price is greater than previous
  if(curTokenPrice >= previousOrder.tokenPrice){
    return GREEN
  }
  //if current token price is lesser than previous
  else{
    return RED
  }
}


const openOrders = state => {
  const all = allOrders(state)
  const traded = tradedOrders(state)
  const cancelled = cancelledOrders(state)

  const openOrders = reject(all, (order) => {
    const orderFilled = traded.some((o) => o.id === order.id)
    const orderCancelled = cancelled.some((o) => o.id === order.id)
    return(orderFilled || orderCancelled)
  })

  return openOrders
}


const orderBookLoaded = state => cancelledOrdersLoaded(state) && tradedOrdersLoaded(state) && allOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)

// Create the order book
export const orderBookSelector = createSelector(
  openOrders,
  (orders) => {
    // Decorate orders
    orders = decorateOrderBookOrders(orders)
    // Group orders by "orderType"
    orders = groupBy(orders, 'orderType')
    // Fetch buy orders
    const buyOrders = get(orders, 'buy', [])
    // Sort buy orders by token price
    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    }
    // Fetch sell orders
    const sellOrders = get(orders, 'sell', [])
    // Sort sell orders by token price
    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    }
    return orders
  }
)

const decorateOrderBookOrders = (orders) => {
  return(
    orders.map((order) => {
      order = decorateOrder(order)
      order = decorateOrderBookOrder(order)
      return(order)
    })
  )
}

const decorateOrderBookOrder = (order) => {
  const orderType = order.tokenGive === ether_address ? 'buy' : 'sell'
  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderFillClass: orderType === 'buy' ? 'sell' : 'buy'
  })
}



//my traded orders

export const myTradedOrdersSelector = createSelector(
  account,
  tradedOrders,
  (account, orders) => {
    orders = orders.filter(order => order.user == account || order.userFill == account)
     //sort the order based on timeStamp
    orders = orders.sort((order1, order2) => order1.timestamp - order2.timestamp)

    //add some useful attributes here
    orders = decorateMyTradedOrders(orders)
    return orders
  }
)




const decorateMyTradedOrders = (orders, account) => {
  return(
    orders.map((order) => {
      order = decorateOrder(order)
      order = decorateMyFilledOrder(order, account)
      return(order)
    })
  )
}

const decorateMyFilledOrder = (order, account) => {
  const myOrder = order.user === account

  let orderType
  if(myOrder) {
    orderType = order.tokenGive === ether_address ? 'buy' : 'sell'
  } else {
    orderType = order.tokenGive === ether_address? 'sell' : 'buy'
  }

  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderSign: (orderType === 'buy' ? '+' : '-')
  })
}

export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)

export const myOpenOrdersSelector = createSelector(
  account,
  openOrders,
  (account, orders) => {
    // Filter orders created by current account
    orders = orders.filter((o) => o.user === account)
    // Decorate orders - add display attributes
    orders = decorateMyOpenOrders(orders)
    // Sort orders by date descending
    orders = orders.sort((a,b) => b.timestamp - a.timestamp)
    return orders
  }
)

const decorateMyOpenOrders = (orders, account) => {
  return(
    orders.map((order) => {
      order = decorateOrder(order)
      order = decorateMyOpenOrder(order, account)
      return(order)
    })
  )
}

const decorateMyOpenOrder = (order, account) => {
  let orderType = order.tokenGive === ether_address ? 'buy' : 'sell'

  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED)
  })
}


export const priceChartLoadedSelector = createSelector(tradedOrdersLoaded, loaded => loaded)
export const priceChartSelector = createSelector(
  tradedOrders,
  (orders) => {
    // Sort orders by date ascending to compare history
    orders = orders.sort((a,b) => a.timestamp - b.timestamp)
    // Decorate orders - add display attributes
    orders = orders.map((o) => decorateOrder(o))
    // Get last 2 order for final price & price change
    let secondLastOrder, lastOrder
    [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
    // get last order price
    const lastPrice = get(lastOrder, 'tokenPrice', 0)
    // get second last order price
    const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

    return({
      lastPrice,
      lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
      series: [{
        data: buildGraphData(orders)
      }]
    })
  }
)
const buildGraphData = (orders) => {
  // Group the orders by hour for the graph
  orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())
  // Get each hour where data exists
  const hours = Object.keys(orders)
  // Build the graph series
  const graphData = hours.map((hour) => {
    // Fetch all the orders from current hour
    const group = orders[hour]
    // Calculate price values - open, high, low, close
    const open = group[0] // first order
    const high = maxBy(group, 'tokenPrice') // high price
    const low = minBy(group, 'tokenPrice') // low price
    const close = group[group.length - 1] // last order

    return({
      x: new Date(hour),
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
    })
  })

  return graphData
}


const orderCancelling = state => get(state, 'exchange.orderCancelling', false)
export const orderCancellingSelector = createSelector(orderCancelling, status => status)

const orderFilling = state => get(state, 'exchange.orderFilling', false)
export const orderFillingSelector = createSelector(orderFilling, status => status)





// BALANCES
const balancesLoading = state => get(state, 'exchange.balancesLoading', true)
export const balancesLoadingSelector = createSelector(balancesLoading, status => status)

const etherBalance = state => get(state, 'web3.balance', 0)
export const etherBalanceSelector = createSelector(
  etherBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const tokenBalance = state => get(state, 'token.balance', 0)
export const tokenBalanceSelector = createSelector(
  tokenBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const exchangeEtherBalance = state => get(state, 'exchange.etherBalance', 0)
export const exchangeEtherBalanceSelector = createSelector(
  exchangeEtherBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const exchangeTokenBalance = state => get(state, 'exchange.tokenBalance', 0)
export const exchangeTokenBalanceSelector = createSelector(
  exchangeTokenBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const etherDepositAmount = state => get(state, 'exchange.etherDepositAmount', null)
export const etherDepositAmountSelector = createSelector(etherDepositAmount, amount => amount)

const etherWithdrawAmount = state => get(state, 'exchange.etherWithdrawAmount', null)
export const etherWithdrawAmountSelector = createSelector(etherWithdrawAmount, amount => amount)

const tokenDepositAmount = state => get(state, 'exchange.tokenDepositAmount', null)
export const tokenDepositAmountSelector = createSelector(tokenDepositAmount, amount => amount)

const tokenWithdrawAmount = state => get(state, 'exchange.tokenWithdrawAmount', null)
export const tokenWithdrawAmountSelector = createSelector(tokenWithdrawAmount, amount => amount)