
exports.handleJSON=function(res, aCallback){

    console.log(aCallback);
    var body = '';

    res.on('data', function(chunk) {
        body += chunk;
    });

    res.on('end', function() {
       var theResponse = JSON.parse(body)
       console.log("Got response, length is  "+theResponse.length);
       return aCallback(theResponse);
    });

    res.on('error', function(e) {
        console.log("Got error: " + e.message);
    });

}





