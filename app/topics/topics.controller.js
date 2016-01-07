angular.module('App')
  .controller('TopicCtrl', function($state,$scope, $rootScope,Slug, Topics, Auth, Users){

    var topicCtrl = this;

    //Parser here
    topicCtrl.topics  = Topics;
    topicCtrl.auth    = Auth;
    topicCtrl.users = Users;

    if(topicCtrl.auth.ref.getAuth() != null ){
      topicCtrl.profile  = topicCtrl.users.getProfile(topicCtrl.auth.ref.getAuth().uid);
      topicCtrl.uid = topicCtrl.profile.$id;
      topicCtrl.userRef = topicCtrl.users.userRef(topicCtrl.uid);
      topicCtrl.upvotedTopics = topicCtrl.users.upvotes(topicCtrl.uid);
      topicCtrl.downvotedTopics = topicCtrl.users.downvotes(topicCtrl.uid);
    }
    else{
      topicCtrl.profile ='';
      topicCtrl.uid = '';
      topicCtrl.userRef = '';
    }

    topicCtrl.userName = function(userId){
      if(userId!= null){
        return topicCtrl.users.getDisplayName(userId);
      }
    }

    //
    topicCtrl.topic_landing = function(){

    }

    //Preset Parameters
    topicCtrl.imageStrings = [];


    //Upload Profile image
    topicCtrl.uploadFile = function(files) {
      angular.forEach(files, function (flowFile, i) {
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
          var uri = event.target.result;
          topicCtrl.imageStrings[i] = uri;
        };
        fileReader.readAsDataURL(flowFile.file);
      })
    };

    //Reply to topic
    topicCtrl.reply = function(topicId){
      console.log(topicId);
      topicCtrl.topics.replyArr(topicId).$add({
        topicId:  topicId,
        body:     topicCtrl.newReply.body,
        uid:      topicCtrl.uid,
        created:  moment().format("MM-DD-YYYY hh:mm:ss")
      })
    }

    //Create new topic
    topicCtrl.createTopic = function(category){

      topicCtrl.topics.arr.$add({
          topic:    topicCtrl.newTopic.topic,
          body:     topicCtrl.newTopic.body,
          category: category,
          uid:      topicCtrl.uid,
          slug:     Slug.slugify(topicCtrl.newTopic.topic),
          photos:   topicCtrl.imageStrings,
          created:  moment().format("MM-DD-YYYY h:m:s")
        }).then(function(){
        topicCtrl.newTopic = {
          body: ''
        };
      });
    };

     //upvote
     topicCtrl.isUpvoted = function(topicId){
        if(topicCtrl.profile ==''){
          return false
        }
        else{
          topicCtrl.upvotedTopics.child(topicId).once('value', function(snapshot) {
          return (snapshot.val() !== null);
        });
        }
     };

    topicCtrl.upvote = function(topicId){
      console.log(topicId+' '+ topicCtrl.uid + ' upvotes');

      topicCtrl.upvotedTopics.child(topicId).set(true);
      // topicCtrl.isUpvoted = !topicCtrl.isUpvoted;

      // topicCtrl.topics.upvotes(topicId).push(topicCtrl.uid).set(moment().format("MM-DD-YYYY hh:mm:ss")
      // );
      
      // topicCtrl.topics.downvotes(topicId).child(topicCtrl.uid).remove(function(error){
      //       if (error) {
      //       console.log("Error:", error);
      //     } else {
      //       console.log("Removed successfully!");
      //     }
      //   });
    };

    //downvote
    topicCtrl.isDownvoted = function(topicId){

      if(topicCtrl.profile ==''){
          return false
        }
        else{
        topicCtrl.downvotedTopics.child(topicId).once('value', function(snapshot) {
            return (snapshot.val() !== null);
          });
      }

    };

    topicCtrl.downvote = function(topicId){
      console.log(topicId+' '+ topicCtrl.uid + ' downvotes');

      topicCtrl.downvotedTopics.child(topicId).set(true);
      // topicCtrl.isDownvoted = !topicCtrl.isDownvoted;
      // topicCtrl.topics.downvotes(topicId).push(topicCtrl.uid).set(
      //   moment().format("MM-DD-YYYY hh:mm:ss")
      // );
      
      // topicCtrl.topics.upvotes(topicId).child(topicCtrl.uid).remove(function(error){
      //       if (error) {
      //       console.log("Error:", error);
      //     } else {
      //       console.log("Removed successfully!");
      //     }
      //   });
      
    };

  });
