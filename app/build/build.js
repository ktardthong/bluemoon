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
            //controller: 'HomeCtrl as  homeCtrl',
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
  .controller('DashboardCtrl', ["Auth", "$state", "Category", "CateService", "Tags", "Topics", function(Auth, $state,Category,CateService,Tags,Topics
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguY29udHJvbGxlci5qcyIsImF1dGguc2VydmljZS5qcyIsImNhdGVnb3J5LmNvbnRyb2xsZXIuanMiLCJjYXRlZ29yeS5zZXJ2aWNlLmpzIiwicG9zdC5zZXJ2aWNlLmpzIiwiZGFzaGJvYXJkLmNvbnRyb2xsZXIuanMiLCJkaXJlY3RpdmVzLmpzIiwiaG9tZS5jb250cm9sbGVyLmpzIiwibGFuZy5qcyIsIm5vdGlmaWNhdGlvbi5jb250cm9sbGVyLmpzIiwibm90aWZpY2F0aW9uLnNlcnZpY2UuanMiLCJwbGFjZS5jb250cm9sbGVyLmpzIiwicGxhY2Uuc2VydmljZS5qcyIsInV0aWxpdGllcy5zZXJ2aWNlLmpzIiwidGFnLmNvbnRyb2xsZXIuanMiLCJ0YWcuc2VydmljZS5qcyIsInRvcGljLWxhbmRpbmcuY29udHJvbGxlci5qcyIsInRvcGljcy5jb250cm9sbGVyLmpzIiwidG9waWNzLnNlcnZpY2UuanMiLCJwcm9maWxlLmNvbnRyb2xsZXIuanMiLCJ1c2Vycy5zZXJ2aWNlLmpzIiwiaGVscGVycy5zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQUtBLElBQUEsTUFBQSxRQUFBLE9BQUEsT0FBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7OztJQUdBO0lBQ0E7SUFDQTs7SUFFQTtJQUNBOzs7O0dBSUEsOEJBQUEsVUFBQSxvQkFBQTtJQUNBLG1CQUFBLGNBQUEsU0FBQTtNQUNBLE1BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxRQUFBO01BQ0EsUUFBQTtNQUNBLFFBQUE7TUFDQSxRQUFBO01BQ0Esd0JBQUE7O01BRUEsc0JBQUEsQ0FBQSxNQUFBO1FBQ0EsT0FBQSxPQUFBLE9BQUE7TUFDQSx1QkFBQTs7SUFFQSxtQkFBQSxNQUFBO09BQ0EsZUFBQTs7OztHQUlBO3lCQUNBLFVBQUEsa0JBQUE7TUFDQSxJQUFBLFVBQUE7TUFDQSxpQkFBQSxTQUFBO01BQ0EsaUJBQUEsS0FBQTs7Ozs7R0FLQSw4QkFBQSxVQUFBLG9CQUFBO0lBQ0EsbUJBQUEsa0JBQUE7O0lBRUEsbUJBQUEseUJBQUE7Ozs7O0dBS0EsdUVBQUEsVUFBQSxnQkFBQSxtQkFBQSxxQkFBQTs7SUFFQSxJQUFBLGVBQUEsb0JBQUE7O0lBRUE7T0FDQSxNQUFBLFFBQUE7UUFDQSxLQUFBO1FBQ0EsT0FBQTtVQUNBLElBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTtZQUNBLFNBQUE7Y0FDQSxrQ0FBQSxVQUFBLFFBQUEsTUFBQTtnQkFDQSxPQUFBLEtBQUEsS0FBQSxlQUFBLEtBQUEsVUFBQSxNQUFBO2tCQUNBLE9BQUEsR0FBQTttQkFDQSxVQUFBLE9BQUE7a0JBQ0EsT0FBQTs7Ozs7VUFLQSxtQkFBQTs7WUFFQSxhQUFBOzs7Ozs7O09BT0EsTUFBQSxZQUFBO1FBQ0EsS0FBQTtRQUNBLE9BQUE7VUFDQSxJQUFBOztZQUVBLGFBQUE7WUFDQSxTQUFBO2NBQ0EsaUJBQUEsVUFBQSxRQUFBO2dCQUNBLE9BQUEsT0FBQTs7Ozs7Ozs7O09BU0EsTUFBQSxZQUFBO1FBQ0EsS0FBQTtRQUNBLE9BQUE7VUFDQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7WUFDQSxTQUFBOztjQUVBLHVDQUFBLFVBQUEsY0FBQSxVQUFBO2dCQUNBLE9BQUEsU0FBQSxRQUFBLGFBQUEsTUFBQTs7O2NBR0EsdUNBQUEsVUFBQSxjQUFBLFFBQUE7Z0JBQ0EsT0FBQSxPQUFBLEtBQUEsYUFBQTs7Ozs7Ozs7O09BU0EsTUFBQSxVQUFBO1FBQ0EsS0FBQTtRQUNBLE9BQUE7VUFDQSxpQkFBQTtZQUNBLFlBQUE7WUFDQSxhQUFBOztVQUVBLElBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTtZQUNBLFNBQUE7Y0FDQSxxRUFBQSxVQUFBLFFBQUEsUUFBQSxjQUFBLGdCQUFBO2dCQUNBLElBQUE7Z0JBQ0EsT0FBQSxZQUFBLGFBQUEsVUFBQSxHQUFBLFNBQUEsVUFBQSxVQUFBO2tCQUNBLE9BQUEsU0FBQTtrQkFDQSxRQUFBLElBQUEsU0FBQTs7Z0JBRUEsT0FBQTs7Ozs7Ozs7OztPQVVBLE1BQUEsT0FBQTtRQUNBLEtBQUE7UUFDQSxPQUFBO1VBQ0EsY0FBQTtZQUNBLFlBQUE7WUFDQSxhQUFBOztVQUVBLElBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTtZQUNBLFNBQUE7Y0FDQSwwQkFBQSxVQUFBLGNBQUE7Z0JBQ0EsT0FBQSxhQUFBOzs7Y0FHQSwrQ0FBQSxVQUFBLFFBQUEsY0FBQSxNQUFBO2dCQUNBLElBQUEsTUFBQSxhQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQkF5Q0EsT0FBQSxPQUFBLFlBQUE7Ozs7Ozs7Ozs7O09BV0EsTUFBQSxTQUFBO1FBQ0EsS0FBQTtRQUNBLFNBQUE7Ozs7Ozs7O1FBUUEsT0FBQTtVQUNBLElBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTtZQUNBLFNBQUE7Y0FDQSxxREFBQSxVQUFBLE1BQUEsT0FBQSxjQUFBLFFBQUE7Z0JBQ0EsSUFBQSxXQUFBOztnQkFFQSxJQUFBLEtBQUEsSUFBQSxXQUFBO2tCQUNBLE9BQUEsT0FBQSxTQUFBLGFBQUEsTUFBQSxVQUFBLEtBQUEsVUFBQSxNQUFBO29CQUNBLElBQUEsS0FBQSxNQUFBLE1BQUE7c0JBQ0EsV0FBQSxLQUFBLEdBQUE7c0JBQ0EsSUFBQSxLQUFBLElBQUEsVUFBQSxPQUFBLFVBQUE7d0JBQ0EsT0FBQTs2QkFDQTt3QkFDQSxPQUFBOzs7O3VCQUlBO2tCQUNBLE9BQUE7OztjQUdBLHlDQUFBLFVBQUEsY0FBQSxRQUFBO2dCQUNBLE9BQUEsT0FBQSxTQUFBLGFBQUEsTUFBQTs7Y0FFQSxnREFBQSxVQUFBLGNBQUEsUUFBQSxRQUFBO2dCQUNBLElBQUEsV0FBQTtnQkFDQSxPQUFBLE9BQUEsU0FBQSxhQUFBLE1BQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTtrQkFDQSxJQUFBLEtBQUEsTUFBQSxNQUFBO29CQUNBLFdBQUEsS0FBQSxHQUFBO3lCQUNBO29CQUNBLE9BQUEsR0FBQTs7a0JBRUEsT0FBQSxPQUFBLFVBQUE7OztjQUdBLHNEQUFBLFVBQUEsY0FBQSxRQUFBLE9BQUEsTUFBQTtnQkFDQSxJQUFBLFVBQUE7Z0JBQ0EsSUFBQSxPQUFBLFNBQUE7Z0JBQ0EsSUFBQSxhQUFBLENBQUEsVUFBQSxJQUFBLFdBQUE7Z0JBQ0EsTUFBQSxnQkFBQSxRQUFBLFVBQUEsTUFBQTtrQkFDQSxXQUFBLFNBQUEsS0FBQTttQkFDQSxLQUFBLFVBQUEsTUFBQTtrQkFDQSxXQUFBLFNBQUEsS0FBQTs7Z0JBRUEsT0FBQSxPQUFBLGVBQUEsYUFBQSxNQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7a0JBQ0EsSUFBQSxLQUFBLEdBQUEsUUFBQSxhQUFBO29CQUNBLFdBQUEsS0FBQSxHQUFBO29CQUNBLFFBQUEsT0FBQSxTQUFBOztvQkFFQSxNQUFBLElBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTtzQkFDQSxJQUFBLEtBQUEsU0FBQSxNQUFBO3dCQUNBLE1BQUEsSUFBQSxNQUFBLFNBQUEsSUFBQTs2QkFDQTt3QkFDQSxNQUFBLElBQUEsTUFBQSxTQUFBLElBQUEsS0FBQSxRQUFBOzs7b0JBR0EsS0FBQSxLQUFBLGVBQUEsS0FBQSxVQUFBLE1BQUE7c0JBQ0EsSUFBQSxNQUFBLEtBQUE7c0JBQ0EsTUFBQSxJQUFBLE1BQUEsV0FBQSxNQUFBLEtBQUEsT0FBQSxJQUFBO3NCQUNBLE1BQUEsUUFBQSxLQUFBLEtBQUEsTUFBQSxTQUFBLE1BQUEsVUFBQSxPQUFBLElBQUE7OztrQkFHQSxPQUFBLE1BQUE7OztjQUdBLHNDQUFBLFVBQUEsY0FBQSxRQUFBO2dCQUNBLE9BQUEsT0FBQSxlQUFBLGFBQUEsTUFBQSxVQUFBLEtBQUEsVUFBQSxNQUFBO2tCQUNBLElBQUEsV0FBQSxLQUFBLEdBQUE7a0JBQ0EsT0FBQSxPQUFBLGFBQUEsVUFBQSxJQUFBLFVBQUEsS0FBQSxVQUFBLE9BQUE7b0JBQ0EsT0FBQTs7Ozs7Ozs7OztPQVVBLE1BQUEsa0JBQUE7UUFDQSxLQUFBOzs7O09BSUEsTUFBQSxXQUFBO1FBQ0EsS0FBQTtRQUNBLE9BQUE7VUFDQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7WUFDQSxTQUFBO2NBQ0EsMkNBQUEsVUFBQSxNQUFBLE9BQUEsY0FBQTtnQkFDQSxJQUFBLEtBQUEsSUFBQSxXQUFBO2tCQUNBLE9BQUEsTUFBQSxxQkFBQSxhQUFBLE1BQUEsVUFBQSxLQUFBLFVBQUEsU0FBQTtvQkFDQSxJQUFBLFFBQUEsR0FBQSxPQUFBLEtBQUEsSUFBQSxVQUFBLEtBQUE7c0JBQ0EsT0FBQTsyQkFDQTtzQkFDQSxPQUFBOzs7dUJBR0E7a0JBQ0EsT0FBQTs7O2NBR0EsK0NBQUEsVUFBQSxPQUFBLFFBQUEsY0FBQTtnQkFDQSxPQUFBLE1BQUEscUJBQUEsYUFBQSxNQUFBLFVBQUEsS0FBQSxVQUFBLFNBQUE7a0JBQ0EsSUFBQSxRQUFBLEdBQUEsUUFBQSxhQUFBO29CQUNBLE9BQUEsT0FBQSxVQUFBLFFBQUEsR0FBQTs7OztjQUlBLG1FQUFBLFVBQUEsUUFBQSxjQUFBLFlBQUEsTUFBQSxPQUFBO2dCQUNBLE9BQUEsTUFBQSxxQkFBQSxhQUFBLE1BQUEsVUFBQSxLQUFBLFVBQUEsU0FBQTtrQkFDQSxPQUFBOzs7OztVQUtBLGtCQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7Ozs7Ozs7O09BUUEsTUFBQSxnQkFBQTtRQUNBLEtBQUE7UUFDQSxPQUFBO1VBQ0EsNkJBQUE7WUFDQSxLQUFBO1lBQ0EsYUFBQTs7VUFFQSx5QkFBQTtZQUNBLEtBQUE7WUFDQSxhQUFBOztVQUVBLElBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTtZQUNBLFNBQUE7Y0FDQSxXQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7Y0FFQSxTQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7Y0FFQSxtREFBQSxVQUFBLFFBQUEsWUFBQSxNQUFBLE9BQUE7Z0JBQ0EsT0FBQSxLQUFBLEtBQUEsZUFBQSxLQUFBLFVBQUEsTUFBQTtrQkFDQSxPQUFBLE1BQUEsV0FBQSxLQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsU0FBQTtvQkFDQSxJQUFBLFFBQUEsYUFBQTtzQkFDQSxPQUFBOzJCQUNBO3NCQUNBLE9BQUEsR0FBQTs7O21CQUdBLFVBQUEsT0FBQTtrQkFDQSxPQUFBLEdBQUE7OztjQUdBLGtDQUFBLFVBQUEsUUFBQSxPQUFBLE1BQUE7Z0JBQ0EsT0FBQSxLQUFBLEtBQUEsZUFBQSxNQUFBLFlBQUE7a0JBQ0EsT0FBQSxHQUFBOzs7Ozs7OztPQVFBLE1BQUEsbUJBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTs7O09BR0EsTUFBQSxtQkFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBOzs7OztPQUtBLE1BQUEsYUFBQTtRQUNBLEtBQUE7UUFDQSxZQUFBO1FBQ0EsT0FBQTtVQUNBLElBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTtZQUNBLFNBQUE7Y0FDQSxXQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7Y0FFQSxTQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7Y0FFQSxtREFBQSxVQUFBLFFBQUEsWUFBQSxNQUFBLE9BQUE7Z0JBQ0EsT0FBQSxLQUFBLEtBQUEsZUFBQSxLQUFBLFVBQUEsTUFBQTtrQkFDQSxPQUFBLE1BQUEsV0FBQSxLQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsU0FBQTs7b0JBRUEsSUFBQSxDQUFBLFFBQUEsTUFBQTtzQkFDQSxNQUFBLFFBQUEsS0FBQSxLQUFBLE1BQUEsc0JBQUEsSUFBQTtzQkFDQSxNQUFBLFFBQUEsS0FBQSxLQUFBLE1BQUEscUJBQUEsSUFBQTtzQkFDQSxNQUFBLFFBQUEsS0FBQSxLQUFBLE1BQUEsc0JBQUEsSUFBQTtzQkFDQSxNQUFBLFFBQUEsS0FBQSxLQUFBLE1BQUEsdUJBQUEsSUFBQTtzQkFDQSxNQUFBLFFBQUEsS0FBQSxLQUFBLE1BQUEsd0JBQUEsSUFBQTs7OztvQkFJQSxJQUFBLFFBQUEsYUFBQTtzQkFDQSxPQUFBOzJCQUNBO3NCQUNBLE9BQUEsR0FBQTs7O21CQUdBLFVBQUEsT0FBQTtrQkFDQSxPQUFBLEdBQUE7a0JBQ0EsT0FBQTs7O2NBR0Esa0NBQUEsVUFBQSxRQUFBLE9BQUEsTUFBQTtnQkFDQSxPQUFBLEtBQUEsS0FBQSxlQUFBLE1BQUEsWUFBQTtrQkFDQSxPQUFBLEdBQUE7Ozs7Ozs7Ozs7T0FVQSxNQUFBLGtCQUFBO1FBQ0EsS0FBQTs7UUFFQSxPQUFBO1VBQ0EsSUFBQTtZQUNBLFlBQUE7WUFDQSxhQUFBO1lBQ0EsU0FBQTs7Y0FFQSx1Q0FBQSxVQUFBLGNBQUEsVUFBQTtnQkFDQSxPQUFBLFNBQUEsUUFBQSxhQUFBLE1BQUE7OztjQUdBLHVDQUFBLFVBQUEsY0FBQSxRQUFBO2dCQUNBLE9BQUEsT0FBQSxLQUFBLGFBQUE7Ozs7Ozs7OztPQVNBLE1BQUEsZ0JBQUE7UUFDQSxLQUFBO1FBQ0EsT0FBQTtVQUNBLElBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTtZQUNBLFNBQUE7Y0FDQSxXQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7Y0FFQSxTQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7Y0FFQSwyQkFBQSxVQUFBLE9BQUEsTUFBQTtnQkFDQSxPQUFBLEtBQUEsS0FBQSxlQUFBLEtBQUEsVUFBQSxNQUFBO2tCQUNBLE9BQUEsTUFBQSxXQUFBLEtBQUEsS0FBQTs7O2NBR0Esa0NBQUEsVUFBQSxRQUFBLE9BQUEsTUFBQTtnQkFDQSxPQUFBLEtBQUEsS0FBQSxlQUFBLE1BQUEsWUFBQTtrQkFDQSxPQUFBLEdBQUE7Ozs7Ozs7Ozs7T0FVQSxNQUFBLGVBQUE7UUFDQSxLQUFBO1FBQ0EsT0FBQTtVQUNBLElBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTtZQUNBLFNBQUE7Y0FDQSxXQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7Y0FFQSxTQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7Y0FFQSwyQkFBQSxVQUFBLE9BQUEsTUFBQTtnQkFDQSxPQUFBLEtBQUEsS0FBQSxlQUFBLEtBQUEsVUFBQSxNQUFBO2tCQUNBLE9BQUEsTUFBQSxXQUFBLEtBQUEsS0FBQTs7O2NBR0Esa0NBQUEsVUFBQSxRQUFBLE9BQUEsTUFBQTtnQkFDQSxPQUFBLEtBQUEsS0FBQSxlQUFBLE1BQUEsWUFBQTtrQkFDQSxPQUFBLEdBQUE7Ozs7O1VBS0Esc0JBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTs7Ozs7T0FLQSxNQUFBLFNBQUE7UUFDQSxLQUFBO1FBQ0EsT0FBQTtVQUNBLElBQUE7WUFDQSxhQUFBOztVQUVBLG9CQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7Ozs7O09BS0EsTUFBQSxZQUFBO1FBQ0EsS0FBQTtRQUNBLE9BQUE7VUFDQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7OztRQUdBLFNBQUE7VUFDQSxrQ0FBQSxVQUFBLFFBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxLQUFBLGVBQUEsS0FBQSxVQUFBLE1BQUE7Y0FDQSxPQUFBLEdBQUE7ZUFDQSxVQUFBLE9BQUE7Y0FDQSxPQUFBOzs7Ozs7SUFNQSxtQkFBQSxVQUFBOzs7R0FHQSxPQUFBLGlCQUFBLFlBQUE7SUFDQSxPQUFBLFVBQUEsT0FBQSxPQUFBLFNBQUE7TUFDQSxJQUFBLFdBQUE7TUFDQSxRQUFBLFFBQUEsT0FBQSxVQUFBLE1BQUE7UUFDQSxTQUFBLEtBQUEsS0FBQSxLQUFBLElBQUE7O01BRUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxHQUFBO1FBQ0EsUUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLElBQUEsQ0FBQTs7TUFFQSxJQUFBLFNBQUEsU0FBQTtNQUNBLE9BQUE7Ozs7R0FJQSxPQUFBLGFBQUEsWUFBQTtJQUNBLE9BQUEsVUFBQSxNQUFBO01BQ0EsT0FBQSxPQUFBLFVBQUEsUUFBQTs7Ozs7R0FLQSxPQUFBLGtCQUFBLFVBQUEsTUFBQTtJQUNBLE9BQUEsVUFBQSxNQUFBO01BQ0EsT0FBQSxPQUFBLEtBQUEsWUFBQSxLQUFBLFFBQUEsT0FBQSxZQUFBOzs7O0dBSUEsU0FBQSxlQUFBOztBQUVBLFNBQUEsTUFBQSxNQUFBO0VBQ0EsUUFBQSxJQUFBO0VBQ0EsT0FBQSxLQUFBLFVBQUEsTUFBQSxNQUFBOzs7O0FBSUEsU0FBQSxRQUFBLE1BQUE7RUFDQSxJQUFBLFFBQUEsTUFBQSxVQUFBLE1BQUEsS0FBQSxXQUFBO0VBQ0EsTUFBQSxRQUFBLFVBQUEsR0FBQTtJQUNBLElBQUEsS0FBQSxRQUFBLE9BQUEsVUFBQTtNQUNBLEtBQUEsSUFBQSxLQUFBLEdBQUE7UUFDQSxJQUFBLEVBQUEsZUFBQSxJQUFBO1VBQ0EsS0FBQSxLQUFBLEVBQUE7Ozs7O0VBS0EsT0FBQTs7O0FDM29CQSxRQUFBLE9BQUE7R0FDQSxXQUFBLHdJQUFBLFNBQUEsT0FBQSxNQUFBLE9BQUEsT0FBQSxXQUFBLFdBQUEsWUFBQTttQ0FDQSxZQUFBLGNBQUE7O0lBRUEsUUFBQSxJQUFBOztJQUVBLElBQUEsV0FBQTs7O0lBR0EsY0FBQTtPQUNBLEtBQUEsVUFBQSxZQUFBO1FBQ0EsUUFBQSxJQUFBOzs7O0lBSUEsU0FBQSxXQUFBO0lBQ0EsU0FBQSxXQUFBO0lBQ0EsU0FBQSxlQUFBOzs7SUFHQSxHQUFBLEtBQUEsSUFBQSxhQUFBLE1BQUE7TUFDQSxTQUFBLFdBQUEsU0FBQSxNQUFBLFdBQUEsS0FBQSxJQUFBLFVBQUE7O1FBRUE7TUFDQSxTQUFBLFNBQUE7Ozs7SUFJQSxTQUFBLE9BQUE7TUFDQSxPQUFBO01BQ0EsVUFBQTs7Ozs7Ozs7Ozs7Ozs7SUFjQSxPQUFBLG1CQUFBLFNBQUE7OztJQUdBLFNBQUEsZUFBQSxVQUFBO01BQ0EsU0FBQSxhQUFBLFlBQUEsU0FBQSxRQUFBOzs7SUFHQSxTQUFBLFlBQUEsVUFBQTtNQUNBLFFBQUEsSUFBQSxlQUFBLFNBQUEsa0JBQUE7Ozs7SUFJQSxPQUFBLE9BQUEsUUFBQSxTQUFBLFVBQUEsVUFBQTtNQUNBLElBQUEsT0FBQSxLQUFBLFNBQUEsR0FBQTtRQUNBLE9BQUEsV0FBQSxlQUFBLE9BQUE7Ozs7OztJQU1BLFNBQUEsYUFBQSxVQUFBLFNBQUE7TUFDQSxXQUFBLElBQUE7O01BRUEsU0FBQSxJQUFBLFlBQUE7O01BRUEsR0FBQSxLQUFBLElBQUEsVUFBQTtRQUNBLFNBQUEsTUFBQSxXQUFBLEtBQUEsSUFBQSxVQUFBLEtBQUEsT0FBQSxDQUFBLE9BQUE7Ozs7O0lBS0EsR0FBQSxDQUFBLFNBQUEsUUFBQSxLQUFBO01BQ0EsR0FBQSxTQUFBLElBQUEsWUFBQTtRQUNBLFNBQUEsV0FBQSxTQUFBLElBQUE7V0FDQTtRQUNBLFNBQUEsV0FBQTs7O1FBR0E7TUFDQSxTQUFBLFdBQUEsU0FBQSxRQUFBOzs7OztJQUtBLFNBQUEsUUFBQSxXQUFBO01BQ0EsU0FBQSxLQUFBLEtBQUEsa0JBQUEsU0FBQSxNQUFBLEtBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxHQUFBO1NBQ0EsVUFBQSxNQUFBO1FBQ0EsU0FBQSxRQUFBOzs7OztJQUtBLFNBQUEsU0FBQSxVQUFBO01BQ0EsS0FBQSxLQUFBO01BQ0EsT0FBQSxHQUFBOzs7O0lBSUEsU0FBQSxXQUFBLFdBQUE7TUFDQSxLQUFBLEtBQUEsWUFBQSxTQUFBLE1BQUEsS0FBQSxVQUFBLEtBQUE7UUFDQSxTQUFBO1NBQ0EsVUFBQSxNQUFBO1FBQ0EsU0FBQSxRQUFBOzs7OztJQUtBLFNBQUEsY0FBQSxhQUFBO0lBQ0EsU0FBQSxhQUFBLE9BQUE7TUFDQSxPQUFBLFdBQUE7UUFDQSxXQUFBO1dBQ0E7Ozs7O0FDcEhBLFFBQUEsT0FBQTtHQUNBLFFBQUEseUNBQUEsU0FBQSxlQUFBLFlBQUE7SUFDQSxJQUFBLE1BQUEsSUFBQSxTQUFBO0lBQ0EsSUFBQSxPQUFBLGNBQUE7O0lBRUEsSUFBQSxPQUFBO01BQ0EsSUFBQTtNQUNBLE1BQUE7O01BRUEsT0FBQSxVQUFBO1FBQ0EsSUFBQSxNQUFBLElBQUE7UUFDQSxHQUFBLE9BQUEsTUFBQTtVQUNBLE9BQUEsSUFBQSxVQUFBOztZQUVBO1VBQ0EsT0FBQTs7Ozs7SUFLQSxPQUFBOzs7QUNwQkEsUUFBQSxPQUFBO0dBQ0EsV0FBQSw2REFBQSxTQUFBLFFBQUEsU0FBQSxTQUFBLFdBQUE7SUFDQSxJQUFBLFdBQUE7OztJQUdBLFNBQUEsYUFBQTtJQUNBLFNBQUEsYUFBQTtJQUNBLFNBQUEsYUFBQTs7O0lBR0EsUUFBQSxJQUFBOzs7QUNWQSxRQUFBLE9BQUE7OztHQUdBLFFBQUEsb0VBQUEsU0FBQSxpQkFBQSxpQkFBQSxZQUFBO0lBQ0EsSUFBQSxTQUFBLElBQUEsU0FBQSxZQUFBO0lBQ0EsSUFBQSxhQUFBLGdCQUFBOztJQUVBLElBQUEsT0FBQTs7TUFFQSxNQUFBLFNBQUEsV0FBQTtRQUNBLElBQUEsT0FBQSxJQUFBLGFBQUEsUUFBQSxRQUFBO1FBQ0EsT0FBQSxnQkFBQTs7O01BR0EsVUFBQSxTQUFBLFdBQUE7UUFDQSxPQUFBLGdCQUFBLFNBQUEsTUFBQTs7O01BR0EsVUFBQSxTQUFBLFVBQUE7UUFDQSxPQUFBLElBQUEsTUFBQTs7O01BR0EsV0FBQSxTQUFBLElBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLGlCQUFBLFFBQUE7UUFDQSxPQUFBLGVBQUE7OztNQUdBLFNBQUEsU0FBQSxLQUFBLElBQUE7UUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUEsY0FBQSxLQUFBLGFBQUE7UUFDQSxJQUFBOzs7TUFHQSxXQUFBLFNBQUEsS0FBQSxJQUFBO1FBQ0EsSUFBQSxPQUFBO1FBQ0EsSUFBQSxTQUFBLElBQUEsU0FBQSxZQUFBLGNBQUEsS0FBQSxhQUFBO1FBQ0EsSUFBQSxLQUFBLFNBQUEsU0FBQSxVQUFBO1VBQ0EsU0FBQSxTQUFBOztRQUVBLE9BQUE7O01BRUEsS0FBQSxlQUFBO01BQ0EsSUFBQTs7SUFFQSxPQUFBOzs7O0FDM0NBLFFBQUEsT0FBQTs7O0dBR0EsUUFBQSwyQ0FBQSxTQUFBLGlCQUFBLFlBQUE7SUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLFNBQUEsZ0JBQUE7O0lBRUEsSUFBQSxLQUFBO01BQ0EsV0FBQSxTQUFBLFdBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsZ0JBQUE7O01BRUEsVUFBQSxTQUFBLFdBQUE7UUFDQSxPQUFBLGdCQUFBLFNBQUEsTUFBQTs7TUFFQSxJQUFBOztJQUVBLE9BQUE7Ozs7QUNqQkEsUUFBQSxPQUFBO0dBQ0EsV0FBQSxpRkFBQSxTQUFBLE1BQUEsT0FBQSxTQUFBLFlBQUEsS0FBQTswQ0FDQTtJQUNBLElBQUEsZ0JBQUE7O0lBRUEsY0FBQSxPQUFBOztJQUVBLGNBQUEsY0FBQTtJQUNBLGNBQUEsY0FBQSxTQUFBO0lBQ0EsY0FBQSxjQUFBO0lBQ0EsY0FBQSxjQUFBO0lBQ0EsY0FBQSxjQUFBLEtBQUE7O0lBRUEsY0FBQSxrQkFBQTtJQUNBLGNBQUEsa0JBQUE7SUFDQSxjQUFBLGtCQUFBO0lBQ0EsY0FBQSxVQUFBOztJQUVBLGNBQUEsYUFBQSxjQUFBLE9BQUE7O0lBRUEsY0FBQSxhQUFBLFNBQUEsVUFBQTtNQUNBLGNBQUEsS0FBQSxTQUFBLFVBQUE7U0FDQSxNQUFBLEtBQUEsSUFBQSxVQUFBLEtBQUEsT0FBQSxJQUFBLFNBQUE7OztJQUdBLFFBQUEsSUFBQTs7O0FDekJBLFFBQUEsT0FBQTs7R0FFQSxVQUFBLGFBQUEsVUFBQTtJQUNBLE9BQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTs7TUFFQSxhQUFBOzs7Ozs7R0FNQSxVQUFBLG9CQUFBLFVBQUE7SUFDQSxPQUFBO01BQ0EsY0FBQTtNQUNBLGNBQUE7O01BRUEsY0FBQTtNQUNBLE9BQUE7UUFDQSxjQUFBOzs7Ozs7O0dBT0EsVUFBQSxlQUFBLFlBQUE7SUFDQSxPQUFBO01BQ0EsY0FBQTtNQUNBLGNBQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTtNQUNBLE9BQUE7UUFDQSxRQUFBOzs7Ozs7O0dBT0EsVUFBQSxrQkFBQSxVQUFBO0lBQ0EsT0FBQTtNQUNBLGNBQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTtNQUNBLGNBQUE7TUFDQSxPQUFBO1FBQ0EsUUFBQTs7Ozs7OztHQU9BLFVBQUEsZ0JBQUEsVUFBQTtJQUNBLE9BQUE7TUFDQSxZQUFBO01BQ0EsYUFBQTtNQUNBLE9BQUE7UUFDQSxNQUFBOzs7Ozs7R0FNQSxVQUFBLGFBQUEsWUFBQTtJQUNBLE9BQUE7TUFDQSxZQUFBO01BQ0EsYUFBQTs7Ozs7R0FLQSxVQUFBLFdBQUEsWUFBQTtJQUNBLE9BQUE7TUFDQSxZQUFBO01BQ0EsYUFBQTs7Ozs7R0FLQSxVQUFBLGVBQUEsVUFBQTs7SUFFQSxPQUFBO01BQ0EsWUFBQTtNQUNBLGFBQUE7TUFDQSxPQUFBO1FBQ0EsT0FBQTs7Ozs7OztHQU9BLFVBQUEsYUFBQSxZQUFBO0lBQ0EsT0FBQTtNQUNBLFlBQUE7TUFDQSxhQUFBO01BQ0EsT0FBQTtRQUNBLFFBQUE7Ozs7OztHQU1BLFVBQUEsb0JBQUEsWUFBQTtJQUNBLE9BQUE7TUFDQSxZQUFBO01BQ0EsYUFBQTtNQUNBLE9BQUE7UUFDQSxPQUFBOzs7Ozs7O0dBT0EsVUFBQSxrQkFBQSxXQUFBO0VBQ0EsT0FBQTtJQUNBLFNBQUE7SUFDQSxNQUFBLFNBQUEsT0FBQSxTQUFBLE9BQUEsUUFBQTtNQUNBLElBQUEsVUFBQSxNQUFBLFVBQUEsU0FBQSxNQUFBLFNBQUEsT0FBQTs7TUFFQSxPQUFBLFNBQUEsS0FBQSxTQUFBLE9BQUE7UUFDQSxJQUFBLFNBQUEsV0FBQSxNQUFBLFNBQUEsU0FBQTtVQUNBLE1BQUEsT0FBQSxNQUFBLFNBQUEsR0FBQTs7UUFFQSxPQUFBOzs7Ozs7QUNoSUEsUUFBQSxPQUFBO0dBQ0EsV0FBQSxxREFBQSxTQUFBLE9BQUEsU0FBQSxPQUFBLEtBQUE7SUFDQSxJQUFBLFdBQUE7O0lBRUEsU0FBQSxTQUFBO0lBQ0EsU0FBQSxTQUFBO0lBQ0EsU0FBQSxTQUFBOztJQUVBLFFBQUEsSUFBQTs7OztBQ1JBLFFBQUEsT0FBQTtHQUNBLE9BQUEsQ0FBQSxzQkFBQSxVQUFBLG9CQUFBO0lBQ0EsbUJBQUEsYUFBQSxPQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0EsbUJBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBOzs7TUFHQSxrQkFBQTtNQUNBLGtCQUFBOzs7O01BSUEsd0JBQUE7TUFDQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7Ozs7O01BS0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBOzs7TUFHQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7Ozs7SUFJQSxtQkFBQSxhQUFBLE9BQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTs7O0lBR0EsbUJBQUEsa0JBQUE7OztBQ2hHQSxRQUFBLE9BQUE7R0FDQSxXQUFBLDREQUFBLFNBQUEsT0FBQSxTQUFBLE9BQUEsWUFBQTtJQUNBLElBQUEsV0FBQTs7O0lBR0EsU0FBQSxTQUFBO0lBQ0EsU0FBQSxTQUFBO0lBQ0EsU0FBQSxjQUFBOztJQUVBLFNBQUEsVUFBQSxTQUFBLElBQUE7TUFDQSxPQUFBLFNBQUEsSUFBQSxLQUFBLEtBQUEsS0FBQTs7OztBQ1ZBLFFBQUEsT0FBQTs7R0FFQSxRQUFBLDhGQUFBLFNBQUEsaUJBQUEsaUJBQUE7bUNBQ0EsTUFBQSxjQUFBO0lBQ0EsSUFBQSxTQUFBLElBQUEsU0FBQSxZQUFBO0lBQ0EsSUFBQSxPQUFBLGdCQUFBO0lBQ0EsSUFBQSxRQUFBOztJQUVBLElBQUEsb0JBQUE7OztJQUdBLElBQUEsZUFBQTs7O01BR0EsbUJBQUEsU0FBQSxJQUFBO1FBQ0EsSUFBQSxNQUFBLElBQUEsU0FBQSxZQUFBLGdCQUFBLElBQUE7UUFDQSxJQUFBO1FBQ0EsSUFBQSxHQUFBLFFBQUEsU0FBQSxTQUFBO1VBQ0EsVUFBQSxTQUFBOzs7UUFHQSxJQUFBLG1CQUFBLElBQUEsU0FBQSxZQUFBLGdCQUFBO1FBQ0EsaUJBQUEsR0FBQSxjQUFBLFVBQUE7VUFDQSxjQUFBLDBCQUFBO1lBQ0EsTUFBQSxTQUFBO1lBQ0EsS0FBQTtZQUNBLE1BQUE7WUFDQSxLQUFBO1lBQ0EsTUFBQTs7WUFFQSxvQkFBQTs7O1FBR0EsT0FBQTs7OztNQUlBLGVBQUEsU0FBQSxRQUFBLElBQUE7UUFDQSxJQUFBLE1BQUEsTUFBQSxZQUFBO1FBQ0EsSUFBQSxLQUFBLFNBQUEsU0FBQSxVQUFBO1VBQ0EsU0FBQSxRQUFBLFNBQUEsZUFBQTs7WUFFQSxhQUFBLHdCQUFBLFFBQUEsY0FBQTs7Ozs7O01BTUEsVUFBQSxTQUFBLFFBQUEsSUFBQSxTQUFBOztRQUVBLFFBQUEsSUFBQSxPQUFBO1FBQ0EsUUFBQSxJQUFBLGFBQUE7O1FBRUEsYUFBQSxTQUFBLEtBQUEsT0FBQSxJQUFBO1VBQ0EsWUFBQTtVQUNBLFlBQUE7VUFDQSxZQUFBO1VBQ0EsWUFBQSxTQUFBOzs7Ozs7O01BT0EsWUFBQSxTQUFBLElBQUE7UUFDQSxJQUFBLE1BQUEsSUFBQSxTQUFBLFlBQUEsZ0JBQUEsSUFBQTtRQUNBLElBQUEsSUFBQTs7Ozs7O01BTUEsd0JBQUEsU0FBQSxRQUFBLElBQUEsU0FBQTs7UUFFQSxJQUFBLE1BQUEsSUFBQSxTQUFBLFlBQUEsZ0JBQUEsSUFBQTtRQUNBLElBQUEsS0FBQSxTQUFBLFNBQUEsVUFBQTs7U0FFQSxHQUFBLFNBQUEsU0FBQSxPQUFBO1lBQ0EsSUFBQSxJQUFBO2VBQ0E7WUFDQSxJQUFBLElBQUEsU0FBQSxRQUFBOztXQUVBLFVBQUEsYUFBQTtVQUNBLFFBQUEsSUFBQSxzQkFBQSxZQUFBOzs7O1FBSUEsYUFBQSxVQUFBLFFBQUEsSUFBQTs7Ozs7TUFLQSxTQUFBLFNBQUEsTUFBQTtRQUNBLE9BQUEsSUFBQSxNQUFBOzs7TUFHQSxZQUFBLFNBQUEsTUFBQTtRQUNBLE9BQUEsZ0JBQUEsSUFBQSxNQUFBOzs7TUFHQSxLQUFBLGVBQUE7TUFDQSxLQUFBOztJQUVBLE9BQUE7Ozs7QUN2R0EsUUFBQSxPQUFBO0dBQ0EsV0FBQSxrSkFBQSxTQUFBLE9BQUEsT0FBQSxZQUFBLFdBQUE7O3FDQUVBLE1BQUEsUUFBQSxNQUFBLE9BQUEsS0FBQTtxQ0FDQSxjQUFBOztJQUVBLElBQUEsYUFBQTtJQUNBLFFBQUEsSUFBQTtJQUNBLFdBQUEsZUFBQTs7Ozs7QUNSQSxRQUFBLE9BQUE7R0FDQSxRQUFBLDRDQUFBLFNBQUEsZ0JBQUEsWUFBQTs7SUFFQSxJQUFBLE1BQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLGtCQUFBLElBQUEsU0FBQSxZQUFBOztJQUVBLElBQUEsU0FBQSxlQUFBOztJQUVBLElBQUEsU0FBQTtNQUNBLFVBQUEsU0FBQSxVQUFBO1FBQ0EsT0FBQSxJQUFBLE1BQUE7OztNQUdBLHFCQUFBLFNBQUEsVUFBQTtRQUNBLE9BQUEsZ0JBQUEsTUFBQTs7O01BR0EsWUFBQSxTQUFBLFNBQUE7UUFDQSxPQUFBLElBQUEsTUFBQSxTQUFBOztNQUVBLEtBQUE7O0lBRUEsT0FBQTs7O0FDdEJBLFFBQUEsT0FBQTs7O0dBR0EsUUFBQSxpRUFBQSxTQUFBLGlCQUFBLGdCQUFBLFlBQUE7SUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLGFBQUEsZ0JBQUE7SUFDQSxJQUFBLFdBQUEsZUFBQTs7SUFFQSxJQUFBLFdBQUE7TUFDQSxTQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsT0FBQSxJQUFBLE1BQUE7UUFDQSxPQUFBLGdCQUFBOzs7TUFHQSxLQUFBOztJQUVBLE9BQUE7Ozs7O0dBS0EsUUFBQSwrQ0FBQSxTQUFBLGdCQUFBLFlBQUE7SUFDQSxJQUFBLE1BQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLE9BQUEsZUFBQTs7SUFFQSxPQUFBOzs7OztHQUtBLFFBQUEsNkNBQUEsU0FBQSxnQkFBQSxZQUFBO0lBQ0EsSUFBQSxNQUFBLElBQUEsU0FBQSxZQUFBO0lBQ0EsSUFBQSxVQUFBLGVBQUE7O0lBRUEsSUFBQSxTQUFBO01BQ0EsVUFBQSxTQUFBLEtBQUE7UUFDQSxPQUFBLElBQUEsTUFBQTs7TUFFQSxLQUFBO01BQ0EsS0FBQTs7SUFFQSxPQUFBOzs7QUN6Q0EsUUFBQSxPQUFBO0dBQ0EsV0FBQSw4RUFBQSxTQUFBLE1BQUEsT0FBQSxPQUFBOztrQ0FFQSxXQUFBLFNBQUE7O0lBRUEsSUFBQSxVQUFBO0lBQ0EsUUFBQSxjQUFBO0lBQ0EsUUFBQSxjQUFBOzs7O0FDUEEsUUFBQSxPQUFBO0dBQ0EsUUFBQSxtRUFBQSxTQUFBLGdCQUFBLGlCQUFBLGFBQUEsR0FBQTs7SUFFQSxJQUFBLE1BQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLE9BQUEsZUFBQTs7SUFFQSxJQUFBLE9BQUE7O01BRUEsVUFBQSxTQUFBLFVBQUE7UUFDQSxPQUFBLElBQUEsTUFBQTs7O01BR0EsU0FBQSxZQUFBO1FBQ0EsT0FBQSxlQUFBOzs7TUFHQSxVQUFBLFNBQUEsSUFBQTtRQUNBLE9BQUEsSUFBQSxNQUFBOzs7TUFHQSxhQUFBLFNBQUEsSUFBQTtRQUNBLE9BQUEsZ0JBQUEsSUFBQSxNQUFBOzs7TUFHQSxVQUFBLFNBQUEsSUFBQTtRQUNBLElBQUEsV0FBQSxHQUFBOztRQUVBLElBQUEsS0FBQSxJQUFBLFNBQUE7UUFDQSxJQUFBLFVBQUE7O1FBRUEsT0FBQSxHQUFBLE1BQUEsUUFBQTtXQUNBLEdBQUEsZUFBQSxTQUFBLFFBQUE7WUFDQSxHQUFBLE1BQUE7ZUFDQSxhQUFBO2VBQ0EsUUFBQTtlQUNBLEdBQUEsZUFBQSxTQUFBLFdBQUE7Z0JBQ0EsU0FBQTs7Z0JBRUEsT0FBQSxPQUFBLElBQUEsUUFBQSxPQUFBLFVBQUE7Ozs7OztNQU1BLEtBQUE7OztJQUdBLE9BQUE7OztBQy9DQSxRQUFBLE9BQUE7R0FDQSxXQUFBLDZJQUFBLFVBQUEsUUFBQSxRQUFBLE1BQUEsUUFBQSxNQUFBOzs0Q0FFQSxRQUFBLGNBQUEsV0FBQSxVQUFBLFdBQUE7O0lBRUEsSUFBQSxtQkFBQTs7O0lBR0EsaUJBQUEsZUFBQTtJQUNBLGlCQUFBLGVBQUE7SUFDQSxpQkFBQSxlQUFBO0lBQ0EsaUJBQUEsZUFBQTtJQUNBLGlCQUFBLGVBQUE7SUFDQSxpQkFBQSxlQUFBO0lBQ0EsaUJBQUEsZUFBQTtJQUNBLGlCQUFBLGVBQUE7Ozs7OztJQU1BLGlCQUFBLGFBQUE7SUFDQSxpQkFBQSxlQUFBLFVBQUE7O01BRUEsSUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLGlCQUFBLFVBQUEsT0FBQSxJQUFBO1FBQ0EsSUFBQSxVQUFBLGlCQUFBLFVBQUEsR0FBQTtRQUNBLElBQUEsVUFBQSxpQkFBQSxVQUFBLEdBQUE7UUFDQSxpQkFBQSxXQUFBLEtBQUEsaUJBQUEsT0FBQSxhQUFBLFFBQUE7Ozs7SUFJQSxpQkFBQTs7O0FDL0JBLFFBQUEsT0FBQTtHQUNBLFdBQUEsNE5BQUEsU0FBQSxPQUFBLE9BQUEsWUFBQSxXQUFBO29DQUNBLE1BQUEsWUFBQSxXQUFBOztvQ0FFQSxZQUFBLE1BQUEsUUFBQSxNQUFBO29DQUNBLEtBQUEsUUFBQSxVQUFBLFFBQUE7O0lBRUEsUUFBQSxJQUFBOztJQUVBLElBQUEsWUFBQTs7OztJQUlBLFVBQUEsWUFBQTtJQUNBLFVBQUEsWUFBQTtJQUNBLFVBQUEsWUFBQTtJQUNBLFVBQUEsWUFBQTtJQUNBLFVBQUEsWUFBQTtJQUNBLFVBQUEsWUFBQTtJQUNBLFVBQUEsWUFBQTtJQUNBLFVBQUEsWUFBQTs7SUFFQSxHQUFBLFVBQUEsS0FBQSxJQUFBLGFBQUEsTUFBQTtNQUNBLFVBQUEsV0FBQSxVQUFBLE1BQUEsV0FBQSxVQUFBLEtBQUEsSUFBQSxVQUFBO01BQ0EsVUFBQSxNQUFBLFVBQUEsUUFBQTtNQUNBLFVBQUEsVUFBQSxVQUFBLE1BQUEsUUFBQSxVQUFBO01BQ0EsVUFBQSxvQkFBQSxVQUFBLE1BQUEsUUFBQSxVQUFBO01BQ0EsVUFBQSxzQkFBQSxVQUFBLE1BQUEsVUFBQSxVQUFBO01BQ0EsVUFBQSxnQkFBQSxVQUFBLE1BQUEsVUFBQSxVQUFBOztRQUVBO01BQ0EsVUFBQSxTQUFBO01BQ0EsVUFBQSxNQUFBO01BQ0EsVUFBQSxVQUFBOzs7Ozs7SUFNQSxVQUFBLGdCQUFBO0lBQ0EsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBLGdCQUFBO0lBQ0EsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBLGdCQUFBO0lBQ0EsVUFBQSxlQUFBO0lBQ0EsVUFBQSxnQkFBQTs7O0lBR0EsVUFBQSxnQkFBQTtNQUNBLFlBQUE7TUFDQSxRQUFBO01BQ0EsVUFBQTtNQUNBLFFBQUE7TUFDQSxRQUFBOzs7OztJQUtBLFVBQUEsaUJBQUEsVUFBQTs7TUFFQSxJQUFBLFdBQUEsT0FBQSxLQUFBLFVBQUEsZUFBQTtNQUNBLElBQUEsTUFBQTtNQUNBLElBQUEsSUFBQSxFQUFBLEVBQUEsRUFBQSxTQUFBLElBQUE7UUFDQSxNQUFBLE1BQUEsVUFBQSxjQUFBOzs7TUFHQSxVQUFBLHFCQUFBLElBQUE7O01BRUEsUUFBQSxJQUFBLFVBQUE7O01BRUEsVUFBQSxnQkFBQSxFQUFBLEtBQUEsVUFBQSxvQkFBQSxNQUFBLFVBQUE7Ozs7O0lBS0EsVUFBQSxpQkFBQSxTQUFBLEtBQUE7TUFDQSxHQUFBO01BQ0E7TUFDQSxJQUFBLEtBQUE7TUFDQSxJQUFBLElBQUEsRUFBQSxFQUFBLEVBQUEsS0FBQSxPQUFBLElBQUE7UUFDQSxNQUFBLE1BQUEsS0FBQSxHQUFBOztNQUVBLE9BQUEsSUFBQSxLQUFBOzs7Ozs7SUFNQSxXQUFBLENBQUEsY0FBQSxhQUFBLGtCQUFBLG1CQUFBLEtBQUEsVUFBQSxjQUFBO01BQ0EsVUFBQSxjQUFBLGFBQUE7TUFDQSxVQUFBLGNBQUEsYUFBQTtNQUNBLFVBQUEsY0FBQSxhQUFBO01BQ0EsVUFBQSxxQkFBQSxhQUFBOzs7O0lBSUEsVUFBQSxXQUFBLFNBQUEsT0FBQTtNQUNBLEdBQUEsU0FBQSxLQUFBOzs7Ozs7Ozs7SUFTQSxVQUFBLGNBQUEsU0FBQSxJQUFBO01BQ0EsSUFBQSxnQkFBQSxDQUFBLFNBQUEsU0FBQSxTQUFBLFVBQUEsT0FBQTtNQUNBLFVBQUEsS0FBQTs7VUFFQSxhQUFBO1VBQ0EsUUFBQSxRQUFBLFFBQUEsU0FBQTtVQUNBLGFBQUE7VUFDQSxxQkFBQTtVQUNBLFlBQUE7Ozs7OztJQU1BLFVBQUEsYUFBQSxTQUFBLEtBQUE7O01BRUEsUUFBQSxJQUFBLFVBQUE7TUFDQSxPQUFBLFVBQUE7Ozs7SUFJQSxVQUFBLFdBQUEsU0FBQSxPQUFBO01BQ0EsVUFBQSxXQUFBO01BQ0EsSUFBQSxPQUFBO01BQ0EsS0FBQSxJQUFBLElBQUEsR0FBQSxJQUFBLE1BQUEsUUFBQSxLQUFBO1FBQ0EsS0FBQSxLQUFBLE1BQUE7O01BRUEsUUFBQSxJQUFBO01BQ0EsT0FBQTs7O0lBR0EsVUFBQSxXQUFBLFNBQUEsT0FBQTtNQUNBLFFBQUEsSUFBQSxVQUFBLEtBQUE7Ozs7Ozs7Ozs7SUFVQSxVQUFBLGFBQUEsU0FBQSxNQUFBLE9BQUE7TUFDQSxRQUFBLFFBQUEsT0FBQSxVQUFBLFVBQUEsT0FBQTtRQUNBLElBQUEsYUFBQSxJQUFBO1FBQ0EsV0FBQSxTQUFBLFVBQUEsT0FBQTtVQUNBLElBQUEsTUFBQSxNQUFBLE9BQUE7VUFDQSxVQUFBLGFBQUEsU0FBQTs7UUFFQSxXQUFBLGNBQUEsU0FBQTs7Ozs7O0lBTUEsVUFBQSxvQkFBQSxTQUFBLEdBQUEsWUFBQSxJQUFBOztNQUVBLElBQUEsVUFBQSxVQUFBO1NBQ0EsTUFBQSxVQUFBO1NBQ0EsWUFBQSxVQUFBO1NBQ0EsWUFBQTtTQUNBLEdBQUEsVUFBQTtTQUNBLE9BQUEsVUFBQTtNQUNBLFVBQUEsS0FBQSxTQUFBLEtBQUEsV0FBQTtRQUNBLEdBQUEsVUFBQSxZQUFBLFlBQUEsS0FBQTtVQUNBLE9BQUEsR0FBQTs7Ozs7OztJQU9BLFVBQUEsY0FBQSxTQUFBLFlBQUEsSUFBQTs7TUFFQSxHQUFBLGVBQUEsVUFBQSxJQUFBO1FBQ0EsYUFBQSxVQUFBLE9BQUEsU0FBQSxJQUFBLE1BQUEsVUFBQSxRQUFBLFNBQUEsSUFBQTtRQUNBLE9BQUE7WUFDQTtRQUNBLE9BQUE7Ozs7OztJQU1BLFVBQUEsUUFBQSxTQUFBLFNBQUE7O01BRUEsVUFBQSxPQUFBLFNBQUEsU0FBQSxLQUFBLEtBQUE7UUFDQSxVQUFBLFNBQUE7UUFDQSxVQUFBLFVBQUEsU0FBQTtRQUNBLFVBQUEsVUFBQTtRQUNBLFVBQUEsVUFBQTtRQUNBLFVBQUEsU0FBQTtTQUNBLEtBQUEsVUFBQTs7O1FBR0EsVUFBQSxLQUFBLHdCQUFBLFNBQUEsSUFBQSxTQUFBLElBQUEsVUFBQTs7Ozs7Ozs7TUFRQSxVQUFBLE9BQUEsV0FBQSxTQUFBLEtBQUEsVUFBQSxLQUFBLFNBQUEsS0FBQTtRQUNBLEdBQUEsQ0FBQSxLQUFBLE1BQUE7VUFDQSxVQUFBLE9BQUEsY0FBQSxTQUFBLEtBQUEsSUFBQTthQUNBO1VBQ0EsVUFBQSxPQUFBLGNBQUEsU0FBQTthQUNBLElBQUEsS0FBQSxPQUFBOzs7Ozs7TUFNQSxVQUFBLE1BQUEsUUFBQSxVQUFBLEtBQUEsTUFBQTtTQUNBLElBQUEsVUFBQSxRQUFBLEtBQUEsUUFBQSxRQUFBOztNQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBLHVCQUFBLFNBQUE7U0FDQSxPQUFBLElBQUEsU0FBQTs7Ozs7O0lBTUEsVUFBQSxlQUFBLFNBQUEsUUFBQSxRQUFBO01BQ0EsVUFBQSxPQUFBLGdCQUFBLFFBQUEsU0FBQSxLQUFBO1FBQ0EsVUFBQSxVQUFBLGFBQUE7UUFDQSxVQUFBLFVBQUE7UUFDQSxVQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsZUFBQSxXQUFBO01BQ0EsSUFBQSxZQUFBLFVBQUEsZUFBQSxPQUFBO01BQ0EsVUFBQSxlQUFBLEtBQUEsQ0FBQSxLQUFBLFdBQUE7OztJQUdBLFVBQUEsZUFBQSxXQUFBO01BQ0EsSUFBQSxXQUFBLFVBQUEsZUFBQSxPQUFBO01BQ0EsVUFBQSxlQUFBLE9BQUE7Ozs7O0lBS0EsVUFBQSxjQUFBLFNBQUEsU0FBQSxRQUFBOzs7TUFHQSxJQUFBLGlCQUFBOztNQUVBLEdBQUEsVUFBQSxTQUFBLGFBQUEsSUFBQTtRQUNBLFFBQUEsSUFBQSxVQUFBLFNBQUE7UUFDQSxpQkFBQTtVQUNBLFVBQUEsVUFBQSxTQUFBLFNBQUEsUUFBQTtVQUNBLFVBQUEsS0FBQSxRQUFBLFVBQUEsU0FBQSxTQUFBLFFBQUE7VUFDQSxVQUFBLFVBQUEsU0FBQSxTQUFBLFFBQUE7VUFDQSxVQUFBLFVBQUEsU0FBQSxTQUFBLFFBQUE7VUFDQSxVQUFBLFVBQUEsU0FBQSxTQUFBLFFBQUEsU0FBQSxTQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQTtVQUNBLFVBQUEsVUFBQSxTQUFBLFNBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxVQUFBLFVBQUEsU0FBQSxTQUFBLFFBQUEsU0FBQSxTQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BeUJBLFVBQUEsT0FBQSxJQUFBLEtBQUE7VUFDQSxnQkFBQSxVQUFBO1VBQ0EsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUE7VUFDQSxnQkFBQSxVQUFBOztVQUVBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBLFVBQUE7VUFDQSxnQkFBQSxVQUFBO1VBQ0EsZ0JBQUE7VUFDQSxnQkFBQSxVQUFBLFNBQUE7VUFDQSxnQkFBQTtVQUNBLGdCQUFBLFNBQUE7VUFDQSxnQkFBQSxVQUFBLFNBQUE7VUFDQSxnQkFBQSxVQUFBLFNBQUE7VUFDQSxnQkFBQSxVQUFBO1dBQ0EsS0FBQSxTQUFBLE1BQUE7O1VBRUEsSUFBQSxVQUFBOztVQUVBLEdBQUEsS0FBQSxRQUFBLFVBQUEsU0FBQSxTQUFBLEdBQUE7WUFDQSxXQUFBLFVBQUEsU0FBQTtlQUNBO1lBQ0EsV0FBQSxLQUFBLFFBQUEsVUFBQSxTQUFBOzs7O1VBSUEsVUFBQSxPQUFBLGNBQUEsTUFBQSxPQUFBLE9BQUEsQ0FBQSxPQUFBLFNBQUEsTUFBQTs7O1VBR0EsVUFBQSxNQUFBLFFBQUEsVUFBQSxLQUFBLE1BQUE7YUFDQSxJQUFBLFVBQUEsUUFBQSxLQUFBLE9BQUEsUUFBQTs7VUFFQSxVQUFBLE1BQUEsUUFBQSxVQUFBLEtBQUEsTUFBQSxzQkFBQSxNQUFBO2FBQ0EsT0FBQSxJQUFBLFNBQUE7OztVQUdBLEdBQUEsbUJBQUEsR0FBQTs7WUFFQSxVQUFBLE9BQUEsU0FBQSxlQUFBO3VCQUNBLE1BQUEsTUFBQTt1QkFDQSxPQUFBLElBQUEsU0FBQTs7WUFFQSxVQUFBLE9BQUEsU0FBQSxlQUFBO2VBQ0EsTUFBQSxRQUFBLElBQUE7Ozs7VUFJQSxHQUFBLFVBQUEsU0FBQSxTQUFBLEtBQUE7WUFDQSxLQUFBLElBQUEsUUFBQSxHQUFBLFFBQUEsVUFBQSxTQUFBLEtBQUEsUUFBQSxFQUFBLE9BQUE7Y0FDQSxVQUFBLEtBQUEsU0FBQSxVQUFBLFNBQUEsS0FBQSxPQUFBO2lCQUNBLE1BQUEsTUFBQSxPQUFBLE9BQUEsSUFBQSxTQUFBOzs7OztVQUtBLFVBQUEsS0FBQSxlQUFBLE1BQUEsTUFBQSxVQUFBOzs7O1VBSUEsVUFBQSxXQUFBO1lBQ0EsTUFBQTs7Ozs7OztJQU9BLFVBQUEsY0FBQSxTQUFBLFdBQUE7TUFDQSxHQUFBLFVBQUEsTUFBQSxZQUFBLFVBQUEsSUFBQSxZQUFBO1FBQ0EsT0FBQTtXQUNBO1FBQ0EsT0FBQTs7Ozs7O0lBTUEsVUFBQSxhQUFBLFNBQUEsV0FBQTs7O01BR0EsVUFBQSxNQUFBLFdBQUEsWUFBQSxVQUFBLEtBQUEsVUFBQSxNQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFlBQUEsTUFBQTtXQUNBLElBQUEsS0FBQSxLQUFBLFNBQUEsUUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxZQUFBLE1BQUEsc0JBQUEsVUFBQTtXQUNBLE9BQUEsSUFBQSxTQUFBOzs7O01BSUEsVUFBQSxNQUFBLFdBQUEsVUFBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsVUFBQSxLQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxTQUFBLFFBQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsVUFBQSxLQUFBLE1BQUEsdUJBQUE7V0FDQSxPQUFBLElBQUEsU0FBQTs7Ozs7O0lBTUEsVUFBQSxlQUFBLFNBQUEsV0FBQTs7O01BR0EsVUFBQSxNQUFBLFdBQUEsWUFBQSxVQUFBLEtBQUEsVUFBQSxNQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFlBQUEsTUFBQTtXQUNBLElBQUEsS0FBQSxLQUFBLFNBQUEsUUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxZQUFBLE1BQUEsc0JBQUEsVUFBQSxLQUFBOzs7O01BSUEsVUFBQSxNQUFBLFdBQUEsVUFBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsVUFBQSxLQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxVQUFBLFFBQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsVUFBQSxLQUFBLE1BQUEsdUJBQUEsWUFBQTs7Ozs7Ozs7SUFRQSxVQUFBLFNBQUEsU0FBQSxNQUFBOztNQUVBLEdBQUEsTUFBQSxhQUFBLGFBQUEsTUFBQSxVQUFBLFVBQUEsUUFBQSxVQUFBO1FBQ0EsVUFBQSxlQUFBOztNQUVBLFVBQUEsT0FBQSxZQUFBLE1BQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxLQUFBLFNBQUEsTUFBQTtRQUNBLFVBQUEsa0JBQUEsTUFBQSxNQUFBLEtBQUEsSUFBQSxNQUFBOzs7UUFHQSxVQUFBLE1BQUEsV0FBQSxNQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxNQUFBLEtBQUEsTUFBQTtXQUNBLElBQUEsS0FBQSxLQUFBLFFBQUEsUUFBQTtRQUNBLFVBQUEsTUFBQSxRQUFBLE1BQUEsS0FBQSxNQUFBLHVCQUFBLE1BQUE7V0FDQSxPQUFBLElBQUEsU0FBQTs7Ozs7O0lBTUEsVUFBQSxlQUFBLFNBQUEsTUFBQTtNQUNBLFVBQUEsT0FBQSxXQUFBLE1BQUEsS0FBQSxVQUFBOztNQUVBLFVBQUEsTUFBQSxXQUFBLE1BQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxNQUFBOzs7UUFHQSxVQUFBLE1BQUEsUUFBQSxNQUFBLEtBQUEsTUFBQTtXQUNBLElBQUEsS0FBQSxLQUFBLFFBQUEsUUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxNQUFBLEtBQUEsTUFBQSx1QkFBQSxNQUFBLEtBQUE7Ozs7TUFJQSxVQUFBLGtCQUFBLE1BQUEsTUFBQSxLQUFBLE9BQUEsU0FBQSxNQUFBO1lBQ0EsSUFBQSxPQUFBO1lBQ0EsUUFBQSxJQUFBLFVBQUE7aUJBQ0E7WUFDQSxRQUFBLElBQUE7Ozs7O0lBS0EsVUFBQSxXQUFBLFNBQUEsTUFBQTtNQUNBLEdBQUEsTUFBQSxXQUFBLGFBQUEsTUFBQSxRQUFBLFVBQUEsUUFBQSxVQUFBO1FBQ0EsVUFBQSxhQUFBOztNQUVBLFVBQUEsT0FBQSxjQUFBLE1BQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxLQUFBLFNBQUEsTUFBQTtRQUNBLFVBQUEsb0JBQUEsTUFBQSxNQUFBLEtBQUEsSUFBQSxNQUFBOzs7O0lBSUEsVUFBQSxpQkFBQSxTQUFBLE1BQUE7TUFDQSxVQUFBLE9BQUEsYUFBQSxNQUFBLEtBQUEsVUFBQTtNQUNBLFVBQUEsb0JBQUEsTUFBQSxNQUFBLEtBQUEsT0FBQSxTQUFBLE1BQUE7WUFDQSxJQUFBLE9BQUE7WUFDQSxRQUFBLElBQUEsVUFBQTtpQkFDQTtZQUNBLFFBQUEsSUFBQTs7Ozs7SUFLQSxVQUFBLGNBQUEsU0FBQSxNQUFBO01BQ0EsVUFBQSxPQUFBLE9BQUEsTUFBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLEtBQUEsU0FBQSxNQUFBO1FBQ0EsVUFBQSxjQUFBLE1BQUEsTUFBQSxLQUFBLElBQUEsTUFBQSxRQUFBLFVBQUE7Ozs7SUFJQSxVQUFBLGdCQUFBLFNBQUEsTUFBQTtNQUNBLFVBQUEsT0FBQSxTQUFBLE1BQUEsS0FBQSxVQUFBO01BQ0EsVUFBQSxjQUFBLE1BQUEsTUFBQSxLQUFBLE9BQUEsU0FBQSxNQUFBO1lBQ0EsSUFBQSxPQUFBO1lBQ0EsUUFBQSxJQUFBLFVBQUE7aUJBQ0E7WUFDQSxRQUFBLElBQUE7Ozs7Ozs7O0FBUUEsU0FBQSxhQUFBLFFBQUEsUUFBQTtFQUNBLE9BQUEsS0FBQSxTQUFBLFVBQUEsTUFBQTtJQUNBLE9BQUEsSUFBQSxLQUFBLE9BQUEsVUFBQSxPQUFBO01BQ0EsSUFBQSxDQUFBLE9BQUE7UUFDQSxPQUFBOztXQUVBLElBQUEsT0FBQSxhQUFBLGVBQUEsUUFBQSxPQUFBO1FBQ0EsUUFBQSxNQUFBOzs7Ozs7QUNqZ0JBLFFBQUEsT0FBQTs7R0FFQSxRQUFBLCtEQUFBLFVBQUEsaUJBQUEsZ0JBQUEsYUFBQTtJQUNBLElBQUEsTUFBQSxJQUFBLFNBQUEsY0FBQTtJQUNBLElBQUEsU0FBQSxnQkFBQTtJQUNBLElBQUEsWUFBQSxlQUFBO0lBQ0EsSUFBQSxXQUFBOztJQUVBLElBQUEsU0FBQTs7TUFFQSxRQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsZUFBQSxJQUFBLGFBQUEsUUFBQSxRQUFBOzs7O01BSUEsU0FBQSxVQUFBLE1BQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsZUFBQTs7OztNQUlBLFdBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxPQUFBLFFBQUE7OztNQUdBLFVBQUEsVUFBQSxPQUFBO1FBQ0EsT0FBQSxJQUFBLE1BQUE7O01BRUEsaUJBQUEsWUFBQTs7O01BR0EsTUFBQSxVQUFBLFVBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFlBQUEsUUFBQTtRQUNBLE9BQUEsZUFBQTs7O01BR0EsTUFBQSxVQUFBLFlBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsZ0JBQUE7Ozs7TUFJQSxhQUFBLFVBQUEsWUFBQTtRQUNBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTs7O01BR0EsZUFBQSxVQUFBLFdBQUE7UUFDQSxPQUFBLElBQUEsU0FBQSxjQUFBLFlBQUE7OztNQUdBLGdCQUFBLFVBQUEsWUFBQTtRQUNBLE9BQUEsZUFBQSxJQUFBLGFBQUEsUUFBQSxRQUFBLFlBQUEsYUFBQTs7O01BR0EsZUFBQSxVQUFBLFlBQUE7OztNQUdBLFVBQUEsVUFBQSxZQUFBO1FBQ0EsT0FBQSxlQUFBLE9BQUEsWUFBQTs7OztNQUlBLFdBQUEsVUFBQSxTQUFBO1FBQ0EsSUFBQSxPQUFBLElBQUEsTUFBQSxVQUFBO1FBQ0EsT0FBQSxlQUFBOzs7O01BSUEsVUFBQSxVQUFBLFNBQUE7UUFDQSxPQUFBLGVBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7TUFJQSxZQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUE7O01BRUEsZUFBQSxVQUFBLFNBQUE7UUFDQSxPQUFBLElBQUEsTUFBQSxVQUFBOzs7TUFHQSxjQUFBLFVBQUEsU0FBQSxTQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsVUFBQTs7OztNQUlBLGlCQUFBLFVBQUEsU0FBQSxTQUFBOztRQUVBLE9BQUEsZUFBQSxJQUFBLE1BQUEsVUFBQSxjQUFBLFVBQUE7Ozs7TUFJQSxZQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUE7VUFDQSxLQUFBLElBQUEsTUFBQSxVQUFBO1VBQ0EsT0FBQSxlQUFBLElBQUEsTUFBQSxVQUFBOzs7OztNQUtBLGNBQUEsVUFBQSxTQUFBO1FBQ0EsT0FBQTtVQUNBLEtBQUEsSUFBQSxNQUFBLFVBQUE7VUFDQSxPQUFBLGVBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7O01BS0EsY0FBQSxVQUFBLFNBQUE7UUFDQSxPQUFBO1VBQ0EsS0FBQSxJQUFBLE1BQUEsVUFBQTtVQUNBLEtBQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7TUFJQSxhQUFBLFVBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxNQUFBLFVBQUEsWUFBQSxNQUFBLEtBQUEsSUFBQSxTQUFBO1FBQ0EsT0FBQSxnQkFBQSxJQUFBLE1BQUEsVUFBQSxZQUFBLE1BQUE7OztNQUdBLFlBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxZQUFBLE1BQUEsS0FBQSxPQUFBLFVBQUEsT0FBQTtVQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsSUFBQSxVQUFBO2lCQUNBO1lBQ0EsUUFBQSxJQUFBOztRQUVBLE9BQUEsSUFBQSxNQUFBLFVBQUE7OztNQUdBLGVBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsS0FBQSxJQUFBLFNBQUE7UUFDQSxPQUFBLGdCQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQTs7O01BR0EsY0FBQSxVQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxLQUFBLE9BQUEsVUFBQSxPQUFBO1VBQ0EsSUFBQSxPQUFBO1lBQ0EsUUFBQSxJQUFBLFVBQUE7aUJBQ0E7WUFDQSxRQUFBLElBQUE7O1FBRUEsT0FBQSxJQUFBLE1BQUEsVUFBQTs7O01BR0EsUUFBQSxVQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxXQUFBLE1BQUEsS0FBQSxJQUFBLFNBQUE7UUFDQSxnQkFBQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsVUFBQSxVQUFBLEtBQUEsVUFBQSxNQUFBO1VBQ0EsSUFBQSxLQUFBLFVBQUEsUUFBQSxLQUFBLFVBQUEsV0FBQTtZQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxTQUFBLElBQUE7aUJBQ0E7WUFDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsU0FBQSxJQUFBLEtBQUEsU0FBQTs7OztRQUlBLE9BQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUE7OztNQUdBLFVBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsV0FBQSxNQUFBLEtBQUEsT0FBQSxVQUFBLE9BQUE7VUFDQSxJQUFBLE9BQUE7WUFDQSxRQUFBLElBQUEsVUFBQTtpQkFDQTtZQUNBLFFBQUEsSUFBQTtZQUNBLGdCQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxVQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7Y0FDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsU0FBQSxJQUFBLEtBQUEsU0FBQTs7O1FBR0EsT0FBQSxJQUFBLE1BQUEsVUFBQTs7O01BR0EsVUFBQSxVQUFBLFNBQUE7UUFDQSxPQUFBO1VBQ0EsS0FBQSxJQUFBLE1BQUEsU0FBQSxNQUFBO1VBQ0EsS0FBQSxnQkFBQSxJQUFBLE1BQUEsU0FBQSxNQUFBOzs7O01BSUEsWUFBQSxZQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxXQUFBLFlBQUE7OztNQUdBLGFBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxRQUFBLFFBQUE7Ozs7TUFJQSxLQUFBLGVBQUE7O01BRUEsS0FBQTtNQUNBLEtBQUE7OztJQUdBLE9BQUE7Ozs7QUNoTUEsUUFBQSxPQUFBO0dBQ0EsV0FBQSx1S0FBQSxTQUFBLFFBQUEsWUFBQSxRQUFBLFNBQUE7O3NDQUVBLEtBQUEsTUFBQSxRQUFBLFNBQUEsT0FBQTs7c0NBRUEsUUFBQSxRQUFBLFVBQUE7O0lBRUEsUUFBQSxJQUFBOztJQUVBLElBQUEsY0FBQTs7O0lBR0EsWUFBQSxZQUFBO0lBQ0EsWUFBQSxZQUFBO0lBQ0EsWUFBQSxZQUFBO0lBQ0EsWUFBQSxZQUFBO0lBQ0EsWUFBQSxZQUFBO0lBQ0EsWUFBQSxZQUFBO0lBQ0EsWUFBQSxZQUFBO0lBQ0EsWUFBQSxZQUFBO0lBQ0EsWUFBQSxZQUFBOztJQUVBLFlBQUEsWUFBQTtJQUNBLFlBQUEsT0FBQTs7SUFFQSxZQUFBLFdBQUE7O0lBRUEsWUFBQSxXQUFBOzs7SUFHQSxZQUFBLGNBQUEsU0FBQSxJQUFBO01BQ0EsWUFBQSxPQUFBLFlBQUEsT0FBQSxVQUFBOzs7Ozs7SUFNQSxZQUFBLGVBQUEsVUFBQTtNQUNBLFlBQUEsU0FBQSxNQUFBLFNBQUEsVUFBQTtRQUNBLFlBQUEsU0FBQSxlQUFBLFNBQUEsU0FBQTtVQUNBLEdBQUEsU0FBQSxXQUFBLGFBQUE7WUFDQSxPQUFBLFdBQUE7WUFDQSxZQUFBLFNBQUEsSUFBQSxPQUFBLFNBQUEsVUFBQTtjQUNBLFFBQUEsSUFBQTs7aUJBRUE7Y0FDQSxRQUFBLElBQUE7Ozs7Ozs7O0lBUUEsWUFBQSxrQkFBQSxZQUFBOzs7SUFHQSxZQUFBLGNBQUEsU0FBQSxJQUFBO01BQ0EsT0FBQSxZQUFBLE9BQUEsVUFBQTs7Ozs7SUFLQSxZQUFBLGtCQUFBO0lBQ0EsWUFBQSxrQkFBQTtJQUNBLFlBQUEsa0JBQUE7SUFDQSxZQUFBLGtCQUFBOzs7Ozs7SUFNQSxZQUFBLG9CQUFBLFNBQUEsSUFBQTtNQUNBLFlBQUEsYUFBQSxZQUFBLEtBQUEsV0FBQTs7O0lBR0EsR0FBQSxLQUFBLElBQUEsVUFBQTtNQUNBLFlBQUEsa0JBQUEsS0FBQSxJQUFBLFVBQUE7OztJQUdBLFlBQUEsYUFBQSxTQUFBLE1BQUEsVUFBQTtNQUNBLFlBQUEsYUFBQSxVQUFBO01BQ0EsWUFBQSxLQUFBLFNBQUEsVUFBQTtTQUNBLE1BQUEsS0FBQSxJQUFBLFVBQUEsS0FBQSxPQUFBLElBQUEsU0FBQTs7Ozs7Ozs7SUFRQSxZQUFBLGFBQUEsU0FBQSxPQUFBO01BQ0EsUUFBQSxRQUFBLE9BQUEsVUFBQSxVQUFBLEdBQUE7UUFDQSxJQUFBLGFBQUEsSUFBQTtRQUNBLFdBQUEsU0FBQSxVQUFBLE9BQUE7VUFDQSxJQUFBLE1BQUEsTUFBQSxPQUFBO1VBQ0EsWUFBQSxhQUFBLEtBQUE7VUFDQSxZQUFBLE1BQUEsV0FBQSxLQUFBLElBQUEsVUFBQSxLQUFBLE9BQUEsQ0FBQSxTQUFBO1VBQ0EsT0FBQSxDQUFBLFFBQUEsUUFBQSxTQUFBLFNBQUEsVUFBQTs7UUFFQSxXQUFBLGNBQUEsU0FBQTs7Ozs7OztJQU9BLFlBQUEsY0FBQSxTQUFBLFNBQUE7TUFDQSxZQUFBLFFBQUEsVUFBQSxTQUFBOzs7TUFHQSxHQUFBLFlBQUEsYUFBQSxPQUFBO1FBQ0EsaUJBQUE7VUFDQSxVQUFBLFlBQUEsU0FBQSxRQUFBO1VBQ0EsTUFBQSxZQUFBLFNBQUEsUUFBQTtVQUNBLFNBQUEsWUFBQSxTQUFBLFFBQUE7VUFDQSxLQUFBLFlBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQTtVQUNBLEtBQUEsWUFBQSxTQUFBLFFBQUEsU0FBQSxTQUFBOzs7UUFHQSxZQUFBLFFBQUEsZUFBQTs7O01BR0EsWUFBQSxRQUFBLFFBQUEsS0FBQSxXQUFBO1FBQ0EsT0FBQSxDQUFBLFFBQUEsUUFBQSxTQUFBLFNBQUEsVUFBQTtRQUNBLEdBQUEsYUFBQSxVQUFBO1VBQ0EsT0FBQSxHQUFBOztTQUVBLE1BQUEsU0FBQSxPQUFBO1FBQ0EsT0FBQSxDQUFBLFFBQUEsb0JBQUEsU0FBQSxTQUFBLFVBQUE7Ozs7OztJQU1BLFlBQUEsYUFBQSxVQUFBOztNQUVBLFlBQUEsTUFBQSxXQUFBLEtBQUEsSUFBQSxVQUFBLEtBQUE7UUFDQTtVQUNBLGNBQUEsWUFBQSxRQUFBO1VBQ0EsY0FBQSxZQUFBLFFBQUE7Ozs7TUFJQSxZQUFBLE1BQUEsV0FBQSxLQUFBLElBQUEsVUFBQSxJQUFBLFFBQUEsT0FBQSxJQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUEsWUFBQSxnQkFBQSxZQUFBLE1BQUEsWUFBQSxnQkFBQTtRQUNBLFVBQUEsU0FBQTs7O01BR0EsT0FBQSxDQUFBLFFBQUEsUUFBQSxTQUFBLFNBQUEsVUFBQTs7Ozs7SUFLQSxZQUFBLFlBQUEsVUFBQTtNQUNBLFlBQUEsTUFBQSxXQUFBLEtBQUEsSUFBQSxVQUFBLEtBQUEsT0FBQSxDQUFBLGFBQUEsWUFBQSxRQUFBOztNQUVBLE9BQUEsQ0FBQSxRQUFBLFFBQUEsU0FBQSxTQUFBLFVBQUE7Ozs7SUFJQSxZQUFBLGdCQUFBLFVBQUE7O01BRUEsWUFBQSxRQUFBLFFBQUEsS0FBQSxVQUFBO1FBQ0EsT0FBQSxHQUFBOzs7Ozs7SUFNQSxZQUFBLGdCQUFBLFVBQUE7O01BRUEsWUFBQSxNQUFBLG1CQUFBLFlBQUEsUUFBQSxhQUFBLEtBQUEsU0FBQSxTQUFBLFVBQUE7UUFDQSxHQUFBLFNBQUEsVUFBQSxLQUFBO1VBQ0EsT0FBQSxZQUFBLFVBQUE7Y0FDQTtVQUNBLE9BQUEsWUFBQSxVQUFBOzs7Ozs7O0FDakxBLFFBQUEsT0FBQTtHQUNBLFFBQUEsdUVBQUEsVUFBQSxnQkFBQSxpQkFBQSxhQUFBLE9BQUE7SUFDQSxJQUFBLFdBQUEsSUFBQSxTQUFBLGNBQUE7SUFDQSxJQUFBLFFBQUEsZUFBQTs7SUFFQSxJQUFBLFFBQUE7TUFDQSxlQUFBLFlBQUE7UUFDQSxPQUFBLE1BQUE7VUFDQSxLQUFBO1VBQ0EsUUFBQTs7OztNQUlBLG1CQUFBLFlBQUE7UUFDQSxPQUFBLE1BQUE7VUFDQSxLQUFBO1VBQ0EsUUFBQTtXQUNBLEtBQUEsVUFBQSxNQUFBO1VBQ0EsT0FBQSxLQUFBOzs7O01BSUEsU0FBQSxTQUFBLElBQUE7UUFDQSxPQUFBLE1BQUEsV0FBQTs7Ozs7TUFLQSxxQkFBQSxTQUFBLFNBQUE7UUFDQSxPQUFBLGVBQUEsU0FBQSxhQUFBLGVBQUEsUUFBQTs7OztNQUlBLG1CQUFBLFNBQUEsU0FBQTtRQUNBLE9BQUEsU0FBQSxhQUFBLGVBQUEsUUFBQTs7OztNQUlBLFlBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxnQkFBQSxTQUFBLE1BQUE7OztNQUdBLGdCQUFBLFVBQUEsS0FBQTtRQUNBLElBQUEsUUFBQSxRQUFBLFFBQUEsSUFBQTtVQUNBLE9BQUEsTUFBQSxXQUFBLEtBQUE7Ozs7O01BS0EsWUFBQSxTQUFBLElBQUE7UUFDQSxPQUFBLFNBQUEsTUFBQSxJQUFBOzs7O01BSUEsWUFBQSxTQUFBLElBQUEsVUFBQTs7UUFFQSxJQUFBLE9BQUE7UUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUEsU0FBQSxJQUFBLHVCQUFBO1FBQ0EsSUFBQSxLQUFBLFNBQUEsU0FBQSxVQUFBO1VBQ0EsU0FBQSxTQUFBOztRQUVBLE9BQUE7Ozs7TUFJQSxtQkFBQSxTQUFBLE1BQUEsUUFBQSxRQUFBOztRQUVBLElBQUEsTUFBQSxJQUFBLFNBQUE7UUFDQSxJQUFBLGVBQUE7VUFDQSxPQUFBO1VBQ0EsYUFBQTtVQUNBLGFBQUE7V0FDQSxTQUFBLE9BQUE7VUFDQSxJQUFBLE9BQUE7WUFDQSxRQUFBLE1BQUE7Y0FDQSxLQUFBO2dCQUNBLFFBQUEsSUFBQTtnQkFDQTtjQUNBLEtBQUE7Z0JBQ0EsUUFBQSxJQUFBO2dCQUNBO2NBQ0E7Z0JBQ0EsUUFBQSxJQUFBLDRCQUFBOztpQkFFQTtZQUNBLFFBQUEsSUFBQTs7Ozs7TUFLQSxTQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsU0FBQSxNQUFBOzs7TUFHQSxTQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsU0FBQSxNQUFBLEtBQUEsTUFBQTs7O01BR0EsV0FBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLFNBQUEsTUFBQSxLQUFBLE1BQUE7Ozs7TUFJQSxXQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsU0FBQSxNQUFBLEtBQUEsTUFBQTs7O01BR0EsWUFBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLFNBQUEsTUFBQTs7O01BR0EsS0FBQTs7O0lBR0EsT0FBQTs7O0FDbEhBLFFBQUEsT0FBQTtHQUNBLFFBQUEscUJBQUEsVUFBQTs7Ozs7Ozs7Ozs7S0FXQSxPQUFBOztRQUVBLGVBQUEsVUFBQTs7WUFFQSxJQUFBLGFBQUE7OztZQUdBLElBQUEsZUFBQTs7Ozs7O1lBTUEsSUFBQSxnQkFBQTs7O2NBR0EsSUFBQSxNQUFBLElBQUEsT0FBQTtjQUNBLElBQUEsaUJBQUEsUUFBQTtjQUNBLGVBQUE7O2NBRUEsSUFBQSxpQkFBQSxJQUFBLE1BQUE7Y0FDQSxLQUFBLElBQUEsSUFBQSxHQUFBLEtBQUEsR0FBQSxLQUFBO2dCQUNBLGVBQUEsS0FBQSxXQUFBLE9BQUEsTUFBQTs7Z0JBRUEsTUFBQSxLQUFBLE1BQUEsTUFBQTs7Y0FFQSxJQUFBLFFBQUEsR0FBQSxNQUFBLElBQUEsTUFBQTs7Y0FFQSxJQUFBLEtBQUEsZUFBQSxLQUFBOztjQUVBLElBQUEsQ0FBQSxlQUFBO2dCQUNBLEtBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxLQUFBO2tCQUNBLGNBQUEsS0FBQSxLQUFBLE1BQUEsS0FBQSxXQUFBOztxQkFFQTs7Z0JBRUEsS0FBQSxJQUFBLElBQUEsS0FBQSxLQUFBLGNBQUEsT0FBQSxJQUFBLEtBQUE7a0JBQ0EsY0FBQSxLQUFBOztnQkFFQSxjQUFBOztjQUVBLEtBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxLQUFBO2dCQUNBLE1BQUEsV0FBQSxPQUFBLGNBQUE7O2NBRUEsR0FBQSxHQUFBLFVBQUEsSUFBQSxNQUFBLElBQUEsTUFBQTs7Y0FFQSxPQUFBOzs7O0lBSUEiLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWFpbiBtb2R1bGUgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICovXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ0FwcCcsIFtcbiAgICAnZmlyZWJhc2UnLFxuICAgICdhbmd1bGFyLW1kNScsIC8vIEVuY3J5cHQgZW1haWxcbiAgICAnbmdSb3V0ZScsXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ25nTWF0ZXJpYWwnLCAvLyBJbnRlcmZhY2VcbiAgICAnYW5ndWxhck1vbWVudCcsIC8vIFRpbWUgbWFuYWdlbWVudFxuICAgICdmbG93JywgLy8gSW1hZ2UgdXBsb2FkXG4gICAgJ3NsdWdpZmllcicsIC8vIENyZWF0ZSBTbHVnc1xuICAgICduZ0F1dG9jb21wbGV0ZScsIC8vIEdvb2dsZSBwbGFjZXNcbiAgICAnbmdUYWdzSW5wdXQnLCAvLyBUYWdzXG4gICAgJ2NnTm90aWZ5JywgLy8gTm90aWZpY2F0aW9uIC0gaHR0cHM6Ly9naXRodWIuY29tL2Nncm9zcy9hbmd1bGFyLW5vdGlmeVxuICAgICdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJywgLy8gVHJhbnNsYXRpb24gLSBodHRwczovL2FuZ3VsYXItdHJhbnNsYXRlLmdpdGh1Yi5pby9cbiAgICAnZmFjZWJvb2snLCAgICAgICAvLyAgRmFjZWJvb2sgLSBodHRwczovL2dpdGh1Yi5jb20vQ2l1bC9hbmd1bGFyLWZhY2Vib29rXG4gICAgJ2FuZ3VsYXItZmxleHNsaWRlcicsIC8vIEltYWdlIHNsaWRlciAtIGh0dHBzOi8vZ2l0aHViLmNvbS90aGVuaWtzby9hbmd1bGFyLWZsZXhzbGlkZXJcblxuICAgIC8vIEVtb3RpY29uIC0tIGh0dHA6Ly9taXN0aWMxMDAuZ2l0aHViLmlvL2FuZ3VsYXItc21pbGllcy9cbiAgICAnbmdTYW5pdGl6ZScsXG4gICAgJ3VpLmJvb3RzdHJhcCcsICAgLy8gIE9SIG1nY3JlYS5uZ1N0cmFwXG4gICAgJ2FuZ3VsYXItc21pbGllcycsXG5cbiAgICAnbmdDb29raWVzJywgICAgICAvLyAgY29va2llcyBzdHVmZlxuICAgICdub3RpZmljYXRpb24nLCAgIC8vICB3ZWIgbm90aWZpY2F0aW9uIC0gaHR0cHM6Ly9naXRodWIuY29tL25lb3ppcm8vYW5ndWxhci1ub3RpZmljYXRpb25cblxuICBdKVxuXG4gIC5jb25maWcoZnVuY3Rpb24gKCRtZFRoZW1pbmdQcm92aWRlcikge1xuICAgICRtZFRoZW1pbmdQcm92aWRlci5kZWZpbmVQYWxldHRlKCdzbGFjaycsIHtcbiAgICAgICc1MCc6ICdmZmViZWUnLFxuICAgICAgJzEwMCc6ICdmZmNkZDInLFxuICAgICAgJzIwMCc6ICdlZjlhOWEnLFxuICAgICAgJzMwMCc6ICdlNTczNzMnLFxuICAgICAgJzQwMCc6ICdlZjUzNTAnLFxuICAgICAgJzUwMCc6ICc0RDM5NEInLCAvLyBwcmltYXJ5IGNvbG91clxuICAgICAgJzYwMCc6ICdlNTM5MzUnLFxuICAgICAgJzcwMCc6ICdkMzJmMmYnLFxuICAgICAgJzgwMCc6ICdjNjI4MjgnLFxuICAgICAgJzkwMCc6ICdiNzFjMWMnLFxuICAgICAgJ0ExMDAnOiAnZmY4YTgwJyxcbiAgICAgICdBMjAwJzogJ2ZmNTI1MicsXG4gICAgICAnQTQwMCc6ICdmZjE3NDQnLFxuICAgICAgJ0E3MDAnOiAnZDUwMDAwJyxcbiAgICAgICdjb250cmFzdERlZmF1bHRDb2xvcic6ICdsaWdodCcsIC8vIHdoZXRoZXIsIGJ5IGRlZmF1bHQsIHRleHQgKGNvbnRyYXN0KVxuICAgICAgLy8gb24gdGhpcyBwYWxldHRlIHNob3VsZCBiZSBkYXJrIG9yIGxpZ2h0XG4gICAgICAnY29udHJhc3REYXJrQ29sb3JzJzogWyc1MCcsICcxMDAnLCAvLyBodWVzIHdoaWNoIGNvbnRyYXN0IHNob3VsZCBiZSAnZGFyaycgYnkgZGVmYXVsdFxuICAgICAgICAnMjAwJywgJzMwMCcsICc0MDAnLCAnQTEwMCddLFxuICAgICAgJ2NvbnRyYXN0TGlnaHRDb2xvcnMnOiB1bmRlZmluZWQgLy8gY291bGQgYWxzbyBzcGVjaWZ5IHRoaXMgaWYgZGVmYXVsdCB3YXMgJ2RhcmsnXG4gICAgfSlcbiAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2RlZmF1bHQnKVxuICAgICAgLnByaW1hcnlQYWxldHRlKCdzbGFjaycpXG4gIH0pXG5cbiAgLy8gRmFjZWJvb2sgQ29uZmlnXG4gIC5jb25maWcoXG4gICAgZnVuY3Rpb24gKEZhY2Vib29rUHJvdmlkZXIpIHtcbiAgICAgIHZhciBteUFwcElkID0gJzkzMTM3NjEyMDI2Mzg1NidcbiAgICAgIEZhY2Vib29rUHJvdmlkZXIuc2V0QXBwSWQobXlBcHBJZClcbiAgICAgIEZhY2Vib29rUHJvdmlkZXIuaW5pdChteUFwcElkKVxuICAgIH1cbiAgKVxuXG4gIC8vU2VjdXJpdHkgZm9yIFRyYW5zbGF0ZVxuICAuY29uZmlnKGZ1bmN0aW9uICgkdHJhbnNsYXRlUHJvdmlkZXIpIHtcbiAgICAkdHJhbnNsYXRlUHJvdmlkZXIucHJlZmVycmVkTGFuZ3VhZ2UoJ0VuZycpO1xuICAgIC8vIEVuYWJsZSBlc2NhcGluZyBvZiBIVE1MXG4gICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZVNhbml0aXplVmFsdWVTdHJhdGVneSgnZXNjYXBlJyk7XG4gIH0pXG5cblxuXG4gIC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsJGNvbnRyb2xsZXJQcm92aWRlcikge1xuXG4gICAgYXBwLnJlZ2lzdGVyQ3RybCA9ICRjb250cm9sbGVyUHJvdmlkZXIucmVnaXN0ZXI7XG5cbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdob21lJywge1xuICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwgYXMgIGRhc2hib2FyZEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdob21lL2hvbWUuaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIHJlcXVpcmVOb0F1dGg6IGZ1bmN0aW9uICgkc3RhdGUsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkJylcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICdsb2dpbi1mb3JtQGhvbWUnOiB7XG4gICAgICAgICAgICAvL2NvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL2xvZ2luLWZvcm0uaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9KVxuXG5cbiAgICAgIC8vVHJlbmRpbmdcbiAgICAgIC5zdGF0ZSgndHJlbmRpbmcnLCB7XG4gICAgICAgIHVybDogJy9leHBsb3JlL3RyZW5kaW5nJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgLy9jb250cm9sbGVyOiAnSG9tZUN0cmwgYXMgIGhvbWVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnaG9tZS90cmVuZC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgZmVlZDogZnVuY3Rpb24gKFRvcGljcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MubGF0ZXN0RmVlZCgpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9KVxuXG5cbiAgICAgIC8vIENhdGVnb3J5IExhbmRpbmdcbiAgICAgIC5zdGF0ZSgnY2F0ZWdvcnknLCB7XG4gICAgICAgIHVybDogJy9jYXRlZ29yeS97U2x1Z30nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ2F0ZUN0cmwgYXMgY2F0ZUN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdjYXRlZ29yeS9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgLy8gR2V0dGluZyBDYXRlZ29yeSBkZXRhaWxzXG4gICAgICAgICAgICAgIGNhdGVOYW1lOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBDYXRlZ29yeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBDYXRlZ29yeS5nZXROYW1lKCRzdGF0ZVBhcmFtcy5TbHVnKS4kbG9hZGVkKClcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgLy8gR2V0dGluZyBsaXN0IG9mIGNhdGVnb3J5IHRvcGljcyBoZXJlXG4gICAgICAgICAgICAgIGNhdGVUb3BpY3M6IGZ1bmN0aW9uICgkc3RhdGVQYXJhbXMsIFRvcGljcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MubGlzdCgkc3RhdGVQYXJhbXMuU2x1ZylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgIH0pXG5cblxuICAgICAgLy8gUGxhY2VzIGxhbmRpbmcgcGFnZVxuICAgICAgLnN0YXRlKCdwbGFjZXMnLCB7XG4gICAgICAgIHVybDogJy9wbGFjZXMve3BsYWNlX3NsdWd9L3twbGFjZV9pZH0nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICdoZWFkZXJAcGxhY2VzJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1BsYWNlc0N0cmwgYXMgcGxhY2VzQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BsYWNlL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICBwbGFjZUxhbmRpbmc6IGZ1bmN0aW9uIChQbGFjZXMsIFRvcGljcywgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VBcnJheSkge1xuICAgICAgICAgICAgICAgIHZhciBkYXRhXG4gICAgICAgICAgICAgICAgUGxhY2VzLmdldFBsYWNlUmVmKCRzdGF0ZVBhcmFtcy5wbGFjZV9pZCkub24oJ3ZhbHVlJywgZnVuY3Rpb24gKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICBkYXRhID0gc25hcHNob3QudmFsKClcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNuYXBzaG90LnZhbCgpKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgICAgICAgICAgLy8gcmV0dXJuICAkZmlyZWJhc2VBcnJheShQbGFjZXMuZ2V0UGxhY2VSZWYoJHN0YXRlUGFyYW1zLnBsYWNlX2lkKSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuXG4gICAgICAvLyBUYWcgbGFuZGluZyBwYWdlXG4gICAgICAuc3RhdGUoJ3RhZycsIHtcbiAgICAgICAgdXJsOiAnL3RhZy97VGFnfScsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ2hlYWRlckB0YWcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnVGFnQ3RybCBhcyB0YWdDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGFnL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICB0YWdOYW1lOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzdGF0ZVBhcmFtcy5UYWdcbiAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICB0YWdMYW5kaW5nOiBmdW5jdGlvbiAoVG9waWNzLCAkc3RhdGVQYXJhbXMsIFRhZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFnID0gJHN0YXRlUGFyYW1zLlRhZ1xuICAgICAgICAgICAgICAgIC8vIHZhciBmYiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybClcbiAgICAgICAgICAgICAgICAvLyB2YXIgZGF0YVJldCA9ICcnXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHNob3coVGFncy50b3BpY1RhZ3ModGFnKSlcbiAgICAgICAgICAgICAgICAvKnJldHVybiBmYi5jaGlsZCgndGFncy8nICsgdGFnKVxuICAgICAgICAgICAgICAgICAgICAub24oJ3ZhbHVlJywgZnVuY3Rpb24gKHRhZ1NuYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmIuY2hpbGQoJ3RvcGljcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAub3JkZXJCeUNoaWxkKFwidGFnc1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmVxdWFsVG8odGFnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCd2YWx1ZScsIGZ1bmN0aW9uICh0b3BpY1NuYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNob3coIGV4dGVuZCh7fSwgdGFnU25hcC52YWwoKSwgdG9waWNTbmFwLnZhbCgpKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8hKmRhdGFSZXQgPSBleHRlbmQoe30sIHRhZ1NuYXAudmFsKCksIHRvcGljU25hcC52YWwoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJGZpcmViYXNlQXJyYXkoZGF0YVJldCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhUmV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAqIS9cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pKi9cbiAgICAgICAgICAgICAgICAvLyB2YXIgdGFnT2JqID0gVGFncy5nZXRUYWdPYmplY3QodGFnKVxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0YWdPYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vICAgcmV0dXJuIFRvcGljcy50b3BpY3NCeVRhZyh0YWcpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24gKHNuYXApIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coZXh0ZW5kKHt9LCB0YWdPYmouJHZhbHVlLCBzbmFwLnZhbCgpKSlcbiAgICAgICAgICAgICAgICAvLyAgICAgcmV0dXJuIGV4dGVuZCh7fSwgdGFnT2JqLiR2YWx1ZSwgc25hcC52YWwoKSlcbiAgICAgICAgICAgICAgICAvLyAgIH0pXG4gICAgICAgICAgICAgICAgLy8gfSlcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgZmIub25jZSgndmFsdWUnLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGRhdGEgPSBzbmFwc2hvdC52YWwoKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGRhdGFTbmFwKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdmFyIGluZGV4ID0gd29yZC5pbmRleE9mKCcgJylcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgZmlyc3QgPSBkYXRhU25hcC5OYW1lLnN1YnN0cmluZygwLCBpbmRleClcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgbGFzdCA9IHdvcmQuc3Vic3RyaW5nKGluZGV4ICsgMSlcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgY2FuZGlkYXRlID0gZGF0YVNuYXAuTmFtZVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIGlmIChjYW5kaWRhdGUuaW5kZXhPZihmaXJzdCkgPj0gMCAmJiBjYW5kaWRhdGUuaW5kZXhPZihsYXN0KSA+PSAwKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhU25hcC5DSUQpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgcmVqZWN0KCdTb21lIHNvcnQgb2YgZmFpbHVyZScpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgICAgIC8vIH0pXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLnRvcGljc0J5VGFnKHRhZylcbiAgICAgICAgICAgICAgLy8gLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcCl7XG4gICAgICAgICAgICAgIC8vIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cblxuICAgICAgLy8gVG9waWMgbGFuZGluZyBwYWdlXG4gICAgICAuc3RhdGUoJ3RvcGljJywge1xuICAgICAgICB1cmw6ICcve1NsdWd9JyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIC8qU2x1ZzogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywkc3RhdGUsQXV0aCkge1xuICAgICAgICAgICAgJHN0YXRlUGFyYW1zLlNsdWcgPSBkZWNvZGVVUklDb21wb25lbnQoJHN0YXRlUGFyYW1zLlNsdWcpXG4gICAgICAgICAgICBpZigkc3RhdGVQYXJhbXMuU2x1ZyA9PSAnJyl7XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSovXG4gICAgICAgIH0sXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdUb3BpY0xhbmRpbmdDdHJsIGFzIHRvcGljTGFuZGluZ0N0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0b3BpY3MvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uIChBdXRoLCBVc2VycywgJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9waWNVaWQgPSAnJ1xuICAgICAgICAgICAgICAgIC8vIElmIHVzZXIgbG9naW4sIGNoZWNrIGlmIHRoZXkgYXJlIHRoZSB0b3BpYyBvd25lclxuICAgICAgICAgICAgICAgIGlmIChBdXRoLnJlZi5nZXRBdXRoKCkpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZm9ydG9waWMoJHN0YXRlUGFyYW1zLlNsdWcpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhWzBdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICB0b3BpY1VpZCA9IGRhdGFbMF0udWlkXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKEF1dGgucmVmLmdldEF1dGgoKS51aWQgPT0gdG9waWNVaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0b3BpY0xhbmRpbmc6IGZ1bmN0aW9uICgkc3RhdGVQYXJhbXMsIFRvcGljcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZm9ydG9waWMoJHN0YXRlUGFyYW1zLlNsdWcpLiRsb2FkZWQoKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVwbHlMaXN0OiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MsICRzdGF0ZSkge1xuICAgICAgICAgICAgICAgIHZhciB0b3BpY0tleSA9ICcnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5mb3J0b3BpYygkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkYXRhWzBdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9waWNLZXkgPSBkYXRhWzBdLiRpZFxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCd0b3BpYy1ub3Rmb3VuZCcpXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLnJlcGx5TGlzdCh0b3BpY0tleSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB2aWV3RGF0YTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgVG9waWNzLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHZhciB0b3BpY0tleSwgdmlld3NcbiAgICAgICAgICAgICAgICB2YXIgdGltZSA9IG1vbWVudCgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICB2YXIgaGlzdG9yeU9iaiA9IHsndXNlcklQJzogJycsICdjcmVhdGVkJzogdGltZX1cbiAgICAgICAgICAgICAgICBVc2Vycy5nZXRMb2NhdGlvbklQKCkuc3VjY2VzcyhmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgaGlzdG9yeU9iai51c2VySVAgPSBkYXRhLmRhdGFcbiAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICBoaXN0b3J5T2JqLnVzZXJJUCA9IGRhdGEuZGF0YVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5nZXRUb3BpY0J5U2x1Zygkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkYXRhWzBdLiRpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9waWNLZXkgPSBkYXRhWzBdLiRpZFxuICAgICAgICAgICAgICAgICAgICB2aWV3cyA9IFRvcGljcy5nZXRWaWV3cyh0b3BpY0tleSlcblxuICAgICAgICAgICAgICAgICAgICB2aWV3cy5vYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb3VudCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3cy5yZWYuY2hpbGQoJ2NvdW50Jykuc2V0KDEpXG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdzLnJlZi5jaGlsZCgnY291bnQnKS5zZXQoZGF0YS5jb3VudCArIDEpXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkudGhlbihmdW5jdGlvbiAoYXV0aCkge1xuICAgICAgICAgICAgICAgICAgICAgIHZhciB1aWQgPSBhdXRoLnVpZFxuICAgICAgICAgICAgICAgICAgICAgIHZpZXdzLnJlZi5jaGlsZCgnaGlzdG9yeScpLmNoaWxkKHVpZCkucHVzaCgpLnNldChoaXN0b3J5T2JqKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCd2aWV3cycpLmNoaWxkKHRvcGljS2V5KS5wdXNoKCkuc2V0KGhpc3RvcnlPYmopXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdmlld3Mub2JqXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZm9sbG93ZXJzOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmdldFRvcGljQnlTbHVnKCRzdGF0ZVBhcmFtcy5TbHVnKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgdmFyIHRvcGljS2V5ID0gZGF0YVswXS4kaWRcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZ2V0Rm9sbG93ZXJzKHRvcGljS2V5KS5vYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gVG9waWMgbm90IGZvdW5kXG4gICAgICAuc3RhdGUoJ3RvcGljLW5vdGZvdW5kJywge1xuICAgICAgICB1cmw6ICcvZXJyL25vdGZvdW5kJ1xuICAgICAgfSlcblxuICAgICAgLy8gUHJvZmlsZSBsYW5kaW5nIHBhZ2VcbiAgICAgIC5zdGF0ZSgncHJvZmlsZScsIHtcbiAgICAgICAgdXJsOiAnL3Byb2ZpbGUve05hbWV9JyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZmlsZS9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgaXNPd25lcjogZnVuY3Rpb24gKEF1dGgsIFVzZXJzLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXV0aC5yZWYuZ2V0QXV0aCgpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZUJ5VXNlcm5hbWUoJHN0YXRlUGFyYW1zLk5hbWUpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9maWxlWzBdLiRpZCA9PSBBdXRoLnJlZi5nZXRBdXRoKCkudWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB1c2VyUG9zdHM6IGZ1bmN0aW9uIChVc2VycywgVG9waWNzLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZUJ5VXNlcm5hbWUoJHN0YXRlUGFyYW1zLk5hbWUpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICBpZiAocHJvZmlsZVswXS4kaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuY3JlYXRlZEJ5KHByb2ZpbGVbMF0uJGlkKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHByb2ZpbGU6IGZ1bmN0aW9uICgkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHJvb3RTY29wZSwgQXV0aCwgVXNlcnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZUJ5VXNlcm5hbWUoJHN0YXRlUGFyYW1zLk5hbWUpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcHJvZmlsZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICdoZWFkZXJAcHJvZmlsZSc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90b29sYmFyL21haW5fdG9vbGJhci5odG1sJ1xuICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBQcm9maWxlIGxhbmRpbmcgcGFnZVxuICAgICAgLy8gQHByb2ZpbGVDdHJsXG4gICAgICAuc3RhdGUoJ2FjY2NvdW50RWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL2FjY291bnQvZWRpdCcsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ3Bhc3N3b3JkRWRpdEBhY2Njb3VudEVkaXQnOiB7XG4gICAgICAgICAgICB1cmw6ICcvYWNjb3VudC9jaGFuZ2VQYXNzd29yZCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGUvcGFzc3dkLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAndXNlckVkaXRAYWNjY291bnRFZGl0Jzoge1xuICAgICAgICAgICAgdXJsOiAnL2FjY291bnQvZWRpdC1mb3JtJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZmlsZS9lZGl0LWZvcm0uaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnUHJvZmlsZUN0cmwgYXMgcHJvZmlsZUN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlL2VkaXQuaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIHVzZXJQb3N0czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBpc093bmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcHJvZmlsZTogZnVuY3Rpb24gKCRzdGF0ZSwgJHJvb3RTY29wZSwgQXV0aCwgVXNlcnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlKGF1dGgudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAocHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvZmlsZS5kaXNwbGF5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9maWxlXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdnZXRfc3RhcnRlZCcpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGF1dGg6IGZ1bmN0aW9uICgkc3RhdGUsIFVzZXJzLCBBdXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGguYXV0aC4kcmVxdWlyZUF1dGgoKS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ2FjY291bnRQYXNzd29yZCcsIHtcbiAgICAgICAgdXJsOiAnL2FjY291bnQvY2hhbmdlUGFzc3dvcmQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGUvcGFzc3dkLmh0bWwnXG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ2FjY291bnRVc2VyRWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL2FjY291bnQvZWRpdC1mb3JtJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlL2VkaXQtZm9ybS5odG1sJ1xuICAgICAgfSlcblxuICAgICAgLy8gRGFzaGJvYXJkXG4gICAgICAvLyBAcHJvZmlsZUN0cmxcbiAgICAgIC5zdGF0ZSgnZGFzaGJvYXJkJywge1xuICAgICAgICB1cmw6ICcvdXNlci9kYXNoYm9hcmQnLFxuICAgICAgICBjb250cm9sbGVyOiAnRGFzaGJvYXJkQ3RybCBhcyBkYXNoYm9hcmRDdHJsJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnZGFzaGJvYXJkL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICB1c2VyUG9zdHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaXNPd25lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHByb2ZpbGU6IGZ1bmN0aW9uICgkc3RhdGUsICRyb290U2NvcGUsIEF1dGgsIFVzZXJzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGguYXV0aC4kcmVxdWlyZUF1dGgoKS50aGVuKGZ1bmN0aW9uIChhdXRoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZShhdXRoLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHByb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgbm8gc3RhdCBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwcm9maWxlLnN0YXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBVc2Vycy51c2VyUmVmKGF1dGgudWlkKS5jaGlsZCgnc3RhdC91cHZvdGVkL2NvdW50Jykuc2V0KDApXG4gICAgICAgICAgICAgICAgICAgICAgVXNlcnMudXNlclJlZihhdXRoLnVpZCkuY2hpbGQoJ3N0YXQvcG9zdGVkL2NvdW50Jykuc2V0KDApXG4gICAgICAgICAgICAgICAgICAgICAgVXNlcnMudXNlclJlZihhdXRoLnVpZCkuY2hpbGQoJ3N0YXQvY29tbWVudC9jb3VudCcpLnNldCgwKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2VyL2NvdW50Jykuc2V0KDApXG4gICAgICAgICAgICAgICAgICAgICAgVXNlcnMudXNlclJlZihhdXRoLnVpZCkuY2hpbGQoJ3N0YXQvZm9sbG93aW5nL2NvdW50Jykuc2V0KDApXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBubyBkaXNwbGF5bmFtZSAtIGdvIHRvIGdldF9zdGFydGVkXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9maWxlLmRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb2ZpbGVcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2dldF9zdGFydGVkJylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpXG4gICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBhdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG5cbiAgICAgIC8vIG5lc3RlZCBsaXN0IHdpdGggY3VzdG9tIGNvbnRyb2xsZXJcbiAgICAgIC5zdGF0ZSgnZGFzaGJvYXJkLmxpc3QnLCB7XG4gICAgICAgIHVybDogJy9mZWVkL3tTbHVnfScsXG4gICAgICAgIC8vdGVtcGxhdGVVcmw6ICcvZmVlZHMvZmVlZC5odG1sJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NhdGVDdHJsIGFzIGNhdGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnY2F0ZWdvcnkvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIC8vIEdldHRpbmcgQ2F0ZWdvcnkgZGV0YWlsc1xuICAgICAgICAgICAgICBjYXRlTmFtZTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgQ2F0ZWdvcnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQ2F0ZWdvcnkuZ2V0TmFtZSgkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIC8vIEdldHRpbmcgbGlzdCBvZiBjYXRlZ29yeSB0b3BpY3MgaGVyZVxuICAgICAgICAgICAgICBjYXRlVG9waWNzOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmxpc3QoJHN0YXRlUGFyYW1zLlNsdWcpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBGb2xsbG93IENhdGVnb3J5XG4gICAgICAvLyBAcHJvZmlsZUN0cmxcbiAgICAgIC5zdGF0ZSgnZm9sbG93X2NhdGVzJywge1xuICAgICAgICB1cmw6ICcvdXNlci9mb2xsb3ctY2F0ZWdvcmllcycsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ3RybCBhcyBwcm9maWxlQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2F1dGgvZm9sbG93LWNhdGVnb3JpZXMuaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIHVzZXJQb3N0czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBpc093bmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcHJvZmlsZTogZnVuY3Rpb24gKFVzZXJzLCBBdXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGguYXV0aC4kcmVxdWlyZUF1dGgoKS50aGVuKGZ1bmN0aW9uIChhdXRoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZShhdXRoLnVpZCkuJGxvYWRlZCgpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgYXV0aDogZnVuY3Rpb24gKCRzdGF0ZSwgVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gR2V0dGluZyBzdGFydGVkXG4gICAgICAvLyBAcHJvZmlsZUN0cmxcbiAgICAgIC5zdGF0ZSgnZ2V0X3N0YXJ0ZWQnLCB7XG4gICAgICAgIHVybDogJy91c2VyL2dldF9zdGFydGVkJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXV0aC9nZXRfc3RhcnRlZC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgdXNlclBvc3RzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9maWxlOiBmdW5jdGlvbiAoVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlKGF1dGgudWlkKS4kbG9hZGVkKClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBhdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnaGVhZGVyQGdldF9zdGFydGVkJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvdXNlci9sb2dpbicsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXV0aC9sb2dpbi5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2xvZ2luLWZvcm1AbG9naW4nOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC9sb2dpbi1mb3JtLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgICB1cmw6ICcvdXNlci9yZWdpc3RlcicsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2F1dGgvcmVnaXN0ZXIuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICByZXF1aXJlTm9BdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBBdXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICByZXR1cm4gZXJyb3JcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpXG4gIH0pXG5cbiAgLmZpbHRlcignb3JkZXJPYmplY3RCeScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGl0ZW1zLCBmaWVsZCwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGZpbHRlcmVkID0gW11cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChpdGVtcywgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgZmlsdGVyZWQucHVzaChpdGVtLiRpZCkuc2V0KGl0ZW0pXG4gICAgICB9KVxuICAgICAgZmlsdGVyZWQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gKGFbZmllbGRdID4gYltmaWVsZF0gPyAxIDogLTEpXG4gICAgICB9KVxuICAgICAgaWYgKHJldmVyc2UpIGZpbHRlcmVkLnJldmVyc2UoKVxuICAgICAgcmV0dXJuIGZpbHRlcmVkXG4gICAgfVxuICB9KVxuXG4gIC5maWx0ZXIoJ2RlY29kZVVSSScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0ID8gZGVjb2RlVVJJKHRleHQpIDogJydcbiAgICB9XG4gIH0pXG5cbiAgLy8gRm9ybWF0dGluZyB0ZXh0cyB0byBpbmNsdWRlIG5ldyBsaW5lXG4gIC5maWx0ZXIoJ25sMmJyJywgZnVuY3Rpb24gKCRzY2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0ID8gJHNjZS50cnVzdEFzSHRtbCh0ZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKSkgOiAnJ1xuICAgIH1cbiAgfSlcblxuICAuY29uc3RhbnQoJ0ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vYm14eXouZmlyZWJhc2Vpby5jb20vJylcblxuZnVuY3Rpb24gc2hvdyAoZGF0YSkge1xuICBjb25zb2xlLmxvZyhkYXRhKVxuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMilcbn1cblxuLy8gZm9yIGpvaW5pbmcgLSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9rYXRvd3VsZi82NTk4MjM4XG5mdW5jdGlvbiBleHRlbmQgKGJhc2UpIHtcbiAgdmFyIHBhcnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgaWYgKHAgJiYgdHlwZW9mIChwKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGsgaW4gcCkge1xuICAgICAgICBpZiAocC5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgIGJhc2Vba10gPSBwW2tdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBiYXNlXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmNvbnRyb2xsZXIoJ0F1dGhDdHJsJywgZnVuY3Rpb24oJHNjb3BlLEF1dGgsIFVzZXJzLCAkc3RhdGUsJHJvb3RTY29wZSwkbWRTaWRlbmF2LCR0cmFuc2xhdGUsICRjb29raWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RpU2VydmljZSwkbm90aWZpY2F0aW9uKXtcblxuICAgIGNvbnNvbGUubG9nKFwiYXV0aEN0cmxcIik7XG5cbiAgICB2YXIgYXV0aEN0cmwgPSB0aGlzO1xuXG4gICAgLy9Bc2sgZm9yIG5vdGlmaWNhdGlvbiBwZXJtaXNzaW9uXG4gICAgJG5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbigpXG4gICAgICAudGhlbihmdW5jdGlvbiAocGVybWlzc2lvbikge1xuICAgICAgICBjb25zb2xlLmxvZyhwZXJtaXNzaW9uKTsgLy8gZGVmYXVsdCwgZ3JhbnRlZCwgZGVuaWVkXG4gICAgICB9KTtcblxuICAgIC8vUGFyc2VyXG4gICAgYXV0aEN0cmwuYXV0aCAgICAgPSBBdXRoO1xuICAgIGF1dGhDdHJsLnVzZXJzICAgID0gVXNlcnM7XG4gICAgYXV0aEN0cmwubm90aWZpY2F0aW9uID0gTm90aVNlcnZpY2U7XG5cblxuICAgIGlmKEF1dGgucmVmLmdldEF1dGgoKSAhPSBudWxsICl7XG4gICAgICBhdXRoQ3RybC5wcm9maWxlICA9IGF1dGhDdHJsLnVzZXJzLmdldFByb2ZpbGUoQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCk7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBhdXRoQ3RybC5wcm9maWxlID0nJ1xuICAgIH1cblxuXG4gICAgYXV0aEN0cmwudXNlciA9IHtcbiAgICAgIGVtYWlsOiAnJyxcbiAgICAgIHBhc3N3b3JkOiAnJ1xuICAgIH07XG5cblxuXG4gICAgLy9HZXQgdGhlIGJhZGdlIG5vdGlmaWNhdGlvblxuICAgIC8qYXV0aEN0cmwuYmFkZ2VOb3RpZmljYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgcmV0dXJuIGF1dGhDdHJsLm5vdGlmaWNhdGlvbi5hZGRBcnJDaGlsZChhdXRoQ3RybC5wcm9maWxlLiRpZCArICcvdW5yZWFkJykuJGxvYWRlZCgpO1xuICAgIH1cblxuICAgIGF1dGhDdHJsLmJhZGdlVmFsdWUgPSBhdXRoQ3RybC5iYWRnZU5vdGlmaWNhdGlvbjtcblxuICAgIGNvbnNvbGUubG9nKGF1dGhDdHJsLmJhZGdlTm90aWZpY2F0aW9uKTsqL1xuXG4gICAgJHNjb3BlLmJhZGdlTm90aWZjYXRpb24gPSBhdXRoQ3RybC5iYWRnZU5vdGlmaWNhdGlvbjtcblxuICAgIC8vUmVzZXQgY291bnRlclxuICAgIGF1dGhDdHJsLnJlc2V0Q291bnRlciA9IGZ1bmN0aW9uKCl7XG4gICAgICBhdXRoQ3RybC5ub3RpZmljYXRpb24ucmVzZXRVbnJlYWQoYXV0aEN0cmwucHJvZmlsZS4kaWQpO1xuICAgIH1cblxuICAgIGF1dGhDdHJsLmNoYW5nZVZhbCA9IGZ1bmN0aW9uKCl7XG4gICAgICBjb25zb2xlLmxvZygnYmFkZ2UgdmFsdWUgJythdXRoQ3RybC5iYWRnZU5vdGlmaWNhdGlvbi4kdmFsdWUpO1xuXG4gICAgfVxuXG4gICAgJHNjb3BlLiR3YXRjaChcIm5hbWVcIiwgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICBpZiAoJHNjb3BlLm5hbWUubGVuZ3RoID4gMCkge1xuICAgICAgICAkc2NvcGUuZ3JlZXRpbmcgPSBcIkdyZWV0aW5ncyBcIiArICRzY29wZS5uYW1lO1xuICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICAvL0NoYW5nZSBsYW5ndWFnZVxuICAgIGF1dGhDdHJsLnRvZ2dsZUxhbmcgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgJHRyYW5zbGF0ZS51c2UobGFuZ0tleSk7XG4gICAgICAvLyBTZXR0aW5nIGEgY29va2llXG4gICAgICAkY29va2llcy5wdXQoJ3VzZXJMYW5nJywgbGFuZ0tleSk7XG4gICAgICAvL0lmIHVzZXIgcmVnaXN0ZXJlZCAtIHVwZGF0ZSB0aGlzIGluIHRoZWlyIHByZWZlcmVuY2VcbiAgICAgIGlmKEF1dGgucmVmLmdldEF1dGgoKSl7XG4gICAgICAgIGF1dGhDdHJsLnVzZXJzLnVzZXJBcnJSZWYoQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCkudXBkYXRlKHtcImxhbmdcIjpsYW5nS2V5fSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL0NoZWNrayB1c2VyIHNlbGVjdGVkIGxhbmd1YWdlXG4gICAgaWYoIWF1dGhDdHJsLnByb2ZpbGUubGFuZyl7XG4gICAgICBpZigkY29va2llcy5nZXQoJ3VzZXJMYW5nJykpe1xuICAgICAgICBhdXRoQ3RybC50b2dnbGVMYW5nKCRjb29raWVzLmdldCgndXNlckxhbmcnKSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYXV0aEN0cmwudG9nZ2xlTGFuZygnRW5nJyk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBhdXRoQ3RybC50b2dnbGVMYW5nKGF1dGhDdHJsLnByb2ZpbGUubGFuZyk7XG4gICAgfVxuXG5cbiAgICAvL0xvZ2luXG4gICAgYXV0aEN0cmwubG9naW4gPSBmdW5jdGlvbiAoKXtcbiAgICAgIGF1dGhDdHJsLmF1dGguYXV0aC4kYXV0aFdpdGhQYXNzd29yZChhdXRoQ3RybC51c2VyKS50aGVuKGZ1bmN0aW9uIChhdXRoKXtcbiAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQnKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcil7XG4gICAgICAgIGF1dGhDdHJsLmVycm9yID0gZXJyb3I7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy9Mb2dvdXRcbiAgICBhdXRoQ3RybC5sb2dvdXQgPSBmdW5jdGlvbigpe1xuICAgICAgQXV0aC5hdXRoLiR1bmF1dGgoKTtcbiAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICB9XG5cbiAgICAvL1JlZ2lzdGVyIHVzZXJcbiAgICBhdXRoQ3RybC5yZWdpc3RlciA9IGZ1bmN0aW9uICgpe1xuICAgICAgQXV0aC5hdXRoLiRjcmVhdGVVc2VyKGF1dGhDdHJsLnVzZXIpLnRoZW4oZnVuY3Rpb24gKHVzZXIpe1xuICAgICAgICBhdXRoQ3RybC5sb2dpbigpO1xuICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKXtcbiAgICAgICAgYXV0aEN0cmwuZXJyb3IgPSBlcnJvcjtcbiAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIGF1dGhDdHJsLnRvZ2dsZVJpZ2h0ID0gYnVpbGRUb2dnbGVyKCdyaWdodCcpO1xuICAgIGZ1bmN0aW9uIGJ1aWxkVG9nZ2xlcihuYXZJRCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAkbWRTaWRlbmF2KG5hdklEKVxuICAgICAgICAgIC50b2dnbGUoKVxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmZhY3RvcnkoJ0F1dGgnLCBmdW5jdGlvbigkZmlyZWJhc2VBdXRoLCBGaXJlYmFzZVVybCl7XHJcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKTtcclxuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aChyZWYpO1xyXG5cclxuICAgIHZhciBBdXRoID0ge1xyXG4gICAgICByZWY6cmVmLFxyXG4gICAgICBhdXRoOiBhdXRoLFxyXG5cclxuICAgICAgZ2V0VWlkOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIHVpZCA9IHJlZi5nZXRBdXRoKCk7XHJcbiAgICAgICAgaWYodWlkICE9IG51bGwgKXtcclxuICAgICAgICAgIHJldHVybiByZWYuZ2V0QXV0aCgpLnVpZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIEF1dGg7XHJcbiAgfSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuY29udHJvbGxlcignQ2F0ZUN0cmwnLCBmdW5jdGlvbigkc3RhdGUsIENhdGVnb3J5LGNhdGVOYW1lLGNhdGVUb3BpY3Mpe1xuICAgIHZhciBjYXRlQ3RybCA9IHRoaXM7XG5cbiAgICAvL1BhcnNlcnNcbiAgICBjYXRlQ3RybC5jYXRlTmFtZSAgID0gY2F0ZU5hbWU7XG4gICAgY2F0ZUN0cmwuY2F0ZWdvcnkgICA9IENhdGVnb3J5O1xuICAgIGNhdGVDdHJsLmNhdGVUb3BpY3MgPSBjYXRlVG9waWNzO1xuXG5cbiAgICBjb25zb2xlLmxvZyhcIkNhdGVDdHJsXCIpO1xuICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG5cclxuICAvL1RvcGljIGxpc3RcclxuICAuZmFjdG9yeSgnQ2F0ZVNlcnZpY2UnLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5ICwgRmlyZWJhc2VVcmwpe1xyXG4gICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnY2F0ZWdvcmllcycpO1xyXG4gICAgdmFyIGNhdGVnb3JpZXMgPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcclxuXHJcbiAgICB2YXIgQ2F0ZSA9IHtcclxuXHJcbiAgICAgIG5hbWU6IGZ1bmN0aW9uKHRvcGljX3NsdWcpe1xyXG4gICAgICAgIHZhciBkYXRhID0gcmVmLm9yZGVyQnlDaGlsZChcInNsdWdcIikuZXF1YWxUbyh0b3BpY19zbHVnKTtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KGRhdGEpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgZm9ydG9waWM6IGZ1bmN0aW9uKHRvcGljX3NsdWcpe1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QodXNlcnNSZWYuY2hpbGQodWlkKSk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBhZGRDaGlsZDogZnVuY3Rpb24oY2hpbGRuYW1lKXtcclxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKGNoaWxkbmFtZSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGZvbGxvd0xpc3Q6ZnVuY3Rpb24odWlkKXtcclxuICAgICAgICB2YXIgZGF0YSA9IHJlZi5vcmRlckJ5Q2hpbGQoXCJuZXdzL2ZvbGxvd2VyXCIpLmVxdWFsVG8odWlkKTtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkoZGF0YSk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICB1bkZvbGxvdzpmdW5jdGlvbihzbHVnLHVpZCl7XHJcbiAgICAgICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnY2F0ZWdvcmllcy8nK3NsdWcrJy9mb2xsb3dlci8nK3VpZCk7XHJcbiAgICAgICAgcmVmLnJlbW92ZSgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgdXNlckZvbGxvdzpmdW5jdGlvbihzbHVnLHVpZCl7XHJcbiAgICAgICAgdmFyIGZvbGxvdz1mYWxzZTtcclxuICAgICAgICB2YXIgcmVmICAgID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydjYXRlZ29yaWVzLycrc2x1ZysnL2ZvbGxvd2VyLycrdWlkKTtcclxuICAgICAgICByZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XHJcbiAgICAgICAgICBmb2xsb3cgPSBzbmFwc2hvdC5leGlzdHMoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiBmb2xsb3c7XHJcbiAgICAgIH0sXHJcbiAgICAgIGFycjogJGZpcmViYXNlQXJyYXkocmVmKSxcclxuICAgICAgYWxsOmNhdGVnb3JpZXNcclxuICAgIH1cclxuICAgIHJldHVybiBDYXRlO1xyXG4gIH0pXHJcblxyXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuXHJcbiAgLy9Ub3BpYyBsaXN0XHJcbiAgLmZhY3RvcnkoJ1Bvc3QnLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QsIEZpcmViYXNlVXJsKXtcclxuICAgIHZhciByZWYgICAgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ3RvcGljcycpO1xyXG4gICAgdmFyIHRvcGljcyA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xyXG5cclxuICAgIHZhciBUUyA9IHtcclxuICAgICAgdG9waWNOYW1lOiBmdW5jdGlvbih0b3BpY19zbHVnKXtcclxuICAgICAgICB2YXIgZGF0YSA9IHJlZi5vcmRlckJ5Q2hpbGQoXCJzbHVnXCIpLmVxdWFsVG8odG9waWNfc2x1Zyk7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChkYXRhKTtcclxuICAgICAgfSxcclxuICAgICAgZm9ydG9waWM6IGZ1bmN0aW9uKHRvcGljX3NsdWcpe1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QodXNlcnNSZWYuY2hpbGQodWlkKSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGFsbDp0b3BpY3NcclxuICAgIH1cclxuICAgIHJldHVybiBUUztcclxuICB9KVxyXG5cclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5jb250cm9sbGVyKCdEYXNoYm9hcmRDdHJsJywgZnVuY3Rpb24oQXV0aCwgJHN0YXRlLENhdGVnb3J5LENhdGVTZXJ2aWNlLFRhZ3MsVG9waWNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgdmFyIGRhc2hib2FyZEN0cmwgPSB0aGlzO1xuXG4gICAgZGFzaGJvYXJkQ3RybC5hdXRoID0gQXV0aDtcblxuICAgIGRhc2hib2FyZEN0cmwuY2F0ZSAgICAgICAgPSBDYXRlU2VydmljZTtcbiAgICBkYXNoYm9hcmRDdHJsLmNhdGVnb3JpZXMgID0gQ2F0ZWdvcnkuYWxsO1xuICAgIGRhc2hib2FyZEN0cmwudG9waWNzICAgICAgPSBUb3BpY3M7XG4gICAgZGFzaGJvYXJkQ3RybC50b3BpY19ncmlkICA9IGZhbHNlO1xuICAgIGRhc2hib2FyZEN0cmwudGFncyAgICAgICAgPSBUYWdzLmFycjtcblxuICAgIGRhc2hib2FyZEN0cmwudXNlckNhdGVGb2xsb3cgID0gW107XG4gICAgZGFzaGJvYXJkQ3RybC5jYXRlSXNGb2xsb3cgICAgPSBbXTtcbiAgICBkYXNoYm9hcmRDdHJsLmZvbGxvd0xpc3QgICAgICA9ICcnO1xuICAgIGRhc2hib2FyZEN0cmwudXNlckZlZWQgPSdudWxsJztcblxuICAgIGRhc2hib2FyZEN0cmwubGF0ZXN0RmVlZCA9IGRhc2hib2FyZEN0cmwudG9waWNzLmxhdGVzdEZlZWQoKTtcblxuICAgIGRhc2hib2FyZEN0cmwuZm9sbG93Q2F0ZSA9IGZ1bmN0aW9uKGNhdGVfc2x1Zyl7XG4gICAgICBkYXNoYm9hcmRDdHJsLmNhdGUuYWRkQ2hpbGQoY2F0ZV9zbHVnKycvZm9sbG93ZXInKVxuICAgICAgICAuY2hpbGQoQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCkucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcIkRhc2hib2FyZEN0cmxcIik7XG4gIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG5cbiAgLmRpcmVjdGl2ZSgnbWFpbkhlYWRlcicsZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICAgICAnRScsXG4gICAgICB0cmFuc2NsdWRlOiAgIHRydWUsXG4gICAgICAvL2NvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90b29sYmFyL21haW5fdG9vbGJhci5odG1sJ1xuICAgIH1cblxuICB9KVxuXG4gIC8vQmFkZ2Ugbm90aWZpY2F0aW9uXG4gIC5kaXJlY3RpdmUoJ2JhZGdlTm90aWZpY2F0aW9uJyxmdW5jdGlvbigpe1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogICAgICdFJyxcbiAgICAgIHRyYW5zY2x1ZGU6ICAgdHJ1ZSxcbiAgICAgIC8vY29udHJvbGxlcjogICAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICAndGVtcGxhdGVzL2h0bWwvYmFkZ2Utbm90aWZpY2F0aW9uLmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgbm90aWZpY2F0aW9uOiAnPSdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cblxuICAvL0xpc3Qgb2YgY2F0ZWdvcmllcyBvbiB0aGUgc2lkZXJiYXJcbiAgLmRpcmVjdGl2ZSgncmV2aWV3U2NvcmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAgICAgJ0UnLFxuICAgICAgdHJhbnNjbHVkZTogICB0cnVlLFxuICAgICAgY29udHJvbGxlcjogICAnVG9waWNDdHJsIGFzIHRvcGljQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogICd0ZW1wbGF0ZXMvaHRtbC9yZXZpZXctc3VtbWFyeS1saXN0Lmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgcmV2aWV3OiAnPSdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cblxuICAvL0ZvbGxvdyBCdXR0b25cbiAgLmRpcmVjdGl2ZSgndXNlckZvbGxvd2VyQnRuJyxmdW5jdGlvbigpe1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogICAgICdFJyxcbiAgICAgIHRyYW5zY2x1ZGU6ICAgdHJ1ZSxcbiAgICAgIGNvbnRyb2xsZXI6ICAgJ1RvcGljQ3RybCBhcyB0b3BpY0N0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICAndGVtcGxhdGVzL2h0bWwvZm9sbG93LXVzZXIuaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICBmb2xsb3c6ICc9J1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuXG4gIC8vQ2F0ZWdvcnkgZm9sbG93IGJ1dHRvblxuICAuZGlyZWN0aXZlKCdjYXRlRm9sbG93QnRuJyxmdW5jdGlvbigpe1xuICAgIHJldHVybiB7XG4gICAgICBjb250cm9sbGVyOiAnRGFzaGJvYXJkQ3RybCBhcyBkYXNoYm9hcmRDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvY2F0ZWdvcnktZm9sbG93LWJ0bi5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIGNhdGU6ICc9J1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICAvL0xpc3Qgb2YgY2F0ZWdvcmllcyBvbiB0aGUgc2lkZXJiYXJcbiAgLmRpcmVjdGl2ZSgndG9waWNHcmlkJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb250cm9sbGVyOiAnRGFzaGJvYXJkQ3RybCBhcyBkYXNoYm9hcmRDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvY2F0ZWdvcnktZ3JpZC5odG1sJ1xuICAgIH1cbiAgfSlcblxuICAvL0dyaWQgVGFncyBmb3Igc2lkZWJhclxuICAuZGlyZWN0aXZlKCd0YWdHcmlkJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb250cm9sbGVyOiAnRGFzaGJvYXJkQ3RybCBhcyBkYXNoYm9hcmRDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvdGFnLWdyaWQuaHRtbCdcbiAgICB9XG4gIH0pXG5cblxuICAuZGlyZWN0aXZlKCd0b3BpY0NyZWF0ZScsIGZ1bmN0aW9uKCl7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29udHJvbGxlcjogJ1RvcGljQ3RybCBhcyB0b3BpY0N0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC90b3BpYy1jcmVhdGUuaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICB0b3BpYzogJz0nXG4gICAgICB9XG4gICAgfVxuXG4gIH0pXG5cblxuICAuZGlyZWN0aXZlKCd0b3BpY0xpc3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRyb2xsZXI6ICdUb3BpY0N0cmwgYXMgdG9waWNDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvdG9waWMtbGlzdC5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIHRvcGljczogJz0nXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG5cbiAgLmRpcmVjdGl2ZSgndG9waWNBY3Rpb25zQ2FyZCcsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29udHJvbGxlcjogJ1RvcGljQ3RybCBhcyB0b3BpY0N0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC90b3BpYy1hY3Rpb25zLWNhcmQuaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICB0b3BpYzogJz0nXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG5cbiAgLy9mb3IgdGFncyAtIG1heCB0YWdzXG4gIC5kaXJlY3RpdmUoJ2VuZm9yY2VNYXhUYWdzJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVxdWlyZTogJ25nTW9kZWwnLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdDdHJsKSB7XG4gICAgICB2YXIgbWF4VGFncyA9IGF0dHJzLm1heFRhZ3MgPyBwYXJzZUludChhdHRycy5tYXhUYWdzLCAnNCcpIDogbnVsbDtcblxuICAgICAgbmdDdHJsLiRwYXJzZXJzLnB1c2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlICYmIG1heFRhZ3MgJiYgdmFsdWUubGVuZ3RoID4gbWF4VGFncykge1xuICAgICAgICAgIHZhbHVlLnNwbGljZSh2YWx1ZS5sZW5ndGggLSAxLCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuY29udHJvbGxlcignSG9tZUN0cmwnLCBmdW5jdGlvbigkc3RhdGUsQ2F0ZWdvcnksVG9waWNzLGZlZWQpe1xuICAgIHZhciBob21lQ3RybCA9IHRoaXM7XG5cbiAgICBob21lQ3RybC50b3BpY3MgPSBDYXRlZ29yeTtcbiAgICBob21lQ3RybC50b3BpY3MgPSBUb3BpY3M7XG4gICAgaG9tZUN0cmwuZmVlZCAgID0gZmVlZDtcblxuICAgIGNvbnNvbGUubG9nKFwiaG9tZUN0cmxcIik7XG5cbiAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuICAuY29uZmlnKFsnJHRyYW5zbGF0ZVByb3ZpZGVyJywgZnVuY3Rpb24gKCR0cmFuc2xhdGVQcm92aWRlcikge1xyXG4gICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnRyYW5zbGF0aW9ucygnRW5nJywge1xyXG4gICAgICAnS0VZX0RBU0hCT0FSRCc6ICAnRGFzaGJvYXJkJyxcclxuICAgICAgJ0tFWV9MQU5HVUFHRVMnOiAgJ0xhbmd1YWdlcycsXHJcbiAgICAgICdLRVlfSE9NRSc6ICAgICAgICdIb21lJyxcclxuICAgICAgJ0tFWV9SRUdJU1RFUic6ICAgJ1JlZ2lzdGVyJyxcclxuICAgICAgJ0tFWV9MT0dJTic6ICAgICAgJ0xvZyBpbicsXHJcbiAgICAgICdLRVlfTE9HT1VUJzogICAgICdMb2cgb3V0JyxcclxuICAgICAgJ0tFWV9GT0xMT1cnOiAgICAgJ0ZvbGxvdycsXHJcbiAgICAgICdLRVlfRk9MTE9XRVInOiAgICdGb2xsb3dlcicsXHJcbiAgICAgICdLRVlfVU5GT0xMT1cnOiAgICdVbmZvbGxvdycsXHJcbiAgICAgICdLRVlfRk9MTE9XSU5HJzogICdGb2xsb3dpbmcnLFxyXG4gICAgICAnS0VZX1BPU1QnOiAgICAgICAnUG9zdCcsXHJcbiAgICAgICdLRVlfUE9TVEVEJzogICAgICdQb3N0ZWQnLFxyXG4gICAgICAnS0VZX1VQVk9URSc6ICAgICAnVXB2b3RlJyxcclxuICAgICAgJ0tFWV9VUFZPVEVEJzogICAgJ1Vwdm90ZWQnLFxyXG4gICAgICAnS0VZX0RXTl9WT1RFJzogICAnRG93bnZvdGUnLFxyXG4gICAgICAnS0VZX0RXTl9WT1RFRCc6ICAnRG93bnZvdGVkJyxcclxuICAgICAgJ0tFWV9WSUVXJzogICAgICAgJ1ZpZXcnLFxyXG4gICAgICAnS0VZX1JFTU9WRSc6ICAgICAnUmVtb3ZlJyxcclxuICAgICAgJ0tFWV9DQU5DRUwnOiAgICAgJ0NhbmNlbCcsXHJcbiAgICAgICdLRVlfUVVFU1RJT04nOiAgICdRdWVzdGlvbicsXHJcbiAgICAgICdLRVlfVE9QSUMnOiAgICAgICdUb3BpYycsXHJcbiAgICAgICdLRVlfQ0hHX1BXRCc6ICAgICdDaGFuZ2UgUGFzc3dvcmQnLFxyXG4gICAgICAnS0VZX1BBU1NXT1JEJzogICAnUGFzc3dvcmQnLFxyXG4gICAgICAnS0VZX09MRF9QV0QnOiAgICAnT2xkIFBhc3N3b3JkJyxcclxuICAgICAgJ0tFWV9ORVdfUFdEJzogICAgJ05ldyBQYXNzd29yZCcsXHJcbiAgICAgICdLRVlfTkVXX1BXRF9DJzogICdOZXcgcGFzc3dvcmQgY29uZmlybWF0aW9uJyxcclxuICAgICAgJ0tFWV9TQVZFJzogICAgICAgJ1NhdmUnLFxyXG4gICAgICAnS0VZX1NBVkVfRFJBRlQnOiAnU2F2ZSBhcyBkcmFmdCcsXHJcbiAgICAgICdLRVlfVEFHUyc6ICAgICAgICdUYWdzJyxcclxuICAgICAgJ0tFWV9FWFBMT1JFJzogICAgJ0V4cGxvcmUnLFxyXG4gICAgICAnS0VZX0ZFQVRfQ0FUJzogICAgJ0ZlYXR1cmVzIGNhdGVnb3JpZXMnLFxyXG4gICAgICAnS0VZX0NPTU1FTlRTJzogICAnQ29tbWVudHMnLFxyXG4gICAgICAnS0VZX1JFUExZJzogICAgICAnUmVwbHknLFxyXG4gICAgICAnS0VZX1JFVklFVyc6ICAgICAnUmV2aWV3JyxcclxuICAgICAgJ0tFWV9FRElUJzogICAgICAgJ0VkaXQnLFxyXG4gICAgICAnS0VZX1RSRU5EJzogICAgICAnVHJlbmQnLFxyXG4gICAgICAnS0VZX1RSRU5ESU5HJzogICAnVHJlbmRpbmcnLFxyXG4gICAgICAnS0VZX1dSSVRFX1JFUExZJzonV3JpdGUgYSByZXBseScsXHJcbiAgICAgICdLRVlfTEFURVNUX0ZFRUQnOidMYXRlc3QgRmVlZCcsXHJcblxyXG4gICAgICAvL1JlbW92ZSB0b3BpY1xyXG4gICAgICAnS0VZX0NPTkZfUkVNT1ZFJzonQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZT8nLFxyXG4gICAgICAnS0VZX0NPTkZfUkVNX0MnOiAnT25jZSByZW1vdmUsIHlvdSB3aWxsIG5vdCBiZSBhYmxldG8gdG8gZ2V0IHRoaXMgdG9waWMgYmFjaycsXHJcblxyXG5cclxuICAgICAgLy9TRU5URU5DRVxyXG4gICAgICAnS0VZX1dIQVRfT05fVVJfTUlORCc6ICAnV2hhdFxcJ3Mgb24geW91ciBtaW5kPycsXHJcbiAgICAgICdLRVlfWU9VX1dBTlRfRk9MTE9XJzogICdZb3UgbWF5IHdhbnQgdG8gZm9sbG93JyxcclxuICAgICAgJ0tFWV9OT19BQ0NUX1JFR0lTVEVSJzogJ0RvblxcJ3QgaGF2ZSBhY2NvdW50PyBSZWdpc3RlcicsXHJcbiAgICAgICdLRVlfQ0FOVF9DSE5HX1VTRVInOiAgICdEb25cXCd0IGhhdmUgYWNjb3VudD8gUmVnaXN0ZXInLFxyXG4gICAgICAnS0VZX1lPVVJfQUNDT1VOVCc6ICAgICAnWW91ciBhY2NvdW50JyxcclxuICAgICAgJ0tFWV9OT1RISU5HX0hFUkUnOiAgICAgJ05vdGhpbmcgaGVyZSwgeWV0JyxcclxuICAgICAgJ0tFWV9XSE9fVE9fRk9MTE9XJzogICAgJ1dobyB0byBmb2xsb3cnLFxyXG4gICAgICAnS0VZX0NBVF9XSUxMX0FQUEVBUic6ICAnRm9sbG93IHNvbWUgY2F0ZWdvcmllcyBhbmQgaXQgd2lsbCBhcHBlYXIgaGVyZScsXHJcbiAgICAgICdLRVlfV0hUX1VSX1NUT1JZJzogICAgICdXaGF0XFwncyB5b3VyIHN0b3J5JyxcclxuICAgICAgJ0tFWV9XUlRfQ09NTUVOVCc6ICAgICAgJ1dyaXRlIGEgY29tbWVudCcsXHJcblxyXG5cclxuXHJcbiAgICAgIC8vVVNFUiBJTlBVVFxyXG4gICAgICAnS0VZX0ZJUlNUTkFNRSc6ICAnRmlyc3QgbmFtZScsXHJcbiAgICAgICdLRVlfTEFTVE5BTUUnOiAgICdMYXN0IG5hbWUnLFxyXG4gICAgICAnS0VZX0JJUlRIREFZJzogICAnQmlydGhkYXknLFxyXG4gICAgICAnS0VZX01PTlRIJzogICAgICAnTW9udGgnLFxyXG4gICAgICAnS0VZX0RBWSc6ICAgICAgICAnRGF5JyxcclxuICAgICAgJ0tFWV9FTUFJTCc6ICAgICAgJ0VtYWlsJyxcclxuICAgICAgJ0tFWV9DT05GX0VNQUlMJzogJ0NvbmZpcm0gRW1haWwnLFxyXG4gICAgICAnS0VZX0dFTkRFUic6ICAgICAnR2VuZGVyJyxcclxuICAgICAgJ0tFWV9NQUxFJzogICAgICAgJ01hbGUnLFxyXG4gICAgICAnS0VZX0ZFTUFMRSc6ICAgICAnRmVtYWxlJyxcclxuICAgICAgJ0tFWV9VU0VSTkFNRSc6ICAgJ1VzZXJuYW1lJyxcclxuICAgICAgJ0tFWV9MT0NBVElPTic6ICAgJ0xvY2F0aW9uJyxcclxuXHJcbiAgICAgIC8vVXNlciBFZGl0XHJcbiAgICAgICdLRVlfRURfUFJPRklMRSc6ICdFZGl0IFByb2ZpbGUnLFxyXG4gICAgICAnS0VZX0VEX0NIR19QV0QnOiAnQ2hhbmdlIFBhc3N3b3JkJyxcclxuICAgICAgJ0tFWV9FRF9QUk9GSUxFJzogJ0VkaXQgUHJvZmlsZScsXHJcbiAgICAgICdLRVlfRURfU0lURSc6ICAgICdXZWJzaXRlJyxcclxuICAgICAgJ0tFWV9FRF9QSE9ORSc6ICAgJ1Bob25lJyxcclxuICAgICAgJ0tFWV9FRF9CSU8nOiAgICAgJ0Jpb2dyYXBoeScsXHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnRyYW5zbGF0aW9ucygn4LmE4LiX4LiiJywge1xyXG4gICAgICAnS0VZX0RBU0hCT0FSRCc6ICAn4Lir4LmJ4Lit4LiH4LiX4Lix4LmJ4LiH4Lir4Lih4LiUJyxcclxuICAgICAgJ0tFWV9MQU5HVUFHRVMnOiAgJ+C4oOC4suC4qeC4sicsXHJcbiAgICAgICdLRVlfSE9NRSc6ICAgICAgICfguKvguJnguYnguLLguYHguKPguIEnLFxyXG4gICAgICAnS0VZX1JFR0lTVEVSJzogICAn4Liq4Lih4Lix4LiE4Lij4LmD4LiK4LmJJyxcclxuICAgICAgJ0tFWV9MT0dJTic6ICAgICAgJ+C5gOC4guC5ieC4suC4quC4ueC5iOC4o+C4sOC4muC4micsXHJcbiAgICAgICdLRVlfRk9MTE9XJzogICAgICfguJXguLTguJTguJXguLLguKEnLFxyXG4gICAgICAnS0VZX1BPU1QnOiAgICAgICAn4LmC4Lie4Liq4LiV4LmMJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnByZWZlcnJlZExhbmd1YWdlKCdlbicpO1xyXG4gIH1dKVxyXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuICAuY29udHJvbGxlcignTm90aUN0cmwnLCBmdW5jdGlvbigkc3RhdGUsQ2F0ZWdvcnksVG9waWNzLE5vdGlTZXJ2aWNlKXtcclxuICAgIHZhciBub3RpQ3RybCA9IHRoaXM7XHJcblxyXG5cclxuICAgIG5vdGlDdHJsLnRvcGljcyA9IFRvcGljcztcclxuICAgIG5vdGlDdHJsLmZlZWQgICA9IGZlZWQ7XHJcbiAgICBub3RpQ3RybC5ub3RpU2VydmljZSA9IE5vdGlTZXJ2aWNlO1xyXG5cclxuICAgIG5vdGlDdHJsLm5vdGlmeVRvID1mdW5jdGlvbih1aWQpe1xyXG4gICAgICByZXR1cm4gbm90aUN0cmwuYXJyLnB1c2godWlkKS4kYWRkKHVpZClcclxuICAgIH1cclxuICB9KTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcblxyXG4gIC5mYWN0b3J5KCdOb3RpU2VydmljZScsIGZ1bmN0aW9uKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXkgLCBGaXJlYmFzZVVybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVc2Vycywkbm90aWZpY2F0aW9uKXtcclxuICAgIHZhciByZWYgICAgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ25vdGlmaWNhdGlvbicpO1xyXG4gICAgdmFyIG5vdGkgPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcclxuICAgIHZhciB1c2VycyA9IFVzZXJzO1xyXG5cclxuICAgIHZhciBvYnNlcnZlckNhbGxiYWNrcyA9IFtdO1xyXG5cclxuXHJcbiAgICB2YXIgTm90aWZpY2F0aW9uID0ge1xyXG5cclxuICAgICAgLy9EaXNwbGF5IHVucmVhZFxyXG4gICAgICB1bnJlYWROb3RpZmljYXRpb246ZnVuY3Rpb24odWlkKXtcclxuICAgICAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydub3RpZmljYXRpb24vJyt1aWQrJy91bnJlYWQnKTtcclxuICAgICAgICB2YXIgY291bnRlcjtcclxuICAgICAgICByZWYub24oXCJ2YWx1ZVwiLGZ1bmN0aW9uKHNuYXBzaG90KXtcclxuICAgICAgICAgIGNvdW50ZXIgPSBzbmFwc2hvdC52YWwoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIG5vdGlmaWNhdGlvbl9yZWYgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ25vdGlmaWNhdGlvbi8nK3VpZCk7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uX3JlZi5vbihcImNoaWxkX2FkZGVkXCIsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICRub3RpZmljYXRpb24oJ05ldyBtZXNzYWdlIGZyb20gUWFueWEnLCB7XHJcbiAgICAgICAgICAgIGJvZHk6ICdIZWxsbyAnK3VpZCxcclxuICAgICAgICAgICAgZGlyOiAnYXV0bycsXHJcbiAgICAgICAgICAgIGxhbmc6ICdlbicsXHJcbiAgICAgICAgICAgIHRhZzogJ215LXRhZycsXHJcbiAgICAgICAgICAgIGljb246ICdodHRwOi8vd3d3LmNsLmNhbS5hYy51ay9yZXNlYXJjaC9zcmcvbmV0b3MvaW1hZ2VzL3FzZW5zZS1sb2dvLnBuZycsXHJcbiAgICAgICAgICAgIC8vZGVsYXk6IDEwMDAsIC8vIGluIG1zXHJcbiAgICAgICAgICAgIGZvY3VzV2luZG93T25DbGljazogdHJ1ZSAvLyBmb2N1cyB0aGUgd2luZG93IG9uIGNsaWNrXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiBjb3VudGVyIDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vTm90aWZ5IGZvbGxvd2Vyc1xyXG4gICAgICBub3RpZnlGb2xsb3dlcjpmdW5jdGlvbih0b3BpY0lkLHVpZCl7XHJcbiAgICAgICAgdmFyIHJlZiA9IHVzZXJzLmdldEZvbGxvd2VyKHVpZCk7XHJcbiAgICAgICAgcmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xyXG4gICAgICAgICAgc25hcHNob3QuZm9yRWFjaChmdW5jdGlvbihjaGlsZFNuYXBzaG90KSB7XHJcbiAgICAgICAgICAgIC8vdXBkYXRlIG5vdGlmaWNhdGlvbiBhbmQgZGV0YWlsc1xyXG4gICAgICAgICAgICBOb3RpZmljYXRpb24udXBkYXRlTm90aWZpY2F0aW9uQ291bnQodG9waWNJZCxjaGlsZFNuYXBzaG90LmtleSgpKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vQWRkIGRldGFpbCBmb3IgdGhpcyBub3RpZmljdGlhb25cclxuICAgICAgbm90aWZ5TG9nOmZ1bmN0aW9uKHRvcGljSWQsdWlkLGZyb21fdWlkKXtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ1aWQgXCIrdWlkKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImZyb20gdWlkIFwiKyBmcm9tX3VpZCk7XHJcblxyXG4gICAgICAgIE5vdGlmaWNhdGlvbi5hZGRDaGlsZCh1aWQpLnB1c2goKS5zZXQoe1xyXG4gICAgICAgICAgdG9waWNJZDogICAgdG9waWNJZCxcclxuICAgICAgICAgIGZyb206ICAgICAgIGZyb21fdWlkLFxyXG4gICAgICAgICAgaXNfcmVhZDogICAgZmFsc2UsXHJcbiAgICAgICAgICB0aW1lc3RhbXA6ICBtb21lbnQoKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICB9LFxyXG5cclxuXHJcbiAgICAgIC8vUmVzZXQgdW5yZWFkIGNvdW50ZXJcclxuICAgICAgcmVzZXRVbnJlYWQ6ZnVuY3Rpb24odWlkKXtcclxuICAgICAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydub3RpZmljYXRpb24vJyt1aWQrJy91bnJlYWQnKTtcclxuICAgICAgICByZWYuc2V0KDApO1xyXG4gICAgICB9LFxyXG5cclxuXHJcbiAgICAgIC8vVXBkYXRlIG5vdGlmaWNhdGlvblxyXG4gICAgICAvL0BwYXJhbXMgdWlkIC0gd2hvIHRoaXMgbm90aWZpY2F0aW9uIGlzIGdvaW5nIHRvXHJcbiAgICAgIHVwZGF0ZU5vdGlmaWNhdGlvbkNvdW50OmZ1bmN0aW9uKHRvcGljSWQsdWlkLGZyb21fdWlkKXtcclxuXHJcbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbm90aWZpY2F0aW9uLycrdWlkKycvdW5yZWFkJyk7XHJcbiAgICAgICAgcmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xyXG4gICAgICAgICAgLy9kZWZhdWx0IHVucmVhZCBpcyAxXHJcbiAgICAgICAgIGlmKHNuYXBzaG90LnZhbCgpID09ICdudWxsJyl7XHJcbiAgICAgICAgICAgIHJlZi5zZXQoMSlcclxuICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZWYuc2V0KHNuYXBzaG90LnZhbCgpICsgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yT2JqZWN0KSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZSByZWFkIGZhaWxlZDogXCIgKyBlcnJvck9iamVjdC5jb2RlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy9BZGQgdG8gbG9nXHJcbiAgICAgICAgTm90aWZpY2F0aW9uLm5vdGlmeUxvZyh0b3BpY0lkLHVpZCxmcm9tX3VpZCk7XHJcblxyXG4gICAgICB9LFxyXG5cclxuXHJcbiAgICAgIGFkZENoaWxkOmZ1bmN0aW9uKGNoaWxkKXtcclxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKGNoaWxkKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGFkZEFyckNoaWxkOmZ1bmN0aW9uKGNoaWxkKXtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZChjaGlsZCkpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgYXJyOiAkZmlyZWJhc2VBcnJheShyZWYpLFxyXG4gICAgICBhbGw6IG5vdGlcclxuICAgIH1cclxuICAgIHJldHVybiBOb3RpZmljYXRpb247XHJcbiAgfSlcclxuXHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5jb250cm9sbGVyKCdQbGFjZXNDdHJsJywgZnVuY3Rpb24oJHN0YXRlLCRzY29wZSwkcm9vdFNjb3BlLCAkbWREaWFsb2csICRtZE1lZGlhLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9TZXJ2aWNlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFncywgVG9waWNzLCBBdXRoLCBVc2VycywgU2x1ZyxMYW5ndWFnZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZUxhbmRpbmcpIHtcclxuXHJcbiAgICB2YXIgcGxhY2VzQ3RybCA9IHRoaXM7XHJcbiAgICBjb25zb2xlLmxvZyhwbGFjZUxhbmRpbmcpO1xyXG4gICAgcGxhY2VzQ3RybC5wbGFjZUxhbmRpbmcgPSBwbGFjZUxhbmRpbmc7XHJcblxyXG4gIH0pO1xyXG5cclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmZhY3RvcnkoJ1BsYWNlcycsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCBGaXJlYmFzZVVybCl7XHJcblxyXG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsncGxhY2VzJyk7XHJcbiAgICB2YXIgcGxhY2VEZXRhaWxfcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydwbGFjZXNfZGV0YWlscycpO1xyXG5cclxuICAgIHZhciBwbGFjZXMgPSAkZmlyZWJhc2VBcnJheShyZWYpO1xyXG5cclxuICAgIHZhciBQbGFjZXMgPSB7XHJcbiAgICAgIGFkZENoaWxkOiBmdW5jdGlvbihjaGlsZG5hbWUpe1xyXG4gICAgICAgIHJldHVybiByZWYuY2hpbGQoY2hpbGRuYW1lKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgYWRkUGxhY2VEZXRhaWxDaGlsZDogZnVuY3Rpb24oY2hpbGRuYW1lKXtcclxuICAgICAgICByZXR1cm4gcGxhY2VEZXRhaWxfcmVmLmNoaWxkKGNoaWxkbmFtZSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGdldFBsYWNlUmVmOmZ1bmN0aW9uKHBsYWNlX2lkKXtcclxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKHBsYWNlX2lkKycvaW5mbycpO1xyXG4gICAgICB9LFxyXG4gICAgICBhcnI6IHBsYWNlc1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFBsYWNlcztcclxuICB9KVxyXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuXHJcbiAgLy9DYXRlZ29yeSBsaXN0XHJcbiAgLmZhY3RvcnkoJ0NhdGVnb3J5JywgZnVuY3Rpb24oJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBcnJheSwgRmlyZWJhc2VVcmwpe1xyXG4gICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnY2F0ZWdvcmllcycpO1xyXG4gICAgdmFyIGNhdGVnb3JpZXMgPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcclxuICAgIHZhciB0b3BpY0FyciA9ICRmaXJlYmFzZUFycmF5KHJlZik7XHJcblxyXG4gICAgdmFyIENhdGVnb3J5ID0ge1xyXG4gICAgICBnZXROYW1lOiBmdW5jdGlvbihzbHVnKXtcclxuICAgICAgICB2YXIgZGF0YSA9IHJlZi5jaGlsZChzbHVnKTtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KGRhdGEpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgYWxsOiBjYXRlZ29yaWVzXHJcbiAgICB9XHJcbiAgICByZXR1cm4gQ2F0ZWdvcnk7XHJcbiAgfSlcclxuXHJcblxyXG4gIC8vTGFuZ3VhZ2VzXHJcbiAgLmZhY3RvcnkoJ0xhbmd1YWdlcycsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCBGaXJlYmFzZVVybCl7XHJcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydsYW5ndWFnZXMnKTtcclxuICAgIHZhciBsYW5nID0gJGZpcmViYXNlQXJyYXkocmVmKTtcclxuXHJcbiAgICByZXR1cm4gbGFuZztcclxuICB9KVxyXG5cclxuXHJcbiAgLy9MYW5ndWFnZXNcclxuICAuZmFjdG9yeSgnQXJjaGl2ZScsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCBGaXJlYmFzZVVybCl7XHJcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydhcmNoaXZlJyk7XHJcbiAgICB2YXIgYXJjaGl2ZSA9ICRmaXJlYmFzZUFycmF5KHJlZik7XHJcblxyXG4gICAgdmFyIEFyY2hpdmUgPXtcclxuICAgICAgYWRkQ2hpbGQ6IGZ1bmN0aW9uKHNsdWcpe1xyXG4gICAgICAgIHJldHVybiByZWYuY2hpbGQoc2x1Zyk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlZjogcmVmLFxyXG4gICAgICBhcnI6IGFyY2hpdmVcclxuICAgIH1cclxuICAgIHJldHVybiBBcmNoaXZlO1xyXG4gIH0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuICAuY29udHJvbGxlcignVGFnQ3RybCcsIGZ1bmN0aW9uKEF1dGgsIFVzZXJzLCAkc3RhdGUsJHJvb3RTY29wZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vUmVzb2x2ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnTGFuZGluZyx0YWdOYW1lKSB7XHJcblxyXG4gICAgdmFyIHRhZ0N0cmwgPSB0aGlzO1xyXG4gICAgdGFnQ3RybC50YWdMYW5kaW5nICA9IHRhZ0xhbmRpbmc7XHJcbiAgICB0YWdDdHJsLnRhZ05hbWUgICAgID0gdGFnTmFtZTtcclxuXHJcbiAgfSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuZmFjdG9yeSgnVGFncycsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIEZpcmViYXNlVXJsLCAkcSl7XG5cbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKyd0YWdzJyk7XG4gICAgdmFyIHRhZ3MgPSAkZmlyZWJhc2VBcnJheShyZWYpO1xuXG4gICAgdmFyIFRhZ3MgPSB7XG5cbiAgICAgIGFkZENoaWxkOiBmdW5jdGlvbihjaGlsZG5hbWUpe1xuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKGNoaWxkbmFtZSlcbiAgICAgIH0sXG5cbiAgICAgIHRhZ3NVcmw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZik7XG4gICAgICB9LFxuXG4gICAgICBnZXRUYWdSZWY6ZnVuY3Rpb24odGFnKXtcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZCh0YWcpO1xuICAgICAgfSxcblxuICAgICAgZ2V0VGFnT2JqZWN0OmZ1bmN0aW9uKHRhZyl7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRhZykpXG4gICAgICB9LFxuXG4gICAgICB0b3BpY1RhZ3M6ZnVuY3Rpb24odGFnKXtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICB2YXIgZmIgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwpO1xuICAgICAgICB2YXIgZGF0YVJldCA9ICcnO1xuXG4gICAgICAgIHJldHVybiBmYi5jaGlsZCgndGFncy8nK3RhZylcbiAgICAgICAgICAub24oJ2NoaWxkX2FkZGVkJywgZnVuY3Rpb24odGFnU25hcCl7XG4gICAgICAgICAgICBmYi5jaGlsZCgndG9waWNzJylcbiAgICAgICAgICAgICAgLm9yZGVyQnlDaGlsZChcInRhZ3NcIilcbiAgICAgICAgICAgICAgLmVxdWFsVG8odGFnKVxuICAgICAgICAgICAgICAub24oJ2NoaWxkX2FkZGVkJywgZnVuY3Rpb24odG9waWNTbmFwKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIC8vc2hvdyggZXh0ZW5kKHt9LCB0YWdTbmFwLnZhbCgpLCB0b3BpY1NuYXAudmFsKCkpICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVuZCh7fSwgdGFnU25hcC52YWwoKSwgdG9waWNTbmFwLnZhbCgpKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGFSZXQpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICBhcnI6IHRhZ3NcblxuICAgIH1cbiAgICByZXR1cm4gVGFncztcbiAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuY29udHJvbGxlcignVG9waWNMYW5kaW5nQ3RybCcsIGZ1bmN0aW9uICgkc3RhdGUsICRzY29wZSwgU2x1ZywgVG9waWNzLCBBdXRoLCBVc2VycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9SZXNvbHZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzT3duZXIsdG9waWNMYW5kaW5nLCByZXBseUxpc3QsIHZpZXdEYXRhLCBmb2xsb3dlcnMpIHtcblxuICAgIHZhciB0b3BpY0xhbmRpbmdDdHJsID0gdGhpc1xuXG5cbiAgICB0b3BpY0xhbmRpbmdDdHJsLmF1dGggICAgICAgICA9IEF1dGg7XG4gICAgdG9waWNMYW5kaW5nQ3RybC51c2VycyAgICAgICAgPSBVc2VycztcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnRvcGljTGFuZGluZyA9IHRvcGljTGFuZGluZztcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnRvcGljcyAgICAgICA9IFRvcGljcztcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnJlcGx5TGlzdCAgICA9IHJlcGx5TGlzdDtcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnZpZXdzICAgICAgICA9IHZpZXdEYXRhO1xuICAgIHRvcGljTGFuZGluZ0N0cmwuZm9sbG93ZXJzICAgID0gZm9sbG93ZXJzO1xuICAgIHRvcGljTGFuZGluZ0N0cmwuaXNPd25lciAgICAgID0gaXNPd25lcjtcblxuXG5cblxuICAgIC8vR2V0dGluZyBSZXBsaWVzIGluIHJlcGxpZXNcbiAgICB0b3BpY0xhbmRpbmdDdHJsLmluUmVwbHlBcnIgPSBbXTtcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnJlcGx5SW5SZXBseSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgIGZvcih2YXIgaT0wOyBpPHRvcGljTGFuZGluZ0N0cmwucmVwbHlMaXN0Lmxlbmd0aDtpKyspe1xuICAgICAgICB2YXIgdG9waWNJZCA9IHRvcGljTGFuZGluZ0N0cmwucmVwbHlMaXN0W2ldLnRvcGljSWQ7XG4gICAgICAgIHZhciByZXBseUlkID0gdG9waWNMYW5kaW5nQ3RybC5yZXBseUxpc3RbaV0uJGlkO1xuICAgICAgICB0b3BpY0xhbmRpbmdDdHJsLmluUmVwbHlBcnJbaV0gPSB0b3BpY0xhbmRpbmdDdHJsLnRvcGljcy5yZXBseUluUmVwbHkodG9waWNJZCxyZXBseUlkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0b3BpY0xhbmRpbmdDdHJsLnJlcGx5SW5SZXBseSgpO1xuICB9KVxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5jb250cm9sbGVyKCdUb3BpY0N0cmwnLCBmdW5jdGlvbigkc3RhdGUsJHNjb3BlLCRyb290U2NvcGUsICRtZERpYWxvZywgJG1kTWVkaWEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaHR0cCxGaXJlYmFzZVVybCwkdHJhbnNsYXRlLCRub3RpZmljYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1NlcnZpY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RpU2VydmljZSxUYWdzLCBUb3BpY3MsIEF1dGgsIFVzZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2x1ZyxQbGFjZXMsIExhbmd1YWdlcyxBcmNoaXZlKXtcblxuICAgIGNvbnNvbGUubG9nKFwidG9waWNDdHJsXCIpO1xuXG4gICAgdmFyIHRvcGljQ3RybCA9IHRoaXM7XG5cblxuICAgIC8vUGFyc2VyIGhlcmVcbiAgICB0b3BpY0N0cmwudGFncyAgICAgID0gVGFncztcbiAgICB0b3BpY0N0cmwudG9waWNzICAgID0gVG9waWNzO1xuICAgIHRvcGljQ3RybC5hdXRoICAgICAgPSBBdXRoO1xuICAgIHRvcGljQ3RybC51c2VycyAgICAgPSBVc2VycztcbiAgICB0b3BpY0N0cmwubGFuZ3VhZ2VzID0gTGFuZ3VhZ2VzO1xuICAgIHRvcGljQ3RybC5wbGFjZXMgICAgPSBQbGFjZXM7XG4gICAgdG9waWNDdHJsLmFyY2hpdmUgICA9IEFyY2hpdmU7XG4gICAgdG9waWNDdHJsLm5vdGkgICAgICA9IE5vdGlTZXJ2aWNlO1xuXG4gICAgaWYodG9waWNDdHJsLmF1dGgucmVmLmdldEF1dGgoKSAhPSBudWxsICl7XG4gICAgICB0b3BpY0N0cmwucHJvZmlsZSAgPSB0b3BpY0N0cmwudXNlcnMuZ2V0UHJvZmlsZSh0b3BpY0N0cmwuYXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCk7XG4gICAgICB0b3BpY0N0cmwudWlkID0gdG9waWNDdHJsLnByb2ZpbGUuJGlkO1xuICAgICAgdG9waWNDdHJsLnVzZXJSZWYgPSB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKTtcbiAgICAgIHRvcGljQ3RybC51c2VyVXB2b3RlZFRvcGljcyA9IHRvcGljQ3RybC51c2Vycy51cHZvdGVzKHRvcGljQ3RybC51aWQpO1xuICAgICAgdG9waWNDdHJsLnVzZXJEb3dudm90ZWRUb3BpY3MgPSB0b3BpY0N0cmwudXNlcnMuZG93bnZvdGVzKHRvcGljQ3RybC51aWQpO1xuICAgICAgdG9waWNDdHJsLnVzZXJGb2xsb3dpbmcgPSB0b3BpY0N0cmwudXNlcnMuZm9sbG93aW5nKHRvcGljQ3RybC51aWQpO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgdG9waWNDdHJsLnByb2ZpbGUgPScnO1xuICAgICAgdG9waWNDdHJsLnVpZCA9ICcnO1xuICAgICAgdG9waWNDdHJsLnVzZXJSZWYgPSAnJztcbiAgICB9XG5cblxuXG4gICAgLy9QcmVzZXQgUGFyYW1ldGVyc1xuICAgIHRvcGljQ3RybC5pbWFnZVN0cmluZ3MgID0gW107XG4gICAgdG9waWNDdHJsLmltYWdlVGV4dCAgICAgPSBbXTtcbiAgICB0b3BpY0N0cmwuaW5SZXBseUFyciAgICA9IFtdO1xuICAgIHRvcGljQ3RybC5sb2FkQnVzeSAgICAgID0gZmFsc2U7XG4gICAgdG9waWNDdHJsLnNsdWdSZXR1cm4gICAgPSBudWxsO1xuICAgIHRvcGljQ3RybC5jcml0ZXJpYSAgICAgID0gZmFsc2U7XG4gICAgdG9waWNDdHJsLmNyaXRlcmlhUmVwbHkgPSBudWxsO1xuICAgIHRvcGljQ3RybC5yZXZpZXdDcml0ZXJpYT1mYWxzZTtcbiAgICB0b3BpY0N0cmwuY3JpdFJlcGx5RGF0YSA9IG51bGw7XG5cbiAgICAvL2lmIGFsbG93IG51bGwgaW4gdGhlIGZvcm1cbiAgICB0b3BpY0N0cmwubmV3VG9waWMgICAgICA9IHtcbiAgICAgICdsb2NhdGlvbic6ICcnLFxuICAgICAgJ3VybCcgOiAnJyxcbiAgICAgICdpcEluZm8nOiAnJyxcbiAgICAgICd0YWdzJzogJycsXG4gICAgICAnYm9keSc6ICcnXG4gICAgfVxuXG5cbiAgICAvL0NhbGMgYXZlcmFnZSByZXZpZXcgaW5wdXQgaW4gcmVwbHlcbiAgICB0b3BpY0N0cmwuYXZnUmV2aWV3UmVwbHkgPSBmdW5jdGlvbigpe1xuXG4gICAgICB2YXIgb2JqQ291bnQgPSBPYmplY3Qua2V5cyh0b3BpY0N0cmwuY3JpdGVyaWFSZXBseSkubGVuZ3RoO1xuICAgICAgdmFyIGF2ZyA9IDBcbiAgICAgIGZvcih2YXIgaT0wO2k8b2JqQ291bnQ7aSsrKXtcbiAgICAgICAgYXZnID0gYXZnICsgdG9waWNDdHJsLmNyaXRlcmlhUmVwbHlbaV07XG4gICAgICB9XG5cbiAgICAgIHRvcGljQ3RybC5yZXBseVJldmlld0F2ZXJhZ2UgPSBhdmcvb2JqQ291bnQ7XG5cbiAgICAgIGNvbnNvbGUubG9nKHRvcGljQ3RybC5jcml0ZXJpYVJlcGx5KTtcblxuICAgICAgdG9waWNDdHJsLmNyaXRSZXBseURhdGEgPSB7IGF2ZzogdG9waWNDdHJsLnJlcGx5UmV2aWV3QXZlcmFnZSwgZGF0YTogdG9waWNDdHJsLmNyaXRlcmlhUmVwbHl9XG4gICAgfVxuXG5cbiAgICAvL0dldCB0aGUgYXZlcmFnZSBzY29yZSBmcm9tIGNyaXRlcmlhIHZhbHVlc1xuICAgIHRvcGljQ3RybC5hdmdSZXZpZXdTY29yZSA9IGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgaWYoZGF0YSlcbiAgICAgIHtcbiAgICAgIHZhciBhdmcgPTA7XG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKyl7XG4gICAgICAgIGF2ZyA9IGF2ZyArIGRhdGFbaV0ucmF0aW5nO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGF2Zy9kYXRhLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIC8vTGFiZWwgZm9yIHJlbW92ZSB0b3BpY3NcbiAgICAkdHJhbnNsYXRlKFsnS0VZX1JFTU9WRScsICdLRVlfQ0FOQ0VMJywnS0VZX0NPTkZfUkVNT1ZFJywnS0VZX0NPTkZfUkVNX0MnXSkudGhlbihmdW5jdGlvbiAodHJhbnNsYXRpb25zKSB7XG4gICAgICB0b3BpY0N0cmwucmVtb3ZlVHJhbnMgPSB0cmFuc2xhdGlvbnMuS0VZX1JFTU9WRTtcbiAgICAgIHRvcGljQ3RybC5jYW5jZWxUcmFucyA9IHRyYW5zbGF0aW9ucy5LRVlfQ0FOQ0VMO1xuICAgICAgdG9waWNDdHJsLmNvbmZpcm1SZW0gID0gdHJhbnNsYXRpb25zLktFWV9DT05GX1JFTU9WRTtcbiAgICAgIHRvcGljQ3RybC5jb25maXJtUmVtQ29udGVudCA9ICB0cmFuc2xhdGlvbnMuS0VZX0NPTkZfUkVNX0M7XG4gICAgfSk7XG5cblxuICAgIHRvcGljQ3RybC51c2VyTmFtZSA9IGZ1bmN0aW9uKHVzZXJJZCl7XG4gICAgICBpZih1c2VySWQhPSBudWxsKXtcbiAgICAgICAgLy9yZXR1cm4gdG9waWNDdHJsLnVzZXJzLmdldERpc3BsYXlOYW1lKHVzZXJJZCk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuXG4gICAgLy9Mb2dpbiBmb3IgbWF0ZXJpYWxcbiAgICB0b3BpY0N0cmwuc2hvd01kTG9naW4gPSBmdW5jdGlvbihldikge1xuICAgICAgdmFyIHVzZUZ1bGxTY3JlZW4gPSAoJG1kTWVkaWEoJ3NtJykgfHwgJG1kTWVkaWEoJ3hzJykpICYmICRzY29wZS5jdXN0b21GdWxsc2NyZWVuO1xuICAgICAgJG1kRGlhbG9nLnNob3coe1xuICAgICAgICAgIC8vY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL21kLWxvZ2luLWZvcm0uaHRtbCcsXG4gICAgICAgICAgcGFyZW50OiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSksXG4gICAgICAgICAgdGFyZ2V0RXZlbnQ6IGV2LFxuICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWUsXG4gICAgICAgICAgZnVsbHNjcmVlbjogdXNlRnVsbFNjcmVlblxuICAgICAgICB9KVxuICAgIH1cblxuXG5cbiAgICB0b3BpY0N0cmwuZGVjb2RlVGV4dCA9IGZ1bmN0aW9uKHRleHQpe1xuICAgICAgLy9yZXR1cm4gJGZpbHRlcignc2x1Z2lmeScpKGl0ZW0ubmFtZSk7XG4gICAgICBjb25zb2xlLmxvZyhkZWNvZGVVUkkodGV4dCkpO1xuICAgICAgcmV0dXJuIGRlY29kZVVSSSh0ZXh0KTtcbiAgICB9XG5cblxuICAgIHRvcGljQ3RybC5sb2FkTW9yZSA9IGZ1bmN0aW9uKGl0ZW1zKSB7XG4gICAgICB0b3BpY0N0cmwubG9hZEJ1c3kgPSB0cnVlO1xuICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGF0YS5wdXNoKGl0ZW1zW2ldKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgcmV0dXJuIGRhdGFcbiAgICB9O1xuXG4gICAgdG9waWNDdHJsLmxvYWRUYWdzID0gZnVuY3Rpb24ocXVlcnkpIHtcbiAgICAgIGNvbnNvbGUubG9nKHRvcGljQ3RybC50YWdzLnRhZ3NVcmwoKSk7XG4gICAgfTtcblxuXG4gICAgLyp0b3BpY0N0cmwudXNlcnMuZ2V0TG9jYXRpb25JUCgpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmlwSW5mbyA9IGRhdGE7XG4gICAgfSk7Ki9cblxuXG4gICAgLy9VcGxvYWQgUHJvZmlsZSBpbWFnZVxuICAgIHRvcGljQ3RybC51cGxvYWRGaWxlID0gZnVuY3Rpb24oZmlsZXMsaW5kZXgpIHtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChmaWxlcywgZnVuY3Rpb24gKGZsb3dGaWxlLCBpbmRleCkge1xuICAgICAgICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgdmFyIHVyaSA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgdG9waWNDdHJsLmltYWdlU3RyaW5nc1tpbmRleF0gPSB1cmk7XG4gICAgICAgIH07XG4gICAgICAgIGZpbGVSZWFkZXIucmVhZEFzRGF0YVVSTChmbG93RmlsZS5maWxlKTtcbiAgICAgIH0pXG4gICAgfTtcblxuXG4gICAgLy9TaG93IGNvbmZpcm0gcmVtb3ZlIHRvcGljXG4gICAgdG9waWNDdHJsLnNob3dDb25maXJtUmVtb3ZlID0gZnVuY3Rpb24oZXYsdG9waWNfb3duZXIsb2JqKXtcbiAgICAgIC8vIEFwcGVuZGluZyBkaWFsb2cgdG8gZG9jdW1lbnQuYm9keSB0byBjb3ZlciBzaWRlbmF2IGluIGRvY3MgYXBwXG4gICAgICB2YXIgY29uZmlybSA9ICRtZERpYWxvZy5jb25maXJtKClcbiAgICAgICAgLnRpdGxlKHRvcGljQ3RybC5jb25maXJtUmVtKVxuICAgICAgICAudGV4dENvbnRlbnQodG9waWNDdHJsLmNvbmZpcm1SZW1Db250ZW50KVxuICAgICAgICAudGFyZ2V0RXZlbnQoZXYpXG4gICAgICAgIC5vayh0b3BpY0N0cmwucmVtb3ZlVHJhbnMpXG4gICAgICAgIC5jYW5jZWwodG9waWNDdHJsLmNhbmNlbFRyYW5zKTtcbiAgICAgICRtZERpYWxvZy5zaG93KGNvbmZpcm0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKHRvcGljQ3RybC5yZW1vdmVUb3BpYyh0b3BpY19vd25lcixvYmopKXtcbiAgICAgICAgICAkc3RhdGUuZ28oJ2Rhc2hib2FyZCcpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG5cbiAgICAvL1JlbW92ZSB0b3BpY1xuICAgIHRvcGljQ3RybC5yZW1vdmVUb3BpYyA9IGZ1bmN0aW9uKHRvcGljX293bmVyLG9iail7XG4gICAgICAvL3ZlcmlmeSBpZiB0aGUgdG9waWMgb3duZXIgYW5kIHRoZSBsb2dpbiBvd25lciBpcyB0aGUgc2FtZSBwcGxcbiAgICAgIGlmKHRvcGljX293bmVyID09IHRvcGljQ3RybC51aWQpe1xuICAgICAgICBtb3ZlRmJSZWNvcmQodG9waWNDdHJsLnRvcGljcy5yZWZDaGlsZChvYmouJGlkKSwgdG9waWNDdHJsLmFyY2hpdmUuYWRkQ2hpbGQob2JqLiRpZCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8vUmVwbHkgdG8gdG9waWNcbiAgICB0b3BpY0N0cmwucmVwbHkgPSBmdW5jdGlvbih0b3BpY09iail7XG5cbiAgICAgIHRvcGljQ3RybC50b3BpY3MucmVwbHlBcnIodG9waWNPYmouJGlkKS4kYWRkKHtcbiAgICAgICAgdG9waWNJZDogIHRvcGljT2JqLiRpZCxcbiAgICAgICAgYm9keTogICAgIHRvcGljQ3RybC5uZXdSZXBseS5ib2R5LFxuICAgICAgICB1aWQ6ICAgICAgdG9waWNDdHJsLnVpZCxcbiAgICAgICAgcmV2aWV3OiAgIHRvcGljQ3RybC5jcml0UmVwbHlEYXRhLFxuICAgICAgICBjcmVhdGVkOiAgbW9tZW50KCkudG9JU09TdHJpbmcoKVxuICAgICAgfSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAvL05vdGlmeSB0b3BpYyBvd25lclxuICAgICAgICAvL3RvcGljT2JqIHJlZmVycyB0byB0aGUgcHJvcGVydHkgb2YgdGhpcyBvYmplY3RcbiAgICAgICAgdG9waWNDdHJsLm5vdGkudXBkYXRlTm90aWZpY2F0aW9uQ291bnQodG9waWNPYmouJGlkLHRvcGljT2JqLnVpZCx0b3BpY0N0cmwudWlkKTtcbiAgICAgIH0pXG5cblxuXG5cblxuXG4gICAgICB0b3BpY0N0cmwudG9waWNzLnJlcGx5Q291bnQodG9waWNPYmouJGlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgaWYoIWRhdGEuY291bnQpe1xuICAgICAgICAgIHRvcGljQ3RybC50b3BpY3MucmVwbHlDb3VudFJlZih0b3BpY09iai4kaWQpLnNldCgxKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdG9waWNDdHJsLnRvcGljcy5yZXBseUNvdW50UmVmKHRvcGljT2JqLiRpZClcbiAgICAgICAgICAgIC5zZXQoZGF0YS5jb3VudCArMSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG5cbiAgICAgIC8vU3RhdCB1cGRhdGUgZm9yIHVzZXJcbiAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L2NvbW1lbnQvY291bnQnKVxuICAgICAgICAuc2V0KHRvcGljQ3RybC5wcm9maWxlLnN0YXQuY29tbWVudC5jb3VudCArIDEpO1xuXG4gICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9jb21tZW50L3RvcGljcy8nK3RvcGljT2JqLiRpZClcbiAgICAgICAgLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XG4gICAgfVxuXG5cblxuICAgIC8vUmVwbHkgaW4gcmVwbHlcbiAgICB0b3BpY0N0cmwucmVwbHlJblJlcGx5ID0gZnVuY3Rpb24odG9waWNJZCxyZXBseUlkKXtcbiAgICAgIHRvcGljQ3RybC50b3BpY3MucmVwbHlJblJlcGx5QXJyKHRvcGljSWQscmVwbHlJZCkuJGFkZCh7XG4gICAgICAgIGJvZHk6ICAgICB0b3BpY0N0cmwucmVwbHlJblJlcGx5LmJvZHksXG4gICAgICAgIHVpZDogICAgICB0b3BpY0N0cmwudWlkLFxuICAgICAgICBjcmVhdGVkOiAgbW9tZW50KCkudG9JU09TdHJpbmcoKVxuICAgICAgfSlcbiAgICB9XG5cblxuXG4gICAgdG9waWNDdHJsLmFkZE5ld0Nob2ljZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5ld0l0ZW1ObyA9IHRvcGljQ3RybC5yZXZpZXdDcml0ZXJpYS5sZW5ndGgrMTtcbiAgICAgIHRvcGljQ3RybC5yZXZpZXdDcml0ZXJpYS5wdXNoKHsnaWQnOidjcml0ZXJpYScrbmV3SXRlbU5vfSk7XG4gICAgfTtcblxuICAgIHRvcGljQ3RybC5yZW1vdmVDaG9pY2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0SXRlbSA9IHRvcGljQ3RybC5yZXZpZXdDcml0ZXJpYS5sZW5ndGgtMTtcbiAgICAgIHRvcGljQ3RybC5yZXZpZXdDcml0ZXJpYS5zcGxpY2UobGFzdEl0ZW0pO1xuICAgIH07XG5cblxuICAgIC8vQ3JlYXRlIG5ldyB0b3BpY1xuICAgIHRvcGljQ3RybC5jcmVhdGVUb3BpYyA9IGZ1bmN0aW9uKGNhdGVnb3J5LGlzRHJhZnQpe1xuXG4gICAgICAvL0NoZWNrIGlmIHdlIGhhdmUgbG9jYXRpb24gZGV0YWlsc1xuICAgICAgdmFyIGxvY2F0aW9uRGV0YWlsID0gJyc7XG5cbiAgICAgIGlmKHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbiAhPT0gJycgKXtcbiAgICAgICAgY29uc29sZS5sb2codG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uKTtcbiAgICAgICAgbG9jYXRpb25EZXRhaWwgPSB7XG4gICAgICAgICAgcGxhY2VfaWQ6IHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLnBsYWNlX2lkLFxuICAgICAgICAgIHNsdWc6ICAgICBTbHVnLnNsdWdpZnkodG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uLmRldGFpbHMubmFtZSksXG4gICAgICAgICAgbmFtZTogICAgIHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLm5hbWUsXG4gICAgICAgICAgYWRkcmVzczogIHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgIGxhdDogICAgICB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5nZW9tZXRyeS5sb2NhdGlvbi5sYXQoKSxcbiAgICAgICAgICBsbmc6ICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uLmRldGFpbHMuZ2VvbWV0cnkubG9jYXRpb24ubG5nKCksXG4gICAgICAgICAgbG5nOiAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxuICAgICAgICAgIGxuZzogICAgICB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5nZW9tZXRyeS5sb2NhdGlvbi5sbmcoKSxcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgIC8qIERFQlVHIEZPUk0gVkFMVUVcbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIHR5cGU6ICAgICAgICAgICB0b3BpY0N0cmwudHlwZSxcbiAgICAgICAgbGFuZzogICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5sYW5nLFxuICAgICAgICB0b3BpYzogICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLnRvcGljLFxuICAgICAgICBib2R5OiAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmJvZHksXG4gICAgICAgIGNhdGVnb3J5OiAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgdWlkOiAgICAgICAgICAgIHRvcGljQ3RybC51aWQsXG4gICAgICAgIHNsdWc6ICAgICAgICAgICBTbHVnLnNsdWdpZnkodG9waWNDdHJsLm5ld1RvcGljLnRvcGljKSxcbiAgICAgICAgcGhvdG9zOiAgICAgICAgIHRvcGljQ3RybC5pbWFnZVN0cmluZ3MsXG4gICAgICAgIHBob3Rvc190ZXh0OiAgICB0b3BpY0N0cmwuaW1hZ2VUZXh0LFxuICAgICAgICBsb2NhdGlvbjogICAgICAgbG9jYXRpb25EZXRhaWwsXG4gICAgICAgIHVybDogICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMudXJsLFxuICAgICAgICBkcmFmdDogICAgICAgICAgaXNEcmFmdCxcbiAgICAgICAgY3JlYXRlZDogICAgICAgIG1vbWVudCgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIHRhZ3M6ICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMudGFncyxcbiAgICAgICAgdXNlcklQOiAgICAgICB0b3BpY0N0cmwubmV3VG9waWMuaXBJbmZvXG4gICAgICB9O1xuICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAqL1xuXG4gICAgICB0b3BpY0N0cmwudG9waWNzLmFyci4kYWRkKHtcbiAgICAgICAgICB0eXBlOiAgICAgICAgICAgdG9waWNDdHJsLnR5cGUsXG4gICAgICAgICAgbGFuZzogICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5sYW5nLFxuICAgICAgICAgIHRvcGljOiAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMudG9waWMsXG4gICAgICAgICAgYm9keTogICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5ib2R5LFxuICAgICAgICAgIGNhdGVnb3J5OiAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgICB1aWQ6ICAgICAgICAgICAgdG9waWNDdHJsLnVpZCxcbiAgICAgICAgICAvL3NsdWc6ICAgICAgICAgICBTbHVnLnNsdWdpZnkodG9waWNDdHJsLm5ld1RvcGljLnRvcGljKSxcbiAgICAgICAgICBzbHVnOiAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLnRvcGljLFxuICAgICAgICAgIHBob3RvczogICAgICAgICB0b3BpY0N0cmwuaW1hZ2VTdHJpbmdzLFxuICAgICAgICAgIHBob3Rvc190ZXh0OiAgICB0b3BpY0N0cmwuaW1hZ2VUZXh0LFxuICAgICAgICAgIGxvY2F0aW9uOiAgICAgICBsb2NhdGlvbkRldGFpbCxcbiAgICAgICAgICB1cmw6ICAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLnVybCxcbiAgICAgICAgICBkcmFmdDogICAgICAgICAgaXNEcmFmdCxcbiAgICAgICAgICBjcmVhdGVkOiAgICAgICAgbW9tZW50KCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICB0YWdzOiAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLnRhZ3MsXG4gICAgICAgICAgdXNlcklQOiAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5pcEluZm8sXG4gICAgICAgICAgcmV2aWV3OiAgICAgICAgIHRvcGljQ3RybC5yZXZpZXdDcml0ZXJpYSxcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbih0b3BpYyl7XG5cbiAgICAgICAgICB2YXIgc2x1Z1RleHQgPScnO1xuICAgICAgICAgIC8vaWYgd2UgYXJlIHVuYWJsZSB0byBjb252ZXJ0IHRvIHNsdWcgdGhlbiB3ZSB1c2UgdGhlIHRvcGljIHRleHQsIGVsc2UgdXNlIHNsdWdcbiAgICAgICAgICBpZihTbHVnLnNsdWdpZnkodG9waWNDdHJsLm5ld1RvcGljLnRvcGljKSA9PScnKXtcbiAgICAgICAgICAgIHNsdWdUZXh0ID0gdG9waWNDdHJsLm5ld1RvcGljLnRvcGljO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgc2x1Z1RleHQgPSBTbHVnLnNsdWdpZnkodG9waWNDdHJsLm5ld1RvcGljLnRvcGljKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL1VwZGF0ZSBzbHVnIHdpdGggdG9waWMgS2V5XG4gICAgICAgICAgdG9waWNDdHJsLnRvcGljcy5nZXRUb3BpY0J5S2V5KHRvcGljLmtleSgpKS51cGRhdGUoe1wic2x1Z1wiOnNsdWdUZXh0K3RvcGljLmtleSgpfSk7XG5cbiAgICAgICAgICAvL1N0YXQgdXBkYXRlXG4gICAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvcG9zdGVkL2NvdW50JylcbiAgICAgICAgICAgIC5zZXQodG9waWNDdHJsLnByb2ZpbGUuc3RhdC5wb3N0ZWQuY291bnQgKyAxKTtcblxuICAgICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L3Bvc3RlZC90b3BpY3MvJyt0b3BpYy5rZXkoKSlcbiAgICAgICAgICAgIC5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xuXG4gICAgICAgICAgLy9JZiB0aGVyZSBpcyBsb2NhdGlvblxuICAgICAgICAgIGlmKGxvY2F0aW9uRGV0YWlsICE9PSAnJyl7XG5cbiAgICAgICAgICAgIHRvcGljQ3RybC5wbGFjZXMuYWRkQ2hpbGQobG9jYXRpb25EZXRhaWwucGxhY2VfaWQpXG4gICAgICAgICAgICAgICAgICAgICAgLmNoaWxkKHRvcGljLmtleSgpKVxuICAgICAgICAgICAgICAgICAgICAgIC5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xuXG4gICAgICAgICAgICB0b3BpY0N0cmwucGxhY2VzLmFkZENoaWxkKGxvY2F0aW9uRGV0YWlsLnBsYWNlX2lkKVxuICAgICAgICAgICAgICAuY2hpbGQoJ2luZm8nKS5zZXQobG9jYXRpb25EZXRhaWwpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vaWYgdGhlcmUgYXJlIHRhZ3NcbiAgICAgICAgICBpZih0b3BpY0N0cmwubmV3VG9waWMudGFncyAhPT0gbnVsbCl7XG4gICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgdG9waWNDdHJsLm5ld1RvcGljLnRhZ3MubGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICAgICAgICAgIHRvcGljQ3RybC50YWdzLmFkZENoaWxkKHRvcGljQ3RybC5uZXdUb3BpYy50YWdzW2luZGV4XS50ZXh0KVxuICAgICAgICAgICAgICAgIC5jaGlsZCh0b3BpYy5rZXkoKSkucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL05vdGlmeSBmb2xsb3dlclxuICAgICAgICAgIHRvcGljQ3RybC5ub3RpLm5vdGlmeUZvbGxvd2VyKHRvcGljLmtleSgpLHRvcGljQ3RybC51aWQpO1xuXG5cbiAgICAgICAgICAvL1Jlc2V0IGZvcm0gaGVyZVxuICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYyA9IHtcbiAgICAgICAgICAgIGJvZHk6ICcnXG4gICAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIC8vQ2hlY2sgaWYgdXNlciBpcyBhbHJlYWR5IGZvbGxvd2luZyB1c2VyXG4gICAgdG9waWNDdHJsLmNoZWNrRm9sbG93ID0gZnVuY3Rpb24oZm9sbG93X3VpZCl7XG4gICAgICBpZih0b3BpY0N0cmwudXNlcnMuY2hlY2tGb2xsb3codG9waWNDdHJsLnVpZCxmb2xsb3dfdWlkKSl7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIC8vRm9sbG93IFVzZXJcbiAgICB0b3BpY0N0cmwuZm9sbG93VXNlciA9IGZ1bmN0aW9uKGZvbGxvd191aWQpe1xuXG4gICAgICAvL1VwZGF0ZSB0aGUgcGVyc29uIHRoYXQgYmVpbmcgZm9sbG93LCBjcmVkaXQgdGhlbSBmb3IgaGF2aW5nIGZvbGxvd2VyXG4gICAgICB0b3BpY0N0cmwudXNlcnMuZ2V0UHJvZmlsZShmb2xsb3dfdWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKGZvbGxvd191aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2VyL2NvdW50JylcbiAgICAgICAgICAuc2V0KGRhdGEuc3RhdC5mb2xsb3dlci5jb3VudCArIDEpO1xuXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKGZvbGxvd191aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2VyL3VpZC8nKyB0b3BpY0N0cmwudWlkKVxuICAgICAgICAgIC5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vVXBkYXRlIHRoZSBwZXJzb24gdGhhdCBpcyBmb2xsb3dpbmcsIGNyZWRpdCB0aGVtIGZvciBoYXZpbmcgZm9sbG93aW5nXG4gICAgICB0b3BpY0N0cmwudXNlcnMuZ2V0UHJvZmlsZSh0b3BpY0N0cmwudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2luZy9jb3VudCcpXG4gICAgICAgICAgLnNldChkYXRhLnN0YXQuZm9sbG93ZXIuY291bnQgKyAxKTtcblxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dpbmcvdWlkLycrIGZvbGxvd191aWQpXG4gICAgICAgICAgLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XG4gICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vVW5mb2xsb3cgVXNlclxuICAgIHRvcGljQ3RybC51bmZvbGxvd1VzZXIgPSBmdW5jdGlvbihmb2xsb3dfdWlkKXtcblxuICAgICAgLy9VcGRhdGUgdGhlIHBlcnNvbiB0aGF0IGJlaW5nIGZvbGxvdywgY3JlZGl0IHRoZW0gZm9yIGhhdmluZyBmb2xsb3dlclxuICAgICAgdG9waWNDdHJsLnVzZXJzLmdldFByb2ZpbGUoZm9sbG93X3VpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZihmb2xsb3dfdWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dlci9jb3VudCcpXG4gICAgICAgICAgLnNldChkYXRhLnN0YXQuZm9sbG93ZXIuY291bnQgLSAxKTtcblxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZihmb2xsb3dfdWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dlci91aWQvJysgdG9waWNDdHJsLnVpZCkucmVtb3ZlKCk7XG4gICAgICB9KTtcblxuICAgICAgLy9VcGRhdGUgdGhlIHBlcnNvbiB0aGF0IGlzIGZvbGxvd2luZywgY3JlZGl0IHRoZW0gZm9yIGhhdmluZyBmb2xsb3dpbmdcbiAgICAgIHRvcGljQ3RybC51c2Vycy5nZXRQcm9maWxlKHRvcGljQ3RybC51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvZm9sbG93aW5nL2NvdW50JylcbiAgICAgICAgICAuc2V0KGRhdGEuc3RhdC5mb2xsb3dpbmcuY291bnQgLSAxKTtcblxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dpbmcvdWlkLycrIGZvbGxvd191aWQpLnJlbW92ZSgpO1xuICAgICAgfSk7XG5cbiAgICB9XG5cblxuXG4gICAgIC8vdXB2b3RlXG4gICAgdG9waWNDdHJsLnVwdm90ZSA9IGZ1bmN0aW9uKHRvcGljKXtcblxuICAgICAgaWYodG9waWMuZG93bnZvdGVzICE9IHVuZGVmaW5lZCAmJiB0b3BpYy5kb3dudm90ZXNbdG9waWNDdHJsLnVpZF0gIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgdG9waWNDdHJsLmNhbmNlbERvd252b3RlKHRvcGljKTtcbiAgICAgIH1cbiAgICAgIHRvcGljQ3RybC50b3BpY3MudXB2b3RlVG9waWModG9waWMuJGlkLCB0b3BpY0N0cmwudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgIHRvcGljQ3RybC51c2VyVXB2b3RlZFRvcGljcy5jaGlsZCh0b3BpYy4kaWQpLnNldCh2YWx1ZS4kdmFsdWUpO1xuXG4gICAgICAgIC8vU3RhdCB1cGRhdGVcbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLmdldFByb2ZpbGUodG9waWMudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljLnVpZCkuY2hpbGQoJ3N0YXQvdXB2b3RlZC9jb3VudCcpXG4gICAgICAgICAgLnNldChkYXRhLnN0YXQudXB2b3RlZC5jb3VudCArIDEpO1xuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpYy51aWQpLmNoaWxkKCdzdGF0L3Vwdm90ZWQvdG9waWNzLycrdG9waWMuJGlkKVxuICAgICAgICAgIC5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICB9KTtcblxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRvcGljQ3RybC5jYW5jZWxVcHZvdGUgPSBmdW5jdGlvbih0b3BpYyl7XG4gICAgICB0b3BpY0N0cmwudG9waWNzLnVuZG9VcHZvdGUodG9waWMuJGlkLCB0b3BpY0N0cmwudWlkKTtcblxuICAgICAgdG9waWNDdHJsLnVzZXJzLmdldFByb2ZpbGUodG9waWMudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgIC8vU3RhdCB1cGRhdGVcbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWMudWlkKS5jaGlsZCgnc3RhdC91cHZvdGVkL2NvdW50JylcbiAgICAgICAgICAuc2V0KGRhdGEuc3RhdC51cHZvdGVkLmNvdW50IC0gMSk7XG5cbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWMudWlkKS5jaGlsZCgnc3RhdC91cHZvdGVkL3RvcGljcy8nK3RvcGljLiRpZCkucmVtb3ZlKCk7XG4gICAgICB9KTtcblxuXG4gICAgICB0b3BpY0N0cmwudXNlclVwdm90ZWRUb3BpY3MuY2hpbGQodG9waWMuJGlkKS5yZW1vdmUoZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOlwiLCBlcnJvcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVtb3ZlZCBzdWNjZXNzZnVsbHkhXCIpO1xuICAgICAgICAgIH19KTtcbiAgICB9O1xuXG4gICAgLy9kb3dudm90ZVxuICAgIHRvcGljQ3RybC5kb3dudm90ZSA9IGZ1bmN0aW9uKHRvcGljKXtcbiAgICAgIGlmKHRvcGljLnVwdm90ZXMgIT0gdW5kZWZpbmVkICYmIHRvcGljLnVwdm90ZXNbdG9waWNDdHJsLnVpZF0gIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgdG9waWNDdHJsLmNhbmNlbFVwdm90ZSh0b3BpYyk7XG4gICAgICB9XG4gICAgICB0b3BpY0N0cmwudG9waWNzLmRvd252b3RlVG9waWModG9waWMuJGlkLCB0b3BpY0N0cmwudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgIHRvcGljQ3RybC51c2VyRG93bnZvdGVkVG9waWNzLmNoaWxkKHRvcGljLiRpZCkuc2V0KHZhbHVlLiR2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdG9waWNDdHJsLmNhbmNlbERvd252b3RlID0gZnVuY3Rpb24odG9waWMpe1xuICAgICAgdG9waWNDdHJsLnRvcGljcy51bmRvRG93bnZvdGUodG9waWMuJGlkLCB0b3BpY0N0cmwudWlkKTtcbiAgICAgIHRvcGljQ3RybC51c2VyRG93bnZvdGVkVG9waWNzLmNoaWxkKHRvcGljLiRpZCkucmVtb3ZlKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjpcIiwgZXJyb3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlbW92ZWQgc3VjY2Vzc2Z1bGx5IVwiKTtcbiAgICAgICAgICB9fSk7XG4gICAgfTtcblxuICAgIC8vZm9sbG93IHRvcGljXG4gICAgdG9waWNDdHJsLmZvbGxvd1RvcGljID0gZnVuY3Rpb24odG9waWMpe1xuICAgICAgdG9waWNDdHJsLnRvcGljcy5mb2xsb3codG9waWMuJGlkLCB0b3BpY0N0cmwudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgIHRvcGljQ3RybC51c2VyRm9sbG93aW5nLmNoaWxkKHRvcGljLiRpZCkuc2V0KHZhbHVlLmhpc3RvcnlbdG9waWNDdHJsLnVpZF0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRvcGljQ3RybC51bmZvbGxvd1RvcGljID0gZnVuY3Rpb24odG9waWMpe1xuICAgICAgdG9waWNDdHJsLnRvcGljcy51bmZvbGxvdyh0b3BpYy4kaWQsIHRvcGljQ3RybC51aWQpO1xuICAgICAgdG9waWNDdHJsLnVzZXJGb2xsb3dpbmcuY2hpbGQodG9waWMuJGlkKS5yZW1vdmUoZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOlwiLCBlcnJvcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVtb3ZlZCBzdWNjZXNzZnVsbHkhXCIpO1xuICAgICAgICAgIH19KTtcbiAgICB9O1xuXG4gIH0pO1xuXG5cbi8vaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20va2F0b3d1bGYvNjA5OTA0MlxuZnVuY3Rpb24gbW92ZUZiUmVjb3JkKG9sZFJlZiwgbmV3UmVmKSB7XG4gIG9sZFJlZi5vbmNlKCd2YWx1ZScsIGZ1bmN0aW9uIChzbmFwKSB7XG4gICAgbmV3UmVmLnNldChzbmFwLnZhbCgpLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgb2xkUmVmLnJlbW92ZSgpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAodHlwZW9mKGNvbnNvbGUpICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAvLyBUb3BpYyBsaXN0XG4gIC5mYWN0b3J5KCdUb3BpY3MnLCBmdW5jdGlvbiAoJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBcnJheSwgRmlyZWJhc2VVcmwpIHtcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsICsgJ3RvcGljcycpXG4gICAgdmFyIHRvcGljcyA9ICRmaXJlYmFzZU9iamVjdChyZWYpXG4gICAgdmFyIHRvcGljc0FyciA9ICRmaXJlYmFzZUFycmF5KHJlZilcbiAgICB2YXIgdG9waWNLZXkgPSAnJ1xuXG4gICAgdmFyIFRvcGljcyA9IHtcbiAgICAgIC8vIEdldCB0b3BpYyB0YWdcbiAgICAgIGdldFRhZzogZnVuY3Rpb24gKHRhZykge1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLm9yZGVyQnlDaGlsZCgndGFncycpLmVxdWFsVG8odGFnKSlcbiAgICAgIH0sXG5cbiAgICAgIC8vIEdldCB0b3BpYyBzbHVnXG4gICAgICBnZXRTbHVnOiBmdW5jdGlvbiAoc2x1Zykge1xuICAgICAgICB2YXIgZGF0YSA9IHJlZi5vcmRlckJ5Q2hpbGQoJ3NsdWcnKS5lcXVhbFRvKHNsdWcpXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShkYXRhKVxuICAgICAgfSxcblxuICAgICAgLy8gR2V0dGluZyB0aGUgbGlzdCBvZiB0b3BpY3MgY3JlYXRlZCBieSB1c2VyX2lkXG4gICAgICBjcmVhdGVkQnk6IGZ1bmN0aW9uICh1aWQpIHtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5vcmRlckJ5Q2hpbGQoJ3VpZCcpLmVxdWFsVG8odWlkKSlcblxuICAgICAgfSxcbiAgICAgIHJlZkNoaWxkOiBmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZChjaGlsZClcbiAgICAgIH0sXG4gICAgICBjb3VudFVzZXJUb3BpY3M6IGZ1bmN0aW9uICgpIHt9LFxuXG4gICAgICAvLyBHZXR0aW5nIHRoZSBsaXN0IG9mIHRvcGljIGJhc2Ugb24gY2F0ZWdvcnlcbiAgICAgIGxpc3Q6IGZ1bmN0aW9uIChjYXRlZ29yeSkge1xuICAgICAgICB2YXIgZGF0YSA9IHJlZi5vcmRlckJ5Q2hpbGQoJ2NhdGVnb3J5JykuZXF1YWxUbyhjYXRlZ29yeSlcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KGRhdGEpXG4gICAgICB9LFxuXG4gICAgICBuYW1lOiBmdW5jdGlvbiAodG9waWNfc2x1Zykge1xuICAgICAgICB2YXIgZGF0YSA9IHJlZi5vcmRlckJ5Q2hpbGQoJ3NsdWcnKS5lcXVhbFRvKHRvcGljX3NsdWcpXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QoZGF0YSlcbiAgICAgIH0sXG5cbiAgICAgIC8vIFJldHVybiB0b3BpYyBkZXRhaWxzIGluIFJlZlxuICAgICAgZm9ydG9waWNSZWY6IGZ1bmN0aW9uICh0b3BpY19zbHVnKSB7XG4gICAgICAgIHJldHVybiByZWYub3JkZXJCeUNoaWxkKCdzbHVnJykuZXF1YWxUbyh0b3BpY19zbHVnKVxuICAgICAgfSxcblxuICAgICAgZ2V0VG9waWNCeUtleTogZnVuY3Rpb24gKHRvcGljX2tleSkge1xuICAgICAgICByZXR1cm4gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsICsgJ3RvcGljcy8nICsgdG9waWNfa2V5KVxuICAgICAgfSxcblxuICAgICAgZ2V0VG9waWNCeVNsdWc6IGZ1bmN0aW9uICh0b3BpY19zbHVnKSB7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYub3JkZXJCeUNoaWxkKCdzbHVnJykuZXF1YWxUbyh0b3BpY19zbHVnKS5saW1pdFRvRmlyc3QoMSkpXG4gICAgICB9LFxuXG4gICAgICBpbmNyZW1lbnRWaWV3OiBmdW5jdGlvbiAodG9waWNfc2x1Zykge30sXG5cbiAgICAgIC8vIFJldHVybiB0b3BpYyBkZXRhaWxzIGluIGFycmF5XG4gICAgICBmb3J0b3BpYzogZnVuY3Rpb24gKHRvcGljX3NsdWcpIHtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KFRvcGljcy5mb3J0b3BpY1JlZih0b3BpY19zbHVnKSlcbiAgICAgIH0sXG5cbiAgICAgIC8vIFJlcGx5IGxpc3RpbmdcbiAgICAgIHJlcGx5TGlzdDogZnVuY3Rpb24gKHRvcGljSWQpIHtcbiAgICAgICAgdmFyIGRhdGEgPSByZWYuY2hpbGQodG9waWNJZCArICcvcmVwbGllcycpXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShkYXRhKVxuICAgICAgfSxcblxuICAgICAgLy8gUmVwbHkgQXJyYXlcbiAgICAgIHJlcGx5QXJyOiBmdW5jdGlvbiAodG9waWNJZCkge1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKHRvcGljSWQgKyAnL3JlcGxpZXMnKSlcbiAgICAgIH0sXG5cbiAgICAgIC8vIFJlcGx5IGNvdW50XG4gICAgICByZXBseUNvdW50OiBmdW5jdGlvbiAodG9waWNJZCkge1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9yZXBsaWVzLycpKVxuICAgICAgfSxcbiAgICAgIHJlcGx5Q291bnRSZWY6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XG4gICAgICAgIHJldHVybiByZWYuY2hpbGQodG9waWNJZCArICcvcmVwbGllcy9jb3VudCcpXG4gICAgICB9LFxuXG4gICAgICByZXBseUluUmVwbHk6IGZ1bmN0aW9uICh0b3BpY0lkLCByZXBseUlkKSB7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQodG9waWNJZCArICcvcmVwbGllcy8nICsgcmVwbHlJZCArICcvaW5SZXBseScpKVxuICAgICAgfSxcblxuICAgICAgLy8gUmVwbHkgaW4gUmVwbHkgQXJyYXlcbiAgICAgIHJlcGx5SW5SZXBseUFycjogZnVuY3Rpb24gKHRvcGljSWQsIHJlcGx5SWQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKHRvcGljSWQgKyAnL3JlcGxpZXMvJytyZXBseUlkKycvaW5SZXBseScpKSlcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9yZXBsaWVzLycgKyByZXBseUlkICsgJy9pblJlcGx5JykpXG4gICAgICB9LFxuXG4gICAgICAvLyB1cHZvdGVzXG4gICAgICBnZXRVcHZvdGVzOiBmdW5jdGlvbiAodG9waWNJZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlZjogcmVmLmNoaWxkKHRvcGljSWQgKyAnL3Vwdm90ZXMnKSxcbiAgICAgICAgICBhcnJheTogJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKHRvcGljSWQgKyAnL3Vwdm90ZXMnKSlcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLy8gZG93bnZvdGVzXG4gICAgICBnZXREb3dudm90ZXM6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmVmOiByZWYuY2hpbGQodG9waWNJZCArICcvZG93bnZvdGVzJyksXG4gICAgICAgICAgYXJyYXk6ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9kb3dudm90ZXMnKSlcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLy8gZm9sbG93ZXJzXG4gICAgICBnZXRGb2xsb3dlcnM6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmVmOiByZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJyksXG4gICAgICAgICAgb2JqOiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpKVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICB1cHZvdGVUb3BpYzogZnVuY3Rpb24gKHRvcGljSWQsIHVpZCkge1xuICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvdXB2b3RlcycpLmNoaWxkKHVpZCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL3Vwdm90ZXMnKS5jaGlsZCh1aWQpKVxuICAgICAgfSxcblxuICAgICAgdW5kb1Vwdm90ZTogZnVuY3Rpb24gKHRvcGljSWQsIHVpZCkge1xuICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvdXB2b3RlcycpLmNoaWxkKHVpZCkucmVtb3ZlKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOicsIGVycm9yKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVtb3ZlZCBzdWNjZXNzZnVsbHkhJylcbiAgICAgICAgICB9fSlcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZCh0b3BpY0lkICsgJy91cHZvdGVzJylcbiAgICAgIH0sXG5cbiAgICAgIGRvd252b3RlVG9waWM6IGZ1bmN0aW9uICh0b3BpY0lkLCB1aWQpIHtcbiAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL2Rvd252b3RlcycpLmNoaWxkKHVpZCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL2Rvd252b3RlcycpLmNoaWxkKHVpZCkpXG4gICAgICB9LFxuXG4gICAgICB1bmRvRG93bnZvdGU6IGZ1bmN0aW9uICh0b3BpY0lkLCB1aWQpIHtcbiAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL2Rvd252b3RlcycpLmNoaWxkKHVpZCkucmVtb3ZlKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOicsIGVycm9yKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVtb3ZlZCBzdWNjZXNzZnVsbHkhJylcbiAgICAgICAgICB9fSlcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9kb3dudm90ZXMnKVxuICAgICAgfSxcblxuICAgICAgZm9sbG93OiBmdW5jdGlvbiAodG9waWNJZCwgdWlkKSB7XG4gICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKS5jaGlsZCgnaGlzdG9yeScpLmNoaWxkKHVpZCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpXG4gICAgICAgICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykuY2hpbGQoJ2NvdW50JykpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgaWYgKGRhdGEudmFsdWUgPT09IG51bGwgfHwgZGF0YS52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykuY2hpbGQoJ2NvdW50Jykuc2V0KDEpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKS5jaGlsZCgnY291bnQnKS5zZXQoZGF0YS4kdmFsdWUgKyAxKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKSlcbiAgICAgIH0sXG5cbiAgICAgIHVuZm9sbG93OiBmdW5jdGlvbiAodG9waWNJZCwgdWlkKSB7XG4gICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKS5jaGlsZCgnaGlzdG9yeScpLmNoaWxkKHVpZCkucmVtb3ZlKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOicsIGVycm9yKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVtb3ZlZCBzdWNjZXNzZnVsbHkhJylcbiAgICAgICAgICAgICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykuY2hpbGQoJ2NvdW50JykpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKS5jaGlsZCgnY291bnQnKS5zZXQoZGF0YS4kdmFsdWUgLSAxKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9fSlcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKVxuICAgICAgfSxcblxuICAgICAgZ2V0Vmlld3M6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmVmOiByZWYuY2hpbGQodG9waWNJZCkuY2hpbGQoJ3ZpZXdzJyksXG4gICAgICAgICAgb2JqOiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQpLmNoaWxkKCd2aWV3cycpKVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBsYXRlc3RGZWVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYub3JkZXJCeUNoaWxkKCdjcmVhdGVkJykubGltaXRUb0xhc3QoMTApKVxuICAgICAgfSxcblxuICAgICAgdG9waWNzQnlUYWc6IGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5vcmRlckJ5Q2hpbGQoJ3RhZ3MnKS5lcXVhbFRvKHRhZykpXG4gICAgICB9LFxuXG4gICAgICAvLyBSZXR1cm4gYXJyYXlcbiAgICAgIGFycjogJGZpcmViYXNlQXJyYXkocmVmKSxcblxuICAgICAgYWxsOiB0b3BpY3MsXG4gICAgICByZWY6IHJlZlxuICAgIH07XG5cbiAgICByZXR1cm4gVG9waWNzXG5cbiAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmNvbnRyb2xsZXIoJ1Byb2ZpbGVDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkc3RhdGUsICRmaWx0ZXIsIG1kNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9TZXJ2aWNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBdXRoLFVzZXJzLFRvcGljcywgRmFjZWJvb2ssbm90aWZ5LENhdGVTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1Jlc29sdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZmlsZSxpc093bmVyLHVzZXJQb3N0cyl7XG5cbiAgICBjb25zb2xlLmxvZyhcIlByb2ZpbGVDdHJsXCIpO1xuXG4gICAgdmFyIHByb2ZpbGVDdHJsID0gdGhpcztcblxuICAgIC8vUGFyc2VyXG4gICAgcHJvZmlsZUN0cmwucHJvZmlsZSAgID0gcHJvZmlsZTtcbiAgICBwcm9maWxlQ3RybC5hdXRoICAgICAgPSBBdXRoO1xuICAgIHByb2ZpbGVDdHJsLnVzZXJzICAgICA9IFVzZXJzO1xuICAgIHByb2ZpbGVDdHJsLnRvcGljcyAgICA9IFRvcGljcztcbiAgICBwcm9maWxlQ3RybC5mYWNlYm9vayAgPSBGYWNlYm9vaztcbiAgICBwcm9maWxlQ3RybC5pc093bmVyICAgPSBpc093bmVyO1xuICAgIHByb2ZpbGVDdHJsLmNhdGUgICAgICA9IENhdGVTZXJ2aWNlO1xuICAgIHByb2ZpbGVDdHJsLiRzdGF0ZSAgICA9ICRzdGF0ZTtcbiAgICBwcm9maWxlQ3RybC51c2VyUG9zdHMgPSB1c2VyUG9zdHM7XG5cbiAgICBwcm9maWxlQ3RybC51c2VyRmVlZCAgPSAnJztcbiAgICBwcm9maWxlQ3RybC5mZWVkID0gJyc7XG5cbiAgICBwcm9maWxlQ3RybC5lZGl0SW5pdCA9ICd1c2VyRWRpdCc7XG5cbiAgICBwcm9maWxlQ3RybC5uYW1lRXhpc3Q9IGZhbHNlO1xuXG5cbiAgICBwcm9maWxlQ3RybC5nZXRVc2VyUG9zdCA9IGZ1bmN0aW9uKHVpZCl7XG4gICAgICBwcm9maWxlQ3RybC5mZWVkID0gcHJvZmlsZUN0cmwudG9waWNzLmNyZWF0ZWRCeSh1aWQpO1xuICAgIH1cblxuXG5cbiAgICAvKkxpbmsgYWNjb3VudCB3aXRoIGZhY2Vib29rKi9cbiAgICBwcm9maWxlQ3RybC5saW5rRmFjZWJvb2sgPSBmdW5jdGlvbigpe1xuICAgICAgcHJvZmlsZUN0cmwuZmFjZWJvb2subG9naW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgcHJvZmlsZUN0cmwuZmFjZWJvb2suZ2V0TG9naW5TdGF0dXMoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gJ2Nvbm5lY3RlZCcpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2dnZWRJbiA9IHRydWU7XG4gICAgICAgICAgICBwcm9maWxlQ3RybC5mYWNlYm9vay5hcGkoJy9tZScsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm90IGxvZ2dlZCBpblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvL1RoZSBvcmlnaW5hbCB2YWx1ZSBmcm9tIHByb2ZpbGVcbiAgICBwcm9maWxlQ3RybC5vbGRQcm9maWxlVmFsdWUgPSBwcm9maWxlQ3RybC5wcm9maWxlO1xuXG5cbiAgICBwcm9maWxlQ3RybC51c2VyQ3JlYXRlZCA9IGZ1bmN0aW9uKHVpZCl7XG4gICAgICByZXR1cm4gcHJvZmlsZUN0cmwudG9waWNzLmNyZWF0ZWRCeSh1aWQpO1xuICAgIH1cblxuXG4gICAgLy9QcmVzZXQgUGFyYW1ldGVyc1xuICAgIHByb2ZpbGVDdHJsLmltYWdlU3RyaW5ncyAgICA9IFtdO1xuICAgIHByb2ZpbGVDdHJsLnVzZXJDYXRlRm9sbG93ICA9IFtdO1xuICAgIHByb2ZpbGVDdHJsLmNhdGVJc0ZvbGxvdyAgICA9IFtdO1xuICAgIHByb2ZpbGVDdHJsLmZvbGxvd0xpc3QgICAgICA9ICcnO1xuXG5cblxuXG5cbiAgICBwcm9maWxlQ3RybC5mb2xsb3dDYXRlTGlzdEFyciA9IGZ1bmN0aW9uKHVpZCl7XG4gICAgICBwcm9maWxlQ3RybC5mb2xsb3dMaXN0ID0gcHJvZmlsZUN0cmwuY2F0ZS5mb2xsb3dMaXN0KHVpZCk7XG4gICAgfVxuXG4gICAgaWYoQXV0aC5yZWYuZ2V0QXV0aCgpKXtcbiAgICAgIHByb2ZpbGVDdHJsLmZvbGxvd0NhdGVMaXN0QXJyKEF1dGgucmVmLmdldEF1dGgoKS51aWQpO1xuICAgIH1cblxuICAgIHByb2ZpbGVDdHJsLmZvbGxvd0NhdGUgPSBmdW5jdGlvbihpbmRleCxjYXRlX3NsdWcpe1xuICAgICAgcHJvZmlsZUN0cmwuY2F0ZUlzRm9sbG93W2luZGV4XSAgPSB0cnVlO1xuICAgICAgcHJvZmlsZUN0cmwuY2F0ZS5hZGRDaGlsZChjYXRlX3NsdWcrJy9mb2xsb3dlcicpXG4gICAgICAgIC5jaGlsZChBdXRoLnJlZi5nZXRBdXRoKCkudWlkKS5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xuICAgIH1cblxuXG5cblxuXG4gICAgLy9VcGxvYWQgUHJvZmlsZSBpbWFnZVxuICAgIHByb2ZpbGVDdHJsLnVwbG9hZEZpbGUgPSBmdW5jdGlvbihmaWxlcykge1xuICAgICAgYW5ndWxhci5mb3JFYWNoKGZpbGVzLCBmdW5jdGlvbiAoZmxvd0ZpbGUsIGkpIHtcbiAgICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgIHZhciB1cmkgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgIHByb2ZpbGVDdHJsLmltYWdlU3RyaW5nc1tpXSA9IHVyaTtcbiAgICAgICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnVwZGF0ZSh7XCJwaG90b1wiOiB1cml9KVxuICAgICAgICAgIG5vdGlmeSh7bWVzc2FnZTonU2F2ZWQnLHBvc2l0aW9uOidjZW50ZXInLGR1cmF0aW9uOiAzMDAwIH0pO1xuICAgICAgICB9O1xuICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0RhdGFVUkwoZmxvd0ZpbGUuZmlsZSk7XG4gICAgICB9KVxuICAgIH07XG5cblxuICAgIC8vU2F2ZSBwcm9maWxlIHdpdGggcHJvZmlsZUN0cmwucHJvZmlsZVxuICAgIC8vcGFyYW1zOiByZWRpcmVjdCwgaWYgZXhpc3QgdGhlbiByZWRpcmVjdCBhZnRlciBzYXZlXG4gICAgcHJvZmlsZUN0cmwuc2F2ZVByb2ZpbGUgPSBmdW5jdGlvbihyZWRpcmVjdCl7XG4gICAgICBwcm9maWxlQ3RybC5wcm9maWxlLnVwZGF0ZWQgPSBtb21lbnQoKS50b0lTT1N0cmluZygpO1xuXG5cbiAgICAgIGlmKHByb2ZpbGVDdHJsLmxvY2F0aW9uICE9PSBudWxsICkge1xuICAgICAgICBsb2NhdGlvbkRldGFpbCA9IHtcbiAgICAgICAgICBwbGFjZV9pZDogcHJvZmlsZUN0cmwubG9jYXRpb24uZGV0YWlscy5wbGFjZV9pZCxcbiAgICAgICAgICBuYW1lOiBwcm9maWxlQ3RybC5sb2NhdGlvbi5kZXRhaWxzLm5hbWUsXG4gICAgICAgICAgYWRkcmVzczogcHJvZmlsZUN0cmwubG9jYXRpb24uZGV0YWlscy5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICBsYXQ6IHByb2ZpbGVDdHJsLmxvY2F0aW9uLmRldGFpbHMuZ2VvbWV0cnkubG9jYXRpb24ubGF0KCksXG4gICAgICAgICAgbG5nOiBwcm9maWxlQ3RybC5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxuICAgICAgICB9XG5cbiAgICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS51c2VyTG9jYXRpb24gPSBsb2NhdGlvbkRldGFpbDtcbiAgICAgIH1cblxuICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS4kc2F2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vdGlmeSh7bWVzc2FnZTonU2F2ZWQnLHBvc2l0aW9uOidjZW50ZXInLGR1cmF0aW9uOiAzMDAwIH0pO1xuICAgICAgICBpZihyZWRpcmVjdCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAkc3RhdGUuZ28ocmVkaXJlY3QpO1xuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuICAgICAgICBub3RpZnkoe21lc3NhZ2U6J0Vycm9yIHNhdmluZyBkYXRhJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy9VcGRhdGUgbmFtZVxuICAgIHByb2ZpbGVDdHJsLnVwZGF0ZU5hbWUgPSBmdW5jdGlvbigpe1xuXG4gICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnVwZGF0ZShcbiAgICAgICAge1xuICAgICAgICAgIFwiZmlyc3RuYW1lXCI6ICBwcm9maWxlQ3RybC5wcm9maWxlLmZpcnN0bmFtZSxcbiAgICAgICAgICBcImxhc3RuYW1lXCI6ICAgcHJvZmlsZUN0cmwucHJvZmlsZS5sYXN0bmFtZSxcbiAgICAgICAgfVxuICAgICAgKVxuXG4gICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQrJy9sb2cnKS5wdXNoKCkuc2V0KHtcbiAgICAgICAgYWN0aW9uOiAgIFwibmFtZV9jaGFuZ2VcIixcbiAgICAgICAgb2xkbmFtZTogIHByb2ZpbGVDdHJsLm9sZFByb2ZpbGVWYWx1ZS5maXJzdG5hbWUgKyBcIi1cIiArIHByb2ZpbGVDdHJsLm9sZFByb2ZpbGVWYWx1ZS5sYXN0bmFtZSxcbiAgICAgICAgY3JlYXRlZDogIG1vbWVudCgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH0pO1xuXG4gICAgICBub3RpZnkoe21lc3NhZ2U6J1NhdmVkJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICB9XG5cblxuICAgIC8vVXBkYXRlIEJpb1xuICAgIHByb2ZpbGVDdHJsLnVwZGF0ZUJpbyA9IGZ1bmN0aW9uKCl7XG4gICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnVwZGF0ZSh7XCJiaW9ncmFwaHlcIjogcHJvZmlsZUN0cmwucHJvZmlsZS5iaW9ncmFwaHl9KVxuXG4gICAgICBub3RpZnkoe21lc3NhZ2U6J1NhdmVkJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICB9XG5cblxuICAgIHByb2ZpbGVDdHJsLnVwZGF0ZVByb2ZpbGUgPSBmdW5jdGlvbigpe1xuICAgICAgLy9wcm9maWxlQ3RybC5wcm9maWxlLmVtYWlsSGFzaCA9IG1kNS5jcmVhdGVIYXNoKGF1dGgucGFzc3dvcmQuZW1haWwpO1xuICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS4kc2F2ZSgpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQnKTtcbiAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIC8vQ2hlY2sgaWYgdXNlciBleGlzdCwgcmV0dXJuIGZhbHNlIGlmIHRoZXkgZG9cbiAgICBwcm9maWxlQ3RybC5jaGVja1VzZXJuYW1lID0gZnVuY3Rpb24oKXtcblxuICAgICAgcHJvZmlsZUN0cmwudXNlcnMuY2hlY2tVc2VybmFtZUV4aXN0KHByb2ZpbGVDdHJsLnByb2ZpbGUuZGlzcGxheU5hbWUpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgaWYoc25hcHNob3QudmFsKCkgIT09IG51bGwpe1xuICAgICAgICAgIHJldHVybiBwcm9maWxlQ3RybC5uYW1lRXhpc3Q9dHJ1ZTtcbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgIHJldHVybiBwcm9maWxlQ3RybC5uYW1lRXhpc3Q9ZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuZmFjdG9yeSgnVXNlcnMnLCBmdW5jdGlvbiAoJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgRmlyZWJhc2VVcmwsICRodHRwKSB7XG4gICAgdmFyIHVzZXJzUmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsICsgJ3VzZXJzJylcbiAgICB2YXIgdXNlcnMgPSAkZmlyZWJhc2VBcnJheSh1c2Vyc1JlZilcblxuICAgIHZhciBVc2VycyA9IHtcbiAgICAgIGdldExvY2F0aW9uSVA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgICB1cmw6ICdodHRwOi8vaXBpbmZvLmlvL2pzb24nLFxuICAgICAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICAgICAgfSlcbiAgICAgIH0sXG5cbiAgICAgIGdldExvY2F0aW9uSVBEYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgICAgdXJsOiAnaHR0cDovL2lwaW5mby5pby9qc29uJyxcbiAgICAgICAgICBtZXRob2Q6ICdHRVQnXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gZGF0YS5kYXRhXG4gICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICBwcm9maWxlOiBmdW5jdGlvbih1aWQpe1xuICAgICAgICByZXR1cm4gdXNlcnMuJGdldFJlY29yZCh1aWQpO1xuICAgICAgfSxcblxuXG4gICAgICAvL1NlYXJjaCBhbmQgcmV0dXJuIHVzZXJuYW1lXG4gICAgICBnZXRQcm9maWxlQnlVc2VybmFtZTpmdW5jdGlvbih1c2VybmFtZSl7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheSh1c2Vyc1JlZi5vcmRlckJ5Q2hpbGQoJ2Rpc3BsYXlOYW1lJykuZXF1YWxUbyh1c2VybmFtZSkpO1xuICAgICAgfSxcblxuICAgICAgLy9DaGVjayBpZiB1c2VybmFtZSBleGlzdCwgaWYgbm90IHJldHVybiBudWxsXG4gICAgICBjaGVja1VzZXJuYW1lRXhpc3Q6ZnVuY3Rpb24odXNlcm5hbWUpe1xuICAgICAgICByZXR1cm4gdXNlcnNSZWYub3JkZXJCeUNoaWxkKCdkaXNwbGF5TmFtZScpLmVxdWFsVG8odXNlcm5hbWUpO1xuICAgICAgfSxcblxuXG4gICAgICBnZXRQcm9maWxlOiBmdW5jdGlvbiAodWlkKSB7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QodXNlcnNSZWYuY2hpbGQodWlkKSlcbiAgICAgIH0sXG5cbiAgICAgIGdldERpc3BsYXlOYW1lOiBmdW5jdGlvbiAodWlkKSB7XG4gICAgICAgIGlmICh1aWQgIT09IG51bGwgfHwgdWlkICE9PSAnJykge1xuICAgICAgICAgIHJldHVybiB1c2Vycy4kZ2V0UmVjb3JkKHVpZCkuZGlzcGxheU5hbWU7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vR2V0IHVzZXIgRm9sbG93ZXJzXG4gICAgICBnZXRGb2xsb3dlcjpmdW5jdGlvbih1aWQpe1xuICAgICAgICByZXR1cm4gdXNlcnNSZWYuY2hpbGQodWlkKycvc3RhdC9mb2xsb3dlci91aWQnKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vQ2hlY2sgaWYgdXNlciBpcyBhbHJlYWR5IGZvbGxvd2luZ1xuICAgICAgY2hlY2tGb2xsb3c6ZnVuY3Rpb24odWlkLGZvbGxvd19pZCl7XG5cbiAgICAgICAgdmFyIGZvbGxvdz1mYWxzZTtcbiAgICAgICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsndXNlcnMvJyt1aWQrJy9zdGF0L2ZvbGxvd2luZy91aWQvJytmb2xsb3dfaWQpO1xuICAgICAgICByZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgZm9sbG93ID0gc25hcHNob3QuZXhpc3RzKCk7XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBmb2xsb3c7XG4gICAgICB9LFxuXG4gICAgICAvL0NoYW5nZSBwYXNzd29yZFxuICAgICAgdXNlckNoYW5nZVBhc3N3b3JkOmZ1bmN0aW9uKGVtYWlsLG9sZHBhc3MsbmV3cGFzcyl7XG5cbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCk7XG4gICAgICAgIHJlZi5jaGFuZ2VQYXNzd29yZCh7XG4gICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgIG9sZFBhc3N3b3JkOiBvbGRwYXNzLFxuICAgICAgICAgIG5ld1Bhc3N3b3JkOiBuZXdwYXNzXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGVycm9yLmNvZGUpIHtcbiAgICAgICAgICAgICAgY2FzZSBcIklOVkFMSURfUEFTU1dPUkRcIjpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZSBzcGVjaWZpZWQgdXNlciBhY2NvdW50IHBhc3N3b3JkIGlzIGluY29ycmVjdC5cIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgXCJJTlZBTElEX1VTRVJcIjpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZSBzcGVjaWZpZWQgdXNlciBhY2NvdW50IGRvZXMgbm90IGV4aXN0LlwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yIGNoYW5naW5nIHBhc3N3b3JkOlwiLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVXNlciBwYXNzd29yZCBjaGFuZ2VkIHN1Y2Nlc3NmdWxseSFcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIHVzZXJSZWY6IGZ1bmN0aW9uICh1aWQpIHtcbiAgICAgICAgcmV0dXJuIHVzZXJzUmVmLmNoaWxkKHVpZClcbiAgICAgIH0sXG5cbiAgICAgIHVwdm90ZXM6IGZ1bmN0aW9uICh1aWQpIHtcbiAgICAgICAgcmV0dXJuIHVzZXJzUmVmLmNoaWxkKHVpZCkuY2hpbGQoJ3Vwdm90ZXMnKVxuICAgICAgfSxcblxuICAgICAgZG93bnZvdGVzOiBmdW5jdGlvbiAodWlkKSB7XG4gICAgICAgIHJldHVybiB1c2Vyc1JlZi5jaGlsZCh1aWQpLmNoaWxkKCdkb3dudm90ZXMnKVxuICAgICAgfSxcblxuICAgICAgLy9Vc2VyIGZvbGxvd2luZyB0b3BpY1xuICAgICAgZm9sbG93aW5nOiBmdW5jdGlvbiAodWlkKSB7XG4gICAgICAgIHJldHVybiB1c2Vyc1JlZi5jaGlsZCh1aWQpLmNoaWxkKCdmb2xsb3dpbmcnKVxuICAgICAgfSxcblxuICAgICAgdXNlckFyclJlZjogZnVuY3Rpb24gKHVpZCkge1xuICAgICAgICByZXR1cm4gdXNlcnNSZWYuY2hpbGQodWlkKVxuICAgICAgfSxcblxuICAgICAgYWxsOiB1c2Vyc1xuICAgIH1cblxuICAgIHJldHVybiBVc2Vyc1xuICB9KVxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmZhY3RvcnkoJ1VuaXF1ZUlER2VuZXJhdG9yJywgZnVuY3Rpb24oKXsgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBGYW5jeSBJRCBnZW5lcmF0b3IgdGhhdCBjcmVhdGVzIDIwLWNoYXJhY3RlciBzdHJpbmcgaWRlbnRpZmllcnMgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XHJcbiAgICAgKlxyXG4gICAgICogMS4gVGhleSdyZSBiYXNlZCBvbiB0aW1lc3RhbXAgc28gdGhhdCB0aGV5IHNvcnQgKmFmdGVyKiBhbnkgZXhpc3RpbmcgaWRzLlxyXG4gICAgICogMi4gVGhleSBjb250YWluIDcyLWJpdHMgb2YgcmFuZG9tIGRhdGEgYWZ0ZXIgdGhlIHRpbWVzdGFtcCBzbyB0aGF0IElEcyB3b24ndCBjb2xsaWRlIHdpdGggb3RoZXIgY2xpZW50cycgSURzLlxyXG4gICAgICogMy4gVGhleSBzb3J0ICpsZXhpY29ncmFwaGljYWxseSogKHNvIHRoZSB0aW1lc3RhbXAgaXMgY29udmVydGVkIHRvIGNoYXJhY3RlcnMgdGhhdCB3aWxsIHNvcnQgcHJvcGVybHkpLlxyXG4gICAgICogNC4gVGhleSdyZSBtb25vdG9uaWNhbGx5IGluY3JlYXNpbmcuICBFdmVuIGlmIHlvdSBnZW5lcmF0ZSBtb3JlIHRoYW4gb25lIGluIHRoZSBzYW1lIHRpbWVzdGFtcCwgdGhlXHJcbiAgICAgKiAgICBsYXR0ZXIgb25lcyB3aWxsIHNvcnQgYWZ0ZXIgdGhlIGZvcm1lciBvbmVzLiAgV2UgZG8gdGhpcyBieSB1c2luZyB0aGUgcHJldmlvdXMgcmFuZG9tIGJpdHNcclxuICAgICAqICAgIGJ1dCBcImluY3JlbWVudGluZ1wiIHRoZW0gYnkgMSAob25seSBpbiB0aGUgY2FzZSBvZiBhIHRpbWVzdGFtcCBjb2xsaXNpb24pLlxyXG4gICAgICovXHJcbiAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgZ2VuZXJhdGVQdXNoSUQ6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAvLyBNb2RlbGVkIGFmdGVyIGJhc2U2NCB3ZWItc2FmZSBjaGFycywgYnV0IG9yZGVyZWQgYnkgQVNDSUkuXHJcbiAgICAgICAgICAgIHZhciBQVVNIX0NIQVJTID0gJy0wMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpfYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonO1xyXG5cclxuICAgICAgICAgICAgLy8gVGltZXN0YW1wIG9mIGxhc3QgcHVzaCwgdXNlZCB0byBwcmV2ZW50IGxvY2FsIGNvbGxpc2lvbnMgaWYgeW91IHB1c2ggdHdpY2UgaW4gb25lIG1zLlxyXG4gICAgICAgICAgICB2YXIgbGFzdFB1c2hUaW1lID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIFdlIGdlbmVyYXRlIDcyLWJpdHMgb2YgcmFuZG9tbmVzcyB3aGljaCBnZXQgdHVybmVkIGludG8gMTIgY2hhcmFjdGVycyBhbmQgYXBwZW5kZWQgdG8gdGhlXHJcbiAgICAgICAgICAgIC8vIHRpbWVzdGFtcCB0byBwcmV2ZW50IGNvbGxpc2lvbnMgd2l0aCBvdGhlciBjbGllbnRzLiAgV2Ugc3RvcmUgdGhlIGxhc3QgY2hhcmFjdGVycyB3ZVxyXG4gICAgICAgICAgICAvLyBnZW5lcmF0ZWQgYmVjYXVzZSBpbiB0aGUgZXZlbnQgb2YgYSBjb2xsaXNpb24sIHdlJ2xsIHVzZSB0aG9zZSBzYW1lIGNoYXJhY3RlcnMgZXhjZXB0XHJcbiAgICAgICAgICAgIC8vIFwiaW5jcmVtZW50ZWRcIiBieSBvbmUuXHJcbiAgICAgICAgICAgIHZhciBsYXN0UmFuZENoYXJzID0gW107XHJcblxyXG4gICAgICAgICAgICAvLyByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgICAgIHZhciBkdXBsaWNhdGVUaW1lID0gKG5vdyA9PT0gbGFzdFB1c2hUaW1lKTtcclxuICAgICAgICAgICAgICBsYXN0UHVzaFRpbWUgPSBub3c7XHJcblxyXG4gICAgICAgICAgICAgIHZhciB0aW1lU3RhbXBDaGFycyA9IG5ldyBBcnJheSg4KTtcclxuICAgICAgICAgICAgICBmb3IgKHZhciBpID0gNzsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIHRpbWVTdGFtcENoYXJzW2ldID0gUFVTSF9DSEFSUy5jaGFyQXQobm93ICUgNjQpO1xyXG4gICAgICAgICAgICAgICAgLy8gTk9URTogQ2FuJ3QgdXNlIDw8IGhlcmUgYmVjYXVzZSBqYXZhc2NyaXB0IHdpbGwgY29udmVydCB0byBpbnQgYW5kIGxvc2UgdGhlIHVwcGVyIGJpdHMuXHJcbiAgICAgICAgICAgICAgICBub3cgPSBNYXRoLmZsb29yKG5vdyAvIDY0KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKG5vdyAhPT0gMCkgdGhyb3cgbmV3IEVycm9yKCdXZSBzaG91bGQgaGF2ZSBjb252ZXJ0ZWQgdGhlIGVudGlyZSB0aW1lc3RhbXAuJyk7XHJcblxyXG4gICAgICAgICAgICAgIHZhciBpZCA9IHRpbWVTdGFtcENoYXJzLmpvaW4oJycpO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoIWR1cGxpY2F0ZVRpbWUpIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAxMjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgIGxhc3RSYW5kQ2hhcnNbaV0gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2NCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSB0aW1lc3RhbXAgaGFzbid0IGNoYW5nZWQgc2luY2UgbGFzdCBwdXNoLCB1c2UgdGhlIHNhbWUgcmFuZG9tIG51bWJlciwgZXhjZXB0IGluY3JlbWVudGVkIGJ5IDEuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAxMTsgaSA+PSAwICYmIGxhc3RSYW5kQ2hhcnNbaV0gPT09IDYzOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgbGFzdFJhbmRDaGFyc1tpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsYXN0UmFuZENoYXJzW2ldKys7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAxMjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZCArPSBQVVNIX0NIQVJTLmNoYXJBdChsYXN0UmFuZENoYXJzW2ldKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYoaWQubGVuZ3RoICE9IDIwKSB0aHJvdyBuZXcgRXJyb3IoJ0xlbmd0aCBzaG91bGQgYmUgMjAuJyk7XHJcblxyXG4gICAgICAgICAgICAgIHJldHVybiBpZDtcclxuICAgICAgICAgICAgLy8gfTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICB9KSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
