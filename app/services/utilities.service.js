angular.module('App')

  //Topic list
  .factory('Topics', function($firebaseObject, FirebaseUrl){
    var ref    = new Firebase(FirebaseUrl+'topics');
    var topics = $firebaseObject(ref);

    return topics;
  })

  .factory('Languages', function($firebaseObject, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl+'languages/Language_feed/languages/');
    var lang = $firebaseObject(ref);

    return lang;
  });
