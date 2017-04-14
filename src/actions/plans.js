import store from '../rstore'
import _ from 'lodash'
import { showNotification } from './notifications'

export const FETCHING_PLAN = 'FETCHING_PLAN'
export const RECEIVE_PLAN = 'RECEIVE_PLAN'
export const SELECT_NEW_PLAN = 'SELECT_NEW_PLAN'
export const UPDATING_PLAN = 'UPLOADING_NEW_PLAN'
export const UPDATED_PLAN = 'UPLOADED_NEW_PLAN'

export function fetchPlanIfNeeded(plan) {
  return (dispatch) => {
    if (window.location.pathname.indexOf('dashboard') > -1) {
      if (store.getState().plans.data[plan]) {
        if (store.getState().plans.data[plan].suggestions.length && store.getState().plans.data[plan].portfolio.length) {
          dispatch({ type: "PLAN_ALREADY_EXISTS" })
          return false
        }
      }
      dispatch(fetchPlan(plan, 'private'))
      return true
    } else if (store.getState().plans.data[plan]) {
      dispatch({ type: "PLAN_ALREADY_EXISTS" })
      return false
    }
    dispatch(fetchPlan(plan, 'public'))
  }
}

function fetchPlan(plan, type) {
  return (dispatch) => {
    dispatch(fetchingPlan(plan))
    fetch(`https://formulastocks-server.tk:3001/${type}/${plan}`)
      .then(response => response.json())
      .then(json => dispatch(receivePlan(plan, json)))
  }
}
function fetchingPlan(plan) { return { type: FETCHING_PLAN, plan } }
function receivePlan(plan, json) { return { type: RECEIVE_PLAN, plan: plan, data: json } }

export function selectNewPlan(plan) {
  return (dispatch) => {
    dispatch(fetchPlanIfNeeded(plan))
    dispatch({ type: SELECT_NEW_PLAN, plan: plan })
  }
}

export function updatePlan(fileArr, planName) {
  return (dispatch) => {
    if (store.getState().plans.data[planName]) {
      if (  store.getState().plans.data[planName].suggestions
            && store.getState().plans.data[planName].portfolio
            && store.getState().plans.data[planName].annualData
          ) {
        dispatch(uploadPlanData(fileArr, planName))
        return
      }
    }
    if (!store.getState().plans.data[planName]) {
      dispatch(showNotification('Fetching private API'))
      fetch(`https://formulastocks-server.tk:3001/private/${planName}`)
        .then(response => response.json())
        .then(json => dispatch(receivePlan(planName, json)))
        .then(() => dispatch(updatePlan(fileArr, planName)))
    }
    else if (!store.getState().plans.data[planName].suggestions) {
      dispatch(showNotification('Fetching private API'))
      fetch(`https://formulastocks-server.tk:3001/private/${planName}`)
        .then(response => response.json())
        .then(json => dispatch(receivePlan(planName, json)))
        .then(() => dispatch(updatePlan(fileArr, planName)))
    }
    else if (!store.getState().plans.data[planName].annualData) {
      dispatch(showNotification('Fetching public API'))
      fetch(`https://formulastocks-server.tk:3001/public/${planName}`)
        .then(response => response.json())
        .then(json => dispatch(receivePlan(planName, json)))
        .then(() => dispatch(updatePlan(fileArr, planName)))
    }
  }
}

function uploadPlanData(fileArr, planName) {
  return (dispatch) => {
    dispatch(showNotification(`Uploading ${planName} data`))

    let plan = store.getState().plans.data[planName]

    let receivedJSON = (i, e) => {
      const lines = e.target.result
      const data = JSON.parse(lines)

      if (fileArr[i].name.indexOf('weekly') > -1) {
        // Weekly file
        let monthlySuggestions = plan.suggestions.filter(sug => sug.model ? true : false)
        plan.suggestions = _.union(data.actionable, monthlySuggestions)
      } else if (fileArr[i].name.indexOf('monthly') > -1) {
        // Monthly file
         const weeklySuggestions = plan.suggestions.filter(sug => sug.model ? false : true)
         let newSuggestions = []
         if (data.actionable) {
          newSuggestions = data.actionable.map(sug => {
             sug.model = true
             return sug
           })
         }
         newSuggestions = _.union(weeklySuggestions, newSuggestions)
         plan.suggestions = newSuggestions
         plan.portfolio = data.portfolio
         plan.portfolioYields = data.logs
         plan.portfolioReturn = data.statistics.total_return
      } else if (fileArr[i].name.indexOf('annual') > -1) {
        // Annual file
        let newStats = data.statistics
        newStats.WLRatio = (100 - data.statistics.negatives / (data.statistics.positives + data.statistics.negatives) * 100)
        plan.stats = _.extend({}, plan.stats, newStats)
        plan.annualData = data.logs
      }
    }

    // Remove same-type duplicates
    plan.suggestions = plan.suggestions.reduce((suggestions, sug, i) => {
       let dupeIndex = -1
       suggestions.forEach((suggestion, i) => {
         if (suggestion.model === sug.model) {
           if (suggestion.ticker === sug.ticker) { dupeIndex = i }
         }
       })

       if (dupeIndex > -1) {
         if (suggestions[dupeIndex].percentage_weight && sug.percentage_weight) {
           suggestions[dupeIndex].percentage_weight += sug.percentage_weight
         } else if (suggestions[dupeIndex].portfolio_weight && sug.portfolio_weight) {
           suggestions[dupeIndex].portfolio_weight += sug.portfolio_weight
         }
         return suggestions
       }
       return suggestions.concat(sug)
     }, [])

    const publicData = _.omit(plan, ['portfolio', 'suggestions', '_acl', '_kmd', '__v'] )
    dispatch( updatePublicPlan(publicData, planName) )

    let privateData = _.omit(plan, ['annualData', 'info', '_acl', '_kmd', '__v'])
    privateData.stats = { CAGR: privateData.stats.CAGR, WLRatio: privateData.stats.WLRatio }
    dispatch( updatePrivatePlan(privateData, planName) )

    fileArr.forEach((file, i) => {
      let fr = new FileReader()
      fr.onload = receivedJSON.bind(null, i)
      fr.readAsText(file)
    })
  }
}

let updatePlanHeaders = new Headers()
updatePlanHeaders.append('Content-type', `application/json`)

function updatePublicPlan(publicData, planName) {
  return (dispatch) => {
    const options = {
      method: "PUT",
      headers: updatePlanHeaders,
      body: JSON.stringify(publicData)
    }
    fetch(`https://formulastocks-server.tk:3001/public/${planName}`, options)
      .then(() => dispatch( { type: UPDATED_PLAN }) )
      .then(() => dispatch( showNotification(`succesfully updated public API: ${planName}`)) )
      .then(() => dispatch( receivePlan(planName, publicData)) )
  }
}

function updatePrivatePlan(privateData, planName) {
  return (dispatch) => {
    const options = {
      method: "PUT",
      headers: updatePlanHeaders,
      body: JSON.stringify(privateData)
    }
    fetch(`https://formulastocks-server.tk:3001/private/${planName}`, options)
      .then(() => dispatch( { type: UPDATED_PLAN }) )
      .then(() => dispatch( showNotification(`succesfully updated private API: ${planName}`)) )
      .then(() => dispatch( receivePlan(planName, privateData)) )
  }
}
