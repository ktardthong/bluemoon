angular.module('App')

  .factory('NotiService', function($firebaseObject, $firebaseArray , FirebaseUrl,
                                   Users,$notification,$q){
    var ref    = new Firebase(FirebaseUrl+'notification');
    var noti = $firebaseObject(ref);
    var users = Users;

    console.log('noti service');

    var Notification = {

      //Display unread
      unreadNotification:function(uid){
        var ref = new Firebase(FirebaseUrl+'notification/'+uid+'/unread');
        var counter;
        var deferred = $q.defer();

        ref.once("value",function(snapshot){
          counter = snapshot.val();
          console.log(snapshot.val());

          if(counter > 0){
            $notification('New message from Qanya', {
              body: 'You have '+counter +' unread messages',
              dir: 'auto',
              lang: 'en',
              tag: 'my-tag',
              icon: 'http://www.cl.cam.ac.uk/research/srg/netos/images/qsense-logo.png',
              //delay: 1000, // in ms
              focusWindowOnClick: true // focus the window on click
            });
            deferred.resolve(counter);
          }
        });
        return deferred.promise;
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

      replyStatus:function(uid){
        $notification('New message from Qanya', {
          body: 'You have new message',
          dir: 'auto',
          lang: 'en',
          tag: 'my-tag',
          icon: 'http://www.cl.cam.ac.uk/research/srg/netos/images/qsense-logo.png',
          //delay: 1000, // in ms
          focusWindowOnClick: true // focus the window on click
        });
        return uid;
      },

      //Add detail for this notifictiaon
      notifyLog:function(topicId,uid,from_uid){
        console.log("uid "+uid);
        console.log("from uid "+ from_uid);
        var ref = new Firebase(FirebaseUrl+'notification/'+uid);
        ref.push().set({
          topicId:    topicId,
          from:       from_uid,
          is_read:    false,
          timestamp:  moment().toISOString()
        })

        Notification.replyStatus(uid);


      },


      //Reset unread counter
      resetUnread:function(uid){
        var ref = new Firebase(FirebaseUrl+'notification/'+uid+'/unread');
        ref.set(0);
      },


      //Update notification
      //@params uid - who this notification is going to
      updateNotificationCount:function(topicId,uid,from_uid){

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
        });

        //Add to log
        Notification.notifyLog(topicId,uid,from_uid);



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


    function notificationAlert(uid,head,body){
      var notification_ref = new Firebase(FirebaseUrl+'notification/'+uid);
      notification_ref.once("child_added",function(){
        $notification(head, {
          body: body,
          dir: 'auto',
          lang: 'en',
          tag: 'my-tag',
          icon: 'http://www.cl.cam.ac.uk/research/srg/netos/images/qsense-logo.png',
          //delay: 1000, // in ms
          focusWindowOnClick: true // focus the window on click
        });
      })
    }
  })

