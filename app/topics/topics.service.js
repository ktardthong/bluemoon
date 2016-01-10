angular.module('App')

  //Topic list
  .factory('Topics', function($firebaseObject, $firebaseArray , FirebaseUrl){
    var ref    = new Firebase(FirebaseUrl+'topics');
    var topics = $firebaseObject(ref);
    var topicsArr = $firebaseArray(ref);

    var topicKey = '';

    var Topics = {

      //Get topic slug
      getSlug:function(slug){
        var data = ref.orderByChild("slug").equalTo(slug);
        return $firebaseArray(data);
      },

      //Getting the list of topics created by user_id
      createdBy:function(uid){
        var data = ref.orderByChild("uid").equalTo(uid);
        return $firebaseObject(data);
      },

      //Getting the list of topic base on category
      list:function(category){
        var data = ref.orderByChild("category").equalTo(category);
        return $firebaseArray(data);
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

      getTopicBySlug:function(topic_slug){
        return $firebaseArray(ref.orderByChild("slug").equalTo(topic_slug).limitToFirst(1));
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

      //upvotes
      getUpvotes:function(topicId){
        return {
          ref:  ref.child(topicId+"/upvotes"),
          array: $firebaseArray(ref.child(topicId+"/upvotes"))
        }
      },

      //downvotes
      getDownvotes:function(topicId){
        return {
          ref:  ref.child(topicId+"/downvotes"),
          array: $firebaseArray(ref.child(topicId+"/downvotes"))
        }
      },

      upvoteTopic:function(topicId, uid){
        ref.child(topicId+"/upvotes").child(uid).set(moment().toISOString());
        return $firebaseObject(ref.child(topicId+"/upvotes").child(uid));
      },

      undoUpvote:function(topicId, uid){
        ref.child(topicId+"/upvotes").child(uid).remove(function(error){
            if (error) {
            console.log("Error:", error);
          } else {
            console.log("Removed successfully!");
          }});
        return ref.child(topicId+"/upvotes");
      },

      downvoteTopic:function(topicId, uid){
        ref.child(topicId+"/downvotes").child(uid).set(moment().toISOString());
        return $firebaseObject(ref.child(topicId+"/downvotes").child(uid));
      },

      undoDownvote:function(topicId, uid){
        ref.child(topicId+"/downvotes").child(uid).remove(function(error){
            if (error) {
            console.log("Error:", error);
          } else {
            console.log("Removed successfully!");
          }});
        return ref.child(topicId+"/downvotes");
      },

      getViews:function(topicId){
        return{
          ref: ref.child(topicId).child("views"),
          obj: $firebaseObject(ref.child(topicId).child("views")), 
        };
      },


      //Return array
      arr: $firebaseArray(ref),

      all: topics
    }

    return Topics;

  })

