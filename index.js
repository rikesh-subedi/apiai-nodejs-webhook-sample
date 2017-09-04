const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
app.set('port', (process.env.PORT || 5000))

const REQUIRE_AUTH = true
const AUTH_TOKEN = 'an-example-token'

app.get('/', function (req, res) {
  res.send('Use the /webhook endpoint.')
})
app.get('/webhook', function (req, res) {
  res.send('You must POST your request')
})

var userSession = {}

//https://hoo-dy.herokuapp.com/webhook
app.post('/webhook', function (req, res) {
  // we expect to receive JSON data from api.ai here.
  // the payload is stored on req.body
  console.log(req.body)

  // we have a simple authentication
  if (REQUIRE_AUTH) {
    if (req.headers['auth-token'] !== AUTH_TOKEN) {
      return res.status(401).send('Unauthorized')
    }
  }

  // and some validation too
  if (!req.body || !req.body.result || !req.body.result.parameters) {
    return res.status(400).send('Bad Request')
  }

  // the value of Action from api.ai is stored in req.body.result.action
  console.log('* Received action -- %s', req.body.result.action)

  // parameters are stored in req.body.result.parameters
  var result = req.body.result
  var intentName = getIntentNameLowerCase(result)
  var webhookReply = ""
  var displayText = ""
  var followupEvent = null
  switch (intentName) {
    case "menu":
      console.log("received menu intent")
      var mealType = paramaterFor(result, "meal")
      var mealPreference = paramaterFor(result, "food-preference");
      console.log("meal: "+ mealType)
      console.log("preference: " + mealPreference)
      webhookReply = getMenu(mealPreference)
      displayText = webhookReply
      followupEvent = {
      "name": "take_order",
      "data": {}
         
      }
      break;
    case "checkin":
      webhookReply = "Hi,your checkin is successful. Checkin ID: " + (Math.floor(Math.random() * 100000));
      displayText = displayText
    case "welcome user":
      var userName = paramaterFor(result, "given-name");
      //webhookReply = 'Hello ' + userName + '! Welcome from the webhook.'
      webhookReply = "Hi, your have got " + (Math.floor(Math.random() * 10) % 6 + 1);
      displayText = webhookReply
      // the most basic response
      break
    default: break;
  }
  
  console.log(webhookReply)
  res.status(200).json({
    source: 'webhook',
    speech: webhookReply,
    displayText: webhookReply
  })





})

app.listen(app.get('port'), function () {
  console.log('* Webhook service is listening on port:' + app.get('port'))
})


function paramaterFor(result, parameterName) {
  return result.parameters[parameterName]
}
function getIntentNameLowerCase(result) {
  return result.metadata.intentName.toLowerCase()
}

function getMenu(mealPreference) {
  console.log("inside getMenu:" + mealPreference);
  switch(mealPreference) {
    case "veg":
        return getVegMeals().join(",")
    case "non-veg":
        return getNonVegMeals().join(",")
    case "eggetarian":
        return getEggMeals().join(",")
    default:
        return getVegMeals().concat(getNonVegMeals()).concat(getEggMeals()).join(",")
  }

}

function getVegMeals(){
  return ["paneer", "kofta"]
}

function getNonVegMeals() {
  return ["chicken salad", "lamb ghost"]

}

function getEggMeals() {
  return ["egg curry"]
}
