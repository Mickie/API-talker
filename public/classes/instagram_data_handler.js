module.exports.instagram_data_handler = function ()
{


    var ResultArray=[];

    this.getInstagramData=function(arrayOftheResponse)
    {
        var lengthOfResArray=arrayOftheResponse.length;
        for (var i=0;i<lengthOfResArray;i++)
        {
            if(arrayOftheResponse[i].type=="instagram")
            {
                this.getInstagramDataHelper(arrayOftheResponse[i]);
            }

        }
        return ResultArray;
    }

    this.getInstagramDataHelper=function(anObject){
        var ResultObj={};
        ResultObj.score=anObject.score;

        if (anObject.element.caption!==null){
            ResultObj.content=anObject.element.link+ " "+anObject.element.caption.text+"---"+anObject.type;
        }
        else{
            ResultObj.content=anObject.element.link+ "---"+anObject.type;
        }

        ResultArray.push(JSON.stringify(ResultObj));
    }



}