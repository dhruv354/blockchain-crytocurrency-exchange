import Web3 from 'web3'
import {
  web3Loaded,
  web3AccountLoaded,
  tokenLoaded,
  exchangeLoaded,
  CancelOrdersLoaded,
  TradedOrdersLoaded,
  AllOrdersLoaded,
  orderCancelling, 
  orderCancelled,
  orderFilling,
  orderFilled
} from './actions' 
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'
import { orderFillingSelector } from './selectors'

export const loadWeb3 = async (dispatch) => {
  if(typeof window.ethereum!=='undefined'){
    const web3 = new Web3(window.ethereum)
    dispatch(web3Loaded(web3))
    return web3
  } else {
    window.alert('Please install MetaMask')
    window.location.assign("https://metamask.io/")
  }
}

export const loadAccount = async (web3, dispatch) => {
  const accounts = await web3.eth.getAccounts()
  console.log("accounts, ", accounts)
  console.log(accounts);
  const account = await accounts[0]
  if(typeof account !== 'undefined'){
    dispatch(web3AccountLoaded(account))
    return account
  } else {
    window.alert('Please login with MetaMask')
    return null
  }
}

export const loadToken = async (web3, networkId, dispatch) => {
  try {
    const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
    dispatch(tokenLoaded(token))
    return token
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}

export const loadExchange = async (web3, networkId, dispatch) => {
  try {
    const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
    dispatch(exchangeLoaded(exchange))
    return exchange
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}


export const LoadAllOrders = async(exchange, dispatch) => {
  // all cancelled events in the entire blockchain
  // console.log("exchange: ", exchange);
  const cancelledEvents = await exchange.getPastEvents('Cancel', {fromBlock: 0, toBlock: 'latest'})
  const cancelledOrders = cancelledEvents.map(event => event.returnValues)
  // console.log(cancelledOrders);
  dispatch(CancelOrdersLoaded(cancelledEvents))

  //traded aka succefful orderes
  const TradedEvents = await exchange.getPastEvents('Trade', {fromBlock: 0, toBlock: 'latest'})
  const TradedOrders = TradedEvents.map(event => event.returnValues)
  dispatch(TradedOrdersLoaded(TradedOrders))

  const OrderEvents = await exchange.getPastEvents('Order', {fromBlock: 0, toBlock: 'latest'})
  const allOrders = OrderEvents.map(event => event.returnValues)
  dispatch(AllOrdersLoaded(allOrders))

} 


export const cancelOrder = (dispatch, exchange, account, order) => {
  exchange.methods.cancelOrder(order.id).send({from: account})
  .on('transactionHash', hash => {
    dispatch(orderCancelling())
  })
  .on('error', (error) => {
    console.log(error)
    window.alert("error in cancelling a order")
  })
}



export const subscribeToEvents = async (exchange, dispatch) => {
  exchange.events.Cancel({}, (error, event) => {
    if(error){
      window.alert(error)
      console.log(error);
      return;
    }
    dispatch(orderCancelled(event.returnValues))
  })
  exchange.events.Trade({}, (error, event) => {
    if(error){
      window.alert(error)
      console.log(error);
      return;
    }
    dispatch(orderFilled(event.returnValues))
  })
}



export const fillOrder = (dispatch, exchange, account, order) => {
  exchange.methods.fillOrder(order.id).send({from: account})
  .on('transactionHash', hash => {
    dispatch(orderFilling())
  })
  .on('error', (error) => {
    console.log(error)
    window.alert("error in filling a order")
  })
}


