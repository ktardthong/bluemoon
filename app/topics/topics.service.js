angular.module('App')

  //Topic list
  .factory('Topics', function($firebaseObject, $firebaseArray , FirebaseUrl){
    var ref    = new Firebase(FirebaseUrl+'topics');
    var topics = $firebaseObject(ref);

    var Topics = {

      //Getting the list of topic base on category
      list:function(category){
        var data = ref.orderByChild("category").equalTo(category);
        return $firebaseObject(data);
      },

      name: function(topic_slug){
        var data = ref.orderByChild("slug").equalTo(topic_slug);
        return $firebaseObject(data);
      },

      fortopic: function(topic_slug){
        var data = ref.orderByChild("slug").equalTo(topic_slug);
        return $firebaseObject(data);
      },

      //Return array
      arr: $firebaseArray(ref),

      all: topics
    }

    return Topics;

  })

