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



  .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        views: {
          '': {
            controller: 'HomeCtrl as  homeCtrl',
            templateUrl: 'home/home.html',
            resolve: {
              requireNoAuth: ["$state", "Auth", function ($state, Auth) {
                return Auth.auth.$requireAuth().then(function (auth) {
                  $state.go('dashboard')
                }, function (error) {
                  return error
                })
              }],
              feed: ["Topics", function (Topics) {
                return Topics.latestFeed()
              }]
            }
          },
          'login-form@home': {
            controller: 'AuthCtrl as authCtrl',
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
  }]);

angular.module('App')

  .directive('mainHeader',function(){
    return {
      restrict:     'E',
      transclude:   true,
      controller: 'AuthCtrl as authCtrl',
      templateUrl: 'templates/toolbar/main_toolbar.html'
    }

  })

  //Badge notification
  .directive('badgeNotification',function(){
    return {
      restrict:     'E',
      transclude:   true,
      controller:   'AuthCtrl as authCtrl',
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
          controller: 'AuthCtrl as authCtrl',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguY29udHJvbGxlci5qcyIsImF1dGguc2VydmljZS5qcyIsImNhdGVnb3J5LmNvbnRyb2xsZXIuanMiLCJjYXRlZ29yeS5zZXJ2aWNlLmpzIiwicG9zdC5zZXJ2aWNlLmpzIiwiZGFzaGJvYXJkLmNvbnRyb2xsZXIuanMiLCJkaXJlY3RpdmVzLmpzIiwiaG9tZS5jb250cm9sbGVyLmpzIiwibGFuZy5qcyIsIm5vdGlmaWNhdGlvbi5jb250cm9sbGVyLmpzIiwibm90aWZpY2F0aW9uLnNlcnZpY2UuanMiLCJwbGFjZS5jb250cm9sbGVyLmpzIiwicGxhY2Uuc2VydmljZS5qcyIsInV0aWxpdGllcy5zZXJ2aWNlLmpzIiwidGFnLmNvbnRyb2xsZXIuanMiLCJ0YWcuc2VydmljZS5qcyIsInRvcGljLWxhbmRpbmcuY29udHJvbGxlci5qcyIsInRvcGljcy5jb250cm9sbGVyLmpzIiwidG9waWNzLnNlcnZpY2UuanMiLCJwcm9maWxlLmNvbnRyb2xsZXIuanMiLCJ1c2Vycy5zZXJ2aWNlLmpzIiwiaGVscGVycy5zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQUtBLElBQUEsTUFBQSxRQUFBLE9BQUEsT0FBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7OztJQUdBO0lBQ0E7SUFDQTs7SUFFQTtJQUNBOzs7O0dBSUEsOEJBQUEsVUFBQSxvQkFBQTtJQUNBLG1CQUFBLGNBQUEsU0FBQTtNQUNBLE1BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxRQUFBO01BQ0EsUUFBQTtNQUNBLFFBQUE7TUFDQSxRQUFBO01BQ0Esd0JBQUE7O01BRUEsc0JBQUEsQ0FBQSxNQUFBO1FBQ0EsT0FBQSxPQUFBLE9B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QUEsTUFBQTtnQkFDQSxPQUFBLEtBQUEsS0FBQSxlQUFBLE1BQUEsWUFBQTtrQkFDQSxPQUFBLEdBQUE7Ozs7O1VBS0Esc0JBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTs7Ozs7T0FLQSxNQUFBLFNBQUE7UUFDQSxLQUFBO1FBQ0EsT0FBQTtVQUNBLElBQUE7WUFDQSxhQUFBOztVQUVBLG9CQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7Ozs7O09BS0EsTUFBQSxZQUFBO1FBQ0EsS0FBQTtRQUNBLE9BQUE7VUFDQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7OztRQUdBLFNBQUE7VUFDQSxrQ0FBQSxVQUFBLFFBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxLQUFBLGVBQUEsS0FBQSxVQUFBLE1BQUE7Y0FDQSxPQUFBLEdBQUE7ZUFDQSxVQUFBLE9BQUE7Y0FDQSxPQUFBOzs7Ozs7SUFNQSxtQkFBQSxVQUFBOzs7R0FHQSxPQUFBLGlCQUFBLFlBQUE7SUFDQSxPQUFBLFVBQUEsT0FBQSxPQUFBLFNBQUE7TUFDQSxJQUFBLFdBQUE7TUFDQSxRQUFBLFFBQUEsT0FBQSxVQUFBLE1BQUE7UUFDQSxTQUFBLEtBQUEsS0FBQSxLQUFBLElBQUE7O01BRUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxHQUFBO1FBQ0EsUUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLElBQUEsQ0FBQTs7TUFFQSxJQUFBLFNBQUEsU0FBQTtNQUNBLE9BQUE7Ozs7R0FJQSxPQUFBLGFBQUEsWUFBQTtJQUNBLE9BQUEsVUFBQSxNQUFBO01BQ0EsT0FBQSxPQUFBLFVBQUEsUUFBQTs7Ozs7R0FLQSxPQUFBLGtCQUFBLFVBQUEsTUFBQTtJQUNBLE9BQUEsVUFBQSxNQUFBO01BQ0EsT0FBQSxPQUFBLEtBQUEsWUFBQSxLQUFBLFFBQUEsT0FBQSxZQUFBOzs7O0dBSUEsU0FBQSxlQUFBOztBQUVBLFNBQUEsTUFBQSxNQUFBO0VBQ0EsUUFBQSxJQUFBO0VBQ0EsT0FBQSxLQUFBLFVBQUEsTUFBQSxNQUFBOzs7O0FBSUEsU0FBQSxRQUFBLE1BQUE7RUFDQSxJQUFBLFFBQUEsTUFBQSxVQUFBLE1BQUEsS0FBQSxXQUFBO0VBQ0EsTUFBQSxRQUFBLFVBQUEsR0FBQTtJQUNBLElBQUEsS0FBQSxRQUFBLE9BQUEsVUFBQTtNQUNBLEtBQUEsSUFBQSxLQUFBLEdBQUE7UUFDQSxJQUFBLEVBQUEsZUFBQSxJQUFBO1VBQ0EsS0FBQSxLQUFBLEVBQUE7Ozs7O0VBS0EsT0FBQTs7O0FDM29CQSxRQUFBLE9BQUE7R0FDQSxXQUFBLHdJQUFBLFNBQUEsT0FBQSxNQUFBLE9BQUEsT0FBQSxXQUFBLFdBQUEsWUFBQTttQ0FDQSxZQUFBLGNBQUE7SUFDQSxJQUFBLFdBQUE7OztJQUdBLGNBQUE7T0FDQSxLQUFBLFVBQUEsWUFBQTtRQUNBLFFBQUEsSUFBQTs7OztJQUlBLFNBQUEsV0FBQTtJQUNBLFNBQUEsV0FBQTtJQUNBLFNBQUEsZUFBQTs7O0lBR0EsR0FBQSxLQUFBLElBQUEsYUFBQSxNQUFBO01BQ0EsU0FBQSxXQUFBLFNBQUEsTUFBQSxXQUFBLEtBQUEsSUFBQSxVQUFBOztRQUVBO01BQ0EsU0FBQSxTQUFBOzs7O0lBSUEsU0FBQSxPQUFBO01BQ0EsT0FBQTtNQUNBLFVBQUE7Ozs7Ozs7Ozs7Ozs7O0lBY0EsT0FBQSxtQkFBQSxTQUFBOzs7SUFHQSxTQUFBLGVBQUEsVUFBQTtNQUNBLFNBQUEsYUFBQSxZQUFBLFNBQUEsUUFBQTs7O0lBR0EsU0FBQSxZQUFBLFVBQUE7TUFDQSxRQUFBLElBQUEsZUFBQSxTQUFBLGtCQUFBOzs7O0lBSUEsT0FBQSxPQUFBLFFBQUEsU0FBQSxVQUFBLFVBQUE7TUFDQSxJQUFBLE9BQUEsS0FBQSxTQUFBLEdBQUE7UUFDQSxPQUFBLFdBQUEsZUFBQSxPQUFBOzs7Ozs7SUFNQSxTQUFBLGFBQUEsVUFBQSxTQUFBO01BQ0EsV0FBQSxJQUFBOztNQUVBLFNBQUEsSUFBQSxZQUFBOztNQUVBLEdBQUEsS0FBQSxJQUFBLFVBQUE7UUFDQSxTQUFBLE1BQUEsV0FBQSxLQUFBLElBQUEsVUFBQSxLQUFBLE9BQUEsQ0FBQSxPQUFBOzs7OztJQUtBLEdBQUEsQ0FBQSxTQUFBLFFBQUEsS0FBQTtNQUNBLEdBQUEsU0FBQSxJQUFBLFlBQUE7UUFDQSxTQUFBLFdBQUEsU0FBQSxJQUFBO1dBQ0E7UUFDQSxTQUFBLFdBQUE7OztRQUdBO01BQ0EsU0FBQSxXQUFBLFNBQUEsUUFBQTs7Ozs7SUFLQSxTQUFBLFFBQUEsV0FBQTtNQUNBLFNBQUEsS0FBQSxLQUFBLGtCQUFBLFNBQUEsTUFBQSxLQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsR0FBQTtTQUNBLFVBQUEsTUFBQTtRQUNBLFNBQUEsUUFBQTs7Ozs7SUFLQSxTQUFBLFNBQUEsVUFBQTtNQUNBLEtBQUEsS0FBQTtNQUNBLE9BQUEsR0FBQTs7OztJQUlBLFNBQUEsV0FBQSxXQUFBO01BQ0EsS0FBQSxLQUFBLFlBQUEsU0FBQSxNQUFBLEtBQUEsVUFBQSxLQUFBO1FBQ0EsU0FBQTtTQUNBLFVBQUEsTUFBQTtRQUNBLFNBQUEsUUFBQTs7Ozs7SUFLQSxTQUFBLGNBQUEsYUFBQTtJQUNBLFNBQUEsYUFBQSxPQUFBO01BQ0EsT0FBQSxXQUFBO1FBQ0EsV0FBQTtXQUNBOzs7OztBQ2pIQSxRQUFBLE9BQUE7R0FDQSxRQUFBLHlDQUFBLFNBQUEsZUFBQSxZQUFBO0lBQ0EsSUFBQSxNQUFBLElBQUEsU0FBQTtJQUNBLElBQUEsT0FBQSxjQUFBOztJQUVBLElBQUEsT0FBQTtNQUNBLElBQUE7TUFDQSxNQUFBOztNQUVBLE9BQUEsVUFBQTtRQUNBLElBQUEsTUFBQSxJQUFBO1FBQ0EsR0FBQSxPQUFBLE1BQUE7VUFDQSxPQUFBLElBQUEsVUFBQTs7WUFFQTtVQUNBLE9BQUE7Ozs7O0lBS0EsT0FBQTs7O0FDcEJBLFFBQUEsT0FBQTtHQUNBLFdBQUEsNkRBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQSxXQUFBO0lBQ0EsSUFBQSxXQUFBOzs7SUFHQSxTQUFBLGFBQUE7SUFDQSxTQUFBLGFBQUE7SUFDQSxTQUFBLGFBQUE7Ozs7QUNQQSxRQUFBLE9BQUE7OztHQUdBLFFBQUEsb0VBQUEsU0FBQSxpQkFBQSxpQkFBQSxZQUFBO0lBQ0EsSUFBQSxTQUFBLElBQUEsU0FBQSxZQUFBO0lBQ0EsSUFBQSxhQUFBLGdCQUFBOztJQUVBLElBQUEsT0FBQTs7TUFFQSxNQUFBLFNBQUEsV0FBQTtRQUNBLElBQUEsT0FBQSxJQUFBLGFBQUEsUUFBQSxRQUFBO1FBQ0EsT0FBQSxnQkFBQTs7O01BR0EsVUFBQSxTQUFBLFdBQUE7UUFDQSxPQUFBLGdCQUFBLFNBQUEsTUFBQTs7O01BR0EsVUFBQSxTQUFBLFVBQUE7UUFDQSxPQUFBLElBQUEsTUFBQTs7O01BR0EsV0FBQSxTQUFBLElBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLGlCQUFBLFFBQUE7UUFDQSxPQUFBLGVBQUE7OztNQUdBLFNBQUEsU0FBQSxLQUFBLElBQUE7UUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUEsY0FBQSxLQUFBLGFBQUE7UUFDQSxJQUFBOzs7TUFHQSxXQUFBLFNBQUEsS0FBQSxJQUFBO1FBQ0EsSUFBQSxPQUFBO1FBQ0EsSUFBQSxTQUFBLElBQUEsU0FBQSxZQUFBLGNBQUEsS0FBQSxhQUFBO1FBQ0EsSUFBQSxLQUFBLFNBQUEsU0FBQSxVQUFBO1VBQ0EsU0FBQSxTQUFBOztRQUVBLE9BQUE7O01BRUEsS0FBQSxlQUFBO01BQ0EsSUFBQTs7SUFFQSxPQUFBOzs7O0FDM0NBLFFBQUEsT0FBQTs7O0dBR0EsUUFBQSwyQ0FBQSxTQUFBLGlCQUFBLFlBQUE7SUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLFNBQUEsZ0JBQUE7O0lBRUEsSUFBQSxLQUFBO01BQ0EsV0FBQSxTQUFBLFdBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsZ0JBQUE7O01BRUEsVUFBQSxTQUFBLFdBQUE7UUFDQSxPQUFBLGdCQUFBLFNBQUEsTUFBQTs7TUFFQSxJQUFBOztJQUVBLE9BQUE7Ozs7QUNqQkEsUUFBQSxPQUFBO0dBQ0EsV0FBQSx5R0FBQSxTQUFBLE1BQUEsT0FBQSxTQUFBLFlBQUE7d0NBQ0EsVUFBQSxZQUFBLE1BQUE7SUFDQSxJQUFBLGdCQUFBOztJQUVBLGNBQUEsT0FBQTs7SUFFQSxjQUFBLE9BQUE7SUFDQSxjQUFBLGtCQUFBLFNBQUE7SUFDQSxjQUFBLGNBQUE7SUFDQSxjQUFBLGNBQUEsS0FBQTs7SUFFQSxjQUFBLGtCQUFBO0lBQ0EsY0FBQSxrQkFBQTtJQUNBLGNBQUEsa0JBQUE7OztJQUdBLGNBQUEsVUFBQTs7O0lBR0EsY0FBQSxRQUFBLFlBQUE7TUFDQSxXQUFBLFNBQUE7Ozs7SUFJQSxjQUFBLGFBQUEsU0FBQSxVQUFBO01BQ0EsY0FBQSxLQUFBLFNBQUEsVUFBQTtTQUNBLE1BQUEsS0FBQSxJQUFBLFVBQUEsS0FBQSxPQUFBLElBQUEsU0FBQTs7OztBQzNCQSxRQUFBLE9BQUE7O0dBRUEsVUFBQSxhQUFBLFVBQUE7SUFDQSxPQUFBO01BQ0EsY0FBQTtNQUNBLGNBQUE7TUFDQSxZQUFBO01BQ0EsYUFBQTs7Ozs7O0dBTUEsVUFBQSxvQkFBQSxVQUFBO0lBQ0EsT0FBQTtNQUNBLGNBQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTtNQUNBLGNBQUE7TUFDQSxPQUFBO1FBQ0EsY0FBQTs7Ozs7OztHQU9BLFVBQUEsZUFBQSxZQUFBO0lBQ0EsT0FBQTtNQUNBLGNBQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTtNQUNBLGNBQUE7TUFDQSxPQUFBO1FBQ0EsUUFBQTs7Ozs7OztHQU9BLFVBQUEsa0JBQUEsVUFBQTtJQUNBLE9BQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTtNQUNBLGNBQUE7TUFDQSxjQUFBO01BQ0EsT0FBQTtRQUNBLFFBQUE7Ozs7Ozs7R0FPQSxVQUFBLGdCQUFBLFVBQUE7SUFDQSxPQUFBO01BQ0EsWUFBQTtNQUNBLGFBQUE7TUFDQSxPQUFBO1FBQ0EsTUFBQTs7Ozs7O0dBTUEsVUFBQSxhQUFBLFlBQUE7SUFDQSxPQUFBO01BQ0EsWUFBQTtNQUNBLGFBQUE7Ozs7O0dBS0EsVUFBQSxXQUFBLFlBQUE7SUFDQSxPQUFBO01BQ0EsWUFBQTtNQUNBLGFBQUE7Ozs7O0dBS0EsVUFBQSxlQUFBLFVBQUE7O0lBRUEsT0FBQTtNQUNBLFlBQUE7TUFDQSxhQUFBO01BQ0EsT0FBQTtRQUNBLE9BQUE7Ozs7Ozs7R0FPQSxVQUFBLGFBQUEsWUFBQTtJQUNBLE9BQUE7TUFDQSxZQUFBO01BQ0EsYUFBQTtNQUNBLE9BQUE7UUFDQSxRQUFBOzs7Ozs7R0FNQSxVQUFBLG9CQUFBLFlBQUE7SUFDQSxPQUFBO01BQ0EsWUFBQTtNQUNBLGFBQUE7TUFDQSxPQUFBO1FBQ0EsT0FBQTs7Ozs7OztHQU9BLFVBQUEsa0JBQUEsV0FBQTtFQUNBLE9BQUE7SUFDQSxTQUFBO0lBQ0EsTUFBQSxTQUFBLE9BQUEsU0FBQSxPQUFBLFFBQUE7TUFDQSxJQUFBLFVBQUEsTUFBQSxVQUFBLFNBQUEsTUFBQSxTQUFBLE9BQUE7O01BRUEsT0FBQSxTQUFBLEtBQUEsU0FBQSxPQUFBO1FBQ0EsSUFBQSxTQUFBLFdBQUEsTUFBQSxTQUFBLFNBQUE7VUFDQSxNQUFBLE9BQUEsTUFBQSxTQUFBLEdBQUE7O1FBRUEsT0FBQTs7Ozs7O0FDaElBLFFBQUEsT0FBQTtHQUNBLFdBQUEscURBQUEsU0FBQSxPQUFBLFNBQUEsT0FBQSxLQUFBO0lBQ0EsSUFBQSxXQUFBOztJQUVBLFNBQUEsU0FBQTtJQUNBLFNBQUEsU0FBQTtJQUNBLFNBQUEsU0FBQTs7O0FDTkEsUUFBQSxPQUFBO0dBQ0EsT0FBQSxDQUFBLHNCQUFBLFVBQUEsb0JBQUE7SUFDQSxtQkFBQSxhQUFBLE9BQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxtQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7OztNQUdBLGtCQUFBO01BQ0Esa0JBQUE7Ozs7TUFJQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTs7Ozs7TUFLQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7OztNQUdBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTs7OztJQUlBLG1CQUFBLGFBQUEsT0FBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBOzs7SUFHQSxtQkFBQSxrQkFBQTs7O0FDaEdBLFFBQUEsT0FBQTtHQUNBLFdBQUEsNERBQUEsU0FBQSxPQUFBLFNBQUEsT0FBQSxZQUFBO0lBQ0EsSUFBQSxXQUFBOzs7SUFHQSxTQUFBLFNBQUE7SUFDQSxTQUFBLFNBQUE7SUFDQSxTQUFBLGNBQUE7O0lBRUEsU0FBQSxVQUFBLFNBQUEsSUFBQTtNQUNBLE9BQUEsU0FBQSxJQUFBLEtBQUEsS0FBQSxLQUFBOzs7O0FDVkEsUUFBQSxPQUFBOztHQUVBLFFBQUEsOEZBQUEsU0FBQSxpQkFBQSxpQkFBQTttQ0FDQSxNQUFBLGNBQUE7SUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLE9BQUEsZ0JBQUE7SUFDQSxJQUFBLFFBQUE7O0lBRUEsSUFBQSxvQkFBQTs7O0lBR0EsSUFBQSxlQUFBOzs7TUFHQSxtQkFBQSxTQUFBLElBQUE7UUFDQSxJQUFBLE1BQUEsSUFBQSxTQUFBLFlBQUEsZ0JBQUEsSUFBQTtRQUNBLElBQUE7UUFDQSxJQUFBLEdBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxVQUFBLFNBQUE7OztRQUdBLElBQUEsbUJBQUEsSUFBQSxTQUFBLFlBQUEsZ0JBQUE7UUFDQSxpQkFBQSxHQUFBLGNBQUEsVUFBQTtVQUNBLGNBQUEsMEJBQUE7WUFDQSxNQUFBLFNBQUE7WUFDQSxLQUFBO1lBQ0EsTUFBQTtZQUNBLEtBQUE7WUFDQSxNQUFBOztZQUVBLG9CQUFBOzs7UUFHQSxPQUFBOzs7O01BSUEsZUFBQSxTQUFBLFFBQUEsSUFBQTtRQUNBLElBQUEsTUFBQSxNQUFBLFlBQUE7UUFDQSxJQUFBLEtBQUEsU0FBQSxTQUFBLFVBQUE7VUFDQSxTQUFBLFFBQUEsU0FBQSxlQUFBOztZQUVBLGFBQUEsd0JBQUEsUUFBQSxjQUFBOzs7Ozs7TUFNQSxVQUFBLFNBQUEsUUFBQSxJQUFBLFNBQUE7O1FBRUEsUUFBQSxJQUFBLE9BQUE7UUFDQSxRQUFBLElBQUEsYUFBQTs7UUFFQSxhQUFBLFNBQUEsS0FBQSxPQUFBLElBQUE7VUFDQSxZQUFBO1VBQ0EsWUFBQTtVQUNBLFlBQUE7VUFDQSxZQUFBLFNBQUE7Ozs7Ozs7TUFPQSxZQUFBLFNBQUEsSUFBQTtRQUNBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQSxnQkFBQSxJQUFBO1FBQ0EsSUFBQSxJQUFBOzs7Ozs7TUFNQSx3QkFBQSxTQUFBLFFBQUEsSUFBQSxTQUFBOztRQUVBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQSxnQkFBQSxJQUFBO1FBQ0EsSUFBQSxLQUFBLFNBQUEsU0FBQSxVQUFBOztTQUVBLEdBQUEsU0FBQSxTQUFBLE9BQUE7WUFDQSxJQUFBLElBQUE7ZUFDQTtZQUNBLElBQUEsSUFBQSxTQUFBLFFBQUE7O1dBRUEsVUFBQSxhQUFBO1VBQ0EsUUFBQSxJQUFBLHNCQUFBLFlBQUE7Ozs7UUFJQSxhQUFBLFVBQUEsUUFBQSxJQUFBOzs7OztNQUtBLFNBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxJQUFBLE1BQUE7OztNQUdBLFlBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxnQkFBQSxJQUFBLE1BQUE7OztNQUdBLEtBQUEsZUFBQTtNQUNBLEtBQUE7O0lBRUEsT0FBQTs7OztBQ3ZHQSxRQUFBLE9BQUE7R0FDQSxXQUFBLGtKQUFBLFNBQUEsT0FBQSxPQUFBLFlBQUEsV0FBQTs7cUNBRUEsTUFBQSxRQUFBLE1BQUEsT0FBQSxLQUFBO3FDQUNBLGNBQUE7O0lBRUEsSUFBQSxhQUFBO0lBQ0EsUUFBQSxJQUFBO0lBQ0EsV0FBQSxlQUFBOzs7OztBQ1JBLFFBQUEsT0FBQTtHQUNBLFFBQUEsNENBQUEsU0FBQSxnQkFBQSxZQUFBOztJQUVBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsa0JBQUEsSUFBQSxTQUFBLFlBQUE7O0lBRUEsSUFBQSxTQUFBLGVBQUE7O0lBRUEsSUFBQSxTQUFBO01BQ0EsVUFBQSxTQUFBLFVBQUE7UUFDQSxPQUFBLElBQUEsTUFBQTs7O01BR0EscUJBQUEsU0FBQSxVQUFBO1FBQ0EsT0FBQSxnQkFBQSxNQUFBOzs7TUFHQSxZQUFBLFNBQUEsU0FBQTtRQUNBLE9BQUEsSUFBQSxNQUFBLFNBQUE7O01BRUEsS0FBQTs7SUFFQSxPQUFBOzs7QUN0QkEsUUFBQSxPQUFBOzs7R0FHQSxRQUFBLGlFQUFBLFNBQUEsaUJBQUEsZ0JBQUEsWUFBQTtJQUNBLElBQUEsU0FBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsYUFBQSxnQkFBQTtJQUNBLElBQUEsV0FBQSxlQUFBOztJQUVBLElBQUEsV0FBQTtNQUNBLFNBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxPQUFBLElBQUEsTUFBQTtRQUNBLE9BQUEsZ0JBQUE7OztNQUdBLEtBQUE7O0lBRUEsT0FBQTs7Ozs7R0FLQSxRQUFBLCtDQUFBLFNBQUEs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LFVBQUEsb0JBQUEsVUFBQSxNQUFBLFFBQUEsVUFBQTtNQUNBLFVBQUEsc0JBQUEsVUFBQSxNQUFBLFVBQUEsVUFBQTtNQUNBLFVBQUEsZ0JBQUEsVUFBQSxNQUFBLFVBQUEsVUFBQTs7UUFFQTtNQUNBLFVBQUEsU0FBQTtNQUNBLFVBQUEsTUFBQTtNQUNBLFVBQUEsVUFBQTs7Ozs7O0lBTUEsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBLGdCQUFBO0lBQ0EsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBLGdCQUFBO0lBQ0EsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZUFBQTtJQUNBLFVBQUEsZ0JBQUE7OztJQUdBLFVBQUEsZ0JBQUE7TUFDQSxZQUFBO01BQ0EsUUFBQTtNQUNBLFVBQUE7TUFDQSxRQUFBO01BQ0EsUUFBQTs7Ozs7SUFLQSxVQUFBLGlCQUFBLFVBQUE7O01BRUEsSUFBQSxXQUFBLE9BQUEsS0FBQSxVQUFBLGVBQUE7TUFDQSxJQUFBLE1BQUE7TUFDQSxJQUFBLElBQUEsRUFBQSxFQUFBLEVBQUEsU0FBQSxJQUFBO1FBQ0EsTUFBQSxNQUFBLFVBQUEsY0FBQTs7O01BR0EsVUFBQSxxQkFBQSxJQUFBOztNQUVBLFFBQUEsSUFBQSxVQUFBOztNQUVBLFVBQUEsZ0JBQUEsRUFBQSxLQUFBLFVBQUEsb0JBQUEsTUFBQSxVQUFBOzs7OztJQUtBLFVBQUEsaUJBQUEsU0FBQSxLQUFBO01BQ0EsR0FBQTtNQUNBO01BQ0EsSUFBQSxLQUFBO01BQ0EsSUFBQSxJQUFBLEVBQUEsRUFBQSxFQUFBLEtBQUEsT0FBQSxJQUFBO1FBQ0EsTUFBQSxNQUFBLEtBQUEsR0FBQTs7TUFFQSxPQUFBLElBQUEsS0FBQTs7Ozs7O0lBTUEsV0FBQSxDQUFBLGNBQUEsYUFBQSxrQkFBQSxtQkFBQSxLQUFBLFVBQUEsY0FBQTtNQUNBLFVBQUEsY0FBQSxhQUFBO01BQ0EsVUFBQSxjQUFBLGFBQUE7TUFDQSxVQUFBLGNBQUEsYUFBQTtNQUNBLFVBQUEscUJBQUEsYUFBQTs7OztJQUlBLFVBQUEsV0FBQSxTQUFBLE9BQUE7TUFDQSxHQUFBLFNBQUEsS0FBQTs7Ozs7Ozs7O0lBU0EsVUFBQSxjQUFBLFNBQUEsSUFBQTtNQUNBLElBQUEsZ0JBQUEsQ0FBQSxTQUFBLFNBQUEsU0FBQSxVQUFBLE9BQUE7TUFDQSxVQUFBLEtBQUE7VUFDQSxZQUFBO1VBQ0EsYUFBQTtVQUNBLFFBQUEsUUFBQSxRQUFBLFNBQUE7VUFDQSxhQUFBO1VBQ0EscUJBQUE7VUFDQSxZQUFBOzs7Ozs7SUFNQSxVQUFBLGFBQUEsU0FBQSxLQUFBOztNQUVBLFFBQUEsSUFBQSxVQUFBO01BQ0EsT0FBQSxVQUFBOzs7O0lBSUEsVUFBQSxXQUFBLFNBQUEsT0FBQTtNQUNBLFVBQUEsV0FBQTtNQUNBLElBQUEsT0FBQTtNQUNBLEtBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxNQUFBLFFBQUEsS0FBQTtRQUNBLEtBQUEsS0FBQSxNQUFBOztNQUVBLFFBQUEsSUFBQTtNQUNBLE9BQUE7OztJQUdBLFVBQUEsV0FBQSxTQUFBLE9BQUE7TUFDQSxRQUFBLElBQUEsVUFBQSxLQUFBOzs7Ozs7Ozs7O0lBVUEsVUFBQSxhQUFBLFNBQUEsTUFBQSxPQUFBO01BQ0EsUUFBQSxRQUFBLE9BQUEsVUFBQSxVQUFBLE9BQUE7UUFDQSxJQUFBLGFBQUEsSUFBQTtRQUNBLFdBQUEsU0FBQSxVQUFBLE9BQUE7VUFDQSxJQUFBLE1BQUEsTUFBQSxPQUFBO1VBQ0EsVUFBQSxhQUFBLFNBQUE7O1FBRUEsV0FBQSxjQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsb0JBQUEsU0FBQSxHQUFBLFlBQUEsSUFBQTs7TUFFQSxJQUFBLFVBQUEsVUFBQTtTQUNBLE1BQUEsVUFBQTtTQUNBLFlBQUEsVUFBQTtTQUNBLFlBQUE7U0FDQSxHQUFBLFVBQUE7U0FDQSxPQUFBLFVBQUE7TUFDQSxVQUFBLEtBQUEsU0FBQSxLQUFBLFdBQUE7UUFDQSxHQUFBLFVBQUEsWUFBQSxZQUFBLEtBQUE7VUFDQSxPQUFBLEdBQUE7Ozs7Ozs7SUFPQSxVQUFBLGNBQUEsU0FBQSxZQUFBLElBQUE7O01BRUEsR0FBQSxlQUFBLFVBQUEsSUFBQTtRQUNBLGFBQUEsVUFBQSxPQUFBLFNBQUEsSUFBQSxNQUFBLFVBQUEsUUFBQSxTQUFBLElBQUE7UUFDQSxPQUFBO1lBQ0E7UUFDQSxPQUFBOzs7Ozs7SUFNQSxVQUFBLFFBQUEsU0FBQSxTQUFBOztNQUVBLFVBQUEsT0FBQSxTQUFBLFNBQUEsS0FBQSxLQUFBO1FBQ0EsVUFBQSxTQUFBO1FBQ0EsVUFBQSxVQUFBLFNBQUE7UUFDQSxVQUFBLFVBQUE7UUFDQSxVQUFBLFVBQUE7UUFDQSxVQUFBLFNBQUE7U0FDQSxLQUFBLFVBQUE7OztRQUdBLFVBQUEsS0FBQSx3QkFBQSxTQUFBLElBQUEsU0FBQSxJQUFBLFVBQUE7Ozs7Ozs7O01BUUEsVUFBQSxPQUFBLFdBQUEsU0FBQSxLQUFBLFVBQUEsS0FBQSxTQUFBLEtBQUE7UUFDQSxHQUFBLENBQUEsS0FBQSxNQUFBO1VBQ0EsVUFBQSxPQUFBLGNBQUEsU0FBQSxLQUFBLElBQUE7YUFDQTtVQUNBLFVBQUEsT0FBQSxjQUFBLFNBQUE7YUFDQSxJQUFBLEtBQUEsT0FBQTs7Ozs7O01BTUEsVUFBQSxNQUFBLFFBQUEsVUFBQSxLQUFBLE1BQUE7U0FDQSxJQUFBLFVBQUEsUUFBQSxLQUFBLFFBQUEsUUFBQTs7TUFFQSxVQUFBLE1BQUEsUUFBQSxVQUFBLEtBQUEsTUFBQSx1QkFBQSxTQUFBO1NBQ0EsT0FBQSxJQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsZUFBQSxTQUFBLFFBQUEsUUFBQTtNQUNBLFVBQUEsT0FBQSxnQkFBQSxRQUFBLFNBQUEsS0FBQTtRQUNBLFVBQUEsVUFBQSxhQUFBO1FBQ0EsVUFBQSxVQUFBO1FBQ0EsVUFBQSxTQUFBOzs7Ozs7SUFNQSxVQUFBLGVBQUEsV0FBQTtNQUNBLElBQUEsWUFBQSxVQUFBLGVBQUEsT0FBQTtNQUNBLFVBQUEsZUFBQSxLQUFBLENBQUEsS0FBQSxXQUFBOzs7SUFHQSxVQUFBLGVBQUEsV0FBQTtNQUNBLElBQUEsV0FBQSxVQUFBLGVBQUEsT0FBQTtNQUNBLFVBQUEsZUFBQSxPQUFBOzs7OztJQUtBLFVBQUEsY0FBQSxTQUFBLFNBQUEsUUFBQTs7O01BR0EsSUFBQSxpQkFBQTs7TUFFQSxHQUFBLFVBQUEsU0FBQSxhQUFBLElBQUE7UUFDQSxRQUFBLElBQUEsVUFBQSxTQUFBO1FBQ0EsaUJBQUE7VUFDQSxVQUFBLFVBQUEsU0FBQSxTQUFBLFFBQUE7VUFDQSxVQUFBLEtBQUEsUUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQTtVQUNBLFVBQUEsVUFBQSxTQUFBLFNBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxVQUFBLFVBQUEsU0FBQSxTQUFBLFFBQUEsU0FBQSxTQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXlCQSxVQUFBLE9BQUEsSUFBQSxLQUFBO1VBQ0EsZ0JBQUEsVUFBQTtVQUNBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBO1VBQ0EsZ0JBQUEsVUFBQTs7VUFFQSxnQkFBQSxVQUFBLFNBQUE7VUFDQSxnQkFBQSxVQUFBO1VBQ0EsZ0JBQUEsVUFBQTtVQUNBLGdCQUFBO1VBQ0EsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUE7VUFDQSxnQkFBQSxTQUFBO1VBQ0EsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUEsVUFBQTtXQUNBLEtBQUEsU0FBQSxNQUFBOztVQUVBLElBQUEsVUFBQTs7VUFFQSxHQUFBLEtBQUEsUUFBQSxVQUFBLFNBQUEsU0FBQSxHQUFBO1lBQ0EsV0FBQSxVQUFBLFNBQUE7ZUFDQTtZQUNBLFdBQUEsS0FBQSxRQUFBLFVBQUEsU0FBQTs7OztVQUlBLFVBQUEsT0FBQSxjQUFBLE1BQUEsT0FBQSxPQUFBLENBQUEsT0FBQSxTQUFBLE1BQUE7OztVQUdBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBO2FBQ0EsSUFBQSxVQUFBLFFBQUEsS0FBQSxPQUFBLFFBQUE7O1VBRUEsVUFBQSxNQUFBLFFBQUEsVUFBQSxLQUFBLE1BQUEsc0JBQUEsTUFBQTthQUNBLE9BQUEsSUFBQSxTQUFBOzs7VUFHQSxHQUFBLG1CQUFBLEdBQUE7O1lBRUEsVUFBQSxPQUFBLFNBQUEsZUFBQTt1QkFDQSxNQUFBLE1BQUE7dUJBQ0EsT0FBQSxJQUFBLFNBQUE7O1lBRUEsVUFBQSxPQUFBLFNBQUEsZUFBQTtlQUNBLE1BQUEsUUFBQSxJQUFBOzs7O1VBSUEsR0FBQSxVQUFBLFNBQUEsU0FBQSxLQUFBO1lBQ0EsS0FBQSxJQUFBLFFBQUEsR0FBQSxRQUFBLFVBQUEsU0FBQSxLQUFBLFFBQUEsRUFBQSxPQUFBO2NBQ0EsVUFBQSxLQUFBLFNBQUEsVUFBQSxTQUFBLEtBQUEsT0FBQTtpQkFDQSxNQUFBLE1BQUEsT0FBQSxPQUFBLElBQUEsU0FBQTs7Ozs7VUFLQSxVQUFBLEtBQUEsZUFBQSxNQUFBLE1BQUEsVUFBQTs7OztVQUlBLFVBQUEsV0FBQTtZQUNBLE1BQUE7Ozs7Ozs7SUFPQSxVQUFBLGNBQUEsU0FBQSxXQUFBO01BQ0EsR0FBQSxVQUFBLE1BQUEsWUFBQSxVQUFBLElBQUEsWUFBQTtRQUNBLE9BQUE7V0FDQTtRQUNBLE9BQUE7Ozs7OztJQU1BLFVBQUEsYUFBQSxTQUFBLFdBQUE7OztNQUdBLFVBQUEsTUFBQSxXQUFBLFlBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxZQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxTQUFBLFFBQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsWUFBQSxNQUFBLHNCQUFBLFVBQUE7V0FDQSxPQUFBLElBQUEsU0FBQTs7OztNQUlBLFVBQUEsTUFBQSxXQUFBLFVBQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxNQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBO1dBQ0EsSUFBQSxLQUFBLEtBQUEsU0FBQSxRQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBLHVCQUFBO1dBQ0EsT0FBQSxJQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsZUFBQSxTQUFBLFdBQUE7OztNQUdBLFVBQUEsTUFBQSxXQUFBLFlBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxZQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxTQUFBLFFBQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsWUFBQSxNQUFBLHNCQUFBLFVBQUEsS0FBQTs7OztNQUlBLFVBQUEsTUFBQSxXQUFBLFVBQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxNQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBO1dBQ0EsSUFBQSxLQUFBLEtBQUEsVUFBQSxRQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBLHVCQUFBLFlBQUE7Ozs7Ozs7O0lBUUEsVUFBQSxTQUFBLFNBQUEsTUFBQTs7TUFFQSxHQUFBLE1BQUEsYUFBQSxhQUFBLE1BQUEsVUFBQSxVQUFBLFFBQUEsVUFBQTtRQUNBLFVBQUEsZUFBQTs7TUFFQSxVQUFBLE9BQUEsWUFBQSxNQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsS0FBQSxTQUFBLE1BQUE7UUFDQSxVQUFBLGtCQUFBLE1BQUEsTUFBQSxLQUFBLElBQUEsTUFBQTs7O1FBR0EsVUFBQSxNQUFBLFdBQUEsTUFBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsTUFBQSxLQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxRQUFBLFFBQUE7UUFDQSxVQUFBLE1BQUEsUUFBQSxNQUFBLEtBQUEsTUFBQSx1QkFBQSxNQUFBO1dBQ0EsT0FBQSxJQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsZUFBQSxTQUFBLE1BQUE7TUFDQSxVQUFBLE9BQUEsV0FBQSxNQUFBLEtBQUEsVUFBQTs7TUFFQSxVQUFBLE1BQUEsV0FBQSxNQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTs7O1FBR0EsVUFBQSxNQUFBLFFBQUEsTUFBQSxLQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxRQUFBLFFBQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsTUFBQSxLQUFBLE1BQUEsdUJBQUEsTUFBQSxLQUFBOzs7O01BSUEsVUFBQSxrQkFBQSxNQUFBLE1BQUEsS0FBQSxPQUFBLFNBQUEsTUFBQTtZQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsSUFBQSxVQUFBO2lCQUNBO1lBQ0EsUUFBQSxJQUFBOzs7OztJQUtBLFVBQUEsV0FBQSxTQUFBLE1BQUE7TUFDQSxHQUFBLE1BQUEsV0FBQSxhQUFBLE1BQUEsUUFBQSxVQUFBLFFBQUEsVUFBQTtRQUNBLFVBQUEsYUFBQTs7TUFFQSxVQUFBLE9BQUEsY0FBQSxNQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsS0FBQSxTQUFBLE1BQUE7UUFDQSxVQUFBLG9CQUFBLE1BQUEsTUFBQSxLQUFBLElBQUEsTUFBQTs7OztJQUlBLFVBQUEsaUJBQUEsU0FBQSxNQUFBO01BQ0EsVUFBQSxPQUFBLGFBQUEsTUFBQSxLQUFBLFVBQUE7TUFDQSxVQUFBLG9CQUFBLE1BQUEsTUFBQSxLQUFBLE9BQUEsU0FBQSxNQUFBO1lBQ0EsSUFBQSxPQUFBO1lBQ0EsUUFBQSxJQUFBLFVBQUE7aUJBQ0E7WUFDQSxRQUFBLElBQUE7Ozs7O0lBS0EsVUFBQSxjQUFBLFNBQUEsTUFBQTtNQUNBLFVBQUEsT0FBQSxPQUFBLE1BQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxLQUFBLFNBQUEsTUFBQTtRQUNBLFVBQUEsY0FBQSxNQUFBLE1BQUEsS0FBQSxJQUFBLE1BQUEsUUFBQSxVQUFBOzs7O0lBSUEsVUFBQSxnQkFBQSxTQUFBLE1BQUE7TUFDQSxVQUFBLE9BQUEsU0FBQSxNQUFBLEtBQUEsVUFBQTtNQUNBLFVBQUEsY0FBQSxNQUFBLE1BQUEsS0FBQSxPQUFBLFNBQUEsTUFBQTtZQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsSUFBQSxVQUFBO2lCQUNBO1lBQ0EsUUFBQSxJQUFBOzs7Ozs7OztBQVFBLFNBQUEsYUFBQSxRQUFBLFFBQUE7RUFDQSxPQUFBLEtBQUEsU0FBQSxVQUFBLE1BQUE7SUFDQSxPQUFBLElBQUEsS0FBQSxPQUFBLFVBQUEsT0FBQTtNQUNBLElBQUEsQ0FBQSxPQUFBO1FBQ0EsT0FBQTs7V0FFQSxJQUFBLE9BQUEsYUFBQSxlQUFBLFFBQUEsT0FBQTtRQUNBLFFBQUEsTUFBQTs7Ozs7O0FDL2ZBLFFBQUEsT0FBQTs7R0FFQSxRQUFBLCtEQUFBLFVBQUEsaUJBQUEsZ0JBQUEsYUFBQTtJQUNBLElBQUEsTUFBQSxJQUFBLFNBQUEsY0FBQTtJQUNBLElBQUEsU0FBQSxnQkFBQTtJQUNBLElBQUEsWUFBQSxlQUFBO0lBQ0EsSUFBQSxXQUFBOztJQUVBLElBQUEsU0FBQTs7TUFFQSxRQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsZUFBQSxJQUFBLGFBQUEsUUFBQSxRQUFBOzs7O01BSUEsU0FBQSxVQUFBLE1BQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsZUFBQTs7OztNQUlBLFdBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxPQUFBLFFBQUE7OztNQUdBLFVBQUEsVUFBQSxPQUFBO1FBQ0EsT0FBQSxJQUFBLE1BQUE7O01BRUEsaUJBQUEsWUFBQTs7O01BR0EsTUFBQSxVQUFBLFVBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFlBQUEsUUFBQTtRQUNBLE9BQUEsZUFBQTs7O01BR0EsTUFBQSxVQUFBLFlBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsZ0JBQUE7Ozs7TUFJQSxhQUFBLFVBQUEsWUFBQTtRQUNBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTs7O01BR0EsZUFBQSxVQUFBLFdBQUE7UUFDQSxPQUFBLElBQUEsU0FBQSxjQUFBLFlBQUE7OztNQUdBLGdCQUFBLFVBQUEsWUFBQTtRQUNBLE9BQUEsZUFBQSxJQUFBLGFBQUEsUUFBQSxRQUFBLFlBQUEsYUFBQTs7O01BR0EsZUFBQSxVQUFBLFlBQUE7OztNQUdBLFVBQUEsVUFBQSxZQUFBO1FBQ0EsT0FBQSxlQUFBLE9BQUEsWUFBQTs7OztNQUlBLFdBQUEsVUFBQSxTQUFBO1FBQ0EsSUFBQSxPQUFBLElBQUEsTUFBQSxVQUFBO1FBQ0EsT0FBQSxlQUFBOzs7O01BSUEsVUFBQSxVQUFBLFNBQUE7UUFDQSxPQUFBLGVBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7TUFJQSxZQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUE7O01BRUEsZUFBQSxVQUFBLFNBQUE7UUFDQSxPQUFBLElBQUEsTUFBQSxVQUFBOzs7TUFHQSxjQUFBLFVBQUEsU0FBQSxTQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsVUFBQTs7OztNQUlBLGlCQUFBLFVBQUEsU0FBQSxTQUFBOztRQUVBLE9BQUEsZUFBQSxJQUFBLE1BQUEsVUFBQSxjQUFBLFVBQUE7Ozs7TUFJQSxZQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUE7VUFDQSxLQUFBLElBQUEsTUFBQSxVQUFBO1VBQ0EsT0FBQSxlQUFBLElBQUEsTUFBQSxVQUFBOzs7OztNQUtBLGNBQUEsVUFBQSxTQUFBO1FBQ0EsT0FBQTtVQUNBLEtBQUEsSUFBQSxNQUFBLFVBQUE7VUFDQSxPQUFBLGVBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7O01BS0EsY0FBQSxVQUFBLFNBQUE7UUFDQSxPQUFBO1VBQ0EsS0FBQSxJQUFBLE1BQUEsVUFBQTtVQUNBLEtBQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7TUFJQSxhQUFBLFVBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxNQUFBLFVBQUEsWUFBQSxNQUFBLEtBQUEsSUFBQSxTQUFBO1FBQ0EsT0FBQSxnQkFBQSxJQUFBLE1BQUEsVUFBQSxZQUFBLE1BQUE7OztNQUdBLFlBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxZQUFBLE1BQUEsS0FBQSxPQUFBLFVBQUEsT0FBQTtVQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsSUFBQSxVQUFBO2lCQUNBO1lBQ0EsUUFBQSxJQUFBOztRQUVBLE9BQUEsSUFBQSxNQUFBLFVBQUE7OztNQUdBLGVBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsS0FBQSxJQUFBLFNBQUE7UUFDQSxPQUFBLGdCQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQTs7O01BR0EsY0FBQSxVQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxLQUFBLE9BQUEsVUFBQSxPQUFBO1VBQ0EsSUFBQSxPQUFBO1lBQ0EsUUFBQSxJQUFBLFVBQUE7aUJBQ0E7WUFDQSxRQUFBLElBQUE7O1FBRUEsT0FBQSxJQUFBLE1BQUEsVUFBQTs7O01BR0EsUUFBQSxVQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxXQUFBLE1BQUEsS0FBQSxJQUFBLFNBQUE7UUFDQSxnQkFBQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsVUFBQSxVQUFBLEtBQUEsVUFBQSxNQUFBO1VBQ0EsSUFBQSxLQUFBLFVBQUEsUUFBQSxLQUFBLFVBQUEsV0FBQTtZQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxTQUFBLElBQUE7aUJBQ0E7WUFDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsU0FBQSxJQUFBLEtBQUEsU0FBQTs7OztRQUlBLE9BQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUE7OztNQUdBLFVBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsV0FBQSxNQUFBLEtBQUEsT0FBQSxVQUFBLE9BQUE7VUFDQSxJQUFBLE9BQUE7WUFDQSxRQUFBLElBQUEsVUFBQTtpQkFDQTtZQUNBLFFBQUEsSUFBQTtZQUNBLGdCQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxVQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7Y0FDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsU0FBQSxJQUFBLEtBQUEsU0FBQTs7O1FBR0EsT0FBQSxJQUFBLE1BQUEsVUFBQTs7O01BR0EsVUFBQSxVQUFBLFNBQUE7UUFDQSxPQUFBO1VBQ0EsS0FBQSxJQUFBLE1BQUEsU0FBQSxNQUFBO1VBQ0EsS0FBQSxnQkFBQSxJQUFBLE1BQUEsU0FBQSxNQUFBOzs7O01BSUEsWUFBQSxZQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxXQUFBLFlBQUE7OztNQUdBLGFBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxRQUFBLFFBQUE7Ozs7TUFJQSxLQUFBLGVBQUE7O01BRUEsS0FBQTtNQUNBLEtBQUE7OztJQUdBLE9BQUE7Ozs7QUNoTUEsUUFBQSxPQUFBO0dBQ0EsV0FBQSx1S0FBQSxTQUFBLFFBQUEsWUFBQSxRQUFBLFNBQUE7O3NDQUVBLEtBQUEsTUFBQSxRQUFBLFNBQUEsT0FBQTs7c0NBRUEsUUFBQSxRQUFBLFVBQUE7SUFDQSxJQUFBLGNBQUE7OztJQUdBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTs7SUFFQSxZQUFBLFlBQUE7SUFDQSxZQUFBLE9BQUE7O0lBRUEsWUFBQSxXQUFBOztJQUVBLFlBQUEsV0FBQTs7O0lBR0EsWUFBQSxjQUFBLFNBQUEsSUFBQTtNQUNBLFlBQUEsT0FBQSxZQUFBLE9BQUEsVUFBQTs7Ozs7O0lBTUEsWUFBQSxlQUFBLFVBQUE7TUFDQSxZQUFBLFNBQUEsTUFBQSxTQUFBLFVBQUE7UUFDQSxZQUFBLFNBQUEsZUFBQSxTQUFBLFNBQUE7VUFDQSxHQUFBLFNBQUEsV0FBQSxhQUFBO1lBQ0EsT0FBQSxXQUFBO1lBQ0EsWUFBQSxTQUFBLElBQUEsT0FBQSxTQUFBLFVBQUE7Y0FDQSxRQUFBLElBQUE7O2lCQUVBO2NBQ0EsUUFBQSxJQUFBOzs7Ozs7OztJQVFBLFlBQUEsa0JBQUEsWUFBQTs7O0lBR0EsWUFBQSxjQUFBLFNBQUEsSUFBQTtNQUNBLE9BQUEsWUFBQSxPQUFBLFVBQUE7Ozs7O0lBS0EsWUFBQSxrQkFBQTtJQUNBLFlBQUEsa0JBQUE7SUFDQSxZQUFBLGtCQUFBO0lBQ0EsWUFBQSxrQkFBQTs7Ozs7O0lBTUEsWUFBQSxvQkFBQSxTQUFBLElBQUE7TUFDQSxZQUFBLGFBQUEsWUFBQSxLQUFBLFdBQUE7OztJQUdBLEdBQUEsS0FBQSxJQUFBLFVBQUE7TUFDQSxZQUFBLGtCQUFBLEtBQUEsSUFBQSxVQUFBOzs7SUFHQSxZQUFBLGFBQUEsU0FBQSxNQUFBLFVBQUE7TUFDQSxZQUFBLGFBQUEsVUFBQTtNQUNBLFlBQUEsS0FBQSxTQUFBLFVBQUE7U0FDQSxNQUFBLEtBQUEsSUFBQSxVQUFBLEtBQUEsT0FBQSxJQUFBLFNBQUE7Ozs7Ozs7O0lBUUEsWUFBQSxhQUFBLFNBQUEsT0FBQTtNQUNBLFFBQUEsUUFBQSxPQUFBLFVBQUEsVUFBQSxHQUFBO1FBQ0EsSUFBQSxhQUFBLElBQUE7UUFDQSxXQUFBLFNBQUEsVUFBQSxPQUFBO1VBQ0EsSUFBQSxNQUFBLE1BQUEsT0FBQTtVQUNBLFlBQUEsYUFBQSxLQUFBO1VBQ0EsWUFBQSxNQUFBLFdBQUEsS0FBQSxJQUFBLFVBQUEsS0FBQSxPQUFBLENBQUEsU0FBQTtVQUNBLE9BQUEsQ0FBQSxRQUFBLFFBQUEsU0FBQSxTQUFBLFVBQUE7O1FBRUEsV0FBQSxjQUFBLFNBQUE7Ozs7Ozs7SUFPQSxZQUFBLGNBQUEsU0FBQSxTQUFBO01BQ0EsWUFBQSxRQUFBLFVBQUEsU0FBQTs7O01BR0EsR0FBQSxZQUFBLGFBQUEsT0FBQTtRQUNBLGlCQUFBO1VBQ0EsVUFBQSxZQUFBLFNBQUEsUUFBQTtVQUNBLE1BQUEsWUFBQSxTQUFBLFFBQUE7VUFDQSxTQUFBLFlBQUEsU0FBQSxRQUFBO1VBQ0EsS0FBQSxZQUFBLFNBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxLQUFBLFlBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQTs7O1FBR0EsWUFBQSxRQUFBLGVBQUE7OztNQUdBLFlBQUEsUUFBQSxRQUFBLEtBQUEsV0FBQTtRQUNBLE9BQUEsQ0FBQSxRQUFBLFFBQUEsU0FBQSxTQUFBLFVBQUE7UUFDQSxHQUFBLGFBQUEsVUFBQTtVQUNBLE9BQUEsR0FBQTs7U0FFQSxNQUFBLFNBQUEsT0FBQTtRQUNBLE9BQUEsQ0FBQSxRQUFBLG9CQUFBLFNBQUEsU0FBQSxVQUFBOzs7Ozs7SUFNQSxZQUFBLGFBQUEsVUFBQTs7TUFFQSxZQUFBLE1BQUEsV0FBQSxLQUFBLElBQUEsVUFBQSxLQUFBO1FBQ0E7VUFDQSxjQUFBLFlBQUEsUUFBQTtVQUNBLGNBQUEsWUFBQSxRQUFBOzs7O01BSUEsWUFBQSxNQUFBLFdBQUEsS0FBQSxJQUFBLFVBQUEsSUFBQSxRQUFBLE9BQUEsSUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBLFlBQUEsZ0JBQUEsWUFBQSxNQUFBLFlBQUEsZ0JBQUE7UUFDQSxVQUFBLFNBQUE7OztNQUdBLE9BQUEsQ0FBQSxRQUFBLFFBQUEsU0FBQSxTQUFBLFVBQUE7Ozs7O0lBS0EsWUFBQSxZQUFBLFVBQUE7TUFDQSxZQUFBLE1BQUEsV0FBQSxLQUFBLElBQUEsVUFBQSxLQUFBLE9BQUEsQ0FBQSxhQUFBLFlBQUEsUUFBQTs7TUFFQSxPQUFBLENBQUEsUUFBQSxRQUFBLFNBQUEsU0FBQSxVQUFBOzs7O0lBSUEsWUFBQSxnQkFBQSxVQUFBOztNQUVBLFlBQUEsUUFBQSxRQUFBLEtBQUEsVUFBQTtRQUNBLE9BQUEsR0FBQTs7Ozs7O0lBTUEsWUFBQSxnQkFBQSxVQUFBOztNQUVBLFlBQUEsTUFBQSxtQkFBQSxZQUFBLFFBQUEsYUFBQSxLQUFBLFNBQUEsU0FBQSxVQUFBO1FBQ0EsR0FBQSxTQUFBLFVBQUEsS0FBQTtVQUNBLE9BQUEsWUFBQSxVQUFBO2NBQ0E7VUFDQSxPQUFBLFlBQUEsVUFBQTs7Ozs7OztBQzlLQSxRQUFBLE9BQUE7R0FDQSxRQUFBLHVFQUFBLFVBQUEsZ0JBQUEsaUJBQUEsYUFBQSxPQUFBO0lBQ0EsSUFBQSxXQUFBLElBQUEsU0FBQSxjQUFBO0lBQ0EsSUFBQSxRQUFBLGVBQUE7O0lBRUEsSUFBQSxRQUFBO01BQ0EsZUFBQSxZQUFBO1FBQ0EsT0FBQSxNQUFBO1VBQ0EsS0FBQTtVQUNBLFFBQUE7Ozs7TUFJQSxtQkFBQSxZQUFBO1FBQ0EsT0FBQSxNQUFBO1VBQ0EsS0FBQTtVQUNBLFFBQUE7V0FDQSxLQUFBLFVBQUEsTUFBQTtVQUNBLE9BQUEsS0FBQTs7OztNQUlBLFNBQUEsU0FBQSxJQUFBO1FBQ0EsT0FBQSxNQUFBLFdBQUE7Ozs7O01BS0EscUJBQUEsU0FBQSxTQUFBO1FBQ0EsT0FBQSxlQUFBLFNBQUEsYUFBQSxlQUFBLFFBQUE7Ozs7TUFJQSxtQkFBQSxTQUFBLFNBQUE7UUFDQSxPQUFBLFNBQUEsYUFBQSxlQUFBLFFBQUE7Ozs7TUFJQSxZQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsZ0JBQUEsU0FBQSxNQUFBOzs7TUFHQSxnQkFBQSxVQUFBLEtBQUE7UUFDQSxJQUFBLFFBQUEsUUFBQSxRQUFBLElBQUE7VUFDQSxPQUFBLE1BQUEsV0FBQSxLQUFBOzs7OztNQUtBLFlBQUEsU0FBQSxJQUFBO1FBQ0EsT0FBQSxTQUFBLE1BQUEsSUFBQTs7OztNQUlBLFlBQUEsU0FBQSxJQUFBLFVBQUE7O1FBRUEsSUFBQSxPQUFBO1FBQ0EsSUFBQSxTQUFBLElBQUEsU0FBQSxZQUFBLFNBQUEsSUFBQSx1QkFBQTtRQUNBLElBQUEsS0FBQSxTQUFBLFNBQUEsVUFBQTtVQUNBLFNBQUEsU0FBQTs7UUFFQSxPQUFBOzs7O01BSUEsbUJBQUEsU0FBQSxNQUFBLFFBQUEsUUFBQTs7UUFFQSxJQUFBLE1BQUEsSUFBQSxTQUFBO1FBQ0EsSUFBQSxlQUFBO1VBQ0EsT0FBQTtVQUNBLGFBQUE7VUFDQSxhQUFBO1dBQ0EsU0FBQSxPQUFBO1VBQ0EsSUFBQSxPQUFBO1lBQ0EsUUFBQSxNQUFBO2NBQ0EsS0FBQTtnQkFDQSxRQUFBLElBQUE7Z0JBQ0E7Y0FDQSxLQUFBO2dCQUNBLFFBQUEsSUFBQTtnQkFDQTtjQUNBO2dCQUNBLFFBQUEsSUFBQSw0QkFBQTs7aUJBRUE7WUFDQSxRQUFBLElBQUE7Ozs7O01BS0EsU0FBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLFNBQUEsTUFBQTs7O01BR0EsU0FBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLFNBQUEsTUFBQSxLQUFBLE1BQUE7OztNQUdBLFdBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxTQUFBLE1BQUEsS0FBQSxNQUFBOzs7O01BSUEsV0FBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLFNBQUEsTUFBQSxLQUFBLE1BQUE7OztNQUdBLFlBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxTQUFBLE1BQUE7OztNQUdBLEtBQUE7OztJQUdBLE9BQUE7OztBQ2xIQSxRQUFBLE9BQUE7R0FDQSxRQUFBLHFCQUFBLFVBQUE7Ozs7Ozs7Ozs7O0tBV0EsT0FBQTs7UUFFQSxlQUFBLFVBQUE7O1lBRUEsSUFBQSxhQUFBOzs7WUFHQSxJQUFBLGVBQUE7Ozs7OztZQU1BLElBQUEsZ0JBQUE7OztjQUdBLElBQUEsTUFBQSxJQUFBLE9BQUE7Y0FDQSxJQUFBLGlCQUFBLFFBQUE7Y0FDQSxlQUFBOztjQUVBLElBQUEsaUJBQUEsSUFBQSxNQUFBO2NBQ0EsS0FBQSxJQUFBLElBQUEsR0FBQSxLQUFBLEdBQUEsS0FBQTtnQkFDQSxlQUFBLEtBQUEsV0FBQSxPQUFBLE1BQUE7O2dCQUVBLE1BQUEsS0FBQSxNQUFBLE1BQUE7O2NBRUEsSUFBQSxRQUFBLEdBQUEsTUFBQSxJQUFBLE1BQUE7O2NBRUEsSUFBQSxLQUFBLGVBQUEsS0FBQTs7Y0FFQSxJQUFBLENBQUEsZUFBQTtnQkFDQSxLQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsS0FBQTtrQkFDQSxjQUFBLEtBQUEsS0FBQSxNQUFBLEtBQUEsV0FBQTs7cUJBRUE7O2dCQUVBLEtBQUEsSUFBQSxJQUFBLEtBQUEsS0FBQSxjQUFBLE9BQUEsSUFBQSxLQUFBO2tCQUNBLGNBQUEsS0FBQTs7Z0JBRUEsY0FBQTs7Y0FFQSxLQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsS0FBQTtnQkFDQSxNQUFBLFdBQUEsT0FBQSxjQUFBOztjQUVBLEdBQUEsR0FBQSxVQUFBLElBQUEsTUFBQSxJQUFBLE1BQUE7O2NBRUEsT0FBQTs7OztJQUlBIiwiZmlsZSI6ImJ1aWxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1haW4gbW9kdWxlIG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdBcHAnLCBbXG4gICAgJ2ZpcmViYXNlJyxcbiAgICAnYW5ndWxhci1tZDUnLCAvLyBFbmNyeXB0IGVtYWlsXG4gICAgJ25nUm91dGUnLFxuICAgICd1aS5yb3V0ZXInLFxuICAgICduZ01hdGVyaWFsJywgLy8gSW50ZXJmYWNlXG4gICAgJ2FuZ3VsYXJNb21lbnQnLCAvLyBUaW1lIG1hbmFnZW1lbnRcbiAgICAnZmxvdycsIC8vIEltYWdlIHVwbG9hZFxuICAgICdzbHVnaWZpZXInLCAvLyBDcmVhdGUgU2x1Z3NcbiAgICAnbmdBdXRvY29tcGxldGUnLCAvLyBHb29nbGUgcGxhY2VzXG4gICAgJ25nVGFnc0lucHV0JywgLy8gVGFnc1xuICAgICdjZ05vdGlmeScsIC8vIE5vdGlmaWNhdGlvbiAtIGh0dHBzOi8vZ2l0aHViLmNvbS9jZ3Jvc3MvYW5ndWxhci1ub3RpZnlcbiAgICAncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScsIC8vIFRyYW5zbGF0aW9uIC0gaHR0cHM6Ly9hbmd1bGFyLXRyYW5zbGF0ZS5naXRodWIuaW8vXG4gICAgJ2ZhY2Vib29rJywgICAgICAgLy8gIEZhY2Vib29rIC0gaHR0cHM6Ly9naXRodWIuY29tL0NpdWwvYW5ndWxhci1mYWNlYm9va1xuICAgICdhbmd1bGFyLWZsZXhzbGlkZXInLCAvLyBJbWFnZSBzbGlkZXIgLSBodHRwczovL2dpdGh1Yi5jb20vdGhlbmlrc28vYW5ndWxhci1mbGV4c2xpZGVyXG5cbiAgICAvLyBFbW90aWNvbiAtLSBodHRwOi8vbWlzdGljMTAwLmdpdGh1Yi5pby9hbmd1bGFyLXNtaWxpZXMvXG4gICAgJ25nU2FuaXRpemUnLFxuICAgICd1aS5ib290c3RyYXAnLCAgIC8vICBPUiBtZ2NyZWEubmdTdHJhcFxuICAgICdhbmd1bGFyLXNtaWxpZXMnLFxuXG4gICAgJ25nQ29va2llcycsICAgICAgLy8gIGNvb2tpZXMgc3R1ZmZcbiAgICAnbm90aWZpY2F0aW9uJywgICAvLyAgd2ViIG5vdGlmaWNhdGlvbiAtIGh0dHBzOi8vZ2l0aHViLmNvbS9uZW96aXJvL2FuZ3VsYXItbm90aWZpY2F0aW9uXG5cbiAgXSlcblxuICAuY29uZmlnKGZ1bmN0aW9uICgkbWRUaGVtaW5nUHJvdmlkZXIpIHtcbiAgICAkbWRUaGVtaW5nUHJvdmlkZXIuZGVmaW5lUGFsZXR0ZSgnc2xhY2snLCB7XG4gICAgICAnNTAnOiAnZmZlYmVlJyxcbiAgICAgICcxMDAnOiAnZmZjZGQyJyxcbiAgICAgICcyMDAnOiAnZWY5YTlhJyxcbiAgICAgICczMDAnOiAnZTU3MzczJyxcbiAgICAgICc0MDAnOiAnZWY1MzUwJyxcbiAgICAgICc1MDAnOiAnNEQzOTRCJywgLy8gcHJpbWFyeSBjb2xvdXJcbiAgICAgICc2MDAnOiAnZTUzOTM1JyxcbiAgICAgICc3MDAnOiAnZDMyZjJmJyxcbiAgICAgICc4MDAnOiAnYzYyODI4JyxcbiAgICAgICc5MDAnOiAnYjcxYzFjJyxcbiAgICAgICdBMTAwJzogJ2ZmOGE4MCcsXG4gICAgICAnQTIwMCc6ICdmZjUyNTInLFxuICAgICAgJ0E0MDAnOiAnZmYxNzQ0JyxcbiAgICAgICdBNzAwJzogJ2Q1MDAwMCcsXG4gICAgICAnY29udHJhc3REZWZhdWx0Q29sb3InOiAnbGlnaHQnLCAvLyB3aGV0aGVyLCBieSBkZWZhdWx0LCB0ZXh0IChjb250cmFzdClcbiAgICAgIC8vIG9uIHRoaXMgcGFsZXR0ZSBzaG91bGQgYmUgZGFyayBvciBsaWdodFxuICAgICAgJ2NvbnRyYXN0RGFya0NvbG9ycyc6IFsnNTAnLCAnMTAwJywgLy8gaHVlcyB3aGljaCBjb250cmFzdCBzaG91bGQgYmUgJ2RhcmsnIGJ5IGRlZmF1bHRcbiAgICAgICAgJzIwMCcsICczMDAnLCAnNDAwJywgJ0ExMDAnXSxcbiAgICAgICdjb250cmFzdExpZ2h0Q29sb3JzJzogdW5kZWZpbmVkIC8vIGNvdWxkIGFsc28gc3BlY2lmeSB0aGlzIGlmIGRlZmF1bHQgd2FzICdkYXJrJ1xuICAgIH0pXG4gICAgJG1kVGhlbWluZ1Byb3ZpZGVyLnRoZW1lKCdkZWZhdWx0JylcbiAgICAgIC5wcmltYXJ5UGFsZXR0ZSgnc2xhY2snKVxuICB9KVxuXG4gIC8vIEZhY2Vib29rIENvbmZpZ1xuICAuY29uZmlnKFxuICAgIGZ1bmN0aW9uIChGYWNlYm9va1Byb3ZpZGVyKSB7XG4gICAgICB2YXIgbXlBcHBJZCA9ICc5MzEzNzYxMjAyNjM4NTYnXG4gICAgICBGYWNlYm9va1Byb3ZpZGVyLnNldEFwcElkKG15QXBwSWQpXG4gICAgICBGYWNlYm9va1Byb3ZpZGVyLmluaXQobXlBcHBJZClcbiAgICB9XG4gIClcblxuICAvL1NlY3VyaXR5IGZvciBUcmFuc2xhdGVcbiAgLmNvbmZpZyhmdW5jdGlvbiAoJHRyYW5zbGF0ZVByb3ZpZGVyKSB7XG4gICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnByZWZlcnJlZExhbmd1YWdlKCdFbmcnKTtcbiAgICAvLyBFbmFibGUgZXNjYXBpbmcgb2YgSFRNTFxuICAgICR0cmFuc2xhdGVQcm92aWRlci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3koJ2VzY2FwZScpO1xuICB9KVxuXG5cblxuICAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ3RybCBhcyAgaG9tZUN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdob21lL2hvbWUuaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIHJlcXVpcmVOb0F1dGg6IGZ1bmN0aW9uICgkc3RhdGUsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkJylcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGZlZWQ6IGZ1bmN0aW9uIChUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmxhdGVzdEZlZWQoKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnbG9naW4tZm9ybUBob21lJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvbG9naW4tZm9ybS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgIH0pXG5cblxuICAgICAgLy9UcmVuZGluZ1xuICAgICAgLnN0YXRlKCd0cmVuZGluZycsIHtcbiAgICAgICAgdXJsOiAnL2V4cGxvcmUvdHJlbmRpbmcnLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnSG9tZUN0cmwgYXMgIGhvbWVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnaG9tZS90cmVuZC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgZmVlZDogZnVuY3Rpb24gKFRvcGljcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MubGF0ZXN0RmVlZCgpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9KVxuXG5cbiAgICAgIC8vIENhdGVnb3J5IExhbmRpbmdcbiAgICAgIC5zdGF0ZSgnY2F0ZWdvcnknLCB7XG4gICAgICAgIHVybDogJy9jYXRlZ29yeS97U2x1Z30nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ2F0ZUN0cmwgYXMgY2F0ZUN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdjYXRlZ29yeS9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgLy8gR2V0dGluZyBDYXRlZ29yeSBkZXRhaWxzXG4gICAgICAgICAgICAgIGNhdGVOYW1lOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBDYXRlZ29yeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBDYXRlZ29yeS5nZXROYW1lKCRzdGF0ZVBhcmFtcy5TbHVnKS4kbG9hZGVkKClcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgLy8gR2V0dGluZyBsaXN0IG9mIGNhdGVnb3J5IHRvcGljcyBoZXJlXG4gICAgICAgICAgICAgIGNhdGVUb3BpY3M6IGZ1bmN0aW9uICgkc3RhdGVQYXJhbXMsIFRvcGljcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MubGlzdCgkc3RhdGVQYXJhbXMuU2x1ZylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgIH0pXG5cblxuICAgICAgLy8gUGxhY2VzIGxhbmRpbmcgcGFnZVxuICAgICAgLnN0YXRlKCdwbGFjZXMnLCB7XG4gICAgICAgIHVybDogJy9wbGFjZXMve3BsYWNlX3NsdWd9L3twbGFjZV9pZH0nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICdoZWFkZXJAcGxhY2VzJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1BsYWNlc0N0cmwgYXMgcGxhY2VzQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BsYWNlL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICBwbGFjZUxhbmRpbmc6IGZ1bmN0aW9uIChQbGFjZXMsIFRvcGljcywgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VBcnJheSkge1xuICAgICAgICAgICAgICAgIHZhciBkYXRhXG4gICAgICAgICAgICAgICAgUGxhY2VzLmdldFBsYWNlUmVmKCRzdGF0ZVBhcmFtcy5wbGFjZV9pZCkub24oJ3ZhbHVlJywgZnVuY3Rpb24gKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICBkYXRhID0gc25hcHNob3QudmFsKClcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNuYXBzaG90LnZhbCgpKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgICAgICAgICAgLy8gcmV0dXJuICAkZmlyZWJhc2VBcnJheShQbGFjZXMuZ2V0UGxhY2VSZWYoJHN0YXRlUGFyYW1zLnBsYWNlX2lkKSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuXG4gICAgICAvLyBUYWcgbGFuZGluZyBwYWdlXG4gICAgICAuc3RhdGUoJ3RhZycsIHtcbiAgICAgICAgdXJsOiAnL3RhZy97VGFnfScsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ2hlYWRlckB0YWcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnVGFnQ3RybCBhcyB0YWdDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGFnL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICB0YWdOYW1lOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzdGF0ZVBhcmFtcy5UYWdcbiAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICB0YWdMYW5kaW5nOiBmdW5jdGlvbiAoVG9waWNzLCAkc3RhdGVQYXJhbXMsIFRhZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFnID0gJHN0YXRlUGFyYW1zLlRhZ1xuICAgICAgICAgICAgICAgIC8vIHZhciBmYiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybClcbiAgICAgICAgICAgICAgICAvLyB2YXIgZGF0YVJldCA9ICcnXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHNob3coVGFncy50b3BpY1RhZ3ModGFnKSlcbiAgICAgICAgICAgICAgICAvKnJldHVybiBmYi5jaGlsZCgndGFncy8nICsgdGFnKVxuICAgICAgICAgICAgICAgICAgICAub24oJ3ZhbHVlJywgZnVuY3Rpb24gKHRhZ1NuYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmIuY2hpbGQoJ3RvcGljcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAub3JkZXJCeUNoaWxkKFwidGFnc1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmVxdWFsVG8odGFnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCd2YWx1ZScsIGZ1bmN0aW9uICh0b3BpY1NuYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNob3coIGV4dGVuZCh7fSwgdGFnU25hcC52YWwoKSwgdG9waWNTbmFwLnZhbCgpKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8hKmRhdGFSZXQgPSBleHRlbmQoe30sIHRhZ1NuYXAudmFsKCksIHRvcGljU25hcC52YWwoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJGZpcmViYXNlQXJyYXkoZGF0YVJldCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhUmV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAqIS9cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pKi9cbiAgICAgICAgICAgICAgICAvLyB2YXIgdGFnT2JqID0gVGFncy5nZXRUYWdPYmplY3QodGFnKVxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0YWdPYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vICAgcmV0dXJuIFRvcGljcy50b3BpY3NCeVRhZyh0YWcpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24gKHNuYXApIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coZXh0ZW5kKHt9LCB0YWdPYmouJHZhbHVlLCBzbmFwLnZhbCgpKSlcbiAgICAgICAgICAgICAgICAvLyAgICAgcmV0dXJuIGV4dGVuZCh7fSwgdGFnT2JqLiR2YWx1ZSwgc25hcC52YWwoKSlcbiAgICAgICAgICAgICAgICAvLyAgIH0pXG4gICAgICAgICAgICAgICAgLy8gfSlcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgZmIub25jZSgndmFsdWUnLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGRhdGEgPSBzbmFwc2hvdC52YWwoKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGRhdGFTbmFwKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdmFyIGluZGV4ID0gd29yZC5pbmRleE9mKCcgJylcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgZmlyc3QgPSBkYXRhU25hcC5OYW1lLnN1YnN0cmluZygwLCBpbmRleClcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgbGFzdCA9IHdvcmQuc3Vic3RyaW5nKGluZGV4ICsgMSlcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgY2FuZGlkYXRlID0gZGF0YVNuYXAuTmFtZVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIGlmIChjYW5kaWRhdGUuaW5kZXhPZihmaXJzdCkgPj0gMCAmJiBjYW5kaWRhdGUuaW5kZXhPZihsYXN0KSA+PSAwKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhU25hcC5DSUQpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgcmVqZWN0KCdTb21lIHNvcnQgb2YgZmFpbHVyZScpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgICAgIC8vIH0pXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLnRvcGljc0J5VGFnKHRhZylcbiAgICAgICAgICAgICAgLy8gLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcCl7XG4gICAgICAgICAgICAgIC8vIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cblxuICAgICAgLy8gVG9waWMgbGFuZGluZyBwYWdlXG4gICAgICAuc3RhdGUoJ3RvcGljJywge1xuICAgICAgICB1cmw6ICcve1NsdWd9JyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIC8qU2x1ZzogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywkc3RhdGUsQXV0aCkge1xuICAgICAgICAgICAgJHN0YXRlUGFyYW1zLlNsdWcgPSBkZWNvZGVVUklDb21wb25lbnQoJHN0YXRlUGFyYW1zLlNsdWcpXG4gICAgICAgICAgICBpZigkc3RhdGVQYXJhbXMuU2x1ZyA9PSAnJyl7XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSovXG4gICAgICAgIH0sXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdUb3BpY0xhbmRpbmdDdHJsIGFzIHRvcGljTGFuZGluZ0N0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0b3BpY3MvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uIChBdXRoLCBVc2VycywgJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9waWNVaWQgPSAnJ1xuICAgICAgICAgICAgICAgIC8vIElmIHVzZXIgbG9naW4sIGNoZWNrIGlmIHRoZXkgYXJlIHRoZSB0b3BpYyBvd25lclxuICAgICAgICAgICAgICAgIGlmIChBdXRoLnJlZi5nZXRBdXRoKCkpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZm9ydG9waWMoJHN0YXRlUGFyYW1zLlNsdWcpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhWzBdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICB0b3BpY1VpZCA9IGRhdGFbMF0udWlkXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKEF1dGgucmVmLmdldEF1dGgoKS51aWQgPT0gdG9waWNVaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0b3BpY0xhbmRpbmc6IGZ1bmN0aW9uICgkc3RhdGVQYXJhbXMsIFRvcGljcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZm9ydG9waWMoJHN0YXRlUGFyYW1zLlNsdWcpLiRsb2FkZWQoKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVwbHlMaXN0OiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MsICRzdGF0ZSkge1xuICAgICAgICAgICAgICAgIHZhciB0b3BpY0tleSA9ICcnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5mb3J0b3BpYygkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkYXRhWzBdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9waWNLZXkgPSBkYXRhWzBdLiRpZFxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCd0b3BpYy1ub3Rmb3VuZCcpXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLnJlcGx5TGlzdCh0b3BpY0tleSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB2aWV3RGF0YTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgVG9waWNzLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHZhciB0b3BpY0tleSwgdmlld3NcbiAgICAgICAgICAgICAgICB2YXIgdGltZSA9IG1vbWVudCgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICB2YXIgaGlzdG9yeU9iaiA9IHsndXNlcklQJzogJycsICdjcmVhdGVkJzogdGltZX1cbiAgICAgICAgICAgICAgICBVc2Vycy5nZXRMb2NhdGlvbklQKCkuc3VjY2VzcyhmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgaGlzdG9yeU9iai51c2VySVAgPSBkYXRhLmRhdGFcbiAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICBoaXN0b3J5T2JqLnVzZXJJUCA9IGRhdGEuZGF0YVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5nZXRUb3BpY0J5U2x1Zygkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkYXRhWzBdLiRpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9waWNLZXkgPSBkYXRhWzBdLiRpZFxuICAgICAgICAgICAgICAgICAgICB2aWV3cyA9IFRvcGljcy5nZXRWaWV3cyh0b3BpY0tleSlcblxuICAgICAgICAgICAgICAgICAgICB2aWV3cy5vYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb3VudCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3cy5yZWYuY2hpbGQoJ2NvdW50Jykuc2V0KDEpXG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdzLnJlZi5jaGlsZCgnY291bnQnKS5zZXQoZGF0YS5jb3VudCArIDEpXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkudGhlbihmdW5jdGlvbiAoYXV0aCkge1xuICAgICAgICAgICAgICAgICAgICAgIHZhciB1aWQgPSBhdXRoLnVpZFxuICAgICAgICAgICAgICAgICAgICAgIHZpZXdzLnJlZi5jaGlsZCgnaGlzdG9yeScpLmNoaWxkKHVpZCkucHVzaCgpLnNldChoaXN0b3J5T2JqKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCd2aWV3cycpLmNoaWxkKHRvcGljS2V5KS5wdXNoKCkuc2V0KGhpc3RvcnlPYmopXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdmlld3Mub2JqXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZm9sbG93ZXJzOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmdldFRvcGljQnlTbHVnKCRzdGF0ZVBhcmFtcy5TbHVnKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgdmFyIHRvcGljS2V5ID0gZGF0YVswXS4kaWRcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZ2V0Rm9sbG93ZXJzKHRvcGljS2V5KS5vYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gVG9waWMgbm90IGZvdW5kXG4gICAgICAuc3RhdGUoJ3RvcGljLW5vdGZvdW5kJywge1xuICAgICAgICB1cmw6ICcvZXJyL25vdGZvdW5kJ1xuICAgICAgfSlcblxuICAgICAgLy8gUHJvZmlsZSBsYW5kaW5nIHBhZ2VcbiAgICAgIC5zdGF0ZSgncHJvZmlsZScsIHtcbiAgICAgICAgdXJsOiAnL3Byb2ZpbGUve05hbWV9JyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZmlsZS9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgaXNPd25lcjogZnVuY3Rpb24gKEF1dGgsIFVzZXJzLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXV0aC5yZWYuZ2V0QXV0aCgpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZUJ5VXNlcm5hbWUoJHN0YXRlUGFyYW1zLk5hbWUpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9maWxlWzBdLiRpZCA9PSBBdXRoLnJlZi5nZXRBdXRoKCkudWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB1c2VyUG9zdHM6IGZ1bmN0aW9uIChVc2VycywgVG9waWNzLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZUJ5VXNlcm5hbWUoJHN0YXRlUGFyYW1zLk5hbWUpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICBpZiAocHJvZmlsZVswXS4kaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuY3JlYXRlZEJ5KHByb2ZpbGVbMF0uJGlkKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHByb2ZpbGU6IGZ1bmN0aW9uICgkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHJvb3RTY29wZSwgQXV0aCwgVXNlcnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZUJ5VXNlcm5hbWUoJHN0YXRlUGFyYW1zLk5hbWUpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcHJvZmlsZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICdoZWFkZXJAcHJvZmlsZSc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90b29sYmFyL21haW5fdG9vbGJhci5odG1sJ1xuICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBQcm9maWxlIGxhbmRpbmcgcGFnZVxuICAgICAgLy8gQHByb2ZpbGVDdHJsXG4gICAgICAuc3RhdGUoJ2FjY2NvdW50RWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL2FjY291bnQvZWRpdCcsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ3Bhc3N3b3JkRWRpdEBhY2Njb3VudEVkaXQnOiB7XG4gICAgICAgICAgICB1cmw6ICcvYWNjb3VudC9jaGFuZ2VQYXNzd29yZCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGUvcGFzc3dkLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAndXNlckVkaXRAYWNjY291bnRFZGl0Jzoge1xuICAgICAgICAgICAgdXJsOiAnL2FjY291bnQvZWRpdC1mb3JtJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZmlsZS9lZGl0LWZvcm0uaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnUHJvZmlsZUN0cmwgYXMgcHJvZmlsZUN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlL2VkaXQuaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIHVzZXJQb3N0czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBpc093bmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcHJvZmlsZTogZnVuY3Rpb24gKCRzdGF0ZSwgJHJvb3RTY29wZSwgQXV0aCwgVXNlcnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlKGF1dGgudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAocHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvZmlsZS5kaXNwbGF5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9maWxlXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdnZXRfc3RhcnRlZCcpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGF1dGg6IGZ1bmN0aW9uICgkc3RhdGUsIFVzZXJzLCBBdXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGguYXV0aC4kcmVxdWlyZUF1dGgoKS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ2FjY291bnRQYXNzd29yZCcsIHtcbiAgICAgICAgdXJsOiAnL2FjY291bnQvY2hhbmdlUGFzc3dvcmQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGUvcGFzc3dkLmh0bWwnXG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ2FjY291bnRVc2VyRWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL2FjY291bnQvZWRpdC1mb3JtJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlL2VkaXQtZm9ybS5odG1sJ1xuICAgICAgfSlcblxuICAgICAgLy8gRGFzaGJvYXJkXG4gICAgICAvLyBAcHJvZmlsZUN0cmxcbiAgICAgIC5zdGF0ZSgnZGFzaGJvYXJkJywge1xuICAgICAgICB1cmw6ICcvdXNlci9kYXNoYm9hcmQnLFxuICAgICAgICBjb250cm9sbGVyOiAnRGFzaGJvYXJkQ3RybCBhcyBkYXNoYm9hcmRDdHJsJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnZGFzaGJvYXJkL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICB1c2VyUG9zdHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaXNPd25lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHByb2ZpbGU6IGZ1bmN0aW9uICgkc3RhdGUsICRyb290U2NvcGUsIEF1dGgsIFVzZXJzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGguYXV0aC4kcmVxdWlyZUF1dGgoKS50aGVuKGZ1bmN0aW9uIChhdXRoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZShhdXRoLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHByb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgbm8gc3RhdCBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwcm9maWxlLnN0YXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBVc2Vycy51c2VyUmVmKGF1dGgudWlkKS5jaGlsZCgnc3RhdC91cHZvdGVkL2NvdW50Jykuc2V0KDApXG4gICAgICAgICAgICAgICAgICAgICAgVXNlcnMudXNlclJlZihhdXRoLnVpZCkuY2hpbGQoJ3N0YXQvcG9zdGVkL2NvdW50Jykuc2V0KDApXG4gICAgICAgICAgICAgICAgICAgICAgVXNlcnMudXNlclJlZihhdXRoLnVpZCkuY2hpbGQoJ3N0YXQvY29tbWVudC9jb3VudCcpLnNldCgwKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2VyL2NvdW50Jykuc2V0KDApXG4gICAgICAgICAgICAgICAgICAgICAgVXNlcnMudXNlclJlZihhdXRoLnVpZCkuY2hpbGQoJ3N0YXQvZm9sbG93aW5nL2NvdW50Jykuc2V0KDApXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBubyBkaXNwbGF5bmFtZSAtIGdvIHRvIGdldF9zdGFydGVkXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9maWxlLmRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb2ZpbGVcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2dldF9zdGFydGVkJylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpXG4gICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBhdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG5cbiAgICAgIC8vIG5lc3RlZCBsaXN0IHdpdGggY3VzdG9tIGNvbnRyb2xsZXJcbiAgICAgIC5zdGF0ZSgnZGFzaGJvYXJkLmxpc3QnLCB7XG4gICAgICAgIHVybDogJy9mZWVkL3tTbHVnfScsXG4gICAgICAgIC8vdGVtcGxhdGVVcmw6ICcvZmVlZHMvZmVlZC5odG1sJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NhdGVDdHJsIGFzIGNhdGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnY2F0ZWdvcnkvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIC8vIEdldHRpbmcgQ2F0ZWdvcnkgZGV0YWlsc1xuICAgICAgICAgICAgICBjYXRlTmFtZTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgQ2F0ZWdvcnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQ2F0ZWdvcnkuZ2V0TmFtZSgkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIC8vIEdldHRpbmcgbGlzdCBvZiBjYXRlZ29yeSB0b3BpY3MgaGVyZVxuICAgICAgICAgICAgICBjYXRlVG9waWNzOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmxpc3QoJHN0YXRlUGFyYW1zLlNsdWcpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBGb2xsbG93IENhdGVnb3J5XG4gICAgICAvLyBAcHJvZmlsZUN0cmxcbiAgICAgIC5zdGF0ZSgnZm9sbG93X2NhdGVzJywge1xuICAgICAgICB1cmw6ICcvdXNlci9mb2xsb3ctY2F0ZWdvcmllcycsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ3RybCBhcyBwcm9maWxlQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2F1dGgvZm9sbG93LWNhdGVnb3JpZXMuaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIHVzZXJQb3N0czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBpc093bmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcHJvZmlsZTogZnVuY3Rpb24gKFVzZXJzLCBBdXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGguYXV0aC4kcmVxdWlyZUF1dGgoKS50aGVuKGZ1bmN0aW9uIChhdXRoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZShhdXRoLnVpZCkuJGxvYWRlZCgpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgYXV0aDogZnVuY3Rpb24gKCRzdGF0ZSwgVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gR2V0dGluZyBzdGFydGVkXG4gICAgICAvLyBAcHJvZmlsZUN0cmxcbiAgICAgIC5zdGF0ZSgnZ2V0X3N0YXJ0ZWQnLCB7XG4gICAgICAgIHVybDogJy91c2VyL2dldF9zdGFydGVkJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXV0aC9nZXRfc3RhcnRlZC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgdXNlclBvc3RzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9maWxlOiBmdW5jdGlvbiAoVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlKGF1dGgudWlkKS4kbG9hZGVkKClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBhdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnaGVhZGVyQGdldF9zdGFydGVkJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvdXNlci9sb2dpbicsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXV0aC9sb2dpbi5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2xvZ2luLWZvcm1AbG9naW4nOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC9sb2dpbi1mb3JtLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgICB1cmw6ICcvdXNlci9yZWdpc3RlcicsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2F1dGgvcmVnaXN0ZXIuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICByZXF1aXJlTm9BdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBBdXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICByZXR1cm4gZXJyb3JcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpXG4gIH0pXG5cbiAgLmZpbHRlcignb3JkZXJPYmplY3RCeScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGl0ZW1zLCBmaWVsZCwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGZpbHRlcmVkID0gW11cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChpdGVtcywgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgZmlsdGVyZWQucHVzaChpdGVtLiRpZCkuc2V0KGl0ZW0pXG4gICAgICB9KVxuICAgICAgZmlsdGVyZWQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gKGFbZmllbGRdID4gYltmaWVsZF0gPyAxIDogLTEpXG4gICAgICB9KVxuICAgICAgaWYgKHJldmVyc2UpIGZpbHRlcmVkLnJldmVyc2UoKVxuICAgICAgcmV0dXJuIGZpbHRlcmVkXG4gICAgfVxuICB9KVxuXG4gIC5maWx0ZXIoJ2RlY29kZVVSSScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0ID8gZGVjb2RlVVJJKHRleHQpIDogJydcbiAgICB9XG4gIH0pXG5cbiAgLy8gRm9ybWF0dGluZyB0ZXh0cyB0byBpbmNsdWRlIG5ldyBsaW5lXG4gIC5maWx0ZXIoJ25sMmJyJywgZnVuY3Rpb24gKCRzY2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0ID8gJHNjZS50cnVzdEFzSHRtbCh0ZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKSkgOiAnJ1xuICAgIH1cbiAgfSlcblxuICAuY29uc3RhbnQoJ0ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vYm14eXouZmlyZWJhc2Vpby5jb20vJylcblxuZnVuY3Rpb24gc2hvdyAoZGF0YSkge1xuICBjb25zb2xlLmxvZyhkYXRhKVxuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMilcbn1cblxuLy8gZm9yIGpvaW5pbmcgLSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9rYXRvd3VsZi82NTk4MjM4XG5mdW5jdGlvbiBleHRlbmQgKGJhc2UpIHtcbiAgdmFyIHBhcnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgaWYgKHAgJiYgdHlwZW9mIChwKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGsgaW4gcCkge1xuICAgICAgICBpZiAocC5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgIGJhc2Vba10gPSBwW2tdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBiYXNlXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuICAuY29udHJvbGxlcignQXV0aEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsQXV0aCwgVXNlcnMsICRzdGF0ZSwkcm9vdFNjb3BlLCRtZFNpZGVuYXYsJHRyYW5zbGF0ZSwgJGNvb2tpZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90aVNlcnZpY2UsJG5vdGlmaWNhdGlvbil7XHJcbiAgICB2YXIgYXV0aEN0cmwgPSB0aGlzO1xyXG5cclxuICAgIC8vQXNrIGZvciBub3RpZmljYXRpb24gcGVybWlzc2lvblxyXG4gICAgJG5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbigpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChwZXJtaXNzaW9uKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2cocGVybWlzc2lvbik7IC8vIGRlZmF1bHQsIGdyYW50ZWQsIGRlbmllZFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAvL1BhcnNlclxyXG4gICAgYXV0aEN0cmwuYXV0aCAgICAgPSBBdXRoO1xyXG4gICAgYXV0aEN0cmwudXNlcnMgICAgPSBVc2VycztcclxuICAgIGF1dGhDdHJsLm5vdGlmaWNhdGlvbiA9IE5vdGlTZXJ2aWNlO1xyXG5cclxuXHJcbiAgICBpZihBdXRoLnJlZi5nZXRBdXRoKCkgIT0gbnVsbCApe1xyXG4gICAgICBhdXRoQ3RybC5wcm9maWxlICA9IGF1dGhDdHJsLnVzZXJzLmdldFByb2ZpbGUoQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCk7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICBhdXRoQ3RybC5wcm9maWxlID0nJ1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBhdXRoQ3RybC51c2VyID0ge1xyXG4gICAgICBlbWFpbDogJycsXHJcbiAgICAgIHBhc3N3b3JkOiAnJ1xyXG4gICAgfTtcclxuXHJcblxyXG5cclxuICAgIC8vR2V0IHRoZSBiYWRnZSBub3RpZmljYXRpb25cclxuICAgIC8qYXV0aEN0cmwuYmFkZ2VOb3RpZmljYXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICByZXR1cm4gYXV0aEN0cmwubm90aWZpY2F0aW9uLmFkZEFyckNoaWxkKGF1dGhDdHJsLnByb2ZpbGUuJGlkICsgJy91bnJlYWQnKS4kbG9hZGVkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXV0aEN0cmwuYmFkZ2VWYWx1ZSA9IGF1dGhDdHJsLmJhZGdlTm90aWZpY2F0aW9uO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKGF1dGhDdHJsLmJhZGdlTm90aWZpY2F0aW9uKTsqL1xyXG5cclxuICAgICRzY29wZS5iYWRnZU5vdGlmY2F0aW9uID0gYXV0aEN0cmwuYmFkZ2VOb3RpZmljYXRpb247XHJcblxyXG4gICAgLy9SZXNldCBjb3VudGVyXHJcbiAgICBhdXRoQ3RybC5yZXNldENvdW50ZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgICBhdXRoQ3RybC5ub3RpZmljYXRpb24ucmVzZXRVbnJlYWQoYXV0aEN0cmwucHJvZmlsZS4kaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGF1dGhDdHJsLmNoYW5nZVZhbCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdiYWRnZSB2YWx1ZSAnK2F1dGhDdHJsLmJhZGdlTm90aWZpY2F0aW9uLiR2YWx1ZSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS4kd2F0Y2goXCJuYW1lXCIsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICBpZiAoJHNjb3BlLm5hbWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICRzY29wZS5ncmVldGluZyA9IFwiR3JlZXRpbmdzIFwiICsgJHNjb3BlLm5hbWU7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICAvL0NoYW5nZSBsYW5ndWFnZVxyXG4gICAgYXV0aEN0cmwudG9nZ2xlTGFuZyA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XHJcbiAgICAgICR0cmFuc2xhdGUudXNlKGxhbmdLZXkpO1xyXG4gICAgICAvLyBTZXR0aW5nIGEgY29va2llXHJcbiAgICAgICRjb29raWVzLnB1dCgndXNlckxhbmcnLCBsYW5nS2V5KTtcclxuICAgICAgLy9JZiB1c2VyIHJlZ2lzdGVyZWQgLSB1cGRhdGUgdGhpcyBpbiB0aGVpciBwcmVmZXJlbmNlXHJcbiAgICAgIGlmKEF1dGgucmVmLmdldEF1dGgoKSl7XHJcbiAgICAgICAgYXV0aEN0cmwudXNlcnMudXNlckFyclJlZihBdXRoLnJlZi5nZXRBdXRoKCkudWlkKS51cGRhdGUoe1wibGFuZ1wiOmxhbmdLZXl9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9DaGVja2sgdXNlciBzZWxlY3RlZCBsYW5ndWFnZVxyXG4gICAgaWYoIWF1dGhDdHJsLnByb2ZpbGUubGFuZyl7XHJcbiAgICAgIGlmKCRjb29raWVzLmdldCgndXNlckxhbmcnKSl7XHJcbiAgICAgICAgYXV0aEN0cmwudG9nZ2xlTGFuZygkY29va2llcy5nZXQoJ3VzZXJMYW5nJykpO1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICBhdXRoQ3RybC50b2dnbGVMYW5nKCdFbmcnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgYXV0aEN0cmwudG9nZ2xlTGFuZyhhdXRoQ3RybC5wcm9maWxlLmxhbmcpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvL0xvZ2luXHJcbiAgICBhdXRoQ3RybC5sb2dpbiA9IGZ1bmN0aW9uICgpe1xyXG4gICAgICBhdXRoQ3RybC5hdXRoLmF1dGguJGF1dGhXaXRoUGFzc3dvcmQoYXV0aEN0cmwudXNlcikudGhlbihmdW5jdGlvbiAoYXV0aCl7XHJcbiAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQnKTtcclxuICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKXtcclxuICAgICAgICBhdXRoQ3RybC5lcnJvciA9IGVycm9yO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLy9Mb2dvdXRcclxuICAgIGF1dGhDdHJsLmxvZ291dCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIEF1dGguYXV0aC4kdW5hdXRoKCk7XHJcbiAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcclxuICAgIH1cclxuXHJcbiAgICAvL1JlZ2lzdGVyIHVzZXJcclxuICAgIGF1dGhDdHJsLnJlZ2lzdGVyID0gZnVuY3Rpb24gKCl7XHJcbiAgICAgIEF1dGguYXV0aC4kY3JlYXRlVXNlcihhdXRoQ3RybC51c2VyKS50aGVuKGZ1bmN0aW9uICh1c2VyKXtcclxuICAgICAgICBhdXRoQ3RybC5sb2dpbigpO1xyXG4gICAgICB9LCBmdW5jdGlvbiAoZXJyb3Ipe1xyXG4gICAgICAgIGF1dGhDdHJsLmVycm9yID0gZXJyb3I7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgYXV0aEN0cmwudG9nZ2xlUmlnaHQgPSBidWlsZFRvZ2dsZXIoJ3JpZ2h0Jyk7XHJcbiAgICBmdW5jdGlvbiBidWlsZFRvZ2dsZXIobmF2SUQpIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRtZFNpZGVuYXYobmF2SUQpXHJcbiAgICAgICAgICAudG9nZ2xlKClcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9KTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5mYWN0b3J5KCdBdXRoJywgZnVuY3Rpb24oJGZpcmViYXNlQXV0aCwgRmlyZWJhc2VVcmwpe1xuICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwpO1xuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aChyZWYpO1xuXG4gICAgdmFyIEF1dGggPSB7XG4gICAgICByZWY6cmVmLFxuICAgICAgYXV0aDogYXV0aCxcblxuICAgICAgZ2V0VWlkOmZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1aWQgPSByZWYuZ2V0QXV0aCgpO1xuICAgICAgICBpZih1aWQgIT0gbnVsbCApe1xuICAgICAgICAgIHJldHVybiByZWYuZ2V0QXV0aCgpLnVpZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9XG5cbiAgICByZXR1cm4gQXV0aDtcbiAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuICAuY29udHJvbGxlcignQ2F0ZUN0cmwnLCBmdW5jdGlvbigkc3RhdGUsIENhdGVnb3J5LGNhdGVOYW1lLGNhdGVUb3BpY3Mpe1xyXG4gICAgdmFyIGNhdGVDdHJsID0gdGhpcztcclxuXHJcbiAgICAvL1BhcnNlcnNcclxuICAgIGNhdGVDdHJsLmNhdGVOYW1lICAgPSBjYXRlTmFtZTtcclxuICAgIGNhdGVDdHJsLmNhdGVnb3J5ICAgPSBDYXRlZ29yeTtcclxuICAgIGNhdGVDdHJsLmNhdGVUb3BpY3MgPSBjYXRlVG9waWNzO1xyXG5cclxuICB9KTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG5cbiAgLy9Ub3BpYyBsaXN0XG4gIC5mYWN0b3J5KCdDYXRlU2VydmljZScsIGZ1bmN0aW9uKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXkgLCBGaXJlYmFzZVVybCl7XG4gICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnY2F0ZWdvcmllcycpO1xuICAgIHZhciBjYXRlZ29yaWVzID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgQ2F0ZSA9IHtcblxuICAgICAgbmFtZTogZnVuY3Rpb24odG9waWNfc2x1Zyl7XG4gICAgICAgIHZhciBkYXRhID0gcmVmLm9yZGVyQnlDaGlsZChcInNsdWdcIikuZXF1YWxUbyh0b3BpY19zbHVnKTtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChkYXRhKTtcbiAgICAgIH0sXG5cbiAgICAgIGZvcnRvcGljOiBmdW5jdGlvbih0b3BpY19zbHVnKXtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdCh1c2Vyc1JlZi5jaGlsZCh1aWQpKTtcbiAgICAgIH0sXG5cbiAgICAgIGFkZENoaWxkOiBmdW5jdGlvbihjaGlsZG5hbWUpe1xuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKGNoaWxkbmFtZSlcbiAgICAgIH0sXG5cbiAgICAgIGZvbGxvd0xpc3Q6ZnVuY3Rpb24odWlkKXtcbiAgICAgICAgdmFyIGRhdGEgPSByZWYub3JkZXJCeUNoaWxkKFwibmV3cy9mb2xsb3dlclwiKS5lcXVhbFRvKHVpZCk7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShkYXRhKTtcbiAgICAgIH0sXG5cbiAgICAgIHVuRm9sbG93OmZ1bmN0aW9uKHNsdWcsdWlkKXtcbiAgICAgICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnY2F0ZWdvcmllcy8nK3NsdWcrJy9mb2xsb3dlci8nK3VpZCk7XG4gICAgICAgIHJlZi5yZW1vdmUoKTtcbiAgICAgIH0sXG5cbiAgICAgIHVzZXJGb2xsb3c6ZnVuY3Rpb24oc2x1Zyx1aWQpe1xuICAgICAgICB2YXIgZm9sbG93PWZhbHNlO1xuICAgICAgICB2YXIgcmVmICAgID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydjYXRlZ29yaWVzLycrc2x1ZysnL2ZvbGxvd2VyLycrdWlkKTtcbiAgICAgICAgcmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgIGZvbGxvdyA9IHNuYXBzaG90LmV4aXN0cygpO1xuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gZm9sbG93O1xuICAgICAgfSxcbiAgICAgIGFycjogJGZpcmViYXNlQXJyYXkocmVmKSxcbiAgICAgIGFsbDpjYXRlZ29yaWVzXG4gICAgfVxuICAgIHJldHVybiBDYXRlO1xuICB9KVxuXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcblxuICAvL1RvcGljIGxpc3RcbiAgLmZhY3RvcnkoJ1Bvc3QnLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QsIEZpcmViYXNlVXJsKXtcbiAgICB2YXIgcmVmICAgID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKyd0b3BpY3MnKTtcbiAgICB2YXIgdG9waWNzID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgVFMgPSB7XG4gICAgICB0b3BpY05hbWU6IGZ1bmN0aW9uKHRvcGljX3NsdWcpe1xuICAgICAgICB2YXIgZGF0YSA9IHJlZi5vcmRlckJ5Q2hpbGQoXCJzbHVnXCIpLmVxdWFsVG8odG9waWNfc2x1Zyk7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QoZGF0YSk7XG4gICAgICB9LFxuICAgICAgZm9ydG9waWM6IGZ1bmN0aW9uKHRvcGljX3NsdWcpe1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHVzZXJzUmVmLmNoaWxkKHVpZCkpO1xuICAgICAgfSxcbiAgICAgIGFsbDp0b3BpY3NcbiAgICB9XG4gICAgcmV0dXJuIFRTO1xuICB9KVxuXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmNvbnRyb2xsZXIoJ0Rhc2hib2FyZEN0cmwnLCBmdW5jdGlvbihBdXRoLCAkc3RhdGUsQ2F0ZWdvcnksQ2F0ZVNlcnZpY2UsVGFncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCwgJG1kU2lkZW5hdiwgJGxvZykge1xuICAgIHZhciBkYXNoYm9hcmRDdHJsID0gdGhpcztcblxuICAgIGRhc2hib2FyZEN0cmwuYXV0aCA9IEF1dGg7XG5cbiAgICBkYXNoYm9hcmRDdHJsLmNhdGUgPSBDYXRlU2VydmljZTtcbiAgICBkYXNoYm9hcmRDdHJsLmNhdGVnb3JpZXMgICAgICA9IENhdGVnb3J5LmFsbDtcbiAgICBkYXNoYm9hcmRDdHJsLnRvcGljX2dyaWQgID0gZmFsc2U7XG4gICAgZGFzaGJvYXJkQ3RybC50YWdzICAgICAgICA9IFRhZ3MuYXJyO1xuXG4gICAgZGFzaGJvYXJkQ3RybC51c2VyQ2F0ZUZvbGxvdyAgPSBbXTtcbiAgICBkYXNoYm9hcmRDdHJsLmNhdGVJc0ZvbGxvdyAgICA9IFtdO1xuICAgIGRhc2hib2FyZEN0cmwuZm9sbG93TGlzdCAgICAgID0gJyc7XG5cblxuICAgIGRhc2hib2FyZEN0cmwudXNlckZlZWQgPSdudWxsJztcblxuICAgIC8vQ2xvc2UgU2lkZSBiYXJcbiAgICBkYXNoYm9hcmRDdHJsLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgJG1kU2lkZW5hdigncmlnaHQnKS5jbG9zZSgpO1xuICAgIH07XG5cblxuICAgIGRhc2hib2FyZEN0cmwuZm9sbG93Q2F0ZSA9IGZ1bmN0aW9uKGNhdGVfc2x1Zyl7XG4gICAgICBkYXNoYm9hcmRDdHJsLmNhdGUuYWRkQ2hpbGQoY2F0ZV9zbHVnKycvZm9sbG93ZXInKVxuICAgICAgICAuY2hpbGQoQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCkucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcbiAgICB9XG4gIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG5cbiAgLmRpcmVjdGl2ZSgnbWFpbkhlYWRlcicsZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICAgICAnRScsXG4gICAgICB0cmFuc2NsdWRlOiAgIHRydWUsXG4gICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICB9XG5cbiAgfSlcblxuICAvL0JhZGdlIG5vdGlmaWNhdGlvblxuICAuZGlyZWN0aXZlKCdiYWRnZU5vdGlmaWNhdGlvbicsZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICAgICAnRScsXG4gICAgICB0cmFuc2NsdWRlOiAgIHRydWUsXG4gICAgICBjb250cm9sbGVyOiAgICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogICd0ZW1wbGF0ZXMvaHRtbC9iYWRnZS1ub3RpZmljYXRpb24uaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICBub3RpZmljYXRpb246ICc9J1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuXG4gIC8vTGlzdCBvZiBjYXRlZ29yaWVzIG9uIHRoZSBzaWRlcmJhclxuICAuZGlyZWN0aXZlKCdyZXZpZXdTY29yZScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICAgICAnRScsXG4gICAgICB0cmFuc2NsdWRlOiAgIHRydWUsXG4gICAgICBjb250cm9sbGVyOiAgICdUb3BpY0N0cmwgYXMgdG9waWNDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAgJ3RlbXBsYXRlcy9odG1sL3Jldmlldy1zdW1tYXJ5LWxpc3QuaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICByZXZpZXc6ICc9J1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuXG4gIC8vRm9sbG93IEJ1dHRvblxuICAuZGlyZWN0aXZlKCd1c2VyRm9sbG93ZXJCdG4nLGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAgICAgJ0UnLFxuICAgICAgdHJhbnNjbHVkZTogICB0cnVlLFxuICAgICAgY29udHJvbGxlcjogICAnVG9waWNDdHJsIGFzIHRvcGljQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogICd0ZW1wbGF0ZXMvaHRtbC9mb2xsb3ctdXNlci5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIGZvbGxvdzogJz0nXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG5cbiAgLy9DYXRlZ29yeSBmb2xsb3cgYnV0dG9uXG4gIC5kaXJlY3RpdmUoJ2NhdGVGb2xsb3dCdG4nLGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRyb2xsZXI6ICdEYXNoYm9hcmRDdHJsIGFzIGRhc2hib2FyZEN0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC9jYXRlZ29yeS1mb2xsb3ctYnRuLmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgY2F0ZTogJz0nXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIC8vTGlzdCBvZiBjYXRlZ29yaWVzIG9uIHRoZSBzaWRlcmJhclxuICAuZGlyZWN0aXZlKCd0b3BpY0dyaWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRyb2xsZXI6ICdEYXNoYm9hcmRDdHJsIGFzIGRhc2hib2FyZEN0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC9jYXRlZ29yeS1ncmlkLmh0bWwnXG4gICAgfVxuICB9KVxuXG4gIC8vR3JpZCBUYWdzIGZvciBzaWRlYmFyXG4gIC5kaXJlY3RpdmUoJ3RhZ0dyaWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRyb2xsZXI6ICdEYXNoYm9hcmRDdHJsIGFzIGRhc2hib2FyZEN0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC90YWctZ3JpZC5odG1sJ1xuICAgIH1cbiAgfSlcblxuXG4gIC5kaXJlY3RpdmUoJ3RvcGljQ3JlYXRlJywgZnVuY3Rpb24oKXtcblxuICAgIHJldHVybiB7XG4gICAgICBjb250cm9sbGVyOiAnVG9waWNDdHJsIGFzIHRvcGljQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL3RvcGljLWNyZWF0ZS5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIHRvcGljOiAnPSdcbiAgICAgIH1cbiAgICB9XG5cbiAgfSlcblxuXG4gIC5kaXJlY3RpdmUoJ3RvcGljTGlzdCcsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29udHJvbGxlcjogJ1RvcGljQ3RybCBhcyB0b3BpY0N0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC90b3BpYy1saXN0Lmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgdG9waWNzOiAnPSdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cblxuICAuZGlyZWN0aXZlKCd0b3BpY0FjdGlvbnNDYXJkJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb250cm9sbGVyOiAnVG9waWNDdHJsIGFzIHRvcGljQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL3RvcGljLWFjdGlvbnMtY2FyZC5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIHRvcGljOiAnPSdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cblxuICAvL2ZvciB0YWdzIC0gbWF4IHRhZ3NcbiAgLmRpcmVjdGl2ZSgnZW5mb3JjZU1heFRhZ3MnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ0N0cmwpIHtcbiAgICAgIHZhciBtYXhUYWdzID0gYXR0cnMubWF4VGFncyA/IHBhcnNlSW50KGF0dHJzLm1heFRhZ3MsICc0JykgOiBudWxsO1xuXG4gICAgICBuZ0N0cmwuJHBhcnNlcnMucHVzaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgJiYgbWF4VGFncyAmJiB2YWx1ZS5sZW5ndGggPiBtYXhUYWdzKSB7XG4gICAgICAgICAgdmFsdWUuc3BsaWNlKHZhbHVlLmxlbmd0aCAtIDEsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5jb250cm9sbGVyKCdIb21lQ3RybCcsIGZ1bmN0aW9uKCRzdGF0ZSxDYXRlZ29yeSxUb3BpY3MsZmVlZCl7XG4gICAgdmFyIGhvbWVDdHJsID0gdGhpcztcblxuICAgIGhvbWVDdHJsLnRvcGljcyA9IENhdGVnb3J5O1xuICAgIGhvbWVDdHJsLnRvcGljcyA9IFRvcGljcztcbiAgICBob21lQ3RybC5mZWVkICAgPSBmZWVkO1xuICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuY29uZmlnKFsnJHRyYW5zbGF0ZVByb3ZpZGVyJywgZnVuY3Rpb24gKCR0cmFuc2xhdGVQcm92aWRlcikge1xuICAgICR0cmFuc2xhdGVQcm92aWRlci50cmFuc2xhdGlvbnMoJ0VuZycsIHtcbiAgICAgICdLRVlfREFTSEJPQVJEJzogICdEYXNoYm9hcmQnLFxuICAgICAgJ0tFWV9MQU5HVUFHRVMnOiAgJ0xhbmd1YWdlcycsXG4gICAgICAnS0VZX0hPTUUnOiAgICAgICAnSG9tZScsXG4gICAgICAnS0VZX1JFR0lTVEVSJzogICAnUmVnaXN0ZXInLFxuICAgICAgJ0tFWV9MT0dJTic6ICAgICAgJ0xvZyBpbicsXG4gICAgICAnS0VZX0xPR09VVCc6ICAgICAnTG9nIG91dCcsXG4gICAgICAnS0VZX0ZPTExPVyc6ICAgICAnRm9sbG93JyxcbiAgICAgICdLRVlfRk9MTE9XRVInOiAgICdGb2xsb3dlcicsXG4gICAgICAnS0VZX1VORk9MTE9XJzogICAnVW5mb2xsb3cnLFxuICAgICAgJ0tFWV9GT0xMT1dJTkcnOiAgJ0ZvbGxvd2luZycsXG4gICAgICAnS0VZX1BPU1QnOiAgICAgICAnUG9zdCcsXG4gICAgICAnS0VZX1BPU1RFRCc6ICAgICAnUG9zdGVkJyxcbiAgICAgICdLRVlfVVBWT1RFJzogICAgICdVcHZvdGUnLFxuICAgICAgJ0tFWV9VUFZPVEVEJzogICAgJ1Vwdm90ZWQnLFxuICAgICAgJ0tFWV9EV05fVk9URSc6ICAgJ0Rvd252b3RlJyxcbiAgICAgICdLRVlfRFdOX1ZPVEVEJzogICdEb3dudm90ZWQnLFxuICAgICAgJ0tFWV9WSUVXJzogICAgICAgJ1ZpZXcnLFxuICAgICAgJ0tFWV9SRU1PVkUnOiAgICAgJ1JlbW92ZScsXG4gICAgICAnS0VZX0NBTkNFTCc6ICAgICAnQ2FuY2VsJyxcbiAgICAgICdLRVlfUVVFU1RJT04nOiAgICdRdWVzdGlvbicsXG4gICAgICAnS0VZX1RPUElDJzogICAgICAnVG9waWMnLFxuICAgICAgJ0tFWV9DSEdfUFdEJzogICAgJ0NoYW5nZSBQYXNzd29yZCcsXG4gICAgICAnS0VZX1BBU1NXT1JEJzogICAnUGFzc3dvcmQnLFxuICAgICAgJ0tFWV9PTERfUFdEJzogICAgJ09sZCBQYXNzd29yZCcsXG4gICAgICAnS0VZX05FV19QV0QnOiAgICAnTmV3IFBhc3N3b3JkJyxcbiAgICAgICdLRVlfTkVXX1BXRF9DJzogICdOZXcgcGFzc3dvcmQgY29uZmlybWF0aW9uJyxcbiAgICAgICdLRVlfU0FWRSc6ICAgICAgICdTYXZlJyxcbiAgICAgICdLRVlfU0FWRV9EUkFGVCc6ICdTYXZlIGFzIGRyYWZ0JyxcbiAgICAgICdLRVlfVEFHUyc6ICAgICAgICdUYWdzJyxcbiAgICAgICdLRVlfRVhQTE9SRSc6ICAgICdFeHBsb3JlJyxcbiAgICAgICdLRVlfRkVBVF9DQVQnOiAgICAnRmVhdHVyZXMgY2F0ZWdvcmllcycsXG4gICAgICAnS0VZX0NPTU1FTlRTJzogICAnQ29tbWVudHMnLFxuICAgICAgJ0tFWV9SRVBMWSc6ICAgICAgJ1JlcGx5JyxcbiAgICAgICdLRVlfUkVWSUVXJzogICAgICdSZXZpZXcnLFxuICAgICAgJ0tFWV9FRElUJzogICAgICAgJ0VkaXQnLFxuICAgICAgJ0tFWV9UUkVORCc6ICAgICAgJ1RyZW5kJyxcbiAgICAgICdLRVlfVFJFTkRJTkcnOiAgICdUcmVuZGluZycsXG4gICAgICAnS0VZX1dSSVRFX1JFUExZJzonV3JpdGUgYSByZXBseScsXG4gICAgICAnS0VZX0xBVEVTVF9GRUVEJzonTGF0ZXN0IEZlZWQnLFxuXG4gICAgICAvL1JlbW92ZSB0b3BpY1xuICAgICAgJ0tFWV9DT05GX1JFTU9WRSc6J0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmU/JyxcbiAgICAgICdLRVlfQ09ORl9SRU1fQyc6ICdPbmNlIHJlbW92ZSwgeW91IHdpbGwgbm90IGJlIGFibGV0byB0byBnZXQgdGhpcyB0b3BpYyBiYWNrJyxcblxuXG4gICAgICAvL1NFTlRFTkNFXG4gICAgICAnS0VZX1dIQVRfT05fVVJfTUlORCc6ICAnV2hhdFxcJ3Mgb24geW91ciBtaW5kPycsXG4gICAgICAnS0VZX1lPVV9XQU5UX0ZPTExPVyc6ICAnWW91IG1heSB3YW50IHRvIGZvbGxvdycsXG4gICAgICAnS0VZX05PX0FDQ1RfUkVHSVNURVInOiAnRG9uXFwndCBoYXZlIGFjY291bnQ/IFJlZ2lzdGVyJyxcbiAgICAgICdLRVlfQ0FOVF9DSE5HX1VTRVInOiAgICdEb25cXCd0IGhhdmUgYWNjb3VudD8gUmVnaXN0ZXInLFxuICAgICAgJ0tFWV9ZT1VSX0FDQ09VTlQnOiAgICAgJ1lvdXIgYWNjb3VudCcsXG4gICAgICAnS0VZX05PVEhJTkdfSEVSRSc6ICAgICAnTm90aGluZyBoZXJlLCB5ZXQnLFxuICAgICAgJ0tFWV9XSE9fVE9fRk9MTE9XJzogICAgJ1dobyB0byBmb2xsb3cnLFxuICAgICAgJ0tFWV9DQVRfV0lMTF9BUFBFQVInOiAgJ0ZvbGxvdyBzb21lIGNhdGVnb3JpZXMgYW5kIGl0IHdpbGwgYXBwZWFyIGhlcmUnLFxuICAgICAgJ0tFWV9XSFRfVVJfU1RPUlknOiAgICAgJ1doYXRcXCdzIHlvdXIgc3RvcnknLFxuICAgICAgJ0tFWV9XUlRfQ09NTUVOVCc6ICAgICAgJ1dyaXRlIGEgY29tbWVudCcsXG5cblxuXG4gICAgICAvL1VTRVIgSU5QVVRcbiAgICAgICdLRVlfRklSU1ROQU1FJzogICdGaXJzdCBuYW1lJyxcbiAgICAgICdLRVlfTEFTVE5BTUUnOiAgICdMYXN0IG5hbWUnLFxuICAgICAgJ0tFWV9CSVJUSERBWSc6ICAgJ0JpcnRoZGF5JyxcbiAgICAgICdLRVlfTU9OVEgnOiAgICAgICdNb250aCcsXG4gICAgICAnS0VZX0RBWSc6ICAgICAgICAnRGF5JyxcbiAgICAgICdLRVlfRU1BSUwnOiAgICAgICdFbWFpbCcsXG4gICAgICAnS0VZX0NPTkZfRU1BSUwnOiAnQ29uZmlybSBFbWFpbCcsXG4gICAgICAnS0VZX0dFTkRFUic6ICAgICAnR2VuZGVyJyxcbiAgICAgICdLRVlfTUFMRSc6ICAgICAgICdNYWxlJyxcbiAgICAgICdLRVlfRkVNQUxFJzogICAgICdGZW1hbGUnLFxuICAgICAgJ0tFWV9VU0VSTkFNRSc6ICAgJ1VzZXJuYW1lJyxcbiAgICAgICdLRVlfTE9DQVRJT04nOiAgICdMb2NhdGlvbicsXG5cbiAgICAgIC8vVXNlciBFZGl0XG4gICAgICAnS0VZX0VEX1BST0ZJTEUnOiAnRWRpdCBQcm9maWxlJyxcbiAgICAgICdLRVlfRURfQ0hHX1BXRCc6ICdDaGFuZ2UgUGFzc3dvcmQnLFxuICAgICAgJ0tFWV9FRF9QUk9GSUxFJzogJ0VkaXQgUHJvZmlsZScsXG4gICAgICAnS0VZX0VEX1NJVEUnOiAgICAnV2Vic2l0ZScsXG4gICAgICAnS0VZX0VEX1BIT05FJzogICAnUGhvbmUnLFxuICAgICAgJ0tFWV9FRF9CSU8nOiAgICAgJ0Jpb2dyYXBoeScsXG5cbiAgICB9KTtcblxuICAgICR0cmFuc2xhdGVQcm92aWRlci50cmFuc2xhdGlvbnMoJ+C5hOC4l+C4oicsIHtcbiAgICAgICdLRVlfREFTSEJPQVJEJzogICfguKvguYnguK3guIfguJfguLHguYnguIfguKvguKHguJQnLFxuICAgICAgJ0tFWV9MQU5HVUFHRVMnOiAgJ+C4oOC4suC4qeC4sicsXG4gICAgICAnS0VZX0hPTUUnOiAgICAgICAn4Lir4LiZ4LmJ4Liy4LmB4Lij4LiBJyxcbiAgICAgICdLRVlfUkVHSVNURVInOiAgICfguKrguKHguLHguITguKPguYPguIrguYknLFxuICAgICAgJ0tFWV9MT0dJTic6ICAgICAgJ+C5gOC4guC5ieC4suC4quC4ueC5iOC4o+C4sOC4muC4micsXG4gICAgICAnS0VZX0ZPTExPVyc6ICAgICAn4LiV4Li04LiU4LiV4Liy4LihJyxcbiAgICAgICdLRVlfUE9TVCc6ICAgICAgICfguYLguJ7guKrguJXguYwnXG4gICAgfSk7XG5cbiAgICAkdHJhbnNsYXRlUHJvdmlkZXIucHJlZmVycmVkTGFuZ3VhZ2UoJ2VuJyk7XG4gIH1dKVxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5jb250cm9sbGVyKCdOb3RpQ3RybCcsIGZ1bmN0aW9uKCRzdGF0ZSxDYXRlZ29yeSxUb3BpY3MsTm90aVNlcnZpY2Upe1xuICAgIHZhciBub3RpQ3RybCA9IHRoaXM7XG5cblxuICAgIG5vdGlDdHJsLnRvcGljcyA9IFRvcGljcztcbiAgICBub3RpQ3RybC5mZWVkICAgPSBmZWVkO1xuICAgIG5vdGlDdHJsLm5vdGlTZXJ2aWNlID0gTm90aVNlcnZpY2U7XG5cbiAgICBub3RpQ3RybC5ub3RpZnlUbyA9ZnVuY3Rpb24odWlkKXtcbiAgICAgIHJldHVybiBub3RpQ3RybC5hcnIucHVzaCh1aWQpLiRhZGQodWlkKVxuICAgIH1cbiAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcblxuICAuZmFjdG9yeSgnTm90aVNlcnZpY2UnLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5ICwgRmlyZWJhc2VVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLCRub3RpZmljYXRpb24pe1xuICAgIHZhciByZWYgICAgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ25vdGlmaWNhdGlvbicpO1xuICAgIHZhciBub3RpID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG4gICAgdmFyIHVzZXJzID0gVXNlcnM7XG5cbiAgICB2YXIgb2JzZXJ2ZXJDYWxsYmFja3MgPSBbXTtcblxuXG4gICAgdmFyIE5vdGlmaWNhdGlvbiA9IHtcblxuICAgICAgLy9EaXNwbGF5IHVucmVhZFxuICAgICAgdW5yZWFkTm90aWZpY2F0aW9uOmZ1bmN0aW9uKHVpZCl7XG4gICAgICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ25vdGlmaWNhdGlvbi8nK3VpZCsnL3VucmVhZCcpO1xuICAgICAgICB2YXIgY291bnRlcjtcbiAgICAgICAgcmVmLm9uKFwidmFsdWVcIixmdW5jdGlvbihzbmFwc2hvdCl7XG4gICAgICAgICAgY291bnRlciA9IHNuYXBzaG90LnZhbCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgbm90aWZpY2F0aW9uX3JlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbm90aWZpY2F0aW9uLycrdWlkKTtcbiAgICAgICAgbm90aWZpY2F0aW9uX3JlZi5vbihcImNoaWxkX2FkZGVkXCIsZnVuY3Rpb24oKXtcbiAgICAgICAgICAkbm90aWZpY2F0aW9uKCdOZXcgbWVzc2FnZSBmcm9tIFFhbnlhJywge1xuICAgICAgICAgICAgYm9keTogJ0hlbGxvICcrdWlkLFxuICAgICAgICAgICAgZGlyOiAnYXV0bycsXG4gICAgICAgICAgICBsYW5nOiAnZW4nLFxuICAgICAgICAgICAgdGFnOiAnbXktdGFnJyxcbiAgICAgICAgICAgIGljb246ICdodHRwOi8vd3d3LmNsLmNhbS5hYy51ay9yZXNlYXJjaC9zcmcvbmV0b3MvaW1hZ2VzL3FzZW5zZS1sb2dvLnBuZycsXG4gICAgICAgICAgICAvL2RlbGF5OiAxMDAwLCAvLyBpbiBtc1xuICAgICAgICAgICAgZm9jdXNXaW5kb3dPbkNsaWNrOiB0cnVlIC8vIGZvY3VzIHRoZSB3aW5kb3cgb24gY2xpY2tcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGNvdW50ZXIgO1xuICAgICAgfSxcblxuICAgICAgLy9Ob3RpZnkgZm9sbG93ZXJzXG4gICAgICBub3RpZnlGb2xsb3dlcjpmdW5jdGlvbih0b3BpY0lkLHVpZCl7XG4gICAgICAgIHZhciByZWYgPSB1c2Vycy5nZXRGb2xsb3dlcih1aWQpO1xuICAgICAgICByZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgc25hcHNob3QuZm9yRWFjaChmdW5jdGlvbihjaGlsZFNuYXBzaG90KSB7XG4gICAgICAgICAgICAvL3VwZGF0ZSBub3RpZmljYXRpb24gYW5kIGRldGFpbHNcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvbi51cGRhdGVOb3RpZmljYXRpb25Db3VudCh0b3BpY0lkLGNoaWxkU25hcHNob3Qua2V5KCkpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICAvL0FkZCBkZXRhaWwgZm9yIHRoaXMgbm90aWZpY3RpYW9uXG4gICAgICBub3RpZnlMb2c6ZnVuY3Rpb24odG9waWNJZCx1aWQsZnJvbV91aWQpe1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwidWlkIFwiK3VpZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZnJvbSB1aWQgXCIrIGZyb21fdWlkKTtcblxuICAgICAgICBOb3RpZmljYXRpb24uYWRkQ2hpbGQodWlkKS5wdXNoKCkuc2V0KHtcbiAgICAgICAgICB0b3BpY0lkOiAgICB0b3BpY0lkLFxuICAgICAgICAgIGZyb206ICAgICAgIGZyb21fdWlkLFxuICAgICAgICAgIGlzX3JlYWQ6ICAgIGZhbHNlLFxuICAgICAgICAgIHRpbWVzdGFtcDogIG1vbWVudCgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfSk7XG5cbiAgICAgIH0sXG5cblxuICAgICAgLy9SZXNldCB1bnJlYWQgY291bnRlclxuICAgICAgcmVzZXRVbnJlYWQ6ZnVuY3Rpb24odWlkKXtcbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbm90aWZpY2F0aW9uLycrdWlkKycvdW5yZWFkJyk7XG4gICAgICAgIHJlZi5zZXQoMCk7XG4gICAgICB9LFxuXG5cbiAgICAgIC8vVXBkYXRlIG5vdGlmaWNhdGlvblxuICAgICAgLy9AcGFyYW1zIHVpZCAtIHdobyB0aGlzIG5vdGlmaWNhdGlvbiBpcyBnb2luZyB0b1xuICAgICAgdXBkYXRlTm90aWZpY2F0aW9uQ291bnQ6ZnVuY3Rpb24odG9waWNJZCx1aWQsZnJvbV91aWQpe1xuXG4gICAgICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ25vdGlmaWNhdGlvbi8nK3VpZCsnL3VucmVhZCcpO1xuICAgICAgICByZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgLy9kZWZhdWx0IHVucmVhZCBpcyAxXG4gICAgICAgICBpZihzbmFwc2hvdC52YWwoKSA9PSAnbnVsbCcpe1xuICAgICAgICAgICAgcmVmLnNldCgxKVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVmLnNldChzbmFwc2hvdC52YWwoKSArIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yT2JqZWN0KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJUaGUgcmVhZCBmYWlsZWQ6IFwiICsgZXJyb3JPYmplY3QuY29kZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vQWRkIHRvIGxvZ1xuICAgICAgICBOb3RpZmljYXRpb24ubm90aWZ5TG9nKHRvcGljSWQsdWlkLGZyb21fdWlkKTtcblxuICAgICAgfSxcblxuXG4gICAgICBhZGRDaGlsZDpmdW5jdGlvbihjaGlsZCl7XG4gICAgICAgIHJldHVybiByZWYuY2hpbGQoY2hpbGQpO1xuICAgICAgfSxcblxuICAgICAgYWRkQXJyQ2hpbGQ6ZnVuY3Rpb24oY2hpbGQpe1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZChjaGlsZCkpO1xuICAgICAgfSxcblxuICAgICAgYXJyOiAkZmlyZWJhc2VBcnJheShyZWYpLFxuICAgICAgYWxsOiBub3RpXG4gICAgfVxuICAgIHJldHVybiBOb3RpZmljYXRpb247XG4gIH0pXG5cbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuY29udHJvbGxlcignUGxhY2VzQ3RybCcsIGZ1bmN0aW9uKCRzdGF0ZSwkc2NvcGUsJHJvb3RTY29wZSwgJG1kRGlhbG9nLCAkbWRNZWRpYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1NlcnZpY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFncywgVG9waWNzLCBBdXRoLCBVc2VycywgU2x1ZyxMYW5ndWFnZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VMYW5kaW5nKSB7XG5cbiAgICB2YXIgcGxhY2VzQ3RybCA9IHRoaXM7XG4gICAgY29uc29sZS5sb2cocGxhY2VMYW5kaW5nKTtcbiAgICBwbGFjZXNDdHJsLnBsYWNlTGFuZGluZyA9IHBsYWNlTGFuZGluZztcblxuICB9KTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5mYWN0b3J5KCdQbGFjZXMnLCBmdW5jdGlvbigkZmlyZWJhc2VBcnJheSwgRmlyZWJhc2VVcmwpe1xuXG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsncGxhY2VzJyk7XG4gICAgdmFyIHBsYWNlRGV0YWlsX3JlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsncGxhY2VzX2RldGFpbHMnKTtcblxuICAgIHZhciBwbGFjZXMgPSAkZmlyZWJhc2VBcnJheShyZWYpO1xuXG4gICAgdmFyIFBsYWNlcyA9IHtcbiAgICAgIGFkZENoaWxkOiBmdW5jdGlvbihjaGlsZG5hbWUpe1xuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKGNoaWxkbmFtZSlcbiAgICAgIH0sXG5cbiAgICAgIGFkZFBsYWNlRGV0YWlsQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkbmFtZSl7XG4gICAgICAgIHJldHVybiBwbGFjZURldGFpbF9yZWYuY2hpbGQoY2hpbGRuYW1lKVxuICAgICAgfSxcblxuICAgICAgZ2V0UGxhY2VSZWY6ZnVuY3Rpb24ocGxhY2VfaWQpe1xuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKHBsYWNlX2lkKycvaW5mbycpO1xuICAgICAgfSxcbiAgICAgIGFycjogcGxhY2VzXG4gICAgfVxuICAgIHJldHVybiBQbGFjZXM7XG4gIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcblxuICAvL0NhdGVnb3J5IGxpc3RcbiAgLmZhY3RvcnkoJ0NhdGVnb3J5JywgZnVuY3Rpb24oJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBcnJheSwgRmlyZWJhc2VVcmwpe1xuICAgIHZhciByZWYgICAgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ2NhdGVnb3JpZXMnKTtcbiAgICB2YXIgY2F0ZWdvcmllcyA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuICAgIHZhciB0b3BpY0FyciA9ICRmaXJlYmFzZUFycmF5KHJlZik7XG5cbiAgICB2YXIgQ2F0ZWdvcnkgPSB7XG4gICAgICBnZXROYW1lOiBmdW5jdGlvbihzbHVnKXtcbiAgICAgICAgdmFyIGRhdGEgPSByZWYuY2hpbGQoc2x1Zyk7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QoZGF0YSk7XG4gICAgICB9LFxuXG4gICAgICBhbGw6IGNhdGVnb3JpZXNcbiAgICB9XG4gICAgcmV0dXJuIENhdGVnb3J5O1xuICB9KVxuXG5cbiAgLy9MYW5ndWFnZXNcbiAgLmZhY3RvcnkoJ0xhbmd1YWdlcycsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCBGaXJlYmFzZVVybCl7XG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbGFuZ3VhZ2VzJyk7XG4gICAgdmFyIGxhbmcgPSAkZmlyZWJhc2VBcnJheShyZWYpO1xuXG4gICAgcmV0dXJuIGxhbmc7XG4gIH0pXG5cblxuICAvL0xhbmd1YWdlc1xuICAuZmFjdG9yeSgnQXJjaGl2ZScsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCBGaXJlYmFzZVVybCl7XG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnYXJjaGl2ZScpO1xuICAgIHZhciBhcmNoaXZlID0gJGZpcmViYXNlQXJyYXkocmVmKTtcblxuICAgIHZhciBBcmNoaXZlID17XG4gICAgICBhZGRDaGlsZDogZnVuY3Rpb24oc2x1Zyl7XG4gICAgICAgIHJldHVybiByZWYuY2hpbGQoc2x1Zyk7XG4gICAgICB9LFxuICAgICAgcmVmOiByZWYsXG4gICAgICBhcnI6IGFyY2hpdmVcbiAgICB9XG4gICAgcmV0dXJuIEFyY2hpdmU7XG4gIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5jb250cm9sbGVyKCdUYWdDdHJsJywgZnVuY3Rpb24oQXV0aCwgVXNlcnMsICRzdGF0ZSwkcm9vdFNjb3BlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vUmVzb2x2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZ0xhbmRpbmcsdGFnTmFtZSkge1xuXG4gICAgdmFyIHRhZ0N0cmwgPSB0aGlzO1xuICAgIHRhZ0N0cmwudGFnTGFuZGluZyAgPSB0YWdMYW5kaW5nO1xuICAgIHRhZ0N0cmwudGFnTmFtZSAgICAgPSB0YWdOYW1lO1xuXG4gIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmZhY3RvcnkoJ1RhZ3MnLCBmdW5jdGlvbigkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBGaXJlYmFzZVVybCwgJHEpe1xyXG5cclxuICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ3RhZ3MnKTtcclxuICAgIHZhciB0YWdzID0gJGZpcmViYXNlQXJyYXkocmVmKTtcclxuXHJcbiAgICB2YXIgVGFncyA9IHtcclxuXHJcbiAgICAgIGFkZENoaWxkOiBmdW5jdGlvbihjaGlsZG5hbWUpe1xyXG4gICAgICAgIHJldHVybiByZWYuY2hpbGQoY2hpbGRuYW1lKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgdGFnc1VybDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgZ2V0VGFnUmVmOmZ1bmN0aW9uKHRhZyl7XHJcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZCh0YWcpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgZ2V0VGFnT2JqZWN0OmZ1bmN0aW9uKHRhZyl7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQodGFnKSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHRvcGljVGFnczpmdW5jdGlvbih0YWcpe1xyXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIHZhciBmYiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCk7XHJcbiAgICAgICAgdmFyIGRhdGFSZXQgPSAnJztcclxuXHJcbiAgICAgICAgcmV0dXJuIGZiLmNoaWxkKCd0YWdzLycrdGFnKVxyXG4gICAgICAgICAgLm9uKCdjaGlsZF9hZGRlZCcsIGZ1bmN0aW9uKHRhZ1NuYXApe1xyXG4gICAgICAgICAgICBmYi5jaGlsZCgndG9waWNzJylcclxuICAgICAgICAgICAgICAub3JkZXJCeUNoaWxkKFwidGFnc1wiKVxyXG4gICAgICAgICAgICAgIC5lcXVhbFRvKHRhZylcclxuICAgICAgICAgICAgICAub24oJ2NoaWxkX2FkZGVkJywgZnVuY3Rpb24odG9waWNTbmFwKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAvL3Nob3coIGV4dGVuZCh7fSwgdGFnU25hcC52YWwoKSwgdG9waWNTbmFwLnZhbCgpKSApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVuZCh7fSwgdGFnU25hcC52YWwoKSwgdG9waWNTbmFwLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZGF0YVJldCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBhcnI6IHRhZ3NcclxuXHJcbiAgICB9XHJcbiAgICByZXR1cm4gVGFncztcclxuICB9KVxyXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuICAuY29udHJvbGxlcignVG9waWNMYW5kaW5nQ3RybCcsIGZ1bmN0aW9uICgkc3RhdGUsICRzY29wZSwgU2x1ZywgVG9waWNzLCBBdXRoLCBVc2VycyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1Jlc29sdmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc093bmVyLHRvcGljTGFuZGluZywgcmVwbHlMaXN0LCB2aWV3RGF0YSwgZm9sbG93ZXJzKSB7XHJcblxyXG4gICAgdmFyIHRvcGljTGFuZGluZ0N0cmwgPSB0aGlzXHJcblxyXG5cclxuICAgIHRvcGljTGFuZGluZ0N0cmwuYXV0aCAgICAgICAgID0gQXV0aDtcclxuICAgIHRvcGljTGFuZGluZ0N0cmwudXNlcnMgICAgICAgID0gVXNlcnM7XHJcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnRvcGljTGFuZGluZyA9IHRvcGljTGFuZGluZztcclxuICAgIHRvcGljTGFuZGluZ0N0cmwudG9waWNzICAgICAgID0gVG9waWNzO1xyXG4gICAgdG9waWNMYW5kaW5nQ3RybC5yZXBseUxpc3QgICAgPSByZXBseUxpc3Q7XHJcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnZpZXdzICAgICAgICA9IHZpZXdEYXRhO1xyXG4gICAgdG9waWNMYW5kaW5nQ3RybC5mb2xsb3dlcnMgICAgPSBmb2xsb3dlcnM7XHJcbiAgICB0b3BpY0xhbmRpbmdDdHJsLmlzT3duZXIgICAgICA9IGlzT3duZXI7XHJcblxyXG5cclxuXHJcblxyXG4gICAgLy9HZXR0aW5nIFJlcGxpZXMgaW4gcmVwbGllc1xyXG4gICAgdG9waWNMYW5kaW5nQ3RybC5pblJlcGx5QXJyID0gW107XHJcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnJlcGx5SW5SZXBseSA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICBmb3IodmFyIGk9MDsgaTx0b3BpY0xhbmRpbmdDdHJsLnJlcGx5TGlzdC5sZW5ndGg7aSsrKXtcclxuICAgICAgICB2YXIgdG9waWNJZCA9IHRvcGljTGFuZGluZ0N0cmwucmVwbHlMaXN0W2ldLnRvcGljSWQ7XHJcbiAgICAgICAgdmFyIHJlcGx5SWQgPSB0b3BpY0xhbmRpbmdDdHJsLnJlcGx5TGlzdFtpXS4kaWQ7XHJcbiAgICAgICAgdG9waWNMYW5kaW5nQ3RybC5pblJlcGx5QXJyW2ldID0gdG9waWNMYW5kaW5nQ3RybC50b3BpY3MucmVwbHlJblJlcGx5KHRvcGljSWQscmVwbHlJZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnJlcGx5SW5SZXBseSgpO1xyXG4gIH0pXHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5jb250cm9sbGVyKCdUb3BpY0N0cmwnLCBmdW5jdGlvbigkc3RhdGUsJHNjb3BlLCRyb290U2NvcGUsICRtZERpYWxvZywgJG1kTWVkaWEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRodHRwLEZpcmViYXNlVXJsLCR0cmFuc2xhdGUsJG5vdGlmaWNhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9TZXJ2aWNlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RpU2VydmljZSxUYWdzLCBUb3BpY3MsIEF1dGgsIFVzZXJzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTbHVnLFBsYWNlcywgTGFuZ3VhZ2VzLEFyY2hpdmUpe1xyXG5cclxuICAgIHZhciB0b3BpY0N0cmwgPSB0aGlzO1xyXG5cclxuXHJcbiAgICAvL1BhcnNlciBoZXJlXHJcbiAgICB0b3BpY0N0cmwudGFncyAgICAgID0gVGFncztcclxuICAgIHRvcGljQ3RybC50b3BpY3MgICAgPSBUb3BpY3M7XHJcbiAgICB0b3BpY0N0cmwuYXV0aCAgICAgID0gQXV0aDtcclxuICAgIHRvcGljQ3RybC51c2VycyAgICAgPSBVc2VycztcclxuICAgIHRvcGljQ3RybC5sYW5ndWFnZXMgPSBMYW5ndWFnZXM7XHJcbiAgICB0b3BpY0N0cmwucGxhY2VzICAgID0gUGxhY2VzO1xyXG4gICAgdG9waWNDdHJsLmFyY2hpdmUgICA9IEFyY2hpdmU7XHJcbiAgICB0b3BpY0N0cmwubm90aSAgICAgID0gTm90aVNlcnZpY2U7XHJcblxyXG4gICAgaWYodG9waWNDdHJsLmF1dGgucmVmLmdldEF1dGgoKSAhPSBudWxsICl7XHJcbiAgICAgIHRvcGljQ3RybC5wcm9maWxlICA9IHRvcGljQ3RybC51c2Vycy5nZXRQcm9maWxlKHRvcGljQ3RybC5hdXRoLnJlZi5nZXRBdXRoKCkudWlkKTtcclxuICAgICAgdG9waWNDdHJsLnVpZCA9IHRvcGljQ3RybC5wcm9maWxlLiRpZDtcclxuICAgICAgdG9waWNDdHJsLnVzZXJSZWYgPSB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKTtcclxuICAgICAgdG9waWNDdHJsLnVzZXJVcHZvdGVkVG9waWNzID0gdG9waWNDdHJsLnVzZXJzLnVwdm90ZXModG9waWNDdHJsLnVpZCk7XHJcbiAgICAgIHRvcGljQ3RybC51c2VyRG93bnZvdGVkVG9waWNzID0gdG9waWNDdHJsLnVzZXJzLmRvd252b3Rlcyh0b3BpY0N0cmwudWlkKTtcclxuICAgICAgdG9waWNDdHJsLnVzZXJGb2xsb3dpbmcgPSB0b3BpY0N0cmwudXNlcnMuZm9sbG93aW5nKHRvcGljQ3RybC51aWQpO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgdG9waWNDdHJsLnByb2ZpbGUgPScnO1xyXG4gICAgICB0b3BpY0N0cmwudWlkID0gJyc7XHJcbiAgICAgIHRvcGljQ3RybC51c2VyUmVmID0gJyc7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICAvL1ByZXNldCBQYXJhbWV0ZXJzXHJcbiAgICB0b3BpY0N0cmwuaW1hZ2VTdHJpbmdzICA9IFtdO1xyXG4gICAgdG9waWNDdHJsLmltYWdlVGV4dCAgICAgPSBbXTtcclxuICAgIHRvcGljQ3RybC5pblJlcGx5QXJyICAgID0gW107XHJcbiAgICB0b3BpY0N0cmwubG9hZEJ1c3kgICAgICA9IGZhbHNlO1xyXG4gICAgdG9waWNDdHJsLnNsdWdSZXR1cm4gICAgPSBudWxsO1xyXG4gICAgdG9waWNDdHJsLmNyaXRlcmlhICAgICAgPSBmYWxzZTtcclxuICAgIHRvcGljQ3RybC5jcml0ZXJpYVJlcGx5ID0gbnVsbDtcclxuICAgIHRvcGljQ3RybC5yZXZpZXdDcml0ZXJpYT1mYWxzZTtcclxuICAgIHRvcGljQ3RybC5jcml0UmVwbHlEYXRhID0gbnVsbDtcclxuXHJcbiAgICAvL2lmIGFsbG93IG51bGwgaW4gdGhlIGZvcm1cclxuICAgIHRvcGljQ3RybC5uZXdUb3BpYyAgICAgID0ge1xyXG4gICAgICAnbG9jYXRpb24nOiAnJyxcclxuICAgICAgJ3VybCcgOiAnJyxcclxuICAgICAgJ2lwSW5mbyc6ICcnLFxyXG4gICAgICAndGFncyc6ICcnLFxyXG4gICAgICAnYm9keSc6ICcnXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vQ2FsYyBhdmVyYWdlIHJldmlldyBpbnB1dCBpbiByZXBseVxyXG4gICAgdG9waWNDdHJsLmF2Z1Jldmlld1JlcGx5ID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgIHZhciBvYmpDb3VudCA9IE9iamVjdC5rZXlzKHRvcGljQ3RybC5jcml0ZXJpYVJlcGx5KS5sZW5ndGg7XHJcbiAgICAgIHZhciBhdmcgPSAwXHJcbiAgICAgIGZvcih2YXIgaT0wO2k8b2JqQ291bnQ7aSsrKXtcclxuICAgICAgICBhdmcgPSBhdmcgKyB0b3BpY0N0cmwuY3JpdGVyaWFSZXBseVtpXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdG9waWNDdHJsLnJlcGx5UmV2aWV3QXZlcmFnZSA9IGF2Zy9vYmpDb3VudDtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKHRvcGljQ3RybC5jcml0ZXJpYVJlcGx5KTtcclxuXHJcbiAgICAgIHRvcGljQ3RybC5jcml0UmVwbHlEYXRhID0geyBhdmc6IHRvcGljQ3RybC5yZXBseVJldmlld0F2ZXJhZ2UsIGRhdGE6IHRvcGljQ3RybC5jcml0ZXJpYVJlcGx5fVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvL0dldCB0aGUgYXZlcmFnZSBzY29yZSBmcm9tIGNyaXRlcmlhIHZhbHVlc1xyXG4gICAgdG9waWNDdHJsLmF2Z1Jldmlld1Njb3JlID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgIGlmKGRhdGEpXHJcbiAgICAgIHtcclxuICAgICAgdmFyIGF2ZyA9MDtcclxuICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xyXG4gICAgICAgIGF2ZyA9IGF2ZyArIGRhdGFbaV0ucmF0aW5nO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhdmcvZGF0YS5sZW5ndGg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy9MYWJlbCBmb3IgcmVtb3ZlIHRvcGljc1xyXG4gICAgJHRyYW5zbGF0ZShbJ0tFWV9SRU1PVkUnLCAnS0VZX0NBTkNFTCcsJ0tFWV9DT05GX1JFTU9WRScsJ0tFWV9DT05GX1JFTV9DJ10pLnRoZW4oZnVuY3Rpb24gKHRyYW5zbGF0aW9ucykge1xyXG4gICAgICB0b3BpY0N0cmwucmVtb3ZlVHJhbnMgPSB0cmFuc2xhdGlvbnMuS0VZX1JFTU9WRTtcclxuICAgICAgdG9waWNDdHJsLmNhbmNlbFRyYW5zID0gdHJhbnNsYXRpb25zLktFWV9DQU5DRUw7XHJcbiAgICAgIHRvcGljQ3RybC5jb25maXJtUmVtICA9IHRyYW5zbGF0aW9ucy5LRVlfQ09ORl9SRU1PVkU7XHJcbiAgICAgIHRvcGljQ3RybC5jb25maXJtUmVtQ29udGVudCA9ICB0cmFuc2xhdGlvbnMuS0VZX0NPTkZfUkVNX0M7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgdG9waWNDdHJsLnVzZXJOYW1lID0gZnVuY3Rpb24odXNlcklkKXtcclxuICAgICAgaWYodXNlcklkIT0gbnVsbCl7XHJcbiAgICAgICAgLy9yZXR1cm4gdG9waWNDdHJsLnVzZXJzLmdldERpc3BsYXlOYW1lKHVzZXJJZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcbiAgICAvL0xvZ2luIGZvciBtYXRlcmlhbFxyXG4gICAgdG9waWNDdHJsLnNob3dNZExvZ2luID0gZnVuY3Rpb24oZXYpIHtcclxuICAgICAgdmFyIHVzZUZ1bGxTY3JlZW4gPSAoJG1kTWVkaWEoJ3NtJykgfHwgJG1kTWVkaWEoJ3hzJykpICYmICRzY29wZS5jdXN0b21GdWxsc2NyZWVuO1xyXG4gICAgICAkbWREaWFsb2cuc2hvdyh7XHJcbiAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxyXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC9tZC1sb2dpbi1mb3JtLmh0bWwnLFxyXG4gICAgICAgICAgcGFyZW50OiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSksXHJcbiAgICAgICAgICB0YXJnZXRFdmVudDogZXYsXHJcbiAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlLFxyXG4gICAgICAgICAgZnVsbHNjcmVlbjogdXNlRnVsbFNjcmVlblxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICB0b3BpY0N0cmwuZGVjb2RlVGV4dCA9IGZ1bmN0aW9uKHRleHQpe1xyXG4gICAgICAvL3JldHVybiAkZmlsdGVyKCdzbHVnaWZ5JykoaXRlbS5uYW1lKTtcclxuICAgICAgY29uc29sZS5sb2coZGVjb2RlVVJJKHRleHQpKTtcclxuICAgICAgcmV0dXJuIGRlY29kZVVSSSh0ZXh0KTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgdG9waWNDdHJsLmxvYWRNb3JlID0gZnVuY3Rpb24oaXRlbXMpIHtcclxuICAgICAgdG9waWNDdHJsLmxvYWRCdXN5ID0gdHJ1ZTtcclxuICAgICAgdmFyIGRhdGEgPSBbXTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRhdGEucHVzaChpdGVtc1tpXSk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgIHJldHVybiBkYXRhXHJcbiAgICB9O1xyXG5cclxuICAgIHRvcGljQ3RybC5sb2FkVGFncyA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKHRvcGljQ3RybC50YWdzLnRhZ3NVcmwoKSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKnRvcGljQ3RybC51c2Vycy5nZXRMb2NhdGlvbklQKCkuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5pcEluZm8gPSBkYXRhO1xyXG4gICAgfSk7Ki9cclxuXHJcblxyXG4gICAgLy9VcGxvYWQgUHJvZmlsZSBpbWFnZVxyXG4gICAgdG9waWNDdHJsLnVwbG9hZEZpbGUgPSBmdW5jdGlvbihmaWxlcyxpbmRleCkge1xyXG4gICAgICBhbmd1bGFyLmZvckVhY2goZmlsZXMsIGZ1bmN0aW9uIChmbG93RmlsZSwgaW5kZXgpIHtcclxuICAgICAgICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgIHZhciB1cmkgPSBldmVudC50YXJnZXQucmVzdWx0O1xyXG4gICAgICAgICAgdG9waWNDdHJsLmltYWdlU3RyaW5nc1tpbmRleF0gPSB1cmk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0RhdGFVUkwoZmxvd0ZpbGUuZmlsZSk7XHJcbiAgICAgIH0pXHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvL1Nob3cgY29uZmlybSByZW1vdmUgdG9waWNcclxuICAgIHRvcGljQ3RybC5zaG93Q29uZmlybVJlbW92ZSA9IGZ1bmN0aW9uKGV2LHRvcGljX293bmVyLG9iail7XHJcbiAgICAgIC8vIEFwcGVuZGluZyBkaWFsb2cgdG8gZG9jdW1lbnQuYm9keSB0byBjb3ZlciBzaWRlbmF2IGluIGRvY3MgYXBwXHJcbiAgICAgIHZhciBjb25maXJtID0gJG1kRGlhbG9nLmNvbmZpcm0oKVxyXG4gICAgICAgIC50aXRsZSh0b3BpY0N0cmwuY29uZmlybVJlbSlcclxuICAgICAgICAudGV4dENvbnRlbnQodG9waWNDdHJsLmNvbmZpcm1SZW1Db250ZW50KVxyXG4gICAgICAgIC50YXJnZXRFdmVudChldilcclxuICAgICAgICAub2sodG9waWNDdHJsLnJlbW92ZVRyYW5zKVxyXG4gICAgICAgIC5jYW5jZWwodG9waWNDdHJsLmNhbmNlbFRyYW5zKTtcclxuICAgICAgJG1kRGlhbG9nLnNob3coY29uZmlybSkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICBpZih0b3BpY0N0cmwucmVtb3ZlVG9waWModG9waWNfb3duZXIsb2JqKSl7XHJcbiAgICAgICAgICAkc3RhdGUuZ28oJ2Rhc2hib2FyZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvL1JlbW92ZSB0b3BpY1xyXG4gICAgdG9waWNDdHJsLnJlbW92ZVRvcGljID0gZnVuY3Rpb24odG9waWNfb3duZXIsb2JqKXtcclxuICAgICAgLy92ZXJpZnkgaWYgdGhlIHRvcGljIG93bmVyIGFuZCB0aGUgbG9naW4gb3duZXIgaXMgdGhlIHNhbWUgcHBsXHJcbiAgICAgIGlmKHRvcGljX293bmVyID09IHRvcGljQ3RybC51aWQpe1xyXG4gICAgICAgIG1vdmVGYlJlY29yZCh0b3BpY0N0cmwudG9waWNzLnJlZkNoaWxkKG9iai4kaWQpLCB0b3BpY0N0cmwuYXJjaGl2ZS5hZGRDaGlsZChvYmouJGlkKSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICB9ZWxzZXtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vUmVwbHkgdG8gdG9waWNcclxuICAgIHRvcGljQ3RybC5yZXBseSA9IGZ1bmN0aW9uKHRvcGljT2JqKXtcclxuXHJcbiAgICAgIHRvcGljQ3RybC50b3BpY3MucmVwbHlBcnIodG9waWNPYmouJGlkKS4kYWRkKHtcclxuICAgICAgICB0b3BpY0lkOiAgdG9waWNPYmouJGlkLFxyXG4gICAgICAgIGJvZHk6ICAgICB0b3BpY0N0cmwubmV3UmVwbHkuYm9keSxcclxuICAgICAgICB1aWQ6ICAgICAgdG9waWNDdHJsLnVpZCxcclxuICAgICAgICByZXZpZXc6ICAgdG9waWNDdHJsLmNyaXRSZXBseURhdGEsXHJcbiAgICAgICAgY3JlYXRlZDogIG1vbWVudCgpLnRvSVNPU3RyaW5nKClcclxuICAgICAgfSkudGhlbihmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vTm90aWZ5IHRvcGljIG93bmVyXHJcbiAgICAgICAgLy90b3BpY09iaiByZWZlcnMgdG8gdGhlIHByb3BlcnR5IG9mIHRoaXMgb2JqZWN0XHJcbiAgICAgICAgdG9waWNDdHJsLm5vdGkudXBkYXRlTm90aWZpY2F0aW9uQ291bnQodG9waWNPYmouJGlkLHRvcGljT2JqLnVpZCx0b3BpY0N0cmwudWlkKTtcclxuICAgICAgfSlcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgICAgdG9waWNDdHJsLnRvcGljcy5yZXBseUNvdW50KHRvcGljT2JqLiRpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgaWYoIWRhdGEuY291bnQpe1xyXG4gICAgICAgICAgdG9waWNDdHJsLnRvcGljcy5yZXBseUNvdW50UmVmKHRvcGljT2JqLiRpZCkuc2V0KDEpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgdG9waWNDdHJsLnRvcGljcy5yZXBseUNvdW50UmVmKHRvcGljT2JqLiRpZClcclxuICAgICAgICAgICAgLnNldChkYXRhLmNvdW50ICsxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgIC8vU3RhdCB1cGRhdGUgZm9yIHVzZXJcclxuICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvY29tbWVudC9jb3VudCcpXHJcbiAgICAgICAgLnNldCh0b3BpY0N0cmwucHJvZmlsZS5zdGF0LmNvbW1lbnQuY291bnQgKyAxKTtcclxuXHJcbiAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L2NvbW1lbnQvdG9waWNzLycrdG9waWNPYmouJGlkKVxyXG4gICAgICAgIC5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgLy9SZXBseSBpbiByZXBseVxyXG4gICAgdG9waWNDdHJsLnJlcGx5SW5SZXBseSA9IGZ1bmN0aW9uKHRvcGljSWQscmVwbHlJZCl7XHJcbiAgICAgIHRvcGljQ3RybC50b3BpY3MucmVwbHlJblJlcGx5QXJyKHRvcGljSWQscmVwbHlJZCkuJGFkZCh7XHJcbiAgICAgICAgYm9keTogICAgIHRvcGljQ3RybC5yZXBseUluUmVwbHkuYm9keSxcclxuICAgICAgICB1aWQ6ICAgICAgdG9waWNDdHJsLnVpZCxcclxuICAgICAgICBjcmVhdGVkOiAgbW9tZW50KCkudG9JU09TdHJpbmcoKVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgdG9waWNDdHJsLmFkZE5ld0Nob2ljZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgbmV3SXRlbU5vID0gdG9waWNDdHJsLnJldmlld0NyaXRlcmlhLmxlbmd0aCsxO1xyXG4gICAgICB0b3BpY0N0cmwucmV2aWV3Q3JpdGVyaWEucHVzaCh7J2lkJzonY3JpdGVyaWEnK25ld0l0ZW1Ob30pO1xyXG4gICAgfTtcclxuXHJcbiAgICB0b3BpY0N0cmwucmVtb3ZlQ2hvaWNlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBsYXN0SXRlbSA9IHRvcGljQ3RybC5yZXZpZXdDcml0ZXJpYS5sZW5ndGgtMTtcclxuICAgICAgdG9waWNDdHJsLnJldmlld0NyaXRlcmlhLnNwbGljZShsYXN0SXRlbSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvL0NyZWF0ZSBuZXcgdG9waWNcclxuICAgIHRvcGljQ3RybC5jcmVhdGVUb3BpYyA9IGZ1bmN0aW9uKGNhdGVnb3J5LGlzRHJhZnQpe1xyXG5cclxuICAgICAgLy9DaGVjayBpZiB3ZSBoYXZlIGxvY2F0aW9uIGRldGFpbHNcclxuICAgICAgdmFyIGxvY2F0aW9uRGV0YWlsID0gJyc7XHJcblxyXG4gICAgICBpZih0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24gIT09ICcnICl7XHJcbiAgICAgICAgY29uc29sZS5sb2codG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uKTtcclxuICAgICAgICBsb2NhdGlvbkRldGFpbCA9IHtcclxuICAgICAgICAgIHBsYWNlX2lkOiB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5wbGFjZV9pZCxcclxuICAgICAgICAgIHNsdWc6ICAgICBTbHVnLnNsdWdpZnkodG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uLmRldGFpbHMubmFtZSksXHJcbiAgICAgICAgICBuYW1lOiAgICAgdG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uLmRldGFpbHMubmFtZSxcclxuICAgICAgICAgIGFkZHJlc3M6ICB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5mb3JtYXR0ZWRfYWRkcmVzcyxcclxuICAgICAgICAgIGxhdDogICAgICB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5nZW9tZXRyeS5sb2NhdGlvbi5sYXQoKSxcclxuICAgICAgICAgIGxuZzogICAgICB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5nZW9tZXRyeS5sb2NhdGlvbi5sbmcoKSxcclxuICAgICAgICAgIGxuZzogICAgICB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5nZW9tZXRyeS5sb2NhdGlvbi5sbmcoKSxcclxuICAgICAgICAgIGxuZzogICAgICB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5nZW9tZXRyeS5sb2NhdGlvbi5sbmcoKSxcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgLyogREVCVUcgRk9STSBWQUxVRVxyXG4gICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgIHR5cGU6ICAgICAgICAgICB0b3BpY0N0cmwudHlwZSxcclxuICAgICAgICBsYW5nOiAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmxhbmcsXHJcbiAgICAgICAgdG9waWM6ICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYyxcclxuICAgICAgICBib2R5OiAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmJvZHksXHJcbiAgICAgICAgY2F0ZWdvcnk6ICAgICAgIGNhdGVnb3J5LFxyXG4gICAgICAgIHVpZDogICAgICAgICAgICB0b3BpY0N0cmwudWlkLFxyXG4gICAgICAgIHNsdWc6ICAgICAgICAgICBTbHVnLnNsdWdpZnkodG9waWNDdHJsLm5ld1RvcGljLnRvcGljKSxcclxuICAgICAgICBwaG90b3M6ICAgICAgICAgdG9waWNDdHJsLmltYWdlU3RyaW5ncyxcclxuICAgICAgICBwaG90b3NfdGV4dDogICAgdG9waWNDdHJsLmltYWdlVGV4dCxcclxuICAgICAgICBsb2NhdGlvbjogICAgICAgbG9jYXRpb25EZXRhaWwsXHJcbiAgICAgICAgdXJsOiAgICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy51cmwsXHJcbiAgICAgICAgZHJhZnQ6ICAgICAgICAgIGlzRHJhZnQsXHJcbiAgICAgICAgY3JlYXRlZDogICAgICAgIG1vbWVudCgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgdGFnczogICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy50YWdzLFxyXG4gICAgICAgIHVzZXJJUDogICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmlwSW5mb1xyXG4gICAgICB9O1xyXG4gICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgKi9cclxuXHJcbiAgICAgIHRvcGljQ3RybC50b3BpY3MuYXJyLiRhZGQoe1xyXG4gICAgICAgICAgdHlwZTogICAgICAgICAgIHRvcGljQ3RybC50eXBlLFxyXG4gICAgICAgICAgbGFuZzogICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5sYW5nLFxyXG4gICAgICAgICAgdG9waWM6ICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYyxcclxuICAgICAgICAgIGJvZHk6ICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMuYm9keSxcclxuICAgICAgICAgIGNhdGVnb3J5OiAgICAgICBjYXRlZ29yeSxcclxuICAgICAgICAgIHVpZDogICAgICAgICAgICB0b3BpY0N0cmwudWlkLFxyXG4gICAgICAgICAgLy9zbHVnOiAgICAgICAgICAgU2x1Zy5zbHVnaWZ5KHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYyksXHJcbiAgICAgICAgICBzbHVnOiAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLnRvcGljLFxyXG4gICAgICAgICAgcGhvdG9zOiAgICAgICAgIHRvcGljQ3RybC5pbWFnZVN0cmluZ3MsXHJcbiAgICAgICAgICBwaG90b3NfdGV4dDogICAgdG9waWNDdHJsLmltYWdlVGV4dCxcclxuICAgICAgICAgIGxvY2F0aW9uOiAgICAgICBsb2NhdGlvbkRldGFpbCxcclxuICAgICAgICAgIHVybDogICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMudXJsLFxyXG4gICAgICAgICAgZHJhZnQ6ICAgICAgICAgIGlzRHJhZnQsXHJcbiAgICAgICAgICBjcmVhdGVkOiAgICAgICAgbW9tZW50KCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICAgIHRhZ3M6ICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMudGFncyxcclxuICAgICAgICAgIHVzZXJJUDogICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMuaXBJbmZvLFxyXG4gICAgICAgICAgcmV2aWV3OiAgICAgICAgIHRvcGljQ3RybC5yZXZpZXdDcml0ZXJpYSxcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHRvcGljKXtcclxuXHJcbiAgICAgICAgICB2YXIgc2x1Z1RleHQgPScnO1xyXG4gICAgICAgICAgLy9pZiB3ZSBhcmUgdW5hYmxlIHRvIGNvbnZlcnQgdG8gc2x1ZyB0aGVuIHdlIHVzZSB0aGUgdG9waWMgdGV4dCwgZWxzZSB1c2Ugc2x1Z1xyXG4gICAgICAgICAgaWYoU2x1Zy5zbHVnaWZ5KHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYykgPT0nJyl7XHJcbiAgICAgICAgICAgIHNsdWdUZXh0ID0gdG9waWNDdHJsLm5ld1RvcGljLnRvcGljO1xyXG4gICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHNsdWdUZXh0ID0gU2x1Zy5zbHVnaWZ5KHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy9VcGRhdGUgc2x1ZyB3aXRoIHRvcGljIEtleVxyXG4gICAgICAgICAgdG9waWNDdHJsLnRvcGljcy5nZXRUb3BpY0J5S2V5KHRvcGljLmtleSgpKS51cGRhdGUoe1wic2x1Z1wiOnNsdWdUZXh0K3RvcGljLmtleSgpfSk7XHJcblxyXG4gICAgICAgICAgLy9TdGF0IHVwZGF0ZVxyXG4gICAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvcG9zdGVkL2NvdW50JylcclxuICAgICAgICAgICAgLnNldCh0b3BpY0N0cmwucHJvZmlsZS5zdGF0LnBvc3RlZC5jb3VudCArIDEpO1xyXG5cclxuICAgICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L3Bvc3RlZC90b3BpY3MvJyt0b3BpYy5rZXkoKSlcclxuICAgICAgICAgICAgLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgICAgLy9JZiB0aGVyZSBpcyBsb2NhdGlvblxyXG4gICAgICAgICAgaWYobG9jYXRpb25EZXRhaWwgIT09ICcnKXtcclxuXHJcbiAgICAgICAgICAgIHRvcGljQ3RybC5wbGFjZXMuYWRkQ2hpbGQobG9jYXRpb25EZXRhaWwucGxhY2VfaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAuY2hpbGQodG9waWMua2V5KCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgICAgIHRvcGljQ3RybC5wbGFjZXMuYWRkQ2hpbGQobG9jYXRpb25EZXRhaWwucGxhY2VfaWQpXHJcbiAgICAgICAgICAgICAgLmNoaWxkKCdpbmZvJykuc2V0KGxvY2F0aW9uRGV0YWlsKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvL2lmIHRoZXJlIGFyZSB0YWdzXHJcbiAgICAgICAgICBpZih0b3BpY0N0cmwubmV3VG9waWMudGFncyAhPT0gbnVsbCl7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB0b3BpY0N0cmwubmV3VG9waWMudGFncy5sZW5ndGg7ICsraW5kZXgpIHtcclxuICAgICAgICAgICAgICB0b3BpY0N0cmwudGFncy5hZGRDaGlsZCh0b3BpY0N0cmwubmV3VG9waWMudGFnc1tpbmRleF0udGV4dClcclxuICAgICAgICAgICAgICAgIC5jaGlsZCh0b3BpYy5rZXkoKSkucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vTm90aWZ5IGZvbGxvd2VyXHJcbiAgICAgICAgICB0b3BpY0N0cmwubm90aS5ub3RpZnlGb2xsb3dlcih0b3BpYy5rZXkoKSx0b3BpY0N0cmwudWlkKTtcclxuXHJcblxyXG4gICAgICAgICAgLy9SZXNldCBmb3JtIGhlcmVcclxuICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYyA9IHtcclxuICAgICAgICAgICAgYm9keTogJydcclxuICAgICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLy9DaGVjayBpZiB1c2VyIGlzIGFscmVhZHkgZm9sbG93aW5nIHVzZXJcclxuICAgIHRvcGljQ3RybC5jaGVja0ZvbGxvdyA9IGZ1bmN0aW9uKGZvbGxvd191aWQpe1xyXG4gICAgICBpZih0b3BpY0N0cmwudXNlcnMuY2hlY2tGb2xsb3codG9waWNDdHJsLnVpZCxmb2xsb3dfdWlkKSl7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvL0ZvbGxvdyBVc2VyXHJcbiAgICB0b3BpY0N0cmwuZm9sbG93VXNlciA9IGZ1bmN0aW9uKGZvbGxvd191aWQpe1xyXG5cclxuICAgICAgLy9VcGRhdGUgdGhlIHBlcnNvbiB0aGF0IGJlaW5nIGZvbGxvdywgY3JlZGl0IHRoZW0gZm9yIGhhdmluZyBmb2xsb3dlclxyXG4gICAgICB0b3BpY0N0cmwudXNlcnMuZ2V0UHJvZmlsZShmb2xsb3dfdWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG5cclxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZihmb2xsb3dfdWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dlci9jb3VudCcpXHJcbiAgICAgICAgICAuc2V0KGRhdGEuc3RhdC5mb2xsb3dlci5jb3VudCArIDEpO1xyXG5cclxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZihmb2xsb3dfdWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dlci91aWQvJysgdG9waWNDdHJsLnVpZClcclxuICAgICAgICAgIC5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vVXBkYXRlIHRoZSBwZXJzb24gdGhhdCBpcyBmb2xsb3dpbmcsIGNyZWRpdCB0aGVtIGZvciBoYXZpbmcgZm9sbG93aW5nXHJcbiAgICAgIHRvcGljQ3RybC51c2Vycy5nZXRQcm9maWxlKHRvcGljQ3RybC51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcblxyXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2luZy9jb3VudCcpXHJcbiAgICAgICAgICAuc2V0KGRhdGEuc3RhdC5mb2xsb3dlci5jb3VudCArIDEpO1xyXG5cclxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dpbmcvdWlkLycrIGZvbGxvd191aWQpXHJcbiAgICAgICAgICAucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vVW5mb2xsb3cgVXNlclxyXG4gICAgdG9waWNDdHJsLnVuZm9sbG93VXNlciA9IGZ1bmN0aW9uKGZvbGxvd191aWQpe1xyXG5cclxuICAgICAgLy9VcGRhdGUgdGhlIHBlcnNvbiB0aGF0IGJlaW5nIGZvbGxvdywgY3JlZGl0IHRoZW0gZm9yIGhhdmluZyBmb2xsb3dlclxyXG4gICAgICB0b3BpY0N0cmwudXNlcnMuZ2V0UHJvZmlsZShmb2xsb3dfdWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG5cclxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZihmb2xsb3dfdWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dlci9jb3VudCcpXHJcbiAgICAgICAgICAuc2V0KGRhdGEuc3RhdC5mb2xsb3dlci5jb3VudCAtIDEpO1xyXG5cclxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZihmb2xsb3dfdWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dlci91aWQvJysgdG9waWNDdHJsLnVpZCkucmVtb3ZlKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy9VcGRhdGUgdGhlIHBlcnNvbiB0aGF0IGlzIGZvbGxvd2luZywgY3JlZGl0IHRoZW0gZm9yIGhhdmluZyBmb2xsb3dpbmdcclxuICAgICAgdG9waWNDdHJsLnVzZXJzLmdldFByb2ZpbGUodG9waWNDdHJsLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuXHJcbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvZm9sbG93aW5nL2NvdW50JylcclxuICAgICAgICAgIC5zZXQoZGF0YS5zdGF0LmZvbGxvd2luZy5jb3VudCAtIDEpO1xyXG5cclxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dpbmcvdWlkLycrIGZvbGxvd191aWQpLnJlbW92ZSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgLy91cHZvdGVcclxuICAgIHRvcGljQ3RybC51cHZvdGUgPSBmdW5jdGlvbih0b3BpYyl7XHJcblxyXG4gICAgICBpZih0b3BpYy5kb3dudm90ZXMgIT0gdW5kZWZpbmVkICYmIHRvcGljLmRvd252b3Rlc1t0b3BpY0N0cmwudWlkXSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgIHRvcGljQ3RybC5jYW5jZWxEb3dudm90ZSh0b3BpYyk7XHJcbiAgICAgIH1cclxuICAgICAgdG9waWNDdHJsLnRvcGljcy51cHZvdGVUb3BpYyh0b3BpYy4kaWQsIHRvcGljQ3RybC51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgICB0b3BpY0N0cmwudXNlclVwdm90ZWRUb3BpY3MuY2hpbGQodG9waWMuJGlkKS5zZXQodmFsdWUuJHZhbHVlKTtcclxuXHJcbiAgICAgICAgLy9TdGF0IHVwZGF0ZVxyXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy5nZXRQcm9maWxlKHRvcGljLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuXHJcbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWMudWlkKS5jaGlsZCgnc3RhdC91cHZvdGVkL2NvdW50JylcclxuICAgICAgICAgIC5zZXQoZGF0YS5zdGF0LnVwdm90ZWQuY291bnQgKyAxKTtcclxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpYy51aWQpLmNoaWxkKCdzdGF0L3Vwdm90ZWQvdG9waWNzLycrdG9waWMuJGlkKVxyXG4gICAgICAgICAgLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdG9waWNDdHJsLmNhbmNlbFVwdm90ZSA9IGZ1bmN0aW9uKHRvcGljKXtcclxuICAgICAgdG9waWNDdHJsLnRvcGljcy51bmRvVXB2b3RlKHRvcGljLiRpZCwgdG9waWNDdHJsLnVpZCk7XHJcblxyXG4gICAgICB0b3BpY0N0cmwudXNlcnMuZ2V0UHJvZmlsZSh0b3BpYy51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcblxyXG4gICAgICAgIC8vU3RhdCB1cGRhdGVcclxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpYy51aWQpLmNoaWxkKCdzdGF0L3Vwdm90ZWQvY291bnQnKVxyXG4gICAgICAgICAgLnNldChkYXRhLnN0YXQudXB2b3RlZC5jb3VudCAtIDEpO1xyXG5cclxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpYy51aWQpLmNoaWxkKCdzdGF0L3Vwdm90ZWQvdG9waWNzLycrdG9waWMuJGlkKS5yZW1vdmUoKTtcclxuICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgdG9waWNDdHJsLnVzZXJVcHZvdGVkVG9waWNzLmNoaWxkKHRvcGljLiRpZCkucmVtb3ZlKGZ1bmN0aW9uKGVycm9yKXtcclxuICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6XCIsIGVycm9yKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVtb3ZlZCBzdWNjZXNzZnVsbHkhXCIpO1xyXG4gICAgICAgICAgfX0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvL2Rvd252b3RlXHJcbiAgICB0b3BpY0N0cmwuZG93bnZvdGUgPSBmdW5jdGlvbih0b3BpYyl7XHJcbiAgICAgIGlmKHRvcGljLnVwdm90ZXMgIT0gdW5kZWZpbmVkICYmIHRvcGljLnVwdm90ZXNbdG9waWNDdHJsLnVpZF0gIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICB0b3BpY0N0cmwuY2FuY2VsVXB2b3RlKHRvcGljKTtcclxuICAgICAgfVxyXG4gICAgICB0b3BpY0N0cmwudG9waWNzLmRvd252b3RlVG9waWModG9waWMuJGlkLCB0b3BpY0N0cmwudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgICAgdG9waWNDdHJsLnVzZXJEb3dudm90ZWRUb3BpY3MuY2hpbGQodG9waWMuJGlkKS5zZXQodmFsdWUuJHZhbHVlKTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRvcGljQ3RybC5jYW5jZWxEb3dudm90ZSA9IGZ1bmN0aW9uKHRvcGljKXtcclxuICAgICAgdG9waWNDdHJsLnRvcGljcy51bmRvRG93bnZvdGUodG9waWMuJGlkLCB0b3BpY0N0cmwudWlkKTtcclxuICAgICAgdG9waWNDdHJsLnVzZXJEb3dudm90ZWRUb3BpY3MuY2hpbGQodG9waWMuJGlkKS5yZW1vdmUoZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZW1vdmVkIHN1Y2Nlc3NmdWxseSFcIik7XHJcbiAgICAgICAgICB9fSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vZm9sbG93IHRvcGljXHJcbiAgICB0b3BpY0N0cmwuZm9sbG93VG9waWMgPSBmdW5jdGlvbih0b3BpYyl7XHJcbiAgICAgIHRvcGljQ3RybC50b3BpY3MuZm9sbG93KHRvcGljLiRpZCwgdG9waWNDdHJsLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICAgIHRvcGljQ3RybC51c2VyRm9sbG93aW5nLmNoaWxkKHRvcGljLiRpZCkuc2V0KHZhbHVlLmhpc3RvcnlbdG9waWNDdHJsLnVpZF0pO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdG9waWNDdHJsLnVuZm9sbG93VG9waWMgPSBmdW5jdGlvbih0b3BpYyl7XHJcbiAgICAgIHRvcGljQ3RybC50b3BpY3MudW5mb2xsb3codG9waWMuJGlkLCB0b3BpY0N0cmwudWlkKTtcclxuICAgICAgdG9waWNDdHJsLnVzZXJGb2xsb3dpbmcuY2hpbGQodG9waWMuJGlkKS5yZW1vdmUoZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZW1vdmVkIHN1Y2Nlc3NmdWxseSFcIik7XHJcbiAgICAgICAgICB9fSk7XHJcbiAgICB9O1xyXG5cclxuICB9KTtcclxuXHJcblxyXG4vL2h0dHBzOi8vZ2lzdC5naXRodWIuY29tL2thdG93dWxmLzYwOTkwNDJcclxuZnVuY3Rpb24gbW92ZUZiUmVjb3JkKG9sZFJlZiwgbmV3UmVmKSB7XHJcbiAgb2xkUmVmLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24gKHNuYXApIHtcclxuICAgIG5ld1JlZi5zZXQoc25hcC52YWwoKSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgIGlmICghZXJyb3IpIHtcclxuICAgICAgICBvbGRSZWYucmVtb3ZlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAodHlwZW9mKGNvbnNvbGUpICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlLmVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC8vIFRvcGljIGxpc3RcclxuICAuZmFjdG9yeSgnVG9waWNzJywgZnVuY3Rpb24gKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXksIEZpcmViYXNlVXJsKSB7XHJcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsICsgJ3RvcGljcycpXHJcbiAgICB2YXIgdG9waWNzID0gJGZpcmViYXNlT2JqZWN0KHJlZilcclxuICAgIHZhciB0b3BpY3NBcnIgPSAkZmlyZWJhc2VBcnJheShyZWYpXHJcbiAgICB2YXIgdG9waWNLZXkgPSAnJ1xyXG5cclxuICAgIHZhciBUb3BpY3MgPSB7XHJcbiAgICAgIC8vIEdldCB0b3BpYyB0YWdcclxuICAgICAgZ2V0VGFnOiBmdW5jdGlvbiAodGFnKSB7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5vcmRlckJ5Q2hpbGQoJ3RhZ3MnKS5lcXVhbFRvKHRhZykpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBHZXQgdG9waWMgc2x1Z1xyXG4gICAgICBnZXRTbHVnOiBmdW5jdGlvbiAoc2x1Zykge1xyXG4gICAgICAgIHZhciBkYXRhID0gcmVmLm9yZGVyQnlDaGlsZCgnc2x1ZycpLmVxdWFsVG8oc2x1ZylcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkoZGF0YSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIEdldHRpbmcgdGhlIGxpc3Qgb2YgdG9waWNzIGNyZWF0ZWQgYnkgdXNlcl9pZFxyXG4gICAgICBjcmVhdGVkQnk6IGZ1bmN0aW9uICh1aWQpIHtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLm9yZGVyQnlDaGlsZCgndWlkJykuZXF1YWxUbyh1aWQpKVxyXG5cclxuICAgICAgfSxcclxuICAgICAgcmVmQ2hpbGQ6IGZ1bmN0aW9uIChjaGlsZCkge1xyXG4gICAgICAgIHJldHVybiByZWYuY2hpbGQoY2hpbGQpXHJcbiAgICAgIH0sXHJcbiAgICAgIGNvdW50VXNlclRvcGljczogZnVuY3Rpb24gKCkge30sXHJcblxyXG4gICAgICAvLyBHZXR0aW5nIHRoZSBsaXN0IG9mIHRvcGljIGJhc2Ugb24gY2F0ZWdvcnlcclxuICAgICAgbGlzdDogZnVuY3Rpb24gKGNhdGVnb3J5KSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSByZWYub3JkZXJCeUNoaWxkKCdjYXRlZ29yeScpLmVxdWFsVG8oY2F0ZWdvcnkpXHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KGRhdGEpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBuYW1lOiBmdW5jdGlvbiAodG9waWNfc2x1Zykge1xyXG4gICAgICAgIHZhciBkYXRhID0gcmVmLm9yZGVyQnlDaGlsZCgnc2x1ZycpLmVxdWFsVG8odG9waWNfc2x1ZylcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KGRhdGEpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBSZXR1cm4gdG9waWMgZGV0YWlscyBpbiBSZWZcclxuICAgICAgZm9ydG9waWNSZWY6IGZ1bmN0aW9uICh0b3BpY19zbHVnKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlZi5vcmRlckJ5Q2hpbGQoJ3NsdWcnKS5lcXVhbFRvKHRvcGljX3NsdWcpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBnZXRUb3BpY0J5S2V5OiBmdW5jdGlvbiAodG9waWNfa2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCArICd0b3BpY3MvJyArIHRvcGljX2tleSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGdldFRvcGljQnlTbHVnOiBmdW5jdGlvbiAodG9waWNfc2x1Zykge1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYub3JkZXJCeUNoaWxkKCdzbHVnJykuZXF1YWxUbyh0b3BpY19zbHVnKS5saW1pdFRvRmlyc3QoMSkpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBpbmNyZW1lbnRWaWV3OiBmdW5jdGlvbiAodG9waWNfc2x1Zykge30sXHJcblxyXG4gICAgICAvLyBSZXR1cm4gdG9waWMgZGV0YWlscyBpbiBhcnJheVxyXG4gICAgICBmb3J0b3BpYzogZnVuY3Rpb24gKHRvcGljX3NsdWcpIHtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkoVG9waWNzLmZvcnRvcGljUmVmKHRvcGljX3NsdWcpKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gUmVwbHkgbGlzdGluZ1xyXG4gICAgICByZXBseUxpc3Q6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSByZWYuY2hpbGQodG9waWNJZCArICcvcmVwbGllcycpXHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KGRhdGEpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBSZXBseSBBcnJheVxyXG4gICAgICByZXBseUFycjogZnVuY3Rpb24gKHRvcGljSWQpIHtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKHRvcGljSWQgKyAnL3JlcGxpZXMnKSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFJlcGx5IGNvdW50XHJcbiAgICAgIHJlcGx5Q291bnQ6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQodG9waWNJZCArICcvcmVwbGllcy8nKSlcclxuICAgICAgfSxcclxuICAgICAgcmVwbHlDb3VudFJlZjogZnVuY3Rpb24gKHRvcGljSWQpIHtcclxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKHRvcGljSWQgKyAnL3JlcGxpZXMvY291bnQnKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgcmVwbHlJblJlcGx5OiBmdW5jdGlvbiAodG9waWNJZCwgcmVwbHlJZCkge1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQodG9waWNJZCArICcvcmVwbGllcy8nICsgcmVwbHlJZCArICcvaW5SZXBseScpKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gUmVwbHkgaW4gUmVwbHkgQXJyYXlcclxuICAgICAgcmVwbHlJblJlcGx5QXJyOiBmdW5jdGlvbiAodG9waWNJZCwgcmVwbHlJZCkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9yZXBsaWVzLycrcmVwbHlJZCsnL2luUmVwbHknKSkpXHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9yZXBsaWVzLycgKyByZXBseUlkICsgJy9pblJlcGx5JykpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyB1cHZvdGVzXHJcbiAgICAgIGdldFVwdm90ZXM6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHJlZjogcmVmLmNoaWxkKHRvcGljSWQgKyAnL3Vwdm90ZXMnKSxcclxuICAgICAgICAgIGFycmF5OiAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQodG9waWNJZCArICcvdXB2b3RlcycpKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIGRvd252b3Rlc1xyXG4gICAgICBnZXREb3dudm90ZXM6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHJlZjogcmVmLmNoaWxkKHRvcGljSWQgKyAnL2Rvd252b3RlcycpLFxyXG4gICAgICAgICAgYXJyYXk6ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9kb3dudm90ZXMnKSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBmb2xsb3dlcnNcclxuICAgICAgZ2V0Rm9sbG93ZXJzOiBmdW5jdGlvbiAodG9waWNJZCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICByZWY6IHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKSxcclxuICAgICAgICAgIG9iajogJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICB1cHZvdGVUb3BpYzogZnVuY3Rpb24gKHRvcGljSWQsIHVpZCkge1xyXG4gICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy91cHZvdGVzJykuY2hpbGQodWlkKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSlcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkICsgJy91cHZvdGVzJykuY2hpbGQodWlkKSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHVuZG9VcHZvdGU6IGZ1bmN0aW9uICh0b3BpY0lkLCB1aWQpIHtcclxuICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvdXB2b3RlcycpLmNoaWxkKHVpZCkucmVtb3ZlKGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvcjonLCBlcnJvcilcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZW1vdmVkIHN1Y2Nlc3NmdWxseSEnKVxyXG4gICAgICAgICAgfX0pXHJcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZCh0b3BpY0lkICsgJy91cHZvdGVzJylcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGRvd252b3RlVG9waWM6IGZ1bmN0aW9uICh0b3BpY0lkLCB1aWQpIHtcclxuICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvZG93bnZvdGVzJykuY2hpbGQodWlkKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSlcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9kb3dudm90ZXMnKS5jaGlsZCh1aWQpKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgdW5kb0Rvd252b3RlOiBmdW5jdGlvbiAodG9waWNJZCwgdWlkKSB7XHJcbiAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL2Rvd252b3RlcycpLmNoaWxkKHVpZCkucmVtb3ZlKGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvcjonLCBlcnJvcilcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZW1vdmVkIHN1Y2Nlc3NmdWxseSEnKVxyXG4gICAgICAgICAgfX0pXHJcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9kb3dudm90ZXMnKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgZm9sbG93OiBmdW5jdGlvbiAodG9waWNJZCwgdWlkKSB7XHJcbiAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLmNoaWxkKCdoaXN0b3J5JykuY2hpbGQodWlkKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSlcclxuICAgICAgICAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLmNoaWxkKCdjb3VudCcpKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgaWYgKGRhdGEudmFsdWUgPT09IG51bGwgfHwgZGF0YS52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKS5jaGlsZCgnY291bnQnKS5zZXQoMSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKS5jaGlsZCgnY291bnQnKS5zZXQoZGF0YS4kdmFsdWUgKyAxKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgdW5mb2xsb3c6IGZ1bmN0aW9uICh0b3BpY0lkLCB1aWQpIHtcclxuICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykuY2hpbGQoJ2hpc3RvcnknKS5jaGlsZCh1aWQpLnJlbW92ZShmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3I6JywgZXJyb3IpXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVtb3ZlZCBzdWNjZXNzZnVsbHkhJylcclxuICAgICAgICAgICAgJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKS5jaGlsZCgnY291bnQnKSkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykuY2hpbGQoJ2NvdW50Jykuc2V0KGRhdGEuJHZhbHVlIC0gMSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH19KVxyXG4gICAgICAgIHJldHVybiByZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJylcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGdldFZpZXdzOiBmdW5jdGlvbiAodG9waWNJZCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICByZWY6IHJlZi5jaGlsZCh0b3BpY0lkKS5jaGlsZCgndmlld3MnKSxcclxuICAgICAgICAgIG9iajogJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkKS5jaGlsZCgndmlld3MnKSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBsYXRlc3RGZWVkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5vcmRlckJ5Q2hpbGQoJ2NyZWF0ZWQnKS5saW1pdFRvTGFzdCgxMCkpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICB0b3BpY3NCeVRhZzogZnVuY3Rpb24gKHRhZykge1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYub3JkZXJCeUNoaWxkKCd0YWdzJykuZXF1YWxUbyh0YWcpKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gUmV0dXJuIGFycmF5XHJcbiAgICAgIGFycjogJGZpcmViYXNlQXJyYXkocmVmKSxcclxuXHJcbiAgICAgIGFsbDogdG9waWNzLFxyXG4gICAgICByZWY6IHJlZlxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gVG9waWNzXHJcblxyXG4gIH0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmNvbnRyb2xsZXIoJ1Byb2ZpbGVDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkc3RhdGUsICRmaWx0ZXIsIG1kNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9TZXJ2aWNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBdXRoLFVzZXJzLFRvcGljcywgRmFjZWJvb2ssbm90aWZ5LENhdGVTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1Jlc29sdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZmlsZSxpc093bmVyLHVzZXJQb3N0cyl7XG4gICAgdmFyIHByb2ZpbGVDdHJsID0gdGhpcztcblxuICAgIC8vUGFyc2VyXG4gICAgcHJvZmlsZUN0cmwucHJvZmlsZSAgID0gcHJvZmlsZTtcbiAgICBwcm9maWxlQ3RybC5hdXRoICAgICAgPSBBdXRoO1xuICAgIHByb2ZpbGVDdHJsLnVzZXJzICAgICA9IFVzZXJzO1xuICAgIHByb2ZpbGVDdHJsLnRvcGljcyAgICA9IFRvcGljcztcbiAgICBwcm9maWxlQ3RybC5mYWNlYm9vayAgPSBGYWNlYm9vaztcbiAgICBwcm9maWxlQ3RybC5pc093bmVyICAgPSBpc093bmVyO1xuICAgIHByb2ZpbGVDdHJsLmNhdGUgICAgICA9IENhdGVTZXJ2aWNlO1xuICAgIHByb2ZpbGVDdHJsLiRzdGF0ZSAgICA9ICRzdGF0ZTtcbiAgICBwcm9maWxlQ3RybC51c2VyUG9zdHMgPSB1c2VyUG9zdHM7XG5cbiAgICBwcm9maWxlQ3RybC51c2VyRmVlZCAgPSAnJztcbiAgICBwcm9maWxlQ3RybC5mZWVkID0gJyc7XG5cbiAgICBwcm9maWxlQ3RybC5lZGl0SW5pdCA9ICd1c2VyRWRpdCc7XG5cbiAgICBwcm9maWxlQ3RybC5uYW1lRXhpc3Q9IGZhbHNlO1xuXG5cbiAgICBwcm9maWxlQ3RybC5nZXRVc2VyUG9zdCA9IGZ1bmN0aW9uKHVpZCl7XG4gICAgICBwcm9maWxlQ3RybC5mZWVkID0gcHJvZmlsZUN0cmwudG9waWNzLmNyZWF0ZWRCeSh1aWQpO1xuICAgIH1cblxuXG5cbiAgICAvKkxpbmsgYWNjb3VudCB3aXRoIGZhY2Vib29rKi9cbiAgICBwcm9maWxlQ3RybC5saW5rRmFjZWJvb2sgPSBmdW5jdGlvbigpe1xuICAgICAgcHJvZmlsZUN0cmwuZmFjZWJvb2subG9naW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgcHJvZmlsZUN0cmwuZmFjZWJvb2suZ2V0TG9naW5TdGF0dXMoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gJ2Nvbm5lY3RlZCcpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2dnZWRJbiA9IHRydWU7XG4gICAgICAgICAgICBwcm9maWxlQ3RybC5mYWNlYm9vay5hcGkoJy9tZScsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm90IGxvZ2dlZCBpblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvL1RoZSBvcmlnaW5hbCB2YWx1ZSBmcm9tIHByb2ZpbGVcbiAgICBwcm9maWxlQ3RybC5vbGRQcm9maWxlVmFsdWUgPSBwcm9maWxlQ3RybC5wcm9maWxlO1xuXG5cbiAgICBwcm9maWxlQ3RybC51c2VyQ3JlYXRlZCA9IGZ1bmN0aW9uKHVpZCl7XG4gICAgICByZXR1cm4gcHJvZmlsZUN0cmwudG9waWNzLmNyZWF0ZWRCeSh1aWQpO1xuICAgIH1cblxuXG4gICAgLy9QcmVzZXQgUGFyYW1ldGVyc1xuICAgIHByb2ZpbGVDdHJsLmltYWdlU3RyaW5ncyAgICA9IFtdO1xuICAgIHByb2ZpbGVDdHJsLnVzZXJDYXRlRm9sbG93ICA9IFtdO1xuICAgIHByb2ZpbGVDdHJsLmNhdGVJc0ZvbGxvdyAgICA9IFtdO1xuICAgIHByb2ZpbGVDdHJsLmZvbGxvd0xpc3QgICAgICA9ICcnO1xuXG5cblxuXG5cbiAgICBwcm9maWxlQ3RybC5mb2xsb3dDYXRlTGlzdEFyciA9IGZ1bmN0aW9uKHVpZCl7XG4gICAgICBwcm9maWxlQ3RybC5mb2xsb3dMaXN0ID0gcHJvZmlsZUN0cmwuY2F0ZS5mb2xsb3dMaXN0KHVpZCk7XG4gICAgfVxuXG4gICAgaWYoQXV0aC5yZWYuZ2V0QXV0aCgpKXtcbiAgICAgIHByb2ZpbGVDdHJsLmZvbGxvd0NhdGVMaXN0QXJyKEF1dGgucmVmLmdldEF1dGgoKS51aWQpO1xuICAgIH1cblxuICAgIHByb2ZpbGVDdHJsLmZvbGxvd0NhdGUgPSBmdW5jdGlvbihpbmRleCxjYXRlX3NsdWcpe1xuICAgICAgcHJvZmlsZUN0cmwuY2F0ZUlzRm9sbG93W2luZGV4XSAgPSB0cnVlO1xuICAgICAgcHJvZmlsZUN0cmwuY2F0ZS5hZGRDaGlsZChjYXRlX3NsdWcrJy9mb2xsb3dlcicpXG4gICAgICAgIC5jaGlsZChBdXRoLnJlZi5nZXRBdXRoKCkudWlkKS5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xuICAgIH1cblxuXG5cblxuXG4gICAgLy9VcGxvYWQgUHJvZmlsZSBpbWFnZVxuICAgIHByb2ZpbGVDdHJsLnVwbG9hZEZpbGUgPSBmdW5jdGlvbihmaWxlcykge1xuICAgICAgYW5ndWxhci5mb3JFYWNoKGZpbGVzLCBmdW5jdGlvbiAoZmxvd0ZpbGUsIGkpIHtcbiAgICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgIHZhciB1cmkgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgIHByb2ZpbGVDdHJsLmltYWdlU3RyaW5nc1tpXSA9IHVyaTtcbiAgICAgICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnVwZGF0ZSh7XCJwaG90b1wiOiB1cml9KVxuICAgICAgICAgIG5vdGlmeSh7bWVzc2FnZTonU2F2ZWQnLHBvc2l0aW9uOidjZW50ZXInLGR1cmF0aW9uOiAzMDAwIH0pO1xuICAgICAgICB9O1xuICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0RhdGFVUkwoZmxvd0ZpbGUuZmlsZSk7XG4gICAgICB9KVxuICAgIH07XG5cblxuICAgIC8vU2F2ZSBwcm9maWxlIHdpdGggcHJvZmlsZUN0cmwucHJvZmlsZVxuICAgIC8vcGFyYW1zOiByZWRpcmVjdCwgaWYgZXhpc3QgdGhlbiByZWRpcmVjdCBhZnRlciBzYXZlXG4gICAgcHJvZmlsZUN0cmwuc2F2ZVByb2ZpbGUgPSBmdW5jdGlvbihyZWRpcmVjdCl7XG4gICAgICBwcm9maWxlQ3RybC5wcm9maWxlLnVwZGF0ZWQgPSBtb21lbnQoKS50b0lTT1N0cmluZygpO1xuXG5cbiAgICAgIGlmKHByb2ZpbGVDdHJsLmxvY2F0aW9uICE9PSBudWxsICkge1xuICAgICAgICBsb2NhdGlvbkRldGFpbCA9IHtcbiAgICAgICAgICBwbGFjZV9pZDogcHJvZmlsZUN0cmwubG9jYXRpb24uZGV0YWlscy5wbGFjZV9pZCxcbiAgICAgICAgICBuYW1lOiBwcm9maWxlQ3RybC5sb2NhdGlvbi5kZXRhaWxzLm5hbWUsXG4gICAgICAgICAgYWRkcmVzczogcHJvZmlsZUN0cmwubG9jYXRpb24uZGV0YWlscy5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICBsYXQ6IHByb2ZpbGVDdHJsLmxvY2F0aW9uLmRldGFpbHMuZ2VvbWV0cnkubG9jYXRpb24ubGF0KCksXG4gICAgICAgICAgbG5nOiBwcm9maWxlQ3RybC5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxuICAgICAgICB9XG5cbiAgICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS51c2VyTG9jYXRpb24gPSBsb2NhdGlvbkRldGFpbDtcbiAgICAgIH1cblxuICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS4kc2F2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vdGlmeSh7bWVzc2FnZTonU2F2ZWQnLHBvc2l0aW9uOidjZW50ZXInLGR1cmF0aW9uOiAzMDAwIH0pO1xuICAgICAgICBpZihyZWRpcmVjdCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAkc3RhdGUuZ28ocmVkaXJlY3QpO1xuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuICAgICAgICBub3RpZnkoe21lc3NhZ2U6J0Vycm9yIHNhdmluZyBkYXRhJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy9VcGRhdGUgbmFtZVxuICAgIHByb2ZpbGVDdHJsLnVwZGF0ZU5hbWUgPSBmdW5jdGlvbigpe1xuXG4gICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnVwZGF0ZShcbiAgICAgICAge1xuICAgICAgICAgIFwiZmlyc3RuYW1lXCI6ICBwcm9maWxlQ3RybC5wcm9maWxlLmZpcnN0bmFtZSxcbiAgICAgICAgICBcImxhc3RuYW1lXCI6ICAgcHJvZmlsZUN0cmwucHJvZmlsZS5sYXN0bmFtZSxcbiAgICAgICAgfVxuICAgICAgKVxuXG4gICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQrJy9sb2cnKS5wdXNoKCkuc2V0KHtcbiAgICAgICAgYWN0aW9uOiAgIFwibmFtZV9jaGFuZ2VcIixcbiAgICAgICAgb2xkbmFtZTogIHByb2ZpbGVDdHJsLm9sZFByb2ZpbGVWYWx1ZS5maXJzdG5hbWUgKyBcIi1cIiArIHByb2ZpbGVDdHJsLm9sZFByb2ZpbGVWYWx1ZS5sYXN0bmFtZSxcbiAgICAgICAgY3JlYXRlZDogIG1vbWVudCgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH0pO1xuXG4gICAgICBub3RpZnkoe21lc3NhZ2U6J1NhdmVkJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICB9XG5cblxuICAgIC8vVXBkYXRlIEJpb1xuICAgIHByb2ZpbGVDdHJsLnVwZGF0ZUJpbyA9IGZ1bmN0aW9uKCl7XG4gICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnVwZGF0ZSh7XCJiaW9ncmFwaHlcIjogcHJvZmlsZUN0cmwucHJvZmlsZS5iaW9ncmFwaHl9KVxuXG4gICAgICBub3RpZnkoe21lc3NhZ2U6J1NhdmVkJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICB9XG5cblxuICAgIHByb2ZpbGVDdHJsLnVwZGF0ZVByb2ZpbGUgPSBmdW5jdGlvbigpe1xuICAgICAgLy9wcm9maWxlQ3RybC5wcm9maWxlLmVtYWlsSGFzaCA9IG1kNS5jcmVhdGVIYXNoKGF1dGgucGFzc3dvcmQuZW1haWwpO1xuICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS4kc2F2ZSgpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQnKTtcbiAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIC8vQ2hlY2sgaWYgdXNlciBleGlzdCwgcmV0dXJuIGZhbHNlIGlmIHRoZXkgZG9cbiAgICBwcm9maWxlQ3RybC5jaGVja1VzZXJuYW1lID0gZnVuY3Rpb24oKXtcblxuICAgICAgcHJvZmlsZUN0cmwudXNlcnMuY2hlY2tVc2VybmFtZUV4aXN0KHByb2ZpbGVDdHJsLnByb2ZpbGUuZGlzcGxheU5hbWUpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgaWYoc25hcHNob3QudmFsKCkgIT09IG51bGwpe1xuICAgICAgICAgIHJldHVybiBwcm9maWxlQ3RybC5uYW1lRXhpc3Q9dHJ1ZTtcbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgIHJldHVybiBwcm9maWxlQ3RybC5uYW1lRXhpc3Q9ZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5mYWN0b3J5KCdVc2VycycsIGZ1bmN0aW9uICgkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBGaXJlYmFzZVVybCwgJGh0dHApIHtcclxuICAgIHZhciB1c2Vyc1JlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCArICd1c2VycycpXHJcbiAgICB2YXIgdXNlcnMgPSAkZmlyZWJhc2VBcnJheSh1c2Vyc1JlZilcclxuXHJcbiAgICB2YXIgVXNlcnMgPSB7XHJcbiAgICAgIGdldExvY2F0aW9uSVA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgdXJsOiAnaHR0cDovL2lwaW5mby5pby9qc29uJyxcclxuICAgICAgICAgIG1ldGhvZDogJ0dFVCdcclxuICAgICAgICB9KVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgZ2V0TG9jYXRpb25JUERhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgdXJsOiAnaHR0cDovL2lwaW5mby5pby9qc29uJyxcclxuICAgICAgICAgIG1ldGhvZDogJ0dFVCdcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICByZXR1cm4gZGF0YS5kYXRhXHJcbiAgICAgICAgfSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHByb2ZpbGU6IGZ1bmN0aW9uKHVpZCl7XHJcbiAgICAgICAgcmV0dXJuIHVzZXJzLiRnZXRSZWNvcmQodWlkKTtcclxuICAgICAgfSxcclxuXHJcblxyXG4gICAgICAvL1NlYXJjaCBhbmQgcmV0dXJuIHVzZXJuYW1lXHJcbiAgICAgIGdldFByb2ZpbGVCeVVzZXJuYW1lOmZ1bmN0aW9uKHVzZXJuYW1lKXtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkodXNlcnNSZWYub3JkZXJCeUNoaWxkKCdkaXNwbGF5TmFtZScpLmVxdWFsVG8odXNlcm5hbWUpKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vQ2hlY2sgaWYgdXNlcm5hbWUgZXhpc3QsIGlmIG5vdCByZXR1cm4gbnVsbFxyXG4gICAgICBjaGVja1VzZXJuYW1lRXhpc3Q6ZnVuY3Rpb24odXNlcm5hbWUpe1xyXG4gICAgICAgIHJldHVybiB1c2Vyc1JlZi5vcmRlckJ5Q2hpbGQoJ2Rpc3BsYXlOYW1lJykuZXF1YWxUbyh1c2VybmFtZSk7XHJcbiAgICAgIH0sXHJcblxyXG5cclxuICAgICAgZ2V0UHJvZmlsZTogZnVuY3Rpb24gKHVpZCkge1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QodXNlcnNSZWYuY2hpbGQodWlkKSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGdldERpc3BsYXlOYW1lOiBmdW5jdGlvbiAodWlkKSB7XHJcbiAgICAgICAgaWYgKHVpZCAhPT0gbnVsbCB8fCB1aWQgIT09ICcnKSB7XHJcbiAgICAgICAgICByZXR1cm4gdXNlcnMuJGdldFJlY29yZCh1aWQpLmRpc3BsYXlOYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vR2V0IHVzZXIgRm9sbG93ZXJzXHJcbiAgICAgIGdldEZvbGxvd2VyOmZ1bmN0aW9uKHVpZCl7XHJcbiAgICAgICAgcmV0dXJuIHVzZXJzUmVmLmNoaWxkKHVpZCsnL3N0YXQvZm9sbG93ZXIvdWlkJyk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvL0NoZWNrIGlmIHVzZXIgaXMgYWxyZWFkeSBmb2xsb3dpbmdcclxuICAgICAgY2hlY2tGb2xsb3c6ZnVuY3Rpb24odWlkLGZvbGxvd19pZCl7XHJcblxyXG4gICAgICAgIHZhciBmb2xsb3c9ZmFsc2U7XHJcbiAgICAgICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsndXNlcnMvJyt1aWQrJy9zdGF0L2ZvbGxvd2luZy91aWQvJytmb2xsb3dfaWQpO1xyXG4gICAgICAgIHJlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcclxuICAgICAgICAgIGZvbGxvdyA9IHNuYXBzaG90LmV4aXN0cygpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgcmV0dXJuIGZvbGxvdztcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vQ2hhbmdlIHBhc3N3b3JkXHJcbiAgICAgIHVzZXJDaGFuZ2VQYXNzd29yZDpmdW5jdGlvbihlbWFpbCxvbGRwYXNzLG5ld3Bhc3Mpe1xyXG5cclxuICAgICAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKTtcclxuICAgICAgICByZWYuY2hhbmdlUGFzc3dvcmQoe1xyXG4gICAgICAgICAgZW1haWw6IGVtYWlsLFxyXG4gICAgICAgICAgb2xkUGFzc3dvcmQ6IG9sZHBhc3MsXHJcbiAgICAgICAgICBuZXdQYXNzd29yZDogbmV3cGFzc1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChlcnJvci5jb2RlKSB7XHJcbiAgICAgICAgICAgICAgY2FzZSBcIklOVkFMSURfUEFTU1dPUkRcIjpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlIHNwZWNpZmllZCB1c2VyIGFjY291bnQgcGFzc3dvcmQgaXMgaW5jb3JyZWN0LlwiKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIGNhc2UgXCJJTlZBTElEX1VTRVJcIjpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlIHNwZWNpZmllZCB1c2VyIGFjY291bnQgZG9lcyBub3QgZXhpc3QuXCIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3IgY2hhbmdpbmcgcGFzc3dvcmQ6XCIsIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVc2VyIHBhc3N3b3JkIGNoYW5nZWQgc3VjY2Vzc2Z1bGx5IVwiKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHVzZXJSZWY6IGZ1bmN0aW9uICh1aWQpIHtcclxuICAgICAgICByZXR1cm4gdXNlcnNSZWYuY2hpbGQodWlkKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgdXB2b3RlczogZnVuY3Rpb24gKHVpZCkge1xyXG4gICAgICAgIHJldHVybiB1c2Vyc1JlZi5jaGlsZCh1aWQpLmNoaWxkKCd1cHZvdGVzJylcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGRvd252b3RlczogZnVuY3Rpb24gKHVpZCkge1xyXG4gICAgICAgIHJldHVybiB1c2Vyc1JlZi5jaGlsZCh1aWQpLmNoaWxkKCdkb3dudm90ZXMnKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy9Vc2VyIGZvbGxvd2luZyB0b3BpY1xyXG4gICAgICBmb2xsb3dpbmc6IGZ1bmN0aW9uICh1aWQpIHtcclxuICAgICAgICByZXR1cm4gdXNlcnNSZWYuY2hpbGQodWlkKS5jaGlsZCgnZm9sbG93aW5nJylcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHVzZXJBcnJSZWY6IGZ1bmN0aW9uICh1aWQpIHtcclxuICAgICAgICByZXR1cm4gdXNlcnNSZWYuY2hpbGQodWlkKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgYWxsOiB1c2Vyc1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBVc2Vyc1xyXG4gIH0pXHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5mYWN0b3J5KCdVbmlxdWVJREdlbmVyYXRvcicsIGZ1bmN0aW9uKCl7ICBcclxuICAgIC8qKlxyXG4gICAgICogRmFuY3kgSUQgZ2VuZXJhdG9yIHRoYXQgY3JlYXRlcyAyMC1jaGFyYWN0ZXIgc3RyaW5nIGlkZW50aWZpZXJzIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG4gICAgICpcclxuICAgICAqIDEuIFRoZXkncmUgYmFzZWQgb24gdGltZXN0YW1wIHNvIHRoYXQgdGhleSBzb3J0ICphZnRlciogYW55IGV4aXN0aW5nIGlkcy5cclxuICAgICAqIDIuIFRoZXkgY29udGFpbiA3Mi1iaXRzIG9mIHJhbmRvbSBkYXRhIGFmdGVyIHRoZSB0aW1lc3RhbXAgc28gdGhhdCBJRHMgd29uJ3QgY29sbGlkZSB3aXRoIG90aGVyIGNsaWVudHMnIElEcy5cclxuICAgICAqIDMuIFRoZXkgc29ydCAqbGV4aWNvZ3JhcGhpY2FsbHkqIChzbyB0aGUgdGltZXN0YW1wIGlzIGNvbnZlcnRlZCB0byBjaGFyYWN0ZXJzIHRoYXQgd2lsbCBzb3J0IHByb3Blcmx5KS5cclxuICAgICAqIDQuIFRoZXkncmUgbW9ub3RvbmljYWxseSBpbmNyZWFzaW5nLiAgRXZlbiBpZiB5b3UgZ2VuZXJhdGUgbW9yZSB0aGFuIG9uZSBpbiB0aGUgc2FtZSB0aW1lc3RhbXAsIHRoZVxyXG4gICAgICogICAgbGF0dGVyIG9uZXMgd2lsbCBzb3J0IGFmdGVyIHRoZSBmb3JtZXIgb25lcy4gIFdlIGRvIHRoaXMgYnkgdXNpbmcgdGhlIHByZXZpb3VzIHJhbmRvbSBiaXRzXHJcbiAgICAgKiAgICBidXQgXCJpbmNyZW1lbnRpbmdcIiB0aGVtIGJ5IDEgKG9ubHkgaW4gdGhlIGNhc2Ugb2YgYSB0aW1lc3RhbXAgY29sbGlzaW9uKS5cclxuICAgICAqL1xyXG4gICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgIGdlbmVyYXRlUHVzaElEOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgLy8gTW9kZWxlZCBhZnRlciBiYXNlNjQgd2ViLXNhZmUgY2hhcnMsIGJ1dCBvcmRlcmVkIGJ5IEFTQ0lJLlxyXG4gICAgICAgICAgICB2YXIgUFVTSF9DSEFSUyA9ICctMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaX2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6JztcclxuXHJcbiAgICAgICAgICAgIC8vIFRpbWVzdGFtcCBvZiBsYXN0IHB1c2gsIHVzZWQgdG8gcHJldmVudCBsb2NhbCBjb2xsaXNpb25zIGlmIHlvdSBwdXNoIHR3aWNlIGluIG9uZSBtcy5cclxuICAgICAgICAgICAgdmFyIGxhc3RQdXNoVGltZSA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBXZSBnZW5lcmF0ZSA3Mi1iaXRzIG9mIHJhbmRvbW5lc3Mgd2hpY2ggZ2V0IHR1cm5lZCBpbnRvIDEyIGNoYXJhY3RlcnMgYW5kIGFwcGVuZGVkIHRvIHRoZVxyXG4gICAgICAgICAgICAvLyB0aW1lc3RhbXAgdG8gcHJldmVudCBjb2xsaXNpb25zIHdpdGggb3RoZXIgY2xpZW50cy4gIFdlIHN0b3JlIHRoZSBsYXN0IGNoYXJhY3RlcnMgd2VcclxuICAgICAgICAgICAgLy8gZ2VuZXJhdGVkIGJlY2F1c2UgaW4gdGhlIGV2ZW50IG9mIGEgY29sbGlzaW9uLCB3ZSdsbCB1c2UgdGhvc2Ugc2FtZSBjaGFyYWN0ZXJzIGV4Y2VwdFxyXG4gICAgICAgICAgICAvLyBcImluY3JlbWVudGVkXCIgYnkgb25lLlxyXG4gICAgICAgICAgICB2YXIgbGFzdFJhbmRDaGFycyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgLy8gcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgICB2YXIgZHVwbGljYXRlVGltZSA9IChub3cgPT09IGxhc3RQdXNoVGltZSk7XHJcbiAgICAgICAgICAgICAgbGFzdFB1c2hUaW1lID0gbm93O1xyXG5cclxuICAgICAgICAgICAgICB2YXIgdGltZVN0YW1wQ2hhcnMgPSBuZXcgQXJyYXkoOCk7XHJcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDc7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lU3RhbXBDaGFyc1tpXSA9IFBVU0hfQ0hBUlMuY2hhckF0KG5vdyAlIDY0KTtcclxuICAgICAgICAgICAgICAgIC8vIE5PVEU6IENhbid0IHVzZSA8PCBoZXJlIGJlY2F1c2UgamF2YXNjcmlwdCB3aWxsIGNvbnZlcnQgdG8gaW50IGFuZCBsb3NlIHRoZSB1cHBlciBiaXRzLlxyXG4gICAgICAgICAgICAgICAgbm93ID0gTWF0aC5mbG9vcihub3cgLyA2NCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChub3cgIT09IDApIHRocm93IG5ldyBFcnJvcignV2Ugc2hvdWxkIGhhdmUgY29udmVydGVkIHRoZSBlbnRpcmUgdGltZXN0YW1wLicpO1xyXG5cclxuICAgICAgICAgICAgICB2YXIgaWQgPSB0aW1lU3RhbXBDaGFycy5qb2luKCcnKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCFkdXBsaWNhdGVUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICBsYXN0UmFuZENoYXJzW2ldID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNjQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgdGltZXN0YW1wIGhhc24ndCBjaGFuZ2VkIHNpbmNlIGxhc3QgcHVzaCwgdXNlIHRoZSBzYW1lIHJhbmRvbSBudW1iZXIsIGV4Y2VwdCBpbmNyZW1lbnRlZCBieSAxLlxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMTE7IGkgPj0gMCAmJiBsYXN0UmFuZENoYXJzW2ldID09PSA2MzsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgIGxhc3RSYW5kQ2hhcnNbaV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGFzdFJhbmRDaGFyc1tpXSsrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWQgKz0gUFVTSF9DSEFSUy5jaGFyQXQobGFzdFJhbmRDaGFyc1tpXSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmKGlkLmxlbmd0aCAhPSAyMCkgdGhyb3cgbmV3IEVycm9yKCdMZW5ndGggc2hvdWxkIGJlIDIwLicpO1xyXG5cclxuICAgICAgICAgICAgICByZXR1cm4gaWQ7XHJcbiAgICAgICAgICAgIC8vIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgfSkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
