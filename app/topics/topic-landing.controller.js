angular.module('App')
  .controller('TopicLandingCtrl', function ($state, $scope, $rootScope, Slug, Topics, Auth, Users, topicLanding, replyList, viewData) {
    var topicLandingCtrl = this

    topicLandingCtrl.topicLanding = topicLanding
    topicLandingCtrl.topics = Topics
    topicLandingCtrl.replyList = replyList
    topicLandingCtrl.views = viewData

    topicLandingCtrl.incrementViews = function (topic_slug) {
      console.log(topic_slug)
      console.log(topic_slug.slug)
    // return Topics.fortopicRef(topic_slug).update({view: topic_slug.view + 1})
    }

  })
