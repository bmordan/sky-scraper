const express = require('express')
const app = express()
const listings = require('./getListings')

const PORT = process.env.PORT || 8000

app.use(express.static('public'))
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
app.get('/', (req, res) => {
  listings(0, [], res)
})
app.listen(PORT, () => console.log(`${process.env.VIRTUAL_HOST} listening on port ${PORT} with key ${process.env.BING_IMAGE_SEARCH_API_KEY}`))
