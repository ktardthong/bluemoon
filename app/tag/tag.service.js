angular.module('App')
  .factory('Tags', function($firebaseArray, $firebaseObject, FirebaseUrl,FirebaseUrl,$http){

    var ref = new Firebase(FirebaseUrl+'tags');
    var tags = $firebaseArray(ref);

    var Tags = {

      addChild: function(childname){
        return ref.child(childname)
      },

      tagsUrl: function () {
        return $firebaseArray(ref);
      },

      getTagRef:function(tag){
        return ref.child(tag);
      },

      topicTags:function(tag){
        var fb = new Firebase(FirebaseUrl);
        var dataRet = '';

        fb.child('tags/'+tag)
          .on('child_added', function(tagSnap){
            fb.child('topics')
              .orderByChild("tags")
              .equalTo(tag)
              .on('child_added', function(topicSnap) {
                var dataRet =  extend({}, tagSnap.val(), topicSnap.val());
                console.log(dataRet);
              });
            })

        return dataRet;
      },

      arr: tags

    }
    return Tags;
  })
