angular.module('App')

  //Topic list
  .factory('Topics', function($firebaseObject, $firebaseArray , FirebaseUrl){
    var ref    = new Firebase(FirebaseUrl+'topics');
    var topics = $firebaseObject(ref);
    var topicsArr = $firebaseArray(ref);

    var topicKey = '';

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

      //Return topic details in Ref
      fortopicRef: function(topic_slug){
        return  ref.orderByChild("slug").equalTo(topic_slug);
      },

      getKey:function(topic_slug){


      },

      incrementView: function(topic_slug){

      },

      //Return topic details in array
      fortopic: function(topic_slug){
        return $firebaseArray(Topics.fortopicRef(topic_slug));
      },

      //Reply listing
      replyList: function(topicId){
        var data = ref.child(topicId+"/replies");
        return $firebaseObject(data);
      },

      //Reply Array
      replyArr:function(topicId){
        return $firebaseArray(ref.child(topicId+"/replies"))
      },

      //Return array
      arr: $firebaseArray(ref),

      all: topics
    }

    return Topics;

  })

