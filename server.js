const express = require('express')
const app = express()
const Sky = require('./scrapper')
const sky = new Sky()
const PORT = process.env.PORT || 8000

sky.on('ready', () => {
  app.use(express.static('public'))

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })

  app.get('/', (req, res) => res.send(sky.getChannels()))
  app.get('/:channel', (req, res) => res.send(sky.getChannel(req.params.channel)))

  app.listen(PORT, () => {
    console.log(`sky-scrapper listening on port ${PORT} with key ${process.env.BING_IMAGE_SEARCH_API_KEY}`)
  })
})

sky.go()

