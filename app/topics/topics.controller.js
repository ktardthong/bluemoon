angular.module('App')
  .controller('TopicCtrl', function($state,$scope, $rootScope,Slug, Topics, Auth, Users){

    var topicCtrl = this;

    topicCtrl.uid = '';
    console.log($rootScope.profile);

    Auth.$requireAuth().then(function(auth){
    Users.getProfile(auth.uid).$loaded().then(function (profile){
      topicCtrl.uid = profile.$id;
      })
    });


    //Parser here
    topicCtrl.topics  = Topics;



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
  });
