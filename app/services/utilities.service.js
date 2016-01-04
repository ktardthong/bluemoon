angular.module('App')

  //Category list
  .factory('Category', function($firebaseObject, $firebaseArray, FirebaseUrl){
    var ref    = new Firebase(FirebaseUrl+'categories');
    var categories = $firebaseObject(ref);
    var topicArr = $firebaseArray(ref);

    var Category = {
      getName: function(slug){
        console.log(slug);
        console.log($firebaseObject(ref.child(slug)));
        var data = ref.child(slug);
        return $firebaseObject(data);
      },

      all: categories
    }
    return Category;
  })

  .factory('Languages', function($firebaseObject, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl+'languages/Language_feed/languages/');
    var lang = $firebaseObject(ref);

    return lang;
  });
