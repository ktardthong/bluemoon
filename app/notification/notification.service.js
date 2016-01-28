angular.module('App')

  .factory('NotiService', function($firebaseObject, $firebaseArray , FirebaseUrl){
    var ref    = new Firebase(FirebaseUrl+'notification');
    var noti = $firebaseObject(ref);

    var Notification = {

      unreadNotification:function(uid){
        var ref = new Firebase(FirebaseUrl+'notification/'+uid);
        console.log($firebaseObject(ref.orderByChild("is_read").equalTo("false")));
      },


      //Reset unread counter
      resetUnread:function(uid){
        var ref = new Firebase(FirebaseUrl+'notification/'+uid+'/unread');
        ref.set(0);
      },

      updateNotificationCount:function(uid){
        var ref = new Firebase(FirebaseUrl+'notification/'+uid+'/unread');
        ref.once("value", function(snapshot) {
          console.log(snapshot.val());
         if(snapshot.val() == 'null'){
           console.log('null')
            ref.set(1)
          }else{
           console.log('increment here')
            ref.set(snapshot.val() + 1);
          }
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });         s
      },

      addChild:function(child){
        return ref.child(child);
      },

      addArrChild:function(child){
        return $firebaseObject(ref.child(child));
      },

      arr: $firebaseArray(ref),
      all: noti
    }
    return Notification;
  })

