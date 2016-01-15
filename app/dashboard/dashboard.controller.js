angular.module('App')
  .controller('DashboardCtrl', function(Auth, $state,Category,Tags) {
    var dashboardCtrl = this;

    dashboardCtrl.auth = Auth;

    dashboardCtrl.categories      = Category.all;
    dashboardCtrl.topic_grid  = false;
    dashboardCtrl.tags        = Tags.arr;


  });
