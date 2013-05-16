var http = require('http'),
    callApiandGetResult=require('./callApiandGetResult');

var APIHandler = function(){
    this.myRequest;
    this.myResponse;

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
       myRes=this.myResponse;
       if(type="Baseball")
       {
           var TheTeam=this.myRequest.query.team;
           var TheDay=this.myRequest.query.day;
           var url = 'http://data.fanzo.me/top/tweets/'+TheTeam+'/'+TheDay;
           console.log("try to grab the  data for "+type+" team: "+TheTeam+" of "+TheDay+" days back");
           this.callApiandGetResult = new callApiandGetResult.callApiandGetResult(myRes);
           this.callApiandGetResult.handleRequestGetResponse(url);
       }
   }
}

module.exports = new APIHandler();

//exports.grabBaseballReport=function(req,res)
//{
//    var TheTeam=this.myRequest.query.team;
//    var TheDay=req.query.day;
//    var url = 'http://data.fanzo.me/top/tweets/'+TheTeam+'/'+TheDay; //  seattle-mariners
//    console.log("try to grab the  data for team: "+TheTeam+" of "+TheDay+" days back");
//    this.callApiandGetResult = new callApiandGetResult.callApiandGetResult(res);
//    this.callApiandGetResult.handleRequestGetResponse(url);
//}





