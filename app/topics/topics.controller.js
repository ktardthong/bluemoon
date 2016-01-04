angular.module('App')
  .controller('TopicCtrl', function($state,$scope, $rootScope,Slug, Topics, Auth, Users){

    var topicCtrl = this;

    topicCtrl.uid = '';
    console.log($rootScope.profile);

    Auth.$requireAuth().then(function(auth){
    Users.getProfile(auth.uid).$loaded().then(function (profile){
      console.log(profile);
      console.log(profile.$id);
      topicCtrl.uid = profile.$id;
      })
    });


    //Parser here
    topicCtrl.topics  = Topics;


    //
    topicCtrl.topic_landing = function(){

    }


    //Create new topic
    topicCtrl.createTopic = function(category){

      topicCtrl.topics.arr.$add({
          topic:    topicCtrl.newTopic.topic,
          body:     topicCtrl.newTopic.body,
          category: category,
          uid:      topicCtrl.uid,
          slug:     Slug.slugify(topicCtrl.newTopic.topic),
          created:  moment().format("MM-DD-YYYY")
        }).then(function(){
        topicCtrl.newTopic = {
          body: ''
        };
      });
    };
  });
