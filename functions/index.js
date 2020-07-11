const functions = require('firebase-functions')

const emailAddress = 'shwilliam@hey.com'

const doThing = () => {
  console.log({emailAddress})
}

exports.www = functions.https.onRequest((_req, res) => {
  doThing()
  res.send('🚀')
})

exports.scheduledFunctionPlainEnglish = functions.pubsub
  .schedule('every 2 minutes')
  .onRun(_ctx => {
    doThing()
  })
