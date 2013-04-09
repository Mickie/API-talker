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

exports.test = function (req,res){
    var TheTeam=req.query.team;
    // example: Mon Mar 25 2013 10:55:51 GMT-0700 (PDT)
    var TheDate=req.query.date;


    //define teams
    var TheTeamOfMarchMadness = "('louisville-cardinals--2', 'oregon-ducks--2','michigan-state-spartans--2', 'duke-blue-devils--2', 'wichita-state-shockers'," +
        "'la-salle-explorers','arizona-wildcats--2','ohio-state-buckeyes--2','kansas-jayhawks--2', 'michigan-wolverines--2', 'florida-gators--2'," +
        " 'florida-gulf-coast-eagles','indiana-hoosiers--2','syracuse-orange--2','marquette-golden-eagles', 'miami-hurricanes--2','fanzo-founders')" ;
    if (TheTeam == "MarchMadness"){
        var teams=TheTeamOfMarchMadness;
    }




    //create date objects
    function DateFormat(aDateString){
        var Year=aDateString.substring(0,4) ;
        var Month=aDateString.substring(5,7);
        var NewMonth=Month-1;
        var Day=aDateString.substring(8,10) ;
        var FormattedDate=new Date(Year,NewMonth,Day);
        return FormattedDate;
    }



    var begindate=DateFormat(TheDate).getTime() ;
    console.log(begindate);

    var enddate=new Date( begindate + 24*60*60*1000).getTime();
    console.log(enddate) ;

    var theTweetsToReturn = [];
    var theSortTweetsByMins=[];



    pool.on('error', function(err){
        console.error(err.name, err.message);

        res.write(err.name+err.message);
    });

    pool.connect(function(err){

        if(err){
            throw(err);

            return;
        }


        else {
            pool.cql("select team_slug, tweet_time, tweet_id, score, tweet, username from tweets_by_team where team_slug IN"+teams+" AND tweet_time >= ? AND tweet_time < ?", [begindate, enddate],  function(err, anArrayOfRows)
            {

                if (err)
                {
                    console.log("ERROR FOUND!");
                    console.log(err);

                    return;
                }

                function isBadDataFromBustedMigration(aTweet)
                {
                    return aTweet == "[object Object]";
                }





                anArrayOfRows.forEach(function (aRow)
                {
                    if (isBadDataFromBustedMigration(aRow.get("tweet").value)) {

                        return;
                    }

                    theTweetAndScore = {};
                    theDataIwant = {};

                    theTweetAndScore.tweet = JSON.parse(aRow.get("tweet").value);
                    theTweetAndScore.dateandtime= aRow.get("tweet_time").value;
                    theTweetAndScore.score= aRow.get("score").value;

                    if(theTweetAndScore.tweet!==null){theDataIwant.tweetText =  theTweetAndScore.tweet.text;}
                    else{theDataIwant.tweetText="no text of null content";}

                    theDataIwant.score =  theTweetAndScore.score;
                    theDataIwant.dateandtime=theTweetAndScore.dateandtime;
                    theDataIwant.hour=theTweetAndScore.dateandtime.getHours();
                    theDataIwant.minute=theTweetAndScore.dateandtime.getMinutes();
                    theTweetsToReturn.push(theDataIwant);



                });

                ShowTheResult(res);
            })

        }

    })


    function compare(a,b) {
        if (a.score < b.score)
            return 1;
        if (a.score > b.score)
            return -1;
        return 0;
    }

    function ShowTheResult(res)
    {

        var theTweetByMins=[];

        var JSONobj={};
        var JSONarray=[];

        //each hour should have 12 arrays based on mins
        for(j=0;j<24*12;j++) {


            var theTweetAtMin=[];
            var theCount=0;
            var theHourIndex=Math.floor(j/12);
            var theStartMin=(j*5)%60;
            var theEndMin=(j*5+4)%60;


            for(i=0;i<theTweetsToReturn.length;i++){
                var theTweet={};
                var theMin=theTweetsToReturn[i].hour*60+theTweetsToReturn[i].minute;


                if(theMin/5<j+1 && theMin/5>=j)
                {


                    theTweet.score=theTweetsToReturn[i].score;
                    theTweet.tweet=theTweetsToReturn[i].tweetText;
                    theTweet.dateandtime=theTweetsToReturn[i].dateandtime;
                    theTweet.hour=theTweetsToReturn[i].hour;
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

                theSortTweetsByMins[j]=theTweetByMins[j].sort(compare) ;
                console.log("the length of the sort list of hour "+theHourIndex+" between startMin "+theStartMin+" and EndMin "+theEndMin+" is " +theSortTweetsByMins[j].length) ;



                //get the first 10 tweets if more than 10 tweets
                if (theSortTweetsByMins[j].length>10)
                {
                    for(m=0;m<10;m++)
                    {
                        JSONobj.score = theSortTweetsByMins[j][m].score;
                        JSONobj.tweet = theSortTweetsByMins[j][m].tweet;
                        JSONobj.dateandtime = theSortTweetsByMins[j][m].dateandtime;
                        JSONobj.hour=theSortTweetsByMins[j][m].hour;
                        JSONobj.startmin=theSortTweetsByMins[j][m].startmin;
                        JSONobj.endmin=theSortTweetsByMins[j][m].endmin;
                        JSONarray.push(JSON.stringify(JSONobj));

                        console.log("the sort list of Hour at "+theHourIndex+" "+theSortTweetsByMins[j][m].score+" "+theSortTweetsByMins[j][m].tweet+" "+theSortTweetsByMins[j][m].dateandtime) ;

                    }
                }
                //if less than 10 tweets, get the tweets in its self length
                else {

                    for(m=0;m<theSortTweetsByMins[j].length;m++)
                    {

                        JSONobj.score = theSortTweetsByMins[j][m].score;
                        JSONobj.tweet = theSortTweetsByMins[j][m].tweet;
                        JSONobj.dateandtime = theSortTweetsByMins[j][m].dateandtime;
                        JSONobj.hour=theSortTweetsByMins[j][m].hour;
                        JSONobj.startmin=theSortTweetsByMins[j][m].startmin;
                        JSONobj.endmin=theSortTweetsByMins[j][m].endmin;
                        JSONarray.push(JSON.stringify(JSONobj));

                        console.log("the sort list of Hour at "+theHourIndex+" "+theSortTweetsByMins[j][m].score+" "+theSortTweetsByMins[j][m].tweet+" "+theSortTweetsByMins[j][m].dateandtime) ;

                    }
                }



            }
            //if no tweets at j hour
            else
            {
                JSONobj.score=0;
                JSONobj.tweet="No tweets";
                JSONobj.dateandtime = "";
                JSONobj.hour=theHourIndex;
                JSONobj.startmin=theStartMin;
                JSONobj.endmin=theEndMin;
                JSONarray.push(JSON.stringify(JSONobj));

                console.log("nothing at hour"+theHourIndex);


            }



        }

        res.write(JSON.stringify(JSONarray));
        res.end();


    }


}


