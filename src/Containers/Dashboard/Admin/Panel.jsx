import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchVisits, fetchVisitsCount, fetchUsers } from '../../../actions/admin'
import _ from 'lodash'

import admin from '../../../admin'
import AdminPanelHeader from './Headers'
import VisitorList from './VisitorList'

import DAUGraph from './DAUGraph'
import PieChart from '../../Global/Components/PieChart/PieChart'
import './styles/panel.css'

class AdminPanel extends React.Component {
  constructor(props) {
    super(props)

    this.cleanVisits = this.cleanVisits.bind(this)
  }

  componentDidMount() {
    this.props.actions.fetchVisitsCount()
    this.props.actions.fetchVisits()
    this.props.actions.fetchUsers()
  }

  destroyVisit(visit) {
    // $.ajax({
    //   url: `https://baas.kinvey.com/appdata/kid_rJRC6m9F/visits/${visit.get('_id')}`,
    //   type: 'DELETE'
    // })
    // .then(r => {
    //   console.log('destroyed: ', r)
    // })
  }

  cleanVisits() {
    let ips = []
    admin.visits.forEach(visit => {
      if (visit) {
        const ip = visit.get('location').ip
        if (ips.indexOf(ip) > -1) {
          this.destroyVisit(visit)
          console.log('destroy: ', visit.toJSON().location.ip)
        } else {
          ips = ips.concat(ip)
        }
      }
    })
  }

  render() {
    const { visits, visitsCount, users, actions } = this.props
    const browserColors = []
    const browsers = visits.reduce((prev, visitor) => {
      let foundIndex = -1
      if (_.find(prev, (browserType, i) => {
        foundIndex = i
        return browserType.title === visitor.browser
        || (browserType.title === 'Chrome' && visitor.browser === 'Blink')
        || (browserType.title === 'Chrome' && visitor.browser === 'Chrome Mobile')
        || (browserType.title === 'Edge' && visitor.browser === 'Microsoft Edge')})) {
        prev[foundIndex].value++
      } else {
        if (visitor.browser) {
          prev.push({ title: visitor.browser, value: 1 })
          if (visitor.browser.indexOf('Chrome') > -1 || visitor.browser === 'Blink') { browserColors.push('#FDD20A') }
          else if (visitor.browser.indexOf('Firefox') > -1) { browserColors.push('#EA5B0C') }
          else if (visitor.browser === 'IE' || visitor.browser.indexOf('Edge') > -1) { browserColors.push('#2C74BE') }
          else if (visitor.browser === 'Safari') { browserColors.push('#298FDD') }
          else if (visitor.browser === 'Android Browser') { browserColors.push('#99CC00') }
          else if (visitor.browser === 'Opera') { browserColors.push('#FE0002') }
        }
      }

      return prev
    },[])

    const desktop = { title: 'Desktop', value: visits.filter(visitor => visitor.device === 'desktop').length }
    const tablet = { title: 'Tablet', value: visits.filter(visitor => visitor.product === 'iPad').length }
    const mobile = { title: 'Mobile', value: visits.filter(visitor => visitor.device === 'mobile').length - tablet.value }

    const OSColors = []
    const operatingSystems = visits.reduce((prev, visitor) => {
      let foundIndex = -1
      if (_.find(prev, (os, i) => {
        foundIndex = i
        if (!visitor.os) { return prev }
        return os.title === visitor.os
        || (os.title === 'Linux' && visitor.os.indexOf('Ubuntu') > -1)
        || (os.title === 'Windows' && visitor.os.indexOf('Windows') > -1)})) {
        prev[foundIndex].value++
      } else if (visitor.os) {
        prev.push({ title: visitor.os, value: 1 })
        if (visitor.os.indexOf('Windows') > -1) { OSColors.push('#01BCF3') }
        else if (visitor.os === 'OS X') { OSColors.push('#cccccc') }
        else if (visitor.os === 'Linux' || visitor.os.indexOf('Ubuntu') > -1) { OSColors.push('#020204') }
        else if (visitor.os === 'iOS') { OSColors.push('#eeeeee') }
        else if (visitor.os === 'Android') { OSColors.push('#99CC00') }
      }
      return prev
    },[])

    const RefererColors = []
    const referers = visits.reduce((prev, visitor) => {
      let foundIndex = -1
      if (_.find(prev, (referer, i) => {
        foundIndex = i
        return referer.title === visitor.referer.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]})) {
        prev[foundIndex].value++
      } else if (visitor.referer && visitor.referer.indexOf('localhost') === -1) {
        prev.push({ title: visitor.referer.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0], value: 1 })
      }
      return prev
    },[])
    .map(referer => {
      referer.title = referer.title.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]

      return referer
    })
    .filter(referer => {
      return referer.value > 1 ? true : false
    })

    return (
      <div className="admin-panel">
        <AdminPanelHeader visitsCount={visitsCount} users={users} fetchVisitsCount={actions.fetchVisitsCount} fetchUsers={actions.fetchUsers}/>
        <div className="unqiue-visiotrs">
        </div>
        <div className="DAU-container">
          <h2>Daily Visitors</h2>
          <DAUGraph data={visits}/>
        </div>
        <div className="browsers-container">
          <h2>Visitor statistics</h2>
          <div className="browsers">
            <PieChart title="Browsers" data={browsers} colors={browserColors}/>
            <PieChart title="Devices" data={[desktop, tablet, mobile]} colors={['#27A5F9', '#cccccc', '#eeeeee']}/>
            <PieChart title="OS" data={operatingSystems} colors={OSColors}/>
            <PieChart title="Referers" data={referers} colors={RefererColors}/>
          </div>
        </div>
        <div className="user-list-container">
          <h2>Latest visitors</h2>
          <VisitorList visitors={visits.slice(1).slice(-30).reverse()}/>
        </div>
        <button onClick={this.cleanVisits}>Clean visits</button>
      </div>
    )
  }
}


function mapStateToProps(state) {
  const { admin } = state
  const { visits, visitsCount, users } = admin
  return { visits, visitsCount, users }
}

function mapDispatchToProps(dispatch) {
  const actions = { fetchVisits, fetchVisitsCount, fetchUsers }
  return { actions: bindActionCreators(actions, dispatch) }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminPanel)
