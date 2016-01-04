angular.module('App')
  .controller('HomeCtrl', function($state,Category){
    var homeCtrl = this;

    homeCtrl.topics = Category;
  });
