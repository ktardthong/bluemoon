angular.module('App')
  .controller('TopicCtrl', function($state,Topics,topicName){
    var topicCtrl = this;

    //Parsers
    topicCtrl.topicName = topicName;
    topicCtrl.topics = Topics;


  });
