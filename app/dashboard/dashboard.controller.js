angular.module('App')
  .controller('DashboardCtrl', function(Auth, $state,Category,CateService,Tags,
                                        $timeout, $mdSidenav, $log) {
    var dashboardCtrl = this;

    dashboardCtrl.auth = Auth;

    dashboardCtrl.cate = CateService;
    dashboardCtrl.categories      = Category.all;
    dashboardCtrl.topic_grid  = false;
    dashboardCtrl.tags        = Tags.arr;

    dashboardCtrl.userCateFollow  = [];
    dashboardCtrl.cateIsFollow    = [];
    dashboardCtrl.followList      = '';


    //Close Side bar
    dashboardCtrl.close = function () {
      $mdSidenav('right').close();
    };


    dashboardCtrl.followCate = function(cate_slug){
      dashboardCtrl.cate.addChild(cate_slug+'/follower')
        .child(Auth.ref.getAuth().uid).push().set(moment().toISOString());
    }
  });
