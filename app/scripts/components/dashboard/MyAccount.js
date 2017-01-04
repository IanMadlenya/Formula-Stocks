import React from 'react'
import moment from 'moment'

import store from '../../store'
import cc from '../../cc'

import Modal from '../Modal'



const MyAccount = React.createClass({
  getInitialState() {
    let currPlan = 'premium'
    if (store.session.get('stripe').subscriptions && !store.session.get('stripe').subscriptions.data[0].canceled_at !== null) {
      currPlan = store.session.get('stripe').subscriptions.data[0].plan.id
      currPlan = currPlan.slice(0, currPlan.indexOf('-'))
    } else {
      currPlan = 'unsubscribed'
    }
    return {selectedPlan: false, showModal: false, charging: false, currPlan: currPlan}
  },
  cancelSubscription() {
    cc.cancelSubscription()
  },
  selectPlan(plan) {
    this.setState({selectedPlan: plan})
  },
  changePlan() {
    this.setState({charging: true})
    let cycle = 'monthly'
    if (this.state.selectedPlan === 'business' || this.state.selectedPlan === 'fund') {
      cycle = 'annually'
    }
    if (this.state.currPlan !== 'unsubscribed') {
      cc.updateSubscription(this.state.selectedPlan, cycle)
        .then(() => {
          let type = 2
          if (this.state.selectedPlan === 'basic') { type = 1 }
          else if (this.state.selectedPlan === 'business') { type = 3 }
          else if (this.state.selectedPlan === 'fund') { type = 4 }

          store.session.set('notification', {
            text: `You are now subscribed to the ${this.state.selectedPlan} formula`,
            type: 'notification'
          })
          store.session.set('type', type)
          store.session.updateUser()
          this.setState({charging: false, showModal: false})
        })
        .catch(() => {
          store.session.set('notification', {
            text: `Failed to change plan`,
            type: 'error'
          })
          this.setState({charging: false, showModal: false})
        })
    } else {
      cc.newSubscription(this.state.selectedPlan, cycle)
        .then(() => {
          store.session.set('notification', {
            text: `You are now subscribed to the ${this.state.selectedPlan} formula`,
            type: 'notification'
          })
          this.setState({charging: false, showModal: false})
        })
        .catch(() => {
          store.session.set('notification', {
            text: `Failed to subscribe to the ${this.state.selectedPlan} formula`,
            type: 'error'
          })
          this.setState({charging: false, showModal: false})
        })
    }

  },
  showConfirmationModal() {
    if (this.state.selectedPlan) {
      this.setState({showModal: 'confirmation'})
    }
  },
  closeModal() {
    this.setState({showModal: false})
  },
  newSubscription() {
    let cycle = 'monthly'
    if (this.state.selectedPlan === 'business' || this.state.selectedPlan === 'fund') {
      cycle = 'annually'
    }
    cc.newSubscription(this.state.selectedPlan, cycle)
  },
  render() {

    let basicClass = 'white'
    let premiumClass = 'white'
    let businessClass = 'white'
    let fundClass = 'white'

    if(this.state.selectedPlan === 'basic') {basicClass = 'blue selected'}
    else if(this.state.selectedPlan === 'premium') {premiumClass = 'blue selected'}
    else if(this.state.selectedPlan === 'business') {businessClass = 'blue selected'}
    else if(this.state.selectedPlan === 'fund') {fundClass = 'blue selected'}


    let currPlan;
    if (store.session.get('stripe').subscriptions && !store.session.get('stripe').subscriptions.data[0].canceled_at !== null) {
      currPlan = store.session.get('stripe').subscriptions.data[0].plan.id
      currPlan = currPlan.slice(0, currPlan.indexOf('-'))
      currPlan = currPlan + ' formula'
    }

    if (store.session.get('stripe').subscriptions.data[0].canceled_at !== null) {
      currPlan = 'Unsubscribed'
    }

    let changePlanBtn = <button onClick={this.showConfirmationModal} className="change-plan filled-btn">Next</button>

    let bottomBtn = <button onClick={this.cancelSubscription} className="filled-btn cancel-btn red">Cancel subscription</button>
    let changeTitle = 'Change your subscription'
    if (store.session.get('stripe').subscriptions.data[0].canceled_at !== null) {
      changePlanBtn = <button onClick={this.showConfirmationModal} className="change-plan filled-btn">Subscribe to: <span className="capitalize"> {this.state.selectedPlan}</span></button>
      bottomBtn = undefined;
      changeTitle = 'Select a plan'
    }
    let basicDisabled, premiumDisabled, businessDisabled, fundDisabled = false;

    if(currPlan === 'basic formula') {basicClass = 'blue current'; basicDisabled = true}
    else if(currPlan === 'premium formula') {premiumClass = 'blue current'; premiumDisabled = true}
    else if(currPlan === 'business formula') {businessClass = 'blue current'; businessDisabled = true}
    else if(currPlan === 'fund formula') {fundClass = 'blue current'; fundDisabled = true}

    let modal;
    if (this.state.showModal) {

      let cycle = 'monthly'
      let price;
      if     (this.state.selectedPlan === 'basic') {price = 50}
      else if(this.state.selectedPlan === 'premium') {price = 100}
      else if(this.state.selectedPlan === 'business') {price = 20000; cycle="annually"}
      else if(this.state.selectedPlan === 'fund') {price = 140000; cycle="annually"}

      let modalStyles = {
        maxWidth: '400px',
      }

      let chargeText = <p>We will charge <span className="bold">${cc.commafy(price)}</span> to the card on file.</p>
      if(store.plans.get(this.state.selectedPlan).get('type') < store.session.get('type')) {
        chargeText = <p>on your next billing date we will charge <span className="bold">${cc.commafy(price)}</span> to the card on file.</p>
      }

      let chargeBtn = <button className="filled-btn" onClick={this.changePlan}>Subscribe for ${cc.commafy(price)} {cycle}</button>
      if (this.state.charging) {
        chargeBtn = <button className="filled-btn"><i className="fa fa-spinner fa-pulse fa-2x fa-fw white-color"></i></button>
      }

      modal = (
        <Modal closeModal={this.closeModal} modalStyles={modalStyles}>
          <div className="change-plan-confirmation">
            <h2>Confirm plan change</h2>
            {chargeText}
            <p className="card-on-file"><i className="fa fa-credit-card-alt" aria-hidden="true"></i>{store.session.get('stripe').sources.data[0].last4}</p>
            {chargeBtn}
          </div>
        </Modal>
      )
    }


    // console.log(store.session.get('stripe').subscriptions.data[0].current_period_end);
    // console.log(moment.unix(store.session.get('stripe').subscriptions.data[0].current_period_end).format('DD MMMM YYYY'));
    return (
      <div className="my-account-page">
        <section className="top">
          <div className="profile-info blue">
            <h2 className="name white-color">{store.session.get('name')}</h2>
            <h3 className="white-color capitalize"><i className="fa fa-flask white-color" aria-hidden="true"></i> {currPlan}</h3>
            <h3 className="email white-color"><i className="fa fa-envelope white-color" aria-hidden="true"></i>{store.session.get('email')}</h3>
            <h3 className="billing-date white-color"><i className="fa fa-calendar white-color" aria-hidden="true"></i>Next billing date: {moment.unix(store.session.get('stripe').subscriptions.data[0].current_period_end).format('MMMM Do YYYY')}</h3>
          </div>
        </section>

        <div className="change-plan-container">
          <h2>{changeTitle}</h2>
          <button className={basicClass} disabled={basicDisabled} onClick={this.selectPlan.bind(null, 'basic')}><h3 className="plan-name">Basic</h3><h3 className="price">$50<br/><span className="disclaimer">monthly</span></h3></button>
          <button className={premiumClass} disabled={premiumDisabled} onClick={this.selectPlan.bind(null, 'premium')}><h3 className="plan-name">Premium</h3><h3 className="price">$100<br/><span className="disclaimer">monthly</span></h3></button>
          <button className={businessClass} disabled={businessDisabled} onClick={this.selectPlan.bind(null, 'business')}><h3 className="plan-name">Business</h3><h3 className="price">$20,000<br/><span className="disclaimer">yearly</span></h3></button>
          <button className={fundClass} disabled={fundDisabled} onClick={this.selectPlan.bind(null, 'fund')}><h3 className="plan-name">Fund</h3><h3 className="price">$140,000<br/><span className="disclaimer">yearly</span></h3></button>

          {changePlanBtn}
        </div>

        {bottomBtn}
        {modal}
      </div>
    )
  }
})

export default MyAccount
