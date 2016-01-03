angular.module('App')
  .controller('CateCtrl', function($state,Category,topicName){
    var cateCtrl = this;

    //Parsers
    cateCtrl.topicName = topicName;
    cateCtrl.topics = Topics;

  });
