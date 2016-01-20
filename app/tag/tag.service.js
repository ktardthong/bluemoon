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
        return fb.child('tags/'+tag)
          .once('value', function(tagSnap) {
         return fb.child('topics')
              .orderByChild("tags")
              .equalTo(tag)
              .once('value', function(topicSnap) {
                var dataRet  = extend({}, tagSnap.val(), topicSnap.val());
                console.log(dataRet);
                return dataRet;
              });
          })
        console.log(dataRet);
      },

      arr: tags

    }
    return Tags;
  })
