const colors = require('colors')
const Snoowrap = require('snoowrap')
const requester = require('../config/snoo-config').actionRequester
const sentimentService = require('../service/SentimentAnalysisService')

// This is where your code will go. It must return a promise!
// This function is called each time a new message is popped from the array.
// It gives you a pre-fetched 'RedditObject' of type comment(mention).
// The InboxStreamGenerator will always give you the first 5 mentions - unread or not
// So be sure to be save-checking saving and every time!
async function doSomething(item) {
    // Checking if the item was saved will keep the bot from processing anything twice.
    if (!item.saved) {
        console.log(`processing item: ${item.id}`)

        //
        // CODE STARTS HERE //

        // Meanie finder bot works in the following subs:
        // AmItheAsshole
        // WinStupidPrizes
        // Cringetopia
        // PeopleOfWalmart
        // Gatekeeping




        await printContents(item)

        let parent_id = getParentId(item)

        const submission = await getParentSubmission(parent_id)


        comments = submission.comments

        console.log(('length of comments array : ' + comments.length).yellow)
        const resultsObject = {
            authors: [],
            analyses: [],
            body: []
        }
        comments.forEach(comment => {
            author = comment.author.name
            body = comment.body

            resultsObject.authors.push(author)
            resultsObject.body.push(body)

            resultsObject.analyses.push(sentimentService.analyzeSentiment(body))

        });

        let indexOfLargest = findIndexOfLargestNumber(resultsObject.analyses)
        let indexOfSmallest = findIndexOfSmallestNumber(resultsObject.analyses)

        const message =
            `HELLO u/${resultsObject.authors[indexOfSmallest]}. I AM THE MEANIE FINDER BOT!!!
    
            I searched through ${comments.length} comments and yours took the grand prize!
            Here is your ALPHA COMMENT:   
            
            ${resultsObject.body[indexOfSmallest]}
            
            
            Incidentally, u/${resultsObject.authors[indexOfSmallest]} is the nicest person here.
            This is what they had to say:   
            
            ${resultsObject.body[indexOfLargest]}`

        console.log(message)

        console.log("meanest persons results: ")
        console.dir(resultsObject.analyses[indexOfSmallest])

        console.log("nicest persons results: ")
        console.dir(resultsObject.analyses[indexOfLargest])
        const reply = await replyToComment(item.id, message);
        console.log("Nicest person message: \n" + resultsObject.body[indexOfLargest])
        console.log(reply)
        console.log(message.green)


        // CODE ENDS HERE //
        //
        // Be sure to finish with saveItem(item) so the item will not be processed again.
        await saveItem(item) // Leave this line where it is!
        return console.log(`item  ${item.id} successfully processed!`)
    } else {
        return console.log((`item ${item.id} saved already. Skipping...`).magenta)
    }
}

// 
// Write your functions down here and call them inside of doSomething.

// Print the contents of the mention
const printContents = function (item) {
    console.log(('printing contents of item.body:\n ' + item.body).green)
    return Promise.resolve(item)
}

// Get Parent ID of the post
const getParentId = function (item) {
    let str = item.parent_id
    str = /_(.+)/.exec(str)[1];
    return str
}


// Get submission from parent_id of the mention
const getParentSubmission = function (parent_id) {
    console.log('getting submission from parent id: ' + parent_id)
    return requester.getSubmission(parent_id).expandReplies()
}

const findIndexOfLargestNumber = function (arr) {
    let max = arr[0].score;
    let index = 0;
    for (let i = 1; i < arr.length; ++i) {
        if (arr[i].score > max) {
            max = arr[i]
            index = i
        }

    }

    return index;

}
const findIndexOfSmallestNumber = function (arr) {
    let max = arr[0].score;
    let index = 0;
    for (let i = 1; i < arr.length; ++i) {
        if (arr[i].score < max) {
            max = arr[i]
            index = i
        }

    }

    return index;

}

const replyToComment = function (id, msg) {
    console.log(`replying to the comment id: ` + id)
    return requester.getComment(id).reply(msg)
}



// 
// Leave this function alone!
const saveItem = function (item) {
    console.log("saving the comment...".grey)
    return requester.getComment(item.id).save();
}
module.exports = {
    doSomething: doSomething
}