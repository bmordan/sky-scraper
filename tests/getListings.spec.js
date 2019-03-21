jest.mock('request-promise-native')
const moment = require('moment')
const request = require('request-promise-native')

const {
  notEmpty,
  getMoment,
  getListing
} = require('../getListings')

describe('getListings', () => {
  describe('notEmpty', () => {
    test('knows when an object is empty', () => {
      expect(notEmpty({})).toBeFalsy()
    })
    test('knows when an object is not empty', () => {
      expect(notEmpty({key: 'value'})).toBeTruthy()
    })
  })

  describe('getMoment', () => {
    test('returns a moment object', () => {
      const momentDate = getMoment('20190320150000 +0000')
      expect(moment.isMoment(momentDate)).toBeTruthy()
    })
    test('parses a date from a date string', () => {
      const parsed = getMoment('20190320150000 +0000')
      expect(String(parsed)).toBe('Wed Mar 20 2019 15:00:00 GMT+0000')
    })
    test('rejects a mal formed date', () => {
      const wrong = getMoment('invalid-date-string')
      expect(wrong instanceof Error).toBeTruthy()
    })
  })

  describe('getListing', () => {
    const source = [
      'Sky One HD',
      'a95fd2381fd4e095b8c96080850c5e11',
      'sky-1.png'
    ]

    const mockAPI = {
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
    }

    const bingAPI = {
      value: [
        {
          thumbnailUrl: 'http://someimage.url/thumbnail',
          contentUrl: 'http://someimage.url/image.jpg'
        }
      ]
    }

    const mockResult = {
      channelName: 'Sky One HD',
      channelLogo: 'localhost:8000/images/sky-1.png',
      title: 'test title',
      desc: 'description',
      start: '197001011000 +0000',
      stop: '197001011100 +0000',
      thumbnailUrl: 'http://someimage.url/thumbnail',
      contentUrl: 'http://someimage.url/image.jpg'
    }

    beforeAll(() => {      
      request
          .mockReturnValueOnce(Promise.resolve(JSON.stringify([mockAPI])))
          .mockReturnValue(Promise.resolve(JSON.stringify(bingAPI)))
    })

    test('returns a listing', done => {
      
      return getListing(source)
        .then(listing => {
          expect(listing).toEqual(mockResult)
          done()
        })
    })
  })
})