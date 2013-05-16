var http = require('http'),
    delegates = require('../utils/delegates'),
    handleJSON=require('../utils/handleJSON');

module.exports.callApiandGetResult=function(res)
{
    this.ResultArray=[];
    this.ResultObj={};
    this.res=res;

    this.handleRequestGetResponse=function(aUrl)
    {

        http.get(aUrl,
            delegates.createExtendedDelegate(this,
                handleJSON.handleJSON,
                [ delegates.createDelegate(this,this.handleMultipleRes)])
        )


    }
    this.handleMultipleRes=function(arrayOftheRes)
    {

        var lengthOfResArray=arrayOftheRes.length;

        for (var i=0;i<lengthOfResArray;i++) {

            this.ResultObj.type=arrayOftheRes[i].type;

            if (this.ResultObj.type=="url"){
                this.getUrlData(arrayOftheRes[i]);
            }

            else if(this.ResultObj.type=="tweet"){
                this.getTweetData(arrayOftheRes[i]);
            }

            else if (this.ResultObj.type=="instagram"){
                this.getInstagramData(arrayOftheRes[i]);
            }
            else if (this.ResultObj.type=="fb_post"){
                this.getFb_postData(arrayOftheRes[i]);
            }
            else if (this.ResultObj.type=="google_post"){
                this.getgoogle_postData(arrayOftheRes[i]);
            }
            else {
                this.getUnknownData(arrayOftheRes[i]);
            }

            this.ResultArray.push(JSON.stringify(this.ResultObj));
        }
        this.sendToRes();
    }

    this.sendToRes=function()
    {
        this.res.write(JSON.stringify(this.ResultArray));
        this.res.end();
    }

    this.getUrlData=function(anObject)
    {
        this.ResultObj.score=anObject.score;

        this.ResultObj.content=anObject.url+" "+anObject.title+"---"+anObject.type;
    }

    this.getTweetData=function(anObject)
    {
        this.ResultObj.score=anObject.score;

        var theUrlarray=(anObject.element.entities.urls);
        if (theUrlarray.length > 0 && theUrlarray[0] !== null){
            this.ResultObj.content=theUrlarray[0].url+ " "+anObject.element.text+"---"+anObject.type;
        }
        else{
            this.ResultObj.content=anObject.element.text+"---"+anObject.type;
        }
    }

    this.getInstagramData=function(anObject)
    {
        this.ResultObj.score=anObject.score;

        if (anObject.element.caption!==null){
            this.ResultObj.content=anObject.element.link+ " "+anObject.element.caption.text+"---"+anObject.type;
        }
        else{
            this.ResultObj.content=anObject.element.link+ "---"+anObject.type;
        }
    }
    this.getFb_postData=function(anObject)
    {
        this.ResultObj.score=anObject.score;
        if(anObject.element.hasOwnProperty("message")&&(anObject.element.message !==null)){
            if(anObject.element.hasOwnProperty("link")&&(anObject.element.link!==null)) {
               this.ResultObj.content=anObject.element.link+" "+anObject.element.message+"---"+anObject.type;
            }
            else{
                this.ResultObj.content=anObject.element.message +" ---"+anObject.type;
            }
        }
        else{
            this.ResultObj.content=anObject.element.link+" ---"+anObject.type;
        }

    }
    this.getgoogle_postData=function(anObject)
    {
        this.ResultObj.score=anObject.score;
        this.ResultObj.content=anObject.element.url+" "+anObject.element.title+"---"+anObject.type;
    }
    this.getUnknownData=function(anObject)
    {
        this.ResultObj.content="there is another type of content"+"---"+anObject.type;
        console.log("------------------"+anObject.type+"---------");
        console.log(anObject);
    }

}


