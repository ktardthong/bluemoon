angular.module('App')
  .controller('TopicCtrl', function($state,$scope,$rootScope, $mdDialog, $mdMedia, Topics, Auth, Users, Slug){

    var topicCtrl = this;

    topicCtrl.uid = '';


    //Parser here
    topicCtrl.topics  = Topics;
    topicCtrl.auth    = Auth;



    topicCtrl.userName = function(userId){
      if(userId!= null){
        return Users.getDisplayName(userId);
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
          created:  moment().format("MM-DD-YYYY h:m:s")
        }).then(function(){
        topicCtrl.newTopic = {
          body: ''
        };
      });
    };
  });
