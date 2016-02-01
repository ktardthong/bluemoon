angular.module('App')
  .controller('DashboardCtrl', function(Auth, $state,Category,CateService,Tags,Topics
                                        ) {
    var dashboardCtrl = this;

    dashboardCtrl.auth = Auth;

    dashboardCtrl.cate        = CateService;
    dashboardCtrl.categories  = Category.all;
    dashboardCtrl.topics      = Topics;
    dashboardCtrl.topic_grid  = false;
    dashboardCtrl.tags        = Tags.arr;

    dashboardCtrl.userCateFollow  = [];
    dashboardCtrl.cateIsFollow    = [];
    dashboardCtrl.followList      = '';
    dashboardCtrl.userFeed ='null';

    dashboardCtrl.latestFeed = dashboardCtrl.topics.latestFeed();

    dashboardCtrl.followCate = function(cate_slug){
      dashboardCtrl.cate.addChild(cate_slug+'/follower')
        .child(Auth.ref.getAuth().uid).push().set(moment().toISOString());
    }

    console.log("DashboardCtrl");
  });
