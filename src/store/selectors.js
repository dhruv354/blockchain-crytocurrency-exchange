import { get, groupBy, reject } from 'lodash'
import { createSelector } from 'reselect'
// import moment from 'moment'
import { ether_address, ether, tokens, GREEN, RED } from '../helpers'
import moment from 'moment'

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e)

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
    orerFillClass: orderType === 'buy' ? 'sell' : 'buy'
  })
}