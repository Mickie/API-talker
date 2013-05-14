var http = require('http'),
    delegates = require('../utils/delegates'),
    querryJSONapi=require('../utils/querryJSONapi');



exports.getResponse=function(req,res)
{
    this.ResultArray=[];
    this.ResultObj={};
    var TheTeam=req.query.team;
    var TheDay=req.query.day;
    var url = 'http://data.fanzo.me/top/tweets/'+TheTeam+'/'+TheDay; //  seattle-mariners

   //this.callApi=function(){
        http.get(url,function(res){

            querryJSONapi.handleJSONapi(res,function(theRes){
               this.handleMultipleRes(theRes)

            });

        })
   //}

    this.handleMultipleRes=function(arrayOftheRes){
        var lengthOfResArray=arrayOftheRes.length;
        console.log("get the response length of "+ lengthOfResArray);
        for (var i=0;i<lengthOfResArray;i++) {

                this.ResultObj.score=arrayOftheRes[i].score;
                this.ResultObj.type=arrayOftheRes[i].type;

                if (this.ResultObj.type=="url"){

                    this.ResultObj.content=arrayOftheRes[i].url+" "+arrayOftheRes[i].title+"---"+this.ResultObj.type;

                }

               else if(this.ResultObj.type=="tweet"){

                  var theUrlarray=(arrayOftheRes[i].element.entities.urls);
                  if (theUrlarray.length > 0 && theUrlarray[0] !== null){
                        this.ResultObj.content=theUrlarray[0].url+ " "+arrayOftheRes[i].element.text+"---"+this.ResultObj.type;
                      }
                  else{
                        this.ResultObj.content=arrayOftheRes[i].element.text+"---"+this.ResultObj.type;
                  }
                }

                else if (this.ResultObj.type=="instagram"){

                   if (arrayOftheRes[i].element.caption!==null){
                        this.ResultObj.content=arrayOftheRes[i].element.link+ " "+arrayOftheRes[i].element.caption.text+"---"+this.ResultObj.type;
                   }
                   else{
                        this.ResultObj.content=arrayOftheRes[i].element.link+ "---"+this.ResultObj.type;
                   }
               }
               else if (this.ResultObj.type=="fb_post"){
                       this.ResultObj.content=arrayOftheRes[i].element.link+" "+arrayOftheRes[i].element.message+"---"+this.ResultObj.type;
                }

                else {
                   this.ResultObj.content="there is another type of content";
              }

            this.ResultArray.push(JSON.stringify(this.ResultObj));
        }
        res.write(JSON.stringify(this.ResultArray));
        res.end();
    }


}

//module.exports = new getResponse();
