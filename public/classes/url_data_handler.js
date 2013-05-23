module.exports.url_data_handler = function (){


        var ResultArray=[];

         this.getUrlData=function(arrayOftheResponse)
         {
             var lengthOfResArray=arrayOftheResponse.length;

             for (var i=0;i<lengthOfResArray;i++)
             {
                  if(arrayOftheResponse[i].type=="url")
                  {
                    this.getUrlDataHelper(arrayOftheResponse[i]);
                  }

             }
             return ResultArray;
         }

         this.getUrlDataHelper=function(anObject){
             var ResultObj={};
             ResultObj.score=anObject.score;
             ResultObj.content=anObject.url+" "+anObject.title+"---"+anObject.type;
             ResultArray.push(JSON.stringify(ResultObj));
         }



}