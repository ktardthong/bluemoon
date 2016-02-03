angular.module('App')
  //Category list
  .factory('Category', function($firebaseObject, $firebaseArray, FirebaseUrl){
    var ref    = new Firebase(FirebaseUrl+'categories');
    var categories = $firebaseObject(ref);
    var topicArr = $firebaseArray(ref);

    console.log("Util category Service");

    var Category = {
      getName: function(slug){
        var data = ref.child(slug);
        return $firebaseObject(data);
      },

      all: categories
    }
    return Category;
  })


  //Languages
  .factory('Languages', function($firebaseArray, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl+'languages');
    var lang = $firebaseArray(ref);

    console.log("Util language");

    return lang;
  })


  //Languages
  .factory('Archive', function($firebaseArray, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl+'archive');
    var archive = $firebaseArray(ref);

    console.log("Util language");

    var Archive ={
      addChild: function(slug){
        return ref.child(slug);
      },
      ref: ref,
      arr: archive
    }
    return Archive;
  });
