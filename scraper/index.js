const http = require('http')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const xml = require('fast-xml-parser')
const he = require('he')
const EventEmitter = require('events')
const schedule = require('node-schedule')
const ts = moment(new Date()).format('YYYY-MM-DD')
const todaysTvPath = ts => path.join(__dirname, 'listings', `${ts}-listings.xml`)
const addPackshot = require('./addPackshot')
const baseUrl = process.env.VIRTUAL_HOST || 'http://localhost:8000'

const channelLogos = {
  'SkySp Mix HD': 'sky-sports-mix.png',
  'SkySp News HD': 'sky-sports-news-hq.png',
  'Sky Disney HD': 'sky-cinema-disney.png',
  'Sky Premiere': 'sky-cinema.png',
  'Sky Arts HD': 'sky-arts.png',
  'Sky News': 'sky-news.png',
  'Sky Atlantic': 'sky-atlantic.png',
  'Sky Two': 'sky-2.png',
  'Sky One HD': 'sky-1.png'
}

const xmlParseOptions = {
  attributeNamePrefix : '@_',
  attrNodeName: 'attr',
  textNodeName : '#text',
  ignoreAttributes : false,
  ignoreNameSpace : false,
  allowBooleanAttributes : false,
  parseNodeValue : true,
  parseAttributeValue : false,
  trimValues: true,
  cdataTagName: '__cdata',
  cdataPositionChar: '\\c',
  localeRange: '',
  parseTrueNumberOnly: false,
  attrValueProcessor: a => he.decode(a, {isAttributeValue: true}),
  tagValueProcessor : a => he.decode(a)
}

const splitDateStr = dateStr => {
  const [datestring] = dateStr.split(' ')
  const y = datestring.substring(0, 4)
  const m = datestring.substring(4, 6)
  const d = datestring.substring(6, 8)
  const h = datestring.substring(8, 10)
  const mm = datestring.substring(10, 12)
  return [y, m, d, h, mm]
}

const createMoment = dateStr => {
  const [y, m, d, h, mm] = splitDateStr(dateStr)
  return moment(`${y}-${m}-${d}T${h}:${mm}`)
}

const generateCache = ready => {
  const xmlListings = fs.readFileSync(todaysTvPath(ts))
  const {tv: {channel, programme}} = xml.parse(String(xmlListings), xmlParseOptions)
  const channels = channel
    .filter(ch => {
      return Object.keys(channelLogos).includes(ch['display-name'])
    })
    .map(ch => {
      const channelName = ch['display-name']
      const channelId = ch.attr['@_id']
      const channelIcon = `${baseUrl}/images/${channelLogos[channelName]}`
      const programmes = []
      return { channelId, channelName, channelIcon , programmes}
    })
    .reduce((memo, ch) => {
      memo[ch.channelId] = ch
      return memo
    }, {})

    
  programme.forEach(programe => {
    const {
      attr: {'@_start': _start, '@_stop': _stop, '@_channel': channelId },
      title: { '#text': title },
      desc: { '#text': desc }
    } = programe
    
    if (channels[channelId]) {
      channels[channelId].programmes.push({
        channelId,
        title,
        desc,
        start: createMoment(_start),
        stop: createMoment(_stop)
      })
    }
  })
  
  for (channelId in channels) {
    channels[channelId].programmes.sort((a, b) => {
      if (moment(a.start).isBefore(moment(b.start))) return -1
      if (moment(a.start).isSame(moment(b.start))) return 0
      return 1
    })
  }

  ready(channels)
}

class Sky extends EventEmitter {
  constructor () {
    super()
    this.channels = {} 
    this.cron
  }

  getChannels () {
    const now = moment(new Date())
    
    return Object.keys(this.channels).map(id => {
      const {channelId, channelName, channelIcon, programmes } = this.channels[id]
      const programme = programmes.find(({start, stop}) => now.isBetween(moment(start), moment(stop)))
      return { channelId, channelName, channelIcon, programme }
    })
  }

  getChannel (channelId) {    
    return this.channels[channelId]
  }

  _addPackshot (channels, done) {
    const self = this
    if (!channels.length) {
      return done.call(self)
    } else {
      const channelId = channels.pop()
      const { channelName, programmes } = this.channels[channelId]
      const searchTerms = channelLogos[channelName].split('-').slice(0, 2).join(' ')

      Promise.all(programmes.map(programme => addPackshot(searchTerms, programme)))
      .then(programmes => {
        self.channels[channelId].programmes = programmes
        self._addPackshot(channels, done)
      })
      .catch(err => {
        console.error(err)
      })
    }
  }

  _ready (channels) {
    this.channels = channels
    this._addPackshot(Object.keys(this.channels), () => {
      this.emit('ready', this.channels)
    })
  }

  go (onReady) {
    onReady = onReady || this._ready.bind(this)
    
    try {
      fs.statSync(todaysTvPath(ts))

      fs.readdirSync(path.join(__dirname, 'listings'))
        .filter(file => file !== `${ts}-listings.xml`)
        .forEach(file => fs.unlinkSync(path.join(__dirname, 'listings', file)))

      generateCache(onReady)
    } catch (err) {
      if (err.code === 'ENOENT') {
    
        const xmlStream = fs.createWriteStream(todaysTvPath(ts))
        
        xmlStream.on('finish', () => {
          xmlStream.close()
          generateCache(onReady)
        })
        
        http.get('http://www.xmltv.co.uk/feed/6721', data => data.pipe(xmlStream))
      } else {
        throw err
      }
    }
  }
}

module.exports = Sky