angular.module('App')
  .controller('TopicCtrl', function($state,$scope, $rootScope, Topics, Auth, Users){

    var topicCtrl = this;

    topicCtrl.uid = '';
    console.log($rootScope.profile);

    Auth.$requireAuth().then(function(auth){
    Users.getProfile(auth.uid).$loaded().then(function (profile){
      console.log(profile);
      topicCtrl.uid = profile.$id;
      })
    });
    //Parser here
    topicCtrl.topics  = Topics;

    //Preset values for new topic
    topicCtrl.newTopic = {
      body: '',
      created: moment().format("MM-DD-YYYY")
    }



    //Create new topic
    topicCtrl.createTopic = function(){

      console.log("topic create press");
      console.log(topicCtrl.newTopic);

      topicCtrl.topics.arr.$add(topicCtrl.newTopic).then(function(){
        topicCtrl.newTopic = {
          body: ''
        };
      });
    };
  });
