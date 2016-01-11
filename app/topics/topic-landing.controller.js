angular.module('App')
  .controller('TopicLandingCtrl', function ($state, $scope, Slug, Topics, Auth, Users, topicLanding, replyList, viewData, followers) {
    var topicLandingCtrl = this

    topicLandingCtrl.topicLanding = topicLanding
    topicLandingCtrl.topics = Topics
    topicLandingCtrl.replyList = replyList
    topicLandingCtrl.views = viewData
    topicLandingCtrl.followers = followers

  // topicLandingCtrl.topicFollowers = function (topicKey) {
  //   var count, array
  //   topicLandingCtrl.topics.getFollowers(topicKey).array.$loaded().then(function (data) {
  //     array = data
  //     count = data.length
  //   })
  //   topicLandingCtrl.followers = {'count': count, 'array': array}
  //   return topicLandingCtrl.followers
  // }
  })
