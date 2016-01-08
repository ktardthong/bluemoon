angular.module('App')
  .controller('TopicCtrl', function($state,$scope,$rootScope, $mdDialog, $mdMedia, Topics, Auth, Users, Slug){

    var topicCtrl = this;
    //Parser here
    topicCtrl.topics  = Topics;
    topicCtrl.auth    = Auth;
    topicCtrl.users = Users;

    if(topicCtrl.auth.ref.getAuth() != null ){
      topicCtrl.profile  = topicCtrl.users.getProfile(topicCtrl.auth.ref.getAuth().uid);
      topicCtrl.uid = topicCtrl.profile.$id;
      topicCtrl.userRef = topicCtrl.users.userRef(topicCtrl.uid);
      topicCtrl.userUpvotedTopics = topicCtrl.users.upvotes(topicCtrl.uid);
      topicCtrl.userDownvotedTopics = topicCtrl.users.downvotes(topicCtrl.uid);
    }
    else{
      topicCtrl.profile ='';
      topicCtrl.uid = '';
      topicCtrl.userRef = '';
    }

    console.log($scope.topics);

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

    topicCtrl.showConfirm = function(ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
        .title('Would you like to delete your debt?')
        .textContent('All of the banks have agreed to forgive you your debts.')
        .ariaLabel('Lucky day')
        .targetEvent(ev)
        .ok('Please do it!')
        .cancel('Sounds like a scam');
      $mdDialog.show(confirm).then(function() {
        $scope.status = 'You decided to get rid of your debt.';
      }, function() {
        $scope.status = 'You decided to keep your debt.';
      });
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
          slug:     Slug.slugify(newTopic.topic),
          photos:   topicCtrl.imageStrings,
          created:  moment().format("MM-DD-YYYY hh:mm:ss")
        }).then(function(){
        topicCtrl.newTopic = {
          body: ''
        };
      });
    };

     //upvote
    topicCtrl.upvote = function(topic){
      console.log(topic.$id +' '+ topicCtrl.uid + ' upvotes');

      if(topic.downvotes != undefined && topic.downvotes[topicCtrl.uid] != undefined){
        topicCtrl.cancelDownvote(topic);
      }
      
      topicCtrl.topics.upvoteTopic(topic.$id, topicCtrl.uid).$loaded().then(function(value){
        topicCtrl.userUpvotedTopics.child(topic.$id).set(value.$value);
      });
    };

    topicCtrl.cancelUpvote = function(topic){
      topicCtrl.topics.undoUpvote(topic.$id, topicCtrl.uid);
      topicCtrl.userUpvotedTopics.child(topic.$id).remove(function(error){
            if (error) {
            console.log("Error:", error);
          } else {
            console.log("Removed successfully!");
          }});
    };

    //downvote
    topicCtrl.downvote = function(topic){
      console.log(topic.$id+' '+ topicCtrl.uid + ' downvotes');

      if(topic.upvotes != undefined && topic.upvotes[topicCtrl.uid] != undefined){
        topicCtrl.cancelUpvote(topic);
      }

      topicCtrl.topics.downvoteTopic(topic.$id, topicCtrl.uid).$loaded().then(function(value){
        topicCtrl.userDownvotedTopics.child(topic.$id).set(value.$value);
      });
    };

    topicCtrl.cancelDownvote = function(topic){
      topicCtrl.topics.undoDownvote(topic.$id, topicCtrl.uid);
      topicCtrl.userDownvotedTopics.child(topic.$id).remove(function(error){
            if (error) {
            console.log("Error:", error);
          } else {
            console.log("Removed successfully!");
          }});
    };

  });
