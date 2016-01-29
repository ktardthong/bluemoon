angular.module('App')

  .factory('NotiService', function($firebaseObject, $firebaseArray , FirebaseUrl, Users){
    var ref    = new Firebase(FirebaseUrl+'notification');
    var noti = $firebaseObject(ref);
    var users = Users;

    var Notification = {

      unreadNotification:function(uid){
        var ref = new Firebase(FirebaseUrl+'notification/'+uid);
        console.log($firebaseObject(ref.orderByChild("is_read").equalTo("false")));
      },

      //Notify followers
      notifyFollower:function(topicId,uid){
        var ref = users.getFollower(uid);
        ref.once("value", function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            //update notification and details
            Notification.updateNotificationCount(topicId,childSnapshot.key());
          })
        })
      },

      //Add detail for this notifictiaon
      notifyLog:function(topicId,uid){
        Notification.addChild(uid).push().set({
          topicId:    topicId,
          from:       uid,
          is_read:    false,
          timestamp:  moment().toISOString()
        });
      },


      //Reset unread counter
      resetUnread:function(uid){
        var ref = new Firebase(FirebaseUrl+'notification/'+uid+'/unread');
        ref.set(0);
      },


      //Update notification
      //@params uid - who this notification is going to
      updateNotificationCount:function(topicId,uid){
        console.log(">>>" + uid);
        var ref = new Firebase(FirebaseUrl+'notification/'+uid+'/unread');
        ref.once("value", function(snapshot) {
          //default unread is 1
         if(snapshot.val() == 'null'){
            ref.set(1)
          }else{
            ref.set(snapshot.val() + 1);
          }
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        }).then(function(){
          //Add to log
          Notification.notifyLog(topicId,uid);
        });
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

