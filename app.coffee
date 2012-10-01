express = require("express")
http    = require("http")
path    = require("path")
sys = require("util")
oauth = require("oauth")
twitter = require('ntwitter')
config = require('./config/config.js').config;

twit = new twitter
  consumer_key: config.twitterConsumerKey
  consumer_secret: config.twitterConsumerSecret
  access_token_key: config.twitterAccessKey
  access_token_secret: config.twitterAccessSecret

consumer = ->
  new oauth.OAuth("https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token", config.twitterConsumerKey, config.twitterConsumerSecret, "1.0A", "#{config.host}/sessions/callback", "HMAC-SHA1")

app = express.createServer()

app.configure ->
  app.set "port", process.env.PORT or config.port
  app.set "views", __dirname + "/views"
  app.set "view engine", "hbs"
  app.use express.favicon()
  app.use express.cookieParser()
  app.use express.session({ secret: 'blahblah' })
  app.use express.logger("dev")
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use app.router
  app.use express.static(path.join(__dirname, "public"))

app.dynamicHelpers messages: require('express-messages') 

app.dynamicHelpers session: (req, res) ->
  req.session

app.get "/", (req, res) ->
  if req.session.oauthRequestToken 
    twit.getListMembers config.twitterListID, '', (err, data) ->
      unless err 
        employees = data
        res.render 'index',
          locals:
            props: config.props
            title: 'say:thanks'
            employees: employees
  else 
    res.redirect '/login'

app.get "/success", (req, res) ->
  res.render 'success',
    locals:
      title: 'say:thanks'

app.post "/", (req, res) ->
  twit.updateStatus "@#{req.body.entry.to} Hey, #{config.props[req.body.entry.prop]}! For doing #{req.body.entry.body} - from @#{req.session.screen_name}", (err, data) ->
    unless err then res.redirect '/success'

app.get '/login', (req, res) ->
  res.render 'login',
    locals:
      title: 'login'

app.get "/entries", (req, res) ->

app.get "/sessions/connect", (req, res) ->
  consumer().getOAuthRequestToken (error, oauthToken, oauthTokenSecret, results) ->
    if error
      res.send "Error getting OAuth request token : " + sys.inspect(error), 500
    else
      req.session.oauthRequestToken = oauthToken
      req.session.oauthRequestTokenSecret = oauthTokenSecret
      res.redirect "https://twitter.com/oauth/authorize?oauth_token=" + req.session.oauthRequestToken

app.get "/sessions/callback", (req, res) ->
  sys.puts ">>" + req.session.oauthRequestToken
  sys.puts ">>" + req.session.oauthRequestTokenSecret
  sys.puts ">>" + req.query.oauth_verifier
  consumer().getOAuthAccessToken req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, (error, oauthAccessToken, oauthAccessTokenSecret, results) ->
    if error
      res.send "Error getting OAuth access token : " + sys.inspect(error) + "[" + oauthAccessToken + "]" + "[" + oauthAccessTokenSecret + "]" + "[" + sys.inspect(results) + "]", 500
    else
      req.session.oauthAccessToken = oauthAccessToken
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret
      
      consumer().get "http://twitter.com/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, (error, data, response) ->
        if error
          res.send "Error getting twitter screen name : " + sys.inspect(error), 500
        else
          data = JSON.parse(data)
          req.session.screen_name= data["screen_name"]
          req.flash "Logged in as #{data['name']}"
          res.redirect '/'

app.listen parseInt(process.env.PORT or config.port)