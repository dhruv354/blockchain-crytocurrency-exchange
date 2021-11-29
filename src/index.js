import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App';
import Web3 from 'web3';
import configureStore from './store/configureStore';
import { render } from 'react-dom';
import { Provider } from 'react-redux';



import reportWebVitals from './reportWebVitals';

const store = configureStore()

ReactDOM.render(
    <Provider store={store}>
       <App />
    </Provider>,
   
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

reportWebVitals();
