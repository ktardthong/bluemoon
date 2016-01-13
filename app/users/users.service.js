angular.module('App')
  .factory('Users', function ($firebaseArray, $firebaseObject, FirebaseUrl, $http) {
    var usersRef = new Firebase(FirebaseUrl + 'users')
    var users = $firebaseArray(usersRef)

    var Users = {
      getLocationIP: function () {
        return $http({
          url: 'http://ipinfo.io/json',
          method: 'GET'
        })
      },

      getLocationIPData: function () {
        return $http({
          url: 'http://ipinfo.io/json',
          method: 'GET'
        }).then(function (data) {
          return data.data
        })
      },

      profile: function(uid){
        return users.$getRecord(uid);
      },


      getProfileByUsername:function(username){
        return $firebaseArray(usersRef.orderByChild('displayName').equalTo(username));
      },

      getProfile: function (uid) {
        // console.log($firebaseObject(usersRef.child(uid)))
        return $firebaseObject(usersRef.child(uid))
      },

      getDisplayName: function (uid) {
        if (uid == null || uid === '') {
          return ''
        } else {
          return users.$getRecord(uid).displayName
        }
      },

      userRef: function (uid) {
        return usersRef.child(uid)
      },

      upvotes: function (uid) {
        return usersRef.child(uid).child('upvotes')
      },

      downvotes: function (uid) {
        return usersRef.child(uid).child('downvotes')
      },

      following: function (uid) {
        return usersRef.child(uid).child('following')
      },

      userArrRef: function (uid) {
        return usersRef.child(uid)
      },

      all: users
    }

    return Users
  })
