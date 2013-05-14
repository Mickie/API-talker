function update(){

    EmptyContent();

    var TeamSelected=document.getElementById("selectTeam");
    var TeamSelectedValue=TeamSelected.options[TeamSelected.selectedIndex].value;
    var DaySelected=document.getElementById("selectDay");
    var DaySelectedValue=DaySelected.options[DaySelected.selectedIndex].value;

    DisableButton();
    loadProgressBar();
    $.ajax({
        url: "/BaseballUrl",
        data: {

            team: TeamSelectedValue,
            day:  DaySelectedValue

        },error: function(){
            alert("an error happened");
            EnableButton();
            destroyProgressBar();
        },
        success: function( data ) {

            destroyProgressBar();
            var TheData=JSON.parse(data);
            generateHTML(TheData);
            EnableButton();

        }
    });

}

function EmptyContent(){
    var element=$( "#content1" );
    element.empty();
}
function DisableButton(){
    $("#button1").attr("disabled","disabled");
}
function EnableButton(){
    $("#button1").removeAttr("disabled");
}
function loadProgressBar(){

    $( "#progress1" ).progressbar({disabled:true,value: false});
    $( "#progress1" ).progressbar("option","disabled",false );

}

function destroyProgressBar(){

    $( "#progress1" ).progressbar( "option","disabled",true );
    $( "#progress1" ).progressbar( "destroy" );
}