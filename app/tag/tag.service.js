angular.module('App')
  .factory('Tags', function($firebaseArray, $firebaseObject, FirebaseUrl, $q){

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

      getTagObject:function(tag){
        return $firebaseObject(ref.child(tag))
      },

      topicTags:function(tag){
        var deferred = $q.defer();

        var fb = new Firebase(FirebaseUrl);
        var dataRet = '';

        return fb.child('tags/'+tag)
          .on('child_added', function(tagSnap){
            fb.child('topics')
              .orderByChild("tags")
              .equalTo(tag)
              .on('child_added', function(topicSnap) {
                deferred.resolve();
                //show( extend({}, tagSnap.val(), topicSnap.val()) );
                return extend({}, tagSnap.val(), topicSnap.val());
                //console.log(dataRet);
              });
            })
      },

      arr: tags

    }
    return Tags;
  })
