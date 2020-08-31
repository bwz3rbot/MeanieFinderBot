const Sentiment = require('sentiment');

const analyzeSentiment = function (str) {
    let sentiment = new Sentiment();
    return sentiment.analyze(str)
}

module.exports = {
    analyzeSentiment:analyzeSentiment
}