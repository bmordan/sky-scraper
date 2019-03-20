const request = require('request-promise-native')
const moment = require('moment')
const addPackshot = require('./packshots')
const channels = require('./channels')
const baseUrl = `${process.env.VIRTUAL_HOST || 'localhost:8000'}/images/`
const apixmlUrl = 'http://tv.apixml.net/api.aspx?action=program&channelid='

function getMoment (date) {
  const [datestring] = date.split(' ')
  const y = datestring.substring(0, 4)
  const m = datestring.substring(4, 6)
  const d = datestring.substring(6, 8)
  const h = datestring.substring(8, 10)
  const mm = datestring.substring(10, 12)

  const parsed = moment(`${y}-${m}-${d}T${h}:${mm}Z`)
  return parsed.isValid() ? parsed : new Error('invalid date')
}

function getListing ([channelName, id, channelLogo]) {
  return request(`${apixmlUrl}${id}`)
    .then(feed => {
      const listings = JSON.parse(feed)
      .map(r => {
          const {
            title: { Text: title },
            desc: { Text: desc },
            start,
            stop
          } = r


          return {
            channelName,
            channelLogo: baseUrl + channelLogo,
            title: title.pop(),
            desc: desc.pop(),
            start,
            stop
          }
        })

      const [listing] = listings.filter(({ start }) => {
        return moment().isSame(getMoment(start), 'hour')
      })

      return addPackshot(listing || listings[listings.length - 1])
    })
    .catch(err => {
      console.error(err)
      return err
    })
}

const notEmpty = obj => (Object.keys(obj).length !== 0)

function getListings (ch, listings, res) {
  if (ch >= channels.length) {
    res.send(listings.filter(notEmpty))
  } else {
    getListing(channels[ch])
      .then(listing => {
        listings.push(listing)
        getListings(ch + 1, listings, res)
      })
  }
}

module.exports = {
  getMoment,
  getListing,
  getListings,
  notEmpty
}
