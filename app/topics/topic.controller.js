angular.module('App')
  .controller('TopicCtrl', function($state,Category,cateName){
    var topicCtrl = this;

    //Parsers
    topicCtrl.cateName = cateName;
    topicCtrl.category = Category;

  });
