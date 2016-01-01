angular.module('App')
  .controller('HomeCtrl', function($state,Topics){
    var homeCtrl = this;

    homeCtrl.topics = Topics;
  });
