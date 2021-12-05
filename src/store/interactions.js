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
import { ether_address } from '../helpers'
import { balancesLoaded } from './actions'
import { balancesLoading } from './actions'
import { etherBalanceLoaded, tokenBalanceLoaded, exchangeEtherBalanceLoaded, exchangeTokenBalanceLoaded } from './actions'
import { buyOrderMaking, sellOrderMaking } from './actions'
import { orderMade } from './actions'

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

const ETHER_ADDRESS = ether_address

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

  exchange.events.Deposit({}, (error, event) => {
    dispatch(balancesLoaded())
  })

  exchange.events.Withdraw({}, (error, event) => {
    dispatch(balancesLoaded())
  })

  exchange.events.Order({}, (error, event) => {
    dispatch(orderMade(event.returnValues))
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


//balances


export const loadBalances = async (dispatch, web3, exchange, token, account) => {
  if(typeof account !== 'undefined') {
      // Ether balance in wallet
      const etherBalance = await web3.eth.getBalance(account)
      // console.log("hello ji: ", etherBalance)
      dispatch(etherBalanceLoaded(etherBalance))

      // Token balance in wallet
      const tokenBalance = await token.methods.balanceOf(account).call()
      // console.log("tokenBalance: ", tokenBalance);
      dispatch(tokenBalanceLoaded(tokenBalance))

      // Ether balance in exchange
      const exchangeEtherBalance = await exchange.methods.balanceOf(ether_address,  account).call()
      dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance))

      // Token balance in exchange
      const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
      dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance))

      // Trigger all balances loaded
      dispatch(balancesLoaded())
    } else {
      window.alert('Please login with MetaMask')
    }
}

export const depositEther = (dispatch, exchange, web3, amount, account) => {
  exchange.methods.depositEther().send({ from: account,  value: web3.utils.toWei(amount, 'ether') })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}

export const withdrawEther = (dispatch, exchange, web3, amount, account) => {
  exchange.methods.withDrawEther(web3.utils.toWei(amount, 'ether')).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}

export const depositToken = (dispatch, exchange, web3, token, amount, account) => {
  amount = web3.utils.toWei(amount, 'ether')

  token.methods.approve(exchange.options.address, amount).send({ from: account })
  .on('transactionHash', (hash) => {
    exchange.methods.depositToken(token.options.address, amount).send({ from: account })
    .on('transactionHash', (hash) => {
      dispatch(balancesLoading())
    })
    .on('error',(error) => {
      console.error(error)
      window.alert(`There was an error!`)
    })
  })
}

export const withdrawToken = (dispatch, exchange, web3, token, amount, account) => {
  exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether')).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}




export const makeBuyOrder = (dispatch, exchange, token, web3, order, account) => {
  const tokenGet = token.options.address
  const amountGet = web3.utils.toWei(order.amount, 'ether')
  const tokenGive = ETHER_ADDRESS
  const amountGive = web3.utils.toWei((order.amount * order.price).toString(), 'ether')

  exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(buyOrderMaking())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}

export const makeSellOrder = (dispatch, exchange, token, web3, order, account) => {
  const tokenGet = ETHER_ADDRESS
  const amountGet = web3.utils.toWei((order.amount * order.price).toString(), 'ether')
  const tokenGive = token.options.address
  const amountGive = web3.utils.toWei(order.amount, 'ether')

  exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(sellOrderMaking())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}
