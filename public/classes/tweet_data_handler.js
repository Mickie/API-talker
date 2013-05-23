module.exports.tweet_data_handler = function (){


    var ResultArray=[];

    this.getTweetData=function(arrayOftheResponse)
    {

        var lengthOfResArray=arrayOftheResponse.length;

        for (var i=0;i<lengthOfResArray;i++)
        {

            if(arrayOftheResponse[i].type=="tweet")
            {
                this.getTweetDataHelper(arrayOftheResponse[i]);
            }

        }
        return ResultArray;

    }

    this.getTweetDataHelper=function(anObject){
        var ResultObj={};
        ResultObj.score=anObject.score;

        var theUrlarray=(anObject.element.entities.urls);
        if (theUrlarray.length > 0 && theUrlarray[0] !== null){
            ResultObj.content=theUrlarray[0].url+ " "+anObject.element.text+"---"+anObject.type;
        }
        else{
            ResultObj.content=anObject.element.text+"---"+anObject.type;
        }

        ResultArray.push(JSON.stringify(ResultObj));
    }



}