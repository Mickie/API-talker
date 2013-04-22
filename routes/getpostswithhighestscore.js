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

 exports.fetchResults = function (req,res){
     var TheTeam=req.query.team;
     var TheDate=req.query.date;

     // example: Mon Mar 25 2013 10:55:51 GMT-0700 (PDT)

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
     var theSortTweetsByHours=[];



     pool.on('error', function(err){
         console.error(err.name, err.message);
         console.log("nnnnn");
         res.write(err.name+err.message);
     });

     pool.connect(function(err){

         if(err){
             throw(err);

             return;
         }


         else {
             pool.cql("select team_slug, tweet_time, tweet_id, score, tweet, username from tweets_by_team where team_slug = ? AND tweet_time >= ? AND tweet_time < ?", [TheTeam, begindate, enddate],  function(err, anArrayOfRows)
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

         var theTweetByHours=[];

         var JSONobj={};
         var JSONarray=[];


         for(j=0;j<24;j++) {


             var theTweetAtHour=[];
             var theCount=0;


             for(i=0;i<theTweetsToReturn.length;i++){
                 var theTweet={};



                 if(theTweetsToReturn[i].hour==j)
                 {


                     theTweet.score=theTweetsToReturn[i].score;
                     theTweet.tweet=theTweetsToReturn[i].tweetText;
                     theTweet.dateandtime=theTweetsToReturn[i].dateandtime;
                   theTweet.hour=j;
                    theTweetAtHour.push(theTweet);
                   theCount=theCount+1;


                 }

             }
             //if find the tweets at j hour
             if(theCount>0){
                 theTweetByHours[j]=theTweetAtHour;

                 console.log("the length of the list of hour"+j+" "+theTweetByHours[j].length) ;

                 theSortTweetsByHours[j]=theTweetByHours[j].sort(compare) ;
                 console.log("the length of the  sort list of hour"+j+" "+theSortTweetsByHours[j].length) ;



                 //get the first 10 tweets if more than 10 tweets
                 if (theSortTweetsByHours[j].length>10)
                 {
                     for(m=0;m<10;m++)
                     {
                         JSONobj.score = theSortTweetsByHours[j][m].score;
                         JSONobj.tweet = theSortTweetsByHours[j][m].tweet;
                         JSONobj.hour=theSortTweetsByHours[j][m].hour;
                         JSONarray.push(JSON.stringify(JSONobj));

                         console.log("the sort list of Hour at "+j+" "+theSortTweetsByHours[j][m].score+" "+theSortTweetsByHours[j][m].tweet+" "+theSortTweetsByHours[j][m].dateandtime) ;

                     }
                 }
                 //if less than 10 tweets, get the tweets in its self length
                 else {

                     for(m=0;m<theSortTweetsByHours[j].length;m++)
                     {

                         JSONobj.score = theSortTweetsByHours[j][m].score;
                         JSONobj.tweet = theSortTweetsByHours[j][m].tweet;
                         JSONobj.hour=theSortTweetsByHours[j][m].hour;
                         JSONarray.push(JSON.stringify(JSONobj));

                         console.log("the sort list of Hour at "+j+" "+theSortTweetsByHours[j][m].score+" "+theSortTweetsByHours[j][m].tweet+" "+theSortTweetsByHours[j][m].dateandtime) ;

                     }
                 }



             }
             //if no tweets at j hour
             else
             {
                 JSONobj.score=0;
                 JSONobj.tweet="No tweets";
                 JSONobj.hour=j;
                 JSONarray.push(JSON.stringify(JSONobj));

                 console.log("nothing at hour"+j);


             }



         }

         res.write(JSON.stringify(JSONarray));
         res.end();


     }


 }





















