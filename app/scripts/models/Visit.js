import Backbone from 'backbone'
import $ from 'jquery'

import store from '../store'

const Visit = Backbone.Model.extend({
  url: `https://baas.kinvey.com/appdata/kid_rJRC6m9F/visits`,
  defaults: {
    device: '',
    location: {},
    browser: '',
    type: -1,
  },
  getData(type) {
    if (store.session.get('type') === 5)
      return null
    $.ajax('https://freegeoip.net/json/')
    .then((r) => {
      this.set('location', r)
      this.set('browser', store.session.browserType())
      this.set('type', type || -1)
      store.session.set('location', r)
      if (!localStorage.getItem('visitorID')) {
        this.save(null, {
          url: `https://baas.kinvey.com/appdata/kid_rJRC6m9F/visits`,
          type: 'POST',
          success: (r) => {
            localStorage.visitorID = r.get('_id')
          },
          error: (e) => {
            console.error('failed posting visit: ', e)
          }
        })
      } else {
        this.set('_id', localStorage.visitorID)
        this.save(null, {
          url: `https://baas.kinvey.com/appdata/kid_rJRC6m9F/visits/${localStorage.visitorID}`,
          type: 'PUT',
          success: (r) => {
            if (store.session.get('username') !== 'anom') {
              store.session.set('lastSeen', new Date())
              store.session.updateUser()
            }
          },
          error: (e) => {
            console.error('failed putting visit: ', e)
          }
        })
      }
    })
  }
})

export default Visit
