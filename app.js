
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  ,apiHandler=require('./public/classes/APIHandler')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3002);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var theDelegate = function(req,res)
{
    apiHandler.init(req, res);
    apiHandler. grabBaseballReport();

}
app.get("/BaseballUrl",theDelegate)