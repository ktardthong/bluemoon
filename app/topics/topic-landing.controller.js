angular.module('App')
  .controller('TopicLandingCtrl', function ($state, $scope, Slug, Topics, Auth, Users, topicLanding, replyList, viewData, followers) {
    var topicLandingCtrl = this

    topicLandingCtrl.topicLanding = topicLanding
    topicLandingCtrl.topics = Topics
    topicLandingCtrl.replyList = replyList
    topicLandingCtrl.views = viewData
    topicLandingCtrl.followers = followers
  })
