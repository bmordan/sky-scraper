module.exports = {
  source: [
    'Sky One HD',
    'a95fd2381fd4e095b8c96080850c5e11',
    'sky-1.png'
  ],
  mockAPI: {
    title: {
      Text: [
        'test title'
      ]
    },
    desc: {
      Text: [
        'description'
      ]
    },
    start: '197001011000 +0000',
    stop: '197001011100 +0000'
  },
  bingAPI: {
    value: [
      {
        thumbnailUrl: 'http://someimage.url/thumbnail',
        contentUrl: 'http://someimage.url/image.jpg'
      }
    ]
  },
  mockResult: {
    channelName: 'Sky One HD',
    channelLogo: 'localhost:8000/images/sky-1.png',
    title: 'test title',
    desc: 'description',
    start: '197001011000 +0000',
    stop: '197001011100 +0000',
    thumbnailUrl: 'http://someimage.url/thumbnail',
    contentUrl: 'http://someimage.url/image.jpg'
  }
}