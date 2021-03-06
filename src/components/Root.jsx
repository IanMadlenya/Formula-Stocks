import React from 'react'
import store from '../store'
import routes from '../routes'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'

export default () => (
  <Provider store={store}>
    <Router history={browserHistory} routes={routes} onUpdate={() => window.scrollTo(0, 0)}/>
  </Provider>
)
