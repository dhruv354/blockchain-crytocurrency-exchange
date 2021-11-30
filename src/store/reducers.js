import { combineReducers } from 'redux';

function web3(state = {}, action) {
  switch (action.type) {
    case 'WEB3_LOADED':
      return { ...state,  connection: action.connection }
    case 'WEB3_ACCOUNT_LOADED':
      return { ...state, account: action.account }
    default:
      return state
  }
}

function token(state = {}, action) {
  switch (action.type) {
    case 'TOKEN_LOADED':
      console.log("Token State: ", state);
      return { ...state, loaded: true, contract: action.contract }
    default:
      return state
  }
}

function exchange(state = {}, action) {
  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    case 'CANCEL_ORDERS_LOADED':
      return {...state, cancelledOrders: {loaded:true, data:action.orders}}
    case 'TRADED_ORDERS_LOADED':
      return {...state, tradedOrders: {loaded:true, data:action.orders}}
    case 'ALL_ORDERS_LOADED':
      return {...state, allOrders: {loaded:true, data:action.orders}}
    case 'ORDER_CANCELLING':
      return{...state, orderCancelling: true}
    case 'ORDER_CANCELLED':
      return {
        ...state,
        orderCancelling: false,
        cancelledOrders: {
          ...state.cancelledOrders,
          data: [
            ...state.cancelledOrders.data,
            action.order
          ]
        }
      }
    default:
      return state
  }
}

const rootReducer = combineReducers({
  web3,
  token,
  exchange
})

export default rootReducer