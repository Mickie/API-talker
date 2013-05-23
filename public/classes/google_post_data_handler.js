module.exports.google_post_data_handler = function (){


    var ResultArray=[];

    this.getGoogle_postData=function(arrayOftheResponse)
    {
        var lengthOfResArray=arrayOftheResponse.length;

        for (var i=0;i<lengthOfResArray;i++)
        {
            if(arrayOftheResponse[i].type=="google_post")
            {
                this.getGoogle_postDataHelper(arrayOftheResponse[i]);
            }

        }
        return ResultArray;

    }

    this.getGoogle_postDataHelper=function(anObject){
        var ResultObj={};
        ResultObj.score=anObject.score;
        ResultObj.content=anObject.element.url+" "+anObject.element.title+"---"+anObject.type;
        ResultArray.push(JSON.stringify(ResultObj));
    }

}