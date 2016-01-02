angular.module('App')

  //Topic list
  .factory('Post', function($firebaseObject, FirebaseUrl){
    var ref    = new Firebase(FirebaseUrl+'topics');
    var topics = $firebaseObject(ref);

    var TS = {
      topicName: function(topic_slug){
        var data = ref.orderByChild("slug").equalTo(topic_slug);
        console.log(data);
        return $firebaseObject(data);
      },
      fortopic: function(topic_slug){
        return $firebaseObject(usersRef.child(uid));
      },
      all:topics
    }
    return TS;
  })

