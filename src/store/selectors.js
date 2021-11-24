import { get } from 'lodash'
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