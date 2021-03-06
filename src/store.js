import { createStore, applyMiddleware } from 'redux'
import Lockr from 'lockr'
import thunk from 'redux-thunk'
import reducers from './reducers.js'

export const anomToken = '17dcc7f4-49f8-4d7c-8d66-d96474fa6818.tEs1/na2P9cqWKXn3ab9pgIdPpmEPAaQDIJEYNbG7E4='
// export const anomToken = '90fd45c2-fda1-4108-95dd-c876ce3aa981.ixNvUTPPWHbJ05Cj3rstTcOeEtopsCb9rHiYdcEWwOs='

let selectedPlan = (Lockr.get('selectedPlan') && Lockr.get('selectedPlan') !== 'basic')
    ? Lockr.get('selectedPlan')
    : 'entry'

const initialState = {
  plans: {
    isFetchingPlan: false,
    selectedPlan: selectedPlan,
    data: {}
  },
  market: {},
  stocks: Lockr.get('stocks') ? Lockr.get('stocks') : {},
  settings: {
    // anomToken: '90fd45c2-fda1-4108-95dd-c876ce3aa981.ixNvUTPPWHbJ05Cj3rstTcOeEtopsCb9rHiYdcEWwOs=',
    anomToken: '17dcc7f4-49f8-4d7c-8d66-d96474fa6818.tEs1/na2P9cqWKXn3ab9pgIdPpmEPAaQDIJEYNbG7E4=',
    quandlKey: 'YjZ14NUXoyAGAPRDomS5',
    appKey: 'kid_rJRC6m9F',
    basicAuth: btoa('kid_rJRC6m9F:e6688b599fca47e1bf150d99a786132d')
  }
}

const store = createStore(
  reducers,
  initialState,
  applyMiddleware(thunk)
)

export default store
