var generateHTML=function(TheData){

    var element=document.getElementById("content1");
    var NewUl=document.createElement("ul");
    element.appendChild(NewUl);
    var NewUlText=document.createTextNode(" "+TheData.length+" records");
    NewUl.appendChild(NewUlText);

    for(j=0;j<TheData.length;j++) {


        var AnObject=  JSON.parse(TheData[j]);
        var NewLi=document.createElement("li");
        var NewSpan=document.createElement("span") ;
        var NewLiScore=document.createTextNode(AnObject.score);
        var NewLiTweet=document.createTextNode(" "+AnObject.content);


        NewUl.appendChild(NewLi);
        NewSpan.appendChild(NewLiScore);
        NewLi.appendChild(NewSpan);
        NewLi.appendChild(NewLiTweet);


    }

}


