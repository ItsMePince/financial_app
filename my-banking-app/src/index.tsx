import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './pages/Home';
import AccountNew from './pages/accountnew';
import CustomOutcome from './pages/customoutcome';
import Day from './pages/day';
import Expense from './pages/expense';
import Income from './pages/income';
import Login from './pages/Login';
import Month from './pages/month';
import Signup from './pages/SignUp';
import Summary from './pages/summary';
import AccountSelect from './pages/AccountSelect';





import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    < Income/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
