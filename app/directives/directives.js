angular.module('App')
  .directive('topicGrid', function() {
    return {
      controller:  'DashboardCtrl as dashboardCtrl',
      templateUrl: 'templates/html/category-grid.html'
    };
  })
   .directive('topicList', function() {
    return {
      controller:  'TopicCtrl as topicCtrl',
      templateUrl: 'templates/html/topic-list.html',
      scope: {
            topics: "@"
        },
    };
  })
;
