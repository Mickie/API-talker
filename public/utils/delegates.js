exports.createDelegate=function(anObject,aMethod){
    return function(){
        aMethod.apply(anObject,arguments);
    }

}
exports.createExtendedDelegate = function(anObject, aMethod, anArgumentExtensionArray)
{
    return function()
    {
        var theArgsAsArray = Array.prototype.slice.call(arguments);
        var theNewArguments = theArgsAsArray.concat(anArgumentExtensionArray)
        return aMethod.apply(anObject, theNewArguments);
    };
}