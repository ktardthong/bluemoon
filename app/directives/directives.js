angular.module('App')
  .directive('topicGrid', function() {
    return {
      controller:  'DashboardCtrl as dashboardCtrl',
      templateUrl: 'templates/html/category-grid.html'
    };
  })

;
