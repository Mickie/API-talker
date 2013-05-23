var  http = require('http'),
    delegates = require('../utils/delegates'),
    handleJSON=require('../utils/handleJSON');

module.exports.TeamHistoryApiManager = function ()
{

    this.myCallbackFunction;

    this.loadTeamHistoryApi=function(aTeamUrl,aCallbackFunction){
        this.myCallbackFunction=aCallbackFunction;

        http.get(aTeamUrl,
            delegates.createExtendedDelegate(this,
                handleJSON.handleJSON,
                [ delegates.createDelegate(this,this.onApiLoadingIsReady)])
        )
    }

    this.onApiLoadingIsReady=function(arrayOftheRes){

      console.log("the team api loading is ready ,length is "+arrayOftheRes.length);
      this.myCallbackFunction(arrayOftheRes);

    }



}