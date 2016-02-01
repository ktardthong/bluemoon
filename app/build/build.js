'use strict';

/**
 * Main module of the application.
 */
var app = angular.module('App', [
    'firebase',
    'angular-md5', // Encrypt email
    'ngRoute',
    'ui.router',
    'ngMaterial', // Interface
    'angularMoment', // Time management
    'flow', // Image upload
    'slugifier', // Create Slugs
    'ngAutocomplete', // Google places
    'ngTagsInput', // Tags
    'cgNotify', // Notification - https://github.com/cgross/angular-notify
    'pascalprecht.translate', // Translation - https://angular-translate.github.io/
    'facebook',       //  Facebook - https://github.com/Ciul/angular-facebook
    'angular-flexslider', // Image slider - https://github.com/thenikso/angular-flexslider

    // Emoticon -- http://mistic100.github.io/angular-smilies/
    'ngSanitize',
    'ui.bootstrap',   //  OR mgcrea.ngStrap
    'angular-smilies',

    'ngCookies',      //  cookies stuff
    'notification',   //  web notification - https://github.com/neoziro/angular-notification

  ])

  .config(["$mdThemingProvider", function ($mdThemingProvider) {
    $mdThemingProvider.definePalette('slack', {
      '50': 'ffebee',
      '100': 'ffcdd2',
      '200': 'ef9a9a',
      '300': 'e57373',
      '400': 'ef5350',
      '500': '4D394B', // primary colour
      '600': 'e53935',
      '700': 'd32f2f',
      '800': 'c62828',
      '900': 'b71c1c',
      'A100': 'ff8a80',
      'A200': 'ff5252',
      'A400': 'ff1744',
      'A700': 'd50000',
      'contrastDefaultColor': 'light', // whether, by default, text (contrast)
      // on this palette should be dark or light
      'contrastDarkColors': ['50', '100', // hues which contrast should be 'dark' by default
        '200', '300', '400', 'A100'],
      'contrastLightColors': undefined // could also specify this if default was 'dark'
    })
    $mdThemingProvider.theme('default')
      .primaryPalette('slack')
  }])

  // Facebook Config
  .config(
    ["FacebookProvider", function (FacebookProvider) {
      var myAppId = '931376120263856'
      FacebookProvider.setAppId(myAppId)
      FacebookProvider.init(myAppId)
    }]
  )

  //Security for Translate
  .config(["$translateProvider", function ($translateProvider) {
    $translateProvider.preferredLanguage('Eng');
    // Enable escaping of HTML
    $translateProvider.useSanitizeValueStrategy('escape');
  }])



  .config(["$stateProvider", "$urlRouterProvider", "$controllerProvider", function ($stateProvider, $urlRouterProvider,$controllerProvider) {

    app.registerCtrl = $controllerProvider.register;

    $stateProvider
      .state('home', {
        url: '/',
        views: {
          '': {
            controller: 'DashboardCtrl as  dashboardCtrl',
            templateUrl: 'home/home.html',
            resolve: {
              requireNoAuth: ["$state", "Auth", function ($state, Auth) {
                return Auth.auth.$requireAuth().then(function (auth) {
                  $state.go('dashboard')
                }, function (error) {
                  return error
                })
              }]
            }
          },
          'login-form@home': {
            //controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/html/login-form.html'
          },
        }
      })


      //Trending
      .state('trending', {
        url: '/explore/trending',
        views: {
          '': {
            controller: 'HomeCtrl as  homeCtrl',
            templateUrl: 'home/trend.html',
            resolve: {
              feed: ["Topics", function (Topics) {
                return Topics.latestFeed()
              }]
            }
          },
        }
      })


      // Category Landing
      .state('category', {
        url: '/category/{Slug}',
        views: {
          '': {
            controller: 'CateCtrl as cateCtrl',
            templateUrl: 'category/index.html',
            resolve: {
              // Getting Category details
              cateName: ["$stateParams", "Category", function ($stateParams, Category) {
                return Category.getName($stateParams.Slug).$loaded()
              }],
              // Getting list of category topics here
              cateTopics: ["$stateParams", "Topics", function ($stateParams, Topics) {
                return Topics.list($stateParams.Slug)
              }]
            }
          },
        }
      })


      // Places landing page
      .state('places', {
        url: '/places/{place_slug}/{place_id}',
        views: {
          'header@places': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          },
          '': {
            controller: 'PlacesCtrl as placesCtrl',
            templateUrl: 'place/index.html',
            resolve: {
              placeLanding: ["Places", "Topics", "$stateParams", "$firebaseArray", function (Places, Topics, $stateParams, $firebaseArray) {
                var data
                Places.getPlaceRef($stateParams.place_id).on('value', function (snapshot) {
                  data = snapshot.val()
                  console.log(snapshot.val())
                })
                return data
              // return  $firebaseArray(Places.getPlaceRef($stateParams.place_id))
              }]
            }
          }
        }
      })


      // Tag landing page
      .state('tag', {
        url: '/tag/{Tag}',
        views: {
          'header@tag': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          },
          '': {
            controller: 'TagCtrl as tagCtrl',
            templateUrl: 'tag/index.html',
            resolve: {
              tagName: ["$stateParams", function ($stateParams) {
                return $stateParams.Tag
              }],

              tagLanding: ["Topics", "$stateParams", "Tags", function (Topics, $stateParams, Tags) {
                var tag = $stateParams.Tag
                // var fb = new Firebase(FirebaseUrl)
                // var dataRet = ''
                // return show(Tags.topicTags(tag))
                /*return fb.child('tags/' + tag)
                    .on('value', function (tagSnap) {
                      return fb.child('topics')
                        .orderByChild("tags")
                        .equalTo(tag)
                        .on('value', function (topicSnap) {
                          return show( extend({}, tagSnap.val(), topicSnap.val()) )
                          /!*dataRet = extend({}, tagSnap.val(), topicSnap.val())
                          console.log($firebaseArray(dataRet))
                          return dataRet
                           *!/
                        })
                    })*/
                // var tagObj = Tags.getTagObject(tag)
                // return tagObj.$loaded().then(function () {
                //   return Topics.topicsByTag(tag).once('value', function (snap) {
                //     console.log(extend({}, tagObj.$value, snap.val()))
                //     return extend({}, tagObj.$value, snap.val())
                //   })
                // })

                // return new Promise(function(resolve, reject) {
                //     fb.once('value', function(snapshot) {
                //         var data = snapshot.val()
                //         data.forEach(function(dataSnap) {
                //             var index = word.indexOf(' ')
                //             var first = dataSnap.Name.substring(0, index)
                //             var last = word.substring(index + 1)
                //             var candidate = dataSnap.Name
                //             if (candidate.indexOf(first) >= 0 && candidate.indexOf(last) >= 0)
                //               resolve(dataSnap.CID)
                //             else
                //               reject('Some sort of failure')
                //         })
                //     })
                // })

                return Topics.topicsByTag(tag)
              // .once('value', function(snap){
              // })
              }]
            }
          }
        }
      })


      // Topic landing page
      .state('topic', {
        url: '/{Slug}',
        resolve: {
          /*Slug: function ($stateParams,$state,Auth) {
            $stateParams.Slug = decodeURIComponent($stateParams.Slug)
            if($stateParams.Slug == ''){
              $state.go('dashboard');
            }
          }*/
        },
        views: {
          '': {
            controller: 'TopicLandingCtrl as topicLandingCtrl',
            templateUrl: 'topics/index.html',
            resolve: {
              isOwner: ["Auth", "Users", "$stateParams", "Topics", function (Auth, Users, $stateParams, Topics) {
                var topicUid = ''
                // If user login, check if they are the topic owner
                if (Auth.ref.getAuth()) {
                  return Topics.fortopic($stateParams.Slug).$loaded().then(function (data) {
                    if (data[0] != null) {
                      topicUid = data[0].uid
                      if (Auth.ref.getAuth().uid == topicUid) {
                        return true
                      } else {
                        return false
                      }
                    }
                  })
                } else {
                  return false
                }
              }],
              topicLanding: ["$stateParams", "Topics", function ($stateParams, Topics) {
                return Topics.fortopic($stateParams.Slug).$loaded();
              }],
              replyList: ["$stateParams", "Topics", "$state", function ($stateParams, Topics, $state) {
                var topicKey = ''
                return Topics.fortopic($stateParams.Slug).$loaded().then(function (data) {
                  if (data[0] != null) {
                    topicKey = data[0].$id
                  } else {
                    $state.go('topic-notfound')
                  }
                  return Topics.replyList(topicKey)
                })
              }],
              viewData: ["$stateParams", "Topics", "Users", "Auth", function ($stateParams, Topics, Users, Auth) {
                var topicKey, views
                var time = moment().toISOString()
                var historyObj = {'userIP': '', 'created': time}
                Users.getLocationIP().success(function (data) {
                  historyObj.userIP = data.data
                }).then(function (data) {
                  historyObj.userIP = data.data
                })
                return Topics.getTopicBySlug($stateParams.Slug).$loaded().then(function (data) {
                  if (data[0].$id !== 'undefined') {
                    topicKey = data[0].$id
                    views = Topics.getViews(topicKey)

                    views.obj.$loaded().then(function (data) {
                      if (data.count == null) {
                        views.ref.child('count').set(1)
                      } else {
                        views.ref.child('count').set(data.count + 1)
                      }
                    })
                    Auth.auth.$requireAuth().then(function (auth) {
                      var uid = auth.uid
                      views.ref.child('history').child(uid).push().set(historyObj)
                      Users.userRef(auth.uid).child('views').child(topicKey).push().set(historyObj)
                    })
                  }
                  return views.obj
                })
              }],
              followers: ["$stateParams", "Topics", function ($stateParams, Topics) {
                return Topics.getTopicBySlug($stateParams.Slug).$loaded().then(function (data) {
                  var topicKey = data[0].$id
                  return Topics.getFollowers(topicKey).obj.$loaded().then(function (value) {
                    return value
                  })
                })
              }]
            }
          },
        }
      })

      // Topic not found
      .state('topic-notfound', {
        url: '/err/notfound'
      })

      // Profile landing page
      .state('profile', {
        url: '/profile/{Name}',
        views: {
          '': {
            controller: 'ProfileCtrl as profileCtrl',
            templateUrl: 'profile/index.html',
            resolve: {
              isOwner: ["Auth", "Users", "$stateParams", function (Auth, Users, $stateParams) {
                if (Auth.ref.getAuth()) {
                  return Users.getProfileByUsername($stateParams.Name).$loaded().then(function (profile) {
                    if (profile[0].$id == Auth.ref.getAuth().uid) {
                      return true
                    } else {
                      return false
                    }
                  })
                } else {
                  return false
                }
              }],
              userPosts: ["Users", "Topics", "$stateParams", function (Users, Topics, $stateParams) {
                return Users.getProfileByUsername($stateParams.Name).$loaded().then(function (profile) {
                  if (profile[0].$id !== 'undefined') {
                    return Topics.createdBy(profile[0].$id)
                  }
                })
              }],
              profile: ["$state", "$stateParams", "$rootScope", "Auth", "Users", function ($state, $stateParams, $rootScope, Auth, Users) {
                return Users.getProfileByUsername($stateParams.Name).$loaded().then(function (profile) {
                  return profile
                })
              }]
            }
          },
          'header@profile': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }

        }
      })

      // Profile landing page
      // @profileCtrl
      .state('acccountEdit', {
        url: '/account/edit',
        views: {
          'passwordEdit@acccountEdit': {
            url: '/account/changePassword',
            templateUrl: 'profile/passwd.html'
          },
          'userEdit@acccountEdit': {
            url: '/account/edit-form',
            templateUrl: 'profile/edit-form.html'
          },
          '': {
            controller: 'ProfileCtrl as profileCtrl',
            templateUrl: 'profile/edit.html',
            resolve: {
              userPosts: function () {
                return false
              },
              isOwner: function () {
                return true
              },
              profile: ["$state", "$rootScope", "Auth", "Users", function ($state, $rootScope, Auth, Users) {
                return Auth.auth.$requireAuth().then(function (auth) {
                  return Users.getProfile(auth.uid).$loaded().then(function (profile) {
                    if (profile.displayName) {
                      return profile
                    } else {
                      $state.go('get_started')
                    }
                  })
                }, function (error) {
                  $state.go('home')
                })
              }],
              auth: ["$state", "Users", "Auth", function ($state, Users, Auth) {
                return Auth.auth.$requireAuth().catch(function () {
                  $state.go('home')
                })
              }]
            }
          },
        }
      })

      .state('accountPassword', {
        url: '/account/changePassword',
        templateUrl: 'profile/passwd.html'
      })

      .state('accountUserEdit', {
        url: '/account/edit-form',
        templateUrl: 'profile/edit-form.html'
      })

      // Dashboard
      // @profileCtrl
      .state('dashboard', {
        url: '/user/dashboard',
        controller: 'DashboardCtrl as dashboardCtrl',
        views: {
          '': {
            controller: 'ProfileCtrl as profileCtrl',
            templateUrl: 'dashboard/index.html',
            resolve: {
              userPosts: function () {
                return false
              },
              isOwner: function () {
                return true
              },
              profile: ["$state", "$rootScope", "Auth", "Users", function ($state, $rootScope, Auth, Users) {
                return Auth.auth.$requireAuth().then(function (auth) {
                  return Users.getProfile(auth.uid).$loaded().then(function (profile) {
                    // if no stat object
                    if (!profile.stat) {
                      Users.userRef(auth.uid).child('stat/upvoted/count').set(0)
                      Users.userRef(auth.uid).child('stat/posted/count').set(0)
                      Users.userRef(auth.uid).child('stat/comment/count').set(0)
                      Users.userRef(auth.uid).child('stat/follower/count').set(0)
                      Users.userRef(auth.uid).child('stat/following/count').set(0)
                    }

                    // if no displayname - go to get_started
                    if (profile.displayName) {
                      return profile
                    } else {
                      $state.go('get_started')
                    }
                  })
                }, function (error) {
                  $state.go('home')
                  return error
                })
              }],
              auth: ["$state", "Users", "Auth", function ($state, Users, Auth) {
                return Auth.auth.$requireAuth().catch(function () {
                  $state.go('home')
                })
              }]
            }
          }
        }
      })


      // nested list with custom controller
      .state('dashboard.list', {
        url: '/feed/{Slug}',
        //templateUrl: '/feeds/feed.html',
        views: {
          '': {
            controller: 'CateCtrl as cateCtrl',
            templateUrl: 'category/index.html',
            resolve: {
              // Getting Category details
              cateName: ["$stateParams", "Category", function ($stateParams, Category) {
                return Category.getName($stateParams.Slug).$loaded()
              }],
              // Getting list of category topics here
              cateTopics: ["$stateParams", "Topics", function ($stateParams, Topics) {
                return Topics.list($stateParams.Slug)
              }]
            }
          },
        }
      })

      // Folllow Category
      // @profileCtrl
      .state('follow_cates', {
        url: '/user/follow-categories',
        views: {
          '': {
            controller: 'ProfileCtrl as profileCtrl',
            templateUrl: 'auth/follow-categories.html',
            resolve: {
              userPosts: function () {
                return false
              },
              isOwner: function () {
                return true
              },
              profile: ["Users", "Auth", function (Users, Auth) {
                return Auth.auth.$requireAuth().then(function (auth) {
                  return Users.getProfile(auth.uid).$loaded()
                })
              }],
              auth: ["$state", "Users", "Auth", function ($state, Users, Auth) {
                return Auth.auth.$requireAuth().catch(function () {
                  $state.go('home')
                })
              }]
            }
          }
        }
      })

      // Getting started
      // @profileCtrl
      .state('get_started', {
        url: '/user/get_started',
        views: {
          '': {
            controller: 'ProfileCtrl as profileCtrl',
            templateUrl: 'auth/get_started.html',
            resolve: {
              userPosts: function () {
                return false
              },
              isOwner: function () {
                return true
              },
              profile: ["Users", "Auth", function (Users, Auth) {
                return Auth.auth.$requireAuth().then(function (auth) {
                  return Users.getProfile(auth.uid).$loaded()
                })
              }],
              auth: ["$state", "Users", "Auth", function ($state, Users, Auth) {
                return Auth.auth.$requireAuth().catch(function () {
                  $state.go('home')
                })
              }]
            }
          },
          'header@get_started': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }
        }
      })

      .state('login', {
        url: '/user/login',
        views: {
          '': {
            templateUrl: 'auth/login.html'
          },
          'login-form@login': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/html/login-form.html'
          }
        }
      })

      .state('register', {
        url: '/user/register',
        views: {
          '': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'auth/register.html'
          }
        },
        resolve: {
          requireNoAuth: ["$state", "Auth", function ($state, Auth) {
            return Auth.auth.$requireAuth().then(function (auth) {
              $state.go('home')
            }, function (error) {
              return error
            })
          }]
        }
      })

    $urlRouterProvider.otherwise('/')
  }])

  .filter('orderObjectBy', function () {
    return function (items, field, reverse) {
      var filtered = []
      angular.forEach(items, function (item) {
        filtered.push(item.$id).set(item)
      })
      filtered.sort(function (a, b) {
        return (a[field] > b[field] ? 1 : -1)
      })
      if (reverse) filtered.reverse()
      return filtered
    }
  })

  .filter('decodeURI', function () {
    return function (text) {
      return text ? decodeURI(text) : ''
    }
  })

  // Formatting texts to include new line
  .filter('nl2br', ["$sce", function ($sce) {
    return function (text) {
      return text ? $sce.trustAsHtml(text.replace(/\n/g, '<br/>')) : ''
    }
  }])

  .constant('FirebaseUrl', 'https://bmxyz.firebaseio.com/')

function show (data) {
  console.log(data)
  return JSON.stringify(data, null, 2)
}

// for joining - https://gist.github.com/katowulf/6598238
function extend (base) {
  var parts = Array.prototype.slice.call(arguments, 1)
  parts.forEach(function (p) {
    if (p && typeof (p) === 'object') {
      for (var k in p) {
        if (p.hasOwnProperty(k)) {
          base[k] = p[k]
        }
      }
    }
  })
  return base
}

angular.module('App')
  .controller('AuthCtrl', ["$scope", "Auth", "Users", "$state", "$rootScope", "$mdSidenav", "$translate", "$cookies", "NotiService", "$notification", function($scope,Auth, Users, $state,$rootScope,$mdSidenav,$translate, $cookies,
                                   NotiService,$notification){

    console.log("authCtrl");

    var authCtrl = this;

    //Ask for notification permission
    $notification.requestPermission()
      .then(function (permission) {
        console.log(permission); // default, granted, denied
      });

    //Parser
    authCtrl.auth     = Auth;
    authCtrl.users    = Users;
    authCtrl.notification = NotiService;


    if(Auth.ref.getAuth() != null ){
      authCtrl.profile  = authCtrl.users.getProfile(Auth.ref.getAuth().uid);
    }
    else{
      authCtrl.profile =''
    }


    authCtrl.user = {
      email: '',
      password: ''
    };



    //Get the badge notification
    /*authCtrl.badgeNotification = function() {
     return authCtrl.notification.addArrChild(authCtrl.profile.$id + '/unread').$loaded();
    }

    authCtrl.badgeValue = authCtrl.badgeNotification;

    console.log(authCtrl.badgeNotification);*/

    $scope.badgeNotifcation = authCtrl.badgeNotification;

    //Reset counter
    authCtrl.resetCounter = function(){
      authCtrl.notification.resetUnread(authCtrl.profile.$id);
    }

    authCtrl.changeVal = function(){
      console.log('badge value '+authCtrl.badgeNotification.$value);

    }

    $scope.$watch("name", function(newValue, oldValue) {
      if ($scope.name.length > 0) {
        $scope.greeting = "Greetings " + $scope.name;
      }
    });


    //Change language
    authCtrl.toggleLang = function (langKey) {
      $translate.use(langKey);
      // Setting a cookie
      $cookies.put('userLang', langKey);
      //If user registered - update this in their preference
      if(Auth.ref.getAuth()){
        authCtrl.users.userArrRef(Auth.ref.getAuth().uid).update({"lang":langKey})
      }
    }

    //Checkk user selected language
    if(!authCtrl.profile.lang){
      if($cookies.get('userLang')){
        authCtrl.toggleLang($cookies.get('userLang'));
      }else{
        authCtrl.toggleLang('Eng');
      }
    }
    else{
      authCtrl.toggleLang(authCtrl.profile.lang);
    }


    //Login
    authCtrl.login = function (){
      authCtrl.auth.auth.$authWithPassword(authCtrl.user).then(function (auth){
        $state.go('dashboard');
      }, function (error){
        authCtrl.error = error;
      });
    };

    //Logout
    authCtrl.logout = function(){
      Auth.auth.$unauth();
      $state.go('login');
    }

    //Register user
    authCtrl.register = function (){
      Auth.auth.$createUser(authCtrl.user).then(function (user){
        authCtrl.login();
      }, function (error){
        authCtrl.error = error;
      });
    };


    authCtrl.toggleRight = buildToggler('right');
    function buildToggler(navID) {
      return function() {
        $mdSidenav(navID)
          .toggle()
      };
    }
  }]);

angular.module('App')
  .factory('Auth', ["$firebaseAuth", "FirebaseUrl", function($firebaseAuth, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl);
    var auth = $firebaseAuth(ref);

    var Auth = {
      ref:ref,
      auth: auth,

      getUid:function(){
        var uid = ref.getAuth();
        if(uid != null ){
          return ref.getAuth().uid;
        }
        else{
          return false;
        }
      },
    }

    return Auth;
  }]);

angular.module('App')
  .controller('CateCtrl', ["$state", "Category", "cateName", "cateTopics", function($state, Category,cateName,cateTopics){
    var cateCtrl = this;

    //Parsers
    cateCtrl.cateName   = cateName;
    cateCtrl.category   = Category;
    cateCtrl.cateTopics = cateTopics;


    console.log("CateCtrl");
  }]);

angular.module('App')

  //Topic list
  .factory('CateService', ["$firebaseObject", "$firebaseArray", "FirebaseUrl", function($firebaseObject, $firebaseArray , FirebaseUrl){
    var ref    = new Firebase(FirebaseUrl+'categories');
    var categories = $firebaseObject(ref);

    var Cate = {

      name: function(topic_slug){
        var data = ref.orderByChild("slug").equalTo(topic_slug);
        return $firebaseObject(data);
      },

      fortopic: function(topic_slug){
        return $firebaseObject(usersRef.child(uid));
      },

      addChild: function(childname){
        return ref.child(childname)
      },

      followList:function(uid){
        var data = ref.orderByChild("news/follower").equalTo(uid);
        return $firebaseArray(data);
      },

      unFollow:function(slug,uid){
        var ref    = new Firebase(FirebaseUrl+'categories/'+slug+'/follower/'+uid);
        ref.remove();
      },

      userFollow:function(slug,uid){
        var follow=false;
        var ref    = new Firebase(FirebaseUrl+'categories/'+slug+'/follower/'+uid);
        ref.once("value", function(snapshot) {
          follow = snapshot.exists();
        })
        return follow;
      },
      arr: $firebaseArray(ref),
      all:categories
    }
    return Cate;
  }])


angular.module('App')

  //Topic list
  .factory('Post', ["$firebaseObject", "FirebaseUrl", function($firebaseObject, FirebaseUrl){
    var ref    = new Firebase(FirebaseUrl+'topics');
    var topics = $firebaseObject(ref);

    var TS = {
      topicName: function(topic_slug){
        var data = ref.orderByChild("slug").equalTo(topic_slug);
        return $firebaseObject(data);
      },
      fortopic: function(topic_slug){
        return $firebaseObject(usersRef.child(uid));
      },
      all:topics
    }
    return TS;
  }])


angular.module('App')
  .controller('DashboardCtrl', ["Auth", "$state", "Category", "CateService", "Tags", "$timeout", "$mdSidenav", "$log", function(Auth, $state,Category,CateService,Tags,
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


    dashboardCtrl.userFeed ='null';

    //Close Side bar
    dashboardCtrl.close = function () {
      $mdSidenav('right').close();
    };


    dashboardCtrl.followCate = function(cate_slug){
      dashboardCtrl.cate.addChild(cate_slug+'/follower')
        .child(Auth.ref.getAuth().uid).push().set(moment().toISOString());
    }

    console.log("DashboardCtrl");
  }]);

angular.module('App')

  .directive('mainHeader',function(){
    return {
      restrict:     'E',
      transclude:   true,
      //controller: 'AuthCtrl as authCtrl',
      templateUrl: 'templates/toolbar/main_toolbar.html'
    }

  })

  //Badge notification
  .directive('badgeNotification',function(){
    return {
      restrict:     'E',
      transclude:   true,
      //controller:   'AuthCtrl as authCtrl',
      templateUrl:  'templates/html/badge-notification.html',
      scope: {
        notification: '='
      }
    }
  })


  //List of categories on the siderbar
  .directive('reviewScore', function () {
    return {
      restrict:     'E',
      transclude:   true,
      controller:   'TopicCtrl as topicCtrl',
      templateUrl:  'templates/html/review-summary-list.html',
      scope: {
        review: '='
      }
    }
  })


  //Follow Button
  .directive('userFollowerBtn',function(){
    return {
      restrict:     'E',
      transclude:   true,
      controller:   'TopicCtrl as topicCtrl',
      templateUrl:  'templates/html/follow-user.html',
      scope: {
        follow: '='
      }
    }
  })


  //Category follow button
  .directive('cateFollowBtn',function(){
    return {
      controller: 'DashboardCtrl as dashboardCtrl',
      templateUrl: 'templates/html/category-follow-btn.html',
      scope: {
        cate: '='
      }
    }
  })

  //List of categories on the siderbar
  .directive('topicGrid', function () {
    return {
      controller: 'DashboardCtrl as dashboardCtrl',
      templateUrl: 'templates/html/category-grid.html'
    }
  })

  //Grid Tags for sidebar
  .directive('tagGrid', function () {
    return {
      controller: 'DashboardCtrl as dashboardCtrl',
      templateUrl: 'templates/html/tag-grid.html'
    }
  })


  .directive('topicCreate', function(){

    return {
      controller: 'TopicCtrl as topicCtrl',
      templateUrl: 'templates/html/topic-create.html',
      scope: {
        topic: '='
      }
    }

  })


  .directive('topicList', function () {
    return {
      controller: 'TopicCtrl as topicCtrl',
      templateUrl: 'templates/html/topic-list.html',
      scope: {
        topics: '='
      }
    }
  })


  .directive('topicActionsCard', function () {
    return {
      controller: 'TopicCtrl as topicCtrl',
      templateUrl: 'templates/html/topic-actions-card.html',
      scope: {
        topic: '='
      }
    }
  })


  //for tags - max tags
  .directive('enforceMaxTags', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngCtrl) {
      var maxTags = attrs.maxTags ? parseInt(attrs.maxTags, '4') : null;

      ngCtrl.$parsers.push(function(value) {
        if (value && maxTags && value.length > maxTags) {
          value.splice(value.length - 1, 1);
        }
        return value;
      });
    }
  };
});

angular.module('App')
  .controller('HomeCtrl', ["$state", "Category", "Topics", "feed", function($state,Category,Topics,feed){
    var homeCtrl = this;

    homeCtrl.topics = Category;
    homeCtrl.topics = Topics;
    homeCtrl.feed   = feed;

    console.log("homeCtrl");

  }]);

angular.module('App')
  .config(['$translateProvider', function ($translateProvider) {
    $translateProvider.translations('Eng', {
      'KEY_DASHBOARD':  'Dashboard',
      'KEY_LANGUAGES':  'Languages',
      'KEY_HOME':       'Home',
      'KEY_REGISTER':   'Register',
      'KEY_LOGIN':      'Log in',
      'KEY_LOGOUT':     'Log out',
      'KEY_FOLLOW':     'Follow',
      'KEY_FOLLOWER':   'Follower',
      'KEY_UNFOLLOW':   'Unfollow',
      'KEY_FOLLOWING':  'Following',
      'KEY_POST':       'Post',
      'KEY_POSTED':     'Posted',
      'KEY_UPVOTE':     'Upvote',
      'KEY_UPVOTED':    'Upvoted',
      'KEY_DWN_VOTE':   'Downvote',
      'KEY_DWN_VOTED':  'Downvoted',
      'KEY_VIEW':       'View',
      'KEY_REMOVE':     'Remove',
      'KEY_CANCEL':     'Cancel',
      'KEY_QUESTION':   'Question',
      'KEY_TOPIC':      'Topic',
      'KEY_CHG_PWD':    'Change Password',
      'KEY_PASSWORD':   'Password',
      'KEY_OLD_PWD':    'Old Password',
      'KEY_NEW_PWD':    'New Password',
      'KEY_NEW_PWD_C':  'New password confirmation',
      'KEY_SAVE':       'Save',
      'KEY_SAVE_DRAFT': 'Save as draft',
      'KEY_TAGS':       'Tags',
      'KEY_EXPLORE':    'Explore',
      'KEY_FEAT_CAT':    'Features categories',
      'KEY_COMMENTS':   'Comments',
      'KEY_REPLY':      'Reply',
      'KEY_REVIEW':     'Review',
      'KEY_EDIT':       'Edit',
      'KEY_TREND':      'Trend',
      'KEY_TRENDING':   'Trending',
      'KEY_WRITE_REPLY':'Write a reply',
      'KEY_LATEST_FEED':'Latest Feed',

      //Remove topic
      'KEY_CONF_REMOVE':'Are you sure you want to remove?',
      'KEY_CONF_REM_C': 'Once remove, you will not be ableto to get this topic back',


      //SENTENCE
      'KEY_WHAT_ON_UR_MIND':  'What\'s on your mind?',
      'KEY_YOU_WANT_FOLLOW':  'You may want to follow',
      'KEY_NO_ACCT_REGISTER': 'Don\'t have account? Register',
      'KEY_CANT_CHNG_USER':   'Don\'t have account? Register',
      'KEY_YOUR_ACCOUNT':     'Your account',
      'KEY_NOTHING_HERE':     'Nothing here, yet',
      'KEY_WHO_TO_FOLLOW':    'Who to follow',
      'KEY_CAT_WILL_APPEAR':  'Follow some categories and it will appear here',
      'KEY_WHT_UR_STORY':     'What\'s your story',
      'KEY_WRT_COMMENT':      'Write a comment',



      //USER INPUT
      'KEY_FIRSTNAME':  'First name',
      'KEY_LASTNAME':   'Last name',
      'KEY_BIRTHDAY':   'Birthday',
      'KEY_MONTH':      'Month',
      'KEY_DAY':        'Day',
      'KEY_EMAIL':      'Email',
      'KEY_CONF_EMAIL': 'Confirm Email',
      'KEY_GENDER':     'Gender',
      'KEY_MALE':       'Male',
      'KEY_FEMALE':     'Female',
      'KEY_USERNAME':   'Username',
      'KEY_LOCATION':   'Location',

      //User Edit
      'KEY_ED_PROFILE': 'Edit Profile',
      'KEY_ED_CHG_PWD': 'Change Password',
      'KEY_ED_PROFILE': 'Edit Profile',
      'KEY_ED_SITE':    'Website',
      'KEY_ED_PHONE':   'Phone',
      'KEY_ED_BIO':     'Biography',

    });

    $translateProvider.translations('ไทย', {
      'KEY_DASHBOARD':  'ห้องทั้งหมด',
      'KEY_LANGUAGES':  'ภาษา',
      'KEY_HOME':       'หน้าแรก',
      'KEY_REGISTER':   'สมัครใช้',
      'KEY_LOGIN':      'เข้าสู่ระบบ',
      'KEY_FOLLOW':     'ติดตาม',
      'KEY_POST':       'โพสต์'
    });

    $translateProvider.preferredLanguage('en');
  }])

angular.module('App')
  .controller('NotiCtrl', ["$state", "Category", "Topics", "NotiService", function($state,Category,Topics,NotiService){
    var notiCtrl = this;


    notiCtrl.topics = Topics;
    notiCtrl.feed   = feed;
    notiCtrl.notiService = NotiService;

    notiCtrl.notifyTo =function(uid){
      return notiCtrl.arr.push(uid).$add(uid)
    }
  }]);

angular.module('App')

  .factory('NotiService', ["$firebaseObject", "$firebaseArray", "FirebaseUrl", "Users", "$notification", function($firebaseObject, $firebaseArray , FirebaseUrl,
                                   Users,$notification){
    var ref    = new Firebase(FirebaseUrl+'notification');
    var noti = $firebaseObject(ref);
    var users = Users;

    var observerCallbacks = [];


    var Notification = {

      //Display unread
      unreadNotification:function(uid){
        var ref = new Firebase(FirebaseUrl+'notification/'+uid+'/unread');
        var counter;
        ref.on("value",function(snapshot){
          counter = snapshot.val();
        });

        var notification_ref = new Firebase(FirebaseUrl+'notification/'+uid);
        notification_ref.on("child_added",function(){
          $notification('New message from Qanya', {
            body: 'Hello '+uid,
            dir: 'auto',
            lang: 'en',
            tag: 'my-tag',
            icon: 'http://www.cl.cam.ac.uk/research/srg/netos/images/qsense-logo.png',
            //delay: 1000, // in ms
            focusWindowOnClick: true // focus the window on click
          });
        })
        return counter ;
      },

      //Notify followers
      notifyFollower:function(topicId,uid){
        var ref = users.getFollower(uid);
        ref.once("value", function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            //update notification and details
            Notification.updateNotificationCount(topicId,childSnapshot.key());
          })
        })
      },

      //Add detail for this notifictiaon
      notifyLog:function(topicId,uid,from_uid){

        console.log("uid "+uid);
        console.log("from uid "+ from_uid);

        Notification.addChild(uid).push().set({
          topicId:    topicId,
          from:       from_uid,
          is_read:    false,
          timestamp:  moment().toISOString()
        });

      },


      //Reset unread counter
      resetUnread:function(uid){
        var ref = new Firebase(FirebaseUrl+'notification/'+uid+'/unread');
        ref.set(0);
      },


      //Update notification
      //@params uid - who this notification is going to
      updateNotificationCount:function(topicId,uid,from_uid){

        var ref = new Firebase(FirebaseUrl+'notification/'+uid+'/unread');
        ref.once("value", function(snapshot) {
          //default unread is 1
         if(snapshot.val() == 'null'){
            ref.set(1)
          }else{
            ref.set(snapshot.val() + 1);
          }
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });

        //Add to log
        Notification.notifyLog(topicId,uid,from_uid);

      },


      addChild:function(child){
        return ref.child(child);
      },

      addArrChild:function(child){
        return $firebaseObject(ref.child(child));
      },

      arr: $firebaseArray(ref),
      all: noti
    }
    return Notification;
  }])


angular.module('App')
  .controller('PlacesCtrl', ["$state", "$scope", "$rootScope", "$mdDialog", "$mdMedia", "Tags", "Topics", "Auth", "Users", "Slug", "Languages", "placeLanding", function($state,$scope,$rootScope, $mdDialog, $mdMedia,
                                     //Services
                                     Tags, Topics, Auth, Users, Slug,Languages,
                                     placeLanding) {

    var placesCtrl = this;
    console.log(placeLanding);
    placesCtrl.placeLanding = placeLanding;

  }]);


angular.module('App')
  .factory('Places', ["$firebaseArray", "FirebaseUrl", function($firebaseArray, FirebaseUrl){

    var ref = new Firebase(FirebaseUrl+'places');
    var placeDetail_ref = new Firebase(FirebaseUrl+'places_details');

    var places = $firebaseArray(ref);

    var Places = {
      addChild: function(childname){
        return ref.child(childname)
      },

      addPlaceDetailChild: function(childname){
        return placeDetail_ref.child(childname)
      },

      getPlaceRef:function(place_id){
        return ref.child(place_id+'/info');
      },
      arr: places
    }
    return Places;
  }])

angular.module('App')

  //Category list
  .factory('Category', ["$firebaseObject", "$firebaseArray", "FirebaseUrl", function($firebaseObject, $firebaseArray, FirebaseUrl){
    var ref    = new Firebase(FirebaseUrl+'categories');
    var categories = $firebaseObject(ref);
    var topicArr = $firebaseArray(ref);

    var Category = {
      getName: function(slug){
        var data = ref.child(slug);
        return $firebaseObject(data);
      },

      all: categories
    }
    return Category;
  }])


  //Languages
  .factory('Languages', ["$firebaseArray", "FirebaseUrl", function($firebaseArray, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl+'languages');
    var lang = $firebaseArray(ref);

    return lang;
  }])


  //Languages
  .factory('Archive', ["$firebaseArray", "FirebaseUrl", function($firebaseArray, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl+'archive');
    var archive = $firebaseArray(ref);

    var Archive ={
      addChild: function(slug){
        return ref.child(slug);
      },
      ref: ref,
      arr: archive
    }
    return Archive;
  }]);

angular.module('App')
  .controller('TagCtrl', ["Auth", "Users", "$state", "$rootScope", "tagLanding", "tagName", function(Auth, Users, $state,$rootScope,
                                  //Resolve
                                  tagLanding,tagName) {

    var tagCtrl = this;
    tagCtrl.tagLanding  = tagLanding;
    tagCtrl.tagName     = tagName;

  }]);

angular.module('App')
  .factory('Tags', ["$firebaseArray", "$firebaseObject", "FirebaseUrl", "$q", function($firebaseArray, $firebaseObject, FirebaseUrl, $q){

    var ref = new Firebase(FirebaseUrl+'tags');
    var tags = $firebaseArray(ref);

    var Tags = {

      addChild: function(childname){
        return ref.child(childname)
      },

      tagsUrl: function () {
        return $firebaseArray(ref);
      },

      getTagRef:function(tag){
        return ref.child(tag);
      },

      getTagObject:function(tag){
        return $firebaseObject(ref.child(tag))
      },

      topicTags:function(tag){
        var deferred = $q.defer();

        var fb = new Firebase(FirebaseUrl);
        var dataRet = '';

        return fb.child('tags/'+tag)
          .on('child_added', function(tagSnap){
            fb.child('topics')
              .orderByChild("tags")
              .equalTo(tag)
              .on('child_added', function(topicSnap) {
                deferred.resolve();
                //show( extend({}, tagSnap.val(), topicSnap.val()) );
                return extend({}, tagSnap.val(), topicSnap.val());
                //console.log(dataRet);
              });
            })
      },

      arr: tags

    }
    return Tags;
  }])

angular.module('App')
  .controller('TopicLandingCtrl', ["$state", "$scope", "Slug", "Topics", "Auth", "Users", "isOwner", "topicLanding", "replyList", "viewData", "followers", function ($state, $scope, Slug, Topics, Auth, Users,
                                            //Resolve
                                            isOwner,topicLanding, replyList, viewData, followers) {

    var topicLandingCtrl = this


    topicLandingCtrl.auth         = Auth;
    topicLandingCtrl.users        = Users;
    topicLandingCtrl.topicLanding = topicLanding;
    topicLandingCtrl.topics       = Topics;
    topicLandingCtrl.replyList    = replyList;
    topicLandingCtrl.views        = viewData;
    topicLandingCtrl.followers    = followers;
    topicLandingCtrl.isOwner      = isOwner;




    //Getting Replies in replies
    topicLandingCtrl.inReplyArr = [];
    topicLandingCtrl.replyInReply = function(){

      for(var i=0; i<topicLandingCtrl.replyList.length;i++){
        var topicId = topicLandingCtrl.replyList[i].topicId;
        var replyId = topicLandingCtrl.replyList[i].$id;
        topicLandingCtrl.inReplyArr[i] = topicLandingCtrl.topics.replyInReply(topicId,replyId);
      }
    }

    topicLandingCtrl.replyInReply();
  }])

angular.module('App')
  .controller('TopicCtrl', ["$state", "$scope", "$rootScope", "$mdDialog", "$mdMedia", "$http", "FirebaseUrl", "$translate", "$notification", "NotiService", "Tags", "Topics", "Auth", "Users", "Slug", "Places", "Languages", "Archive", function($state,$scope,$rootScope, $mdDialog, $mdMedia,
                                    $http,FirebaseUrl,$translate,$notification,
                                    //Services
                                    NotiService,Tags, Topics, Auth, Users,
                                    Slug,Places, Languages,Archive){

    console.log("topicCtrl");

    var topicCtrl = this;


    //Parser here
    topicCtrl.tags      = Tags;
    topicCtrl.topics    = Topics;
    topicCtrl.auth      = Auth;
    topicCtrl.users     = Users;
    topicCtrl.languages = Languages;
    topicCtrl.places    = Places;
    topicCtrl.archive   = Archive;
    topicCtrl.noti      = NotiService;

    if(topicCtrl.auth.ref.getAuth() != null ){
      topicCtrl.profile  = topicCtrl.users.getProfile(topicCtrl.auth.ref.getAuth().uid);
      topicCtrl.uid = topicCtrl.profile.$id;
      topicCtrl.userRef = topicCtrl.users.userRef(topicCtrl.uid);
      topicCtrl.userUpvotedTopics = topicCtrl.users.upvotes(topicCtrl.uid);
      topicCtrl.userDownvotedTopics = topicCtrl.users.downvotes(topicCtrl.uid);
      topicCtrl.userFollowing = topicCtrl.users.following(topicCtrl.uid);
    }
    else{
      topicCtrl.profile ='';
      topicCtrl.uid = '';
      topicCtrl.userRef = '';
    }



    //Preset Parameters
    topicCtrl.imageStrings  = [];
    topicCtrl.imageText     = [];
    topicCtrl.inReplyArr    = [];
    topicCtrl.loadBusy      = false;
    topicCtrl.slugReturn    = null;
    topicCtrl.criteria      = false;
    topicCtrl.criteriaReply = null;
    topicCtrl.reviewCriteria=false;
    topicCtrl.critReplyData = null;

    //if allow null in the form
    topicCtrl.newTopic      = {
      'location': '',
      'url' : '',
      'ipInfo': '',
      'tags': '',
      'body': ''
    }


    //Calc average review input in reply
    topicCtrl.avgReviewReply = function(){

      var objCount = Object.keys(topicCtrl.criteriaReply).length;
      var avg = 0
      for(var i=0;i<objCount;i++){
        avg = avg + topicCtrl.criteriaReply[i];
      }

      topicCtrl.replyReviewAverage = avg/objCount;

      console.log(topicCtrl.criteriaReply);

      topicCtrl.critReplyData = { avg: topicCtrl.replyReviewAverage, data: topicCtrl.criteriaReply}
    }


    //Get the average score from criteria values
    topicCtrl.avgReviewScore = function(data){
      if(data)
      {
      var avg =0;
      for(var i=0;i<data.length;i++){
        avg = avg + data[i].rating;
      }
      return avg/data.length;
      }
    }


    //Label for remove topics
    $translate(['KEY_REMOVE', 'KEY_CANCEL','KEY_CONF_REMOVE','KEY_CONF_REM_C']).then(function (translations) {
      topicCtrl.removeTrans = translations.KEY_REMOVE;
      topicCtrl.cancelTrans = translations.KEY_CANCEL;
      topicCtrl.confirmRem  = translations.KEY_CONF_REMOVE;
      topicCtrl.confirmRemContent =  translations.KEY_CONF_REM_C;
    });


    topicCtrl.userName = function(userId){
      if(userId!= null){
        //return topicCtrl.users.getDisplayName(userId);
      }
    }




    //Login for material
    topicCtrl.showMdLogin = function(ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
      $mdDialog.show({
          //controller: 'AuthCtrl as authCtrl',
          templateUrl: 'templates/html/md-login-form.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          fullscreen: useFullScreen
        })
    }



    topicCtrl.decodeText = function(text){
      //return $filter('slugify')(item.name);
      console.log(decodeURI(text));
      return decodeURI(text);
    }


    topicCtrl.loadMore = function(items) {
      topicCtrl.loadBusy = true;
      var data = [];
      for (var i = 0; i < items.length; i++) {
        data.push(items[i]);
      }
      console.log(data);
      return data
    };

    topicCtrl.loadTags = function(query) {
      console.log(topicCtrl.tags.tagsUrl());
    };


    /*topicCtrl.users.getLocationIP().success(function(data) {
      topicCtrl.newTopic.ipInfo = data;
    });*/


    //Upload Profile image
    topicCtrl.uploadFile = function(files,index) {
      angular.forEach(files, function (flowFile, index) {
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
          var uri = event.target.result;
          topicCtrl.imageStrings[index] = uri;
        };
        fileReader.readAsDataURL(flowFile.file);
      })
    };


    //Show confirm remove topic
    topicCtrl.showConfirmRemove = function(ev,topic_owner,obj){
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
        .title(topicCtrl.confirmRem)
        .textContent(topicCtrl.confirmRemContent)
        .targetEvent(ev)
        .ok(topicCtrl.removeTrans)
        .cancel(topicCtrl.cancelTrans);
      $mdDialog.show(confirm).then(function() {
        if(topicCtrl.removeTopic(topic_owner,obj)){
          $state.go('dashboard');
        }
      });
    };


    //Remove topic
    topicCtrl.removeTopic = function(topic_owner,obj){
      //verify if the topic owner and the login owner is the same ppl
      if(topic_owner == topicCtrl.uid){
        moveFbRecord(topicCtrl.topics.refChild(obj.$id), topicCtrl.archive.addChild(obj.$id));
        return true;
       }else{
        return false;
       }
    }


    //Reply to topic
    topicCtrl.reply = function(topicObj){

      topicCtrl.topics.replyArr(topicObj.$id).$add({
        topicId:  topicObj.$id,
        body:     topicCtrl.newReply.body,
        uid:      topicCtrl.uid,
        review:   topicCtrl.critReplyData,
        created:  moment().toISOString()
      }).then(function(){
        //Notify topic owner
        //topicObj refers to the property of this object
        topicCtrl.noti.updateNotificationCount(topicObj.$id,topicObj.uid,topicCtrl.uid);
      })






      topicCtrl.topics.replyCount(topicObj.$id).$loaded().then(function(data){
        if(!data.count){
          topicCtrl.topics.replyCountRef(topicObj.$id).set(1);
        }else{
          topicCtrl.topics.replyCountRef(topicObj.$id)
            .set(data.count +1);
        }
      });


      //Stat update for user
      topicCtrl.users.userRef(topicCtrl.uid).child('stat/comment/count')
        .set(topicCtrl.profile.stat.comment.count + 1);

      topicCtrl.users.userRef(topicCtrl.uid).child('stat/comment/topics/'+topicObj.$id)
        .push().set(moment().toISOString());
    }



    //Reply in reply
    topicCtrl.replyInReply = function(topicId,replyId){
      topicCtrl.topics.replyInReplyArr(topicId,replyId).$add({
        body:     topicCtrl.replyInReply.body,
        uid:      topicCtrl.uid,
        created:  moment().toISOString()
      })
    }



    topicCtrl.addNewChoice = function() {
      var newItemNo = topicCtrl.reviewCriteria.length+1;
      topicCtrl.reviewCriteria.push({'id':'criteria'+newItemNo});
    };

    topicCtrl.removeChoice = function() {
      var lastItem = topicCtrl.reviewCriteria.length-1;
      topicCtrl.reviewCriteria.splice(lastItem);
    };


    //Create new topic
    topicCtrl.createTopic = function(category,isDraft){

      //Check if we have location details
      var locationDetail = '';

      if(topicCtrl.newTopic.location !== '' ){
        console.log(topicCtrl.newTopic.location);
        locationDetail = {
          place_id: topicCtrl.newTopic.location.details.place_id,
          slug:     Slug.slugify(topicCtrl.newTopic.location.details.name),
          name:     topicCtrl.newTopic.location.details.name,
          address:  topicCtrl.newTopic.location.details.formatted_address,
          lat:      topicCtrl.newTopic.location.details.geometry.location.lat(),
          lng:      topicCtrl.newTopic.location.details.geometry.location.lng(),
          lng:      topicCtrl.newTopic.location.details.geometry.location.lng(),
          lng:      topicCtrl.newTopic.location.details.geometry.location.lng(),
        }
      }

     /* DEBUG FORM VALUE
        var data = {
        type:           topicCtrl.type,
        lang:           topicCtrl.newTopic.lang,
        topic:          topicCtrl.newTopic.topic,
        body:           topicCtrl.newTopic.body,
        category:       category,
        uid:            topicCtrl.uid,
        slug:           Slug.slugify(topicCtrl.newTopic.topic),
        photos:         topicCtrl.imageStrings,
        photos_text:    topicCtrl.imageText,
        location:       locationDetail,
        url:            topicCtrl.newTopic.url,
        draft:          isDraft,
        created:        moment().toISOString(),
        tags:           topicCtrl.newTopic.tags,
        userIP:       topicCtrl.newTopic.ipInfo
      };
      console.log(data);
      */

      topicCtrl.topics.arr.$add({
          type:           topicCtrl.type,
          lang:           topicCtrl.newTopic.lang,
          topic:          topicCtrl.newTopic.topic,
          body:           topicCtrl.newTopic.body,
          category:       category,
          uid:            topicCtrl.uid,
          //slug:           Slug.slugify(topicCtrl.newTopic.topic),
          slug:           topicCtrl.newTopic.topic,
          photos:         topicCtrl.imageStrings,
          photos_text:    topicCtrl.imageText,
          location:       locationDetail,
          url:            topicCtrl.newTopic.url,
          draft:          isDraft,
          created:        moment().toISOString(),
          tags:           topicCtrl.newTopic.tags,
          userIP:         topicCtrl.newTopic.ipInfo,
          review:         topicCtrl.reviewCriteria,
        }).then(function(topic){

          var slugText ='';
          //if we are unable to convert to slug then we use the topic text, else use slug
          if(Slug.slugify(topicCtrl.newTopic.topic) ==''){
            slugText = topicCtrl.newTopic.topic;
          }else{
            slugText = Slug.slugify(topicCtrl.newTopic.topic);
          }

          //Update slug with topic Key
          topicCtrl.topics.getTopicByKey(topic.key()).update({"slug":slugText+topic.key()});

          //Stat update
          topicCtrl.users.userRef(topicCtrl.uid).child('stat/posted/count')
            .set(topicCtrl.profile.stat.posted.count + 1);

          topicCtrl.users.userRef(topicCtrl.uid).child('stat/posted/topics/'+topic.key())
            .push().set(moment().toISOString());

          //If there is location
          if(locationDetail !== ''){

            topicCtrl.places.addChild(locationDetail.place_id)
                      .child(topic.key())
                      .push().set(moment().toISOString());

            topicCtrl.places.addChild(locationDetail.place_id)
              .child('info').set(locationDetail);
          }

          //if there are tags
          if(topicCtrl.newTopic.tags !== null){
            for (var index = 0; index < topicCtrl.newTopic.tags.length; ++index) {
              topicCtrl.tags.addChild(topicCtrl.newTopic.tags[index].text)
                .child(topic.key()).push().set(moment().toISOString());
            }
          }

          //Notify follower
          topicCtrl.noti.notifyFollower(topic.key(),topicCtrl.uid);


          //Reset form here
          topicCtrl.newTopic = {
            body: ''
          };
      });
    };


    //Check if user is already following user
    topicCtrl.checkFollow = function(follow_uid){
      if(topicCtrl.users.checkFollow(topicCtrl.uid,follow_uid)){
        return true;
      }else{
        return false;
      }
    }


    //Follow User
    topicCtrl.followUser = function(follow_uid){

      //Update the person that being follow, credit them for having follower
      topicCtrl.users.getProfile(follow_uid).$loaded().then(function (data) {

        topicCtrl.users.userRef(follow_uid).child('stat/follower/count')
          .set(data.stat.follower.count + 1);

        topicCtrl.users.userRef(follow_uid).child('stat/follower/uid/'+ topicCtrl.uid)
          .push().set(moment().toISOString());
      });

      //Update the person that is following, credit them for having following
      topicCtrl.users.getProfile(topicCtrl.uid).$loaded().then(function (data) {

        topicCtrl.users.userRef(topicCtrl.uid).child('stat/following/count')
          .set(data.stat.follower.count + 1);

        topicCtrl.users.userRef(topicCtrl.uid).child('stat/following/uid/'+ follow_uid)
          .push().set(moment().toISOString());
      });
    }


    //Unfollow User
    topicCtrl.unfollowUser = function(follow_uid){

      //Update the person that being follow, credit them for having follower
      topicCtrl.users.getProfile(follow_uid).$loaded().then(function (data) {

        topicCtrl.users.userRef(follow_uid).child('stat/follower/count')
          .set(data.stat.follower.count - 1);

        topicCtrl.users.userRef(follow_uid).child('stat/follower/uid/'+ topicCtrl.uid).remove();
      });

      //Update the person that is following, credit them for having following
      topicCtrl.users.getProfile(topicCtrl.uid).$loaded().then(function (data) {

        topicCtrl.users.userRef(topicCtrl.uid).child('stat/following/count')
          .set(data.stat.following.count - 1);

        topicCtrl.users.userRef(topicCtrl.uid).child('stat/following/uid/'+ follow_uid).remove();
      });

    }



     //upvote
    topicCtrl.upvote = function(topic){

      if(topic.downvotes != undefined && topic.downvotes[topicCtrl.uid] != undefined){
        topicCtrl.cancelDownvote(topic);
      }
      topicCtrl.topics.upvoteTopic(topic.$id, topicCtrl.uid).$loaded().then(function(value){
        topicCtrl.userUpvotedTopics.child(topic.$id).set(value.$value);

        //Stat update
        topicCtrl.users.getProfile(topic.uid).$loaded().then(function (data) {

        topicCtrl.users.userRef(topic.uid).child('stat/upvoted/count')
          .set(data.stat.upvoted.count + 1);
        topicCtrl.users.userRef(topic.uid).child('stat/upvoted/topics/'+topic.$id)
          .push().set(moment().toISOString());
        });

      });
    };

    topicCtrl.cancelUpvote = function(topic){
      topicCtrl.topics.undoUpvote(topic.$id, topicCtrl.uid);

      topicCtrl.users.getProfile(topic.uid).$loaded().then(function (data) {

        //Stat update
        topicCtrl.users.userRef(topic.uid).child('stat/upvoted/count')
          .set(data.stat.upvoted.count - 1);

        topicCtrl.users.userRef(topic.uid).child('stat/upvoted/topics/'+topic.$id).remove();
      });


      topicCtrl.userUpvotedTopics.child(topic.$id).remove(function(error){
            if (error) {
            console.log("Error:", error);
          } else {
            console.log("Removed successfully!");
          }});
    };

    //downvote
    topicCtrl.downvote = function(topic){
      if(topic.upvotes != undefined && topic.upvotes[topicCtrl.uid] != undefined){
        topicCtrl.cancelUpvote(topic);
      }
      topicCtrl.topics.downvoteTopic(topic.$id, topicCtrl.uid).$loaded().then(function(value){
        topicCtrl.userDownvotedTopics.child(topic.$id).set(value.$value);
      });
    };

    topicCtrl.cancelDownvote = function(topic){
      topicCtrl.topics.undoDownvote(topic.$id, topicCtrl.uid);
      topicCtrl.userDownvotedTopics.child(topic.$id).remove(function(error){
            if (error) {
            console.log("Error:", error);
          } else {
            console.log("Removed successfully!");
          }});
    };

    //follow topic
    topicCtrl.followTopic = function(topic){
      topicCtrl.topics.follow(topic.$id, topicCtrl.uid).$loaded().then(function(value){
        topicCtrl.userFollowing.child(topic.$id).set(value.history[topicCtrl.uid]);
      });
    };

    topicCtrl.unfollowTopic = function(topic){
      topicCtrl.topics.unfollow(topic.$id, topicCtrl.uid);
      topicCtrl.userFollowing.child(topic.$id).remove(function(error){
            if (error) {
            console.log("Error:", error);
          } else {
            console.log("Removed successfully!");
          }});
    };

  }]);


//https://gist.github.com/katowulf/6099042
function moveFbRecord(oldRef, newRef) {
  oldRef.once('value', function (snap) {
    newRef.set(snap.val(), function (error) {
      if (!error) {
        oldRef.remove();
      }
      else if (typeof(console) !== 'undefined' && console.error) {
        console.error(error);
      }
    });
  });
}

angular.module('App')
  // Topic list
  .factory('Topics', ["$firebaseObject", "$firebaseArray", "FirebaseUrl", function ($firebaseObject, $firebaseArray, FirebaseUrl) {
    var ref = new Firebase(FirebaseUrl + 'topics')
    var topics = $firebaseObject(ref)
    var topicsArr = $firebaseArray(ref)
    var topicKey = ''

    var Topics = {
      // Get topic tag
      getTag: function (tag) {
        return $firebaseArray(ref.orderByChild('tags').equalTo(tag))
      },

      // Get topic slug
      getSlug: function (slug) {
        var data = ref.orderByChild('slug').equalTo(slug)
        return $firebaseArray(data)
      },

      // Getting the list of topics created by user_id
      createdBy: function (uid) {
        return $firebaseArray(ref.orderByChild('uid').equalTo(uid))

      },
      refChild: function (child) {
        return ref.child(child)
      },
      countUserTopics: function () {},

      // Getting the list of topic base on category
      list: function (category) {
        var data = ref.orderByChild('category').equalTo(category)
        return $firebaseArray(data)
      },

      name: function (topic_slug) {
        var data = ref.orderByChild('slug').equalTo(topic_slug)
        return $firebaseObject(data)
      },

      // Return topic details in Ref
      fortopicRef: function (topic_slug) {
        return ref.orderByChild('slug').equalTo(topic_slug)
      },

      getTopicByKey: function (topic_key) {
        return new Firebase(FirebaseUrl + 'topics/' + topic_key)
      },

      getTopicBySlug: function (topic_slug) {
        return $firebaseArray(ref.orderByChild('slug').equalTo(topic_slug).limitToFirst(1))
      },

      incrementView: function (topic_slug) {},

      // Return topic details in array
      fortopic: function (topic_slug) {
        return $firebaseArray(Topics.fortopicRef(topic_slug))
      },

      // Reply listing
      replyList: function (topicId) {
        var data = ref.child(topicId + '/replies')
        return $firebaseArray(data)
      },

      // Reply Array
      replyArr: function (topicId) {
        return $firebaseArray(ref.child(topicId + '/replies'))
      },

      // Reply count
      replyCount: function (topicId) {
        return $firebaseObject(ref.child(topicId + '/replies/'))
      },
      replyCountRef: function (topicId) {
        return ref.child(topicId + '/replies/count')
      },

      replyInReply: function (topicId, replyId) {
        return $firebaseArray(ref.child(topicId + '/replies/' + replyId + '/inReply'))
      },

      // Reply in Reply Array
      replyInReplyArr: function (topicId, replyId) {
        // console.log($firebaseArray(ref.child(topicId + '/replies/'+replyId+'/inReply')))
        return $firebaseArray(ref.child(topicId + '/replies/' + replyId + '/inReply'))
      },

      // upvotes
      getUpvotes: function (topicId) {
        return {
          ref: ref.child(topicId + '/upvotes'),
          array: $firebaseArray(ref.child(topicId + '/upvotes'))
        }
      },

      // downvotes
      getDownvotes: function (topicId) {
        return {
          ref: ref.child(topicId + '/downvotes'),
          array: $firebaseArray(ref.child(topicId + '/downvotes'))
        }
      },

      // followers
      getFollowers: function (topicId) {
        return {
          ref: ref.child(topicId + '/followers'),
          obj: $firebaseObject(ref.child(topicId + '/followers'))
        }
      },

      upvoteTopic: function (topicId, uid) {
        ref.child(topicId + '/upvotes').child(uid).set(moment().toISOString())
        return $firebaseObject(ref.child(topicId + '/upvotes').child(uid))
      },

      undoUpvote: function (topicId, uid) {
        ref.child(topicId + '/upvotes').child(uid).remove(function (error) {
          if (error) {
            console.log('Error:', error)
          } else {
            console.log('Removed successfully!')
          }})
        return ref.child(topicId + '/upvotes')
      },

      downvoteTopic: function (topicId, uid) {
        ref.child(topicId + '/downvotes').child(uid).set(moment().toISOString())
        return $firebaseObject(ref.child(topicId + '/downvotes').child(uid))
      },

      undoDownvote: function (topicId, uid) {
        ref.child(topicId + '/downvotes').child(uid).remove(function (error) {
          if (error) {
            console.log('Error:', error)
          } else {
            console.log('Removed successfully!')
          }})
        return ref.child(topicId + '/downvotes')
      },

      follow: function (topicId, uid) {
        ref.child(topicId + '/followers').child('history').child(uid).set(moment().toISOString())
        $firebaseObject(ref.child(topicId + '/followers').child('count')).$loaded().then(function (data) {
          if (data.value === null || data.value === undefined) {
            ref.child(topicId + '/followers').child('count').set(1)
          } else {
            ref.child(topicId + '/followers').child('count').set(data.$value + 1)
          }
        })

        return $firebaseObject(ref.child(topicId + '/followers'))
      },

      unfollow: function (topicId, uid) {
        ref.child(topicId + '/followers').child('history').child(uid).remove(function (error) {
          if (error) {
            console.log('Error:', error)
          } else {
            console.log('Removed successfully!')
            $firebaseObject(ref.child(topicId + '/followers').child('count')).$loaded().then(function (data) {
              ref.child(topicId + '/followers').child('count').set(data.$value - 1)
            })
          }})
        return ref.child(topicId + '/followers')
      },

      getViews: function (topicId) {
        return {
          ref: ref.child(topicId).child('views'),
          obj: $firebaseObject(ref.child(topicId).child('views'))
        }
      },

      latestFeed: function () {
        return $firebaseArray(ref.orderByChild('created').limitToLast(10))
      },

      topicsByTag: function (tag) {
        return $firebaseArray(ref.orderByChild('tags').equalTo(tag))
      },

      // Return array
      arr: $firebaseArray(ref),

      all: topics,
      ref: ref
    };

    return Topics

  }]);

angular.module('App')
  .controller('ProfileCtrl', ["$scope", "$rootScope", "$state", "$filter", "md5", "Auth", "Users", "Topics", "Facebook", "notify", "CateService", "profile", "isOwner", "userPosts", function($scope, $rootScope, $state, $filter, md5,
                                      //Services
                                      Auth,Users,Topics, Facebook,notify,CateService,
                                      //Resolve
                                      profile,isOwner,userPosts){

    console.log("ProfileCtrl");

    var profileCtrl = this;

    //Parser
    profileCtrl.profile   = profile;
    profileCtrl.auth      = Auth;
    profileCtrl.users     = Users;
    profileCtrl.topics    = Topics;
    profileCtrl.facebook  = Facebook;
    profileCtrl.isOwner   = isOwner;
    profileCtrl.cate      = CateService;
    profileCtrl.$state    = $state;
    profileCtrl.userPosts = userPosts;

    profileCtrl.userFeed  = '';
    profileCtrl.feed = '';

    profileCtrl.editInit = 'userEdit';

    profileCtrl.nameExist= false;


    profileCtrl.getUserPost = function(uid){
      profileCtrl.feed = profileCtrl.topics.createdBy(uid);
    }



    /*Link account with facebook*/
    profileCtrl.linkFacebook = function(){
      profileCtrl.facebook.login(function(response) {
        profileCtrl.facebook.getLoginStatus(function(response){
          if(response.status === 'connected') {
            $scope.loggedIn = true;
            profileCtrl.facebook.api('/me', function(response) {
              console.log(response);
            });
          } else {
              console.log("not logged in");
          }
        });
      });
    }


    //The original value from profile
    profileCtrl.oldProfileValue = profileCtrl.profile;


    profileCtrl.userCreated = function(uid){
      return profileCtrl.topics.createdBy(uid);
    }


    //Preset Parameters
    profileCtrl.imageStrings    = [];
    profileCtrl.userCateFollow  = [];
    profileCtrl.cateIsFollow    = [];
    profileCtrl.followList      = '';





    profileCtrl.followCateListArr = function(uid){
      profileCtrl.followList = profileCtrl.cate.followList(uid);
    }

    if(Auth.ref.getAuth()){
      profileCtrl.followCateListArr(Auth.ref.getAuth().uid);
    }

    profileCtrl.followCate = function(index,cate_slug){
      profileCtrl.cateIsFollow[index]  = true;
      profileCtrl.cate.addChild(cate_slug+'/follower')
        .child(Auth.ref.getAuth().uid).push().set(moment().toISOString());
    }





    //Upload Profile image
    profileCtrl.uploadFile = function(files) {
      angular.forEach(files, function (flowFile, i) {
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
          var uri = event.target.result;
          profileCtrl.imageStrings[i] = uri;
          profileCtrl.users.userArrRef(Auth.ref.getAuth().uid).update({"photo": uri})
          notify({message:'Saved',position:'center',duration: 3000 });
        };
        fileReader.readAsDataURL(flowFile.file);
      })
    };


    //Save profile with profileCtrl.profile
    //params: redirect, if exist then redirect after save
    profileCtrl.saveProfile = function(redirect){
      profileCtrl.profile.updated = moment().toISOString();


      if(profileCtrl.location !== null ) {
        locationDetail = {
          place_id: profileCtrl.location.details.place_id,
          name: profileCtrl.location.details.name,
          address: profileCtrl.location.details.formatted_address,
          lat: profileCtrl.location.details.geometry.location.lat(),
          lng: profileCtrl.location.details.geometry.location.lng(),
        }

        profileCtrl.profile.userLocation = locationDetail;
      }

      profileCtrl.profile.$save().then(function() {
        notify({message:'Saved',position:'center',duration: 3000 });
        if(redirect !== undefined){
          $state.go(redirect);
        }
      }).catch(function(error) {
        notify({message:'Error saving data',position:'center',duration: 3000 });
      });
    }


    //Update name
    profileCtrl.updateName = function(){

      profileCtrl.users.userArrRef(Auth.ref.getAuth().uid).update(
        {
          "firstname":  profileCtrl.profile.firstname,
          "lastname":   profileCtrl.profile.lastname,
        }
      )

      profileCtrl.users.userArrRef(Auth.ref.getAuth().uid+'/log').push().set({
        action:   "name_change",
        oldname:  profileCtrl.oldProfileValue.firstname + "-" + profileCtrl.oldProfileValue.lastname,
        created:  moment().toISOString()
      });

      notify({message:'Saved',position:'center',duration: 3000 });
    }


    //Update Bio
    profileCtrl.updateBio = function(){
      profileCtrl.users.userArrRef(Auth.ref.getAuth().uid).update({"biography": profileCtrl.profile.biography})

      notify({message:'Saved',position:'center',duration: 3000 });
    }


    profileCtrl.updateProfile = function(){
      //profileCtrl.profile.emailHash = md5.createHash(auth.password.email);
      profileCtrl.profile.$save().then(function(){
        $state.go('dashboard');
      });
    };


    //Check if user exist, return false if they do
    profileCtrl.checkUsername = function(){

      profileCtrl.users.checkUsernameExist(profileCtrl.profile.displayName).once('value', function(snapshot) {
        if(snapshot.val() !== null){
          return profileCtrl.nameExist=true;
        }else {
          return profileCtrl.nameExist=false;
        }
      });
    }

  }]);

angular.module('App')
  .factory('Users', ["$firebaseArray", "$firebaseObject", "FirebaseUrl", "$http", function ($firebaseArray, $firebaseObject, FirebaseUrl, $http) {
    var usersRef = new Firebase(FirebaseUrl + 'users')
    var users = $firebaseArray(usersRef)

    var Users = {
      getLocationIP: function () {
        return $http({
          url: 'http://ipinfo.io/json',
          method: 'GET'
        })
      },

      getLocationIPData: function () {
        return $http({
          url: 'http://ipinfo.io/json',
          method: 'GET'
        }).then(function (data) {
          return data.data
        })
      },

      profile: function(uid){
        return users.$getRecord(uid);
      },


      //Search and return username
      getProfileByUsername:function(username){
        return $firebaseArray(usersRef.orderByChild('displayName').equalTo(username));
      },

      //Check if username exist, if not return null
      checkUsernameExist:function(username){
        return usersRef.orderByChild('displayName').equalTo(username);
      },


      getProfile: function (uid) {
        return $firebaseObject(usersRef.child(uid))
      },

      getDisplayName: function (uid) {
        if (uid !== null || uid !== '') {
          return users.$getRecord(uid).displayName;
        }
      },

      //Get user Followers
      getFollower:function(uid){
        return usersRef.child(uid+'/stat/follower/uid');
      },

      //Check if user is already following
      checkFollow:function(uid,follow_id){

        var follow=false;
        var ref    = new Firebase(FirebaseUrl+'users/'+uid+'/stat/following/uid/'+follow_id);
        ref.once("value", function(snapshot) {
          follow = snapshot.exists();
        })
        return follow;
      },

      //Change password
      userChangePassword:function(email,oldpass,newpass){

        var ref = new Firebase(FirebaseUrl);
        ref.changePassword({
          email: email,
          oldPassword: oldpass,
          newPassword: newpass
        }, function(error) {
          if (error) {
            switch (error.code) {
              case "INVALID_PASSWORD":
                console.log("The specified user account password is incorrect.");
                break;
              case "INVALID_USER":
                console.log("The specified user account does not exist.");
                break;
              default:
                console.log("Error changing password:", error);
            }
          } else {
            console.log("User password changed successfully!");
          }
        });
      },

      userRef: function (uid) {
        return usersRef.child(uid)
      },

      upvotes: function (uid) {
        return usersRef.child(uid).child('upvotes')
      },

      downvotes: function (uid) {
        return usersRef.child(uid).child('downvotes')
      },

      //User following topic
      following: function (uid) {
        return usersRef.child(uid).child('following')
      },

      userArrRef: function (uid) {
        return usersRef.child(uid)
      },

      all: users
    }

    return Users
  }])

angular.module('App')
  .factory('UniqueIDGenerator', function(){  
    /**
     * Fancy ID generator that creates 20-character string identifiers with the following properties:
     *
     * 1. They're based on timestamp so that they sort *after* any existing ids.
     * 2. They contain 72-bits of random data after the timestamp so that IDs won't collide with other clients' IDs.
     * 3. They sort *lexicographically* (so the timestamp is converted to characters that will sort properly).
     * 4. They're monotonically increasing.  Even if you generate more than one in the same timestamp, the
     *    latter ones will sort after the former ones.  We do this by using the previous random bits
     *    but "incrementing" them by 1 (only in the case of a timestamp collision).
     */
     return {

        generatePushID:function(){
              // Modeled after base64 web-safe chars, but ordered by ASCII.
            var PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

            // Timestamp of last push, used to prevent local collisions if you push twice in one ms.
            var lastPushTime = 0;

            // We generate 72-bits of randomness which get turned into 12 characters and appended to the
            // timestamp to prevent collisions with other clients.  We store the last characters we
            // generated because in the event of a collision, we'll use those same characters except
            // "incremented" by one.
            var lastRandChars = [];

            // return function() {
              var now = new Date().getTime();
              var duplicateTime = (now === lastPushTime);
              lastPushTime = now;

              var timeStampChars = new Array(8);
              for (var i = 7; i >= 0; i--) {
                timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
                // NOTE: Can't use << here because javascript will convert to int and lose the upper bits.
                now = Math.floor(now / 64);
              }
              if (now !== 0) throw new Error('We should have converted the entire timestamp.');

              var id = timeStampChars.join('');

              if (!duplicateTime) {
                for (i = 0; i < 12; i++) {
                  lastRandChars[i] = Math.floor(Math.random() * 64);
                }
              } else {
                // If the timestamp hasn't changed since last push, use the same random number, except incremented by 1.
                for (i = 11; i >= 0 && lastRandChars[i] === 63; i--) {
                  lastRandChars[i] = 0;
                }
                lastRandChars[i]++;
              }
              for (i = 0; i < 12; i++) {
                id += PUSH_CHARS.charAt(lastRandChars[i]);
              }
              if(id.length != 20) throw new Error('Length should be 20.');

              return id;
            // };
        }
      }
  })
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguY29udHJvbGxlci5qcyIsImF1dGguc2VydmljZS5qcyIsImNhdGVnb3J5LmNvbnRyb2xsZXIuanMiLCJjYXRlZ29yeS5zZXJ2aWNlLmpzIiwicG9zdC5zZXJ2aWNlLmpzIiwiZGFzaGJvYXJkLmNvbnRyb2xsZXIuanMiLCJkaXJlY3RpdmVzLmpzIiwiaG9tZS5jb250cm9sbGVyLmpzIiwibGFuZy5qcyIsIm5vdGlmaWNhdGlvbi5jb250cm9sbGVyLmpzIiwibm90aWZpY2F0aW9uLnNlcnZpY2UuanMiLCJwbGFjZS5jb250cm9sbGVyLmpzIiwicGxhY2Uuc2VydmljZS5qcyIsInV0aWxpdGllcy5zZXJ2aWNlLmpzIiwidGFnLmNvbnRyb2xsZXIuanMiLCJ0YWcuc2VydmljZS5qcyIsInRvcGljLWxhbmRpbmcuY29udHJvbGxlci5qcyIsInRvcGljcy5jb250cm9sbGVyLmpzIiwidG9waWNzLnNlcnZpY2UuanMiLCJwcm9maWxlLmNvbnRyb2xsZXIuanMiLCJ1c2Vycy5zZXJ2aWNlLmpzIiwiaGVscGVycy5zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQUtBLElBQUEsTUFBQSxRQUFBLE9BQUEsT0FBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7OztJQUdBO0lBQ0E7SUFDQTs7SUFFQTtJQUNBOzs7O0dBSUEsOEJBQUEsVUFBQSxvQkFBQTtJQUNBLG1CQUFBLGNBQUEsU0FBQTtNQUNBLE1BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxRQUFBO01BQ0EsUUFBQTtNQUNBLFFBQUE7TUFDQSxRQUFBO01BQ0Esd0JBQUE7O01BRUEsc0JBQUEsQ0FBQSxNQUFBO1FBQ0EsT0FBQSxPQUFBLE9B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LEtBQUEsS0FBQSxlQUFBLE1BQUEsWUFBQTtrQkFDQSxPQUFBLEdBQUE7Ozs7O1VBS0Esc0JBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTs7Ozs7T0FLQSxNQUFBLFNBQUE7UUFDQSxLQUFBO1FBQ0EsT0FBQTtVQUNBLElBQUE7WUFDQSxhQUFBOztVQUVBLG9CQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7Ozs7O09BS0EsTUFBQSxZQUFBO1FBQ0EsS0FBQTtRQUNBLE9BQUE7VUFDQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7OztRQUdBLFNBQUE7VUFDQSxrQ0FBQSxVQUFBLFFBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxLQUFBLGVBQUEsS0FBQSxVQUFBLE1BQUE7Y0FDQSxPQUFBLEdBQUE7ZUFDQSxVQUFBLE9BQUE7Y0FDQSxPQUFBOzs7Ozs7SUFNQSxtQkFBQSxVQUFBOzs7R0FHQSxPQUFBLGlCQUFBLFlBQUE7SUFDQSxPQUFBLFVBQUEsT0FBQSxPQUFBLFNBQUE7TUFDQSxJQUFBLFdBQUE7TUFDQSxRQUFBLFFBQUEsT0FBQSxVQUFBLE1BQUE7UUFDQSxTQUFBLEtBQUEsS0FBQSxLQUFBLElBQUE7O01BRUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxHQUFBO1FBQ0EsUUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLElBQUEsQ0FBQTs7TUFFQSxJQUFBLFNBQUEsU0FBQTtNQUNBLE9BQUE7Ozs7R0FJQSxPQUFBLGFBQUEsWUFBQTtJQUNBLE9BQUEsVUFBQSxNQUFBO01BQ0EsT0FBQSxPQUFBLFVBQUEsUUFBQTs7Ozs7R0FLQSxPQUFBLGtCQUFBLFVBQUEsTUFBQTtJQUNBLE9BQUEsVUFBQSxNQUFBO01BQ0EsT0FBQSxPQUFBLEtBQUEsWUFBQSxLQUFBLFFBQUEsT0FBQSxZQUFBOzs7O0dBSUEsU0FBQSxlQUFBOztBQUVBLFNBQUEsTUFBQSxNQUFBO0VBQ0EsUUFBQSxJQUFBO0VBQ0EsT0FBQSxLQUFBLFVBQUEsTUFBQSxNQUFBOzs7O0FBSUEsU0FBQSxRQUFBLE1BQUE7RUFDQSxJQUFBLFFBQUEsTUFBQSxVQUFBLE1BQUEsS0FBQSxXQUFBO0VBQ0EsTUFBQSxRQUFBLFVBQUEsR0FBQTtJQUNBLElBQUEsS0FBQSxRQUFBLE9BQUEsVUFBQTtNQUNBLEtBQUEsSUFBQSxLQUFBLEdBQUE7UUFDQSxJQUFBLEVBQUEsZUFBQSxJQUFBO1VBQ0EsS0FBQSxLQUFBLEVBQUE7Ozs7O0VBS0EsT0FBQTs7O0FDM29CQSxRQUFBLE9BQUE7R0FDQSxXQUFBLHdJQUFBLFNBQUEsT0FBQSxNQUFBLE9BQUEsT0FBQSxXQUFBLFdBQUEsWUFBQTttQ0FDQSxZQUFBLGNBQUE7O0lBRUEsUUFBQSxJQUFBOztJQUVBLElBQUEsV0FBQTs7O0lBR0EsY0FBQTtPQUNBLEtBQUEsVUFBQSxZQUFBO1FBQ0EsUUFBQSxJQUFBOzs7O0lBSUEsU0FBQSxXQUFBO0lBQ0EsU0FBQSxXQUFBO0lBQ0EsU0FBQSxlQUFBOzs7SUFHQSxHQUFBLEtBQUEsSUFBQSxhQUFBLE1BQUE7TUFDQSxTQUFBLFdBQUEsU0FBQSxNQUFBLFdBQUEsS0FBQSxJQUFBLFVBQUE7O1FBRUE7TUFDQSxTQUFBLFNBQUE7Ozs7SUFJQSxTQUFBLE9BQUE7TUFDQSxPQUFBO01BQ0EsVUFBQTs7Ozs7Ozs7Ozs7Ozs7SUFjQSxPQUFBLG1CQUFBLFNBQUE7OztJQUdBLFNBQUEsZUFBQSxVQUFBO01BQ0EsU0FBQSxhQUFBLFlBQUEsU0FBQSxRQUFBOzs7SUFHQSxTQUFBLFlBQUEsVUFBQTtNQUNBLFFBQUEsSUFBQSxlQUFBLFNBQUEsa0JBQUE7Ozs7SUFJQSxPQUFBLE9BQUEsUUFBQSxTQUFBLFVBQUEsVUFBQTtNQUNBLElBQUEsT0FBQSxLQUFBLFNBQUEsR0FBQTtRQUNBLE9BQUEsV0FBQSxlQUFBLE9BQUE7Ozs7OztJQU1BLFNBQUEsYUFBQSxVQUFBLFNBQUE7TUFDQSxXQUFBLElBQUE7O01BRUEsU0FBQSxJQUFBLFlBQUE7O01BRUEsR0FBQSxLQUFBLElBQUEsVUFBQTtRQUNBLFNBQUEsTUFBQSxXQUFBLEtBQUEsSUFBQSxVQUFBLEtBQUEsT0FBQSxDQUFBLE9BQUE7Ozs7O0lBS0EsR0FB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ZUFBQSxVQUFBOztJQUVBLE9BQUE7TUFDQSxZQUFBO01BQ0EsYUFBQTtNQUNBLE9BQUE7UUFDQSxPQUFBOzs7Ozs7O0dBT0EsVUFBQSxhQUFBLFlBQUE7SUFDQSxPQUFBO01BQ0EsWUFBQTtNQUNBLGFBQUE7TUFDQSxPQUFBO1FBQ0EsUUFBQTs7Ozs7O0dBTUEsVUFBQSxvQkFBQSxZQUFBO0lBQ0EsT0FBQTtNQUNBLFlBQUE7TUFDQSxhQUFBO01BQ0EsT0FBQTtRQUNBLE9BQUE7Ozs7Ozs7R0FPQSxVQUFBLGtCQUFBLFdBQUE7RUFDQSxPQUFBO0lBQ0EsU0FBQTtJQUNBLE1BQUEsU0FBQSxPQUFBLFNBQUEsT0FBQSxRQUFBO01BQ0EsSUFBQSxVQUFBLE1BQUEsVUFBQSxTQUFBLE1BQUEsU0FBQSxPQUFBOztNQUVBLE9BQUEsU0FBQSxLQUFBLFNBQUEsT0FBQTtRQUNBLElBQUEsU0FBQSxXQUFBLE1BQUEsU0FBQSxTQUFBO1VBQ0EsTUFBQSxPQUFBLE1BQUEsU0FBQSxHQUFBOztRQUVBLE9BQUE7Ozs7OztBQ2hJQSxRQUFBLE9BQUE7R0FDQSxXQUFBLHFEQUFBLFNBQUEsT0FBQSxTQUFBLE9BQUEsS0FBQTtJQUNBLElBQUEsV0FBQTs7SUFFQSxTQUFBLFNBQUE7SUFDQSxTQUFBLFNBQUE7SUFDQSxTQUFBLFNBQUE7O0lBRUEsUUFBQSxJQUFBOzs7O0FDUkEsUUFBQSxPQUFBO0dBQ0EsT0FBQSxDQUFBLHNCQUFBLFVBQUEsb0JBQUE7SUFDQSxtQkFBQSxhQUFBLE9BQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxtQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7OztNQUdBLGtCQUFBO01BQ0Esa0JBQUE7Ozs7TUFJQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTs7Ozs7TUFLQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7OztNQUdBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTs7OztJQUlBLG1CQUFBLGFBQUEsT0FBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBOzs7SUFHQSxtQkFBQSxrQkFBQTs7O0FDaEdBLFFBQUEsT0FBQTtHQUNBLFdBQUEsNERBQUEsU0FBQSxPQUFBLFNBQUEsT0FBQSxZQUFBO0lBQ0EsSUFBQSxXQUFBOzs7SUFHQSxTQUFBLFNBQUE7SUFDQSxTQUFBLFNBQUE7SUFDQSxTQUFBLGNBQUE7O0lBRUEsU0FBQSxVQUFBLFNBQUEsSUFBQTtNQUNBLE9BQUEsU0FBQSxJQUFBLEtBQUEsS0FBQSxLQUFBOzs7O0FDVkEsUUFBQSxPQUFBOztHQUVBLFFBQUEsOEZBQUEsU0FBQSxpQkFBQSxpQkFBQTttQ0FDQSxNQUFBLGNBQUE7SUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLE9BQUEsZ0JBQUE7SUFDQSxJQUFBLFFBQUE7O0lBRUEsSUFBQSxvQkFBQTs7O0lBR0EsSUFBQSxlQUFBOzs7TUFHQSxtQkFBQSxTQUFBLElBQUE7UUFDQSxJQUFBLE1BQUEsSUFBQSxTQUFBLFlBQUEsZ0JBQUEsSUFBQTtRQUNBLElBQUE7UUFDQSxJQUFBLEdBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxVQUFBLFNBQUE7OztRQUdBLElBQUEsbUJBQUEsSUFBQSxTQUFBLFlBQUEsZ0JBQUE7UUFDQSxpQkFBQSxHQUFBLGNBQUEsVUFBQTtVQUNBLGNBQUEsMEJBQUE7WUFDQSxNQUFBLFNBQUE7WUFDQSxLQUFBO1lBQ0EsTUFBQTtZQUNBLEtBQUE7WUFDQSxNQUFBOztZQUVBLG9CQUFBOzs7UUFHQSxPQUFBOzs7O01BSUEsZUFBQSxTQUFBLFFBQUEsSUFBQTtRQUNBLElBQUEsTUFBQSxNQUFBLFlBQUE7UUFDQSxJQUFBLEtBQUEsU0FBQSxTQUFBLFVBQUE7VUFDQSxTQUFBLFFBQUEsU0FBQSxlQUFBOztZQUVBLGFBQUEsd0JBQUEsUUFBQSxjQUFBOzs7Ozs7TUFNQSxVQUFBLFNBQUEsUUFBQSxJQUFBLFNBQUE7O1FBRUEsUUFBQSxJQUFBLE9BQUE7UUFDQSxRQUFBLElBQUEsYUFBQTs7UUFFQSxhQUFBLFNBQUEsS0FBQSxPQUFBLElBQUE7VUFDQSxZQUFBO1VBQ0EsWUFBQTtVQUNBLFlBQUE7VUFDQSxZQUFBLFNBQUE7Ozs7Ozs7TUFPQSxZQUFBLFNBQUEsSUFBQTtRQUNBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQSxnQkFBQSxJQUFBO1FBQ0EsSUFBQSxJQUFBOzs7Ozs7TUFNQSx3QkFBQSxTQUFBLFFBQUEsSUFBQSxTQUFBOztRQUVBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQSxnQkFBQSxJQUFBO1FBQ0EsSUFBQSxLQUFBLFNBQUEsU0FBQSxVQUFBOztTQUVBLEdBQUEsU0FBQSxTQUFBLE9BQUE7WUFDQSxJQUFBLElBQUE7ZUFDQTtZQUNBLElBQUEsSUFBQSxTQUFBLFFBQUE7O1dBRUEsVUFBQSxhQUFBO1VBQ0EsUUFBQSxJQUFBLHNCQUFBLFlBQUE7Ozs7UUFJQSxhQUFBLFVBQUEsUUFBQSxJQUFBOzs7OztNQUtBLFNBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxJQUFBLE1BQUE7OztNQUdBLFlBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxnQkFBQSxJQUFBLE1BQUE7OztNQUdBLEtBQUEsZUFBQTtNQUNBLEtBQUE7O0lBRUEsT0FBQTs7OztBQ3ZHQSxRQUFBLE9BQUE7R0FDQSxXQUFBLGtKQUFBLFNBQUEsT0FBQSxPQUFBLFlBQUEsV0FBQTs7cUNBRUEsTUFBQSxRQUFBLE1BQUEsT0FBQSxLQUFBO3FDQUNBLGNBQUE7O0lBRUEsSUFBQSxhQUFBO0lBQ0EsUUFBQSxJQUFBO0lBQ0EsV0FBQSxlQUFBOzs7OztBQ1JBLFFBQUEsT0FBQTtHQUNBLFFBQUEsNENBQUEsU0FBQSxnQkFBQSxZQUFBOztJQUVBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsa0JBQUEsSUFBQSxTQUFBLFlBQUE7O0lBRUEsSUFBQSxTQUFBLGVBQUE7O0lBRUEsSUFBQSxTQUFBO01BQ0EsVUFBQSxTQUFBLFVBQUE7UUFDQSxPQUFBLElBQUEsTUFBQTs7O01BR0EscUJBQUEsU0FBQSxVQUFBO1FBQ0EsT0FBQSxnQkFBQSxNQUFBOzs7TUFHQSxZQUFBLFNBQUEsU0FBQTtRQUNBLE9BQUEsSUFBQSxNQUFBLFNBQUE7O01BRUEsS0FBQTs7SUFFQSxPQUFBOzs7QUN0QkEsUUFBQSxPQUFBOzs7R0FHQSxRQUFBLGlFQUFBLFNBQUEsaUJBQUEsZ0JBQUEsWUFBQTtJQUNBLElBQUEsU0FBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsYUFBQSxnQkFBQTtJQUNBLElBQUEsV0FBQSxlQUFBOztJQUVBLElBQUEsV0FBQTtNQUNBLFNBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxPQUFBLElBQUEsTUFBQTtRQUNBLE9BQUEsZ0JBQUE7OztNQUdBLEtBQUE7O0lBRUEsT0FBQTs7Ozs7R0FLQSxRQUFBLCtDQUFBLFNBQUEsZ0JBQUEsWUFBQTtJQUNBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsT0FBQSxlQUFBOztJQUVBLE9BQUE7Ozs7O0dBS0EsUUFBQSw2Q0FBQSxTQUFBLGdCQUFBLFlBQUE7SUFDQSxJQUFBLE1BQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLFVBQUEsZUFBQTs7SUFFQSxJQUFBLFNBQUE7TUFDQSxVQUFBLFNBQUEsS0FBQTtRQUNBLE9BQUEsSUFBQSxNQUFBOztNQUVBLEtBQUE7TUFDQSxLQUFBOztJQUVBLE9BQUE7OztBQ3pDQSxRQUFBLE9BQUE7R0FDQSxXQUFBLDhFQUFBLFNBQUEsTUFBQSxPQUFBLE9BQUE7O2tDQUVBLFdBQUEsU0FBQTs7SUFFQSxJQUFBLFVBQUE7SUFDQSxRQUFBLGNBQUE7SUFDQSxRQUFBLGNBQUE7Ozs7QUNQQSxRQUFBLE9BQUE7R0FDQSxRQUFBLG1FQUFBLFNBQUEsZ0JBQUEsaUJBQUEsYUFBQSxHQUFBOztJQUVBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsT0FBQSxlQUFBOztJQUVBLElBQUEsT0FBQTs7TUFFQSxVQUFBLFNBQUEsVUFBQTtRQUNBLE9BQUEsSUFBQSxNQUFBOzs7TUFHQSxTQUFBLFlBQUE7UUFDQSxPQUFBLGVBQUE7OztNQUdBLFVBQUEsU0FBQSxJQUFBO1FBQ0EsT0FBQSxJQUFBLE1BQUE7OztNQUdBLGFBQUEsU0FBQSxJQUFBO1FBQ0EsT0FBQSxnQkFBQSxJQUFBLE1BQUE7OztNQUdBLFVBQUEsU0FBQSxJQUFBO1FBQ0EsSUFBQSxXQUFBLEdBQUE7O1FBRUEsSUFBQSxLQUFBLElBQUEsU0FBQTtRQUNBLElBQUEsVUFBQTs7UUFFQSxPQUFBLEdBQUEsTUFBQSxRQUFBO1dBQ0EsR0FBQSxlQUFBLFNBQUEsUUFBQTtZQUNBLEdBQUEsTUFBQTtlQUNBLGFBQUE7ZUFDQSxRQUFBO2VBQ0EsR0FBQSxlQUFBLFNBQUEsV0FBQTtnQkFDQSxTQUFBOztnQkFFQSxPQUFBLE9BQUEsSUFBQSxRQUFBLE9BQUEsVUFBQTs7Ozs7O01BTUEsS0FBQTs7O0lBR0EsT0FBQTs7O0FDL0NBLFFBQUEsT0FBQTtHQUNBLFdBQUEsNklBQUEsVUFBQSxRQUFBLFFBQUEsTUFBQSxRQUFBLE1BQUE7OzRDQUVBLFFBQUEsY0FBQSxXQUFBLFVBQUEsV0FBQTs7SUFFQSxJQUFBLG1CQUFBOzs7SUFHQSxpQkFBQSxlQUFBO0lBQ0EsaUJBQUEsZUFBQTtJQUNBLGlCQUFBLGVBQUE7SUFDQSxpQkFBQSxlQUFBO0lBQ0EsaUJBQUEsZUFBQTtJQUNBLGlCQUFBLGVBQUE7SUFDQSxpQkFBQSxlQUFBO0lBQ0EsaUJBQUEsZUFBQTs7Ozs7O0lBTUEsaUJBQUEsYUFBQTtJQUNBLGlCQUFBLGVBQUEsVUFBQTs7TUFFQSxJQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsaUJBQUEsVUFBQSxPQUFBLElBQUE7UUFDQSxJQUFBLFVBQUEsaUJBQUEsVUFBQSxHQUFBO1FBQ0EsSUFBQSxVQUFBLGlCQUFBLFVBQUEsR0FBQTtRQUNBLGlCQUFBLFdBQUEsS0FBQSxpQkFBQSxPQUFBLGFBQUEsUUFBQTs7OztJQUlBLGlCQUFBOzs7QUMvQkEsUUFBQSxPQUFBO0dBQ0EsV0FBQSw0TkFBQSxTQUFBLE9BQUEsT0FBQSxZQUFBLFdBQUE7b0NBQ0EsTUFBQSxZQUFBLFdBQUE7O29DQUVBLFlBQUEsTUFBQSxRQUFBLE1BQUE7b0NBQ0EsS0FBQSxRQUFBLFVBQUEsUUFBQTs7SUFFQSxRQUFBLElBQUE7O0lBRUEsSUFBQSxZQUFBOzs7O0lBSUEsVUFBQSxZQUFBO0lBQ0EsVUFBQSxZQUFBO0lBQ0EsVUFBQSxZQUFBO0lBQ0EsVUFBQSxZQUFBO0lBQ0EsVUFBQSxZQUFBO0lBQ0EsVUFBQSxZQUFBO0lBQ0EsVUFBQSxZQUFBO0lBQ0EsVUFBQSxZQUFBOztJQUVBLEdBQUEsVUFBQSxLQUFBLElBQUEsYUFBQSxNQUFBO01BQ0EsVUFBQSxXQUFBLFVBQUEsTUFBQSxXQUFBLFVBQUEsS0FBQSxJQUFBLFVBQUE7TUFDQSxVQUFBLE1BQUEsVUFBQSxRQUFBO01BQ0EsVUFBQSxVQUFBLFVBQUEsTUFBQSxRQUFBLFVBQUE7TUFDQSxVQUFBLG9CQUFBLFVBQUEsTUFBQSxRQUFBLFVBQUE7TUFDQSxVQUFBLHNCQUFBLFVBQUEsTUFBQSxVQUFBLFVBQUE7TUFDQSxVQUFBLGdCQUFBLFVBQUEsTUFBQSxVQUFBLFVBQUE7O1FBRUE7TUFDQSxVQUFBLFNBQUE7TUFDQSxVQUFBLE1BQUE7TUFDQSxVQUFBLFVBQUE7Ozs7OztJQU1BLFVBQUEsZ0JBQUE7SUFDQSxVQUFBLGdCQUFBO0lBQ0EsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBLGdCQUFBO0lBQ0EsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBLGVBQUE7SUFDQSxVQUFBLGdCQUFBOzs7SUFHQSxVQUFBLGdCQUFBO01BQ0EsWUFBQTtNQUNBLFFBQUE7TUFDQSxVQUFBO01BQ0EsUUFBQTtNQUNBLFFBQUE7Ozs7O0lBS0EsVUFBQSxpQkFBQSxVQUFBOztNQUVBLElBQUEsV0FBQSxPQUFBLEtBQUEsVUFBQSxlQUFBO01BQ0EsSUFBQSxNQUFBO01BQ0EsSUFBQSxJQUFBLEVBQUEsRUFBQSxFQUFBLFNBQUEsSUFBQTtRQUNBLE1BQUEsTUFBQSxVQUFBLGNBQUE7OztNQUdBLFVBQUEscUJBQUEsSUFBQTs7TUFFQSxRQUFBLElBQUEsVUFBQTs7TUFFQSxVQUFBLGdCQUFBLEVBQUEsS0FBQSxVQUFBLG9CQUFBLE1BQUEsVUFBQTs7Ozs7SUFLQSxVQUFBLGlCQUFBLFNBQUEsS0FBQTtNQUNBLEdBQUE7TUFDQTtNQUNBLElBQUEsS0FBQTtNQUNBLElBQUEsSUFBQSxFQUFBLEVBQUEsRUFBQSxLQUFBLE9BQUEsSUFBQTtRQUNBLE1BQUEsTUFBQSxLQUFBLEdBQUE7O01BRUEsT0FBQSxJQUFBLEtBQUE7Ozs7OztJQU1BLFdBQUEsQ0FBQSxjQUFBLGFBQUEsa0JBQUEsbUJBQUEsS0FBQSxVQUFBLGNBQUE7TUFDQSxVQUFBLGNBQUEsYUFBQTtNQUNBLFVBQUEsY0FBQSxhQUFBO01BQ0EsVUFBQSxjQUFBLGFBQUE7TUFDQSxVQUFBLHFCQUFBLGFBQUE7Ozs7SUFJQSxVQUFBLFdBQUEsU0FBQSxPQUFBO01BQ0EsR0FBQSxTQUFBLEtBQUE7Ozs7Ozs7OztJQVNBLFVBQUEsY0FBQSxTQUFBLElBQUE7TUFDQSxJQUFBLGdCQUFBLENBQUEsU0FBQSxTQUFBLFNBQUEsVUFBQSxPQUFBO01BQ0EsVUFBQSxLQUFBOztVQUVBLGFBQUE7VUFDQSxRQUFBLFFBQUEsUUFBQSxTQUFBO1VBQ0EsYUFBQTtVQUNBLHFCQUFBO1VBQ0EsWUFBQTs7Ozs7O0lBTUEsVUFBQSxhQUFBLFNBQUEsS0FBQTs7TUFFQSxRQUFBLElBQUEsVUFBQTtNQUNBLE9BQUEsVUFBQTs7OztJQUlBLFVBQUEsV0FBQSxTQUFBLE9BQUE7TUFDQSxVQUFBLFdBQUE7TUFDQSxJQUFBLE9BQUE7TUFDQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsTUFBQSxRQUFBLEtBQUE7UUFDQSxLQUFBLEtBQUEsTUFBQTs7TUFFQSxRQUFBLElBQUE7TUFDQSxPQUFBOzs7SUFHQSxVQUFBLFdBQUEsU0FBQSxPQUFBO01BQ0EsUUFBQSxJQUFBLFVBQUEsS0FBQTs7Ozs7Ozs7OztJQVVBLFVBQUEsYUFBQSxTQUFBLE1BQUEsT0FBQTtNQUNBLFFBQUEsUUFBQSxPQUFBLFVBQUEsVUFBQSxPQUFBO1FBQ0EsSUFBQSxhQUFBLElBQUE7UUFDQSxXQUFBLFNBQUEsVUFBQSxPQUFBO1VBQ0EsSUFBQSxNQUFBLE1BQUEsT0FBQTtVQUNBLFVBQUEsYUFBQSxTQUFBOztRQUVBLFdBQUEsY0FBQSxTQUFBOzs7Ozs7SUFNQSxVQUFBLG9CQUFBLFNBQUEsR0FBQSxZQUFBLElBQUE7O01BRUEsSUFBQSxVQUFBLFVBQUE7U0FDQSxNQUFBLFVBQUE7U0FDQSxZQUFBLFVBQUE7U0FDQSxZQUFBO1NBQ0EsR0FBQSxVQUFBO1NBQ0EsT0FBQSxVQUFBO01BQ0EsVUFBQSxLQUFBLFNBQUEsS0FBQSxXQUFBO1FBQ0EsR0FBQSxVQUFBLFlBQUEsWUFBQSxLQUFBO1VBQ0EsT0FBQSxHQUFBOzs7Ozs7O0lBT0EsVUFBQSxjQUFBLFNBQUEsWUFBQSxJQUFBOztNQUVBLEdBQUEsZUFBQSxVQUFBLElBQUE7UUFDQSxhQUFBLFVBQUEsT0FBQSxTQUFBLElBQUEsTUFBQSxVQUFBLFFBQUEsU0FBQSxJQUFBO1FBQ0EsT0FBQTtZQUNBO1FBQ0EsT0FBQTs7Ozs7O0lBTUEsVUFBQSxRQUFBLFNBQUEsU0FBQTs7TUFFQSxVQUFBLE9BQUEsU0FBQSxTQUFBLEtBQUEsS0FBQTtRQUNBLFVBQUEsU0FBQTtRQUNBLFVBQUEsVUFBQSxTQUFBO1FBQ0EsVUFBQSxVQUFBO1FBQ0EsVUFBQSxVQUFBO1FBQ0EsVUFBQSxTQUFBO1NBQ0EsS0FBQSxVQUFBOzs7UUFHQSxVQUFBLEtBQUEsd0JBQUEsU0FBQSxJQUFBLFNBQUEsSUFBQSxVQUFBOzs7Ozs7OztNQVFBLFVBQUEsT0FBQSxXQUFBLFNBQUEsS0FBQSxVQUFBLEtBQUEsU0FBQSxLQUFBO1FBQ0EsR0FBQSxDQUFBLEtBQUEsTUFBQTtVQUNBLFVBQUEsT0FBQSxjQUFBLFNBQUEsS0FBQSxJQUFBO2FBQ0E7VUFDQSxVQUFBLE9BQUEsY0FBQSxTQUFBO2FBQ0EsSUFBQSxLQUFBLE9BQUE7Ozs7OztNQU1BLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBO1NBQ0EsSUFBQSxVQUFBLFFBQUEsS0FBQSxRQUFBLFFBQUE7O01BRUEsVUFBQSxNQUFBLFFBQUEsVUFBQSxLQUFBLE1BQUEsdUJBQUEsU0FBQTtTQUNBLE9BQUEsSUFBQSxTQUFBOzs7Ozs7SUFNQSxVQUFBLGVBQUEsU0FBQSxRQUFBLFFBQUE7TUFDQSxVQUFBLE9BQUEsZ0JBQUEsUUFBQSxTQUFBLEtBQUE7UUFDQSxVQUFBLFVBQUEsYUFBQTtRQUNBLFVBQUEsVUFBQTtRQUNBLFVBQUEsU0FBQTs7Ozs7O0lBTUEsVUFBQSxlQUFBLFdBQUE7TUFDQSxJQUFBLFlBQUEsVUFBQSxlQUFBLE9BQUE7TUFDQSxVQUFBLGVBQUEsS0FBQSxDQUFBLEtBQUEsV0FBQTs7O0lBR0EsVUFBQSxlQUFBLFdBQUE7TUFDQSxJQUFBLFdBQUEsVUFBQSxlQUFBLE9BQUE7TUFDQSxVQUFBLGVBQUEsT0FBQTs7Ozs7SUFLQSxVQUFBLGNBQUEsU0FBQSxTQUFBLFFBQUE7OztNQUdBLElBQUEsaUJBQUE7O01BRUEsR0FBQSxVQUFBLFNBQUEsYUFBQSxJQUFBO1FBQ0EsUUFBQSxJQUFBLFVBQUEsU0FBQTtRQUNBLGlCQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBO1VBQ0EsVUFBQSxLQUFBLFFBQUEsVUFBQSxTQUFBLFNBQUEsUUFBQTtVQUNBLFVBQUEsVUFBQSxTQUFBLFNBQUEsUUFBQTtVQUNBLFVBQUEsVUFBQSxTQUFBLFNBQUEsUUFBQTtVQUNBLFVBQUEsVUFBQSxTQUFBLFNBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxVQUFBLFVBQUEsU0FBQSxTQUFBLFFBQUEsU0FBQSxTQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQTtVQUNBLFVBQUEsVUFBQSxTQUFBLFNBQUEsUUFBQSxTQUFBLFNBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUF5QkEsVUFBQSxPQUFBLElBQUEsS0FBQTtVQUNBLGdCQUFBLFVBQUE7VUFDQSxnQkFBQSxVQUFBLFNBQUE7VUFDQSxnQkFBQSxVQUFBLFNBQUE7VUFDQSxnQkFBQSxVQUFBLFNBQUE7VUFDQSxnQkFBQTtVQUNBLGdCQUFBLFVBQUE7O1VBRUEsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUEsVUFBQTtVQUNBLGdCQUFBLFVBQUE7VUFDQSxnQkFBQTtVQUNBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBO1VBQ0EsZ0JBQUEsU0FBQTtVQUNBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBLFVBQUE7V0FDQSxLQUFBLFNBQUEsTUFBQTs7VUFFQSxJQUFBLFVBQUE7O1VBRUEsR0FBQSxLQUFBLFFBQUEsVUFBQSxTQUFBLFNBQUEsR0FBQTtZQUNBLFdBQUEsVUFBQSxTQUFBO2VBQ0E7WUFDQSxXQUFBLEtBQUEsUUFBQSxVQUFBLFNBQUE7Ozs7VUFJQSxVQUFBLE9BQUEsY0FBQSxNQUFBLE9BQUEsT0FBQSxDQUFBLE9BQUEsU0FBQSxNQUFBOzs7VUFHQSxVQUFBLE1BQUEsUUFBQSxVQUFBLEtBQUEsTUFBQTthQUNBLElBQUEsVUFBQSxRQUFBLEtBQUEsT0FBQSxRQUFBOztVQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBLHNCQUFBLE1BQUE7YUFDQSxPQUFBLElBQUEsU0FBQTs7O1VBR0EsR0FBQSxtQkFBQSxHQUFBOztZQUVBLFVBQUEsT0FBQSxTQUFBLGVBQUE7dUJBQ0EsTUFBQSxNQUFBO3VCQUNBLE9BQUEsSUFBQSxTQUFBOztZQUVBLFVBQUEsT0FBQSxTQUFBLGVBQUE7ZUFDQSxNQUFBLFFBQUEsSUFBQTs7OztVQUlBLEdBQUEsVUFBQSxTQUFBLFNBQUEsS0FBQTtZQUNBLEtBQUEsSUFBQSxRQUFBLEdBQUEsUUFBQSxVQUFBLFNBQUEsS0FBQSxRQUFBLEVBQUEsT0FBQTtjQUNBLFVBQUEsS0FBQSxTQUFBLFVBQUEsU0FBQSxLQUFBLE9BQUE7aUJBQ0EsTUFBQSxNQUFBLE9BQUEsT0FBQSxJQUFBLFNBQUE7Ozs7O1VBS0EsVUFBQSxLQUFBLGVBQUEsTUFBQSxNQUFBLFVBQUE7Ozs7VUFJQSxVQUFBLFdBQUE7WUFDQSxNQUFBOzs7Ozs7O0lBT0EsVUFBQSxjQUFBLFNBQUEsV0FBQTtNQUNBLEdBQUEsVUFBQSxNQUFBLFlBQUEsVUFBQSxJQUFBLFlBQUE7UUFDQSxPQUFBO1dBQ0E7UUFDQSxPQUFBOzs7Ozs7SUFNQSxVQUFBLGFBQUEsU0FBQSxXQUFBOzs7TUFHQSxVQUFBLE1BQUEsV0FBQSxZQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsWUFBQSxNQUFBO1dBQ0EsSUFBQSxLQUFBLEtBQUEsU0FBQSxRQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFlBQUEsTUFBQSxzQkFBQSxVQUFBO1dBQ0EsT0FBQSxJQUFBLFNBQUE7Ozs7TUFJQSxVQUFBLE1BQUEsV0FBQSxVQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxVQUFBLEtBQUEsTUFBQTtXQUNBLElBQUEsS0FBQSxLQUFBLFNBQUEsUUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxVQUFBLEtBQUEsTUFBQSx1QkFBQTtXQUNBLE9BQUEsSUFBQSxTQUFBOzs7Ozs7SUFNQSxVQUFBLGVBQUEsU0FBQSxXQUFBOzs7TUFHQSxVQUFBLE1BQUEsV0FBQSxZQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsWUFBQSxNQUFBO1dBQ0EsSUFBQSxLQUFBLEtBQUEsU0FBQSxRQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFlBQUEsTUFBQSxzQkFBQSxVQUFBLEtBQUE7Ozs7TUFJQSxVQUFBLE1BQUEsV0FBQSxVQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxVQUFBLEtBQUEsTUFBQTtXQUNBLElBQUEsS0FBQSxLQUFBLFVBQUEsUUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxVQUFBLEtBQUEsTUFBQSx1QkFBQSxZQUFBOzs7Ozs7OztJQVFBLFVBQUEsU0FBQSxTQUFBLE1BQUE7O01BRUEsR0FBQSxNQUFBLGFBQUEsYUFBQSxNQUFBLFVBQUEsVUFBQSxRQUFBLFVBQUE7UUFDQSxVQUFBLGVBQUE7O01BRUEsVUFBQSxPQUFBLFlBQUEsTUFBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLEtBQUEsU0FBQSxNQUFBO1FBQ0EsVUFBQSxrQkFBQSxNQUFBLE1BQUEsS0FBQSxJQUFBLE1BQUE7OztRQUdBLFVBQUEsTUFBQSxXQUFBLE1BQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxNQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLE1BQUEsS0FBQSxNQUFBO1dBQ0EsSUFBQSxLQUFBLEtBQUEsUUFBQSxRQUFBO1FBQ0EsVUFBQSxNQUFBLFFBQUEsTUFBQSxLQUFBLE1BQUEsdUJBQUEsTUFBQTtXQUNBLE9BQUEsSUFBQSxTQUFBOzs7Ozs7SUFNQSxVQUFBLGVBQUEsU0FBQSxNQUFBO01BQ0EsVUFBQSxPQUFBLFdBQUEsTUFBQSxLQUFBLFVBQUE7O01BRUEsVUFBQSxNQUFBLFdBQUEsTUFBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7OztRQUdBLFVBQUEsTUFBQSxRQUFBLE1BQUEsS0FBQSxNQUFBO1dBQ0EsSUFBQSxLQUFBLEtBQUEsUUFBQSxRQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLE1BQUEsS0FBQSxNQUFBLHVCQUFBLE1BQUEsS0FBQTs7OztNQUlBLFVBQUEsa0JBQUEsTUFBQSxNQUFBLEtBQUEsT0FBQSxTQUFBLE1BQUE7WUFDQSxJQUFBLE9BQUE7WUFDQSxRQUFBLElBQUEsVUFBQTtpQkFDQTtZQUNBLFFBQUEsSUFBQTs7Ozs7SUFLQSxVQUFBLFdBQUEsU0FBQSxNQUFBO01BQ0EsR0FBQSxNQUFBLFdBQUEsYUFBQSxNQUFBLFFBQUEsVUFBQSxRQUFBLFVBQUE7UUFDQSxVQUFBLGFBQUE7O01BRUEsVUFBQSxPQUFBLGNBQUEsTUFBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLEtBQUEsU0FBQSxNQUFBO1FBQ0EsVUFBQSxvQkFBQSxNQUFBLE1BQUEsS0FBQSxJQUFBLE1BQUE7Ozs7SUFJQSxVQUFBLGlCQUFBLFNBQUEsTUFBQTtNQUNBLFVBQUEsT0FBQSxhQUFBLE1BQUEsS0FBQSxVQUFBO01BQ0EsVUFBQSxvQkFBQSxNQUFBLE1BQUEsS0FBQSxPQUFBLFNBQUEsTUFBQTtZQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsSUFBQSxVQUFBO2lCQUNBO1lBQ0EsUUFBQSxJQUFBOzs7OztJQUtBLFVBQUEsY0FBQSxTQUFBLE1BQUE7TUFDQSxVQUFBLE9BQUEsT0FBQSxNQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsS0FBQSxTQUFBLE1BQUE7UUFDQSxVQUFBLGNBQUEsTUFBQSxNQUFBLEtBQUEsSUFBQSxNQUFBLFFBQUEsVUFBQTs7OztJQUlBLFVBQUEsZ0JBQUEsU0FBQSxNQUFBO01BQ0EsVUFBQSxPQUFBLFNBQUEsTUFBQSxLQUFBLFVBQUE7TUFDQSxVQUFBLGNBQUEsTUFBQSxNQUFBLEtBQUEsT0FBQSxTQUFBLE1BQUE7WUFDQSxJQUFBLE9BQUE7WUFDQSxRQUFBLElBQUEsVUFBQTtpQkFDQTtZQUNBLFFBQUEsSUFBQTs7Ozs7Ozs7QUFRQSxTQUFBLGFBQUEsUUFBQSxRQUFBO0VBQ0EsT0FBQSxLQUFBLFNBQUEsVUFBQSxNQUFBO0lBQ0EsT0FBQSxJQUFBLEtBQUEsT0FBQSxVQUFBLE9BQUE7TUFDQSxJQUFBLENBQUEsT0FBQTtRQUNBLE9BQUE7O1dBRUEsSUFBQSxPQUFBLGFBQUEsZUFBQSxRQUFBLE9BQUE7UUFDQSxRQUFBLE1BQUE7Ozs7OztBQ2pnQkEsUUFBQSxPQUFBOztHQUVBLFFBQUEsK0RBQUEsVUFBQSxpQkFBQSxnQkFBQSxhQUFBO0lBQ0EsSUFBQSxNQUFBLElBQUEsU0FBQSxjQUFBO0lBQ0EsSUFBQSxTQUFBLGdCQUFBO0lBQ0EsSUFBQSxZQUFBLGVBQUE7SUFDQSxJQUFBLFdBQUE7O0lBRUEsSUFBQSxTQUFBOztNQUVBLFFBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxRQUFBLFFBQUE7Ozs7TUFJQSxTQUFBLFVBQUEsTUFBQTtRQUNBLElBQUEsT0FBQSxJQUFBLGFBQUEsUUFBQSxRQUFBO1FBQ0EsT0FBQSxlQUFBOzs7O01BSUEsV0FBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLGVBQUEsSUFBQSxhQUFBLE9BQUEsUUFBQTs7O01BR0EsVUFBQSxVQUFBLE9BQUE7UUFDQSxPQUFBLElBQUEsTUFBQTs7TUFFQSxpQkFBQSxZQUFBOzs7TUFHQSxNQUFBLFVBQUEsVUFBQTtRQUNBLElBQUEsT0FBQSxJQUFBLGFBQUEsWUFBQSxRQUFBO1FBQ0EsT0FBQSxlQUFBOzs7TUFHQSxNQUFBLFVBQUEsWUFBQTtRQUNBLElBQUEsT0FBQSxJQUFBLGFBQUEsUUFBQSxRQUFBO1FBQ0EsT0FBQSxnQkFBQTs7OztNQUlBLGFBQUEsVUFBQSxZQUFBO1FBQ0EsT0FBQSxJQUFBLGFBQUEsUUFBQSxRQUFBOzs7TUFHQSxlQUFBLFVBQUEsV0FBQTtRQUNBLE9BQUEsSUFBQSxTQUFBLGNBQUEsWUFBQTs7O01BR0EsZ0JBQUEsVUFBQSxZQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxRQUFBLFFBQUEsWUFBQSxhQUFBOzs7TUFHQSxlQUFBLFVBQUEsWUFBQTs7O01BR0EsVUFBQSxVQUFBLFlBQUE7UUFDQSxPQUFBLGVBQUEsT0FBQSxZQUFBOzs7O01BSUEsV0FBQSxVQUFBLFNBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxNQUFBLFVBQUE7UUFDQSxPQUFBLGVBQUE7Ozs7TUFJQSxVQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUEsZUFBQSxJQUFBLE1BQUEsVUFBQTs7OztNQUlBLFlBQUEsVUFBQSxTQUFBO1FBQ0EsT0FBQSxnQkFBQSxJQUFBLE1BQUEsVUFBQTs7TUFFQSxlQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUEsSUFBQSxNQUFBLFVBQUE7OztNQUdBLGNBQUEsVUFBQSxTQUFBLFNBQUE7UUFDQSxPQUFBLGVBQUEsSUFBQSxNQUFBLFVBQUEsY0FBQSxVQUFBOzs7O01BSUEsaUJBQUEsVUFBQSxTQUFBLFNBQUE7O1FBRUEsT0FBQSxlQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsVUFBQTs7OztNQUlBLFlBQUEsVUFBQSxTQUFBO1FBQ0EsT0FBQTtVQUNBLEtBQUEsSUFBQSxNQUFBLFVBQUE7VUFDQSxPQUFBLGVBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7O01BS0EsY0FBQSxVQUFBLFNBQUE7UUFDQSxPQUFBO1VBQ0EsS0FBQSxJQUFBLE1BQUEsVUFBQTtVQUNBLE9BQUEsZUFBQSxJQUFBLE1BQUEsVUFBQTs7Ozs7TUFLQSxjQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUE7VUFDQSxLQUFBLElBQUEsTUFBQSxVQUFBO1VBQ0EsS0FBQSxnQkFBQSxJQUFBLE1BQUEsVUFBQTs7OztNQUlBLGFBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxZQUFBLE1BQUEsS0FBQSxJQUFBLFNBQUE7UUFDQSxPQUFBLGdCQUFBLElBQUEsTUFBQSxVQUFBLFlBQUEsTUFBQTs7O01BR0EsWUFBQSxVQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsTUFBQSxVQUFBLFlBQUEsTUFBQSxLQUFBLE9BQUEsVUFBQSxPQUFBO1VBQ0EsSUFBQSxPQUFBO1lBQ0EsUUFBQSxJQUFBLFVBQUE7aUJBQ0E7WUFDQSxRQUFBLElBQUE7O1FBRUEsT0FBQSxJQUFBLE1BQUEsVUFBQTs7O01BR0EsZUFBQSxVQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxLQUFBLElBQUEsU0FBQTtRQUNBLE9BQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUEsY0FBQSxNQUFBOzs7TUFHQSxjQUFBLFVBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxNQUFBLFVBQUEsY0FBQSxNQUFBLEtBQUEsT0FBQSxVQUFBLE9BQUE7VUFDQSxJQUFBLE9BQUE7WUFDQSxRQUFBLElBQUEsVUFBQTtpQkFDQTtZQUNBLFFBQUEsSUFBQTs7UUFFQSxPQUFBLElBQUEsTUFBQSxVQUFBOzs7TUFHQSxRQUFBLFVBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxNQUFBLFVBQUEsY0FBQSxNQUFBLFdBQUEsTUFBQSxLQUFBLElBQUEsU0FBQTtRQUNBLGdCQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxVQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7VUFDQSxJQUFBLEtBQUEsVUFBQSxRQUFBLEtBQUEsVUFBQSxXQUFBO1lBQ0EsSUFBQSxNQUFBLFVBQUEsY0FBQSxNQUFBLFNBQUEsSUFBQTtpQkFDQTtZQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxTQUFBLElBQUEsS0FBQSxTQUFBOzs7O1FBSUEsT0FBQSxnQkFBQSxJQUFBLE1BQUEsVUFBQTs7O01BR0EsVUFBQSxVQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxXQUFBLE1BQUEsS0FBQSxPQUFBLFVBQUEsT0FBQTtVQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsSUFBQSxVQUFBO2lCQUNBO1lBQ0EsUUFBQSxJQUFBO1lBQ0EsZ0JBQUEsSUFBQSxNQUFBLFVBQUEsY0FBQSxNQUFBLFVBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTtjQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxTQUFBLElBQUEsS0FBQSxTQUFBOzs7UUFHQSxPQUFBLElBQUEsTUFBQSxVQUFBOzs7TUFHQSxVQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUE7VUFDQSxLQUFBLElBQUEsTUFBQSxTQUFBLE1BQUE7VUFDQSxLQUFBLGdCQUFBLElBQUEsTUFBQSxTQUFBLE1BQUE7Ozs7TUFJQSxZQUFBLFlBQUE7UUFDQSxPQUFBLGVBQUEsSUFBQSxhQUFBLFdBQUEsWUFBQTs7O01BR0EsYUFBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLGVBQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTs7OztNQUlBLEtBQUEsZUFBQTs7TUFFQSxLQUFBO01BQ0EsS0FBQTs7O0lBR0EsT0FBQTs7OztBQ2hNQSxRQUFBLE9BQUE7R0FDQSxXQUFBLHVLQUFBLFNBQUEsUUFBQSxZQUFBLFFBQUEsU0FBQTs7c0NBRUEsS0FBQSxNQUFBLFFBQUEsU0FBQSxPQUFBOztzQ0FFQSxRQUFBLFFBQUEsVUFBQTs7SUFFQSxRQUFBLElBQUE7O0lBRUEsSUFBQSxjQUFBOzs7SUFHQSxZQUFBLFlBQUE7SUFDQSxZQUFBLFlBQUE7SUFDQSxZQUFBLFlBQUE7SUFDQSxZQUFBLFlBQUE7SUFDQSxZQUFBLFlBQUE7SUFDQSxZQUFBLFlBQUE7SUFDQSxZQUFBLFlBQUE7SUFDQSxZQUFBLFlBQUE7SUFDQSxZQUFBLFlBQUE7O0lBRUEsWUFBQSxZQUFBO0lBQ0EsWUFBQSxPQUFBOztJQUVBLFlBQUEsV0FBQTs7SUFFQSxZQUFBLFdBQUE7OztJQUdBLFlBQUEsY0FBQSxTQUFBLElBQUE7TUFDQSxZQUFBLE9BQUEsWUFBQSxPQUFBLFVBQUE7Ozs7OztJQU1BLFlBQUEsZUFBQSxVQUFBO01BQ0EsWUFBQSxTQUFBLE1BQUEsU0FBQSxVQUFBO1FBQ0EsWUFBQSxTQUFBLGVBQUEsU0FBQSxTQUFBO1VBQ0EsR0FBQSxTQUFBLFdBQUEsYUFBQTtZQUNBLE9BQUEsV0FBQTtZQUNBLFlBQUEsU0FBQSxJQUFBLE9BQUEsU0FBQSxVQUFBO2NBQ0EsUUFBQSxJQUFBOztpQkFFQTtjQUNBLFFBQUEsSUFBQTs7Ozs7Ozs7SUFRQSxZQUFBLGtCQUFBLFlBQUE7OztJQUdBLFlBQUEsY0FBQSxTQUFBLElBQUE7TUFDQSxPQUFBLFlBQUEsT0FBQSxVQUFBOzs7OztJQUtBLFlBQUEsa0JBQUE7SUFDQSxZQUFBLGtCQUFBO0lBQ0EsWUFBQSxrQkFBQTtJQUNBLFlBQUEsa0JBQUE7Ozs7OztJQU1BLFlBQUEsb0JBQUEsU0FBQSxJQUFBO01BQ0EsWUFBQSxhQUFBLFlBQUEsS0FBQSxXQUFBOzs7SUFHQSxHQUFBLEtBQUEsSUFBQSxVQUFBO01BQ0EsWUFBQSxrQkFBQSxLQUFBLElBQUEsVUFBQTs7O0lBR0EsWUFBQSxhQUFBLFNBQUEsTUFBQSxVQUFBO01BQ0EsWUFBQSxhQUFBLFVBQUE7TUFDQSxZQUFBLEtBQUEsU0FBQSxVQUFBO1NBQ0EsTUFBQSxLQUFBLElBQUEsVUFBQSxLQUFBLE9BQUEsSUFBQSxTQUFBOzs7Ozs7OztJQVFBLFlBQUEsYUFBQSxTQUFBLE9BQUE7TUFDQSxRQUFBLFFBQUEsT0FBQSxVQUFBLFVBQUEsR0FBQTtRQUNBLElBQUEsYUFBQSxJQUFBO1FBQ0EsV0FBQSxTQUFBLFVBQUEsT0FBQTtVQUNBLElBQUEsTUFBQSxNQUFBLE9BQUE7VUFDQSxZQUFBLGFBQUEsS0FBQTtVQUNBLFlBQUEsTUFBQSxXQUFBLEtBQUEsSUFBQSxVQUFBLEtBQUEsT0FBQSxDQUFBLFNBQUE7VUFDQSxPQUFBLENBQUEsUUFBQSxRQUFBLFNBQUEsU0FBQSxVQUFBOztRQUVBLFdBQUEsY0FBQSxTQUFBOzs7Ozs7O0lBT0EsWUFBQSxjQUFBLFNBQUEsU0FBQTtNQUNBLFlBQUEsUUFBQSxVQUFBLFNBQUE7OztNQUdBLEdBQUEsWUFBQSxhQUFBLE9BQUE7UUFDQSxpQkFBQTtVQUNBLFVBQUEsWUFBQSxTQUFBLFFBQUE7VUFDQSxNQUFBLFlBQUEsU0FBQSxRQUFBO1VBQ0EsU0FBQSxZQUFBLFNBQUEsUUFBQTtVQUNBLEtBQUEsWUFBQSxTQUFBLFFBQUEsU0FBQSxTQUFBO1VBQ0EsS0FBQSxZQUFBLFNBQUEsUUFBQSxTQUFBLFNBQUE7OztRQUdBLFlBQUEsUUFBQSxlQUFBOzs7TUFHQSxZQUFBLFFBQUEsUUFBQSxLQUFBLFdBQUE7UUFDQSxPQUFBLENBQUEsUUFBQSxRQUFBLFNBQUEsU0FBQSxVQUFBO1FBQ0EsR0FBQSxhQUFBLFVBQUE7VUFDQSxPQUFBLEdBQUE7O1NBRUEsTUFBQSxTQUFBLE9BQUE7UUFDQSxPQUFBLENBQUEsUUFBQSxvQkFBQSxTQUFBLFNBQUEsVUFBQTs7Ozs7O0lBTUEsWUFBQSxhQUFBLFVBQUE7O01BRUEsWUFBQSxNQUFBLFdBQUEsS0FBQSxJQUFBLFVBQUEsS0FBQTtRQUNBO1VBQ0EsY0FBQSxZQUFBLFFBQUE7VUFDQSxjQUFBLFlBQUEsUUFBQTs7OztNQUlBLFlBQUEsTUFBQSxXQUFBLEtBQUEsSUFBQSxVQUFBLElBQUEsUUFBQSxPQUFBLElBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQSxZQUFBLGdCQUFBLFlBQUEsTUFBQSxZQUFBLGdCQUFBO1FBQ0EsVUFBQSxTQUFBOzs7TUFHQSxPQUFBLENBQUEsUUFBQSxRQUFBLFNBQUEsU0FBQSxVQUFBOzs7OztJQUtBLFlBQUEsWUFBQSxVQUFBO01BQ0EsWUFBQSxNQUFBLFdBQUEsS0FBQSxJQUFBLFVBQUEsS0FBQSxPQUFBLENBQUEsYUFBQSxZQUFBLFFBQUE7O01BRUEsT0FBQSxDQUFBLFFBQUEsUUFBQSxTQUFBLFNBQUEsVUFBQTs7OztJQUlBLFlBQUEsZ0JBQUEsVUFBQTs7TUFFQSxZQUFBLFFBQUEsUUFBQSxLQUFBLFVBQUE7UUFDQSxPQUFBLEdBQUE7Ozs7OztJQU1BLFlBQUEsZ0JBQUEsVUFBQTs7TUFFQSxZQUFBLE1BQUEsbUJBQUEsWUFBQSxRQUFBLGFBQUEsS0FBQSxTQUFBLFNBQUEsVUFBQTtRQUNBLEdBQUEsU0FBQSxVQUFBLEtBQUE7VUFDQSxPQUFBLFlBQUEsVUFBQTtjQUNBO1VBQ0EsT0FBQSxZQUFBLFVBQUE7Ozs7Ozs7QUNqTEEsUUFBQSxPQUFBO0dBQ0EsUUFBQSx1RUFBQSxVQUFBLGdCQUFBLGlCQUFBLGFBQUEsT0FBQTtJQUNBLElBQUEsV0FBQSxJQUFBLFNBQUEsY0FBQTtJQUNBLElBQUEsUUFBQSxlQUFBOztJQUVBLElBQUEsUUFBQTtNQUNBLGVBQUEsWUFBQTtRQUNBLE9BQUEsTUFBQTtVQUNBLEtBQUE7VUFDQSxRQUFBOzs7O01BSUEsbUJBQUEsWUFBQTtRQUNBLE9BQUEsTUFBQTtVQUNBLEtBQUE7VUFDQSxRQUFBO1dBQ0EsS0FBQSxVQUFBLE1BQUE7VUFDQSxPQUFBLEtBQUE7Ozs7TUFJQSxTQUFBLFNBQUEsSUFBQTtRQUNBLE9BQUEsTUFBQSxXQUFBOzs7OztNQUtBLHFCQUFBLFNBQUEsU0FBQTtRQUNBLE9BQUEsZUFBQSxTQUFBLGFBQUEsZUFBQSxRQUFBOzs7O01BSUEsbUJBQUEsU0FBQSxTQUFBO1FBQ0EsT0FBQSxTQUFBLGFBQUEsZUFBQSxRQUFBOzs7O01BSUEsWUFBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLGdCQUFBLFNBQUEsTUFBQTs7O01BR0EsZ0JBQUEsVUFBQSxLQUFBO1FBQ0EsSUFBQSxRQUFBLFFBQUEsUUFBQSxJQUFBO1VBQ0EsT0FBQSxNQUFBLFdBQUEsS0FBQTs7Ozs7TUFLQSxZQUFBLFNBQUEsSUFBQTtRQUNBLE9BQUEsU0FBQSxNQUFBLElBQUE7Ozs7TUFJQSxZQUFBLFNBQUEsSUFBQSxVQUFBOztRQUVBLElBQUEsT0FBQTtRQUNBLElBQUEsU0FBQSxJQUFBLFNBQUEsWUFBQSxTQUFBLElBQUEsdUJBQUE7UUFDQSxJQUFBLEtBQUEsU0FBQSxTQUFBLFVBQUE7VUFDQSxTQUFBLFNBQUE7O1FBRUEsT0FBQTs7OztNQUlBLG1CQUFBLFNBQUEsTUFBQSxRQUFBLFFBQUE7O1FBRUEsSUFBQSxNQUFBLElBQUEsU0FBQTtRQUNBLElBQUEsZUFBQTtVQUNBLE9BQUE7VUFDQSxhQUFBO1VBQ0EsYUFBQTtXQUNBLFNBQUEsT0FBQTtVQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsTUFBQTtjQUNBLEtBQUE7Z0JBQ0EsUUFBQSxJQUFBO2dCQUNBO2NBQ0EsS0FBQTtnQkFDQSxRQUFBLElBQUE7Z0JBQ0E7Y0FDQTtnQkFDQSxRQUFBLElBQUEsNEJBQUE7O2lCQUVBO1lBQ0EsUUFBQSxJQUFBOzs7OztNQUtBLFNBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxTQUFBLE1BQUE7OztNQUdBLFNBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxTQUFBLE1BQUEsS0FBQSxNQUFBOzs7TUFHQSxXQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsU0FBQSxNQUFBLEtBQUEsTUFBQTs7OztNQUlBLFdBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxTQUFBLE1BQUEsS0FBQSxNQUFBOzs7TUFHQSxZQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsU0FBQSxNQUFBOzs7TUFHQSxLQUFBOzs7SUFHQSxPQUFBOzs7QUNsSEEsUUFBQSxPQUFBO0dBQ0EsUUFBQSxxQkFBQSxVQUFBOzs7Ozs7Ozs7OztLQVdBLE9BQUE7O1FBRUEsZUFBQSxVQUFBOztZQUVBLElBQUEsYUFBQTs7O1lBR0EsSUFBQSxlQUFBOzs7Ozs7WUFNQSxJQUFBLGdCQUFBOzs7Y0FHQSxJQUFBLE1BQUEsSUFBQSxPQUFBO2NBQ0EsSUFBQSxpQkFBQSxRQUFBO2NBQ0EsZUFBQTs7Y0FFQSxJQUFBLGlCQUFBLElBQUEsTUFBQTtjQUNBLEtBQUEsSUFBQSxJQUFBLEdBQUEsS0FBQSxHQUFBLEtBQUE7Z0JBQ0EsZUFBQSxLQUFBLFdBQUEsT0FBQSxNQUFBOztnQkFFQSxNQUFBLEtBQUEsTUFBQSxNQUFBOztjQUVBLElBQUEsUUFBQSxHQUFBLE1BQUEsSUFBQSxNQUFBOztjQUVBLElBQUEsS0FBQSxlQUFBLEtBQUE7O2NBRUEsSUFBQSxDQUFBLGVBQUE7Z0JBQ0EsS0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEtBQUE7a0JBQ0EsY0FBQSxLQUFBLEtBQUEsTUFBQSxLQUFBLFdBQUE7O3FCQUVBOztnQkFFQSxLQUFBLElBQUEsSUFBQSxLQUFBLEtBQUEsY0FBQSxPQUFBLElBQUEsS0FBQTtrQkFDQSxjQUFBLEtBQUE7O2dCQUVBLGNBQUE7O2NBRUEsS0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEtBQUE7Z0JBQ0EsTUFBQSxXQUFBLE9BQUEsY0FBQTs7Y0FFQSxHQUFBLEdBQUEsVUFBQSxJQUFBLE1BQUEsSUFBQSxNQUFBOztjQUVBLE9BQUE7Ozs7SUFJQSIsImZpbGUiOiJidWlsZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNYWluIG1vZHVsZSBvZiB0aGUgYXBwbGljYXRpb24uXG4gKi9cbnZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnQXBwJywgW1xuICAgICdmaXJlYmFzZScsXG4gICAgJ2FuZ3VsYXItbWQ1JywgLy8gRW5jcnlwdCBlbWFpbFxuICAgICduZ1JvdXRlJyxcbiAgICAndWkucm91dGVyJyxcbiAgICAnbmdNYXRlcmlhbCcsIC8vIEludGVyZmFjZVxuICAgICdhbmd1bGFyTW9tZW50JywgLy8gVGltZSBtYW5hZ2VtZW50XG4gICAgJ2Zsb3cnLCAvLyBJbWFnZSB1cGxvYWRcbiAgICAnc2x1Z2lmaWVyJywgLy8gQ3JlYXRlIFNsdWdzXG4gICAgJ25nQXV0b2NvbXBsZXRlJywgLy8gR29vZ2xlIHBsYWNlc1xuICAgICduZ1RhZ3NJbnB1dCcsIC8vIFRhZ3NcbiAgICAnY2dOb3RpZnknLCAvLyBOb3RpZmljYXRpb24gLSBodHRwczovL2dpdGh1Yi5jb20vY2dyb3NzL2FuZ3VsYXItbm90aWZ5XG4gICAgJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnLCAvLyBUcmFuc2xhdGlvbiAtIGh0dHBzOi8vYW5ndWxhci10cmFuc2xhdGUuZ2l0aHViLmlvL1xuICAgICdmYWNlYm9vaycsICAgICAgIC8vICBGYWNlYm9vayAtIGh0dHBzOi8vZ2l0aHViLmNvbS9DaXVsL2FuZ3VsYXItZmFjZWJvb2tcbiAgICAnYW5ndWxhci1mbGV4c2xpZGVyJywgLy8gSW1hZ2Ugc2xpZGVyIC0gaHR0cHM6Ly9naXRodWIuY29tL3RoZW5pa3NvL2FuZ3VsYXItZmxleHNsaWRlclxuXG4gICAgLy8gRW1vdGljb24gLS0gaHR0cDovL21pc3RpYzEwMC5naXRodWIuaW8vYW5ndWxhci1zbWlsaWVzL1xuICAgICduZ1Nhbml0aXplJyxcbiAgICAndWkuYm9vdHN0cmFwJywgICAvLyAgT1IgbWdjcmVhLm5nU3RyYXBcbiAgICAnYW5ndWxhci1zbWlsaWVzJyxcblxuICAgICduZ0Nvb2tpZXMnLCAgICAgIC8vICBjb29raWVzIHN0dWZmXG4gICAgJ25vdGlmaWNhdGlvbicsICAgLy8gIHdlYiBub3RpZmljYXRpb24gLSBodHRwczovL2dpdGh1Yi5jb20vbmVvemlyby9hbmd1bGFyLW5vdGlmaWNhdGlvblxuXG4gIF0pXG5cbiAgLmNvbmZpZyhmdW5jdGlvbiAoJG1kVGhlbWluZ1Byb3ZpZGVyKSB7XG4gICAgJG1kVGhlbWluZ1Byb3ZpZGVyLmRlZmluZVBhbGV0dGUoJ3NsYWNrJywge1xuICAgICAgJzUwJzogJ2ZmZWJlZScsXG4gICAgICAnMTAwJzogJ2ZmY2RkMicsXG4gICAgICAnMjAwJzogJ2VmOWE5YScsXG4gICAgICAnMzAwJzogJ2U1NzM3MycsXG4gICAgICAnNDAwJzogJ2VmNTM1MCcsXG4gICAgICAnNTAwJzogJzREMzk0QicsIC8vIHByaW1hcnkgY29sb3VyXG4gICAgICAnNjAwJzogJ2U1MzkzNScsXG4gICAgICAnNzAwJzogJ2QzMmYyZicsXG4gICAgICAnODAwJzogJ2M2MjgyOCcsXG4gICAgICAnOTAwJzogJ2I3MWMxYycsXG4gICAgICAnQTEwMCc6ICdmZjhhODAnLFxuICAgICAgJ0EyMDAnOiAnZmY1MjUyJyxcbiAgICAgICdBNDAwJzogJ2ZmMTc0NCcsXG4gICAgICAnQTcwMCc6ICdkNTAwMDAnLFxuICAgICAgJ2NvbnRyYXN0RGVmYXVsdENvbG9yJzogJ2xpZ2h0JywgLy8gd2hldGhlciwgYnkgZGVmYXVsdCwgdGV4dCAoY29udHJhc3QpXG4gICAgICAvLyBvbiB0aGlzIHBhbGV0dGUgc2hvdWxkIGJlIGRhcmsgb3IgbGlnaHRcbiAgICAgICdjb250cmFzdERhcmtDb2xvcnMnOiBbJzUwJywgJzEwMCcsIC8vIGh1ZXMgd2hpY2ggY29udHJhc3Qgc2hvdWxkIGJlICdkYXJrJyBieSBkZWZhdWx0XG4gICAgICAgICcyMDAnLCAnMzAwJywgJzQwMCcsICdBMTAwJ10sXG4gICAgICAnY29udHJhc3RMaWdodENvbG9ycyc6IHVuZGVmaW5lZCAvLyBjb3VsZCBhbHNvIHNwZWNpZnkgdGhpcyBpZiBkZWZhdWx0IHdhcyAnZGFyaydcbiAgICB9KVxuICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGVmYXVsdCcpXG4gICAgICAucHJpbWFyeVBhbGV0dGUoJ3NsYWNrJylcbiAgfSlcblxuICAvLyBGYWNlYm9vayBDb25maWdcbiAgLmNvbmZpZyhcbiAgICBmdW5jdGlvbiAoRmFjZWJvb2tQcm92aWRlcikge1xuICAgICAgdmFyIG15QXBwSWQgPSAnOTMxMzc2MTIwMjYzODU2J1xuICAgICAgRmFjZWJvb2tQcm92aWRlci5zZXRBcHBJZChteUFwcElkKVxuICAgICAgRmFjZWJvb2tQcm92aWRlci5pbml0KG15QXBwSWQpXG4gICAgfVxuICApXG5cbiAgLy9TZWN1cml0eSBmb3IgVHJhbnNsYXRlXG4gIC5jb25maWcoZnVuY3Rpb24gKCR0cmFuc2xhdGVQcm92aWRlcikge1xuICAgICR0cmFuc2xhdGVQcm92aWRlci5wcmVmZXJyZWRMYW5ndWFnZSgnRW5nJyk7XG4gICAgLy8gRW5hYmxlIGVzY2FwaW5nIG9mIEhUTUxcbiAgICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5KCdlc2NhcGUnKTtcbiAgfSlcblxuXG5cbiAgLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwkY29udHJvbGxlclByb3ZpZGVyKSB7XG5cbiAgICBhcHAucmVnaXN0ZXJDdHJsID0gJGNvbnRyb2xsZXJQcm92aWRlci5yZWdpc3RlcjtcblxuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRGFzaGJvYXJkQ3RybCBhcyAgZGFzaGJvYXJkQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2hvbWUvaG9tZS5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgcmVxdWlyZU5vQXV0aDogZnVuY3Rpb24gKCRzdGF0ZSwgQXV0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkudGhlbihmdW5jdGlvbiAoYXV0aCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQnKVxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2xvZ2luLWZvcm1AaG9tZSc6IHtcbiAgICAgICAgICAgIC8vY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvbG9naW4tZm9ybS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgIH0pXG5cblxuICAgICAgLy9UcmVuZGluZ1xuICAgICAgLnN0YXRlKCd0cmVuZGluZycsIHtcbiAgICAgICAgdXJsOiAnL2V4cGxvcmUvdHJlbmRpbmcnLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnSG9tZUN0cmwgYXMgIGhvbWVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnaG9tZS90cmVuZC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgZmVlZDogZnVuY3Rpb24gKFRvcGljcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MubGF0ZXN0RmVlZCgpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9KVxuXG5cbiAgICAgIC8vIENhdGVnb3J5IExhbmRpbmdcbiAgICAgIC5zdGF0ZSgnY2F0ZWdvcnknLCB7XG4gICAgICAgIHVybDogJy9jYXRlZ29yeS97U2x1Z30nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ2F0ZUN0cmwgYXMgY2F0ZUN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdjYXRlZ29yeS9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgLy8gR2V0dGluZyBDYXRlZ29yeSBkZXRhaWxzXG4gICAgICAgICAgICAgIGNhdGVOYW1lOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBDYXRlZ29yeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBDYXRlZ29yeS5nZXROYW1lKCRzdGF0ZVBhcmFtcy5TbHVnKS4kbG9hZGVkKClcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgLy8gR2V0dGluZyBsaXN0IG9mIGNhdGVnb3J5IHRvcGljcyBoZXJlXG4gICAgICAgICAgICAgIGNhdGVUb3BpY3M6IGZ1bmN0aW9uICgkc3RhdGVQYXJhbXMsIFRvcGljcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MubGlzdCgkc3RhdGVQYXJhbXMuU2x1ZylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgIH0pXG5cblxuICAgICAgLy8gUGxhY2VzIGxhbmRpbmcgcGFnZVxuICAgICAgLnN0YXRlKCdwbGFjZXMnLCB7XG4gICAgICAgIHVybDogJy9wbGFjZXMve3BsYWNlX3NsdWd9L3twbGFjZV9pZH0nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICdoZWFkZXJAcGxhY2VzJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1BsYWNlc0N0cmwgYXMgcGxhY2VzQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BsYWNlL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICBwbGFjZUxhbmRpbmc6IGZ1bmN0aW9uIChQbGFjZXMsIFRvcGljcywgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VBcnJheSkge1xuICAgICAgICAgICAgICAgIHZhciBkYXRhXG4gICAgICAgICAgICAgICAgUGxhY2VzLmdldFBsYWNlUmVmKCRzdGF0ZVBhcmFtcy5wbGFjZV9pZCkub24oJ3ZhbHVlJywgZnVuY3Rpb24gKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICBkYXRhID0gc25hcHNob3QudmFsKClcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNuYXBzaG90LnZhbCgpKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgICAgICAgICAgLy8gcmV0dXJuICAkZmlyZWJhc2VBcnJheShQbGFjZXMuZ2V0UGxhY2VSZWYoJHN0YXRlUGFyYW1zLnBsYWNlX2lkKSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuXG4gICAgICAvLyBUYWcgbGFuZGluZyBwYWdlXG4gICAgICAuc3RhdGUoJ3RhZycsIHtcbiAgICAgICAgdXJsOiAnL3RhZy97VGFnfScsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ2hlYWRlckB0YWcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnVGFnQ3RybCBhcyB0YWdDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGFnL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICB0YWdOYW1lOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzdGF0ZVBhcmFtcy5UYWdcbiAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICB0YWdMYW5kaW5nOiBmdW5jdGlvbiAoVG9waWNzLCAkc3RhdGVQYXJhbXMsIFRhZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFnID0gJHN0YXRlUGFyYW1zLlRhZ1xuICAgICAgICAgICAgICAgIC8vIHZhciBmYiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybClcbiAgICAgICAgICAgICAgICAvLyB2YXIgZGF0YVJldCA9ICcnXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHNob3coVGFncy50b3BpY1RhZ3ModGFnKSlcbiAgICAgICAgICAgICAgICAvKnJldHVybiBmYi5jaGlsZCgndGFncy8nICsgdGFnKVxuICAgICAgICAgICAgICAgICAgICAub24oJ3ZhbHVlJywgZnVuY3Rpb24gKHRhZ1NuYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmIuY2hpbGQoJ3RvcGljcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAub3JkZXJCeUNoaWxkKFwidGFnc1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmVxdWFsVG8odGFnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCd2YWx1ZScsIGZ1bmN0aW9uICh0b3BpY1NuYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNob3coIGV4dGVuZCh7fSwgdGFnU25hcC52YWwoKSwgdG9waWNTbmFwLnZhbCgpKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8hKmRhdGFSZXQgPSBleHRlbmQoe30sIHRhZ1NuYXAudmFsKCksIHRvcGljU25hcC52YWwoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJGZpcmViYXNlQXJyYXkoZGF0YVJldCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhUmV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAqIS9cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pKi9cbiAgICAgICAgICAgICAgICAvLyB2YXIgdGFnT2JqID0gVGFncy5nZXRUYWdPYmplY3QodGFnKVxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0YWdPYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vICAgcmV0dXJuIFRvcGljcy50b3BpY3NCeVRhZyh0YWcpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24gKHNuYXApIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coZXh0ZW5kKHt9LCB0YWdPYmouJHZhbHVlLCBzbmFwLnZhbCgpKSlcbiAgICAgICAgICAgICAgICAvLyAgICAgcmV0dXJuIGV4dGVuZCh7fSwgdGFnT2JqLiR2YWx1ZSwgc25hcC52YWwoKSlcbiAgICAgICAgICAgICAgICAvLyAgIH0pXG4gICAgICAgICAgICAgICAgLy8gfSlcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgZmIub25jZSgndmFsdWUnLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGRhdGEgPSBzbmFwc2hvdC52YWwoKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGRhdGFTbmFwKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdmFyIGluZGV4ID0gd29yZC5pbmRleE9mKCcgJylcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgZmlyc3QgPSBkYXRhU25hcC5OYW1lLnN1YnN0cmluZygwLCBpbmRleClcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgbGFzdCA9IHdvcmQuc3Vic3RyaW5nKGluZGV4ICsgMSlcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgY2FuZGlkYXRlID0gZGF0YVNuYXAuTmFtZVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIGlmIChjYW5kaWRhdGUuaW5kZXhPZihmaXJzdCkgPj0gMCAmJiBjYW5kaWRhdGUuaW5kZXhPZihsYXN0KSA+PSAwKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhU25hcC5DSUQpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgcmVqZWN0KCdTb21lIHNvcnQgb2YgZmFpbHVyZScpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgICAgIC8vIH0pXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLnRvcGljc0J5VGFnKHRhZylcbiAgICAgICAgICAgICAgLy8gLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcCl7XG4gICAgICAgICAgICAgIC8vIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cblxuICAgICAgLy8gVG9waWMgbGFuZGluZyBwYWdlXG4gICAgICAuc3RhdGUoJ3RvcGljJywge1xuICAgICAgICB1cmw6ICcve1NsdWd9JyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIC8qU2x1ZzogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywkc3RhdGUsQXV0aCkge1xuICAgICAgICAgICAgJHN0YXRlUGFyYW1zLlNsdWcgPSBkZWNvZGVVUklDb21wb25lbnQoJHN0YXRlUGFyYW1zLlNsdWcpXG4gICAgICAgICAgICBpZigkc3RhdGVQYXJhbXMuU2x1ZyA9PSAnJyl7XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSovXG4gICAgICAgIH0sXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdUb3BpY0xhbmRpbmdDdHJsIGFzIHRvcGljTGFuZGluZ0N0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0b3BpY3MvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uIChBdXRoLCBVc2VycywgJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9waWNVaWQgPSAnJ1xuICAgICAgICAgICAgICAgIC8vIElmIHVzZXIgbG9naW4sIGNoZWNrIGlmIHRoZXkgYXJlIHRoZSB0b3BpYyBvd25lclxuICAgICAgICAgICAgICAgIGlmIChBdXRoLnJlZi5nZXRBdXRoKCkpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZm9ydG9waWMoJHN0YXRlUGFyYW1zLlNsdWcpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhWzBdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICB0b3BpY1VpZCA9IGRhdGFbMF0udWlkXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKEF1dGgucmVmLmdldEF1dGgoKS51aWQgPT0gdG9waWNVaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0b3BpY0xhbmRpbmc6IGZ1bmN0aW9uICgkc3RhdGVQYXJhbXMsIFRvcGljcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZm9ydG9waWMoJHN0YXRlUGFyYW1zLlNsdWcpLiRsb2FkZWQoKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVwbHlMaXN0OiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MsICRzdGF0ZSkge1xuICAgICAgICAgICAgICAgIHZhciB0b3BpY0tleSA9ICcnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5mb3J0b3BpYygkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkYXRhWzBdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9waWNLZXkgPSBkYXRhWzBdLiRpZFxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCd0b3BpYy1ub3Rmb3VuZCcpXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLnJlcGx5TGlzdCh0b3BpY0tleSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB2aWV3RGF0YTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgVG9waWNzLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHZhciB0b3BpY0tleSwgdmlld3NcbiAgICAgICAgICAgICAgICB2YXIgdGltZSA9IG1vbWVudCgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICB2YXIgaGlzdG9yeU9iaiA9IHsndXNlcklQJzogJycsICdjcmVhdGVkJzogdGltZX1cbiAgICAgICAgICAgICAgICBVc2Vycy5nZXRMb2NhdGlvbklQKCkuc3VjY2VzcyhmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgaGlzdG9yeU9iai51c2VySVAgPSBkYXRhLmRhdGFcbiAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICBoaXN0b3J5T2JqLnVzZXJJUCA9IGRhdGEuZGF0YVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5nZXRUb3BpY0J5U2x1Zygkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkYXRhWzBdLiRpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9waWNLZXkgPSBkYXRhWzBdLiRpZFxuICAgICAgICAgICAgICAgICAgICB2aWV3cyA9IFRvcGljcy5nZXRWaWV3cyh0b3BpY0tleSlcblxuICAgICAgICAgICAgICAgICAgICB2aWV3cy5vYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb3VudCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3cy5yZWYuY2hpbGQoJ2NvdW50Jykuc2V0KDEpXG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdzLnJlZi5jaGlsZCgnY291bnQnKS5zZXQoZGF0YS5jb3VudCArIDEpXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkudGhlbihmdW5jdGlvbiAoYXV0aCkge1xuICAgICAgICAgICAgICAgICAgICAgIHZhciB1aWQgPSBhdXRoLnVpZFxuICAgICAgICAgICAgICAgICAgICAgIHZpZXdzLnJlZi5jaGlsZCgnaGlzdG9yeScpLmNoaWxkKHVpZCkucHVzaCgpLnNldChoaXN0b3J5T2JqKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCd2aWV3cycpLmNoaWxkKHRvcGljS2V5KS5wdXNoKCkuc2V0KGhpc3RvcnlPYmopXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdmlld3Mub2JqXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZm9sbG93ZXJzOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmdldFRvcGljQnlTbHVnKCRzdGF0ZVBhcmFtcy5TbHVnKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgdmFyIHRvcGljS2V5ID0gZGF0YVswXS4kaWRcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZ2V0Rm9sbG93ZXJzKHRvcGljS2V5KS5vYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gVG9waWMgbm90IGZvdW5kXG4gICAgICAuc3RhdGUoJ3RvcGljLW5vdGZvdW5kJywge1xuICAgICAgICB1cmw6ICcvZXJyL25vdGZvdW5kJ1xuICAgICAgfSlcblxuICAgICAgLy8gUHJvZmlsZSBsYW5kaW5nIHBhZ2VcbiAgICAgIC5zdGF0ZSgncHJvZmlsZScsIHtcbiAgICAgICAgdXJsOiAnL3Byb2ZpbGUve05hbWV9JyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZmlsZS9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgaXNPd25lcjogZnVuY3Rpb24gKEF1dGgsIFVzZXJzLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXV0aC5yZWYuZ2V0QXV0aCgpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZUJ5VXNlcm5hbWUoJHN0YXRlUGFyYW1zLk5hbWUpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9maWxlWzBdLiRpZCA9PSBBdXRoLnJlZi5nZXRBdXRoKCkudWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB1c2VyUG9zdHM6IGZ1bmN0aW9uIChVc2VycywgVG9waWNzLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZUJ5VXNlcm5hbWUoJHN0YXRlUGFyYW1zLk5hbWUpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICBpZiAocHJvZmlsZVswXS4kaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuY3JlYXRlZEJ5KHByb2ZpbGVbMF0uJGlkKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHByb2ZpbGU6IGZ1bmN0aW9uICgkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHJvb3RTY29wZSwgQXV0aCwgVXNlcnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZUJ5VXNlcm5hbWUoJHN0YXRlUGFyYW1zLk5hbWUpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcHJvZmlsZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICdoZWFkZXJAcHJvZmlsZSc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90b29sYmFyL21haW5fdG9vbGJhci5odG1sJ1xuICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBQcm9maWxlIGxhbmRpbmcgcGFnZVxuICAgICAgLy8gQHByb2ZpbGVDdHJsXG4gICAgICAuc3RhdGUoJ2FjY2NvdW50RWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL2FjY291bnQvZWRpdCcsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ3Bhc3N3b3JkRWRpdEBhY2Njb3VudEVkaXQnOiB7XG4gICAgICAgICAgICB1cmw6ICcvYWNjb3VudC9jaGFuZ2VQYXNzd29yZCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGUvcGFzc3dkLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAndXNlckVkaXRAYWNjY291bnRFZGl0Jzoge1xuICAgICAgICAgICAgdXJsOiAnL2FjY291bnQvZWRpdC1mb3JtJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZmlsZS9lZGl0LWZvcm0uaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnUHJvZmlsZUN0cmwgYXMgcHJvZmlsZUN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlL2VkaXQuaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIHVzZXJQb3N0czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBpc093bmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcHJvZmlsZTogZnVuY3Rpb24gKCRzdGF0ZSwgJHJvb3RTY29wZSwgQXV0aCwgVXNlcnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlKGF1dGgudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAocHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvZmlsZS5kaXNwbGF5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9maWxlXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdnZXRfc3RhcnRlZCcpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGF1dGg6IGZ1bmN0aW9uICgkc3RhdGUsIFVzZXJzLCBBdXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGguYXV0aC4kcmVxdWlyZUF1dGgoKS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ2FjY291bnRQYXNzd29yZCcsIHtcbiAgICAgICAgdXJsOiAnL2FjY291bnQvY2hhbmdlUGFzc3dvcmQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGUvcGFzc3dkLmh0bWwnXG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ2FjY291bnRVc2VyRWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL2FjY291bnQvZWRpdC1mb3JtJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlL2VkaXQtZm9ybS5odG1sJ1xuICAgICAgfSlcblxuICAgICAgLy8gRGFzaGJvYXJkXG4gICAgICAvLyBAcHJvZmlsZUN0cmxcbiAgICAgIC5zdGF0ZSgnZGFzaGJvYXJkJywge1xuICAgICAgICB1cmw6ICcvdXNlci9kYXNoYm9hcmQnLFxuICAgICAgICBjb250cm9sbGVyOiAnRGFzaGJvYXJkQ3RybCBhcyBkYXNoYm9hcmRDdHJsJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnZGFzaGJvYXJkL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICB1c2VyUG9zdHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaXNPd25lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHByb2ZpbGU6IGZ1bmN0aW9uICgkc3RhdGUsICRyb290U2NvcGUsIEF1dGgsIFVzZXJzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGguYXV0aC4kcmVxdWlyZUF1dGgoKS50aGVuKGZ1bmN0aW9uIChhdXRoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZShhdXRoLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHByb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgbm8gc3RhdCBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwcm9maWxlLnN0YXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBVc2Vycy51c2VyUmVmKGF1dGgudWlkKS5jaGlsZCgnc3RhdC91cHZvdGVkL2NvdW50Jykuc2V0KDApXG4gICAgICAgICAgICAgICAgICAgICAgVXNlcnMudXNlclJlZihhdXRoLnVpZCkuY2hpbGQoJ3N0YXQvcG9zdGVkL2NvdW50Jykuc2V0KDApXG4gICAgICAgICAgICAgICAgICAgICAgVXNlcnMudXNlclJlZihhdXRoLnVpZCkuY2hpbGQoJ3N0YXQvY29tbWVudC9jb3VudCcpLnNldCgwKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2VyL2NvdW50Jykuc2V0KDApXG4gICAgICAgICAgICAgICAgICAgICAgVXNlcnMudXNlclJlZihhdXRoLnVpZCkuY2hpbGQoJ3N0YXQvZm9sbG93aW5nL2NvdW50Jykuc2V0KDApXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBubyBkaXNwbGF5bmFtZSAtIGdvIHRvIGdldF9zdGFydGVkXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9maWxlLmRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb2ZpbGVcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2dldF9zdGFydGVkJylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpXG4gICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBhdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG5cbiAgICAgIC8vIG5lc3RlZCBsaXN0IHdpdGggY3VzdG9tIGNvbnRyb2xsZXJcbiAgICAgIC5zdGF0ZSgnZGFzaGJvYXJkLmxpc3QnLCB7XG4gICAgICAgIHVybDogJy9mZWVkL3tTbHVnfScsXG4gICAgICAgIC8vdGVtcGxhdGVVcmw6ICcvZmVlZHMvZmVlZC5odG1sJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NhdGVDdHJsIGFzIGNhdGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnY2F0ZWdvcnkvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIC8vIEdldHRpbmcgQ2F0ZWdvcnkgZGV0YWlsc1xuICAgICAgICAgICAgICBjYXRlTmFtZTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgQ2F0ZWdvcnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQ2F0ZWdvcnkuZ2V0TmFtZSgkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIC8vIEdldHRpbmcgbGlzdCBvZiBjYXRlZ29yeSB0b3BpY3MgaGVyZVxuICAgICAgICAgICAgICBjYXRlVG9waWNzOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmxpc3QoJHN0YXRlUGFyYW1zLlNsdWcpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBGb2xsbG93IENhdGVnb3J5XG4gICAgICAvLyBAcHJvZmlsZUN0cmxcbiAgICAgIC5zdGF0ZSgnZm9sbG93X2NhdGVzJywge1xuICAgICAgICB1cmw6ICcvdXNlci9mb2xsb3ctY2F0ZWdvcmllcycsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ3RybCBhcyBwcm9maWxlQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2F1dGgvZm9sbG93LWNhdGVnb3JpZXMuaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIHVzZXJQb3N0czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBpc093bmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcHJvZmlsZTogZnVuY3Rpb24gKFVzZXJzLCBBdXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGguYXV0aC4kcmVxdWlyZUF1dGgoKS50aGVuKGZ1bmN0aW9uIChhdXRoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZShhdXRoLnVpZCkuJGxvYWRlZCgpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgYXV0aDogZnVuY3Rpb24gKCRzdGF0ZSwgVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gR2V0dGluZyBzdGFydGVkXG4gICAgICAvLyBAcHJvZmlsZUN0cmxcbiAgICAgIC5zdGF0ZSgnZ2V0X3N0YXJ0ZWQnLCB7XG4gICAgICAgIHVybDogJy91c2VyL2dldF9zdGFydGVkJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXV0aC9nZXRfc3RhcnRlZC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgdXNlclBvc3RzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9maWxlOiBmdW5jdGlvbiAoVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlKGF1dGgudWlkKS4kbG9hZGVkKClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBhdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnaGVhZGVyQGdldF9zdGFydGVkJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvdXNlci9sb2dpbicsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXV0aC9sb2dpbi5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2xvZ2luLWZvcm1AbG9naW4nOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC9sb2dpbi1mb3JtLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgICB1cmw6ICcvdXNlci9yZWdpc3RlcicsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2F1dGgvcmVnaXN0ZXIuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICByZXF1aXJlTm9BdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBBdXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICByZXR1cm4gZXJyb3JcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpXG4gIH0pXG5cbiAgLmZpbHRlcignb3JkZXJPYmplY3RCeScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGl0ZW1zLCBmaWVsZCwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGZpbHRlcmVkID0gW11cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChpdGVtcywgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgZmlsdGVyZWQucHVzaChpdGVtLiRpZCkuc2V0KGl0ZW0pXG4gICAgICB9KVxuICAgICAgZmlsdGVyZWQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gKGFbZmllbGRdID4gYltmaWVsZF0gPyAxIDogLTEpXG4gICAgICB9KVxuICAgICAgaWYgKHJldmVyc2UpIGZpbHRlcmVkLnJldmVyc2UoKVxuICAgICAgcmV0dXJuIGZpbHRlcmVkXG4gICAgfVxuICB9KVxuXG4gIC5maWx0ZXIoJ2RlY29kZVVSSScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0ID8gZGVjb2RlVVJJKHRleHQpIDogJydcbiAgICB9XG4gIH0pXG5cbiAgLy8gRm9ybWF0dGluZyB0ZXh0cyB0byBpbmNsdWRlIG5ldyBsaW5lXG4gIC5maWx0ZXIoJ25sMmJyJywgZnVuY3Rpb24gKCRzY2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0ID8gJHNjZS50cnVzdEFzSHRtbCh0ZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKSkgOiAnJ1xuICAgIH1cbiAgfSlcblxuICAuY29uc3RhbnQoJ0ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vYm14eXouZmlyZWJhc2Vpby5jb20vJylcblxuZnVuY3Rpb24gc2hvdyAoZGF0YSkge1xuICBjb25zb2xlLmxvZyhkYXRhKVxuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMilcbn1cblxuLy8gZm9yIGpvaW5pbmcgLSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9rYXRvd3VsZi82NTk4MjM4XG5mdW5jdGlvbiBleHRlbmQgKGJhc2UpIHtcbiAgdmFyIHBhcnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgaWYgKHAgJiYgdHlwZW9mIChwKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGsgaW4gcCkge1xuICAgICAgICBpZiAocC5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgIGJhc2Vba10gPSBwW2tdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBiYXNlXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmNvbnRyb2xsZXIoJ0F1dGhDdHJsJywgZnVuY3Rpb24oJHNjb3BlLEF1dGgsIFVzZXJzLCAkc3RhdGUsJHJvb3RTY29wZSwkbWRTaWRlbmF2LCR0cmFuc2xhdGUsICRjb29raWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RpU2VydmljZSwkbm90aWZpY2F0aW9uKXtcblxuICAgIGNvbnNvbGUubG9nKFwiYXV0aEN0cmxcIik7XG5cbiAgICB2YXIgYXV0aEN0cmwgPSB0aGlzO1xuXG4gICAgLy9Bc2sgZm9yIG5vdGlmaWNhdGlvbiBwZXJtaXNzaW9uXG4gICAgJG5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbigpXG4gICAgICAudGhlbihmdW5jdGlvbiAocGVybWlzc2lvbikge1xuICAgICAgICBjb25zb2xlLmxvZyhwZXJtaXNzaW9uKTsgLy8gZGVmYXVsdCwgZ3JhbnRlZCwgZGVuaWVkXG4gICAgICB9KTtcblxuICAgIC8vUGFyc2VyXG4gICAgYXV0aEN0cmwuYXV0aCAgICAgPSBBdXRoO1xuICAgIGF1dGhDdHJsLnVzZXJzICAgID0gVXNlcnM7XG4gICAgYXV0aEN0cmwubm90aWZpY2F0aW9uID0gTm90aVNlcnZpY2U7XG5cblxuICAgIGlmKEF1dGgucmVmLmdldEF1dGgoKSAhPSBudWxsICl7XG4gICAgICBhdXRoQ3RybC5wcm9maWxlICA9IGF1dGhDdHJsLnVzZXJzLmdldFByb2ZpbGUoQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCk7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBhdXRoQ3RybC5wcm9maWxlID0nJ1xuICAgIH1cblxuXG4gICAgYXV0aEN0cmwudXNlciA9IHtcbiAgICAgIGVtYWlsOiAnJyxcbiAgICAgIHBhc3N3b3JkOiAnJ1xuICAgIH07XG5cblxuXG4gICAgLy9HZXQgdGhlIGJhZGdlIG5vdGlmaWNhdGlvblxuICAgIC8qYXV0aEN0cmwuYmFkZ2VOb3RpZmljYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgcmV0dXJuIGF1dGhDdHJsLm5vdGlmaWNhdGlvbi5hZGRBcnJDaGlsZChhdXRoQ3RybC5wcm9maWxlLiRpZCArICcvdW5yZWFkJykuJGxvYWRlZCgpO1xuICAgIH1cblxuICAgIGF1dGhDdHJsLmJhZGdlVmFsdWUgPSBhdXRoQ3RybC5iYWRnZU5vdGlmaWNhdGlvbjtcblxuICAgIGNvbnNvbGUubG9nKGF1dGhDdHJsLmJhZGdlTm90aWZpY2F0aW9uKTsqL1xuXG4gICAgJHNjb3BlLmJhZGdlTm90aWZjYXRpb24gPSBhdXRoQ3RybC5iYWRnZU5vdGlmaWNhdGlvbjtcblxuICAgIC8vUmVzZXQgY291bnRlclxuICAgIGF1dGhDdHJsLnJlc2V0Q291bnRlciA9IGZ1bmN0aW9uKCl7XG4gICAgICBhdXRoQ3RybC5ub3RpZmljYXRpb24ucmVzZXRVbnJlYWQoYXV0aEN0cmwucHJvZmlsZS4kaWQpO1xuICAgIH1cblxuICAgIGF1dGhDdHJsLmNoYW5nZVZhbCA9IGZ1bmN0aW9uKCl7XG4gICAgICBjb25zb2xlLmxvZygnYmFkZ2UgdmFsdWUgJythdXRoQ3RybC5iYWRnZU5vdGlmaWNhdGlvbi4kdmFsdWUpO1xuXG4gICAgfVxuXG4gICAgJHNjb3BlLiR3YXRjaChcIm5hbWVcIiwgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICBpZiAoJHNjb3BlLm5hbWUubGVuZ3RoID4gMCkge1xuICAgICAgICAkc2NvcGUuZ3JlZXRpbmcgPSBcIkdyZWV0aW5ncyBcIiArICRzY29wZS5uYW1lO1xuICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICAvL0NoYW5nZSBsYW5ndWFnZVxuICAgIGF1dGhDdHJsLnRvZ2dsZUxhbmcgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgJHRyYW5zbGF0ZS51c2UobGFuZ0tleSk7XG4gICAgICAvLyBTZXR0aW5nIGEgY29va2llXG4gICAgICAkY29va2llcy5wdXQoJ3VzZXJMYW5nJywgbGFuZ0tleSk7XG4gICAgICAvL0lmIHVzZXIgcmVnaXN0ZXJlZCAtIHVwZGF0ZSB0aGlzIGluIHRoZWlyIHByZWZlcmVuY2VcbiAgICAgIGlmKEF1dGgucmVmLmdldEF1dGgoKSl7XG4gICAgICAgIGF1dGhDdHJsLnVzZXJzLnVzZXJBcnJSZWYoQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCkudXBkYXRlKHtcImxhbmdcIjpsYW5nS2V5fSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL0NoZWNrayB1c2VyIHNlbGVjdGVkIGxhbmd1YWdlXG4gICAgaWYoIWF1dGhDdHJsLnByb2ZpbGUubGFuZyl7XG4gICAgICBpZigkY29va2llcy5nZXQoJ3VzZXJMYW5nJykpe1xuICAgICAgICBhdXRoQ3RybC50b2dnbGVMYW5nKCRjb29raWVzLmdldCgndXNlckxhbmcnKSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYXV0aEN0cmwudG9nZ2xlTGFuZygnRW5nJyk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBhdXRoQ3RybC50b2dnbGVMYW5nKGF1dGhDdHJsLnByb2ZpbGUubGFuZyk7XG4gICAgfVxuXG5cbiAgICAvL0xvZ2luXG4gICAgYXV0aEN0cmwubG9naW4gPSBmdW5jdGlvbiAoKXtcbiAgICAgIGF1dGhDdHJsLmF1dGguYXV0aC4kYXV0aFdpdGhQYXNzd29yZChhdXRoQ3RybC51c2VyKS50aGVuKGZ1bmN0aW9uIChhdXRoKXtcbiAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQnKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcil7XG4gICAgICAgIGF1dGhDdHJsLmVycm9yID0gZXJyb3I7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy9Mb2dvdXRcbiAgICBhdXRoQ3RybC5sb2dvdXQgPSBmdW5jdGlvbigpe1xuICAgICAgQXV0aC5hdXRoLiR1bmF1dGgoKTtcbiAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICB9XG5cbiAgICAvL1JlZ2lzdGVyIHVzZXJcbiAgICBhdXRoQ3RybC5yZWdpc3RlciA9IGZ1bmN0aW9uICgpe1xuICAgICAgQXV0aC5hdXRoLiRjcmVhdGVVc2VyKGF1dGhDdHJsLnVzZXIpLnRoZW4oZnVuY3Rpb24gKHVzZXIpe1xuICAgICAgICBhdXRoQ3RybC5sb2dpbigpO1xuICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKXtcbiAgICAgICAgYXV0aEN0cmwuZXJyb3IgPSBlcnJvcjtcbiAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIGF1dGhDdHJsLnRvZ2dsZVJpZ2h0ID0gYnVpbGRUb2dnbGVyKCdyaWdodCcpO1xuICAgIGZ1bmN0aW9uIGJ1aWxkVG9nZ2xlcihuYXZJRCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAkbWRTaWRlbmF2KG5hdklEKVxuICAgICAgICAgIC50b2dnbGUoKVxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmZhY3RvcnkoJ0F1dGgnLCBmdW5jdGlvbigkZmlyZWJhc2VBdXRoLCBGaXJlYmFzZVVybCl7XHJcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKTtcclxuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aChyZWYpO1xyXG5cclxuICAgIHZhciBBdXRoID0ge1xyXG4gICAgICByZWY6cmVmLFxyXG4gICAgICBhdXRoOiBhdXRoLFxyXG5cclxuICAgICAgZ2V0VWlkOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIHVpZCA9IHJlZi5nZXRBdXRoKCk7XHJcbiAgICAgICAgaWYodWlkICE9IG51bGwgKXtcclxuICAgICAgICAgIHJldHVybiByZWYuZ2V0QXV0aCgpLnVpZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIEF1dGg7XHJcbiAgfSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuY29udHJvbGxlcignQ2F0ZUN0cmwnLCBmdW5jdGlvbigkc3RhdGUsIENhdGVnb3J5LGNhdGVOYW1lLGNhdGVUb3BpY3Mpe1xuICAgIHZhciBjYXRlQ3RybCA9IHRoaXM7XG5cbiAgICAvL1BhcnNlcnNcbiAgICBjYXRlQ3RybC5jYXRlTmFtZSAgID0gY2F0ZU5hbWU7XG4gICAgY2F0ZUN0cmwuY2F0ZWdvcnkgICA9IENhdGVnb3J5O1xuICAgIGNhdGVDdHJsLmNhdGVUb3BpY3MgPSBjYXRlVG9waWNzO1xuXG5cbiAgICBjb25zb2xlLmxvZyhcIkNhdGVDdHJsXCIpO1xuICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG5cclxuICAvL1RvcGljIGxpc3RcclxuICAuZmFjdG9yeSgnQ2F0ZVNlcnZpY2UnLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5ICwgRmlyZWJhc2VVcmwpe1xyXG4gICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnY2F0ZWdvcmllcycpO1xyXG4gICAgdmFyIGNhdGVnb3JpZXMgPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcclxuXHJcbiAgICB2YXIgQ2F0ZSA9IHtcclxuXHJcbiAgICAgIG5hbWU6IGZ1bmN0aW9uKHRvcGljX3NsdWcpe1xyXG4gICAgICAgIHZhciBkYXRhID0gcmVmLm9yZGVyQnlDaGlsZChcInNsdWdcIikuZXF1YWxUbyh0b3BpY19zbHVnKTtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KGRhdGEpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgZm9ydG9waWM6IGZ1bmN0aW9uKHRvcGljX3NsdWcpe1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QodXNlcnNSZWYuY2hpbGQodWlkKSk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBhZGRDaGlsZDogZnVuY3Rpb24oY2hpbGRuYW1lKXtcclxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKGNoaWxkbmFtZSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGZvbGxvd0xpc3Q6ZnVuY3Rpb24odWlkKXtcclxuICAgICAgICB2YXIgZGF0YSA9IHJlZi5vcmRlckJ5Q2hpbGQoXCJuZXdzL2ZvbGxvd2VyXCIpLmVxdWFsVG8odWlkKTtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkoZGF0YSk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICB1bkZvbGxvdzpmdW5jdGlvbihzbHVnLHVpZCl7XHJcbiAgICAgICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnY2F0ZWdvcmllcy8nK3NsdWcrJy9mb2xsb3dlci8nK3VpZCk7XHJcbiAgICAgICAgcmVmLnJlbW92ZSgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgdXNlckZvbGxvdzpmdW5jdGlvbihzbHVnLHVpZCl7XHJcbiAgICAgICAgdmFyIGZvbGxvdz1mYWxzZTtcclxuICAgICAgICB2YXIgcmVmICAgID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydjYXRlZ29yaWVzLycrc2x1ZysnL2ZvbGxvd2VyLycrdWlkKTtcclxuICAgICAgICByZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XHJcbiAgICAgICAgICBmb2xsb3cgPSBzbmFwc2hvdC5leGlzdHMoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiBmb2xsb3c7XHJcbiAgICAgIH0sXHJcbiAgICAgIGFycjogJGZpcmViYXNlQXJyYXkocmVmKSxcclxuICAgICAgYWxsOmNhdGVnb3JpZXNcclxuICAgIH1cclxuICAgIHJldHVybiBDYXRlO1xyXG4gIH0pXHJcblxyXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuXHJcbiAgLy9Ub3BpYyBsaXN0XHJcbiAgLmZhY3RvcnkoJ1Bvc3QnLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QsIEZpcmViYXNlVXJsKXtcclxuICAgIHZhciByZWYgICAgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ3RvcGljcycpO1xyXG4gICAgdmFyIHRvcGljcyA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xyXG5cclxuICAgIHZhciBUUyA9IHtcclxuICAgICAgdG9waWNOYW1lOiBmdW5jdGlvbih0b3BpY19zbHVnKXtcclxuICAgICAgICB2YXIgZGF0YSA9IHJlZi5vcmRlckJ5Q2hpbGQoXCJzbHVnXCIpLmVxdWFsVG8odG9waWNfc2x1Zyk7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChkYXRhKTtcclxuICAgICAgfSxcclxuICAgICAgZm9ydG9waWM6IGZ1bmN0aW9uKHRvcGljX3NsdWcpe1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QodXNlcnNSZWYuY2hpbGQodWlkKSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGFsbDp0b3BpY3NcclxuICAgIH1cclxuICAgIHJldHVybiBUUztcclxuICB9KVxyXG5cclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5jb250cm9sbGVyKCdEYXNoYm9hcmRDdHJsJywgZnVuY3Rpb24oQXV0aCwgJHN0YXRlLENhdGVnb3J5LENhdGVTZXJ2aWNlLFRhZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQsICRtZFNpZGVuYXYsICRsb2cpIHtcbiAgICB2YXIgZGFzaGJvYXJkQ3RybCA9IHRoaXM7XG5cbiAgICBkYXNoYm9hcmRDdHJsLmF1dGggPSBBdXRoO1xuXG4gICAgZGFzaGJvYXJkQ3RybC5jYXRlID0gQ2F0ZVNlcnZpY2U7XG4gICAgZGFzaGJvYXJkQ3RybC5jYXRlZ29yaWVzICAgICAgPSBDYXRlZ29yeS5hbGw7XG4gICAgZGFzaGJvYXJkQ3RybC50b3BpY19ncmlkICA9IGZhbHNlO1xuICAgIGRhc2hib2FyZEN0cmwudGFncyAgICAgICAgPSBUYWdzLmFycjtcblxuICAgIGRhc2hib2FyZEN0cmwudXNlckNhdGVGb2xsb3cgID0gW107XG4gICAgZGFzaGJvYXJkQ3RybC5jYXRlSXNGb2xsb3cgICAgPSBbXTtcbiAgICBkYXNoYm9hcmRDdHJsLmZvbGxvd0xpc3QgICAgICA9ICcnO1xuXG5cbiAgICBkYXNoYm9hcmRDdHJsLnVzZXJGZWVkID0nbnVsbCc7XG5cbiAgICAvL0Nsb3NlIFNpZGUgYmFyXG4gICAgZGFzaGJvYXJkQ3RybC5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRtZFNpZGVuYXYoJ3JpZ2h0JykuY2xvc2UoKTtcbiAgICB9O1xuXG5cbiAgICBkYXNoYm9hcmRDdHJsLmZvbGxvd0NhdGUgPSBmdW5jdGlvbihjYXRlX3NsdWcpe1xuICAgICAgZGFzaGJvYXJkQ3RybC5jYXRlLmFkZENoaWxkKGNhdGVfc2x1ZysnL2ZvbGxvd2VyJylcbiAgICAgICAgLmNoaWxkKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJEYXNoYm9hcmRDdHJsXCIpO1xuICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuXG4gIC5kaXJlY3RpdmUoJ21haW5IZWFkZXInLGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAgICAgJ0UnLFxuICAgICAgdHJhbnNjbHVkZTogICB0cnVlLFxuICAgICAgLy9jb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICB9XG5cbiAgfSlcblxuICAvL0JhZGdlIG5vdGlmaWNhdGlvblxuICAuZGlyZWN0aXZlKCdiYWRnZU5vdGlmaWNhdGlvbicsZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICAgICAnRScsXG4gICAgICB0cmFuc2NsdWRlOiAgIHRydWUsXG4gICAgICAvL2NvbnRyb2xsZXI6ICAgJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAgJ3RlbXBsYXRlcy9odG1sL2JhZGdlLW5vdGlmaWNhdGlvbi5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIG5vdGlmaWNhdGlvbjogJz0nXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG5cbiAgLy9MaXN0IG9mIGNhdGVnb3JpZXMgb24gdGhlIHNpZGVyYmFyXG4gIC5kaXJlY3RpdmUoJ3Jldmlld1Njb3JlJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogICAgICdFJyxcbiAgICAgIHRyYW5zY2x1ZGU6ICAgdHJ1ZSxcbiAgICAgIGNvbnRyb2xsZXI6ICAgJ1RvcGljQ3RybCBhcyB0b3BpY0N0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICAndGVtcGxhdGVzL2h0bWwvcmV2aWV3LXN1bW1hcnktbGlzdC5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIHJldmlldzogJz0nXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG5cbiAgLy9Gb2xsb3cgQnV0dG9uXG4gIC5kaXJlY3RpdmUoJ3VzZXJGb2xsb3dlckJ0bicsZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICAgICAnRScsXG4gICAgICB0cmFuc2NsdWRlOiAgIHRydWUsXG4gICAgICBjb250cm9sbGVyOiAgICdUb3BpY0N0cmwgYXMgdG9waWNDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAgJ3RlbXBsYXRlcy9odG1sL2ZvbGxvdy11c2VyLmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgZm9sbG93OiAnPSdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cblxuICAvL0NhdGVnb3J5IGZvbGxvdyBidXR0b25cbiAgLmRpcmVjdGl2ZSgnY2F0ZUZvbGxvd0J0bicsZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwgYXMgZGFzaGJvYXJkQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL2NhdGVnb3J5LWZvbGxvdy1idG4uaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICBjYXRlOiAnPSdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLy9MaXN0IG9mIGNhdGVnb3JpZXMgb24gdGhlIHNpZGVyYmFyXG4gIC5kaXJlY3RpdmUoJ3RvcGljR3JpZCcsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwgYXMgZGFzaGJvYXJkQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL2NhdGVnb3J5LWdyaWQuaHRtbCdcbiAgICB9XG4gIH0pXG5cbiAgLy9HcmlkIFRhZ3MgZm9yIHNpZGViYXJcbiAgLmRpcmVjdGl2ZSgndGFnR3JpZCcsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwgYXMgZGFzaGJvYXJkQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL3RhZy1ncmlkLmh0bWwnXG4gICAgfVxuICB9KVxuXG5cbiAgLmRpcmVjdGl2ZSgndG9waWNDcmVhdGUnLCBmdW5jdGlvbigpe1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRyb2xsZXI6ICdUb3BpY0N0cmwgYXMgdG9waWNDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvdG9waWMtY3JlYXRlLmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgdG9waWM6ICc9J1xuICAgICAgfVxuICAgIH1cblxuICB9KVxuXG5cbiAgLmRpcmVjdGl2ZSgndG9waWNMaXN0JywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb250cm9sbGVyOiAnVG9waWNDdHJsIGFzIHRvcGljQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL3RvcGljLWxpc3QuaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICB0b3BpY3M6ICc9J1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuXG4gIC5kaXJlY3RpdmUoJ3RvcGljQWN0aW9uc0NhcmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRyb2xsZXI6ICdUb3BpY0N0cmwgYXMgdG9waWNDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvdG9waWMtYWN0aW9ucy1jYXJkLmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgdG9waWM6ICc9J1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuXG4gIC8vZm9yIHRhZ3MgLSBtYXggdGFnc1xuICAuZGlyZWN0aXZlKCdlbmZvcmNlTWF4VGFncycsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nQ3RybCkge1xuICAgICAgdmFyIG1heFRhZ3MgPSBhdHRycy5tYXhUYWdzID8gcGFyc2VJbnQoYXR0cnMubWF4VGFncywgJzQnKSA6IG51bGw7XG5cbiAgICAgIG5nQ3RybC4kcGFyc2Vycy5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSAmJiBtYXhUYWdzICYmIHZhbHVlLmxlbmd0aCA+IG1heFRhZ3MpIHtcbiAgICAgICAgICB2YWx1ZS5zcGxpY2UodmFsdWUubGVuZ3RoIC0gMSwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgZnVuY3Rpb24oJHN0YXRlLENhdGVnb3J5LFRvcGljcyxmZWVkKXtcbiAgICB2YXIgaG9tZUN0cmwgPSB0aGlzO1xuXG4gICAgaG9tZUN0cmwudG9waWNzID0gQ2F0ZWdvcnk7XG4gICAgaG9tZUN0cmwudG9waWNzID0gVG9waWNzO1xuICAgIGhvbWVDdHJsLmZlZWQgICA9IGZlZWQ7XG5cbiAgICBjb25zb2xlLmxvZyhcImhvbWVDdHJsXCIpO1xuXG4gIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmNvbmZpZyhbJyR0cmFuc2xhdGVQcm92aWRlcicsIGZ1bmN0aW9uICgkdHJhbnNsYXRlUHJvdmlkZXIpIHtcclxuICAgICR0cmFuc2xhdGVQcm92aWRlci50cmFuc2xhdGlvbnMoJ0VuZycsIHtcclxuICAgICAgJ0tFWV9EQVNIQk9BUkQnOiAgJ0Rhc2hib2FyZCcsXHJcbiAgICAgICdLRVlfTEFOR1VBR0VTJzogICdMYW5ndWFnZXMnLFxyXG4gICAgICAnS0VZX0hPTUUnOiAgICAgICAnSG9tZScsXHJcbiAgICAgICdLRVlfUkVHSVNURVInOiAgICdSZWdpc3RlcicsXHJcbiAgICAgICdLRVlfTE9HSU4nOiAgICAgICdMb2cgaW4nLFxyXG4gICAgICAnS0VZX0xPR09VVCc6ICAgICAnTG9nIG91dCcsXHJcbiAgICAgICdLRVlfRk9MTE9XJzogICAgICdGb2xsb3cnLFxyXG4gICAgICAnS0VZX0ZPTExPV0VSJzogICAnRm9sbG93ZXInLFxyXG4gICAgICAnS0VZX1VORk9MTE9XJzogICAnVW5mb2xsb3cnLFxyXG4gICAgICAnS0VZX0ZPTExPV0lORyc6ICAnRm9sbG93aW5nJyxcclxuICAgICAgJ0tFWV9QT1NUJzogICAgICAgJ1Bvc3QnLFxyXG4gICAgICAnS0VZX1BPU1RFRCc6ICAgICAnUG9zdGVkJyxcclxuICAgICAgJ0tFWV9VUFZPVEUnOiAgICAgJ1Vwdm90ZScsXHJcbiAgICAgICdLRVlfVVBWT1RFRCc6ICAgICdVcHZvdGVkJyxcclxuICAgICAgJ0tFWV9EV05fVk9URSc6ICAgJ0Rvd252b3RlJyxcclxuICAgICAgJ0tFWV9EV05fVk9URUQnOiAgJ0Rvd252b3RlZCcsXHJcbiAgICAgICdLRVlfVklFVyc6ICAgICAgICdWaWV3JyxcclxuICAgICAgJ0tFWV9SRU1PVkUnOiAgICAgJ1JlbW92ZScsXHJcbiAgICAgICdLRVlfQ0FOQ0VMJzogICAgICdDYW5jZWwnLFxyXG4gICAgICAnS0VZX1FVRVNUSU9OJzogICAnUXVlc3Rpb24nLFxyXG4gICAgICAnS0VZX1RPUElDJzogICAgICAnVG9waWMnLFxyXG4gICAgICAnS0VZX0NIR19QV0QnOiAgICAnQ2hhbmdlIFBhc3N3b3JkJyxcclxuICAgICAgJ0tFWV9QQVNTV09SRCc6ICAgJ1Bhc3N3b3JkJyxcclxuICAgICAgJ0tFWV9PTERfUFdEJzogICAgJ09sZCBQYXNzd29yZCcsXHJcbiAgICAgICdLRVlfTkVXX1BXRCc6ICAgICdOZXcgUGFzc3dvcmQnLFxyXG4gICAgICAnS0VZX05FV19QV0RfQyc6ICAnTmV3IHBhc3N3b3JkIGNvbmZpcm1hdGlvbicsXHJcbiAgICAgICdLRVlfU0FWRSc6ICAgICAgICdTYXZlJyxcclxuICAgICAgJ0tFWV9TQVZFX0RSQUZUJzogJ1NhdmUgYXMgZHJhZnQnLFxyXG4gICAgICAnS0VZX1RBR1MnOiAgICAgICAnVGFncycsXHJcbiAgICAgICdLRVlfRVhQTE9SRSc6ICAgICdFeHBsb3JlJyxcclxuICAgICAgJ0tFWV9GRUFUX0NBVCc6ICAgICdGZWF0dXJlcyBjYXRlZ29yaWVzJyxcclxuICAgICAgJ0tFWV9DT01NRU5UUyc6ICAgJ0NvbW1lbnRzJyxcclxuICAgICAgJ0tFWV9SRVBMWSc6ICAgICAgJ1JlcGx5JyxcclxuICAgICAgJ0tFWV9SRVZJRVcnOiAgICAgJ1JldmlldycsXHJcbiAgICAgICdLRVlfRURJVCc6ICAgICAgICdFZGl0JyxcclxuICAgICAgJ0tFWV9UUkVORCc6ICAgICAgJ1RyZW5kJyxcclxuICAgICAgJ0tFWV9UUkVORElORyc6ICAgJ1RyZW5kaW5nJyxcclxuICAgICAgJ0tFWV9XUklURV9SRVBMWSc6J1dyaXRlIGEgcmVwbHknLFxyXG4gICAgICAnS0VZX0xBVEVTVF9GRUVEJzonTGF0ZXN0IEZlZWQnLFxyXG5cclxuICAgICAgLy9SZW1vdmUgdG9waWNcclxuICAgICAgJ0tFWV9DT05GX1JFTU9WRSc6J0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmU/JyxcclxuICAgICAgJ0tFWV9DT05GX1JFTV9DJzogJ09uY2UgcmVtb3ZlLCB5b3Ugd2lsbCBub3QgYmUgYWJsZXRvIHRvIGdldCB0aGlzIHRvcGljIGJhY2snLFxyXG5cclxuXHJcbiAgICAgIC8vU0VOVEVOQ0VcclxuICAgICAgJ0tFWV9XSEFUX09OX1VSX01JTkQnOiAgJ1doYXRcXCdzIG9uIHlvdXIgbWluZD8nLFxyXG4gICAgICAnS0VZX1lPVV9XQU5UX0ZPTExPVyc6ICAnWW91IG1heSB3YW50IHRvIGZvbGxvdycsXHJcbiAgICAgICdLRVlfTk9fQUNDVF9SRUdJU1RFUic6ICdEb25cXCd0IGhhdmUgYWNjb3VudD8gUmVnaXN0ZXInLFxyXG4gICAgICAnS0VZX0NBTlRfQ0hOR19VU0VSJzogICAnRG9uXFwndCBoYXZlIGFjY291bnQ/IFJlZ2lzdGVyJyxcclxuICAgICAgJ0tFWV9ZT1VSX0FDQ09VTlQnOiAgICAgJ1lvdXIgYWNjb3VudCcsXHJcbiAgICAgICdLRVlfTk9USElOR19IRVJFJzogICAgICdOb3RoaW5nIGhlcmUsIHlldCcsXHJcbiAgICAgICdLRVlfV0hPX1RPX0ZPTExPVyc6ICAgICdXaG8gdG8gZm9sbG93JyxcclxuICAgICAgJ0tFWV9DQVRfV0lMTF9BUFBFQVInOiAgJ0ZvbGxvdyBzb21lIGNhdGVnb3JpZXMgYW5kIGl0IHdpbGwgYXBwZWFyIGhlcmUnLFxyXG4gICAgICAnS0VZX1dIVF9VUl9TVE9SWSc6ICAgICAnV2hhdFxcJ3MgeW91ciBzdG9yeScsXHJcbiAgICAgICdLRVlfV1JUX0NPTU1FTlQnOiAgICAgICdXcml0ZSBhIGNvbW1lbnQnLFxyXG5cclxuXHJcblxyXG4gICAgICAvL1VTRVIgSU5QVVRcclxuICAgICAgJ0tFWV9GSVJTVE5BTUUnOiAgJ0ZpcnN0IG5hbWUnLFxyXG4gICAgICAnS0VZX0xBU1ROQU1FJzogICAnTGFzdCBuYW1lJyxcclxuICAgICAgJ0tFWV9CSVJUSERBWSc6ICAgJ0JpcnRoZGF5JyxcclxuICAgICAgJ0tFWV9NT05USCc6ICAgICAgJ01vbnRoJyxcclxuICAgICAgJ0tFWV9EQVknOiAgICAgICAgJ0RheScsXHJcbiAgICAgICdLRVlfRU1BSUwnOiAgICAgICdFbWFpbCcsXHJcbiAgICAgICdLRVlfQ09ORl9FTUFJTCc6ICdDb25maXJtIEVtYWlsJyxcclxuICAgICAgJ0tFWV9HRU5ERVInOiAgICAgJ0dlbmRlcicsXHJcbiAgICAgICdLRVlfTUFMRSc6ICAgICAgICdNYWxlJyxcclxuICAgICAgJ0tFWV9GRU1BTEUnOiAgICAgJ0ZlbWFsZScsXHJcbiAgICAgICdLRVlfVVNFUk5BTUUnOiAgICdVc2VybmFtZScsXHJcbiAgICAgICdLRVlfTE9DQVRJT04nOiAgICdMb2NhdGlvbicsXHJcblxyXG4gICAgICAvL1VzZXIgRWRpdFxyXG4gICAgICAnS0VZX0VEX1BST0ZJTEUnOiAnRWRpdCBQcm9maWxlJyxcclxuICAgICAgJ0tFWV9FRF9DSEdfUFdEJzogJ0NoYW5nZSBQYXNzd29yZCcsXHJcbiAgICAgICdLRVlfRURfUFJPRklMRSc6ICdFZGl0IFByb2ZpbGUnLFxyXG4gICAgICAnS0VZX0VEX1NJVEUnOiAgICAnV2Vic2l0ZScsXHJcbiAgICAgICdLRVlfRURfUEhPTkUnOiAgICdQaG9uZScsXHJcbiAgICAgICdLRVlfRURfQklPJzogICAgICdCaW9ncmFwaHknLFxyXG5cclxuICAgIH0pO1xyXG5cclxuICAgICR0cmFuc2xhdGVQcm92aWRlci50cmFuc2xhdGlvbnMoJ+C5hOC4l+C4oicsIHtcclxuICAgICAgJ0tFWV9EQVNIQk9BUkQnOiAgJ+C4q+C5ieC4reC4h+C4l+C4seC5ieC4h+C4q+C4oeC4lCcsXHJcbiAgICAgICdLRVlfTEFOR1VBR0VTJzogICfguKDguLLguKnguLInLFxyXG4gICAgICAnS0VZX0hPTUUnOiAgICAgICAn4Lir4LiZ4LmJ4Liy4LmB4Lij4LiBJyxcclxuICAgICAgJ0tFWV9SRUdJU1RFUic6ICAgJ+C4quC4oeC4seC4hOC4o+C5g+C4iuC5iScsXHJcbiAgICAgICdLRVlfTE9HSU4nOiAgICAgICfguYDguILguYnguLLguKrguLnguYjguKPguLDguJrguJonLFxyXG4gICAgICAnS0VZX0ZPTExPVyc6ICAgICAn4LiV4Li04LiU4LiV4Liy4LihJyxcclxuICAgICAgJ0tFWV9QT1NUJzogICAgICAgJ+C5guC4nuC4quC4leC5jCdcclxuICAgIH0pO1xyXG5cclxuICAgICR0cmFuc2xhdGVQcm92aWRlci5wcmVmZXJyZWRMYW5ndWFnZSgnZW4nKTtcclxuICB9XSlcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmNvbnRyb2xsZXIoJ05vdGlDdHJsJywgZnVuY3Rpb24oJHN0YXRlLENhdGVnb3J5LFRvcGljcyxOb3RpU2VydmljZSl7XHJcbiAgICB2YXIgbm90aUN0cmwgPSB0aGlzO1xyXG5cclxuXHJcbiAgICBub3RpQ3RybC50b3BpY3MgPSBUb3BpY3M7XHJcbiAgICBub3RpQ3RybC5mZWVkICAgPSBmZWVkO1xyXG4gICAgbm90aUN0cmwubm90aVNlcnZpY2UgPSBOb3RpU2VydmljZTtcclxuXHJcbiAgICBub3RpQ3RybC5ub3RpZnlUbyA9ZnVuY3Rpb24odWlkKXtcclxuICAgICAgcmV0dXJuIG5vdGlDdHJsLmFyci5wdXNoKHVpZCkuJGFkZCh1aWQpXHJcbiAgICB9XHJcbiAgfSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG5cclxuICAuZmFjdG9yeSgnTm90aVNlcnZpY2UnLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5ICwgRmlyZWJhc2VVcmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVXNlcnMsJG5vdGlmaWNhdGlvbil7XHJcbiAgICB2YXIgcmVmICAgID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydub3RpZmljYXRpb24nKTtcclxuICAgIHZhciBub3RpID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XHJcbiAgICB2YXIgdXNlcnMgPSBVc2VycztcclxuXHJcbiAgICB2YXIgb2JzZXJ2ZXJDYWxsYmFja3MgPSBbXTtcclxuXHJcblxyXG4gICAgdmFyIE5vdGlmaWNhdGlvbiA9IHtcclxuXHJcbiAgICAgIC8vRGlzcGxheSB1bnJlYWRcclxuICAgICAgdW5yZWFkTm90aWZpY2F0aW9uOmZ1bmN0aW9uKHVpZCl7XHJcbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbm90aWZpY2F0aW9uLycrdWlkKycvdW5yZWFkJyk7XHJcbiAgICAgICAgdmFyIGNvdW50ZXI7XHJcbiAgICAgICAgcmVmLm9uKFwidmFsdWVcIixmdW5jdGlvbihzbmFwc2hvdCl7XHJcbiAgICAgICAgICBjb3VudGVyID0gc25hcHNob3QudmFsKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciBub3RpZmljYXRpb25fcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydub3RpZmljYXRpb24vJyt1aWQpO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbl9yZWYub24oXCJjaGlsZF9hZGRlZFwiLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAkbm90aWZpY2F0aW9uKCdOZXcgbWVzc2FnZSBmcm9tIFFhbnlhJywge1xyXG4gICAgICAgICAgICBib2R5OiAnSGVsbG8gJyt1aWQsXHJcbiAgICAgICAgICAgIGRpcjogJ2F1dG8nLFxyXG4gICAgICAgICAgICBsYW5nOiAnZW4nLFxyXG4gICAgICAgICAgICB0YWc6ICdteS10YWcnLFxyXG4gICAgICAgICAgICBpY29uOiAnaHR0cDovL3d3dy5jbC5jYW0uYWMudWsvcmVzZWFyY2gvc3JnL25ldG9zL2ltYWdlcy9xc2Vuc2UtbG9nby5wbmcnLFxyXG4gICAgICAgICAgICAvL2RlbGF5OiAxMDAwLCAvLyBpbiBtc1xyXG4gICAgICAgICAgICBmb2N1c1dpbmRvd09uQ2xpY2s6IHRydWUgLy8gZm9jdXMgdGhlIHdpbmRvdyBvbiBjbGlja1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4gY291bnRlciA7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvL05vdGlmeSBmb2xsb3dlcnNcclxuICAgICAgbm90aWZ5Rm9sbG93ZXI6ZnVuY3Rpb24odG9waWNJZCx1aWQpe1xyXG4gICAgICAgIHZhciByZWYgPSB1c2Vycy5nZXRGb2xsb3dlcih1aWQpO1xyXG4gICAgICAgIHJlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcclxuICAgICAgICAgIHNuYXBzaG90LmZvckVhY2goZnVuY3Rpb24oY2hpbGRTbmFwc2hvdCkge1xyXG4gICAgICAgICAgICAvL3VwZGF0ZSBub3RpZmljYXRpb24gYW5kIGRldGFpbHNcclxuICAgICAgICAgICAgTm90aWZpY2F0aW9uLnVwZGF0ZU5vdGlmaWNhdGlvbkNvdW50KHRvcGljSWQsY2hpbGRTbmFwc2hvdC5rZXkoKSk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvL0FkZCBkZXRhaWwgZm9yIHRoaXMgbm90aWZpY3RpYW9uXHJcbiAgICAgIG5vdGlmeUxvZzpmdW5jdGlvbih0b3BpY0lkLHVpZCxmcm9tX3VpZCl7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwidWlkIFwiK3VpZCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJmcm9tIHVpZCBcIisgZnJvbV91aWQpO1xyXG5cclxuICAgICAgICBOb3RpZmljYXRpb24uYWRkQ2hpbGQodWlkKS5wdXNoKCkuc2V0KHtcclxuICAgICAgICAgIHRvcGljSWQ6ICAgIHRvcGljSWQsXHJcbiAgICAgICAgICBmcm9tOiAgICAgICBmcm9tX3VpZCxcclxuICAgICAgICAgIGlzX3JlYWQ6ICAgIGZhbHNlLFxyXG4gICAgICAgICAgdGltZXN0YW1wOiAgbW9tZW50KCkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgfSxcclxuXHJcblxyXG4gICAgICAvL1Jlc2V0IHVucmVhZCBjb3VudGVyXHJcbiAgICAgIHJlc2V0VW5yZWFkOmZ1bmN0aW9uKHVpZCl7XHJcbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbm90aWZpY2F0aW9uLycrdWlkKycvdW5yZWFkJyk7XHJcbiAgICAgICAgcmVmLnNldCgwKTtcclxuICAgICAgfSxcclxuXHJcblxyXG4gICAgICAvL1VwZGF0ZSBub3RpZmljYXRpb25cclxuICAgICAgLy9AcGFyYW1zIHVpZCAtIHdobyB0aGlzIG5vdGlmaWNhdGlvbiBpcyBnb2luZyB0b1xyXG4gICAgICB1cGRhdGVOb3RpZmljYXRpb25Db3VudDpmdW5jdGlvbih0b3BpY0lkLHVpZCxmcm9tX3VpZCl7XHJcblxyXG4gICAgICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ25vdGlmaWNhdGlvbi8nK3VpZCsnL3VucmVhZCcpO1xyXG4gICAgICAgIHJlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcclxuICAgICAgICAgIC8vZGVmYXVsdCB1bnJlYWQgaXMgMVxyXG4gICAgICAgICBpZihzbmFwc2hvdC52YWwoKSA9PSAnbnVsbCcpe1xyXG4gICAgICAgICAgICByZWYuc2V0KDEpXHJcbiAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcmVmLnNldChzbmFwc2hvdC52YWwoKSArIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvck9iamVjdCkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJUaGUgcmVhZCBmYWlsZWQ6IFwiICsgZXJyb3JPYmplY3QuY29kZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vQWRkIHRvIGxvZ1xyXG4gICAgICAgIE5vdGlmaWNhdGlvbi5ub3RpZnlMb2codG9waWNJZCx1aWQsZnJvbV91aWQpO1xyXG5cclxuICAgICAgfSxcclxuXHJcblxyXG4gICAgICBhZGRDaGlsZDpmdW5jdGlvbihjaGlsZCl7XHJcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZChjaGlsZCk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBhZGRBcnJDaGlsZDpmdW5jdGlvbihjaGlsZCl7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQoY2hpbGQpKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGFycjogJGZpcmViYXNlQXJyYXkocmVmKSxcclxuICAgICAgYWxsOiBub3RpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gTm90aWZpY2F0aW9uO1xyXG4gIH0pXHJcblxyXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuICAuY29udHJvbGxlcignUGxhY2VzQ3RybCcsIGZ1bmN0aW9uKCRzdGF0ZSwkc2NvcGUsJHJvb3RTY29wZSwgJG1kRGlhbG9nLCAkbWRNZWRpYSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vU2VydmljZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRhZ3MsIFRvcGljcywgQXV0aCwgVXNlcnMsIFNsdWcsTGFuZ3VhZ2VzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VMYW5kaW5nKSB7XHJcblxyXG4gICAgdmFyIHBsYWNlc0N0cmwgPSB0aGlzO1xyXG4gICAgY29uc29sZS5sb2cocGxhY2VMYW5kaW5nKTtcclxuICAgIHBsYWNlc0N0cmwucGxhY2VMYW5kaW5nID0gcGxhY2VMYW5kaW5nO1xyXG5cclxuICB9KTtcclxuXHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5mYWN0b3J5KCdQbGFjZXMnLCBmdW5jdGlvbigkZmlyZWJhc2VBcnJheSwgRmlyZWJhc2VVcmwpe1xyXG5cclxuICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ3BsYWNlcycpO1xyXG4gICAgdmFyIHBsYWNlRGV0YWlsX3JlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsncGxhY2VzX2RldGFpbHMnKTtcclxuXHJcbiAgICB2YXIgcGxhY2VzID0gJGZpcmViYXNlQXJyYXkocmVmKTtcclxuXHJcbiAgICB2YXIgUGxhY2VzID0ge1xyXG4gICAgICBhZGRDaGlsZDogZnVuY3Rpb24oY2hpbGRuYW1lKXtcclxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKGNoaWxkbmFtZSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGFkZFBsYWNlRGV0YWlsQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkbmFtZSl7XHJcbiAgICAgICAgcmV0dXJuIHBsYWNlRGV0YWlsX3JlZi5jaGlsZChjaGlsZG5hbWUpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBnZXRQbGFjZVJlZjpmdW5jdGlvbihwbGFjZV9pZCl7XHJcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZChwbGFjZV9pZCsnL2luZm8nKTtcclxuICAgICAgfSxcclxuICAgICAgYXJyOiBwbGFjZXNcclxuICAgIH1cclxuICAgIHJldHVybiBQbGFjZXM7XHJcbiAgfSlcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcblxyXG4gIC8vQ2F0ZWdvcnkgbGlzdFxyXG4gIC5mYWN0b3J5KCdDYXRlZ29yeScsIGZ1bmN0aW9uKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXksIEZpcmViYXNlVXJsKXtcclxuICAgIHZhciByZWYgICAgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ2NhdGVnb3JpZXMnKTtcclxuICAgIHZhciBjYXRlZ29yaWVzID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XHJcbiAgICB2YXIgdG9waWNBcnIgPSAkZmlyZWJhc2VBcnJheShyZWYpO1xyXG5cclxuICAgIHZhciBDYXRlZ29yeSA9IHtcclxuICAgICAgZ2V0TmFtZTogZnVuY3Rpb24oc2x1Zyl7XHJcbiAgICAgICAgdmFyIGRhdGEgPSByZWYuY2hpbGQoc2x1Zyk7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChkYXRhKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGFsbDogY2F0ZWdvcmllc1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIENhdGVnb3J5O1xyXG4gIH0pXHJcblxyXG5cclxuICAvL0xhbmd1YWdlc1xyXG4gIC5mYWN0b3J5KCdMYW5ndWFnZXMnLCBmdW5jdGlvbigkZmlyZWJhc2VBcnJheSwgRmlyZWJhc2VVcmwpe1xyXG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbGFuZ3VhZ2VzJyk7XHJcbiAgICB2YXIgbGFuZyA9ICRmaXJlYmFzZUFycmF5KHJlZik7XHJcblxyXG4gICAgcmV0dXJuIGxhbmc7XHJcbiAgfSlcclxuXHJcblxyXG4gIC8vTGFuZ3VhZ2VzXHJcbiAgLmZhY3RvcnkoJ0FyY2hpdmUnLCBmdW5jdGlvbigkZmlyZWJhc2VBcnJheSwgRmlyZWJhc2VVcmwpe1xyXG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnYXJjaGl2ZScpO1xyXG4gICAgdmFyIGFyY2hpdmUgPSAkZmlyZWJhc2VBcnJheShyZWYpO1xyXG5cclxuICAgIHZhciBBcmNoaXZlID17XHJcbiAgICAgIGFkZENoaWxkOiBmdW5jdGlvbihzbHVnKXtcclxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKHNsdWcpO1xyXG4gICAgICB9LFxyXG4gICAgICByZWY6IHJlZixcclxuICAgICAgYXJyOiBhcmNoaXZlXHJcbiAgICB9XHJcbiAgICByZXR1cm4gQXJjaGl2ZTtcclxuICB9KTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmNvbnRyb2xsZXIoJ1RhZ0N0cmwnLCBmdW5jdGlvbihBdXRoLCBVc2VycywgJHN0YXRlLCRyb290U2NvcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1Jlc29sdmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZ0xhbmRpbmcsdGFnTmFtZSkge1xyXG5cclxuICAgIHZhciB0YWdDdHJsID0gdGhpcztcclxuICAgIHRhZ0N0cmwudGFnTGFuZGluZyAgPSB0YWdMYW5kaW5nO1xyXG4gICAgdGFnQ3RybC50YWdOYW1lICAgICA9IHRhZ05hbWU7XHJcblxyXG4gIH0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmZhY3RvcnkoJ1RhZ3MnLCBmdW5jdGlvbigkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBGaXJlYmFzZVVybCwgJHEpe1xuXG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsndGFncycpO1xuICAgIHZhciB0YWdzID0gJGZpcmViYXNlQXJyYXkocmVmKTtcblxuICAgIHZhciBUYWdzID0ge1xuXG4gICAgICBhZGRDaGlsZDogZnVuY3Rpb24oY2hpbGRuYW1lKXtcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZChjaGlsZG5hbWUpXG4gICAgICB9LFxuXG4gICAgICB0YWdzVXJsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYpO1xuICAgICAgfSxcblxuICAgICAgZ2V0VGFnUmVmOmZ1bmN0aW9uKHRhZyl7XG4gICAgICAgIHJldHVybiByZWYuY2hpbGQodGFnKTtcbiAgICAgIH0sXG5cbiAgICAgIGdldFRhZ09iamVjdDpmdW5jdGlvbih0YWcpe1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0YWcpKVxuICAgICAgfSxcblxuICAgICAgdG9waWNUYWdzOmZ1bmN0aW9uKHRhZyl7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgdmFyIGZiID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKTtcbiAgICAgICAgdmFyIGRhdGFSZXQgPSAnJztcblxuICAgICAgICByZXR1cm4gZmIuY2hpbGQoJ3RhZ3MvJyt0YWcpXG4gICAgICAgICAgLm9uKCdjaGlsZF9hZGRlZCcsIGZ1bmN0aW9uKHRhZ1NuYXApe1xuICAgICAgICAgICAgZmIuY2hpbGQoJ3RvcGljcycpXG4gICAgICAgICAgICAgIC5vcmRlckJ5Q2hpbGQoXCJ0YWdzXCIpXG4gICAgICAgICAgICAgIC5lcXVhbFRvKHRhZylcbiAgICAgICAgICAgICAgLm9uKCdjaGlsZF9hZGRlZCcsIGZ1bmN0aW9uKHRvcGljU25hcCkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAvL3Nob3coIGV4dGVuZCh7fSwgdGFnU25hcC52YWwoKSwgdG9waWNTbmFwLnZhbCgpKSApO1xuICAgICAgICAgICAgICAgIHJldHVybiBleHRlbmQoe30sIHRhZ1NuYXAudmFsKCksIHRvcGljU25hcC52YWwoKSk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhUmV0KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgfSxcblxuICAgICAgYXJyOiB0YWdzXG5cbiAgICB9XG4gICAgcmV0dXJuIFRhZ3M7XG4gIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmNvbnRyb2xsZXIoJ1RvcGljTGFuZGluZ0N0cmwnLCBmdW5jdGlvbiAoJHN0YXRlLCAkc2NvcGUsIFNsdWcsIFRvcGljcywgQXV0aCwgVXNlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vUmVzb2x2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc093bmVyLHRvcGljTGFuZGluZywgcmVwbHlMaXN0LCB2aWV3RGF0YSwgZm9sbG93ZXJzKSB7XG5cbiAgICB2YXIgdG9waWNMYW5kaW5nQ3RybCA9IHRoaXNcblxuXG4gICAgdG9waWNMYW5kaW5nQ3RybC5hdXRoICAgICAgICAgPSBBdXRoO1xuICAgIHRvcGljTGFuZGluZ0N0cmwudXNlcnMgICAgICAgID0gVXNlcnM7XG4gICAgdG9waWNMYW5kaW5nQ3RybC50b3BpY0xhbmRpbmcgPSB0b3BpY0xhbmRpbmc7XG4gICAgdG9waWNMYW5kaW5nQ3RybC50b3BpY3MgICAgICAgPSBUb3BpY3M7XG4gICAgdG9waWNMYW5kaW5nQ3RybC5yZXBseUxpc3QgICAgPSByZXBseUxpc3Q7XG4gICAgdG9waWNMYW5kaW5nQ3RybC52aWV3cyAgICAgICAgPSB2aWV3RGF0YTtcbiAgICB0b3BpY0xhbmRpbmdDdHJsLmZvbGxvd2VycyAgICA9IGZvbGxvd2VycztcbiAgICB0b3BpY0xhbmRpbmdDdHJsLmlzT3duZXIgICAgICA9IGlzT3duZXI7XG5cblxuXG5cbiAgICAvL0dldHRpbmcgUmVwbGllcyBpbiByZXBsaWVzXG4gICAgdG9waWNMYW5kaW5nQ3RybC5pblJlcGx5QXJyID0gW107XG4gICAgdG9waWNMYW5kaW5nQ3RybC5yZXBseUluUmVwbHkgPSBmdW5jdGlvbigpe1xuXG4gICAgICBmb3IodmFyIGk9MDsgaTx0b3BpY0xhbmRpbmdDdHJsLnJlcGx5TGlzdC5sZW5ndGg7aSsrKXtcbiAgICAgICAgdmFyIHRvcGljSWQgPSB0b3BpY0xhbmRpbmdDdHJsLnJlcGx5TGlzdFtpXS50b3BpY0lkO1xuICAgICAgICB2YXIgcmVwbHlJZCA9IHRvcGljTGFuZGluZ0N0cmwucmVwbHlMaXN0W2ldLiRpZDtcbiAgICAgICAgdG9waWNMYW5kaW5nQ3RybC5pblJlcGx5QXJyW2ldID0gdG9waWNMYW5kaW5nQ3RybC50b3BpY3MucmVwbHlJblJlcGx5KHRvcGljSWQscmVwbHlJZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdG9waWNMYW5kaW5nQ3RybC5yZXBseUluUmVwbHkoKTtcbiAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuY29udHJvbGxlcignVG9waWNDdHJsJywgZnVuY3Rpb24oJHN0YXRlLCRzY29wZSwkcm9vdFNjb3BlLCAkbWREaWFsb2csICRtZE1lZGlhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGh0dHAsRmlyZWJhc2VVcmwsJHRyYW5zbGF0ZSwkbm90aWZpY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9TZXJ2aWNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90aVNlcnZpY2UsVGFncywgVG9waWNzLCBBdXRoLCBVc2VycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNsdWcsUGxhY2VzLCBMYW5ndWFnZXMsQXJjaGl2ZSl7XG5cbiAgICBjb25zb2xlLmxvZyhcInRvcGljQ3RybFwiKTtcblxuICAgIHZhciB0b3BpY0N0cmwgPSB0aGlzO1xuXG5cbiAgICAvL1BhcnNlciBoZXJlXG4gICAgdG9waWNDdHJsLnRhZ3MgICAgICA9IFRhZ3M7XG4gICAgdG9waWNDdHJsLnRvcGljcyAgICA9IFRvcGljcztcbiAgICB0b3BpY0N0cmwuYXV0aCAgICAgID0gQXV0aDtcbiAgICB0b3BpY0N0cmwudXNlcnMgICAgID0gVXNlcnM7XG4gICAgdG9waWNDdHJsLmxhbmd1YWdlcyA9IExhbmd1YWdlcztcbiAgICB0b3BpY0N0cmwucGxhY2VzICAgID0gUGxhY2VzO1xuICAgIHRvcGljQ3RybC5hcmNoaXZlICAgPSBBcmNoaXZlO1xuICAgIHRvcGljQ3RybC5ub3RpICAgICAgPSBOb3RpU2VydmljZTtcblxuICAgIGlmKHRvcGljQ3RybC5hdXRoLnJlZi5nZXRBdXRoKCkgIT0gbnVsbCApe1xuICAgICAgdG9waWNDdHJsLnByb2ZpbGUgID0gdG9waWNDdHJsLnVzZXJzLmdldFByb2ZpbGUodG9waWNDdHJsLmF1dGgucmVmLmdldEF1dGgoKS51aWQpO1xuICAgICAgdG9waWNDdHJsLnVpZCA9IHRvcGljQ3RybC5wcm9maWxlLiRpZDtcbiAgICAgIHRvcGljQ3RybC51c2VyUmVmID0gdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCk7XG4gICAgICB0b3BpY0N0cmwudXNlclVwdm90ZWRUb3BpY3MgPSB0b3BpY0N0cmwudXNlcnMudXB2b3Rlcyh0b3BpY0N0cmwudWlkKTtcbiAgICAgIHRvcGljQ3RybC51c2VyRG93bnZvdGVkVG9waWNzID0gdG9waWNDdHJsLnVzZXJzLmRvd252b3Rlcyh0b3BpY0N0cmwudWlkKTtcbiAgICAgIHRvcGljQ3RybC51c2VyRm9sbG93aW5nID0gdG9waWNDdHJsLnVzZXJzLmZvbGxvd2luZyh0b3BpY0N0cmwudWlkKTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgIHRvcGljQ3RybC5wcm9maWxlID0nJztcbiAgICAgIHRvcGljQ3RybC51aWQgPSAnJztcbiAgICAgIHRvcGljQ3RybC51c2VyUmVmID0gJyc7XG4gICAgfVxuXG5cblxuICAgIC8vUHJlc2V0IFBhcmFtZXRlcnNcbiAgICB0b3BpY0N0cmwuaW1hZ2VTdHJpbmdzICA9IFtdO1xuICAgIHRvcGljQ3RybC5pbWFnZVRleHQgICAgID0gW107XG4gICAgdG9waWNDdHJsLmluUmVwbHlBcnIgICAgPSBbXTtcbiAgICB0b3BpY0N0cmwubG9hZEJ1c3kgICAgICA9IGZhbHNlO1xuICAgIHRvcGljQ3RybC5zbHVnUmV0dXJuICAgID0gbnVsbDtcbiAgICB0b3BpY0N0cmwuY3JpdGVyaWEgICAgICA9IGZhbHNlO1xuICAgIHRvcGljQ3RybC5jcml0ZXJpYVJlcGx5ID0gbnVsbDtcbiAgICB0b3BpY0N0cmwucmV2aWV3Q3JpdGVyaWE9ZmFsc2U7XG4gICAgdG9waWNDdHJsLmNyaXRSZXBseURhdGEgPSBudWxsO1xuXG4gICAgLy9pZiBhbGxvdyBudWxsIGluIHRoZSBmb3JtXG4gICAgdG9waWNDdHJsLm5ld1RvcGljICAgICAgPSB7XG4gICAgICAnbG9jYXRpb24nOiAnJyxcbiAgICAgICd1cmwnIDogJycsXG4gICAgICAnaXBJbmZvJzogJycsXG4gICAgICAndGFncyc6ICcnLFxuICAgICAgJ2JvZHknOiAnJ1xuICAgIH1cblxuXG4gICAgLy9DYWxjIGF2ZXJhZ2UgcmV2aWV3IGlucHV0IGluIHJlcGx5XG4gICAgdG9waWNDdHJsLmF2Z1Jldmlld1JlcGx5ID0gZnVuY3Rpb24oKXtcblxuICAgICAgdmFyIG9iakNvdW50ID0gT2JqZWN0LmtleXModG9waWNDdHJsLmNyaXRlcmlhUmVwbHkpLmxlbmd0aDtcbiAgICAgIHZhciBhdmcgPSAwXG4gICAgICBmb3IodmFyIGk9MDtpPG9iakNvdW50O2krKyl7XG4gICAgICAgIGF2ZyA9IGF2ZyArIHRvcGljQ3RybC5jcml0ZXJpYVJlcGx5W2ldO1xuICAgICAgfVxuXG4gICAgICB0b3BpY0N0cmwucmVwbHlSZXZpZXdBdmVyYWdlID0gYXZnL29iakNvdW50O1xuXG4gICAgICBjb25zb2xlLmxvZyh0b3BpY0N0cmwuY3JpdGVyaWFSZXBseSk7XG5cbiAgICAgIHRvcGljQ3RybC5jcml0UmVwbHlEYXRhID0geyBhdmc6IHRvcGljQ3RybC5yZXBseVJldmlld0F2ZXJhZ2UsIGRhdGE6IHRvcGljQ3RybC5jcml0ZXJpYVJlcGx5fVxuICAgIH1cblxuXG4gICAgLy9HZXQgdGhlIGF2ZXJhZ2Ugc2NvcmUgZnJvbSBjcml0ZXJpYSB2YWx1ZXNcbiAgICB0b3BpY0N0cmwuYXZnUmV2aWV3U2NvcmUgPSBmdW5jdGlvbihkYXRhKXtcbiAgICAgIGlmKGRhdGEpXG4gICAgICB7XG4gICAgICB2YXIgYXZnID0wO1xuICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xuICAgICAgICBhdmcgPSBhdmcgKyBkYXRhW2ldLnJhdGluZztcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdmcvZGF0YS5sZW5ndGg7XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICAvL0xhYmVsIGZvciByZW1vdmUgdG9waWNzXG4gICAgJHRyYW5zbGF0ZShbJ0tFWV9SRU1PVkUnLCAnS0VZX0NBTkNFTCcsJ0tFWV9DT05GX1JFTU9WRScsJ0tFWV9DT05GX1JFTV9DJ10pLnRoZW4oZnVuY3Rpb24gKHRyYW5zbGF0aW9ucykge1xuICAgICAgdG9waWNDdHJsLnJlbW92ZVRyYW5zID0gdHJhbnNsYXRpb25zLktFWV9SRU1PVkU7XG4gICAgICB0b3BpY0N0cmwuY2FuY2VsVHJhbnMgPSB0cmFuc2xhdGlvbnMuS0VZX0NBTkNFTDtcbiAgICAgIHRvcGljQ3RybC5jb25maXJtUmVtICA9IHRyYW5zbGF0aW9ucy5LRVlfQ09ORl9SRU1PVkU7XG4gICAgICB0b3BpY0N0cmwuY29uZmlybVJlbUNvbnRlbnQgPSAgdHJhbnNsYXRpb25zLktFWV9DT05GX1JFTV9DO1xuICAgIH0pO1xuXG5cbiAgICB0b3BpY0N0cmwudXNlck5hbWUgPSBmdW5jdGlvbih1c2VySWQpe1xuICAgICAgaWYodXNlcklkIT0gbnVsbCl7XG4gICAgICAgIC8vcmV0dXJuIHRvcGljQ3RybC51c2Vycy5nZXREaXNwbGF5TmFtZSh1c2VySWQpO1xuICAgICAgfVxuICAgIH1cblxuXG5cblxuICAgIC8vTG9naW4gZm9yIG1hdGVyaWFsXG4gICAgdG9waWNDdHJsLnNob3dNZExvZ2luID0gZnVuY3Rpb24oZXYpIHtcbiAgICAgIHZhciB1c2VGdWxsU2NyZWVuID0gKCRtZE1lZGlhKCdzbScpIHx8ICRtZE1lZGlhKCd4cycpKSAmJiAkc2NvcGUuY3VzdG9tRnVsbHNjcmVlbjtcbiAgICAgICRtZERpYWxvZy5zaG93KHtcbiAgICAgICAgICAvL2NvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC9tZC1sb2dpbi1mb3JtLmh0bWwnLFxuICAgICAgICAgIHBhcmVudDogYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLFxuICAgICAgICAgIHRhcmdldEV2ZW50OiBldixcbiAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlLFxuICAgICAgICAgIGZ1bGxzY3JlZW46IHVzZUZ1bGxTY3JlZW5cbiAgICAgICAgfSlcbiAgICB9XG5cblxuXG4gICAgdG9waWNDdHJsLmRlY29kZVRleHQgPSBmdW5jdGlvbih0ZXh0KXtcbiAgICAgIC8vcmV0dXJuICRmaWx0ZXIoJ3NsdWdpZnknKShpdGVtLm5hbWUpO1xuICAgICAgY29uc29sZS5sb2coZGVjb2RlVVJJKHRleHQpKTtcbiAgICAgIHJldHVybiBkZWNvZGVVUkkodGV4dCk7XG4gICAgfVxuXG5cbiAgICB0b3BpY0N0cmwubG9hZE1vcmUgPSBmdW5jdGlvbihpdGVtcykge1xuICAgICAgdG9waWNDdHJsLmxvYWRCdXN5ID0gdHJ1ZTtcbiAgICAgIHZhciBkYXRhID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRhdGEucHVzaChpdGVtc1tpXSk7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgIHJldHVybiBkYXRhXG4gICAgfTtcblxuICAgIHRvcGljQ3RybC5sb2FkVGFncyA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG4gICAgICBjb25zb2xlLmxvZyh0b3BpY0N0cmwudGFncy50YWdzVXJsKCkpO1xuICAgIH07XG5cblxuICAgIC8qdG9waWNDdHJsLnVzZXJzLmdldExvY2F0aW9uSVAoKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5pcEluZm8gPSBkYXRhO1xuICAgIH0pOyovXG5cblxuICAgIC8vVXBsb2FkIFByb2ZpbGUgaW1hZ2VcbiAgICB0b3BpY0N0cmwudXBsb2FkRmlsZSA9IGZ1bmN0aW9uKGZpbGVzLGluZGV4KSB7XG4gICAgICBhbmd1bGFyLmZvckVhY2goZmlsZXMsIGZ1bmN0aW9uIChmbG93RmlsZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgIHZhciB1cmkgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgIHRvcGljQ3RybC5pbWFnZVN0cmluZ3NbaW5kZXhdID0gdXJpO1xuICAgICAgICB9O1xuICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0RhdGFVUkwoZmxvd0ZpbGUuZmlsZSk7XG4gICAgICB9KVxuICAgIH07XG5cblxuICAgIC8vU2hvdyBjb25maXJtIHJlbW92ZSB0b3BpY1xuICAgIHRvcGljQ3RybC5zaG93Q29uZmlybVJlbW92ZSA9IGZ1bmN0aW9uKGV2LHRvcGljX293bmVyLG9iail7XG4gICAgICAvLyBBcHBlbmRpbmcgZGlhbG9nIHRvIGRvY3VtZW50LmJvZHkgdG8gY292ZXIgc2lkZW5hdiBpbiBkb2NzIGFwcFxuICAgICAgdmFyIGNvbmZpcm0gPSAkbWREaWFsb2cuY29uZmlybSgpXG4gICAgICAgIC50aXRsZSh0b3BpY0N0cmwuY29uZmlybVJlbSlcbiAgICAgICAgLnRleHRDb250ZW50KHRvcGljQ3RybC5jb25maXJtUmVtQ29udGVudClcbiAgICAgICAgLnRhcmdldEV2ZW50KGV2KVxuICAgICAgICAub2sodG9waWNDdHJsLnJlbW92ZVRyYW5zKVxuICAgICAgICAuY2FuY2VsKHRvcGljQ3RybC5jYW5jZWxUcmFucyk7XG4gICAgICAkbWREaWFsb2cuc2hvdyhjb25maXJtKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZih0b3BpY0N0cmwucmVtb3ZlVG9waWModG9waWNfb3duZXIsb2JqKSl7XG4gICAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuXG4gICAgLy9SZW1vdmUgdG9waWNcbiAgICB0b3BpY0N0cmwucmVtb3ZlVG9waWMgPSBmdW5jdGlvbih0b3BpY19vd25lcixvYmope1xuICAgICAgLy92ZXJpZnkgaWYgdGhlIHRvcGljIG93bmVyIGFuZCB0aGUgbG9naW4gb3duZXIgaXMgdGhlIHNhbWUgcHBsXG4gICAgICBpZih0b3BpY19vd25lciA9PSB0b3BpY0N0cmwudWlkKXtcbiAgICAgICAgbW92ZUZiUmVjb3JkKHRvcGljQ3RybC50b3BpY3MucmVmQ2hpbGQob2JqLiRpZCksIHRvcGljQ3RybC5hcmNoaXZlLmFkZENoaWxkKG9iai4kaWQpKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvL1JlcGx5IHRvIHRvcGljXG4gICAgdG9waWNDdHJsLnJlcGx5ID0gZnVuY3Rpb24odG9waWNPYmope1xuXG4gICAgICB0b3BpY0N0cmwudG9waWNzLnJlcGx5QXJyKHRvcGljT2JqLiRpZCkuJGFkZCh7XG4gICAgICAgIHRvcGljSWQ6ICB0b3BpY09iai4kaWQsXG4gICAgICAgIGJvZHk6ICAgICB0b3BpY0N0cmwubmV3UmVwbHkuYm9keSxcbiAgICAgICAgdWlkOiAgICAgIHRvcGljQ3RybC51aWQsXG4gICAgICAgIHJldmlldzogICB0b3BpY0N0cmwuY3JpdFJlcGx5RGF0YSxcbiAgICAgICAgY3JlYXRlZDogIG1vbWVudCgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgLy9Ob3RpZnkgdG9waWMgb3duZXJcbiAgICAgICAgLy90b3BpY09iaiByZWZlcnMgdG8gdGhlIHByb3BlcnR5IG9mIHRoaXMgb2JqZWN0XG4gICAgICAgIHRvcGljQ3RybC5ub3RpLnVwZGF0ZU5vdGlmaWNhdGlvbkNvdW50KHRvcGljT2JqLiRpZCx0b3BpY09iai51aWQsdG9waWNDdHJsLnVpZCk7XG4gICAgICB9KVxuXG5cblxuXG5cblxuICAgICAgdG9waWNDdHJsLnRvcGljcy5yZXBseUNvdW50KHRvcGljT2JqLiRpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGlmKCFkYXRhLmNvdW50KXtcbiAgICAgICAgICB0b3BpY0N0cmwudG9waWNzLnJlcGx5Q291bnRSZWYodG9waWNPYmouJGlkKS5zZXQoMSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRvcGljQ3RybC50b3BpY3MucmVwbHlDb3VudFJlZih0b3BpY09iai4kaWQpXG4gICAgICAgICAgICAuc2V0KGRhdGEuY291bnQgKzEpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuXG4gICAgICAvL1N0YXQgdXBkYXRlIGZvciB1c2VyXG4gICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9jb21tZW50L2NvdW50JylcbiAgICAgICAgLnNldCh0b3BpY0N0cmwucHJvZmlsZS5zdGF0LmNvbW1lbnQuY291bnQgKyAxKTtcblxuICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvY29tbWVudC90b3BpY3MvJyt0b3BpY09iai4kaWQpXG4gICAgICAgIC5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xuICAgIH1cblxuXG5cbiAgICAvL1JlcGx5IGluIHJlcGx5XG4gICAgdG9waWNDdHJsLnJlcGx5SW5SZXBseSA9IGZ1bmN0aW9uKHRvcGljSWQscmVwbHlJZCl7XG4gICAgICB0b3BpY0N0cmwudG9waWNzLnJlcGx5SW5SZXBseUFycih0b3BpY0lkLHJlcGx5SWQpLiRhZGQoe1xuICAgICAgICBib2R5OiAgICAgdG9waWNDdHJsLnJlcGx5SW5SZXBseS5ib2R5LFxuICAgICAgICB1aWQ6ICAgICAgdG9waWNDdHJsLnVpZCxcbiAgICAgICAgY3JlYXRlZDogIG1vbWVudCgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH0pXG4gICAgfVxuXG5cblxuICAgIHRvcGljQ3RybC5hZGROZXdDaG9pY2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuZXdJdGVtTm8gPSB0b3BpY0N0cmwucmV2aWV3Q3JpdGVyaWEubGVuZ3RoKzE7XG4gICAgICB0b3BpY0N0cmwucmV2aWV3Q3JpdGVyaWEucHVzaCh7J2lkJzonY3JpdGVyaWEnK25ld0l0ZW1Ob30pO1xuICAgIH07XG5cbiAgICB0b3BpY0N0cmwucmVtb3ZlQ2hvaWNlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdEl0ZW0gPSB0b3BpY0N0cmwucmV2aWV3Q3JpdGVyaWEubGVuZ3RoLTE7XG4gICAgICB0b3BpY0N0cmwucmV2aWV3Q3JpdGVyaWEuc3BsaWNlKGxhc3RJdGVtKTtcbiAgICB9O1xuXG5cbiAgICAvL0NyZWF0ZSBuZXcgdG9waWNcbiAgICB0b3BpY0N0cmwuY3JlYXRlVG9waWMgPSBmdW5jdGlvbihjYXRlZ29yeSxpc0RyYWZ0KXtcblxuICAgICAgLy9DaGVjayBpZiB3ZSBoYXZlIGxvY2F0aW9uIGRldGFpbHNcbiAgICAgIHZhciBsb2NhdGlvbkRldGFpbCA9ICcnO1xuXG4gICAgICBpZih0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24gIT09ICcnICl7XG4gICAgICAgIGNvbnNvbGUubG9nKHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbik7XG4gICAgICAgIGxvY2F0aW9uRGV0YWlsID0ge1xuICAgICAgICAgIHBsYWNlX2lkOiB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5wbGFjZV9pZCxcbiAgICAgICAgICBzbHVnOiAgICAgU2x1Zy5zbHVnaWZ5KHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLm5hbWUpLFxuICAgICAgICAgIG5hbWU6ICAgICB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5uYW1lLFxuICAgICAgICAgIGFkZHJlc3M6ICB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICBsYXQ6ICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uLmRldGFpbHMuZ2VvbWV0cnkubG9jYXRpb24ubGF0KCksXG4gICAgICAgICAgbG5nOiAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxuICAgICAgICAgIGxuZzogICAgICB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5nZW9tZXRyeS5sb2NhdGlvbi5sbmcoKSxcbiAgICAgICAgICBsbmc6ICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uLmRldGFpbHMuZ2VvbWV0cnkubG9jYXRpb24ubG5nKCksXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAvKiBERUJVRyBGT1JNIFZBTFVFXG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICB0eXBlOiAgICAgICAgICAgdG9waWNDdHJsLnR5cGUsXG4gICAgICAgIGxhbmc6ICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMubGFuZyxcbiAgICAgICAgdG9waWM6ICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYyxcbiAgICAgICAgYm9keTogICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5ib2R5LFxuICAgICAgICBjYXRlZ29yeTogICAgICAgY2F0ZWdvcnksXG4gICAgICAgIHVpZDogICAgICAgICAgICB0b3BpY0N0cmwudWlkLFxuICAgICAgICBzbHVnOiAgICAgICAgICAgU2x1Zy5zbHVnaWZ5KHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYyksXG4gICAgICAgIHBob3RvczogICAgICAgICB0b3BpY0N0cmwuaW1hZ2VTdHJpbmdzLFxuICAgICAgICBwaG90b3NfdGV4dDogICAgdG9waWNDdHJsLmltYWdlVGV4dCxcbiAgICAgICAgbG9jYXRpb246ICAgICAgIGxvY2F0aW9uRGV0YWlsLFxuICAgICAgICB1cmw6ICAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLnVybCxcbiAgICAgICAgZHJhZnQ6ICAgICAgICAgIGlzRHJhZnQsXG4gICAgICAgIGNyZWF0ZWQ6ICAgICAgICBtb21lbnQoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB0YWdzOiAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLnRhZ3MsXG4gICAgICAgIHVzZXJJUDogICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmlwSW5mb1xuICAgICAgfTtcbiAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgKi9cblxuICAgICAgdG9waWNDdHJsLnRvcGljcy5hcnIuJGFkZCh7XG4gICAgICAgICAgdHlwZTogICAgICAgICAgIHRvcGljQ3RybC50eXBlLFxuICAgICAgICAgIGxhbmc6ICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMubGFuZyxcbiAgICAgICAgICB0b3BpYzogICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLnRvcGljLFxuICAgICAgICAgIGJvZHk6ICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMuYm9keSxcbiAgICAgICAgICBjYXRlZ29yeTogICAgICAgY2F0ZWdvcnksXG4gICAgICAgICAgdWlkOiAgICAgICAgICAgIHRvcGljQ3RybC51aWQsXG4gICAgICAgICAgLy9zbHVnOiAgICAgICAgICAgU2x1Zy5zbHVnaWZ5KHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYyksXG4gICAgICAgICAgc2x1ZzogICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYyxcbiAgICAgICAgICBwaG90b3M6ICAgICAgICAgdG9waWNDdHJsLmltYWdlU3RyaW5ncyxcbiAgICAgICAgICBwaG90b3NfdGV4dDogICAgdG9waWNDdHJsLmltYWdlVGV4dCxcbiAgICAgICAgICBsb2NhdGlvbjogICAgICAgbG9jYXRpb25EZXRhaWwsXG4gICAgICAgICAgdXJsOiAgICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy51cmwsXG4gICAgICAgICAgZHJhZnQ6ICAgICAgICAgIGlzRHJhZnQsXG4gICAgICAgICAgY3JlYXRlZDogICAgICAgIG1vbWVudCgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgdGFnczogICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy50YWdzLFxuICAgICAgICAgIHVzZXJJUDogICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMuaXBJbmZvLFxuICAgICAgICAgIHJldmlldzogICAgICAgICB0b3BpY0N0cmwucmV2aWV3Q3JpdGVyaWEsXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odG9waWMpe1xuXG4gICAgICAgICAgdmFyIHNsdWdUZXh0ID0nJztcbiAgICAgICAgICAvL2lmIHdlIGFyZSB1bmFibGUgdG8gY29udmVydCB0byBzbHVnIHRoZW4gd2UgdXNlIHRoZSB0b3BpYyB0ZXh0LCBlbHNlIHVzZSBzbHVnXG4gICAgICAgICAgaWYoU2x1Zy5zbHVnaWZ5KHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYykgPT0nJyl7XG4gICAgICAgICAgICBzbHVnVGV4dCA9IHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYztcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHNsdWdUZXh0ID0gU2x1Zy5zbHVnaWZ5KHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy9VcGRhdGUgc2x1ZyB3aXRoIHRvcGljIEtleVxuICAgICAgICAgIHRvcGljQ3RybC50b3BpY3MuZ2V0VG9waWNCeUtleSh0b3BpYy5rZXkoKSkudXBkYXRlKHtcInNsdWdcIjpzbHVnVGV4dCt0b3BpYy5rZXkoKX0pO1xuXG4gICAgICAgICAgLy9TdGF0IHVwZGF0ZVxuICAgICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L3Bvc3RlZC9jb3VudCcpXG4gICAgICAgICAgICAuc2V0KHRvcGljQ3RybC5wcm9maWxlLnN0YXQucG9zdGVkLmNvdW50ICsgMSk7XG5cbiAgICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9wb3N0ZWQvdG9waWNzLycrdG9waWMua2V5KCkpXG4gICAgICAgICAgICAucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcblxuICAgICAgICAgIC8vSWYgdGhlcmUgaXMgbG9jYXRpb25cbiAgICAgICAgICBpZihsb2NhdGlvbkRldGFpbCAhPT0gJycpe1xuXG4gICAgICAgICAgICB0b3BpY0N0cmwucGxhY2VzLmFkZENoaWxkKGxvY2F0aW9uRGV0YWlsLnBsYWNlX2lkKVxuICAgICAgICAgICAgICAgICAgICAgIC5jaGlsZCh0b3BpYy5rZXkoKSlcbiAgICAgICAgICAgICAgICAgICAgICAucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcblxuICAgICAgICAgICAgdG9waWNDdHJsLnBsYWNlcy5hZGRDaGlsZChsb2NhdGlvbkRldGFpbC5wbGFjZV9pZClcbiAgICAgICAgICAgICAgLmNoaWxkKCdpbmZvJykuc2V0KGxvY2F0aW9uRGV0YWlsKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL2lmIHRoZXJlIGFyZSB0YWdzXG4gICAgICAgICAgaWYodG9waWNDdHJsLm5ld1RvcGljLnRhZ3MgIT09IG51bGwpe1xuICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHRvcGljQ3RybC5uZXdUb3BpYy50YWdzLmxlbmd0aDsgKytpbmRleCkge1xuICAgICAgICAgICAgICB0b3BpY0N0cmwudGFncy5hZGRDaGlsZCh0b3BpY0N0cmwubmV3VG9waWMudGFnc1tpbmRleF0udGV4dClcbiAgICAgICAgICAgICAgICAuY2hpbGQodG9waWMua2V5KCkpLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy9Ob3RpZnkgZm9sbG93ZXJcbiAgICAgICAgICB0b3BpY0N0cmwubm90aS5ub3RpZnlGb2xsb3dlcih0b3BpYy5rZXkoKSx0b3BpY0N0cmwudWlkKTtcblxuXG4gICAgICAgICAgLy9SZXNldCBmb3JtIGhlcmVcbiAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMgPSB7XG4gICAgICAgICAgICBib2R5OiAnJ1xuICAgICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9O1xuXG5cbiAgICAvL0NoZWNrIGlmIHVzZXIgaXMgYWxyZWFkeSBmb2xsb3dpbmcgdXNlclxuICAgIHRvcGljQ3RybC5jaGVja0ZvbGxvdyA9IGZ1bmN0aW9uKGZvbGxvd191aWQpe1xuICAgICAgaWYodG9waWNDdHJsLnVzZXJzLmNoZWNrRm9sbG93KHRvcGljQ3RybC51aWQsZm9sbG93X3VpZCkpe1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICAvL0ZvbGxvdyBVc2VyXG4gICAgdG9waWNDdHJsLmZvbGxvd1VzZXIgPSBmdW5jdGlvbihmb2xsb3dfdWlkKXtcblxuICAgICAgLy9VcGRhdGUgdGhlIHBlcnNvbiB0aGF0IGJlaW5nIGZvbGxvdywgY3JlZGl0IHRoZW0gZm9yIGhhdmluZyBmb2xsb3dlclxuICAgICAgdG9waWNDdHJsLnVzZXJzLmdldFByb2ZpbGUoZm9sbG93X3VpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZihmb2xsb3dfdWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dlci9jb3VudCcpXG4gICAgICAgICAgLnNldChkYXRhLnN0YXQuZm9sbG93ZXIuY291bnQgKyAxKTtcblxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZihmb2xsb3dfdWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dlci91aWQvJysgdG9waWNDdHJsLnVpZClcbiAgICAgICAgICAucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcbiAgICAgIH0pO1xuXG4gICAgICAvL1VwZGF0ZSB0aGUgcGVyc29uIHRoYXQgaXMgZm9sbG93aW5nLCBjcmVkaXQgdGhlbSBmb3IgaGF2aW5nIGZvbGxvd2luZ1xuICAgICAgdG9waWNDdHJsLnVzZXJzLmdldFByb2ZpbGUodG9waWNDdHJsLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dpbmcvY291bnQnKVxuICAgICAgICAgIC5zZXQoZGF0YS5zdGF0LmZvbGxvd2VyLmNvdW50ICsgMSk7XG5cbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvZm9sbG93aW5nL3VpZC8nKyBmb2xsb3dfdWlkKVxuICAgICAgICAgIC5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvL1VuZm9sbG93IFVzZXJcbiAgICB0b3BpY0N0cmwudW5mb2xsb3dVc2VyID0gZnVuY3Rpb24oZm9sbG93X3VpZCl7XG5cbiAgICAgIC8vVXBkYXRlIHRoZSBwZXJzb24gdGhhdCBiZWluZyBmb2xsb3csIGNyZWRpdCB0aGVtIGZvciBoYXZpbmcgZm9sbG93ZXJcbiAgICAgIHRvcGljQ3RybC51c2Vycy5nZXRQcm9maWxlKGZvbGxvd191aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYoZm9sbG93X3VpZCkuY2hpbGQoJ3N0YXQvZm9sbG93ZXIvY291bnQnKVxuICAgICAgICAgIC5zZXQoZGF0YS5zdGF0LmZvbGxvd2VyLmNvdW50IC0gMSk7XG5cbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYoZm9sbG93X3VpZCkuY2hpbGQoJ3N0YXQvZm9sbG93ZXIvdWlkLycrIHRvcGljQ3RybC51aWQpLnJlbW92ZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vVXBkYXRlIHRoZSBwZXJzb24gdGhhdCBpcyBmb2xsb3dpbmcsIGNyZWRpdCB0aGVtIGZvciBoYXZpbmcgZm9sbG93aW5nXG4gICAgICB0b3BpY0N0cmwudXNlcnMuZ2V0UHJvZmlsZSh0b3BpY0N0cmwudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2luZy9jb3VudCcpXG4gICAgICAgICAgLnNldChkYXRhLnN0YXQuZm9sbG93aW5nLmNvdW50IC0gMSk7XG5cbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvZm9sbG93aW5nL3VpZC8nKyBmb2xsb3dfdWlkKS5yZW1vdmUoKTtcbiAgICAgIH0pO1xuXG4gICAgfVxuXG5cblxuICAgICAvL3Vwdm90ZVxuICAgIHRvcGljQ3RybC51cHZvdGUgPSBmdW5jdGlvbih0b3BpYyl7XG5cbiAgICAgIGlmKHRvcGljLmRvd252b3RlcyAhPSB1bmRlZmluZWQgJiYgdG9waWMuZG93bnZvdGVzW3RvcGljQ3RybC51aWRdICE9IHVuZGVmaW5lZCl7XG4gICAgICAgIHRvcGljQ3RybC5jYW5jZWxEb3dudm90ZSh0b3BpYyk7XG4gICAgICB9XG4gICAgICB0b3BpY0N0cmwudG9waWNzLnVwdm90ZVRvcGljKHRvcGljLiRpZCwgdG9waWNDdHJsLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICB0b3BpY0N0cmwudXNlclVwdm90ZWRUb3BpY3MuY2hpbGQodG9waWMuJGlkKS5zZXQodmFsdWUuJHZhbHVlKTtcblxuICAgICAgICAvL1N0YXQgdXBkYXRlXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy5nZXRQcm9maWxlKHRvcGljLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpYy51aWQpLmNoaWxkKCdzdGF0L3Vwdm90ZWQvY291bnQnKVxuICAgICAgICAgIC5zZXQoZGF0YS5zdGF0LnVwdm90ZWQuY291bnQgKyAxKTtcbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWMudWlkKS5jaGlsZCgnc3RhdC91cHZvdGVkL3RvcGljcy8nK3RvcGljLiRpZClcbiAgICAgICAgICAucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0b3BpY0N0cmwuY2FuY2VsVXB2b3RlID0gZnVuY3Rpb24odG9waWMpe1xuICAgICAgdG9waWNDdHJsLnRvcGljcy51bmRvVXB2b3RlKHRvcGljLiRpZCwgdG9waWNDdHJsLnVpZCk7XG5cbiAgICAgIHRvcGljQ3RybC51c2Vycy5nZXRQcm9maWxlKHRvcGljLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICAvL1N0YXQgdXBkYXRlXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljLnVpZCkuY2hpbGQoJ3N0YXQvdXB2b3RlZC9jb3VudCcpXG4gICAgICAgICAgLnNldChkYXRhLnN0YXQudXB2b3RlZC5jb3VudCAtIDEpO1xuXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljLnVpZCkuY2hpbGQoJ3N0YXQvdXB2b3RlZC90b3BpY3MvJyt0b3BpYy4kaWQpLnJlbW92ZSgpO1xuICAgICAgfSk7XG5cblxuICAgICAgdG9waWNDdHJsLnVzZXJVcHZvdGVkVG9waWNzLmNoaWxkKHRvcGljLiRpZCkucmVtb3ZlKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjpcIiwgZXJyb3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlbW92ZWQgc3VjY2Vzc2Z1bGx5IVwiKTtcbiAgICAgICAgICB9fSk7XG4gICAgfTtcblxuICAgIC8vZG93bnZvdGVcbiAgICB0b3BpY0N0cmwuZG93bnZvdGUgPSBmdW5jdGlvbih0b3BpYyl7XG4gICAgICBpZih0b3BpYy51cHZvdGVzICE9IHVuZGVmaW5lZCAmJiB0b3BpYy51cHZvdGVzW3RvcGljQ3RybC51aWRdICE9IHVuZGVmaW5lZCl7XG4gICAgICAgIHRvcGljQ3RybC5jYW5jZWxVcHZvdGUodG9waWMpO1xuICAgICAgfVxuICAgICAgdG9waWNDdHJsLnRvcGljcy5kb3dudm90ZVRvcGljKHRvcGljLiRpZCwgdG9waWNDdHJsLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICB0b3BpY0N0cmwudXNlckRvd252b3RlZFRvcGljcy5jaGlsZCh0b3BpYy4kaWQpLnNldCh2YWx1ZS4kdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRvcGljQ3RybC5jYW5jZWxEb3dudm90ZSA9IGZ1bmN0aW9uKHRvcGljKXtcbiAgICAgIHRvcGljQ3RybC50b3BpY3MudW5kb0Rvd252b3RlKHRvcGljLiRpZCwgdG9waWNDdHJsLnVpZCk7XG4gICAgICB0b3BpY0N0cmwudXNlckRvd252b3RlZFRvcGljcy5jaGlsZCh0b3BpYy4kaWQpLnJlbW92ZShmdW5jdGlvbihlcnJvcil7XG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6XCIsIGVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZW1vdmVkIHN1Y2Nlc3NmdWxseSFcIik7XG4gICAgICAgICAgfX0pO1xuICAgIH07XG5cbiAgICAvL2ZvbGxvdyB0b3BpY1xuICAgIHRvcGljQ3RybC5mb2xsb3dUb3BpYyA9IGZ1bmN0aW9uKHRvcGljKXtcbiAgICAgIHRvcGljQ3RybC50b3BpY3MuZm9sbG93KHRvcGljLiRpZCwgdG9waWNDdHJsLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICB0b3BpY0N0cmwudXNlckZvbGxvd2luZy5jaGlsZCh0b3BpYy4kaWQpLnNldCh2YWx1ZS5oaXN0b3J5W3RvcGljQ3RybC51aWRdKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0b3BpY0N0cmwudW5mb2xsb3dUb3BpYyA9IGZ1bmN0aW9uKHRvcGljKXtcbiAgICAgIHRvcGljQ3RybC50b3BpY3MudW5mb2xsb3codG9waWMuJGlkLCB0b3BpY0N0cmwudWlkKTtcbiAgICAgIHRvcGljQ3RybC51c2VyRm9sbG93aW5nLmNoaWxkKHRvcGljLiRpZCkucmVtb3ZlKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjpcIiwgZXJyb3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlbW92ZWQgc3VjY2Vzc2Z1bGx5IVwiKTtcbiAgICAgICAgICB9fSk7XG4gICAgfTtcblxuICB9KTtcblxuXG4vL2h0dHBzOi8vZ2lzdC5naXRodWIuY29tL2thdG93dWxmLzYwOTkwNDJcbmZ1bmN0aW9uIG1vdmVGYlJlY29yZChvbGRSZWYsIG5ld1JlZikge1xuICBvbGRSZWYub25jZSgndmFsdWUnLCBmdW5jdGlvbiAoc25hcCkge1xuICAgIG5ld1JlZi5zZXQoc25hcC52YWwoKSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICBpZiAoIWVycm9yKSB7XG4gICAgICAgIG9sZFJlZi5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHR5cGVvZihjb25zb2xlKSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZS5lcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLy8gVG9waWMgbGlzdFxuICAuZmFjdG9yeSgnVG9waWNzJywgZnVuY3Rpb24gKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXksIEZpcmViYXNlVXJsKSB7XG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCArICd0b3BpY3MnKVxuICAgIHZhciB0b3BpY3MgPSAkZmlyZWJhc2VPYmplY3QocmVmKVxuICAgIHZhciB0b3BpY3NBcnIgPSAkZmlyZWJhc2VBcnJheShyZWYpXG4gICAgdmFyIHRvcGljS2V5ID0gJydcblxuICAgIHZhciBUb3BpY3MgPSB7XG4gICAgICAvLyBHZXQgdG9waWMgdGFnXG4gICAgICBnZXRUYWc6IGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5vcmRlckJ5Q2hpbGQoJ3RhZ3MnKS5lcXVhbFRvKHRhZykpXG4gICAgICB9LFxuXG4gICAgICAvLyBHZXQgdG9waWMgc2x1Z1xuICAgICAgZ2V0U2x1ZzogZnVuY3Rpb24gKHNsdWcpIHtcbiAgICAgICAgdmFyIGRhdGEgPSByZWYub3JkZXJCeUNoaWxkKCdzbHVnJykuZXF1YWxUbyhzbHVnKVxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkoZGF0YSlcbiAgICAgIH0sXG5cbiAgICAgIC8vIEdldHRpbmcgdGhlIGxpc3Qgb2YgdG9waWNzIGNyZWF0ZWQgYnkgdXNlcl9pZFxuICAgICAgY3JlYXRlZEJ5OiBmdW5jdGlvbiAodWlkKSB7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYub3JkZXJCeUNoaWxkKCd1aWQnKS5lcXVhbFRvKHVpZCkpXG5cbiAgICAgIH0sXG4gICAgICByZWZDaGlsZDogZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgIHJldHVybiByZWYuY2hpbGQoY2hpbGQpXG4gICAgICB9LFxuICAgICAgY291bnRVc2VyVG9waWNzOiBmdW5jdGlvbiAoKSB7fSxcblxuICAgICAgLy8gR2V0dGluZyB0aGUgbGlzdCBvZiB0b3BpYyBiYXNlIG9uIGNhdGVnb3J5XG4gICAgICBsaXN0OiBmdW5jdGlvbiAoY2F0ZWdvcnkpIHtcbiAgICAgICAgdmFyIGRhdGEgPSByZWYub3JkZXJCeUNoaWxkKCdjYXRlZ29yeScpLmVxdWFsVG8oY2F0ZWdvcnkpXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShkYXRhKVxuICAgICAgfSxcblxuICAgICAgbmFtZTogZnVuY3Rpb24gKHRvcGljX3NsdWcpIHtcbiAgICAgICAgdmFyIGRhdGEgPSByZWYub3JkZXJCeUNoaWxkKCdzbHVnJykuZXF1YWxUbyh0b3BpY19zbHVnKVxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KGRhdGEpXG4gICAgICB9LFxuXG4gICAgICAvLyBSZXR1cm4gdG9waWMgZGV0YWlscyBpbiBSZWZcbiAgICAgIGZvcnRvcGljUmVmOiBmdW5jdGlvbiAodG9waWNfc2x1Zykge1xuICAgICAgICByZXR1cm4gcmVmLm9yZGVyQnlDaGlsZCgnc2x1ZycpLmVxdWFsVG8odG9waWNfc2x1ZylcbiAgICAgIH0sXG5cbiAgICAgIGdldFRvcGljQnlLZXk6IGZ1bmN0aW9uICh0b3BpY19rZXkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCArICd0b3BpY3MvJyArIHRvcGljX2tleSlcbiAgICAgIH0sXG5cbiAgICAgIGdldFRvcGljQnlTbHVnOiBmdW5jdGlvbiAodG9waWNfc2x1Zykge1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLm9yZGVyQnlDaGlsZCgnc2x1ZycpLmVxdWFsVG8odG9waWNfc2x1ZykubGltaXRUb0ZpcnN0KDEpKVxuICAgICAgfSxcblxuICAgICAgaW5jcmVtZW50VmlldzogZnVuY3Rpb24gKHRvcGljX3NsdWcpIHt9LFxuXG4gICAgICAvLyBSZXR1cm4gdG9waWMgZGV0YWlscyBpbiBhcnJheVxuICAgICAgZm9ydG9waWM6IGZ1bmN0aW9uICh0b3BpY19zbHVnKSB7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShUb3BpY3MuZm9ydG9waWNSZWYodG9waWNfc2x1ZykpXG4gICAgICB9LFxuXG4gICAgICAvLyBSZXBseSBsaXN0aW5nXG4gICAgICByZXBseUxpc3Q6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XG4gICAgICAgIHZhciBkYXRhID0gcmVmLmNoaWxkKHRvcGljSWQgKyAnL3JlcGxpZXMnKVxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkoZGF0YSlcbiAgICAgIH0sXG5cbiAgICAgIC8vIFJlcGx5IEFycmF5XG4gICAgICByZXBseUFycjogZnVuY3Rpb24gKHRvcGljSWQpIHtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9yZXBsaWVzJykpXG4gICAgICB9LFxuXG4gICAgICAvLyBSZXBseSBjb3VudFxuICAgICAgcmVwbHlDb3VudDogZnVuY3Rpb24gKHRvcGljSWQpIHtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQodG9waWNJZCArICcvcmVwbGllcy8nKSlcbiAgICAgIH0sXG4gICAgICByZXBseUNvdW50UmVmOiBmdW5jdGlvbiAodG9waWNJZCkge1xuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKHRvcGljSWQgKyAnL3JlcGxpZXMvY291bnQnKVxuICAgICAgfSxcblxuICAgICAgcmVwbHlJblJlcGx5OiBmdW5jdGlvbiAodG9waWNJZCwgcmVwbHlJZCkge1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKHRvcGljSWQgKyAnL3JlcGxpZXMvJyArIHJlcGx5SWQgKyAnL2luUmVwbHknKSlcbiAgICAgIH0sXG5cbiAgICAgIC8vIFJlcGx5IGluIFJlcGx5IEFycmF5XG4gICAgICByZXBseUluUmVwbHlBcnI6IGZ1bmN0aW9uICh0b3BpY0lkLCByZXBseUlkKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9yZXBsaWVzLycrcmVwbHlJZCsnL2luUmVwbHknKSkpXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQodG9waWNJZCArICcvcmVwbGllcy8nICsgcmVwbHlJZCArICcvaW5SZXBseScpKVxuICAgICAgfSxcblxuICAgICAgLy8gdXB2b3Rlc1xuICAgICAgZ2V0VXB2b3RlczogZnVuY3Rpb24gKHRvcGljSWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZWY6IHJlZi5jaGlsZCh0b3BpY0lkICsgJy91cHZvdGVzJyksXG4gICAgICAgICAgYXJyYXk6ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCh0b3BpY0lkICsgJy91cHZvdGVzJykpXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIGRvd252b3Rlc1xuICAgICAgZ2V0RG93bnZvdGVzOiBmdW5jdGlvbiAodG9waWNJZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlZjogcmVmLmNoaWxkKHRvcGljSWQgKyAnL2Rvd252b3RlcycpLFxuICAgICAgICAgIGFycmF5OiAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQodG9waWNJZCArICcvZG93bnZvdGVzJykpXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIGZvbGxvd2Vyc1xuICAgICAgZ2V0Rm9sbG93ZXJzOiBmdW5jdGlvbiAodG9waWNJZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlZjogcmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLFxuICAgICAgICAgIG9iajogJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKSlcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgdXB2b3RlVG9waWM6IGZ1bmN0aW9uICh0b3BpY0lkLCB1aWQpIHtcbiAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL3Vwdm90ZXMnKS5jaGlsZCh1aWQpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKVxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkICsgJy91cHZvdGVzJykuY2hpbGQodWlkKSlcbiAgICAgIH0sXG5cbiAgICAgIHVuZG9VcHZvdGU6IGZ1bmN0aW9uICh0b3BpY0lkLCB1aWQpIHtcbiAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL3Vwdm90ZXMnKS5jaGlsZCh1aWQpLnJlbW92ZShmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvcjonLCBlcnJvcilcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlbW92ZWQgc3VjY2Vzc2Z1bGx5IScpXG4gICAgICAgICAgfX0pXG4gICAgICAgIHJldHVybiByZWYuY2hpbGQodG9waWNJZCArICcvdXB2b3RlcycpXG4gICAgICB9LFxuXG4gICAgICBkb3dudm90ZVRvcGljOiBmdW5jdGlvbiAodG9waWNJZCwgdWlkKSB7XG4gICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9kb3dudm90ZXMnKS5jaGlsZCh1aWQpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKVxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9kb3dudm90ZXMnKS5jaGlsZCh1aWQpKVxuICAgICAgfSxcblxuICAgICAgdW5kb0Rvd252b3RlOiBmdW5jdGlvbiAodG9waWNJZCwgdWlkKSB7XG4gICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9kb3dudm90ZXMnKS5jaGlsZCh1aWQpLnJlbW92ZShmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvcjonLCBlcnJvcilcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlbW92ZWQgc3VjY2Vzc2Z1bGx5IScpXG4gICAgICAgICAgfX0pXG4gICAgICAgIHJldHVybiByZWYuY2hpbGQodG9waWNJZCArICcvZG93bnZvdGVzJylcbiAgICAgIH0sXG5cbiAgICAgIGZvbGxvdzogZnVuY3Rpb24gKHRvcGljSWQsIHVpZCkge1xuICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykuY2hpbGQoJ2hpc3RvcnknKS5jaGlsZCh1aWQpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKVxuICAgICAgICAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLmNoaWxkKCdjb3VudCcpKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIGlmIChkYXRhLnZhbHVlID09PSBudWxsIHx8IGRhdGEudmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLmNoaWxkKCdjb3VudCcpLnNldCgxKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykuY2hpbGQoJ2NvdW50Jykuc2V0KGRhdGEuJHZhbHVlICsgMSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykpXG4gICAgICB9LFxuXG4gICAgICB1bmZvbGxvdzogZnVuY3Rpb24gKHRvcGljSWQsIHVpZCkge1xuICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykuY2hpbGQoJ2hpc3RvcnknKS5jaGlsZCh1aWQpLnJlbW92ZShmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvcjonLCBlcnJvcilcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlbW92ZWQgc3VjY2Vzc2Z1bGx5IScpXG4gICAgICAgICAgICAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLmNoaWxkKCdjb3VudCcpKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykuY2hpbGQoJ2NvdW50Jykuc2V0KGRhdGEuJHZhbHVlIC0gMSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfX0pXG4gICAgICAgIHJldHVybiByZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJylcbiAgICAgIH0sXG5cbiAgICAgIGdldFZpZXdzOiBmdW5jdGlvbiAodG9waWNJZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlZjogcmVmLmNoaWxkKHRvcGljSWQpLmNoaWxkKCd2aWV3cycpLFxuICAgICAgICAgIG9iajogJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkKS5jaGlsZCgndmlld3MnKSlcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgbGF0ZXN0RmVlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLm9yZGVyQnlDaGlsZCgnY3JlYXRlZCcpLmxpbWl0VG9MYXN0KDEwKSlcbiAgICAgIH0sXG5cbiAgICAgIHRvcGljc0J5VGFnOiBmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYub3JkZXJCeUNoaWxkKCd0YWdzJykuZXF1YWxUbyh0YWcpKVxuICAgICAgfSxcblxuICAgICAgLy8gUmV0dXJuIGFycmF5XG4gICAgICBhcnI6ICRmaXJlYmFzZUFycmF5KHJlZiksXG5cbiAgICAgIGFsbDogdG9waWNzLFxuICAgICAgcmVmOiByZWZcbiAgICB9O1xuXG4gICAgcmV0dXJuIFRvcGljc1xuXG4gIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5jb250cm9sbGVyKCdQcm9maWxlQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJHN0YXRlLCAkZmlsdGVyLCBtZDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vU2VydmljZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQXV0aCxVc2VycyxUb3BpY3MsIEZhY2Vib29rLG5vdGlmeSxDYXRlU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9SZXNvbHZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGUsaXNPd25lcix1c2VyUG9zdHMpe1xuXG4gICAgY29uc29sZS5sb2coXCJQcm9maWxlQ3RybFwiKTtcblxuICAgIHZhciBwcm9maWxlQ3RybCA9IHRoaXM7XG5cbiAgICAvL1BhcnNlclxuICAgIHByb2ZpbGVDdHJsLnByb2ZpbGUgICA9IHByb2ZpbGU7XG4gICAgcHJvZmlsZUN0cmwuYXV0aCAgICAgID0gQXV0aDtcbiAgICBwcm9maWxlQ3RybC51c2VycyAgICAgPSBVc2VycztcbiAgICBwcm9maWxlQ3RybC50b3BpY3MgICAgPSBUb3BpY3M7XG4gICAgcHJvZmlsZUN0cmwuZmFjZWJvb2sgID0gRmFjZWJvb2s7XG4gICAgcHJvZmlsZUN0cmwuaXNPd25lciAgID0gaXNPd25lcjtcbiAgICBwcm9maWxlQ3RybC5jYXRlICAgICAgPSBDYXRlU2VydmljZTtcbiAgICBwcm9maWxlQ3RybC4kc3RhdGUgICAgPSAkc3RhdGU7XG4gICAgcHJvZmlsZUN0cmwudXNlclBvc3RzID0gdXNlclBvc3RzO1xuXG4gICAgcHJvZmlsZUN0cmwudXNlckZlZWQgID0gJyc7XG4gICAgcHJvZmlsZUN0cmwuZmVlZCA9ICcnO1xuXG4gICAgcHJvZmlsZUN0cmwuZWRpdEluaXQgPSAndXNlckVkaXQnO1xuXG4gICAgcHJvZmlsZUN0cmwubmFtZUV4aXN0PSBmYWxzZTtcblxuXG4gICAgcHJvZmlsZUN0cmwuZ2V0VXNlclBvc3QgPSBmdW5jdGlvbih1aWQpe1xuICAgICAgcHJvZmlsZUN0cmwuZmVlZCA9IHByb2ZpbGVDdHJsLnRvcGljcy5jcmVhdGVkQnkodWlkKTtcbiAgICB9XG5cblxuXG4gICAgLypMaW5rIGFjY291bnQgd2l0aCBmYWNlYm9vayovXG4gICAgcHJvZmlsZUN0cmwubGlua0ZhY2Vib29rID0gZnVuY3Rpb24oKXtcbiAgICAgIHByb2ZpbGVDdHJsLmZhY2Vib29rLmxvZ2luKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIHByb2ZpbGVDdHJsLmZhY2Vib29rLmdldExvZ2luU3RhdHVzKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT09ICdjb25uZWN0ZWQnKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuICAgICAgICAgICAgcHJvZmlsZUN0cmwuZmFjZWJvb2suYXBpKCcvbWUnLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBsb2dnZWQgaW5cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy9UaGUgb3JpZ2luYWwgdmFsdWUgZnJvbSBwcm9maWxlXG4gICAgcHJvZmlsZUN0cmwub2xkUHJvZmlsZVZhbHVlID0gcHJvZmlsZUN0cmwucHJvZmlsZTtcblxuXG4gICAgcHJvZmlsZUN0cmwudXNlckNyZWF0ZWQgPSBmdW5jdGlvbih1aWQpe1xuICAgICAgcmV0dXJuIHByb2ZpbGVDdHJsLnRvcGljcy5jcmVhdGVkQnkodWlkKTtcbiAgICB9XG5cblxuICAgIC8vUHJlc2V0IFBhcmFtZXRlcnNcbiAgICBwcm9maWxlQ3RybC5pbWFnZVN0cmluZ3MgICAgPSBbXTtcbiAgICBwcm9maWxlQ3RybC51c2VyQ2F0ZUZvbGxvdyAgPSBbXTtcbiAgICBwcm9maWxlQ3RybC5jYXRlSXNGb2xsb3cgICAgPSBbXTtcbiAgICBwcm9maWxlQ3RybC5mb2xsb3dMaXN0ICAgICAgPSAnJztcblxuXG5cblxuXG4gICAgcHJvZmlsZUN0cmwuZm9sbG93Q2F0ZUxpc3RBcnIgPSBmdW5jdGlvbih1aWQpe1xuICAgICAgcHJvZmlsZUN0cmwuZm9sbG93TGlzdCA9IHByb2ZpbGVDdHJsLmNhdGUuZm9sbG93TGlzdCh1aWQpO1xuICAgIH1cblxuICAgIGlmKEF1dGgucmVmLmdldEF1dGgoKSl7XG4gICAgICBwcm9maWxlQ3RybC5mb2xsb3dDYXRlTGlzdEFycihBdXRoLnJlZi5nZXRBdXRoKCkudWlkKTtcbiAgICB9XG5cbiAgICBwcm9maWxlQ3RybC5mb2xsb3dDYXRlID0gZnVuY3Rpb24oaW5kZXgsY2F0ZV9zbHVnKXtcbiAgICAgIHByb2ZpbGVDdHJsLmNhdGVJc0ZvbGxvd1tpbmRleF0gID0gdHJ1ZTtcbiAgICAgIHByb2ZpbGVDdHJsLmNhdGUuYWRkQ2hpbGQoY2F0ZV9zbHVnKycvZm9sbG93ZXInKVxuICAgICAgICAuY2hpbGQoQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCkucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcbiAgICB9XG5cblxuXG5cblxuICAgIC8vVXBsb2FkIFByb2ZpbGUgaW1hZ2VcbiAgICBwcm9maWxlQ3RybC51cGxvYWRGaWxlID0gZnVuY3Rpb24oZmlsZXMpIHtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChmaWxlcywgZnVuY3Rpb24gKGZsb3dGaWxlLCBpKSB7XG4gICAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICB2YXIgdXJpID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICBwcm9maWxlQ3RybC5pbWFnZVN0cmluZ3NbaV0gPSB1cmk7XG4gICAgICAgICAgcHJvZmlsZUN0cmwudXNlcnMudXNlckFyclJlZihBdXRoLnJlZi5nZXRBdXRoKCkudWlkKS51cGRhdGUoe1wicGhvdG9cIjogdXJpfSlcbiAgICAgICAgICBub3RpZnkoe21lc3NhZ2U6J1NhdmVkJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgZmlsZVJlYWRlci5yZWFkQXNEYXRhVVJMKGZsb3dGaWxlLmZpbGUpO1xuICAgICAgfSlcbiAgICB9O1xuXG5cbiAgICAvL1NhdmUgcHJvZmlsZSB3aXRoIHByb2ZpbGVDdHJsLnByb2ZpbGVcbiAgICAvL3BhcmFtczogcmVkaXJlY3QsIGlmIGV4aXN0IHRoZW4gcmVkaXJlY3QgYWZ0ZXIgc2F2ZVxuICAgIHByb2ZpbGVDdHJsLnNhdmVQcm9maWxlID0gZnVuY3Rpb24ocmVkaXJlY3Qpe1xuICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS51cGRhdGVkID0gbW9tZW50KCkudG9JU09TdHJpbmcoKTtcblxuXG4gICAgICBpZihwcm9maWxlQ3RybC5sb2NhdGlvbiAhPT0gbnVsbCApIHtcbiAgICAgICAgbG9jYXRpb25EZXRhaWwgPSB7XG4gICAgICAgICAgcGxhY2VfaWQ6IHByb2ZpbGVDdHJsLmxvY2F0aW9uLmRldGFpbHMucGxhY2VfaWQsXG4gICAgICAgICAgbmFtZTogcHJvZmlsZUN0cmwubG9jYXRpb24uZGV0YWlscy5uYW1lLFxuICAgICAgICAgIGFkZHJlc3M6IHByb2ZpbGVDdHJsLmxvY2F0aW9uLmRldGFpbHMuZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgbGF0OiBwcm9maWxlQ3RybC5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxhdCgpLFxuICAgICAgICAgIGxuZzogcHJvZmlsZUN0cmwubG9jYXRpb24uZGV0YWlscy5nZW9tZXRyeS5sb2NhdGlvbi5sbmcoKSxcbiAgICAgICAgfVxuXG4gICAgICAgIHByb2ZpbGVDdHJsLnByb2ZpbGUudXNlckxvY2F0aW9uID0gbG9jYXRpb25EZXRhaWw7XG4gICAgICB9XG5cbiAgICAgIHByb2ZpbGVDdHJsLnByb2ZpbGUuJHNhdmUoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBub3RpZnkoe21lc3NhZ2U6J1NhdmVkJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICAgICAgaWYocmVkaXJlY3QgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgJHN0YXRlLmdvKHJlZGlyZWN0KTtcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgbm90aWZ5KHttZXNzYWdlOidFcnJvciBzYXZpbmcgZGF0YScscG9zaXRpb246J2NlbnRlcicsZHVyYXRpb246IDMwMDAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vVXBkYXRlIG5hbWVcbiAgICBwcm9maWxlQ3RybC51cGRhdGVOYW1lID0gZnVuY3Rpb24oKXtcblxuICAgICAgcHJvZmlsZUN0cmwudXNlcnMudXNlckFyclJlZihBdXRoLnJlZi5nZXRBdXRoKCkudWlkKS51cGRhdGUoXG4gICAgICAgIHtcbiAgICAgICAgICBcImZpcnN0bmFtZVwiOiAgcHJvZmlsZUN0cmwucHJvZmlsZS5maXJzdG5hbWUsXG4gICAgICAgICAgXCJsYXN0bmFtZVwiOiAgIHByb2ZpbGVDdHJsLnByb2ZpbGUubGFzdG5hbWUsXG4gICAgICAgIH1cbiAgICAgIClcblxuICAgICAgcHJvZmlsZUN0cmwudXNlcnMudXNlckFyclJlZihBdXRoLnJlZi5nZXRBdXRoKCkudWlkKycvbG9nJykucHVzaCgpLnNldCh7XG4gICAgICAgIGFjdGlvbjogICBcIm5hbWVfY2hhbmdlXCIsXG4gICAgICAgIG9sZG5hbWU6ICBwcm9maWxlQ3RybC5vbGRQcm9maWxlVmFsdWUuZmlyc3RuYW1lICsgXCItXCIgKyBwcm9maWxlQ3RybC5vbGRQcm9maWxlVmFsdWUubGFzdG5hbWUsXG4gICAgICAgIGNyZWF0ZWQ6ICBtb21lbnQoKS50b0lTT1N0cmluZygpXG4gICAgICB9KTtcblxuICAgICAgbm90aWZ5KHttZXNzYWdlOidTYXZlZCcscG9zaXRpb246J2NlbnRlcicsZHVyYXRpb246IDMwMDAgfSk7XG4gICAgfVxuXG5cbiAgICAvL1VwZGF0ZSBCaW9cbiAgICBwcm9maWxlQ3RybC51cGRhdGVCaW8gPSBmdW5jdGlvbigpe1xuICAgICAgcHJvZmlsZUN0cmwudXNlcnMudXNlckFyclJlZihBdXRoLnJlZi5nZXRBdXRoKCkudWlkKS51cGRhdGUoe1wiYmlvZ3JhcGh5XCI6IHByb2ZpbGVDdHJsLnByb2ZpbGUuYmlvZ3JhcGh5fSlcblxuICAgICAgbm90aWZ5KHttZXNzYWdlOidTYXZlZCcscG9zaXRpb246J2NlbnRlcicsZHVyYXRpb246IDMwMDAgfSk7XG4gICAgfVxuXG5cbiAgICBwcm9maWxlQ3RybC51cGRhdGVQcm9maWxlID0gZnVuY3Rpb24oKXtcbiAgICAgIC8vcHJvZmlsZUN0cmwucHJvZmlsZS5lbWFpbEhhc2ggPSBtZDUuY3JlYXRlSGFzaChhdXRoLnBhc3N3b3JkLmVtYWlsKTtcbiAgICAgIHByb2ZpbGVDdHJsLnByb2ZpbGUuJHNhdmUoKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkJyk7XG4gICAgICB9KTtcbiAgICB9O1xuXG5cbiAgICAvL0NoZWNrIGlmIHVzZXIgZXhpc3QsIHJldHVybiBmYWxzZSBpZiB0aGV5IGRvXG4gICAgcHJvZmlsZUN0cmwuY2hlY2tVc2VybmFtZSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgIHByb2ZpbGVDdHJsLnVzZXJzLmNoZWNrVXNlcm5hbWVFeGlzdChwcm9maWxlQ3RybC5wcm9maWxlLmRpc3BsYXlOYW1lKS5vbmNlKCd2YWx1ZScsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgIGlmKHNuYXBzaG90LnZhbCgpICE9PSBudWxsKXtcbiAgICAgICAgICByZXR1cm4gcHJvZmlsZUN0cmwubmFtZUV4aXN0PXRydWU7XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICByZXR1cm4gcHJvZmlsZUN0cmwubmFtZUV4aXN0PWZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmZhY3RvcnkoJ1VzZXJzJywgZnVuY3Rpb24gKCRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIEZpcmViYXNlVXJsLCAkaHR0cCkge1xuICAgIHZhciB1c2Vyc1JlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCArICd1c2VycycpXG4gICAgdmFyIHVzZXJzID0gJGZpcmViYXNlQXJyYXkodXNlcnNSZWYpXG5cbiAgICB2YXIgVXNlcnMgPSB7XG4gICAgICBnZXRMb2NhdGlvbklQOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgICAgdXJsOiAnaHR0cDovL2lwaW5mby5pby9qc29uJyxcbiAgICAgICAgICBtZXRob2Q6ICdHRVQnXG4gICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICBnZXRMb2NhdGlvbklQRGF0YTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICAgIHVybDogJ2h0dHA6Ly9pcGluZm8uaW8vanNvbicsXG4gICAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIGRhdGEuZGF0YVxuICAgICAgICB9KVxuICAgICAgfSxcblxuICAgICAgcHJvZmlsZTogZnVuY3Rpb24odWlkKXtcbiAgICAgICAgcmV0dXJuIHVzZXJzLiRnZXRSZWNvcmQodWlkKTtcbiAgICAgIH0sXG5cblxuICAgICAgLy9TZWFyY2ggYW5kIHJldHVybiB1c2VybmFtZVxuICAgICAgZ2V0UHJvZmlsZUJ5VXNlcm5hbWU6ZnVuY3Rpb24odXNlcm5hbWUpe1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkodXNlcnNSZWYub3JkZXJCeUNoaWxkKCdkaXNwbGF5TmFtZScpLmVxdWFsVG8odXNlcm5hbWUpKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vQ2hlY2sgaWYgdXNlcm5hbWUgZXhpc3QsIGlmIG5vdCByZXR1cm4gbnVsbFxuICAgICAgY2hlY2tVc2VybmFtZUV4aXN0OmZ1bmN0aW9uKHVzZXJuYW1lKXtcbiAgICAgICAgcmV0dXJuIHVzZXJzUmVmLm9yZGVyQnlDaGlsZCgnZGlzcGxheU5hbWUnKS5lcXVhbFRvKHVzZXJuYW1lKTtcbiAgICAgIH0sXG5cblxuICAgICAgZ2V0UHJvZmlsZTogZnVuY3Rpb24gKHVpZCkge1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHVzZXJzUmVmLmNoaWxkKHVpZCkpXG4gICAgICB9LFxuXG4gICAgICBnZXREaXNwbGF5TmFtZTogZnVuY3Rpb24gKHVpZCkge1xuICAgICAgICBpZiAodWlkICE9PSBudWxsIHx8IHVpZCAhPT0gJycpIHtcbiAgICAgICAgICByZXR1cm4gdXNlcnMuJGdldFJlY29yZCh1aWQpLmRpc3BsYXlOYW1lO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvL0dldCB1c2VyIEZvbGxvd2Vyc1xuICAgICAgZ2V0Rm9sbG93ZXI6ZnVuY3Rpb24odWlkKXtcbiAgICAgICAgcmV0dXJuIHVzZXJzUmVmLmNoaWxkKHVpZCsnL3N0YXQvZm9sbG93ZXIvdWlkJyk7XG4gICAgICB9LFxuXG4gICAgICAvL0NoZWNrIGlmIHVzZXIgaXMgYWxyZWFkeSBmb2xsb3dpbmdcbiAgICAgIGNoZWNrRm9sbG93OmZ1bmN0aW9uKHVpZCxmb2xsb3dfaWQpe1xuXG4gICAgICAgIHZhciBmb2xsb3c9ZmFsc2U7XG4gICAgICAgIHZhciByZWYgICAgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ3VzZXJzLycrdWlkKycvc3RhdC9mb2xsb3dpbmcvdWlkLycrZm9sbG93X2lkKTtcbiAgICAgICAgcmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgIGZvbGxvdyA9IHNuYXBzaG90LmV4aXN0cygpO1xuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gZm9sbG93O1xuICAgICAgfSxcblxuICAgICAgLy9DaGFuZ2UgcGFzc3dvcmRcbiAgICAgIHVzZXJDaGFuZ2VQYXNzd29yZDpmdW5jdGlvbihlbWFpbCxvbGRwYXNzLG5ld3Bhc3Mpe1xuXG4gICAgICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwpO1xuICAgICAgICByZWYuY2hhbmdlUGFzc3dvcmQoe1xuICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICBvbGRQYXNzd29yZDogb2xkcGFzcyxcbiAgICAgICAgICBuZXdQYXNzd29yZDogbmV3cGFzc1xuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgc3dpdGNoIChlcnJvci5jb2RlKSB7XG4gICAgICAgICAgICAgIGNhc2UgXCJJTlZBTElEX1BBU1NXT1JEXCI6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGUgc3BlY2lmaWVkIHVzZXIgYWNjb3VudCBwYXNzd29yZCBpcyBpbmNvcnJlY3QuXCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIFwiSU5WQUxJRF9VU0VSXCI6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGUgc3BlY2lmaWVkIHVzZXIgYWNjb3VudCBkb2VzIG5vdCBleGlzdC5cIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBjaGFuZ2luZyBwYXNzd29yZDpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVzZXIgcGFzc3dvcmQgY2hhbmdlZCBzdWNjZXNzZnVsbHkhXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICB1c2VyUmVmOiBmdW5jdGlvbiAodWlkKSB7XG4gICAgICAgIHJldHVybiB1c2Vyc1JlZi5jaGlsZCh1aWQpXG4gICAgICB9LFxuXG4gICAgICB1cHZvdGVzOiBmdW5jdGlvbiAodWlkKSB7XG4gICAgICAgIHJldHVybiB1c2Vyc1JlZi5jaGlsZCh1aWQpLmNoaWxkKCd1cHZvdGVzJylcbiAgICAgIH0sXG5cbiAgICAgIGRvd252b3RlczogZnVuY3Rpb24gKHVpZCkge1xuICAgICAgICByZXR1cm4gdXNlcnNSZWYuY2hpbGQodWlkKS5jaGlsZCgnZG93bnZvdGVzJylcbiAgICAgIH0sXG5cbiAgICAgIC8vVXNlciBmb2xsb3dpbmcgdG9waWNcbiAgICAgIGZvbGxvd2luZzogZnVuY3Rpb24gKHVpZCkge1xuICAgICAgICByZXR1cm4gdXNlcnNSZWYuY2hpbGQodWlkKS5jaGlsZCgnZm9sbG93aW5nJylcbiAgICAgIH0sXG5cbiAgICAgIHVzZXJBcnJSZWY6IGZ1bmN0aW9uICh1aWQpIHtcbiAgICAgICAgcmV0dXJuIHVzZXJzUmVmLmNoaWxkKHVpZClcbiAgICAgIH0sXG5cbiAgICAgIGFsbDogdXNlcnNcbiAgICB9XG5cbiAgICByZXR1cm4gVXNlcnNcbiAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5mYWN0b3J5KCdVbmlxdWVJREdlbmVyYXRvcicsIGZ1bmN0aW9uKCl7ICBcclxuICAgIC8qKlxyXG4gICAgICogRmFuY3kgSUQgZ2VuZXJhdG9yIHRoYXQgY3JlYXRlcyAyMC1jaGFyYWN0ZXIgc3RyaW5nIGlkZW50aWZpZXJzIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG4gICAgICpcclxuICAgICAqIDEuIFRoZXkncmUgYmFzZWQgb24gdGltZXN0YW1wIHNvIHRoYXQgdGhleSBzb3J0ICphZnRlciogYW55IGV4aXN0aW5nIGlkcy5cclxuICAgICAqIDIuIFRoZXkgY29udGFpbiA3Mi1iaXRzIG9mIHJhbmRvbSBkYXRhIGFmdGVyIHRoZSB0aW1lc3RhbXAgc28gdGhhdCBJRHMgd29uJ3QgY29sbGlkZSB3aXRoIG90aGVyIGNsaWVudHMnIElEcy5cclxuICAgICAqIDMuIFRoZXkgc29ydCAqbGV4aWNvZ3JhcGhpY2FsbHkqIChzbyB0aGUgdGltZXN0YW1wIGlzIGNvbnZlcnRlZCB0byBjaGFyYWN0ZXJzIHRoYXQgd2lsbCBzb3J0IHByb3Blcmx5KS5cclxuICAgICAqIDQuIFRoZXkncmUgbW9ub3RvbmljYWxseSBpbmNyZWFzaW5nLiAgRXZlbiBpZiB5b3UgZ2VuZXJhdGUgbW9yZSB0aGFuIG9uZSBpbiB0aGUgc2FtZSB0aW1lc3RhbXAsIHRoZVxyXG4gICAgICogICAgbGF0dGVyIG9uZXMgd2lsbCBzb3J0IGFmdGVyIHRoZSBmb3JtZXIgb25lcy4gIFdlIGRvIHRoaXMgYnkgdXNpbmcgdGhlIHByZXZpb3VzIHJhbmRvbSBiaXRzXHJcbiAgICAgKiAgICBidXQgXCJpbmNyZW1lbnRpbmdcIiB0aGVtIGJ5IDEgKG9ubHkgaW4gdGhlIGNhc2Ugb2YgYSB0aW1lc3RhbXAgY29sbGlzaW9uKS5cclxuICAgICAqL1xyXG4gICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgIGdlbmVyYXRlUHVzaElEOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgLy8gTW9kZWxlZCBhZnRlciBiYXNlNjQgd2ViLXNhZmUgY2hhcnMsIGJ1dCBvcmRlcmVkIGJ5IEFTQ0lJLlxyXG4gICAgICAgICAgICB2YXIgUFVTSF9DSEFSUyA9ICctMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaX2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6JztcclxuXHJcbiAgICAgICAgICAgIC8vIFRpbWVzdGFtcCBvZiBsYXN0IHB1c2gsIHVzZWQgdG8gcHJldmVudCBsb2NhbCBjb2xsaXNpb25zIGlmIHlvdSBwdXNoIHR3aWNlIGluIG9uZSBtcy5cclxuICAgICAgICAgICAgdmFyIGxhc3RQdXNoVGltZSA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBXZSBnZW5lcmF0ZSA3Mi1iaXRzIG9mIHJhbmRvbW5lc3Mgd2hpY2ggZ2V0IHR1cm5lZCBpbnRvIDEyIGNoYXJhY3RlcnMgYW5kIGFwcGVuZGVkIHRvIHRoZVxyXG4gICAgICAgICAgICAvLyB0aW1lc3RhbXAgdG8gcHJldmVudCBjb2xsaXNpb25zIHdpdGggb3RoZXIgY2xpZW50cy4gIFdlIHN0b3JlIHRoZSBsYXN0IGNoYXJhY3RlcnMgd2VcclxuICAgICAgICAgICAgLy8gZ2VuZXJhdGVkIGJlY2F1c2UgaW4gdGhlIGV2ZW50IG9mIGEgY29sbGlzaW9uLCB3ZSdsbCB1c2UgdGhvc2Ugc2FtZSBjaGFyYWN0ZXJzIGV4Y2VwdFxyXG4gICAgICAgICAgICAvLyBcImluY3JlbWVudGVkXCIgYnkgb25lLlxyXG4gICAgICAgICAgICB2YXIgbGFzdFJhbmRDaGFycyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgLy8gcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgICB2YXIgZHVwbGljYXRlVGltZSA9IChub3cgPT09IGxhc3RQdXNoVGltZSk7XHJcbiAgICAgICAgICAgICAgbGFzdFB1c2hUaW1lID0gbm93O1xyXG5cclxuICAgICAgICAgICAgICB2YXIgdGltZVN0YW1wQ2hhcnMgPSBuZXcgQXJyYXkoOCk7XHJcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDc7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lU3RhbXBDaGFyc1tpXSA9IFBVU0hfQ0hBUlMuY2hhckF0KG5vdyAlIDY0KTtcclxuICAgICAgICAgICAgICAgIC8vIE5PVEU6IENhbid0IHVzZSA8PCBoZXJlIGJlY2F1c2UgamF2YXNjcmlwdCB3aWxsIGNvbnZlcnQgdG8gaW50IGFuZCBsb3NlIHRoZSB1cHBlciBiaXRzLlxyXG4gICAgICAgICAgICAgICAgbm93ID0gTWF0aC5mbG9vcihub3cgLyA2NCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChub3cgIT09IDApIHRocm93IG5ldyBFcnJvcignV2Ugc2hvdWxkIGhhdmUgY29udmVydGVkIHRoZSBlbnRpcmUgdGltZXN0YW1wLicpO1xyXG5cclxuICAgICAgICAgICAgICB2YXIgaWQgPSB0aW1lU3RhbXBDaGFycy5qb2luKCcnKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCFkdXBsaWNhdGVUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICBsYXN0UmFuZENoYXJzW2ldID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNjQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgdGltZXN0YW1wIGhhc24ndCBjaGFuZ2VkIHNpbmNlIGxhc3QgcHVzaCwgdXNlIHRoZSBzYW1lIHJhbmRvbSBudW1iZXIsIGV4Y2VwdCBpbmNyZW1lbnRlZCBieSAxLlxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMTE7IGkgPj0gMCAmJiBsYXN0UmFuZENoYXJzW2ldID09PSA2MzsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgIGxhc3RSYW5kQ2hhcnNbaV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGFzdFJhbmRDaGFyc1tpXSsrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWQgKz0gUFVTSF9DSEFSUy5jaGFyQXQobGFzdFJhbmRDaGFyc1tpXSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmKGlkLmxlbmd0aCAhPSAyMCkgdGhyb3cgbmV3IEVycm9yKCdMZW5ndGggc2hvdWxkIGJlIDIwLicpO1xyXG5cclxuICAgICAgICAgICAgICByZXR1cm4gaWQ7XHJcbiAgICAgICAgICAgIC8vIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgfSkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
