angular.module('App')
  .controller('TagCtrl', function(Auth, Users, $state,$rootScope,
                                  //Resolve
                                  tagLanding,tagName) {

    var tagCtrl = this;
    tagCtrl.tagLanding  = tagLanding;
    tagCtrl.tagName     = tagName;

  });
