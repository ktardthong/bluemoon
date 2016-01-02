angular.module('App')

  //Topic list
  .factory('Topics', function($firebaseObject, $firebaseArray, FirebaseUrl){
    var ref    = new Firebase(FirebaseUrl+'topics');
    var topics = $firebaseObject(ref);
    var topicArr = $firebaseArray(ref);

    var Topics = {
      getName: function(slug){
        console.log(slug);
        console.log(topicArr.$getRecord(slug).name);
        return topics.$getRecord(slug).name;
      },
      all: topics
    }
    return Topics;
  })

  .factory('Languages', function($firebaseObject, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl+'languages/Language_feed/languages/');
    var lang = $firebaseObject(ref);

    return lang;
  });
