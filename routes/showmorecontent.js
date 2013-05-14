//connect to database
var helenus=require('helenus');
var theCassandraHosts = ['data.fanzo.me:9160'];
if (process.env.NODE_ENV == "production") {
    theCassandraHosts = ['uswcdb001:9160', 'uswcdb002:9160', 'uswcdb003:9160'];
}
var pool = new helenus.ConnectionPool({
    hosts: theCassandraHosts,
    keyspace: 'fanzo',
    timeout: 3000,
    cqlVersion: '3.0.0'
});

exports.morereports = function (req,res){

  //get the response and format the date
        var TheTeam=req.query.team;
        // example: Mon Mar 25 2013 10:55:51 GMT-0700 (PDT)
        var TheDate=req.query.date;

        //get the date string and convert to date object
        function DateFormat(aDateString){
            var Year=aDateString.substring(0,4) ;
            var Month=aDateString.substring(5,7);
            var NewMonth=Month-1;
            var Day=aDateString.substring(8,10) ;
            var FormattedDate=new Date(Year,NewMonth,Day);
            return FormattedDate;
        }


        // get the time of the selected date as a begindate and one day after as a enddate
        //format in UTC time, should select date of 7 hours ago from local time
        //e.x.to get a result for date May 21,local time should select from May 20 17:00(begindate) to May 21 17:00(enddate)
        var inputDate=DateFormat(TheDate).getTime();
        var begindate=new Date(inputDate-7*60*60*1000).getTime();
        console.log(begindate);
        var enddate=new Date( inputDate + 17*60*60*1000).getTime();
        console.log(enddate) ;



    var ResultOfUrl=[];
    var ResultOfIns=[];
    var ResultOfFb=[];
    var ReturnArray=[];
    var theSortTweetsByMins=[];


    pool.connect(function(err){


        if(err){
            throw(err);

        }
        else{

            DoCQLandShow();

        }

    })

    // querry cql of all there tables
    function DoCQLandShow(){

        selectUrl();
        selectIns();
        selectFb();

    }

    function selectUrl(){
        pool.cql("SELECT team_slug, url_time, url, score, title FROM urls_by_team_and_time Where team_slug =? AND url_time >= ? AND url_time < ?",[TheTeam, begindate, enddate],
            function(err,anArrayOfRows){
                DoIfError(err);
                getArray(anArrayOfRows,"title","url_time",ResultOfUrl);
                ReturnArray=ReturnArray.concat(ResultOfUrl);

            })
    }
    function selectIns(){
        pool.cql("SELECT team_slug, instagram_time, score, instagram FROM instagrams_by_team Where team_slug =? AND instagram_time >= ? AND instagram_time< ?",[TheTeam,begindate,enddate],
            function(err,anArrayOfRows){
                DoIfError(err);
                getArray(anArrayOfRows,"instagram","instagram_time",ResultOfIns);
                ReturnArray=ReturnArray.concat(ResultOfIns);

            })

    }
    function selectFb(){
        pool.cql("SELECT team_slug, fb_post_time, score, fb_post FROM fb_posts_by_team Where team_slug =? AND fb_post_time >= ? AND fb_post_time < ?",[TheTeam,begindate,enddate],
            function(err,anArrayOfRows){
                DoIfError(err);
                getArray(anArrayOfRows,"fb_post","fb_post_time",ResultOfFb);
                ReturnArray=ReturnArray.concat(ResultOfFb);
                ShowTheResult(res);

            })

    }

    //define error function
    function DoIfError(err){
        if (err)
        {
            console.log("ERROR FOUND!");
            console.log(err);

        }
    }

    //define function to get array for each table select output
    function getArray(anArrayOfRows,content,time,anReturnArray){
        anArrayOfRows.forEach(function (aRow)
        {

            theContentAndScore = {};
            theDataIwant = {};


            if(content=="title") {
               theContentAndScore.content=aRow.get(content).value+" "+aRow.get("url").value+" ---url";

            }

            if(content=="instagram"){
                var thecontent = JSON.parse(aRow.get(content).value);
                if (thecontent.caption!==null){
                var thecaption=thecontent.caption.text;
                theContentAndScore.content =  thecontent.link + " "+thecaption;
                }
                else{
                    theContentAndScore.content =  thecontent.link
                }

            }
            if(content=="fb_post"){
                var theMessage=JSON.parse(aRow.get(content).value);
                theContentAndScore.content =theMessage.message+" ---fb";
            }

            theContentAndScore.dateandtime= aRow.get(time).value;
            theContentAndScore.score= aRow.get("score").value;



            theDataIwant.score =  theContentAndScore.score;
            theDataIwant.dateandtime=theContentAndScore.dateandtime;
            //output should in UTC time(7 hours later)
            theDataIwant.hour=theContentAndScore.dateandtime.getUTCHours();
            theDataIwant.minute=theContentAndScore.dateandtime.getMinutes();
            theDataIwant.contentText=theContentAndScore.content;

            anReturnArray.push(theDataIwant);


        });
        console.log("complete returnArray");
    }




    function compare(a,b) {
        if (a.score < b.score)
            return 1;
        if (a.score > b.score)
            return -1;
        return 0;
    }

  //define function ShowResult
    function ShowTheResult(res)
    {
        console.log("start call function");
        var theTweetByMins=[];
        var JSONobj={};
        var JSONarray=[];

        //each hour should have 12 arrays, each array represents 5 minutes, total day should have 24*12 arrays
        for(j=0;j<24*12;j++) {


            var theTweetAtMin=[];
            var theCount=0;
            var theHourIndex=Math.floor(j/12);
            var theStartMin=(j*5)%60;
            var theEndMin=(j*5+4)%60;


            for(i=0;i<ReturnArray.length;i++){
                var theTweet={};
                var theMin=ReturnArray[i].hour*60+ReturnArray[i].minute;

                //get arrays based on its minutes range, the first array should get all tweets start from minute 0 to 4 , 4 is included.
                if(theMin/5<j+1 && theMin/5>=j)
                {


                    theTweet.score=ReturnArray[i].score;
                    theTweet.content=ReturnArray[i].contentText;
                    theTweet.dateandtime=ReturnArray[i].dateandtime;
                    theTweet.hour=ReturnArray[i].hour;
                    theTweet.startmin=theStartMin;
                    theTweet.endmin=theEndMin;
                    theTweetAtMin.push(theTweet);
                    theCount=theCount+1;


                }

            }
            //if find the tweets of it's minutes range
            if(theCount>0){
                theTweetByMins[j]=theTweetAtMin;
                console.log("the length of the list of hour "+theHourIndex+" between startMin "+theStartMin+" and EndMin "+theEndMin+" is " +theTweetByMins[j].length) ;
                //sort the array based on its scores
                theSortTweetsByMins[j]=theTweetByMins[j].sort(compare) ;
                console.log("the length of the sort list of hour "+theHourIndex+" between startMin "+theStartMin+" and EndMin "+theEndMin+" is " +theSortTweetsByMins[j].length) ;



                //get the first 25 tweets if more than 10 tweets
                if (theSortTweetsByMins[j].length>25)
                {
                    for(m=0;m<25;m++)
                    {
                        JSONobj.score = theSortTweetsByMins[j][m].score;
                        JSONobj.tweet = theSortTweetsByMins[j][m].content;
                        JSONobj.dateandtime = theSortTweetsByMins[j][m].dateandtime;
                        JSONobj.hour=theSortTweetsByMins[j][m].hour;
                        JSONobj.startmin=theSortTweetsByMins[j][m].startmin;
                        JSONobj.endmin=theSortTweetsByMins[j][m].endmin;
                        JSONarray.push(JSON.stringify(JSONobj));
                        console.log("the sort list of Hour at "+theHourIndex+" "+theSortTweetsByMins[j][m].score+" "+theSortTweetsByMins[j][m].content+" "+theSortTweetsByMins[j][m].dateandtime) ;

                    }
                }
                //if less than 25 tweets, get the tweets in its self length
                else {

                    for(m=0;m<theSortTweetsByMins[j].length;m++)
                    {

                        JSONobj.score = theSortTweetsByMins[j][m].score;
                        JSONobj.tweet = theSortTweetsByMins[j][m].content;
                        JSONobj.dateandtime = theSortTweetsByMins[j][m].dateandtime;
                        JSONobj.hour=theSortTweetsByMins[j][m].hour;
                        JSONobj.startmin=theSortTweetsByMins[j][m].startmin;
                        JSONobj.endmin=theSortTweetsByMins[j][m].endmin;
                        JSONarray.push(JSON.stringify(JSONobj));
                        console.log("the sort list of Hour at "+theHourIndex+" "+theSortTweetsByMins[j][m].score+" "+theSortTweetsByMins[j][m].content+" "+theSortTweetsByMins[j][m].dateandtime) ;

                    }
                }

            }
            //if no tweets at the minutes range
            else
            {
                JSONobj.score=0;
                JSONobj.tweet="No content";
                JSONobj.dateandtime = "";
                JSONobj.hour=theHourIndex;
                JSONobj.startmin=theStartMin;
                JSONobj.endmin=theEndMin;
                JSONarray.push(JSON.stringify(JSONobj));
                console.log("nothing at hour"+theHourIndex+" between "+theStartMin+" and "+theEndMin);


            }



        }

        res.write(JSON.stringify(JSONarray));
        res.end();


    }



}