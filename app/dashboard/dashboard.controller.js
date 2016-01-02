angular.module('App')
  .controller('DashboardCtrl', function(Auth, $state,Topics) {
    var dashboardCtrl = this;


    dashboardCtrl.topics = Topics.all;
    dashboardCtrl.topic_grid = false;

  });
