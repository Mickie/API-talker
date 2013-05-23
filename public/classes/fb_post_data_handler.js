module.exports.fb_post_data_handler = function (){


    var ResultArray=[];

    this.getFb_postData=function(arrayOftheResponse)
    {
        var lengthOfResArray=arrayOftheResponse.length;

        for (var i=0;i<lengthOfResArray;i++)
        {
            if(arrayOftheResponse[i].type=="fb_post")
            {
                this.getFb_postDataHelper(arrayOftheResponse[i]);
            }

        }
        return ResultArray;

    }

    this.getFb_postDataHelper=function(anObject){
        var ResultObj={};
        ResultObj.score=anObject.score;
        if(anObject.element.hasOwnProperty("message")&&(anObject.element.message !==null)){
            if(anObject.element.hasOwnProperty("link")&&(anObject.element.link!==null)) {
                ResultObj.content=anObject.element.link+" "+anObject.element.message+"---"+anObject.type;
            }
            else{
                ResultObj.content=anObject.element.message +" ---"+anObject.type;
            }
        }
        else{
            ResultObj.content=anObject.element.link+" ---"+anObject.type;
        }
        ResultArray.push(JSON.stringify(ResultObj));
    }



}