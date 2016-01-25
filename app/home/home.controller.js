angular.module('App')
  .controller('HomeCtrl', function($state,Category,Topics,feed){
    var homeCtrl = this;

    homeCtrl.topics = Category;
    homeCtrl.topics = Topics;
    homeCtrl.feed   = feed;
  });
