const functions = require('firebase-functions')
const fetch = require('node-fetch')
const cors = require('cors')({origin: true})
const mailgun = require('mailgun-js')({
  apiKey: functions.config().mailgun.key,
  domain: functions.config().mailgun.domain,
})

const EMAILS = {
  daily: 'daily@hnmail.xyz',
  two_daily: '2daily@hnmail.xyz',
  three_daily: '3daily@hnmail.xyz',
  weekly: 'weekly@hnmail.xyz',
  demo: 'shwilliam@hey.com',
}

// exports.demo = functions.https.onRequest(async (_req, res) => {
//   try {
//     const newsletter = await generateNewsletter()
//     await sendEmail(newsletter, EMAILS.demo)
//     res.send('🚀')
//   } catch (error) {
//     res.status(500).end()
//   }
// })

exports.subscribe = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const body = JSON.parse(req.body)
      const email = body.email
      const frequency = body.frequency
      await subscribeEmail(email, frequency)
      res.send('🚀')
    } catch (error) {
      res.status(500).end()
    }
  })
})

exports.sendDailyNewsletter = functions.pubsub
  .schedule('every day 09:00')
  .onRun(async _ctx => {
    try {
      const newsletter = await generateNewsletter()
      await sendEmail(
        newsletter,
        [EMAILS.daily, EMAILS.two_daily, EMAILS.three_daily].join(','),
      )
    } catch (error) {
      res.status(500).send()
    }
  })

exports.sendTwoDailyNewsletter = functions.pubsub
  .schedule('every day 15:00')
  .onRun(async _ctx => {
    try {
      const newsletter = await generateNewsletter()
      await sendEmail(
        newsletter,
        [EMAILS.two_daily, EMAILS.three_daily].join(','),
      )
    } catch (error) {
      res.status(500).send()
    }
  })

exports.sendThreeDailyNewsletter = functions.pubsub
  .schedule('every day 12:00')
  .onRun(async _ctx => {
    try {
      const newsletter = await generateNewsletter()
      await sendEmail(newsletter, EMAILS.three_daily)
    } catch (error) {
      res.status(500).send()
    }
  })

exports.sendWeeklyNewsletter = functions.pubsub
  .schedule('every monday 09:00')
  .onRun(async _ctx => {
    try {
      const newsletter = await generateNewsletter()
      await sendEmail(newsletter, EMAILS.weekly)
    } catch (error) {
      res.status(500).send()
    }
  })

const storyTemplate = storyObj => `<a href="${
  storyObj.url
}" style="color: currentColor; text-decoration: none;">
  <article style="padding: 0.5rem 1rem;">
    <header><h2 style="margin: 0; font-size: 1rem;">${
      storyObj.title
    }</h2></header>
    <p style="margin: 0; opacity: 0.8; font-size: 0.8rem;">${
      storyObj.score
    } points by ${storyObj.by} on ${
  new Date(storyObj.time * 1000).toISOString().split('T')[0]
} | <a href="https://news.ycombinator.com/item?id=${
  storyObj.id
}" style="color: currentColor; text-decoration: none;">${
  storyObj.descendants
} comments</p>
  </article>
</a>`

const newsletterTemplate = children => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml">
  <head>
    <title>HN Mail</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0 " />
  </head>
  <body>
    <header style="background: #ff6600; padding: 1rem;">
      <h1 style="font-size: 1.4rem; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 0.25rem 0;">HN Mail</h1>
      <p style="margin: 0;">HackerNews straight to your inbox</p>
    </header>
    <main style="background: #f6f6ef; padding: 0.5rem 0">${children}</main>
  </body>
</html>`

const generateNewsletter = async () => {
  const topStoriesIds = await fetch(
    'https://hacker-news.firebaseio.com/v0/topstories.json',
  )
  const topStoriesIdsJson = await topStoriesIds.json()
  const topTenStoriesIds = topStoriesIdsJson.slice(0, 10)
  const topTenStoriesReqUrls = topTenStoriesIds.map(
    id => `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
  )
  const topStories = await Promise.all(
    topTenStoriesReqUrls.map(id => fetch(id)),
  )
  const topStoriesJson = await Promise.all(
    topStories.map(async res => await res.json()),
  )
  const newsletterHtml = newsletterTemplate(
    topStoriesJson.map(storyTemplate).join(''),
  )

  return newsletterHtml
}

const subscribeEmail = (email, frequency) =>
  new Promise((res, rej) => {
    const mailingList = mailgun.lists(EMAILS[frequency])
    mailingList
      .members()
      .create({subscribed: true, address: email}, (error, data) => {
        if (error) {
          console.error(error)
          rej(error)
          return
        }

        res(data)
      })
  })

const sendEmail = (html, email) =>
  new Promise((res, rej) => {
    mailgun.messages().send(
      {
        from: 'HN Mail <news@hnmail.xyz>',
        to: email,
        subject: 'HN Mail',
        html: html,
      },
      (error, body) => {
        if (error) {
          console.error(error)
          rej(error)
          return
        }

        res(body)
      },
    )
  })
