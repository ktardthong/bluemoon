angular.module('App')
  .factory('Users', function($firebaseArray, $firebaseObject, FirebaseUrl){
    var usersRef = new Firebase(FirebaseUrl+'users');
    var users = $firebaseArray(usersRef);

    var Users = {
      getProfile: function(uid){
        //console.log($firebaseObject(usersRef.child(uid)));
        return $firebaseObject(usersRef.child(uid));
      },
      getDisplayName: function(uid){
        return users.$getRecord(uid).displayName;
      },

      userRef: function(uid){
        return usersRef.child(uid);
      },

      upvotes: function(uid){
        return usersRef.child(uid).child('upvotes');
      },

      downvotes: function(uid){
        return usersRef.child(uid).child('downvotes');
      },

      userArrRef:function(uid){
        return usersRef.child(uid);
      },
      
      all: users
    };

    return Users;

  });
