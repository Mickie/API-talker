var http = require('http'),
    delegates = require('../utils/delegates'),
    TeamHistoryApiManager=require('./TeamHistoryApiManager'),
    url_data_handler=require('./url_data_handler'),
    tweet_data_handler=require('./tweet_data_handler'),
    instagram_data_handler=require('./instagram_data_handler'),
    fb_post_data_handler= require('./fb_post_data_handler'),
    google_post_data_handler= require('./google_post_data_handler');

var APIHandler = function(){
    this.myRequest;
    this.myResponse;
    this.totalData=[];
    this.TeamHistoryApiManager=new TeamHistoryApiManager.TeamHistoryApiManager();
    this.url_data_handler= new url_data_handler.url_data_handler();
    this.tweet_data_handler= new tweet_data_handler.tweet_data_handler();
    this.instagram_data_handler= new instagram_data_handler.instagram_data_handler();
    this.fb_post_data_handler= new fb_post_data_handler.fb_post_data_handler();
    this.google_post_data_handler= new google_post_data_handler.google_post_data_handler();

    this.init = function(aRequest, aResponse)
    {
        this.myRequest = aRequest;
        this.myResponse=aResponse;

    }

    this.grabBaseballReport = function()
    {
        this.getReport("Baseball");
    }

    this.getReport = function(type)
    {

        if(type=="Baseball")
        {
            var TheTeam=this.myRequest.query.team;
            var TheDay=this.myRequest.query.day;
            var url = 'http://data.fanzo.me/top/tweets/'+TheTeam+'/'+TheDay;
            console.log("try to grab the  data for "+type+" team: "+TheTeam+" of "+TheDay+" days back");
            this.TeamHistoryApiManager.loadTeamHistoryApi(url,delegates.createDelegate(this, this.onApiLoadingIsReady));

        }


    }

    this.onApiLoadingIsReady=function(arrayOftheResponse){
     var theUrlArray= this.url_data_handler.getUrlData(arrayOftheResponse);
     var theTweetArray=  this.tweet_data_handler.getTweetData(arrayOftheResponse);
     var theInstagramArray = this.instagram_data_handler.getInstagramData(arrayOftheResponse);
     var theFbArray=  this.fb_post_data_handler.getFb_postData(arrayOftheResponse);
     var theGoogleArray=  this.google_post_data_handler.getGoogle_postData(arrayOftheResponse);
     this.totalData= (theUrlArray).concat(theTweetArray).concat(theInstagramArray).concat(theFbArray).concat(theGoogleArray);
     this.sendToRes();

    }

    this.sendToRes=function(){
        this.myResponse.write(JSON.stringify(this.totalData));
        this.myResponse.end();
    }
}

module.exports = new APIHandler();