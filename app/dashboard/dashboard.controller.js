angular.module('App')
  .controller('DashboardCtrl', function(Auth, $state,Category) {
    var dashboardCtrl = this;


    dashboardCtrl.categories      = Category.all;
    dashboardCtrl.topic_grid  = false;

  });
