exports.createDelegate=function(anObject,aMethod){
   return function(){
        aMethod.apply(anObject,arguments);
   }

}
