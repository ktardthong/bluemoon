angular.module('App')
  .factory('Tags', function($firebaseArray, FirebaseUrl,FirebaseUrl,$http){
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
    arr: tags
  }
  return Tags;
})
