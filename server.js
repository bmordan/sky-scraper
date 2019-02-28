const express = require('express')
const app = express()

const PORT = process.env.PORT || 8000

app.use(express.static('public'))
app.get('/', require('./routes/'))
app.listen(PORT, () => console.log(`listening on port ${PORT} with key ${process.env.BING_IMAGE_SEARCH_API_KEY}`))
