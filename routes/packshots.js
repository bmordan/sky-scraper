const request = require('request-promise-native')
const apikey = process.env.BING_IMAGE_SEARCH_API_KEY
const baseUrl = 'https://api.cognitive.microsoft.com/bing/v7.0/images/search'

function addPackshot (listing) {
  if (!listing) return {}
  const { channel, title } = listing
  const term = `${channel} ${title} tv show`
  const query = `?q=${encodeURIComponent(term)}`
  const url = baseUrl + query
  const headers = { 'Ocp-Apim-Subscription-Key': apikey }

  return request({ url, headers })
    .then(results => {
      const { value } = JSON.parse(results)
      const { thumbnailUrl, contentUrl } = value[0]
      return Object.assign(listing, { thumbnailUrl, contentUrl })
    })
    .catch(err => {
      console.error(err)
      return err
    })
}

module.exports = addPackshot
