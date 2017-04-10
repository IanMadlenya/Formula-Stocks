import _ from 'underscore'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { isAllowedToView } from '../helpers'
import {  } from '../../../actions/plans'
import moment from 'moment'
import {Link} from 'react-router'

import Suggestion from './Stock'
import SmallStock from './SmallStock'
import SuggestionHeader from './SuggestionsHeader'
import './suggestions.css'
import store from '../../../store'

class Suggestions extends React.Component {
  constructor(props) {
    super(props)
    this.updateState = this.updateState.bind(this)
    this.state = { plan: store.selectedPlan, fetching: false }
  }

  componentDidMount() {
    store.session.set('lastSeenSuggestions', new Date())
    store.session.updateUser()
    if (isAllowedToView(this.props.plan) && !store.plans.get(this.props.plan).get('portfolio').length) { store.plans.get(this.props.plan).fetchPrivate(this.props.plan) }
    else if (!isAllowedToView(this.props.plan) && !store.plans.get(this.props.plan).get('portfolioYields').length) { store.plans.get(this.props.plan).fetch() }
    store.plans.get(this.props.plan).on('change', this.updateState)
    store.plans.on('plan-change', this.updateState)
  }

  updateState() {
    if (store.selectedPlan === this.state.plan) {
      this.setState({ fetching: false, plan: store.selectedPlan })
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.plan !== this.state.plan) {
      if (isAllowedToView(store.selectedPlan) && !store.plans.get(store.selectedPlan).get('suggestions').length) { store.plans.get(store.selectedPlan).fetchPrivate(store.selectedPlan) }
      else if (!isAllowedToView(store.selectedPlan) && !store.plans.get(store.selectedPlan).get('portfolioYields').length) { store.plans.get(store.selectedPlan).fetch() }
      store.plans.get(store.selectedPlan).on('change', this.updateState)
      this.setState({ plan: store.selectedPlan })
    }
  }

  componentWillUnmount() {
    store.plans.get('basic').off('change', this.updateState)
    store.plans.get('premium').off('change', this.updateState)
    store.plans.get('business').off('change', this.updateState)
    store.plans.get('fund').off('change', this.updateState)
  }

  render() {
    console.log(this.props)
    const { plans, session, selectedPlan } = this.props
    const plan = plans[selectedPlan]

    let SuggHeader = <SuggestionHeader
                      stats={plan ? plan.stats : {}}
                      portfolio={plan ? plan.portfolio : []}
                      suggestions={plan ? plan.suggestions : []}
                      isPortfolioTrades={this.props.location.indexOf('trades') === -1 ? false : true}/>

    let suggestionsList
    if (isAllowedToView(this.state.plan)) {
      if (!plan) {
        return (
          <div className="suggestions"> {SuggHeader} </div>
        )
      }
      else if (!plan.suggestions.length) {
        return (
          <div className="suggestions"> {SuggHeader} </div>
        )
      }
      let suggestions = []
      if (this.props.location.indexOf('trades') === -1) {
        suggestions = store.plans.get(this.state.plan).get('suggestions').filter(sug => sug.model && sug.action === 'BUY' ? false : true)
      } else {
        suggestions = store.plans.get(this.state.plan).get('suggestions').filter(sug => sug.model ? true : false).reverse()
      }

      suggestions = suggestions.map((suggestion, i) => {
        let numerator = i
        if (this.props.location.indexOf('trades') > -1) {
          numerator = _.findIndex(store.plans.get(this.state.plan).get('suggestions'), (sug) => sug.model && sug.ticker === suggestion.ticker)
        }
        if (this.state.plan !== 'fund') {
          return <Suggestion key={this.state.plan+suggestion.ticker+i} suggestion={suggestion} i={numerator} trades={this.props.location.indexOf('trades') === -1 ? false : true} planName={this.state.plan}/>
        } else {
          return <SmallStock key={this.state.plan+suggestion.ticker+i} suggestion={suggestion} i={numerator} trades={this.props.location.indexOf('trades') === -1 ? false : true} planName={this.state.plan}/>
        }
      })
      suggestionsList = (
        <ul className="suggestions-list">
          {suggestions}
        </ul>
      )
    } else {
      suggestionsList = (
        <section className="no-permissions">
          <h3>Upgrade to the <span className="capitalize blue-color ">{this.state.plan} formula</span> to see these suggestions</h3>
          <Link to="/dashboard/account" className="filled-btn upgrade-your-plan">Upgrade your plan</Link>
        </section>
      )
    }

    let lastUpdatedText
    if (store.plans.get(this.state.plan).get('suggestions').length) {
      let date = store.plans.get(this.state.plan).get('suggestions')[0].date

      let month = date.month
      let fixedDate = date.day
      if (Number(date.month) <= 9) { month = '0' + date.month}
      if (Number(date.day) <= 9) { fixedDate = '0' + date.day}
      let lastUpdatedDate = moment(date.year + month + fixedDate, 'YYYYMMDD').format('MMM D, YYYY')
      let endWindowDate = moment(date.year + month + fixedDate, 'YYYYMMDD').add(30, 'days').format('MMM D, YYYY')
      lastUpdatedText = <h3 className="timeStamp">Trading window: {lastUpdatedDate} to {endWindowDate}</h3>
    }

    return (
      <div className="suggestions">
        {SuggHeader}
        {suggestionsList}
        {lastUpdatedText}
      </div>
    )
  }
}


function mapStateToProps(state) {
  const { plans, session } = state
  const { selectedPlan } = plans

  return {
    plans,
    selectedPlan,
    session
  }
}

function mapDispatchToProps(dispatch) {
  const actions = { }
  return { actions: bindActionCreators(actions, dispatch) }
}


export default connect(mapStateToProps, mapDispatchToProps)(Suggestions)
