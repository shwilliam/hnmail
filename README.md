# Hacker News Newsletter

> Stay up to date with Hacker News by receiving a snapshot of the top stories
> straight to your inbox

Want a weekly email with a snapshot of the top 50 [Hacker News](https://news.ycombinator.com/)
stories? Maybe three daily emails with only 2 stories to keep you from getting
distracted? [Get started!](https://hnmail.netlify.app/)

## Development

```terminal
firebase functions:config:set mailgun.domain="XXXX" mailgun.key="XXXX"

cd functions
npm i
npm serve
```

## Contributing

This project is open to and encourages contributions! Feel free to discuss any
bug fixes/features in the [issues](https://github.com/shwilliam/hnmail/issues).
If you wish to work on this project:

1. Fork [this project](https://github.com/shwilliam/hnmail)
2. Create a branch (`git checkout -b new-branch`)
3. Commit your changes (`git commit -am 'add new feature'`)
4. Push to the branch (`git push origin new-branch`)
5. [Submit a pull request!](https://github.com/shwilliam/hnmail/pull/new/master)
