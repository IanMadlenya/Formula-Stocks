import _ from 'lodash'
import platform from 'platform'

import {
  FETCHING_SESSION,
  RECEIVE_SESSION,
  SET_SESSION_ITEM,
  UPDATE_USER,
  SAW_SUGGESTIONS,
  LOG_IN,
  LOG_IN_ERROR,
  LOG_OUT,
  SIGNING_UP,
  DONE_SIGNING_UP,
  SIGN_UP_ERROR,
  CANCEL_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION,
} from '../actions/session'

const initialState = {
  isFetching: false,
  location: {},
  lastSeen: new Date(),
  signingUp: false,
  os: platform.os.family,
  product: platform.product,
  browser: platform.name,
  referer: document.referrer,
  visits: 1
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case FETCHING_SESSION:
      return Object.assign({}, state, { isFetching: true })
    case RECEIVE_SESSION:
      if (action.data._kmd) {
        if (action.data._kmd.authtoken) { localStorage.setItem('authtoken', action.data._kmd.authtoken) }
      }
      if (!action.data.error) {
        return Object.assign({}, state, { isFetching: false, signingUp: false }, action.data)
      } else {
        console.error(action.data.error)
        return Object.assign({}, state, { isFetching: false, signingUp: false })
      }

    case SET_SESSION_ITEM:
      state[action.key] = action.value
      return Object.assign({}, state)
    case UPDATE_USER:
      return Object.assign({}, state)
    case SAW_SUGGESTIONS:
      return Object.assign({}, state, { lastSeenSuggestions: action.time })
    case SIGNING_UP:
      return Object.assign({}, state, { signingUp: true })
    case DONE_SIGNING_UP:
      return Object.assign({}, state, { signingUp: false })
    case SIGN_UP_ERROR:
      return Object.assign({}, state, { signupError: action.error, signingUp: false })
    case LOG_IN:
      if (!action.data.error) {
        action.data.authtoken = action.data._kmd.authtoken
        localStorage.setItem('authtoken', action.data._kmd.authtoken)
        return Object.assign({}, state, action.data)
      } else {
        console.error(action.data.error)
        return Object.assign({}, state)
      }
    case LOG_IN_ERROR:
      return Object.assign({}, state, { loginError: action.error })
    case LOG_OUT:
      localStorage.removeItem('authtoken')
      state = initialState
      return Object.assign({}, state)
    case CANCEL_SUBSCRIPTION:
      state.stripe.subscriptions = { data: [action.subscription] }
      return Object.assign({}, state)
    case UPDATE_SUBSCRIPTION:
      state.stripe.subscriptions = { data: [action.subscription] }
      return Object.assign({}, state)
    default:
      return state
  }
}
