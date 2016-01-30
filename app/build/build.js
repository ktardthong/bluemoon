'use strict';

/**
 * Main module of the application.
 */
var app = angular.module('App', [
    'firebase',
    'angular-md5', // Encrypt email
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
          },
          'header@dashboard': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }
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
          },
          'header@follow_cates': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguY29udHJvbGxlci5qcyIsImF1dGguc2VydmljZS5qcyIsImNhdGVnb3J5LmNvbnRyb2xsZXIuanMiLCJjYXRlZ29yeS5zZXJ2aWNlLmpzIiwicG9zdC5zZXJ2aWNlLmpzIiwiZGFzaGJvYXJkLmNvbnRyb2xsZXIuanMiLCJkaXJlY3RpdmVzLmpzIiwiaG9tZS5jb250cm9sbGVyLmpzIiwibGFuZy5qcyIsIm5vdGlmaWNhdGlvbi5jb250cm9sbGVyLmpzIiwibm90aWZpY2F0aW9uLnNlcnZpY2UuanMiLCJwbGFjZS5jb250cm9sbGVyLmpzIiwicGxhY2Uuc2VydmljZS5qcyIsInV0aWxpdGllcy5zZXJ2aWNlLmpzIiwidGFnLmNvbnRyb2xsZXIuanMiLCJ0YWcuc2VydmljZS5qcyIsInRvcGljLWxhbmRpbmcuY29udHJvbGxlci5qcyIsInRvcGljcy5jb250cm9sbGVyLmpzIiwidG9waWNzLnNlcnZpY2UuanMiLCJwcm9maWxlLmNvbnRyb2xsZXIuanMiLCJ1c2Vycy5zZXJ2aWNlLmpzIiwiaGVscGVycy5zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQUtBLElBQUEsTUFBQSxRQUFBLE9BQUEsT0FBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBOzs7SUFHQTtJQUNBO0lBQ0E7O0lBRUE7SUFDQTs7OztHQUlBLDhCQUFBLFVBQUEsb0JBQUE7SUFDQSxtQkFBQSxjQUFBLFNBQUE7TUFDQSxNQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO01BQ0EsUUFBQTtNQUNBLFFBQUE7TUFDQSxRQUFBO01BQ0EsUUFBQTtNQUNBLHdCQUFBOztNQUVBLHNCQUFBLENBQUEsTUFBQTtRQUNBLE9BQUEsT0FBQSxPQUFBO01BQ0EsdUJBQUE7O0lBRUEsbUJBQUEsTUFBQTtPQUNBLGVBQUE7Ozs7R0FJQTt5QkFDQSxVQUFBLGtCQUFBO01BQ0EsSUFBQSxVQUFBO01BQ0EsaUJBQUEsU0FBQTtNQUNBLGlCQUFBLEtBQUE7Ozs7O0dBS0EsOEJBQUEsVUFBQSxvQkFBQTtJQUNBLG1CQUFBLGtCQUFBOztJQUVBLG1CQUFBLHlCQUFBOzs7OztHQUtBLGdEQUFBLFVBQUEsZ0JBQUEsb0JBQUE7SUFDQTtPQUNBLE1BQUEsUUFBQTtRQUNBLEtBQUE7UUFDQSxPQUFBO1VBQ0EsSUFBQTtZQUNBLFlBQUE7WUFDQSxhQUFBO1lBQ0EsU0FBQTtjQUNBLGtDQUFBLFVBQUEsUUFBQSxNQUFBO2dCQUNBLE9BQUEsS0FBQSxLQUFBLGVBQUEsS0FBQSxVQUFBLE1BQUE7a0JBQ0EsT0FBQSxHQUFBO21CQUNBLFVBQUEsT0FBQTtrQkFDQSxPQUFBOzs7Y0FHQSxpQkFBQSxVQUFBLFFBQUE7Z0JBQ0EsT0FBQSxPQUFBOzs7O1VBSUEsbUJBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTs7Ozs7OztPQU9BLE1BQUEsWUFBQTtRQUNBLEtBQUE7UUFDQSxPQUFBO1VBQ0EsSUFBQTtZQUNBLFlBQUE7WUFDQSxhQUFBO1lBQ0EsU0FBQTtjQUNBLGlCQUFBLFVBQUEsUUFBQTtnQkFDQSxPQUFBLE9BQUE7Ozs7Ozs7OztPQVNBLE1BQUEsWUFBQTtRQUNBLEtBQUE7UUFDQSxPQUFBO1VBQ0EsSUFBQTtZQUNBLFlBQUE7WUFDQSxhQUFBO1lBQ0EsU0FBQTs7Y0FFQSx1Q0FBQSxVQUFBLGNBQUEsVUFBQTtnQkFDQSxPQUFBLFNBQUEsUUFBQSxhQUFBLE1BQUE7OztjQUdBLHVDQUFBLFVBQUEsY0FBQSxRQUFBO2dCQUNBLE9BQUEsT0FBQSxLQUFBLGFBQUE7Ozs7Ozs7OztPQVNBLE1BQUEsVUFBQTtRQUNBLEtBQUE7UUFDQSxPQUFBO1VBQ0EsaUJBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTs7VUFFQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7WUFDQSxTQUFBO2NBQ0EscUVBQUEsVUFBQSxRQUFBLFFBQUEsY0FBQSxnQkFBQTtnQkFDQSxJQUFBO2dCQUNBLE9BQUEsWUFBQSxhQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsVUFBQTtrQkFDQSxPQUFBLFNBQUE7a0JBQ0EsUUFBQSxJQUFBLFNBQUE7O2dCQUVBLE9BQUE7Ozs7Ozs7Ozs7T0FVQSxNQUFBLE9BQUE7UUFDQSxLQUFBO1FBQ0EsT0FBQTtVQUNBLGNBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTs7VUFFQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7WUFDQSxTQUFBO2NBQ0EsMEJBQUEsVUFBQSxjQUFBO2dCQUNBLE9BQUEsYUFBQTs7O2NBR0EsK0NBQUEsVUFBQSxRQUFBLGNBQUEsTUFBQTtnQkFDQSxJQUFBLE1BQUEsYUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0JBeUNBLE9BQUEsT0FBQSxZQUFBOzs7Ozs7Ozs7OztPQVdBLE1BQUEsU0FBQTtRQUNBLEtBQUE7UUFDQSxTQUFBOzs7Ozs7OztRQVFBLE9BQUE7VUFDQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7WUFDQSxTQUFBO2NBQ0EscURBQUEsVUFBQSxNQUFBLE9BQUEsY0FBQSxRQUFBO2dCQUNBLElBQUEsV0FBQTs7Z0JBRUEsSUFBQSxLQUFBLElBQUEsV0FBQTtrQkFDQSxPQUFBLE9BQUEsU0FBQSxhQUFBLE1BQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTtvQkFDQSxJQUFBLEtBQUEsTUFBQSxNQUFBO3NCQUNBLFdBQUEsS0FBQSxHQUFBO3NCQUNBLElBQUEsS0FBQSxJQUFBLFVBQUEsT0FBQSxVQUFBO3dCQUNBLE9BQUE7NkJBQ0E7d0JBQ0EsT0FBQTs7Ozt1QkFJQTtrQkFDQSxPQUFBOzs7Y0FHQSx5Q0FBQSxVQUFBLGNBQUEsUUFBQTtnQkFDQSxPQUFBLE9BQUEsU0FBQSxhQUFBLE1BQUE7O2NBRUEsZ0RBQUEsVUFBQSxjQUFBLFFBQUEsUUFBQTtnQkFDQSxJQUFBLFdBQUE7Z0JBQ0EsT0FBQSxPQUFBLFNBQUEsYUFBQSxNQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7a0JBQ0EsSUFBQSxLQUFBLE1BQUEsTUFBQTtvQkFDQSxXQUFBLEtBQUEsR0FBQTt5QkFDQTtvQkFDQSxPQUFBLEdBQUE7O2tCQUVBLE9BQUEsT0FBQSxVQUFBOzs7Y0FHQSxzREFBQSxVQUFBLGNBQUEsUUFBQSxPQUFBLE1BQUE7Z0JBQ0EsSUFBQSxVQUFBO2dCQUNBLElBQUEsT0FBQSxTQUFBO2dCQUNBLElBQUEsYUFBQSxDQUFBLFVBQUEsSUFBQSxXQUFBO2dCQUNBLE1BQUEsZ0JBQUEsUUFBQSxVQUFBLE1BQUE7a0JBQ0EsV0FBQSxTQUFBLEtBQUE7bUJBQ0EsS0FBQSxVQUFBLE1BQUE7a0JBQ0EsV0FBQSxTQUFBLEtBQUE7O2dCQUVBLE9BQUEsT0FBQSxlQUFBLGFBQUEsTUFBQSxVQUFBLEtBQUEsVUFBQSxNQUFBO2tCQUNBLElBQUEsS0FBQSxHQUFBLFFBQUEsYUFBQTtvQkFDQSxXQUFBLEtBQUEsR0FBQTtvQkFDQSxRQUFBLE9BQUEsU0FBQTs7b0JBRUEsTUFBQSxJQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7c0JBQ0EsSUFBQSxLQUFBLFNBQUEsTUFBQTt3QkFDQSxNQUFBLElBQUEsTUFBQSxTQUFBLElBQUE7NkJBQ0E7d0JBQ0EsTUFBQSxJQUFBLE1BQUEsU0FBQSxJQUFBLEtBQUEsUUFBQTs7O29CQUdBLEtBQUEsS0FBQSxlQUFBLEtBQUEsVUFBQSxNQUFBO3NCQUNBLElBQUEsTUFBQSxLQUFBO3NCQUNBLE1BQUEsSUFBQSxNQUFBLFdBQUEsTUFBQSxLQUFBLE9BQUEsSUFBQTtzQkFDQSxNQUFBLFFBQUEsS0FBQSxLQUFBLE1BQUEsU0FBQSxNQUFBLFVBQUEsT0FBQSxJQUFBOzs7a0JBR0EsT0FBQSxNQUFBOzs7Y0FHQSxzQ0FBQSxVQUFBLGNBQUEsUUFBQTtnQkFDQSxPQUFBLE9BQUEsZUFBQSxhQUFBLE1BQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTtrQkFDQSxJQUFBLFdBQUEsS0FBQSxHQUFBO2tCQUNBLE9BQUEsT0FBQSxhQUFBLFVBQUEsSUFBQSxVQUFBLEtBQUEsVUFBQSxPQUFBO29CQUNBLE9BQUE7Ozs7Ozs7Ozs7T0FVQSxNQUFBLGtCQUFBO1FBQ0EsS0FBQTs7OztPQUlBLE1BQUEsV0FBQTtRQUNBLEtBQUE7UUFDQSxPQUFBO1VBQ0EsSUFBQTtZQUNBLFlBQUE7WUFDQSxhQUFBO1lBQ0EsU0FBQTtjQUNBLDJDQUFBLFVBQUEsTUFBQSxPQUFBLGNBQUE7Z0JBQ0EsSUFBQSxLQUFBLElBQUEsV0FBQTtrQkFDQSxPQUFBLE1BQUEscUJBQUEsYUFBQSxNQUFBLFVBQUEsS0FBQSxVQUFBLFNBQUE7b0JBQ0EsSUFBQSxRQUFBLEdBQUEsT0FBQSxLQUFBLElBQUEsVUFBQSxLQUFBO3NCQUNBLE9BQUE7MkJBQ0E7c0JBQ0EsT0FBQTs7O3VCQUdBO2tCQUNBLE9BQUE7OztjQUdBLCtDQUFBLFVBQUEsT0FBQSxRQUFBLGNBQUE7Z0JBQ0EsT0FBQSxNQUFBLHFCQUFBLGFBQUEsTUFBQSxVQUFBLEtBQUEsVUFBQSxTQUFBO2tCQUNBLElBQUEsUUFBQSxHQUFBLFFBQUEsYUFBQTtvQkFDQSxPQUFBLE9BQUEsVUFBQSxRQUFBLEdBQUE7Ozs7Y0FJQSxtRUFBQSxVQUFBLFFBQUEsY0FBQSxZQUFBLE1BQUEsT0FBQTtnQkFDQSxPQUFBLE1BQUEscUJBQUEsYUFBQSxNQUFBLFVBQUEsS0FBQSxVQUFBLFNBQUE7a0JBQ0EsT0FBQTs7Ozs7VUFLQSxrQkFBQTtZQUNBLFlBQUE7WUFDQSxhQUFBOzs7Ozs7OztPQVFBLE1BQUEsZ0JBQUE7UUFDQSxLQUFBO1FBQ0EsT0FBQTtVQUNBLDZCQUFBO1lBQ0EsS0FBQTtZQUNBLGFBQUE7O1VBRUEseUJBQUE7WUFDQSxLQUFBO1lBQ0EsYUFBQTs7VUFFQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7WUFDQSxTQUFBO2NBQ0EsV0FBQSxZQUFBO2dCQUNBLE9BQUE7O2NBRUEsU0FBQSxZQUFBO2dCQUNBLE9BQUE7O2NBRUEsbURBQUEsVUFBQSxRQUFBLFlBQUEsTUFBQSxPQUFBO2dCQUNBLE9BQUEsS0FBQSxLQUFBLGVBQUEsS0FBQSxVQUFBLE1BQUE7a0JBQ0EsT0FBQSxNQUFBLFdBQUEsS0FBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLFNBQUE7b0JBQ0EsSUFBQSxRQUFBLGFBQUE7c0JBQ0EsT0FBQTsyQkFDQTtzQkFDQSxPQUFBLEdBQUE7OzttQkFHQSxVQUFBLE9BQUE7a0JBQ0EsT0FBQSxHQUFBOzs7Y0FHQSxrQ0FBQSxVQUFBLFFBQUEsT0FBQSxNQUFBO2dCQUNBLE9BQUEsS0FBQSxLQUFBLGVBQUEsTUFBQSxZQUFBO2tCQUNBLE9BQUEsR0FBQTs7Ozs7Ozs7T0FRQSxNQUFBLG1CQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7OztPQUdBLE1BQUEsbUJBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTs7Ozs7T0FLQSxNQUFBLGFBQUE7UUFDQSxLQUFBO1FBQ0EsWUFBQTtRQUNBLE9BQUE7VUFDQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7WUFDQSxTQUFBO2NBQ0EsV0FBQSxZQUFBO2dCQUNBLE9BQUE7O2NBRUEsU0FBQSxZQUFBO2dCQUNBLE9BQUE7O2NBRUEsbURBQUEsVUFBQSxRQUFBLFlBQUEsTUFBQSxPQUFBO2dCQUNBLE9BQUEsS0FBQSxLQUFBLGVBQUEsS0FBQSxVQUFBLE1BQUE7a0JBQ0EsT0FBQSxNQUFBLFdBQUEsS0FBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLFNBQUE7O29CQUVBLElBQUEsQ0FBQSxRQUFBLE1BQUE7c0JBQ0EsTUFBQSxRQUFBLEtBQUEsS0FBQSxNQUFBLHNCQUFBLElBQUE7c0JBQ0EsTUFBQSxRQUFBLEtBQUEsS0FBQSxNQUFBLHFCQUFBLElBQUE7c0JBQ0EsTUFBQSxRQUFBLEtBQUEsS0FBQSxNQUFBLHNCQUFBLElBQUE7c0JBQ0EsTUFBQSxRQUFBLEtBQUEsS0FBQSxNQUFBLHVCQUFBLElBQUE7c0JBQ0EsTUFBQSxRQUFBLEtBQUEsS0FBQSxNQUFBLHdCQUFBLElBQUE7Ozs7b0JBSUEsSUFBQSxRQUFBLGFBQUE7c0JBQ0EsT0FBQTsyQkFDQTtzQkFDQSxPQUFBLEdBQUE7OzttQkFHQSxVQUFBLE9BQUE7a0JBQ0EsT0FBQSxHQUFBO2tCQUNBLE9BQUE7OztjQUdBLGtDQUFBLFVBQUEsUUFBQSxPQUFBLE1BQUE7Z0JBQ0EsT0FBQSxLQUFBLEtBQUEsZUFBQSxNQUFBLFlBQUE7a0JBQ0EsT0FBQSxHQUFBOzs7OztVQUtBLG9CQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7Ozs7Ozs7T0FPQSxNQUFBLGdCQUFBO1FBQ0EsS0FBQTtRQUNBLE9BQUE7VUFDQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7WUFDQSxTQUFBO2NBQ0EsV0FBQSxZQUFBO2dCQUNBLE9BQUE7O2NBRUEsU0FBQSxZQUFBO2dCQUNBLE9BQUE7O2NBRUEsMkJBQUEsVUFBQSxPQUFBLE1BQUE7Z0JBQ0EsT0FBQSxLQUFBLEtBQUEsZUFBQSxLQUFBLFVBQUEsTUFBQTtrQkFDQSxPQUFBLE1BQUEsV0FBQSxLQUFBLEtBQUE7OztjQUdBLGtDQUFBLFVBQUEsUUFBQSxPQUFBLE1BQUE7Z0JBQ0EsT0FBQSxLQUFBLEtBQUEsZUFBQSxNQUFBLFlBQUE7a0JBQ0EsT0FBQSxHQUFBOzs7OztVQUtBLHVCQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7Ozs7Ozs7T0FPQSxNQUFBLGVBQUE7UUFDQSxLQUFBO1FBQ0EsT0FBQTtVQUNBLElBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTtZQUNBLFNBQUE7Y0FDQSxXQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7Y0FFQSxTQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7Y0FFQSwyQkFBQSxVQUFBLE9BQUEsTUFBQTtnQkFDQSxPQUFBLEtBQUEsS0FBQSxlQUFBLEtBQUEsVUFBQSxNQUFBO2tCQUNBLE9BQUEsTUFBQSxXQUFBLEtBQUEsS0FBQTs7O2NBR0Esa0NBQUEsVUFBQSxRQUFBLE9BQUEsTUFBQTtnQkFDQSxPQUFBLEtBQUEsS0FBQSxlQUFBLE1BQUEsWUFBQTtrQkFDQSxPQUFBLEdBQUE7Ozs7O1VBS0Esc0JBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTs7Ozs7T0FLQSxNQUFBLFNBQUE7UUFDQSxLQUFBO1FBQ0EsT0FBQTtVQUNBLElBQUE7WUFDQSxhQUFBOztVQUVBLG9CQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7Ozs7O09BS0EsTUFBQSxZQUFBO1FBQ0EsS0FBQTtRQUNBLE9BQUE7VUFDQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7OztRQUdBLFNBQUE7VUFDQSxrQ0FBQSxVQUFBLFFBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxLQUFBLGVBQUEsS0FBQSxVQUFBLE1BQUE7Y0FDQSxPQUFBLEdBQUE7ZUFDQSxVQUFBLE9BQUE7Y0FDQSxPQUFBOzs7Ozs7SUFNQSxtQkFBQSxVQUFBOzs7R0FHQSxPQUFBLGlCQUFBLFlBQUE7SUFDQSxPQUFBLFVBQUEsT0FBQSxPQUFBLFNBQUE7TUFDQSxJQUFBLFdBQUE7TUFDQSxRQUFBLFFBQUEsT0FBQSxVQUFBLE1BQUE7UUFDQSxTQUFBLEtBQUEsS0FBQSxLQUFBLElBQUE7O01BRUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxHQUFBO1FBQ0EsUUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLElBQUEsQ0FBQTs7TUFFQSxJQUFBLFNBQUEsU0FBQTtNQUNBLE9BQUE7Ozs7R0FJQSxPQUFBLGFBQUEsWUFBQTtJQUNBLE9BQUEsVUFBQSxNQUFBO01BQ0EsT0FBQSxPQUFBLFVBQUEsUUFBQTs7Ozs7R0FLQSxPQUFBLGtCQUFBLFVBQUEsTUFBQTtJQUNBLE9BQUEsVUFBQSxNQUFBO01BQ0EsT0FBQSxPQUFBLEtBQUEsWUFBQSxLQUFBLFFBQUEsT0FBQSxZQUFBOzs7O0dBSUEsU0FBQSxlQUFBOztBQUVBLFNBQUEsTUFBQSxNQUFBO0VBQ0EsUUFBQSxJQUFBO0VBQ0EsT0FBQSxLQUFBLFVBQUEsTUFBQSxNQUFBOzs7O0FBSUEsU0FBQSxRQUFBLE1BQUE7RUFDQSxJQUFBLFFBQUEsTUFBQSxVQUFBLE1BQUEsS0FBQSxXQUFBO0VBQ0EsTUFBQSxRQUFBLFVBQUEsR0FBQTtJQUNBLElBQUEsS0FBQSxRQUFBLE9BQUEsVUFBQTtNQUNBLEtBQUEsSUFBQSxLQUFBLEdBQUE7UUFDQSxJQUFBLEVBQUEsZUFBQSxJQUFBO1VBQ0EsS0FBQSxLQUFBLEVBQUE7Ozs7O0VBS0EsT0FBQTs7O0FDM25CQSxRQUFBLE9BQUE7R0FDQSxXQUFBLHdJQUFBLFNBQUEsT0FBQSxNQUFBLE9BQUEsT0FBQSxXQUFBLFdBQUEsWUFBQTttQ0FDQSxZQUFBLGNBQUE7SUFDQSxJQUFBLFdBQUE7OztJQUdBLGNBQUE7T0FDQSxLQUFBLFVBQUEsWUFBQTtRQUNBLFFBQUEsSUFBQTs7OztJQUlBLFNBQUEsV0FBQTtJQUNBLFNBQUEsV0FBQTtJQUNBLFNBQUEsZUFBQTs7O0lBR0EsR0FBQSxLQUFBLElBQUEsYUFBQSxNQUFBO01BQ0EsU0FBQSxXQUFBLFNBQUEsTUFBQSxXQUFBLEtBQUEsSUFBQSxVQUFBOztRQUVBO01BQ0EsU0FBQSxTQUFBOzs7O0lBSUEsU0FBQSxPQUFBO01BQ0EsT0FBQTtNQUNBLFVBQUE7Ozs7Ozs7Ozs7Ozs7O0lBY0EsT0FBQSxtQkFBQSxTQUFBOzs7SUFHQSxTQUFBLGVBQUEsVUFBQTtNQUNBLFNBQUEsYUFBQSxZQUFBLFNBQUEsUUFBQTs7O0lBR0EsU0FBQSxZQUFBLFVBQUE7TUFDQSxRQUFBLElBQUEsZUFBQSxTQUFBLGtCQUFBOzs7O0lBSUEsT0FBQSxPQUFBLFFBQUEsU0FBQSxVQUFBLFVBQUE7TUFDQSxJQUFBLE9BQUEsS0FBQSxTQUFBLEdBQUE7UUFDQSxPQUFBLFdBQUEsZUFBQSxPQUFBOzs7Ozs7SUFNQSxTQUFBLGFBQUEsVUFBQSxTQUFBO01BQ0EsV0FBQSxJQUFBOztNQUVBLFNBQUEsSUFBQSxZQUFBOztNQUVBLEdBQUEsS0FBQSxJQUFBLFVBQUE7UUFDQSxTQUFBLE1BQUEsV0FBQSxLQUFBLElBQUEsVUFBQSxLQUFBLE9BQUEsQ0FBQSxPQUFBOzs7OztJQUtBLEdBQUEsQ0FBQSxTQUFBLFFBQUEsS0FBQTtNQUNBLEdBQUEsU0FBQSxJQUFBLFlBQUE7UUFDQSxTQUFBLFdBQUEsU0FBQSxJQUFBO1dBQ0E7UUFDQSxTQUFBLFdBQUE7OztRQUdBO01BQ0EsU0FBQSxXQUFBLFNBQUEsUUFBQTs7Ozs7SUFLQSxTQUFBLFFBQUEsV0FBQTtNQUNBLFNBQUEsS0FBQSxLQUFBLGtCQUFBLFNBQUEsTUFBQSxLQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsR0FBQTtTQUNBLFVBQUEsTUFBQTtRQUNBLFNBQUEsUUFBQTs7Ozs7SUFLQSxTQUFBLFNBQUEsVUFBQTtNQUNBLEtBQUEsS0FBQTtNQUNBLE9BQUEsR0FBQTs7OztJQUlBLFNBQUEsV0FBQSxXQUFBO01BQ0EsS0FBQSxLQUFBLFlBQUEsU0FBQSxNQUFBLEtBQUEsVUFBQSxLQUFBO1FBQ0EsU0FBQTtTQUNBLFVBQUEsTUFBQTtRQUNBLFNBQUEsUUFBQTs7Ozs7SUFLQSxTQUFBLGNBQUEsYUFBQTtJQUNBLFNBQUEsYUFBQSxPQUFBO01BQ0EsT0FBQSxXQUFBO1FBQ0EsV0FBQTtXQUNBOzs7OztBQ2pIQSxRQUFBLE9BQUE7R0FDQSxRQUFBLHlDQUFBLFNBQUEsZUFBQSxZQUFBO0lBQ0EsSUFBQSxNQUFBLElBQUEsU0FBQTtJQUNBLElBQUEsT0FBQSxjQUFBOztJQUVBLElBQUEsT0FBQTtNQUNBLElBQUE7TUFDQSxNQUFBOztNQUVBLE9BQUEsVUFBQTtRQUNBLElBQUEsTUFBQSxJQUFBO1FBQ0EsR0FBQSxPQUFBLE1BQUE7VUFDQSxPQUFBLElBQUEsVUFBQTs7WUFFQTtVQUNBLE9BQUE7Ozs7O0lBS0EsT0FBQTs7O0FDcEJBLFFBQUEsT0FBQTtHQUNBLFdBQUEsNkRBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQSxXQUFBO0lBQ0EsSUFBQSxXQUFBOzs7SUFHQSxTQUFBLGFBQUE7SUFDQSxTQUFBLGFBQUE7SUFDQSxTQUFBLGFBQUE7Ozs7QUNQQSxRQUFBLE9BQUE7OztHQUdBLFFBQUEsb0VBQUEsU0FBQSxpQkFBQSxpQkFBQSxZQUFBO0lBQ0EsSUFBQSxTQUFBLElBQUEsU0FBQSxZQUFBO0lBQ0EsSUFBQSxhQUFBLGdCQUFBOztJQUVBLElBQUEsT0FBQTs7TUFFQSxNQUFBLFNBQUEsV0FBQTtRQUNBLElBQUEsT0FBQSxJQUFBLGFBQUEsUUFBQSxRQUFBO1FBQ0EsT0FBQSxnQkFBQTs7O01BR0EsVUFBQSxTQUFBLFdBQUE7UUFDQSxPQUFBLGdCQUFBLFNBQUEsTUFBQTs7O01BR0EsVUFBQSxTQUFBLFVBQUE7UUFDQSxPQUFBLElBQUEsTUFBQTs7O01BR0EsV0FBQSxTQUFBLElBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLGlCQUFBLFFBQUE7UUFDQSxPQUFBLGVBQUE7OztNQUdBLFNBQUEsU0FBQSxLQUFBLElBQUE7UUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUEsY0FBQSxLQUFBLGFBQUE7UUFDQSxJQUFBOzs7TUFHQSxXQUFBLFNBQUEsS0FBQSxJQUFBO1FBQ0EsSUFBQSxPQUFBO1FBQ0EsSUFBQSxTQUFBLElBQUEsU0FBQSxZQUFBLGNBQUEsS0FBQSxhQUFBO1FBQ0EsSUFBQSxLQUFBLFNBQUEsU0FBQSxVQUFBO1VBQ0EsU0FBQSxTQUFBOztRQUVBLE9BQUE7O01BRUEsS0FBQSxlQUFBO01BQ0EsSUFBQTs7SUFFQSxPQUFBOzs7O0FDM0NBLFFBQUEsT0FBQTs7O0dBR0EsUUFBQSwyQ0FBQSxTQUFBLGlCQUFBLFlBQUE7SUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLFNBQUEsZ0JBQUE7O0lBRUEsSUFBQSxLQUFBO01BQ0EsV0FBQSxTQUFBLFdBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsZ0JBQUE7O01BRUEsVUFBQSxTQUFBLFdBQUE7UUFDQSxPQUFBLGdCQUFBLFNBQUEsTUFBQTs7TUFFQSxJQUFBOztJQUVBLE9BQUE7Ozs7QUNqQkEsUUFBQSxPQUFBO0dBQ0EsV0FBQSx5R0FBQSxTQUFBLE1BQUEsT0FBQSxTQUFBLFlBQUE7d0NBQ0EsVUFBQSxZQUFBLE1BQUE7SUFDQSxJQUFBLGdCQUFBOztJQUVBLGNBQUEsT0FBQTs7SUFFQSxjQUFBLE9BQUE7SUFDQSxjQUFBLGtCQUFBLFNBQUE7SUFDQSxjQUFBLGNBQUE7SUFDQSxjQUFBLGNBQUEsS0FBQTs7SUFFQSxjQUFBLGtCQUFBO0lBQ0EsY0FBQSxrQkFBQTtJQUNBLGNBQUEsa0JBQUE7Ozs7SUFJQSxjQUFBLFFBQUEsWUFBQTtNQUNBLFdBQUEsU0FBQTs7OztJQUlBLGNBQUEsYUFBQSxTQUFBLFVBQUE7TUFDQSxjQUFBLEtBQUEsU0FBQSxVQUFBO1NBQ0EsTUFBQSxLQUFBLElBQUEsVUFBQSxLQUFBLE9BQUEsSUFBQSxTQUFBOzs7O0FDekJBLFFBQUEsT0FBQTs7R0FFQSxVQUFBLGFBQUEsVUFBQTtJQUNBLE9BQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTtNQUNBLFlBQUE7TUFDQSxhQUFBOzs7Ozs7R0FNQSxVQUFBLG9CQUFBLFVBQUE7SUFDQSxPQUFBO01BQ0EsY0FBQTtNQUNBLGNBQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTtNQUNBLE9BQUE7UUFDQSxjQUFBOzs7Ozs7O0dBT0EsVUFBQSxlQUFBLFlBQUE7SUFDQSxPQUFBO01BQ0EsY0FBQTtNQUNBLGNBQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTtNQUNBLE9BQUE7UUFDQSxRQUFBOzs7Ozs7O0dBT0EsVUFBQSxrQkFBQSxVQUFBO0lBQ0EsT0FBQTtNQUNBLGNBQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTtNQUNBLGNBQUE7TUFDQSxPQUFBO1FBQ0EsUUFBQTs7Ozs7OztHQU9BLFVBQUEsZ0JBQUEsVUFBQTtJQUNBLE9BQUE7TUFDQSxZQUFBO01BQ0EsYUFBQTtNQUNBLE9BQUE7UUFDQSxNQUFBOzs7Ozs7R0FNQSxVQUFBLGFBQUEsWUFBQTtJQUNBLE9BQUE7TUFDQSxZQUFBO01BQ0EsYUFBQTs7Ozs7R0FLQSxVQUFBLFdBQUEsWUFBQTtJQUNBLE9BQUE7TUFDQSxZQUFBO01BQ0EsYUFBQTs7Ozs7R0FLQSxVQUFBLGVBQUEsVUFBQTs7SUFFQSxPQUFBO01BQ0EsWUFBQTtNQUNBLGFBQUE7TUFDQSxPQUFBO1FBQ0EsT0FBQTs7Ozs7OztHQU9BLFVBQUEsYUFBQSxZQUFBO0lBQ0EsT0FBQTtNQUNBLFlBQUE7TUFDQSxhQUFBO01BQ0EsT0FBQTtRQUNBLFFBQUE7Ozs7OztHQU1BLFVBQUEsb0JBQUEsWUFBQTtJQUNBLE9BQUE7TUFDQSxZQUFBO01BQ0EsYUFBQTtNQUNBLE9BQUE7UUFDQSxPQUFBOzs7Ozs7O0dBT0EsVUFBQSxrQkFBQSxXQUFBO0VBQ0EsT0FBQTtJQUNBLFNBQUE7SUFDQSxNQUFBLFNBQUEsT0FBQSxTQUFBLE9BQUEsUUFBQTtNQUNBLElBQUEsVUFBQSxNQUFBLFVBQUEsU0FBQSxNQUFBLFNBQUEsT0FBQTs7TUFFQSxPQUFBLFNBQUEsS0FBQSxTQUFBLE9BQUE7UUFDQSxJQUFBLFNBQUEsV0FBQSxNQUFBLFNBQUEsU0FBQTtVQUNBLE1BQUEsT0FBQSxNQUFBLFNBQUEsR0FBQTs7UUFFQSxPQUFBOzs7Ozs7QUNoSUEsUUFBQSxPQUFBO0dBQ0EsV0FBQSxxREFBQSxTQUFBLE9BQUEsU0FBQSxPQUFBLEtBQUE7SUFDQSxJQUFBLFdBQUE7O0lBRUEsU0FBQSxTQUFBO0lBQ0EsU0FBQSxTQUFBO0lBQ0EsU0FBQSxTQUFBOzs7QUNOQSxRQUFBLE9BQUE7R0FDQSxPQUFBLENBQUEsc0JBQUEsVUFBQSxvQkFBQTtJQUNBLG1CQUFBLGFBQUEsT0FBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7OztNQUdBLGtCQUFBO01BQ0Esa0JBQUE7Ozs7TUFJQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTs7Ozs7TUFLQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7OztNQUdBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTs7OztJQUlBLG1CQUFBLGFBQUEsT0FBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBOzs7SUFHQSxtQkFBQSxrQkFBQTs7O0FDL0ZBLFFBQUEsT0FBQTtHQUNBLFdBQUEsNERBQUEsU0FBQSxPQUFBLFNBQUEsT0FBQSxZQUFBO0lBQ0EsSUFBQSxXQUFBOzs7SUFHQSxTQUFBLFNBQUE7SUFDQSxTQUFBLFNBQUE7SUFDQSxTQUFBLGNBQUE7O0lBRUEsU0FBQSxVQUFBLFNBQUEsSUFBQTtNQUNBLE9BQUEsU0FBQSxJQUFBLEtBQUEsS0FBQSxLQUFBOzs7O0FDVkEsUUFBQSxPQUFBOztHQUVBLFFBQUEsOEZBQUEsU0FBQSxpQkFBQSxpQkFBQTttQ0FDQSxNQUFBLGNBQUE7SUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLE9BQUEsZ0JBQUE7SUFDQSxJQUFBLFFBQUE7O0lBRUEsSUFBQSxvQkFBQTs7O0lBR0EsSUFBQSxlQUFBOzs7TUFHQSxtQkFBQSxTQUFBLElBQUE7UUFDQSxJQUFBLE1BQUEsSUFBQSxTQUFBLFlBQUEsZ0JBQUEsSUFBQTtRQUNBLElBQUE7UUFDQSxJQUFBLEdBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxVQUFBLFNBQUE7OztRQUdBLElBQUEsbUJBQUEsSUFBQSxTQUFBLFlBQUEsZ0JBQUE7UUFDQSxpQkFBQSxHQUFBLGNBQUEsVUFBQTtVQUNBLGNBQUEsMEJBQUE7WUFDQSxNQUFBLFNBQUE7WUFDQSxLQUFBO1lBQ0EsTUFBQTtZQUNBLEtBQUE7WUFDQSxNQUFBOztZQUVBLG9CQUFBOzs7UUFHQSxPQUFBOzs7O01BSUEsZUFBQSxTQUFBLFFBQUEsSUFBQTtRQUNBLElBQUEsTUFBQSxNQUFBLFlBQUE7UUFDQSxJQUFBLEtBQUEsU0FBQSxTQUFBLFVBQUE7VUFDQSxTQUFBLFFBQUEsU0FBQSxlQUFBOztZQUVBLGFBQUEsd0JBQUEsUUFBQSxjQUFBOzs7Ozs7TUFNQSxVQUFBLFNBQUEsUUFBQSxJQUFBLFNBQUE7O1FBRUEsUUFBQSxJQUFBLE9BQUE7UUFDQSxRQUFBLElBQUEsYUFBQTs7UUFFQSxhQUFBLFNBQUEsS0FBQSxPQUFBLElBQUE7VUFDQSxZQUFBO1VBQ0EsWUFBQTtVQUNBLFlBQUE7VUFDQSxZQUFBLFNBQUE7Ozs7Ozs7TUFPQSxZQUFBLFNBQUEsSUFBQTtRQUNBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQSxnQkFBQSxJQUFBO1FBQ0EsSUFBQSxJQUFBOzs7Ozs7TUFNQSx3QkFBQSxTQUFBLFFBQUEsSUFBQSxTQUFBOztRQUVBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQSxnQkFBQSxJQUFBO1FBQ0EsSUFBQSxLQUFBLFNBQUEsU0FBQSxVQUFBOztTQUVBLEdBQUEsU0FBQSxTQUFBLE9BQUE7WUFDQSxJQUFBLElBQUE7ZUFDQTtZQUNBLElBQUEsSUFBQSxTQUFBLFFBQUE7O1dBRUEsVUFBQSxhQUFBO1VBQ0EsUUFBQSxJQUFBLHNCQUFBLFlBQUE7Ozs7UUFJQSxhQUFBLFVBQUEsUUFBQSxJQUFBOzs7OztNQUtBLFNBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxJQUFBLE1BQUE7OztNQUdBLFlBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxnQkFBQSxJQUFBLE1BQUE7OztNQUdBLEtBQUEsZUFBQTtNQUNBLEtBQUE7O0lBRUEsT0FBQTs7OztBQ3ZHQSxRQUFBLE9BQUE7R0FDQSxXQUFBLGtKQUFBLFNBQUEsT0FBQSxPQUFBLFlBQUEsV0FBQTs7cUNBRUEsTUFBQSxRQUFBLE1BQUEsT0FBQSxLQUFBO3FDQUNBLGNBQUE7O0lBRUEsSUFBQSxhQUFBO0lBQ0EsUUFBQSxJQUFBO0lBQ0EsV0FBQSxlQUFBOzs7OztBQ1JBLFFBQUEsT0FBQTtHQUNBLFFBQUEsNENBQUEsU0FBQSxnQkFBQSxZQUFBOztJQUVBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsa0JBQUEsSUFBQSxTQUFBLFlBQUE7O0lBRUEsSUFBQSxTQUFBLGVBQUE7O0lBRUEsSUFBQSxTQUFBO01BQ0EsVUFBQSxTQUFBLFVBQUE7UUFDQSxPQUFBLElBQUEsTUFBQTs7O01BR0EscUJBQUEsU0FBQSxVQUFBO1FBQ0EsT0FBQSxnQkFBQSxNQUFBOzs7TUFHQSxZQUFBLFNBQUEsU0FBQTtRQUNBLE9BQUEsSUFBQSxNQUFBLFNBQUE7O01BRUEsS0FBQTs7SUFFQSxPQUFBOzs7QUN0QkEsUUFBQSxPQUFBOzs7R0FHQSxRQUFBLGlFQUFBLFNBQUEsaUJBQUEsZ0JBQUEsWUFBQTtJQUNBLElBQUEsU0FBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsYUFBQSxnQkFBQTtJQUNBLElBQUEsV0FBQSxlQUFBOztJQUVBLElBQUEsV0FBQTtNQUNBLFNBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxPQUFBLElBQUEsTUFBQTtRQUNBLE9BQUEsZ0JBQUE7OztNQUdBLEtBQUE7O0lBRUEsT0FBQTs7Ozs7R0FLQSxRQUFBLCtDQUFBLFNBQUEsZ0JBQUEsWUFBQTtJQUNBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsT0FBQSxlQUFBOztJQUVBLE9BQUE7Ozs7O0dBS0EsUUFBQSw2Q0FBQSxTQUFBLGdCQUFBLFlBQUE7SUFDQSxJQUFBLE1BQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLFVBQUEsZUFBQTs7SUFFQSxJQUFBLFNBQUE7TUFDQSxVQUFBLFNBQUEsS0FBQTtRQUNBLE9BQUEsSUFBQSxNQUFBOztNQUVBLEtBQUE7TUFDQSxLQUFBOztJQUVBLE9BQUE7OztBQ3pDQSxRQUFBLE9BQUE7R0FDQSxXQUFBLDhFQUFBLFNBQUEsTUFBQSxPQUFBLE9BQUE7O2tDQUVBLFdBQUEsU0FBQTs7SUFFQSxJQUFBLFVBQUE7SUFDQSxRQUFBLGNBQUE7SUFDQSxRQUFBLGNBQUE7Ozs7QUNQQSxRQUFBLE9BQUE7R0FDQSxRQUFBLG1FQUFBLFNBQUEsZ0JBQUEsaUJBQUEsYUFBQSxHQUFBOztJQUVBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsT0FBQSxlQUFBOztJQUVBLElBQUEsT0FBQTs7TUFFQSxVQUFBLFNBQUEsVUFBQTtRQUNBLE9BQUEsSUFBQSxNQUFBOzs7TUFHQSxTQUFBLFlBQUE7UUFDQSxPQUFBLGVBQUE7OztNQUdBLFVBQUEsU0FBQSxJQUFBO1FBQ0EsT0FBQSxJQUFBLE1BQUE7OztNQUdBLGFBQUEsU0FBQSxJQUFBO1FBQ0EsT0FBQSxnQkFBQSxJQUFBLE1BQUE7OztNQUdBLFVBQUEsU0FBQSxJQUFBO1FBQ0EsSUFBQSxXQUFBLEdBQUE7O1FBRUEsSUFBQSxLQUFBLElBQUEsU0FBQTtRQUNBLElBQUEsVUFBQTs7UUFFQSxPQUFBLEdBQUEsTUFBQSxRQUFBO1dBQ0EsR0FBQSxlQUFBLFNBQUEsUUFBQTtZQUNBLEdBQUEsTUFBQTtlQUNBLGFBQUE7ZUFDQSxRQUFBO2VBQ0EsR0FBQSxlQUFBLFNBQUEsV0FBQTtnQkFDQSxTQUFBOztnQkFFQSxPQUFBLE9BQUEsSUFBQSxRQUFBLE9BQUEsVUFBQTs7Ozs7O01BTUEsS0FBQTs7O0lBR0EsT0FBQTs7O0FDL0NBLFFBQUEsT0FBQTtHQUNBLFdBQUEsNklBQUEsVUFBQSxRQUFBLFFBQUEsTUFBQSxRQUFBLE1BQUE7OzRDQUVBLFFBQUEsY0FBQSxXQUFBLFVBQUEsV0FBQTs7SUFFQSxJQUFBLG1CQUFBOzs7SUFHQSxpQkFBQSxlQUFBO0lBQ0EsaUJBQUEsZUFBQTtJQUNBLGlCQUFBLGVBQUE7SUFDQSxpQkFBQSxlQUFBO0lBQ0EsaUJBQUEsZUFBQTtJQUNBLGlCQUFBLGVBQUE7SUFDQSxpQkFBQSxlQUFBO0lBQ0EsaUJBQUEsZUFBQTs7Ozs7O0lBTUEsaUJBQUEsYUFBQTtJQUNBLGlCQUFBLGVBQUEsVUFBQTs7TUFFQSxJQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsaUJBQUEsVUFBQSxPQUFBLElBQUE7UUFDQSxJQUFBLFVBQUEsaUJBQUEsVUFBQSxHQUFBO1FBQ0EsSUFBQSxVQUFBLGlCQUFBLFVBQUEsR0FBQTtRQUNBLGlCQUFBLFdBQUEsS0FBQSxpQkFBQSxPQUFBLGFBQUEsUUFBQTs7OztJQUlBLGlCQUFBOzs7QUMvQkEsUUFBQSxPQUFBO0dBQ0EsV0FBQSw0TkFBQSxTQUFBLE9BQUEsT0FBQSxZQUFBLFdBQUE7b0NBQ0EsTUFBQSxZQUFBLFdBQUE7O29DQUVBLFlBQUEsTUFBQSxRQUFBLE1BQUE7b0NBQ0EsS0FBQSxRQUFBLFVBQUEsUUFBQTs7SUFFQSxJQUFBLFlBQUE7Ozs7SUFJQSxVQUFBLFlBQUE7SUFDQSxVQUFBLFlBQUE7SUFDQSxVQUFBLFlBQUE7SUFDQSxVQUFBLFlBQUE7SUFDQSxVQUFBLFlBQUE7SUFDQSxVQUFBLFlBQUE7SUFDQSxVQUFBLFlBQUE7SUFDQSxVQUFBLFlBQUE7O0lBRUEsR0FBQSxVQUFBLEtBQUEsSUFBQSxhQUFBLE1BQUE7TUFDQSxVQUFBLFdBQUEsVUFBQSxNQUFBLFdBQUEsVUFBQSxLQUFBLElBQUEsVUFBQTtNQUNBLFVBQUEsTUFBQSxVQUFBLFFBQUE7TUFDQSxVQUFBLFVBQUEsVUFBQSxNQUFBLFFBQUEsVUFBQTtNQUNBLFVBQUEsb0JBQUEsVUFBQSxNQUFBLFFBQUEsVUFBQTtNQUNBLFVBQUEsc0JBQUEsVUFBQSxNQUFBLFVBQUEsVUFBQTtNQUNBLFVBQUEsZ0JBQUEsVUFBQSxNQUFBLFVBQUEsVUFBQTs7UUFFQTtNQUNBLFVBQUEsU0FBQTtNQUNBLFVBQUEsTUFBQTtNQUNBLFVBQUEsVUFBQTs7Ozs7O0lBTUEsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBLGdCQUFBO0lBQ0EsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBLGdCQUFBO0lBQ0EsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZUFBQTtJQUNBLFVBQUEsZ0JBQUE7OztJQUdBLFVBQUEsZ0JBQUE7TUFDQSxZQUFBO01BQ0EsUUFBQTtNQUNBLFVBQUE7TUFDQSxRQUFBO01BQ0EsUUFBQTs7Ozs7SUFLQSxVQUFBLGlCQUFBLFVBQUE7O01BRUEsSUFBQSxXQUFBLE9BQUEsS0FBQSxVQUFBLGVBQUE7TUFDQSxJQUFBLE1BQUE7TUFDQSxJQUFBLElBQUEsRUFBQSxFQUFBLEVBQUEsU0FBQSxJQUFBO1FBQ0EsTUFBQSxNQUFBLFVBQUEsY0FBQTs7O01BR0EsVUFBQSxxQkFBQSxJQUFBOztNQUVBLFFBQUEsSUFBQSxVQUFBOztNQUVBLFVBQUEsZ0JBQUEsRUFBQSxLQUFBLFVBQUEsb0JBQUEsTUFBQSxVQUFBOzs7OztJQUtBLFVBQUEsaUJBQUEsU0FBQSxLQUFBO01BQ0EsR0FBQTtNQUNBO01BQ0EsSUFBQSxLQUFBO01BQ0EsSUFBQSxJQUFBLEVBQUEsRUFBQSxFQUFBLEtBQUEsT0FBQSxJQUFBO1FBQ0EsTUFBQSxNQUFBLEtBQUEsR0FBQTs7TUFFQSxPQUFBLElBQUEsS0FBQTs7Ozs7O0lBTUEsV0FBQSxDQUFBLGNBQUEsYUFBQSxrQkFBQSxtQkFBQSxLQUFBLFVBQUEsY0FBQTtNQUNBLFVBQUEsY0FBQSxhQUFBO01BQ0EsVUFBQSxjQUFBLGFBQUE7TUFDQSxVQUFBLGNBQUEsYUFBQTtNQUNBLFVBQUEscUJBQUEsYUFBQTs7OztJQUlBLFVBQUEsV0FBQSxTQUFBLE9BQUE7TUFDQSxHQUFBLFNBQUEsS0FBQTs7Ozs7Ozs7O0lBU0EsVUFBQSxjQUFBLFNBQUEsSUFBQTtNQUNBLElBQUEsZ0JBQUEsQ0FBQSxTQUFBLFNBQUEsU0FBQSxVQUFBLE9BQUE7TUFDQSxVQUFBLEtBQUE7VUFDQSxZQUFBO1VBQ0EsYUFBQTtVQUNBLFFBQUEsUUFBQSxRQUFBLFNBQUE7VUFDQSxhQUFBO1VBQ0EscUJBQUE7VUFDQSxZQUFBOzs7Ozs7SUFNQSxVQUFBLGFBQUEsU0FBQSxLQUFBOztNQUVBLFFBQUEsSUFBQSxVQUFBO01BQ0EsT0FBQSxVQUFBOzs7O0lBSUEsVUFBQSxXQUFBLFNBQUEsT0FBQTtNQUNBLFVBQUEsV0FBQTtNQUNBLElBQUEsT0FBQTtNQUNBLEtBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxNQUFBLFFBQUEsS0FBQTtRQUNBLEtBQUEsS0FBQSxNQUFBOztNQUVBLFFBQUEsSUFBQTtNQUNBLE9BQUE7OztJQUdBLFVBQUEsV0FBQSxTQUFBLE9BQUE7TUFDQSxRQUFBLElBQUEsVUFBQSxLQUFBOzs7Ozs7Ozs7O0lBVUEsVUFBQSxhQUFBLFNBQUEsTUFBQSxPQUFBO01BQ0EsUUFBQSxRQUFBLE9BQUEsVUFBQSxVQUFBLE9BQUE7UUFDQSxJQUFBLGFBQUEsSUFBQTtRQUNBLFdBQUEsU0FBQSxVQUFBLE9BQUE7VUFDQSxJQUFBLE1BQUEsTUFBQSxPQUFBO1VBQ0EsVUFBQSxhQUFBLFNBQUE7O1FBRUEsV0FBQSxjQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsb0JBQUEsU0FBQSxHQUFBLFlBQUEsSUFBQTs7TUFFQSxJQUFBLFVBQUEsVUFBQTtTQUNBLE1BQUEsVUFBQTtTQUNBLFlBQUEsVUFBQTtTQUNBLFlBQUE7U0FDQSxHQUFBLFVBQUE7U0FDQSxPQUFBLFVBQUE7TUFDQSxVQUFBLEtBQUEsU0FBQSxLQUFBLFdBQUE7UUFDQSxHQUFBLFVBQUEsWUFBQSxZQUFBLEtBQUE7VUFDQSxPQUFBLEdBQUE7Ozs7Ozs7SUFPQSxVQUFBLGNBQUEsU0FBQSxZQUFBLElBQUE7O01BRUEsR0FBQSxlQUFBLFVBQUEsSUFBQTtRQUNBLGFBQUEsVUFBQSxPQUFBLFNBQUEsSUFBQSxNQUFBLFVBQUEsUUFBQSxTQUFBLElBQUE7UUFDQSxPQUFBO1lBQ0E7UUFDQSxPQUFBOzs7Ozs7SUFNQSxVQUFBLFFBQUEsU0FBQSxTQUFBOztNQUVBLFVBQUEsT0FBQSxTQUFBLFNBQUEsS0FBQSxLQUFBO1FBQ0EsVUFBQSxTQUFBO1FBQ0EsVUFBQSxVQUFBLFNBQUE7UUFDQSxVQUFBLFVBQUE7UUFDQSxVQUFBLFVBQUE7UUFDQSxVQUFBLFNBQUE7U0FDQSxLQUFBLFVBQUE7OztRQUdBLFVBQUEsS0FBQSx3QkFBQSxTQUFBLElBQUEsU0FBQSxJQUFBLFVBQUE7Ozs7Ozs7O01BUUEsVUFBQSxPQUFBLFdBQUEsU0FBQSxLQUFBLFVBQUEsS0FBQSxTQUFBLEtBQUE7UUFDQSxHQUFBLENBQUEsS0FBQSxNQUFBO1VBQ0EsVUFBQSxPQUFBLGNBQUEsU0FBQSxLQUFBLElBQUE7YUFDQTtVQUNBLFVBQUEsT0FBQSxjQUFBLFNBQUE7YUFDQSxJQUFBLEtBQUEsT0FBQTs7Ozs7O01BTUEsVUFBQSxNQUFBLFFBQUEsVUFBQSxLQUFBLE1BQUE7U0FDQSxJQUFBLFVBQUEsUUFBQSxLQUFBLFFBQUEsUUFBQTs7TUFFQSxVQUFBLE1BQUEsUUFBQSxVQUFBLEtBQUEsTUFBQSx1QkFBQSxTQUFBO1NBQ0EsT0FBQSxJQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsZUFBQSxTQUFBLFFBQUEsUUFBQTtNQUNBLFVBQUEsT0FBQSxnQkFBQSxRQUFBLFNBQUEsS0FBQTtRQUNBLFVBQUEsVUFBQSxhQUFBO1FBQ0EsVUFBQSxVQUFBO1FBQ0EsVUFBQSxTQUFBOzs7Ozs7SUFNQSxVQUFBLGVBQUEsV0FBQTtNQUNBLElBQUEsWUFBQSxVQUFBLGVBQUEsT0FBQTtNQUNBLFVBQUEsZUFBQSxLQUFBLENBQUEsS0FBQSxXQUFBOzs7SUFHQSxVQUFBLGVBQUEsV0FBQTtNQUNBLElBQUEsV0FBQSxVQUFBLGVBQUEsT0FBQTtNQUNBLFVBQUEsZUFBQSxPQUFBOzs7OztJQUtBLFVBQUEsY0FBQSxTQUFBLFNBQUEsUUFBQTs7O01BR0EsSUFBQSxpQkFBQTs7TUFFQSxHQUFBLFVBQUEsU0FBQSxhQUFBLElBQUE7UUFDQSxRQUFBLElBQUEsVUFBQSxTQUFBO1FBQ0EsaUJBQUE7VUFDQSxVQUFBLFVBQUEsU0FBQSxTQUFBLFFBQUE7VUFDQSxVQUFBLEtBQUEsUUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQTtVQUNBLFVBQUEsVUFBQSxTQUFBLFNBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxVQUFBLFVBQUEsU0FBQSxTQUFBLFFBQUEsU0FBQSxTQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXlCQSxVQUFBLE9BQUEsSUFBQSxLQUFBO1VBQ0EsZ0JBQUEsVUFBQTtVQUNBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBO1VBQ0EsZ0JBQUEsVUFBQTs7VUFFQSxnQkFBQSxVQUFBLFNBQUE7VUFDQSxnQkFBQSxVQUFBO1VBQ0EsZ0JBQUEsVUFBQTtVQUNBLGdCQUFBO1VBQ0EsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUE7VUFDQSxnQkFBQSxTQUFBO1VBQ0EsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUEsVUFBQTtXQUNBLEtBQUEsU0FBQSxNQUFBOztVQUVBLElBQUEsVUFBQTs7VUFFQSxHQUFBLEtBQUEsUUFBQSxVQUFBLFNBQUEsU0FBQSxHQUFBO1lBQ0EsV0FBQSxVQUFBLFNBQUE7ZUFDQTtZQUNBLFdBQUEsS0FBQSxRQUFBLFVBQUEsU0FBQTs7OztVQUlBLFVBQUEsT0FBQSxjQUFBLE1BQUEsT0FBQSxPQUFBLENBQUEsT0FBQSxTQUFBLE1BQUE7OztVQUdBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBO2FBQ0EsSUFBQSxVQUFBLFFBQUEsS0FBQSxPQUFBLFFBQUE7O1VBRUEsVUFBQSxNQUFBLFFBQUEsVUFBQSxLQUFBLE1BQUEsc0JBQUEsTUFBQTthQUNBLE9BQUEsSUFBQSxTQUFBOzs7VUFHQSxHQUFBLG1CQUFBLEdBQUE7O1lBRUEsVUFBQSxPQUFBLFNBQUEsZUFBQTt1QkFDQSxNQUFBLE1BQUE7dUJBQ0EsT0FBQSxJQUFBLFNBQUE7O1lBRUEsVUFBQSxPQUFBLFNBQUEsZUFBQTtlQUNBLE1BQUEsUUFBQSxJQUFBOzs7O1VBSUEsR0FBQSxVQUFBLFNBQUEsU0FBQSxLQUFBO1lBQ0EsS0FBQSxJQUFBLFFBQUEsR0FBQSxRQUFBLFVBQUEsU0FBQSxLQUFBLFFBQUEsRUFBQSxPQUFBO2NBQ0EsVUFBQSxLQUFBLFNBQUEsVUFBQSxTQUFBLEtBQUEsT0FBQTtpQkFDQSxNQUFBLE1BQUEsT0FBQSxPQUFBLElBQUEsU0FBQTs7Ozs7VUFLQSxVQUFBLEtBQUEsZUFBQSxNQUFBLE1BQUEsVUFBQTs7OztVQUlBLFVBQUEsV0FBQTtZQUNBLE1BQUE7Ozs7Ozs7SUFPQSxVQUFBLGNBQUEsU0FBQSxXQUFBO01BQ0EsR0FBQSxVQUFBLE1BQUEsWUFBQSxVQUFBLElBQUEsWUFBQTtRQUNBLE9BQUE7V0FDQTtRQUNBLE9BQUE7Ozs7OztJQU1BLFVBQUEsYUFBQSxTQUFBLFdBQUE7OztNQUdBLFVBQUEsTUFBQSxXQUFBLFlBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxZQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxTQUFBLFFBQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsWUFBQSxNQUFBLHNCQUFBLFVBQUE7V0FDQSxPQUFBLElBQUEsU0FBQTs7OztNQUlBLFVBQUEsTUFBQSxXQUFBLFVBQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxNQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBO1dBQ0EsSUFBQSxLQUFBLEtBQUEsU0FBQSxRQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBLHVCQUFBO1dBQ0EsT0FBQSxJQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsZUFBQSxTQUFBLFdBQUE7OztNQUdBLFVBQUEsTUFBQSxXQUFBLFlBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxZQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxTQUFBLFFBQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsWUFBQSxNQUFBLHNCQUFBLFVBQUEsS0FBQTs7OztNQUlBLFVBQUEsTUFBQSxXQUFBLFVBQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxNQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBO1dBQ0EsSUFBQSxLQUFBLEtBQUEsVUFBQSxRQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBLHVCQUFBLFlBQUE7Ozs7Ozs7O0lBUUEsVUFBQSxTQUFBLFNBQUEsTUFBQTs7TUFFQSxHQUFBLE1BQUEsYUFBQSxhQUFBLE1BQUEsVUFBQSxVQUFBLFFBQUEsVUFBQTtRQUNBLFVBQUEsZUFBQTs7TUFFQSxVQUFBLE9BQUEsWUFBQSxNQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsS0FBQSxTQUFBLE1BQUE7UUFDQSxVQUFBLGtCQUFBLE1BQUEsTUFBQSxLQUFBLElBQUEsTUFBQTs7O1FBR0EsVUFBQSxNQUFBLFdBQUEsTUFBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsTUFBQSxLQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxRQUFBLFFBQUE7UUFDQSxVQUFBLE1BQUEsUUFBQSxNQUFBLEtBQUEsTUFBQSx1QkFBQSxNQUFBO1dBQ0EsT0FBQSxJQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsZUFBQSxTQUFBLE1BQUE7TUFDQSxVQUFBLE9BQUEsV0FBQSxNQUFBLEtBQUEsVUFBQTs7TUFFQSxVQUFBLE1BQUEsV0FBQSxNQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTs7O1FBR0EsVUFBQSxNQUFBLFFBQUEsTUFBQSxLQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxRQUFBLFFBQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsTUFBQSxLQUFBLE1BQUEsdUJBQUEsTUFBQSxLQUFBOzs7O01BSUEsVUFBQSxrQkFBQSxNQUFBLE1BQUEsS0FBQSxPQUFBLFNBQUEsTUFBQTtZQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsSUFBQSxVQUFBO2lCQUNBO1lBQ0EsUUFBQSxJQUFBOzs7OztJQUtBLFVBQUEsV0FBQSxTQUFBLE1BQUE7TUFDQSxHQUFBLE1BQUEsV0FBQSxhQUFBLE1BQUEsUUFBQSxVQUFBLFFBQUEsVUFBQTtRQUNBLFVBQUEsYUFBQTs7TUFFQSxVQUFBLE9BQUEsY0FBQSxNQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsS0FBQSxTQUFBLE1BQUE7UUFDQSxVQUFBLG9CQUFBLE1BQUEsTUFBQSxLQUFBLElBQUEsTUFBQTs7OztJQUlBLFVBQUEsaUJBQUEsU0FBQSxNQUFBO01BQ0EsVUFBQSxPQUFBLGFBQUEsTUFBQSxLQUFBLFVBQUE7TUFDQSxVQUFBLG9CQUFBLE1BQUEsTUFBQSxLQUFBLE9BQUEsU0FBQSxNQUFBO1lBQ0EsSUFBQSxPQUFBO1lBQ0EsUUFBQSxJQUFBLFVBQUE7aUJBQ0E7WUFDQSxRQUFBLElBQUE7Ozs7O0lBS0EsVUFBQSxjQUFBLFNBQUEsTUFBQTtNQUNBLFVBQUEsT0FBQSxPQUFBLE1BQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxLQUFBLFNBQUEsTUFBQTtRQUNBLFVBQUEsY0FBQSxNQUFBLE1BQUEsS0FBQSxJQUFBLE1BQUEsUUFBQSxVQUFBOzs7O0lBSUEsVUFBQSxnQkFBQSxTQUFBLE1BQUE7TUFDQSxVQUFBLE9BQUEsU0FBQSxNQUFBLEtBQUEsVUFBQTtNQUNBLFVBQUEsY0FBQSxNQUFBLE1BQUEsS0FBQSxPQUFBLFNBQUEsTUFBQTtZQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsSUFBQSxVQUFBO2lCQUNBO1lBQ0EsUUFBQSxJQUFBOzs7Ozs7OztBQVFBLFNBQUEsYUFBQSxRQUFBLFFBQUE7RUFDQSxPQUFBLEtBQUEsU0FBQSxVQUFBLE1BQUE7SUFDQSxPQUFBLElBQUEsS0FBQSxPQUFBLFVBQUEsT0FBQTtNQUNBLElBQUEsQ0FBQSxPQUFBO1FBQ0EsT0FBQTs7V0FFQSxJQUFBLE9BQUEsYUFBQSxlQUFBLFFBQUEsT0FBQTtRQUNBLFFBQUEsTUFBQTs7Ozs7O0FDL2ZBLFFBQUEsT0FBQTs7R0FFQSxRQUFBLCtEQUFBLFVBQUEsaUJBQUEsZ0JBQUEsYUFBQTtJQUNBLElBQUEsTUFBQSxJQUFBLFNBQUEsY0FBQTtJQUNBLElBQUEsU0FBQSxnQkFBQTtJQUNBLElBQUEsWUFBQSxlQUFBO0lBQ0EsSUFBQSxXQUFBOztJQUVBLElBQUEsU0FBQTs7TUFFQSxRQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsZUFBQSxJQUFBLGFBQUEsUUFBQSxRQUFBOzs7O01BSUEsU0FBQSxVQUFBLE1BQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsZUFBQTs7OztNQUlBLFdBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxPQUFBLFFBQUE7OztNQUdBLFVBQUEsVUFBQSxPQUFBO1FBQ0EsT0FBQSxJQUFBLE1BQUE7O01BRUEsaUJBQUEsWUFBQTs7O01BR0EsTUFBQSxVQUFBLFVBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFlBQUEsUUFBQTtRQUNBLE9BQUEsZUFBQTs7O01BR0EsTUFBQSxVQUFBLFlBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsZ0JBQUE7Ozs7TUFJQSxhQUFBLFVBQUEsWUFBQTtRQUNBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTs7O01BR0EsZUFBQSxVQUFBLFdBQUE7UUFDQSxPQUFBLElBQUEsU0FBQSxjQUFBLFlBQUE7OztNQUdBLGdCQUFBLFVBQUEsWUFBQTtRQUNBLE9BQUEsZUFBQSxJQUFBLGFBQUEsUUFBQSxRQUFBLFlBQUEsYUFBQTs7O01BR0EsZUFBQSxVQUFBLFlBQUE7OztNQUdBLFVBQUEsVUFBQSxZQUFBO1FBQ0EsT0FBQSxlQUFBLE9BQUEsWUFBQTs7OztNQUlBLFdBQUEsVUFBQSxTQUFBO1FBQ0EsSUFBQSxPQUFBLElBQUEsTUFBQSxVQUFBO1FBQ0EsT0FBQSxlQUFBOzs7O01BSUEsVUFBQSxVQUFBLFNBQUE7UUFDQSxPQUFBLGVBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7TUFJQSxZQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUE7O01BRUEsZUFBQSxVQUFBLFNBQUE7UUFDQSxPQUFBLElBQUEsTUFBQSxVQUFBOzs7TUFHQSxjQUFBLFVBQUEsU0FBQSxTQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsVUFBQTs7OztNQUlBLGlCQUFBLFVBQUEsU0FBQSxTQUFBOztRQUVBLE9BQUEsZUFBQSxJQUFBLE1BQUEsVUFBQSxjQUFBLFVBQUE7Ozs7TUFJQSxZQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUE7VUFDQSxLQUFBLElBQUEsTUFBQSxVQUFBO1VBQ0EsT0FBQSxlQUFBLElBQUEsTUFBQSxVQUFBOzs7OztNQUtBLGNBQUEsVUFBQSxTQUFBO1FBQ0EsT0FBQTtVQUNBLEtBQUEsSUFBQSxNQUFBLFVBQUE7VUFDQSxPQUFBLGVBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7O01BS0EsY0FBQSxVQUFBLFNBQUE7UUFDQSxPQUFBO1VBQ0EsS0FBQSxJQUFBLE1BQUEsVUFBQTtVQUNBLEtBQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7TUFJQSxhQUFBLFVBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxNQUFBLFVBQUEsWUFBQSxNQUFBLEtBQUEsSUFBQSxTQUFBO1FBQ0EsT0FBQSxnQkFBQSxJQUFBLE1BQUEsVUFBQSxZQUFBLE1BQUE7OztNQUdBLFlBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxZQUFBLE1BQUEsS0FBQSxPQUFBLFVBQUEsT0FBQTtVQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsSUFBQSxVQUFBO2lCQUNBO1lBQ0EsUUFBQSxJQUFBOztRQUVBLE9BQUEsSUFBQSxNQUFBLFVBQUE7OztNQUdBLGVBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsS0FBQSxJQUFBLFNBQUE7UUFDQSxPQUFBLGdCQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQTs7O01BR0EsY0FBQSxVQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxLQUFBLE9BQUEsVUFBQSxPQUFBO1VBQ0EsSUFBQSxPQUFBO1lBQ0EsUUFBQSxJQUFBLFVBQUE7aUJBQ0E7WUFDQSxRQUFBLElBQUE7O1FBRUEsT0FBQSxJQUFBLE1BQUEsVUFBQTs7O01BR0EsUUFBQSxVQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxXQUFBLE1BQUEsS0FBQSxJQUFBLFNBQUE7UUFDQSxnQkFBQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsVUFBQSxVQUFBLEtBQUEsVUFBQSxNQUFBO1VBQ0EsSUFBQSxLQUFBLFVBQUEsUUFBQSxLQUFBLFVBQUEsV0FBQTtZQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxTQUFBLElBQUE7aUJBQ0E7WUFDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsU0FBQSxJQUFBLEtBQUEsU0FBQTs7OztRQUlBLE9BQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUE7OztNQUdBLFVBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsV0FBQSxNQUFBLEtBQUEsT0FBQSxVQUFBLE9BQUE7VUFDQSxJQUFBLE9BQUE7WUFDQSxRQUFBLElBQUEsVUFBQTtpQkFDQTtZQUNBLFFBQUEsSUFBQTtZQUNBLGdCQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxVQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7Y0FDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsU0FBQSxJQUFBLEtBQUEsU0FBQTs7O1FBR0EsT0FBQSxJQUFBLE1BQUEsVUFBQTs7O01BR0EsVUFBQSxVQUFBLFNBQUE7UUFDQSxPQUFBO1VBQ0EsS0FBQSxJQUFBLE1BQUEsU0FBQSxNQUFBO1VBQ0EsS0FBQSxnQkFBQSxJQUFBLE1BQUEsU0FBQSxNQUFBOzs7O01BSUEsWUFBQSxZQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxXQUFBLFlBQUE7OztNQUdBLGFBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxRQUFBLFFBQUE7Ozs7TUFJQSxLQUFBLGVBQUE7O01BRUEsS0FBQTtNQUNBLEtBQUE7OztJQUdBLE9BQUE7Ozs7QUNoTUEsUUFBQSxPQUFBO0dBQ0EsV0FBQSx1S0FBQSxTQUFBLFFBQUEsWUFBQSxRQUFBLFNBQUE7O3NDQUVBLEtBQUEsTUFBQSxRQUFBLFNBQUEsT0FBQTs7c0NBRUEsUUFBQSxRQUFBLFVBQUE7SUFDQSxJQUFBLGNBQUE7OztJQUdBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTs7SUFFQSxZQUFBLE9BQUE7SUFDQSxZQUFBLFdBQUE7O0lBRUEsWUFBQSxXQUFBOzs7SUFHQSxZQUFBLGNBQUEsU0FBQSxJQUFBO01BQ0EsWUFBQSxPQUFBLFlBQUEsT0FBQSxVQUFBOzs7Ozs7SUFNQSxZQUFBLGVBQUEsVUFBQTtNQUNBLFlBQUEsU0FBQSxNQUFBLFNBQUEsVUFBQTtRQUNBLFlBQUEsU0FBQSxlQUFBLFNBQUEsU0FBQTtVQUNBLEdBQUEsU0FBQSxXQUFBLGFBQUE7WUFDQSxPQUFBLFdBQUE7WUFDQSxZQUFBLFNBQUEsSUFBQSxPQUFBLFNBQUEsVUFBQTtjQUNBLFFBQUEsSUFBQTs7aUJBRUE7Y0FDQSxRQUFBLElBQUE7Ozs7Ozs7O0lBUUEsWUFBQSxrQkFBQSxZQUFBOzs7SUFHQSxZQUFBLGNBQUEsU0FBQSxJQUFBO01BQ0EsT0FBQSxZQUFBLE9BQUEsVUFBQTs7Ozs7SUFLQSxZQUFBLGtCQUFBO0lBQ0EsWUFBQSxrQkFBQTtJQUNBLFlBQUEsa0JBQUE7SUFDQSxZQUFBLGtCQUFBOzs7Ozs7SUFNQSxZQUFBLG9CQUFBLFNBQUEsSUFBQTtNQUNBLFlBQUEsYUFBQSxZQUFBLEtBQUEsV0FBQTs7O0lBR0EsR0FBQSxLQUFBLElBQUEsVUFBQTtNQUNBLFlBQUEsa0JBQUEsS0FBQSxJQUFBLFVBQUE7OztJQUdBLFlBQUEsYUFBQSxTQUFBLE1BQUEsVUFBQTtNQUNBLFlBQUEsYUFBQSxVQUFBO01BQ0EsWUFBQSxLQUFBLFNBQUEsVUFBQTtTQUNBLE1BQUEsS0FBQSxJQUFBLFVBQUEsS0FBQSxPQUFBLElBQUEsU0FBQTs7Ozs7Ozs7SUFRQSxZQUFBLGFBQUEsU0FBQSxPQUFBO01BQ0EsUUFBQSxRQUFBLE9BQUEsVUFBQSxVQUFBLEdBQUE7UUFDQSxJQUFBLGFBQUEsSUFBQTtRQUNBLFdBQUEsU0FBQSxVQUFBLE9BQUE7VUFDQSxJQUFBLE1BQUEsTUFBQSxPQUFBO1VBQ0EsWUFBQSxhQUFBLEtBQUE7VUFDQSxZQUFBLE1BQUEsV0FBQSxLQUFBLElBQUEsVUFBQSxLQUFBLE9BQUEsQ0FBQSxTQUFBO1VBQ0EsT0FBQSxDQUFBLFFBQUEsUUFBQSxTQUFBLFNBQUEsVUFBQTs7UUFFQSxXQUFBLGNBQUEsU0FBQTs7Ozs7OztJQU9BLFlBQUEsY0FBQSxTQUFBLFNBQUE7TUFDQSxZQUFBLFFBQUEsVUFBQSxTQUFBOzs7TUFHQSxHQUFBLFlBQUEsYUFBQSxPQUFBO1FBQ0EsaUJBQUE7VUFDQSxVQUFBLFlBQUEsU0FBQSxRQUFBO1VBQ0EsTUFBQSxZQUFBLFNBQUEsUUFBQTtVQUNBLFNBQUEsWUFBQSxTQUFBLFFBQUE7VUFDQSxLQUFBLFlBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQTtVQUNBLEtBQUEsWUFBQSxTQUFBLFFBQUEsU0FBQSxTQUFBOzs7UUFHQSxZQUFBLFFBQUEsZUFBQTs7O01BR0EsWUFBQSxRQUFBLFFBQUEsS0FBQSxXQUFBO1FBQ0EsT0FBQSxDQUFBLFFBQUEsUUFBQSxTQUFBLFNBQUEsVUFBQTtRQUNBLEdBQUEsYUFBQSxVQUFBO1VBQ0EsT0FBQSxHQUFBOztTQUVBLE1BQUEsU0FBQSxPQUFBO1FBQ0EsT0FBQSxDQUFBLFFBQUEsb0JBQUEsU0FBQSxTQUFBLFVBQUE7Ozs7OztJQU1BLFlBQUEsYUFBQSxVQUFBOztNQUVBLFlBQUEsTUFBQSxXQUFBLEtBQUEsSUFBQSxVQUFBLEtBQUE7UUFDQTtVQUNBLGNBQUEsWUFBQSxRQUFBO1VBQ0EsY0FBQSxZQUFBLFFBQUE7Ozs7TUFJQSxZQUFBLE1BQUEsV0FBQSxLQUFBLElBQUEsVUFBQSxJQUFBLFFBQUEsT0FBQSxJQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUEsWUFBQSxnQkFBQSxZQUFBLE1BQUEsWUFBQSxnQkFBQTtRQUNBLFVBQUEsU0FBQTs7O01BR0EsT0FBQSxDQUFBLFFBQUEsUUFBQSxTQUFBLFNBQUEsVUFBQTs7Ozs7SUFLQSxZQUFBLFlBQUEsVUFBQTtNQUNBLFlBQUEsTUFBQSxXQUFBLEtBQUEsSUFBQSxVQUFBLEtBQUEsT0FBQSxDQUFBLGFBQUEsWUFBQSxRQUFBOztNQUVBLE9BQUEsQ0FBQSxRQUFBLFFBQUEsU0FBQSxTQUFBLFVBQUE7Ozs7SUFJQSxZQUFBLGdCQUFBLFVBQUE7O01BRUEsWUFBQSxRQUFBLFFBQUEsS0FBQSxVQUFBO1FBQ0EsT0FBQSxHQUFBOzs7Ozs7SUFNQSxZQUFBLGdCQUFBLFVBQUE7O01BRUEsWUFBQSxNQUFBLG1CQUFBLFlBQUEsUUFBQSxhQUFBLEtBQUEsU0FBQSxTQUFBLFVBQUE7UUFDQSxHQUFBLFNBQUEsVUFBQSxLQUFBO1VBQ0EsT0FBQSxZQUFBLFVBQUE7Y0FDQTtVQUNBLE9BQUEsWUFBQSxVQUFBOzs7Ozs7O0FDNUtBLFFBQUEsT0FBQTtHQUNBLFFBQUEsdUVBQUEsVUFBQSxnQkFBQSxpQkFBQSxhQUFBLE9BQUE7SUFDQSxJQUFBLFdBQUEsSUFBQSxTQUFBLGNBQUE7SUFDQSxJQUFBLFFBQUEsZUFBQTs7SUFFQSxJQUFBLFFBQUE7TUFDQSxlQUFBLFlBQUE7UUFDQSxPQUFBLE1BQUE7VUFDQSxLQUFBO1VBQ0EsUUFBQTs7OztNQUlBLG1CQUFBLFlBQUE7UUFDQSxPQUFBLE1BQUE7VUFDQSxLQUFBO1VBQ0EsUUFBQTtXQUNBLEtBQUEsVUFBQSxNQUFBO1VBQ0EsT0FBQSxLQUFBOzs7O01BSUEsU0FBQSxTQUFBLElBQUE7UUFDQSxPQUFBLE1BQUEsV0FBQTs7Ozs7TUFLQSxxQkFBQSxTQUFBLFNBQUE7UUFDQSxPQUFBLGVBQUEsU0FBQSxhQUFBLGVBQUEsUUFBQTs7OztNQUlBLG1CQUFBLFNBQUEsU0FBQTtRQUNBLE9BQUEsU0FBQSxhQUFBLGVBQUEsUUFBQTs7OztNQUlBLFlBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxnQkFBQSxTQUFBLE1BQUE7OztNQUdBLGdCQUFBLFVBQUEsS0FBQTtRQUNBLElBQUEsUUFBQSxRQUFBLFFBQUEsSUFBQTtVQUNBLE9BQUEsTUFBQSxXQUFBLEtBQUE7Ozs7O01BS0EsWUFBQSxTQUFBLElBQUE7UUFDQSxPQUFBLFNBQUEsTUFBQSxJQUFBOzs7O01BSUEsWUFBQSxTQUFBLElBQUEsVUFBQTs7UUFFQSxJQUFBLE9BQUE7UUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUEsU0FBQSxJQUFBLHVCQUFBO1FBQ0EsSUFBQSxLQUFBLFNBQUEsU0FBQSxVQUFBO1VBQ0EsU0FBQSxTQUFBOztRQUVBLE9BQUE7Ozs7TUFJQSxtQkFBQSxTQUFBLE1BQUEsUUFBQSxRQUFBOztRQUVBLElBQUEsTUFBQSxJQUFBLFNBQUE7UUFDQSxJQUFBLGVBQUE7VUFDQSxPQUFBO1VBQ0EsYUFBQTtVQUNBLGFBQUE7V0FDQSxTQUFBLE9BQUE7VUFDQSxJQUFBLE9BQUE7WUFDQSxRQUFBLE1BQUE7Y0FDQSxLQUFBO2dCQUNBLFFBQUEsSUFBQTtnQkFDQTtjQUNBLEtBQUE7Z0JBQ0EsUUFBQSxJQUFBO2dCQUNBO2NBQ0E7Z0JBQ0EsUUFBQSxJQUFBLDRCQUFBOztpQkFFQTtZQUNBLFFBQUEsSUFBQTs7Ozs7TUFLQSxTQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsU0FBQSxNQUFBOzs7TUFHQSxTQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsU0FBQSxNQUFBLEtBQUEsTUFBQTs7O01BR0EsV0FBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLFNBQUEsTUFBQSxLQUFBLE1BQUE7Ozs7TUFJQSxXQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsU0FBQSxNQUFBLEtBQUEsTUFBQTs7O01BR0EsWUFBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLFNBQUEsTUFBQTs7O01BR0EsS0FBQTs7O0lBR0EsT0FBQTs7O0FDbEhBLFFBQUEsT0FBQTtHQUNBLFFBQUEscUJBQUEsVUFBQTs7Ozs7Ozs7Ozs7S0FXQSxPQUFBOztRQUVBLGVBQUEsVUFBQTs7WUFFQSxJQUFBLGFBQUE7OztZQUdBLElBQUEsZUFBQTs7Ozs7O1lBTUEsSUFBQSxnQkFBQTs7O2NBR0EsSUFBQSxNQUFBLElBQUEsT0FBQTtjQUNBLElBQUEsaUJBQUEsUUFBQTtjQUNBLGVBQUE7O2NBRUEsSUFBQSxpQkFBQSxJQUFBLE1BQUE7Y0FDQSxLQUFBLElBQUEsSUFBQSxHQUFBLEtBQUEsR0FBQSxLQUFBO2dCQUNBLGVBQUEsS0FBQSxXQUFBLE9BQUEsTUFBQTs7Z0JBRUEsTUFBQSxLQUFBLE1BQUEsTUFBQTs7Y0FFQSxJQUFBLFFBQUEsR0FBQSxNQUFBLElBQUEsTUFBQTs7Y0FFQSxJQUFBLEtBQUEsZUFBQSxLQUFBOztjQUVBLElBQUEsQ0FBQSxlQUFBO2dCQUNBLEtBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxLQUFBO2tCQUNBLGNBQUEsS0FBQSxLQUFBLE1BQUEsS0FBQSxXQUFBOztxQkFFQTs7Z0JBRUEsS0FBQSxJQUFBLElBQUEsS0FBQSxLQUFBLGNBQUEsT0FBQSxJQUFBLEtBQUE7a0JBQ0EsY0FBQSxLQUFBOztnQkFFQSxjQUFBOztjQUVBLEtBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxLQUFBO2dCQUNBLE1BQUEsV0FBQSxPQUFBLGNBQUE7O2NBRUEsR0FBQSxHQUFBLFVBQUEsSUFBQSxNQUFBLElBQUEsTUFBQTs7Y0FFQSxPQUFBOzs7O0lBSUEiLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWFpbiBtb2R1bGUgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICovXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ0FwcCcsIFtcbiAgICAnZmlyZWJhc2UnLFxuICAgICdhbmd1bGFyLW1kNScsIC8vIEVuY3J5cHQgZW1haWxcbiAgICAndWkucm91dGVyJyxcbiAgICAnbmdNYXRlcmlhbCcsIC8vIEludGVyZmFjZVxuICAgICdhbmd1bGFyTW9tZW50JywgLy8gVGltZSBtYW5hZ2VtZW50XG4gICAgJ2Zsb3cnLCAvLyBJbWFnZSB1cGxvYWRcbiAgICAnc2x1Z2lmaWVyJywgLy8gQ3JlYXRlIFNsdWdzXG4gICAgJ25nQXV0b2NvbXBsZXRlJywgLy8gR29vZ2xlIHBsYWNlc1xuICAgICduZ1RhZ3NJbnB1dCcsIC8vIFRhZ3NcbiAgICAnY2dOb3RpZnknLCAvLyBOb3RpZmljYXRpb24gLSBodHRwczovL2dpdGh1Yi5jb20vY2dyb3NzL2FuZ3VsYXItbm90aWZ5XG4gICAgJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnLCAvLyBUcmFuc2xhdGlvbiAtIGh0dHBzOi8vYW5ndWxhci10cmFuc2xhdGUuZ2l0aHViLmlvL1xuICAgICdmYWNlYm9vaycsICAgICAgIC8vICBGYWNlYm9vayAtIGh0dHBzOi8vZ2l0aHViLmNvbS9DaXVsL2FuZ3VsYXItZmFjZWJvb2tcbiAgICAnYW5ndWxhci1mbGV4c2xpZGVyJywgLy8gSW1hZ2Ugc2xpZGVyIC0gaHR0cHM6Ly9naXRodWIuY29tL3RoZW5pa3NvL2FuZ3VsYXItZmxleHNsaWRlclxuXG4gICAgLy8gRW1vdGljb24gLS0gaHR0cDovL21pc3RpYzEwMC5naXRodWIuaW8vYW5ndWxhci1zbWlsaWVzL1xuICAgICduZ1Nhbml0aXplJyxcbiAgICAndWkuYm9vdHN0cmFwJywgICAvLyAgT1IgbWdjcmVhLm5nU3RyYXBcbiAgICAnYW5ndWxhci1zbWlsaWVzJyxcblxuICAgICduZ0Nvb2tpZXMnLCAgICAgIC8vICBjb29raWVzIHN0dWZmXG4gICAgJ25vdGlmaWNhdGlvbicsICAgLy8gIHdlYiBub3RpZmljYXRpb24gLSBodHRwczovL2dpdGh1Yi5jb20vbmVvemlyby9hbmd1bGFyLW5vdGlmaWNhdGlvblxuXG4gIF0pXG5cbiAgLmNvbmZpZyhmdW5jdGlvbiAoJG1kVGhlbWluZ1Byb3ZpZGVyKSB7XG4gICAgJG1kVGhlbWluZ1Byb3ZpZGVyLmRlZmluZVBhbGV0dGUoJ3NsYWNrJywge1xuICAgICAgJzUwJzogJ2ZmZWJlZScsXG4gICAgICAnMTAwJzogJ2ZmY2RkMicsXG4gICAgICAnMjAwJzogJ2VmOWE5YScsXG4gICAgICAnMzAwJzogJ2U1NzM3MycsXG4gICAgICAnNDAwJzogJ2VmNTM1MCcsXG4gICAgICAnNTAwJzogJzREMzk0QicsIC8vIHByaW1hcnkgY29sb3VyXG4gICAgICAnNjAwJzogJ2U1MzkzNScsXG4gICAgICAnNzAwJzogJ2QzMmYyZicsXG4gICAgICAnODAwJzogJ2M2MjgyOCcsXG4gICAgICAnOTAwJzogJ2I3MWMxYycsXG4gICAgICAnQTEwMCc6ICdmZjhhODAnLFxuICAgICAgJ0EyMDAnOiAnZmY1MjUyJyxcbiAgICAgICdBNDAwJzogJ2ZmMTc0NCcsXG4gICAgICAnQTcwMCc6ICdkNTAwMDAnLFxuICAgICAgJ2NvbnRyYXN0RGVmYXVsdENvbG9yJzogJ2xpZ2h0JywgLy8gd2hldGhlciwgYnkgZGVmYXVsdCwgdGV4dCAoY29udHJhc3QpXG4gICAgICAvLyBvbiB0aGlzIHBhbGV0dGUgc2hvdWxkIGJlIGRhcmsgb3IgbGlnaHRcbiAgICAgICdjb250cmFzdERhcmtDb2xvcnMnOiBbJzUwJywgJzEwMCcsIC8vIGh1ZXMgd2hpY2ggY29udHJhc3Qgc2hvdWxkIGJlICdkYXJrJyBieSBkZWZhdWx0XG4gICAgICAgICcyMDAnLCAnMzAwJywgJzQwMCcsICdBMTAwJ10sXG4gICAgICAnY29udHJhc3RMaWdodENvbG9ycyc6IHVuZGVmaW5lZCAvLyBjb3VsZCBhbHNvIHNwZWNpZnkgdGhpcyBpZiBkZWZhdWx0IHdhcyAnZGFyaydcbiAgICB9KVxuICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGVmYXVsdCcpXG4gICAgICAucHJpbWFyeVBhbGV0dGUoJ3NsYWNrJylcbiAgfSlcblxuICAvLyBGYWNlYm9vayBDb25maWdcbiAgLmNvbmZpZyhcbiAgICBmdW5jdGlvbiAoRmFjZWJvb2tQcm92aWRlcikge1xuICAgICAgdmFyIG15QXBwSWQgPSAnOTMxMzc2MTIwMjYzODU2J1xuICAgICAgRmFjZWJvb2tQcm92aWRlci5zZXRBcHBJZChteUFwcElkKVxuICAgICAgRmFjZWJvb2tQcm92aWRlci5pbml0KG15QXBwSWQpXG4gICAgfVxuICApXG5cbiAgLy9TZWN1cml0eSBmb3IgVHJhbnNsYXRlXG4gIC5jb25maWcoZnVuY3Rpb24gKCR0cmFuc2xhdGVQcm92aWRlcikge1xuICAgICR0cmFuc2xhdGVQcm92aWRlci5wcmVmZXJyZWRMYW5ndWFnZSgnRW5nJyk7XG4gICAgLy8gRW5hYmxlIGVzY2FwaW5nIG9mIEhUTUxcbiAgICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5KCdlc2NhcGUnKTtcbiAgfSlcblxuXG5cbiAgLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnSG9tZUN0cmwgYXMgIGhvbWVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnaG9tZS9ob21lLmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICByZXF1aXJlTm9BdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBBdXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGguYXV0aC4kcmVxdWlyZUF1dGgoKS50aGVuKGZ1bmN0aW9uIChhdXRoKSB7XG4gICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2Rhc2hib2FyZCcpXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmZWVkOiBmdW5jdGlvbiAoVG9waWNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5sYXRlc3RGZWVkKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2xvZ2luLWZvcm1AaG9tZSc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL2xvZ2luLWZvcm0uaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9KVxuXG5cbiAgICAgIC8vVHJlbmRpbmdcbiAgICAgIC5zdGF0ZSgndHJlbmRpbmcnLCB7XG4gICAgICAgIHVybDogJy9leHBsb3JlL3RyZW5kaW5nJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDdHJsIGFzICBob21lQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2hvbWUvdHJlbmQuaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIGZlZWQ6IGZ1bmN0aW9uIChUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmxhdGVzdEZlZWQoKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgfSlcblxuXG4gICAgICAvLyBDYXRlZ29yeSBMYW5kaW5nXG4gICAgICAuc3RhdGUoJ2NhdGVnb3J5Jywge1xuICAgICAgICB1cmw6ICcvY2F0ZWdvcnkve1NsdWd9JyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NhdGVDdHJsIGFzIGNhdGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnY2F0ZWdvcnkvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIC8vIEdldHRpbmcgQ2F0ZWdvcnkgZGV0YWlsc1xuICAgICAgICAgICAgICBjYXRlTmFtZTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgQ2F0ZWdvcnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQ2F0ZWdvcnkuZ2V0TmFtZSgkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIC8vIEdldHRpbmcgbGlzdCBvZiBjYXRlZ29yeSB0b3BpY3MgaGVyZVxuICAgICAgICAgICAgICBjYXRlVG9waWNzOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmxpc3QoJHN0YXRlUGFyYW1zLlNsdWcpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9KVxuXG5cbiAgICAgIC8vIFBsYWNlcyBsYW5kaW5nIHBhZ2VcbiAgICAgIC5zdGF0ZSgncGxhY2VzJywge1xuICAgICAgICB1cmw6ICcvcGxhY2VzL3twbGFjZV9zbHVnfS97cGxhY2VfaWR9JyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnaGVhZGVyQHBsYWNlcyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90b29sYmFyL21haW5fdG9vbGJhci5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQbGFjZXNDdHJsIGFzIHBsYWNlc0N0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwbGFjZS9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgcGxhY2VMYW5kaW5nOiBmdW5jdGlvbiAoUGxhY2VzLCBUb3BpY3MsICRzdGF0ZVBhcmFtcywgJGZpcmViYXNlQXJyYXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YVxuICAgICAgICAgICAgICAgIFBsYWNlcy5nZXRQbGFjZVJlZigkc3RhdGVQYXJhbXMucGxhY2VfaWQpLm9uKCd2YWx1ZScsIGZ1bmN0aW9uIChzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgICAgZGF0YSA9IHNuYXBzaG90LnZhbCgpXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzbmFwc2hvdC52YWwoKSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhXG4gICAgICAgICAgICAgIC8vIHJldHVybiAgJGZpcmViYXNlQXJyYXkoUGxhY2VzLmdldFBsYWNlUmVmKCRzdGF0ZVBhcmFtcy5wbGFjZV9pZCkpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cblxuICAgICAgLy8gVGFnIGxhbmRpbmcgcGFnZVxuICAgICAgLnN0YXRlKCd0YWcnLCB7XG4gICAgICAgIHVybDogJy90YWcve1RhZ30nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICdoZWFkZXJAdGFnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1RhZ0N0cmwgYXMgdGFnQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RhZy9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgdGFnTmFtZTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcykge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc3RhdGVQYXJhbXMuVGFnXG4gICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgdGFnTGFuZGluZzogZnVuY3Rpb24gKFRvcGljcywgJHN0YXRlUGFyYW1zLCBUYWdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRhZyA9ICRzdGF0ZVBhcmFtcy5UYWdcbiAgICAgICAgICAgICAgICAvLyB2YXIgZmIgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwpXG4gICAgICAgICAgICAgICAgLy8gdmFyIGRhdGFSZXQgPSAnJ1xuICAgICAgICAgICAgICAgIC8vIHJldHVybiBzaG93KFRhZ3MudG9waWNUYWdzKHRhZykpXG4gICAgICAgICAgICAgICAgLypyZXR1cm4gZmIuY2hpbGQoJ3RhZ3MvJyArIHRhZylcbiAgICAgICAgICAgICAgICAgICAgLm9uKCd2YWx1ZScsIGZ1bmN0aW9uICh0YWdTbmFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZiLmNoaWxkKCd0b3BpY3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9yZGVyQnlDaGlsZChcInRhZ3NcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lcXVhbFRvKHRhZylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbigndmFsdWUnLCBmdW5jdGlvbiAodG9waWNTbmFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzaG93KCBleHRlbmQoe30sIHRhZ1NuYXAudmFsKCksIHRvcGljU25hcC52YWwoKSkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAvISpkYXRhUmV0ID0gZXh0ZW5kKHt9LCB0YWdTbmFwLnZhbCgpLCB0b3BpY1NuYXAudmFsKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCRmaXJlYmFzZUFycmF5KGRhdGFSZXQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YVJldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKiEvXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KSovXG4gICAgICAgICAgICAgICAgLy8gdmFyIHRhZ09iaiA9IFRhZ3MuZ2V0VGFnT2JqZWN0KHRhZylcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGFnT2JqLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyAgIHJldHVybiBUb3BpY3MudG9waWNzQnlUYWcodGFnKS5vbmNlKCd2YWx1ZScsIGZ1bmN0aW9uIChzbmFwKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGV4dGVuZCh7fSwgdGFnT2JqLiR2YWx1ZSwgc25hcC52YWwoKSkpXG4gICAgICAgICAgICAgICAgLy8gICAgIHJldHVybiBleHRlbmQoe30sIHRhZ09iai4kdmFsdWUsIHNuYXAudmFsKCkpXG4gICAgICAgICAgICAgICAgLy8gICB9KVxuICAgICAgICAgICAgICAgIC8vIH0pXG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGZiLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIHZhciBkYXRhID0gc25hcHNob3QudmFsKClcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbihkYXRhU25hcCkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHZhciBpbmRleCA9IHdvcmQuaW5kZXhPZignICcpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdmFyIGZpcnN0ID0gZGF0YVNuYXAuTmFtZS5zdWJzdHJpbmcoMCwgaW5kZXgpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdmFyIGxhc3QgPSB3b3JkLnN1YnN0cmluZyhpbmRleCArIDEpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdmFyIGNhbmRpZGF0ZSA9IGRhdGFTbmFwLk5hbWVcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBpZiAoY2FuZGlkYXRlLmluZGV4T2YoZmlyc3QpID49IDAgJiYgY2FuZGlkYXRlLmluZGV4T2YobGFzdCkgPj0gMClcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgIHJlc29sdmUoZGF0YVNuYXAuQ0lEKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgIHJlamVjdCgnU29tZSBzb3J0IG9mIGZhaWx1cmUnKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyB9KVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy50b3BpY3NCeVRhZyh0YWcpXG4gICAgICAgICAgICAgIC8vIC5vbmNlKCd2YWx1ZScsIGZ1bmN0aW9uKHNuYXApe1xuICAgICAgICAgICAgICAvLyB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG5cbiAgICAgIC8vIFRvcGljIGxhbmRpbmcgcGFnZVxuICAgICAgLnN0YXRlKCd0b3BpYycsIHtcbiAgICAgICAgdXJsOiAnL3tTbHVnfScsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAvKlNsdWc6IGZ1bmN0aW9uICgkc3RhdGVQYXJhbXMsJHN0YXRlLEF1dGgpIHtcbiAgICAgICAgICAgICRzdGF0ZVBhcmFtcy5TbHVnID0gZGVjb2RlVVJJQ29tcG9uZW50KCRzdGF0ZVBhcmFtcy5TbHVnKVxuICAgICAgICAgICAgaWYoJHN0YXRlUGFyYW1zLlNsdWcgPT0gJycpe1xuICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2Rhc2hib2FyZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0qL1xuICAgICAgICB9LFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnVG9waWNMYW5kaW5nQ3RybCBhcyB0b3BpY0xhbmRpbmdDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndG9waWNzL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICBpc093bmVyOiBmdW5jdGlvbiAoQXV0aCwgVXNlcnMsICRzdGF0ZVBhcmFtcywgVG9waWNzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRvcGljVWlkID0gJydcbiAgICAgICAgICAgICAgICAvLyBJZiB1c2VyIGxvZ2luLCBjaGVjayBpZiB0aGV5IGFyZSB0aGUgdG9waWMgb3duZXJcbiAgICAgICAgICAgICAgICBpZiAoQXV0aC5yZWYuZ2V0QXV0aCgpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmZvcnRvcGljKCRzdGF0ZVBhcmFtcy5TbHVnKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YVswXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdG9waWNVaWQgPSBkYXRhWzBdLnVpZFxuICAgICAgICAgICAgICAgICAgICAgIGlmIChBdXRoLnJlZi5nZXRBdXRoKCkudWlkID09IHRvcGljVWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdG9waWNMYW5kaW5nOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmZvcnRvcGljKCRzdGF0ZVBhcmFtcy5TbHVnKS4kbG9hZGVkKCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHJlcGx5TGlzdDogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgVG9waWNzLCAkc3RhdGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9waWNLZXkgPSAnJ1xuICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZm9ydG9waWMoJHN0YXRlUGFyYW1zLlNsdWcpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZGF0YVswXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcGljS2V5ID0gZGF0YVswXS4kaWRcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndG9waWMtbm90Zm91bmQnKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5yZXBseUxpc3QodG9waWNLZXkpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdmlld0RhdGE6IGZ1bmN0aW9uICgkc3RhdGVQYXJhbXMsIFRvcGljcywgVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9waWNLZXksIHZpZXdzXG4gICAgICAgICAgICAgICAgdmFyIHRpbWUgPSBtb21lbnQoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgdmFyIGhpc3RvcnlPYmogPSB7J3VzZXJJUCc6ICcnLCAnY3JlYXRlZCc6IHRpbWV9XG4gICAgICAgICAgICAgICAgVXNlcnMuZ2V0TG9jYXRpb25JUCgpLnN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGhpc3RvcnlPYmoudXNlcklQID0gZGF0YS5kYXRhXG4gICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgaGlzdG9yeU9iai51c2VySVAgPSBkYXRhLmRhdGFcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZ2V0VG9waWNCeVNsdWcoJHN0YXRlUGFyYW1zLlNsdWcpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZGF0YVswXS4kaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcGljS2V5ID0gZGF0YVswXS4kaWRcbiAgICAgICAgICAgICAgICAgICAgdmlld3MgPSBUb3BpY3MuZ2V0Vmlld3ModG9waWNLZXkpXG5cbiAgICAgICAgICAgICAgICAgICAgdmlld3Mub2JqLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuY291bnQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlld3MucmVmLmNoaWxkKCdjb3VudCcpLnNldCgxKVxuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3cy5yZWYuY2hpbGQoJ2NvdW50Jykuc2V0KGRhdGEuY291bnQgKyAxKVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgdWlkID0gYXV0aC51aWRcbiAgICAgICAgICAgICAgICAgICAgICB2aWV3cy5yZWYuY2hpbGQoJ2hpc3RvcnknKS5jaGlsZCh1aWQpLnB1c2goKS5zZXQoaGlzdG9yeU9iailcbiAgICAgICAgICAgICAgICAgICAgICBVc2Vycy51c2VyUmVmKGF1dGgudWlkKS5jaGlsZCgndmlld3MnKS5jaGlsZCh0b3BpY0tleSkucHVzaCgpLnNldChoaXN0b3J5T2JqKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHZpZXdzLm9ialxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGZvbGxvd2VyczogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgVG9waWNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5nZXRUb3BpY0J5U2x1Zygkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIHZhciB0b3BpY0tleSA9IGRhdGFbMF0uJGlkXG4gICAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmdldEZvbGxvd2Vycyh0b3BpY0tleSkub2JqLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIFRvcGljIG5vdCBmb3VuZFxuICAgICAgLnN0YXRlKCd0b3BpYy1ub3Rmb3VuZCcsIHtcbiAgICAgICAgdXJsOiAnL2Vyci9ub3Rmb3VuZCdcbiAgICAgIH0pXG5cbiAgICAgIC8vIFByb2ZpbGUgbGFuZGluZyBwYWdlXG4gICAgICAuc3RhdGUoJ3Byb2ZpbGUnLCB7XG4gICAgICAgIHVybDogJy9wcm9maWxlL3tOYW1lfScsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ3RybCBhcyBwcm9maWxlQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGUvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uIChBdXRoLCBVc2VycywgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgaWYgKEF1dGgucmVmLmdldEF1dGgoKSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFVzZXJzLmdldFByb2ZpbGVCeVVzZXJuYW1lKCRzdGF0ZVBhcmFtcy5OYW1lKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAocHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvZmlsZVswXS4kaWQgPT0gQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdXNlclBvc3RzOiBmdW5jdGlvbiAoVXNlcnMsIFRvcGljcywgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVzZXJzLmdldFByb2ZpbGVCeVVzZXJuYW1lKCRzdGF0ZVBhcmFtcy5OYW1lKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAocHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICAgaWYgKHByb2ZpbGVbMF0uJGlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmNyZWF0ZWRCeShwcm9maWxlWzBdLiRpZClcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9maWxlOiBmdW5jdGlvbiAoJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRyb290U2NvcGUsIEF1dGgsIFVzZXJzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVzZXJzLmdldFByb2ZpbGVCeVVzZXJuYW1lKCRzdGF0ZVBhcmFtcy5OYW1lKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAocHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb2ZpbGVcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnaGVhZGVyQHByb2ZpbGUnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gUHJvZmlsZSBsYW5kaW5nIHBhZ2VcbiAgICAgIC8vIEBwcm9maWxlQ3RybFxuICAgICAgLnN0YXRlKCdhY2Njb3VudEVkaXQnLCB7XG4gICAgICAgIHVybDogJy9hY2NvdW50L2VkaXQnLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICdwYXNzd29yZEVkaXRAYWNjY291bnRFZGl0Jzoge1xuICAgICAgICAgICAgdXJsOiAnL2FjY291bnQvY2hhbmdlUGFzc3dvcmQnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlL3Bhc3N3ZC5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ3VzZXJFZGl0QGFjY2NvdW50RWRpdCc6IHtcbiAgICAgICAgICAgIHVybDogJy9hY2NvdW50L2VkaXQtZm9ybScsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGUvZWRpdC1mb3JtLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZmlsZS9lZGl0Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICB1c2VyUG9zdHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaXNPd25lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHByb2ZpbGU6IGZ1bmN0aW9uICgkc3RhdGUsICRyb290U2NvcGUsIEF1dGgsIFVzZXJzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGguYXV0aC4kcmVxdWlyZUF1dGgoKS50aGVuKGZ1bmN0aW9uIChhdXRoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVXNlcnMuZ2V0UHJvZmlsZShhdXRoLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHByb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2ZpbGUuZGlzcGxheU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvZmlsZVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnZ2V0X3N0YXJ0ZWQnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBhdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLnN0YXRlKCdhY2NvdW50UGFzc3dvcmQnLCB7XG4gICAgICAgIHVybDogJy9hY2NvdW50L2NoYW5nZVBhc3N3b3JkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlL3Bhc3N3ZC5odG1sJ1xuICAgICAgfSlcblxuICAgICAgLnN0YXRlKCdhY2NvdW50VXNlckVkaXQnLCB7XG4gICAgICAgIHVybDogJy9hY2NvdW50L2VkaXQtZm9ybScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZmlsZS9lZGl0LWZvcm0uaHRtbCdcbiAgICAgIH0pXG5cbiAgICAgIC8vIERhc2hib2FyZFxuICAgICAgLy8gQHByb2ZpbGVDdHJsXG4gICAgICAuc3RhdGUoJ2Rhc2hib2FyZCcsIHtcbiAgICAgICAgdXJsOiAnL3VzZXIvZGFzaGJvYXJkJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwgYXMgZGFzaGJvYXJkQ3RybCcsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ3RybCBhcyBwcm9maWxlQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rhc2hib2FyZC9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgdXNlclBvc3RzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9maWxlOiBmdW5jdGlvbiAoJHN0YXRlLCAkcm9vdFNjb3BlLCBBdXRoLCBVc2Vycykge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkudGhlbihmdW5jdGlvbiAoYXV0aCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFVzZXJzLmdldFByb2ZpbGUoYXV0aC51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIG5vIHN0YXQgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGlmICghcHJvZmlsZS5zdGF0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgVXNlcnMudXNlclJlZihhdXRoLnVpZCkuY2hpbGQoJ3N0YXQvdXB2b3RlZC9jb3VudCcpLnNldCgwKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCdzdGF0L3Bvc3RlZC9jb3VudCcpLnNldCgwKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCdzdGF0L2NvbW1lbnQvY291bnQnKS5zZXQoMClcbiAgICAgICAgICAgICAgICAgICAgICBVc2Vycy51c2VyUmVmKGF1dGgudWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dlci9jb3VudCcpLnNldCgwKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2luZy9jb3VudCcpLnNldCgwKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgbm8gZGlzcGxheW5hbWUgLSBnbyB0byBnZXRfc3RhcnRlZFxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvZmlsZS5kaXNwbGF5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9maWxlXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdnZXRfc3RhcnRlZCcpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgYXV0aDogZnVuY3Rpb24gKCRzdGF0ZSwgVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2hlYWRlckBkYXNoYm9hcmQnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIEZvbGxsb3cgQ2F0ZWdvcnlcbiAgICAgIC8vIEBwcm9maWxlQ3RybFxuICAgICAgLnN0YXRlKCdmb2xsb3dfY2F0ZXMnLCB7XG4gICAgICAgIHVybDogJy91c2VyL2ZvbGxvdy1jYXRlZ29yaWVzJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXV0aC9mb2xsb3ctY2F0ZWdvcmllcy5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgdXNlclBvc3RzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9maWxlOiBmdW5jdGlvbiAoVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlKGF1dGgudWlkKS4kbG9hZGVkKClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBhdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnaGVhZGVyQGZvbGxvd19jYXRlcyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90b29sYmFyL21haW5fdG9vbGJhci5odG1sJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gR2V0dGluZyBzdGFydGVkXG4gICAgICAvLyBAcHJvZmlsZUN0cmxcbiAgICAgIC5zdGF0ZSgnZ2V0X3N0YXJ0ZWQnLCB7XG4gICAgICAgIHVybDogJy91c2VyL2dldF9zdGFydGVkJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXV0aC9nZXRfc3RhcnRlZC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgdXNlclBvc3RzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9maWxlOiBmdW5jdGlvbiAoVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlKGF1dGgudWlkKS4kbG9hZGVkKClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBhdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnaGVhZGVyQGdldF9zdGFydGVkJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvdXNlci9sb2dpbicsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXV0aC9sb2dpbi5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2xvZ2luLWZvcm1AbG9naW4nOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC9sb2dpbi1mb3JtLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgICB1cmw6ICcvdXNlci9yZWdpc3RlcicsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2F1dGgvcmVnaXN0ZXIuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICByZXF1aXJlTm9BdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBBdXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICByZXR1cm4gZXJyb3JcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpXG4gIH0pXG5cbiAgLmZpbHRlcignb3JkZXJPYmplY3RCeScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGl0ZW1zLCBmaWVsZCwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGZpbHRlcmVkID0gW11cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChpdGVtcywgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgZmlsdGVyZWQucHVzaChpdGVtLiRpZCkuc2V0KGl0ZW0pXG4gICAgICB9KVxuICAgICAgZmlsdGVyZWQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gKGFbZmllbGRdID4gYltmaWVsZF0gPyAxIDogLTEpXG4gICAgICB9KVxuICAgICAgaWYgKHJldmVyc2UpIGZpbHRlcmVkLnJldmVyc2UoKVxuICAgICAgcmV0dXJuIGZpbHRlcmVkXG4gICAgfVxuICB9KVxuXG4gIC5maWx0ZXIoJ2RlY29kZVVSSScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0ID8gZGVjb2RlVVJJKHRleHQpIDogJydcbiAgICB9XG4gIH0pXG5cbiAgLy8gRm9ybWF0dGluZyB0ZXh0cyB0byBpbmNsdWRlIG5ldyBsaW5lXG4gIC5maWx0ZXIoJ25sMmJyJywgZnVuY3Rpb24gKCRzY2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0ID8gJHNjZS50cnVzdEFzSHRtbCh0ZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKSkgOiAnJ1xuICAgIH1cbiAgfSlcblxuICAuY29uc3RhbnQoJ0ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vYm14eXouZmlyZWJhc2Vpby5jb20vJylcblxuZnVuY3Rpb24gc2hvdyAoZGF0YSkge1xuICBjb25zb2xlLmxvZyhkYXRhKVxuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMilcbn1cblxuLy8gZm9yIGpvaW5pbmcgLSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9rYXRvd3VsZi82NTk4MjM4XG5mdW5jdGlvbiBleHRlbmQgKGJhc2UpIHtcbiAgdmFyIHBhcnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgaWYgKHAgJiYgdHlwZW9mIChwKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGsgaW4gcCkge1xuICAgICAgICBpZiAocC5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgIGJhc2Vba10gPSBwW2tdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBiYXNlXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuICAuY29udHJvbGxlcignQXV0aEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsQXV0aCwgVXNlcnMsICRzdGF0ZSwkcm9vdFNjb3BlLCRtZFNpZGVuYXYsJHRyYW5zbGF0ZSwgJGNvb2tpZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90aVNlcnZpY2UsJG5vdGlmaWNhdGlvbil7XHJcbiAgICB2YXIgYXV0aEN0cmwgPSB0aGlzO1xyXG5cclxuICAgIC8vQXNrIGZvciBub3RpZmljYXRpb24gcGVybWlzc2lvblxyXG4gICAgJG5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbigpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChwZXJtaXNzaW9uKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2cocGVybWlzc2lvbik7IC8vIGRlZmF1bHQsIGdyYW50ZWQsIGRlbmllZFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAvL1BhcnNlclxyXG4gICAgYXV0aEN0cmwuYXV0aCAgICAgPSBBdXRoO1xyXG4gICAgYXV0aEN0cmwudXNlcnMgICAgPSBVc2VycztcclxuICAgIGF1dGhDdHJsLm5vdGlmaWNhdGlvbiA9IE5vdGlTZXJ2aWNlO1xyXG5cclxuXHJcbiAgICBpZihBdXRoLnJlZi5nZXRBdXRoKCkgIT0gbnVsbCApe1xyXG4gICAgICBhdXRoQ3RybC5wcm9maWxlICA9IGF1dGhDdHJsLnVzZXJzLmdldFByb2ZpbGUoQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCk7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICBhdXRoQ3RybC5wcm9maWxlID0nJ1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBhdXRoQ3RybC51c2VyID0ge1xyXG4gICAgICBlbWFpbDogJycsXHJcbiAgICAgIHBhc3N3b3JkOiAnJ1xyXG4gICAgfTtcclxuXHJcblxyXG5cclxuICAgIC8vR2V0IHRoZSBiYWRnZSBub3RpZmljYXRpb25cclxuICAgIC8qYXV0aEN0cmwuYmFkZ2VOb3RpZmljYXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICByZXR1cm4gYXV0aEN0cmwubm90aWZpY2F0aW9uLmFkZEFyckNoaWxkKGF1dGhDdHJsLnByb2ZpbGUuJGlkICsgJy91bnJlYWQnKS4kbG9hZGVkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXV0aEN0cmwuYmFkZ2VWYWx1ZSA9IGF1dGhDdHJsLmJhZGdlTm90aWZpY2F0aW9uO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKGF1dGhDdHJsLmJhZGdlTm90aWZpY2F0aW9uKTsqL1xyXG5cclxuICAgICRzY29wZS5iYWRnZU5vdGlmY2F0aW9uID0gYXV0aEN0cmwuYmFkZ2VOb3RpZmljYXRpb247XHJcblxyXG4gICAgLy9SZXNldCBjb3VudGVyXHJcbiAgICBhdXRoQ3RybC5yZXNldENvdW50ZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgICBhdXRoQ3RybC5ub3RpZmljYXRpb24ucmVzZXRVbnJlYWQoYXV0aEN0cmwucHJvZmlsZS4kaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGF1dGhDdHJsLmNoYW5nZVZhbCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdiYWRnZSB2YWx1ZSAnK2F1dGhDdHJsLmJhZGdlTm90aWZpY2F0aW9uLiR2YWx1ZSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS4kd2F0Y2goXCJuYW1lXCIsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICBpZiAoJHNjb3BlLm5hbWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICRzY29wZS5ncmVldGluZyA9IFwiR3JlZXRpbmdzIFwiICsgJHNjb3BlLm5hbWU7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICAvL0NoYW5nZSBsYW5ndWFnZVxyXG4gICAgYXV0aEN0cmwudG9nZ2xlTGFuZyA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XHJcbiAgICAgICR0cmFuc2xhdGUudXNlKGxhbmdLZXkpO1xyXG4gICAgICAvLyBTZXR0aW5nIGEgY29va2llXHJcbiAgICAgICRjb29raWVzLnB1dCgndXNlckxhbmcnLCBsYW5nS2V5KTtcclxuICAgICAgLy9JZiB1c2VyIHJlZ2lzdGVyZWQgLSB1cGRhdGUgdGhpcyBpbiB0aGVpciBwcmVmZXJlbmNlXHJcbiAgICAgIGlmKEF1dGgucmVmLmdldEF1dGgoKSl7XHJcbiAgICAgICAgYXV0aEN0cmwudXNlcnMudXNlckFyclJlZihBdXRoLnJlZi5nZXRBdXRoKCkudWlkKS51cGRhdGUoe1wibGFuZ1wiOmxhbmdLZXl9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9DaGVja2sgdXNlciBzZWxlY3RlZCBsYW5ndWFnZVxyXG4gICAgaWYoIWF1dGhDdHJsLnByb2ZpbGUubGFuZyl7XHJcbiAgICAgIGlmKCRjb29raWVzLmdldCgndXNlckxhbmcnKSl7XHJcbiAgICAgICAgYXV0aEN0cmwudG9nZ2xlTGFuZygkY29va2llcy5nZXQoJ3VzZXJMYW5nJykpO1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICBhdXRoQ3RybC50b2dnbGVMYW5nKCdFbmcnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgYXV0aEN0cmwudG9nZ2xlTGFuZyhhdXRoQ3RybC5wcm9maWxlLmxhbmcpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvL0xvZ2luXHJcbiAgICBhdXRoQ3RybC5sb2dpbiA9IGZ1bmN0aW9uICgpe1xyXG4gICAgICBhdXRoQ3RybC5hdXRoLmF1dGguJGF1dGhXaXRoUGFzc3dvcmQoYXV0aEN0cmwudXNlcikudGhlbihmdW5jdGlvbiAoYXV0aCl7XHJcbiAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQnKTtcclxuICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKXtcclxuICAgICAgICBhdXRoQ3RybC5lcnJvciA9IGVycm9yO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLy9Mb2dvdXRcclxuICAgIGF1dGhDdHJsLmxvZ291dCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIEF1dGguYXV0aC4kdW5hdXRoKCk7XHJcbiAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcclxuICAgIH1cclxuXHJcbiAgICAvL1JlZ2lzdGVyIHVzZXJcclxuICAgIGF1dGhDdHJsLnJlZ2lzdGVyID0gZnVuY3Rpb24gKCl7XHJcbiAgICAgIEF1dGguYXV0aC4kY3JlYXRlVXNlcihhdXRoQ3RybC51c2VyKS50aGVuKGZ1bmN0aW9uICh1c2VyKXtcclxuICAgICAgICBhdXRoQ3RybC5sb2dpbigpO1xyXG4gICAgICB9LCBmdW5jdGlvbiAoZXJyb3Ipe1xyXG4gICAgICAgIGF1dGhDdHJsLmVycm9yID0gZXJyb3I7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgYXV0aEN0cmwudG9nZ2xlUmlnaHQgPSBidWlsZFRvZ2dsZXIoJ3JpZ2h0Jyk7XHJcbiAgICBmdW5jdGlvbiBidWlsZFRvZ2dsZXIobmF2SUQpIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRtZFNpZGVuYXYobmF2SUQpXHJcbiAgICAgICAgICAudG9nZ2xlKClcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9KTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5mYWN0b3J5KCdBdXRoJywgZnVuY3Rpb24oJGZpcmViYXNlQXV0aCwgRmlyZWJhc2VVcmwpe1xuICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwpO1xuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aChyZWYpO1xuXG4gICAgdmFyIEF1dGggPSB7XG4gICAgICByZWY6cmVmLFxuICAgICAgYXV0aDogYXV0aCxcblxuICAgICAgZ2V0VWlkOmZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1aWQgPSByZWYuZ2V0QXV0aCgpO1xuICAgICAgICBpZih1aWQgIT0gbnVsbCApe1xuICAgICAgICAgIHJldHVybiByZWYuZ2V0QXV0aCgpLnVpZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9XG5cbiAgICByZXR1cm4gQXV0aDtcbiAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuICAuY29udHJvbGxlcignQ2F0ZUN0cmwnLCBmdW5jdGlvbigkc3RhdGUsIENhdGVnb3J5LGNhdGVOYW1lLGNhdGVUb3BpY3Mpe1xyXG4gICAgdmFyIGNhdGVDdHJsID0gdGhpcztcclxuXHJcbiAgICAvL1BhcnNlcnNcclxuICAgIGNhdGVDdHJsLmNhdGVOYW1lICAgPSBjYXRlTmFtZTtcclxuICAgIGNhdGVDdHJsLmNhdGVnb3J5ICAgPSBDYXRlZ29yeTtcclxuICAgIGNhdGVDdHJsLmNhdGVUb3BpY3MgPSBjYXRlVG9waWNzO1xyXG5cclxuICB9KTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG5cbiAgLy9Ub3BpYyBsaXN0XG4gIC5mYWN0b3J5KCdDYXRlU2VydmljZScsIGZ1bmN0aW9uKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXkgLCBGaXJlYmFzZVVybCl7XG4gICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnY2F0ZWdvcmllcycpO1xuICAgIHZhciBjYXRlZ29yaWVzID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgQ2F0ZSA9IHtcblxuICAgICAgbmFtZTogZnVuY3Rpb24odG9waWNfc2x1Zyl7XG4gICAgICAgIHZhciBkYXRhID0gcmVmLm9yZGVyQnlDaGlsZChcInNsdWdcIikuZXF1YWxUbyh0b3BpY19zbHVnKTtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChkYXRhKTtcbiAgICAgIH0sXG5cbiAgICAgIGZvcnRvcGljOiBmdW5jdGlvbih0b3BpY19zbHVnKXtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdCh1c2Vyc1JlZi5jaGlsZCh1aWQpKTtcbiAgICAgIH0sXG5cbiAgICAgIGFkZENoaWxkOiBmdW5jdGlvbihjaGlsZG5hbWUpe1xuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKGNoaWxkbmFtZSlcbiAgICAgIH0sXG5cbiAgICAgIGZvbGxvd0xpc3Q6ZnVuY3Rpb24odWlkKXtcbiAgICAgICAgdmFyIGRhdGEgPSByZWYub3JkZXJCeUNoaWxkKFwibmV3cy9mb2xsb3dlclwiKS5lcXVhbFRvKHVpZCk7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShkYXRhKTtcbiAgICAgIH0sXG5cbiAgICAgIHVuRm9sbG93OmZ1bmN0aW9uKHNsdWcsdWlkKXtcbiAgICAgICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnY2F0ZWdvcmllcy8nK3NsdWcrJy9mb2xsb3dlci8nK3VpZCk7XG4gICAgICAgIHJlZi5yZW1vdmUoKTtcbiAgICAgIH0sXG5cbiAgICAgIHVzZXJGb2xsb3c6ZnVuY3Rpb24oc2x1Zyx1aWQpe1xuICAgICAgICB2YXIgZm9sbG93PWZhbHNlO1xuICAgICAgICB2YXIgcmVmICAgID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydjYXRlZ29yaWVzLycrc2x1ZysnL2ZvbGxvd2VyLycrdWlkKTtcbiAgICAgICAgcmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgIGZvbGxvdyA9IHNuYXBzaG90LmV4aXN0cygpO1xuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gZm9sbG93O1xuICAgICAgfSxcbiAgICAgIGFycjogJGZpcmViYXNlQXJyYXkocmVmKSxcbiAgICAgIGFsbDpjYXRlZ29yaWVzXG4gICAgfVxuICAgIHJldHVybiBDYXRlO1xuICB9KVxuXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcblxuICAvL1RvcGljIGxpc3RcbiAgLmZhY3RvcnkoJ1Bvc3QnLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QsIEZpcmViYXNlVXJsKXtcbiAgICB2YXIgcmVmICAgID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKyd0b3BpY3MnKTtcbiAgICB2YXIgdG9waWNzID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgVFMgPSB7XG4gICAgICB0b3BpY05hbWU6IGZ1bmN0aW9uKHRvcGljX3NsdWcpe1xuICAgICAgICB2YXIgZGF0YSA9IHJlZi5vcmRlckJ5Q2hpbGQoXCJzbHVnXCIpLmVxdWFsVG8odG9waWNfc2x1Zyk7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QoZGF0YSk7XG4gICAgICB9LFxuICAgICAgZm9ydG9waWM6IGZ1bmN0aW9uKHRvcGljX3NsdWcpe1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHVzZXJzUmVmLmNoaWxkKHVpZCkpO1xuICAgICAgfSxcbiAgICAgIGFsbDp0b3BpY3NcbiAgICB9XG4gICAgcmV0dXJuIFRTO1xuICB9KVxuXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmNvbnRyb2xsZXIoJ0Rhc2hib2FyZEN0cmwnLCBmdW5jdGlvbihBdXRoLCAkc3RhdGUsQ2F0ZWdvcnksQ2F0ZVNlcnZpY2UsVGFncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCwgJG1kU2lkZW5hdiwgJGxvZykge1xuICAgIHZhciBkYXNoYm9hcmRDdHJsID0gdGhpcztcblxuICAgIGRhc2hib2FyZEN0cmwuYXV0aCA9IEF1dGg7XG5cbiAgICBkYXNoYm9hcmRDdHJsLmNhdGUgPSBDYXRlU2VydmljZTtcbiAgICBkYXNoYm9hcmRDdHJsLmNhdGVnb3JpZXMgICAgICA9IENhdGVnb3J5LmFsbDtcbiAgICBkYXNoYm9hcmRDdHJsLnRvcGljX2dyaWQgID0gZmFsc2U7XG4gICAgZGFzaGJvYXJkQ3RybC50YWdzICAgICAgICA9IFRhZ3MuYXJyO1xuXG4gICAgZGFzaGJvYXJkQ3RybC51c2VyQ2F0ZUZvbGxvdyAgPSBbXTtcbiAgICBkYXNoYm9hcmRDdHJsLmNhdGVJc0ZvbGxvdyAgICA9IFtdO1xuICAgIGRhc2hib2FyZEN0cmwuZm9sbG93TGlzdCAgICAgID0gJyc7XG5cblxuICAgIC8vQ2xvc2UgU2lkZSBiYXJcbiAgICBkYXNoYm9hcmRDdHJsLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgJG1kU2lkZW5hdigncmlnaHQnKS5jbG9zZSgpO1xuICAgIH07XG5cblxuICAgIGRhc2hib2FyZEN0cmwuZm9sbG93Q2F0ZSA9IGZ1bmN0aW9uKGNhdGVfc2x1Zyl7XG4gICAgICBkYXNoYm9hcmRDdHJsLmNhdGUuYWRkQ2hpbGQoY2F0ZV9zbHVnKycvZm9sbG93ZXInKVxuICAgICAgICAuY2hpbGQoQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCkucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcbiAgICB9XG4gIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG5cbiAgLmRpcmVjdGl2ZSgnbWFpbkhlYWRlcicsZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICAgICAnRScsXG4gICAgICB0cmFuc2NsdWRlOiAgIHRydWUsXG4gICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICB9XG5cbiAgfSlcblxuICAvL0JhZGdlIG5vdGlmaWNhdGlvblxuICAuZGlyZWN0aXZlKCdiYWRnZU5vdGlmaWNhdGlvbicsZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICAgICAnRScsXG4gICAgICB0cmFuc2NsdWRlOiAgIHRydWUsXG4gICAgICBjb250cm9sbGVyOiAgICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogICd0ZW1wbGF0ZXMvaHRtbC9iYWRnZS1ub3RpZmljYXRpb24uaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICBub3RpZmljYXRpb246ICc9J1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuXG4gIC8vTGlzdCBvZiBjYXRlZ29yaWVzIG9uIHRoZSBzaWRlcmJhclxuICAuZGlyZWN0aXZlKCdyZXZpZXdTY29yZScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICAgICAnRScsXG4gICAgICB0cmFuc2NsdWRlOiAgIHRydWUsXG4gICAgICBjb250cm9sbGVyOiAgICdUb3BpY0N0cmwgYXMgdG9waWNDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAgJ3RlbXBsYXRlcy9odG1sL3Jldmlldy1zdW1tYXJ5LWxpc3QuaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICByZXZpZXc6ICc9J1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuXG4gIC8vRm9sbG93IEJ1dHRvblxuICAuZGlyZWN0aXZlKCd1c2VyRm9sbG93ZXJCdG4nLGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAgICAgJ0UnLFxuICAgICAgdHJhbnNjbHVkZTogICB0cnVlLFxuICAgICAgY29udHJvbGxlcjogICAnVG9waWNDdHJsIGFzIHRvcGljQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogICd0ZW1wbGF0ZXMvaHRtbC9mb2xsb3ctdXNlci5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIGZvbGxvdzogJz0nXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG5cbiAgLy9DYXRlZ29yeSBmb2xsb3cgYnV0dG9uXG4gIC5kaXJlY3RpdmUoJ2NhdGVGb2xsb3dCdG4nLGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRyb2xsZXI6ICdEYXNoYm9hcmRDdHJsIGFzIGRhc2hib2FyZEN0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC9jYXRlZ29yeS1mb2xsb3ctYnRuLmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgY2F0ZTogJz0nXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIC8vTGlzdCBvZiBjYXRlZ29yaWVzIG9uIHRoZSBzaWRlcmJhclxuICAuZGlyZWN0aXZlKCd0b3BpY0dyaWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRyb2xsZXI6ICdEYXNoYm9hcmRDdHJsIGFzIGRhc2hib2FyZEN0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC9jYXRlZ29yeS1ncmlkLmh0bWwnXG4gICAgfVxuICB9KVxuXG4gIC8vR3JpZCBUYWdzIGZvciBzaWRlYmFyXG4gIC5kaXJlY3RpdmUoJ3RhZ0dyaWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRyb2xsZXI6ICdEYXNoYm9hcmRDdHJsIGFzIGRhc2hib2FyZEN0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC90YWctZ3JpZC5odG1sJ1xuICAgIH1cbiAgfSlcblxuXG4gIC5kaXJlY3RpdmUoJ3RvcGljQ3JlYXRlJywgZnVuY3Rpb24oKXtcblxuICAgIHJldHVybiB7XG4gICAgICBjb250cm9sbGVyOiAnVG9waWNDdHJsIGFzIHRvcGljQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL3RvcGljLWNyZWF0ZS5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIHRvcGljOiAnPSdcbiAgICAgIH1cbiAgICB9XG5cbiAgfSlcblxuXG4gIC5kaXJlY3RpdmUoJ3RvcGljTGlzdCcsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29udHJvbGxlcjogJ1RvcGljQ3RybCBhcyB0b3BpY0N0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC90b3BpYy1saXN0Lmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgdG9waWNzOiAnPSdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cblxuICAuZGlyZWN0aXZlKCd0b3BpY0FjdGlvbnNDYXJkJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb250cm9sbGVyOiAnVG9waWNDdHJsIGFzIHRvcGljQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL3RvcGljLWFjdGlvbnMtY2FyZC5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIHRvcGljOiAnPSdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cblxuICAvL2ZvciB0YWdzIC0gbWF4IHRhZ3NcbiAgLmRpcmVjdGl2ZSgnZW5mb3JjZU1heFRhZ3MnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ0N0cmwpIHtcbiAgICAgIHZhciBtYXhUYWdzID0gYXR0cnMubWF4VGFncyA/IHBhcnNlSW50KGF0dHJzLm1heFRhZ3MsICc0JykgOiBudWxsO1xuXG4gICAgICBuZ0N0cmwuJHBhcnNlcnMucHVzaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgJiYgbWF4VGFncyAmJiB2YWx1ZS5sZW5ndGggPiBtYXhUYWdzKSB7XG4gICAgICAgICAgdmFsdWUuc3BsaWNlKHZhbHVlLmxlbmd0aCAtIDEsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5jb250cm9sbGVyKCdIb21lQ3RybCcsIGZ1bmN0aW9uKCRzdGF0ZSxDYXRlZ29yeSxUb3BpY3MsZmVlZCl7XG4gICAgdmFyIGhvbWVDdHJsID0gdGhpcztcblxuICAgIGhvbWVDdHJsLnRvcGljcyA9IENhdGVnb3J5O1xuICAgIGhvbWVDdHJsLnRvcGljcyA9IFRvcGljcztcbiAgICBob21lQ3RybC5mZWVkICAgPSBmZWVkO1xuICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuY29uZmlnKFsnJHRyYW5zbGF0ZVByb3ZpZGVyJywgZnVuY3Rpb24gKCR0cmFuc2xhdGVQcm92aWRlcikge1xuICAgICR0cmFuc2xhdGVQcm92aWRlci50cmFuc2xhdGlvbnMoJ0VuZycsIHtcbiAgICAgICdLRVlfREFTSEJPQVJEJzogICdEYXNoYm9hcmQnLFxuICAgICAgJ0tFWV9MQU5HVUFHRVMnOiAgJ0xhbmd1YWdlcycsXG4gICAgICAnS0VZX0hPTUUnOiAgICAgICAnSG9tZScsXG4gICAgICAnS0VZX1JFR0lTVEVSJzogICAnUmVnaXN0ZXInLFxuICAgICAgJ0tFWV9MT0dJTic6ICAgICAgJ0xvZyBpbicsXG4gICAgICAnS0VZX0xPR09VVCc6ICAgICAnTG9nIG91dCcsXG4gICAgICAnS0VZX0ZPTExPVyc6ICAgICAnRm9sbG93JyxcbiAgICAgICdLRVlfRk9MTE9XRVInOiAgICdGb2xsb3dlcicsXG4gICAgICAnS0VZX1VORk9MTE9XJzogICAnVW5mb2xsb3cnLFxuICAgICAgJ0tFWV9GT0xMT1dJTkcnOiAgJ0ZvbGxvd2luZycsXG4gICAgICAnS0VZX1BPU1QnOiAgICAgICAnUG9zdCcsXG4gICAgICAnS0VZX1BPU1RFRCc6ICAgICAnUG9zdGVkJyxcbiAgICAgICdLRVlfVVBWT1RFJzogICAgICdVcHZvdGUnLFxuICAgICAgJ0tFWV9VUFZPVEVEJzogICAgJ1Vwdm90ZWQnLFxuICAgICAgJ0tFWV9EV05fVk9URSc6ICAgJ0Rvd252b3RlJyxcbiAgICAgICdLRVlfRFdOX1ZPVEVEJzogICdEb3dudm90ZWQnLFxuICAgICAgJ0tFWV9WSUVXJzogICAgICAgJ1ZpZXcnLFxuICAgICAgJ0tFWV9SRU1PVkUnOiAgICAgJ1JlbW92ZScsXG4gICAgICAnS0VZX0NBTkNFTCc6ICAgICAnQ2FuY2VsJyxcbiAgICAgICdLRVlfUVVFU1RJT04nOiAgICdRdWVzdGlvbicsXG4gICAgICAnS0VZX1RPUElDJzogICAgICAnVG9waWMnLFxuICAgICAgJ0tFWV9DSEdfUFdEJzogICAgJ0NoYW5nZSBQYXNzd29yZCcsXG4gICAgICAnS0VZX1BBU1NXT1JEJzogICAnUGFzc3dvcmQnLFxuICAgICAgJ0tFWV9PTERfUFdEJzogICAgJ09sZCBQYXNzd29yZCcsXG4gICAgICAnS0VZX05FV19QV0QnOiAgICAnTmV3IFBhc3N3b3JkJyxcbiAgICAgICdLRVlfTkVXX1BXRF9DJzogICdOZXcgcGFzc3dvcmQgY29uZmlybWF0aW9uJyxcbiAgICAgICdLRVlfU0FWRSc6ICAgICAgICdTYXZlJyxcbiAgICAgICdLRVlfU0FWRV9EUkFGVCc6ICdTYXZlIGFzIGRyYWZ0JyxcbiAgICAgICdLRVlfVEFHUyc6ICAgICAgICdUYWdzJyxcbiAgICAgICdLRVlfRVhQTE9SRSc6ICAgICdFeHBsb3JlJyxcbiAgICAgICdLRVlfQ09NTUVOVFMnOiAgICdDb21tZW50cycsXG4gICAgICAnS0VZX1JFUExZJzogICAgICAnUmVwbHknLFxuICAgICAgJ0tFWV9SRVZJRVcnOiAgICAgJ1JldmlldycsXG4gICAgICAnS0VZX0VESVQnOiAgICAgICAnRWRpdCcsXG4gICAgICAnS0VZX1RSRU5EJzogICAgICAnVHJlbmQnLFxuICAgICAgJ0tFWV9UUkVORElORyc6ICAgJ1RyZW5kaW5nJyxcbiAgICAgICdLRVlfV1JJVEVfUkVQTFknOidXcml0ZSBhIHJlcGx5JyxcbiAgICAgICdLRVlfTEFURVNUX0ZFRUQnOidMYXRlc3QgRmVlZCcsXG5cbiAgICAgIC8vUmVtb3ZlIHRvcGljXG4gICAgICAnS0VZX0NPTkZfUkVNT1ZFJzonQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZT8nLFxuICAgICAgJ0tFWV9DT05GX1JFTV9DJzogJ09uY2UgcmVtb3ZlLCB5b3Ugd2lsbCBub3QgYmUgYWJsZXRvIHRvIGdldCB0aGlzIHRvcGljIGJhY2snLFxuXG5cbiAgICAgIC8vU0VOVEVOQ0VcbiAgICAgICdLRVlfV0hBVF9PTl9VUl9NSU5EJzogICdXaGF0XFwncyBvbiB5b3VyIG1pbmQ/JyxcbiAgICAgICdLRVlfWU9VX1dBTlRfRk9MTE9XJzogICdZb3UgbWF5IHdhbnQgdG8gZm9sbG93JyxcbiAgICAgICdLRVlfTk9fQUNDVF9SRUdJU1RFUic6ICdEb25cXCd0IGhhdmUgYWNjb3VudD8gUmVnaXN0ZXInLFxuICAgICAgJ0tFWV9DQU5UX0NITkdfVVNFUic6ICAgJ0RvblxcJ3QgaGF2ZSBhY2NvdW50PyBSZWdpc3RlcicsXG4gICAgICAnS0VZX1lPVVJfQUNDT1VOVCc6ICAgICAnWW91ciBhY2NvdW50JyxcbiAgICAgICdLRVlfTk9USElOR19IRVJFJzogICAgICdOb3RoaW5nIGhlcmUsIHlldCcsXG4gICAgICAnS0VZX1dIT19UT19GT0xMT1cnOiAgICAnV2hvIHRvIGZvbGxvdycsXG4gICAgICAnS0VZX0NBVF9XSUxMX0FQUEVBUic6ICAnRm9sbG93IHNvbWUgY2F0ZWdvcmllcyBhbmQgaXQgd2lsbCBhcHBlYXIgaGVyZScsXG4gICAgICAnS0VZX1dIVF9VUl9TVE9SWSc6ICAgICAnV2hhdFxcJ3MgeW91ciBzdG9yeScsXG4gICAgICAnS0VZX1dSVF9DT01NRU5UJzogICAgICAnV3JpdGUgYSBjb21tZW50JyxcblxuXG5cbiAgICAgIC8vVVNFUiBJTlBVVFxuICAgICAgJ0tFWV9GSVJTVE5BTUUnOiAgJ0ZpcnN0IG5hbWUnLFxuICAgICAgJ0tFWV9MQVNUTkFNRSc6ICAgJ0xhc3QgbmFtZScsXG4gICAgICAnS0VZX0JJUlRIREFZJzogICAnQmlydGhkYXknLFxuICAgICAgJ0tFWV9NT05USCc6ICAgICAgJ01vbnRoJyxcbiAgICAgICdLRVlfREFZJzogICAgICAgICdEYXknLFxuICAgICAgJ0tFWV9FTUFJTCc6ICAgICAgJ0VtYWlsJyxcbiAgICAgICdLRVlfQ09ORl9FTUFJTCc6ICdDb25maXJtIEVtYWlsJyxcbiAgICAgICdLRVlfR0VOREVSJzogICAgICdHZW5kZXInLFxuICAgICAgJ0tFWV9NQUxFJzogICAgICAgJ01hbGUnLFxuICAgICAgJ0tFWV9GRU1BTEUnOiAgICAgJ0ZlbWFsZScsXG4gICAgICAnS0VZX1VTRVJOQU1FJzogICAnVXNlcm5hbWUnLFxuICAgICAgJ0tFWV9MT0NBVElPTic6ICAgJ0xvY2F0aW9uJyxcblxuICAgICAgLy9Vc2VyIEVkaXRcbiAgICAgICdLRVlfRURfUFJPRklMRSc6ICdFZGl0IFByb2ZpbGUnLFxuICAgICAgJ0tFWV9FRF9DSEdfUFdEJzogJ0NoYW5nZSBQYXNzd29yZCcsXG4gICAgICAnS0VZX0VEX1BST0ZJTEUnOiAnRWRpdCBQcm9maWxlJyxcbiAgICAgICdLRVlfRURfU0lURSc6ICAgICdXZWJzaXRlJyxcbiAgICAgICdLRVlfRURfUEhPTkUnOiAgICdQaG9uZScsXG4gICAgICAnS0VZX0VEX0JJTyc6ICAgICAnQmlvZ3JhcGh5JyxcblxuICAgIH0pO1xuXG4gICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnRyYW5zbGF0aW9ucygn4LmE4LiX4LiiJywge1xuICAgICAgJ0tFWV9EQVNIQk9BUkQnOiAgJ+C4q+C5ieC4reC4h+C4l+C4seC5ieC4h+C4q+C4oeC4lCcsXG4gICAgICAnS0VZX0xBTkdVQUdFUyc6ICAn4Lig4Liy4Lip4LiyJyxcbiAgICAgICdLRVlfSE9NRSc6ICAgICAgICfguKvguJnguYnguLLguYHguKPguIEnLFxuICAgICAgJ0tFWV9SRUdJU1RFUic6ICAgJ+C4quC4oeC4seC4hOC4o+C5g+C4iuC5iScsXG4gICAgICAnS0VZX0xPR0lOJzogICAgICAn4LmA4LiC4LmJ4Liy4Liq4Li54LmI4Lij4Liw4Lia4LiaJyxcbiAgICAgICdLRVlfRk9MTE9XJzogICAgICfguJXguLTguJTguJXguLLguKEnLFxuICAgICAgJ0tFWV9QT1NUJzogICAgICAgJ+C5guC4nuC4quC4leC5jCdcbiAgICB9KTtcblxuICAgICR0cmFuc2xhdGVQcm92aWRlci5wcmVmZXJyZWRMYW5ndWFnZSgnZW4nKTtcbiAgfV0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmNvbnRyb2xsZXIoJ05vdGlDdHJsJywgZnVuY3Rpb24oJHN0YXRlLENhdGVnb3J5LFRvcGljcyxOb3RpU2VydmljZSl7XG4gICAgdmFyIG5vdGlDdHJsID0gdGhpcztcblxuXG4gICAgbm90aUN0cmwudG9waWNzID0gVG9waWNzO1xuICAgIG5vdGlDdHJsLmZlZWQgICA9IGZlZWQ7XG4gICAgbm90aUN0cmwubm90aVNlcnZpY2UgPSBOb3RpU2VydmljZTtcblxuICAgIG5vdGlDdHJsLm5vdGlmeVRvID1mdW5jdGlvbih1aWQpe1xuICAgICAgcmV0dXJuIG5vdGlDdHJsLmFyci5wdXNoKHVpZCkuJGFkZCh1aWQpXG4gICAgfVxuICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuXG4gIC5mYWN0b3J5KCdOb3RpU2VydmljZScsIGZ1bmN0aW9uKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXkgLCBGaXJlYmFzZVVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVXNlcnMsJG5vdGlmaWNhdGlvbil7XG4gICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbm90aWZpY2F0aW9uJyk7XG4gICAgdmFyIG5vdGkgPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcbiAgICB2YXIgdXNlcnMgPSBVc2VycztcblxuICAgIHZhciBvYnNlcnZlckNhbGxiYWNrcyA9IFtdO1xuXG5cbiAgICB2YXIgTm90aWZpY2F0aW9uID0ge1xuXG4gICAgICAvL0Rpc3BsYXkgdW5yZWFkXG4gICAgICB1bnJlYWROb3RpZmljYXRpb246ZnVuY3Rpb24odWlkKXtcbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbm90aWZpY2F0aW9uLycrdWlkKycvdW5yZWFkJyk7XG4gICAgICAgIHZhciBjb3VudGVyO1xuICAgICAgICByZWYub24oXCJ2YWx1ZVwiLGZ1bmN0aW9uKHNuYXBzaG90KXtcbiAgICAgICAgICBjb3VudGVyID0gc25hcHNob3QudmFsKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBub3RpZmljYXRpb25fcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydub3RpZmljYXRpb24vJyt1aWQpO1xuICAgICAgICBub3RpZmljYXRpb25fcmVmLm9uKFwiY2hpbGRfYWRkZWRcIixmdW5jdGlvbigpe1xuICAgICAgICAgICRub3RpZmljYXRpb24oJ05ldyBtZXNzYWdlIGZyb20gUWFueWEnLCB7XG4gICAgICAgICAgICBib2R5OiAnSGVsbG8gJyt1aWQsXG4gICAgICAgICAgICBkaXI6ICdhdXRvJyxcbiAgICAgICAgICAgIGxhbmc6ICdlbicsXG4gICAgICAgICAgICB0YWc6ICdteS10YWcnLFxuICAgICAgICAgICAgaWNvbjogJ2h0dHA6Ly93d3cuY2wuY2FtLmFjLnVrL3Jlc2VhcmNoL3NyZy9uZXRvcy9pbWFnZXMvcXNlbnNlLWxvZ28ucG5nJyxcbiAgICAgICAgICAgIC8vZGVsYXk6IDEwMDAsIC8vIGluIG1zXG4gICAgICAgICAgICBmb2N1c1dpbmRvd09uQ2xpY2s6IHRydWUgLy8gZm9jdXMgdGhlIHdpbmRvdyBvbiBjbGlja1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gY291bnRlciA7XG4gICAgICB9LFxuXG4gICAgICAvL05vdGlmeSBmb2xsb3dlcnNcbiAgICAgIG5vdGlmeUZvbGxvd2VyOmZ1bmN0aW9uKHRvcGljSWQsdWlkKXtcbiAgICAgICAgdmFyIHJlZiA9IHVzZXJzLmdldEZvbGxvd2VyKHVpZCk7XG4gICAgICAgIHJlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICBzbmFwc2hvdC5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkU25hcHNob3QpIHtcbiAgICAgICAgICAgIC8vdXBkYXRlIG5vdGlmaWNhdGlvbiBhbmQgZGV0YWlsc1xuICAgICAgICAgICAgTm90aWZpY2F0aW9uLnVwZGF0ZU5vdGlmaWNhdGlvbkNvdW50KHRvcGljSWQsY2hpbGRTbmFwc2hvdC5rZXkoKSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0sXG5cbiAgICAgIC8vQWRkIGRldGFpbCBmb3IgdGhpcyBub3RpZmljdGlhb25cbiAgICAgIG5vdGlmeUxvZzpmdW5jdGlvbih0b3BpY0lkLHVpZCxmcm9tX3VpZCl7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJ1aWQgXCIrdWlkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJmcm9tIHVpZCBcIisgZnJvbV91aWQpO1xuXG4gICAgICAgIE5vdGlmaWNhdGlvbi5hZGRDaGlsZCh1aWQpLnB1c2goKS5zZXQoe1xuICAgICAgICAgIHRvcGljSWQ6ICAgIHRvcGljSWQsXG4gICAgICAgICAgZnJvbTogICAgICAgZnJvbV91aWQsXG4gICAgICAgICAgaXNfcmVhZDogICAgZmFsc2UsXG4gICAgICAgICAgdGltZXN0YW1wOiAgbW9tZW50KCkudG9JU09TdHJpbmcoKVxuICAgICAgICB9KTtcblxuICAgICAgfSxcblxuXG4gICAgICAvL1Jlc2V0IHVucmVhZCBjb3VudGVyXG4gICAgICByZXNldFVucmVhZDpmdW5jdGlvbih1aWQpe1xuICAgICAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydub3RpZmljYXRpb24vJyt1aWQrJy91bnJlYWQnKTtcbiAgICAgICAgcmVmLnNldCgwKTtcbiAgICAgIH0sXG5cblxuICAgICAgLy9VcGRhdGUgbm90aWZpY2F0aW9uXG4gICAgICAvL0BwYXJhbXMgdWlkIC0gd2hvIHRoaXMgbm90aWZpY2F0aW9uIGlzIGdvaW5nIHRvXG4gICAgICB1cGRhdGVOb3RpZmljYXRpb25Db3VudDpmdW5jdGlvbih0b3BpY0lkLHVpZCxmcm9tX3VpZCl7XG5cbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbm90aWZpY2F0aW9uLycrdWlkKycvdW5yZWFkJyk7XG4gICAgICAgIHJlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgICAvL2RlZmF1bHQgdW5yZWFkIGlzIDFcbiAgICAgICAgIGlmKHNuYXBzaG90LnZhbCgpID09ICdudWxsJyl7XG4gICAgICAgICAgICByZWYuc2V0KDEpXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZWYuc2V0KHNuYXBzaG90LnZhbCgpICsgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3JPYmplY3QpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZSByZWFkIGZhaWxlZDogXCIgKyBlcnJvck9iamVjdC5jb2RlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9BZGQgdG8gbG9nXG4gICAgICAgIE5vdGlmaWNhdGlvbi5ub3RpZnlMb2codG9waWNJZCx1aWQsZnJvbV91aWQpO1xuXG4gICAgICB9LFxuXG5cbiAgICAgIGFkZENoaWxkOmZ1bmN0aW9uKGNoaWxkKXtcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZChjaGlsZCk7XG4gICAgICB9LFxuXG4gICAgICBhZGRBcnJDaGlsZDpmdW5jdGlvbihjaGlsZCl7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKGNoaWxkKSk7XG4gICAgICB9LFxuXG4gICAgICBhcnI6ICRmaXJlYmFzZUFycmF5KHJlZiksXG4gICAgICBhbGw6IG5vdGlcbiAgICB9XG4gICAgcmV0dXJuIE5vdGlmaWNhdGlvbjtcbiAgfSlcblxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5jb250cm9sbGVyKCdQbGFjZXNDdHJsJywgZnVuY3Rpb24oJHN0YXRlLCRzY29wZSwkcm9vdFNjb3BlLCAkbWREaWFsb2csICRtZE1lZGlhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vU2VydmljZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUYWdzLCBUb3BpY3MsIEF1dGgsIFVzZXJzLCBTbHVnLExhbmd1YWdlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZUxhbmRpbmcpIHtcblxuICAgIHZhciBwbGFjZXNDdHJsID0gdGhpcztcbiAgICBjb25zb2xlLmxvZyhwbGFjZUxhbmRpbmcpO1xuICAgIHBsYWNlc0N0cmwucGxhY2VMYW5kaW5nID0gcGxhY2VMYW5kaW5nO1xuXG4gIH0pO1xuXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmZhY3RvcnkoJ1BsYWNlcycsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCBGaXJlYmFzZVVybCl7XG5cbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydwbGFjZXMnKTtcbiAgICB2YXIgcGxhY2VEZXRhaWxfcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydwbGFjZXNfZGV0YWlscycpO1xuXG4gICAgdmFyIHBsYWNlcyA9ICRmaXJlYmFzZUFycmF5KHJlZik7XG5cbiAgICB2YXIgUGxhY2VzID0ge1xuICAgICAgYWRkQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkbmFtZSl7XG4gICAgICAgIHJldHVybiByZWYuY2hpbGQoY2hpbGRuYW1lKVxuICAgICAgfSxcblxuICAgICAgYWRkUGxhY2VEZXRhaWxDaGlsZDogZnVuY3Rpb24oY2hpbGRuYW1lKXtcbiAgICAgICAgcmV0dXJuIHBsYWNlRGV0YWlsX3JlZi5jaGlsZChjaGlsZG5hbWUpXG4gICAgICB9LFxuXG4gICAgICBnZXRQbGFjZVJlZjpmdW5jdGlvbihwbGFjZV9pZCl7XG4gICAgICAgIHJldHVybiByZWYuY2hpbGQocGxhY2VfaWQrJy9pbmZvJyk7XG4gICAgICB9LFxuICAgICAgYXJyOiBwbGFjZXNcbiAgICB9XG4gICAgcmV0dXJuIFBsYWNlcztcbiAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuXG4gIC8vQ2F0ZWdvcnkgbGlzdFxuICAuZmFjdG9yeSgnQ2F0ZWdvcnknLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5LCBGaXJlYmFzZVVybCl7XG4gICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnY2F0ZWdvcmllcycpO1xuICAgIHZhciBjYXRlZ29yaWVzID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG4gICAgdmFyIHRvcGljQXJyID0gJGZpcmViYXNlQXJyYXkocmVmKTtcblxuICAgIHZhciBDYXRlZ29yeSA9IHtcbiAgICAgIGdldE5hbWU6IGZ1bmN0aW9uKHNsdWcpe1xuICAgICAgICB2YXIgZGF0YSA9IHJlZi5jaGlsZChzbHVnKTtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChkYXRhKTtcbiAgICAgIH0sXG5cbiAgICAgIGFsbDogY2F0ZWdvcmllc1xuICAgIH1cbiAgICByZXR1cm4gQ2F0ZWdvcnk7XG4gIH0pXG5cblxuICAvL0xhbmd1YWdlc1xuICAuZmFjdG9yeSgnTGFuZ3VhZ2VzJywgZnVuY3Rpb24oJGZpcmViYXNlQXJyYXksIEZpcmViYXNlVXJsKXtcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydsYW5ndWFnZXMnKTtcbiAgICB2YXIgbGFuZyA9ICRmaXJlYmFzZUFycmF5KHJlZik7XG5cbiAgICByZXR1cm4gbGFuZztcbiAgfSlcblxuXG4gIC8vTGFuZ3VhZ2VzXG4gIC5mYWN0b3J5KCdBcmNoaXZlJywgZnVuY3Rpb24oJGZpcmViYXNlQXJyYXksIEZpcmViYXNlVXJsKXtcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydhcmNoaXZlJyk7XG4gICAgdmFyIGFyY2hpdmUgPSAkZmlyZWJhc2VBcnJheShyZWYpO1xuXG4gICAgdmFyIEFyY2hpdmUgPXtcbiAgICAgIGFkZENoaWxkOiBmdW5jdGlvbihzbHVnKXtcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZChzbHVnKTtcbiAgICAgIH0sXG4gICAgICByZWY6IHJlZixcbiAgICAgIGFycjogYXJjaGl2ZVxuICAgIH1cbiAgICByZXR1cm4gQXJjaGl2ZTtcbiAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmNvbnRyb2xsZXIoJ1RhZ0N0cmwnLCBmdW5jdGlvbihBdXRoLCBVc2VycywgJHN0YXRlLCRyb290U2NvcGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9SZXNvbHZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnTGFuZGluZyx0YWdOYW1lKSB7XG5cbiAgICB2YXIgdGFnQ3RybCA9IHRoaXM7XG4gICAgdGFnQ3RybC50YWdMYW5kaW5nICA9IHRhZ0xhbmRpbmc7XG4gICAgdGFnQ3RybC50YWdOYW1lICAgICA9IHRhZ05hbWU7XG5cbiAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuICAuZmFjdG9yeSgnVGFncycsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIEZpcmViYXNlVXJsLCAkcSl7XHJcblxyXG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsndGFncycpO1xyXG4gICAgdmFyIHRhZ3MgPSAkZmlyZWJhc2VBcnJheShyZWYpO1xyXG5cclxuICAgIHZhciBUYWdzID0ge1xyXG5cclxuICAgICAgYWRkQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkbmFtZSl7XHJcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZChjaGlsZG5hbWUpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICB0YWdzVXJsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZik7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBnZXRUYWdSZWY6ZnVuY3Rpb24odGFnKXtcclxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKHRhZyk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBnZXRUYWdPYmplY3Q6ZnVuY3Rpb24odGFnKXtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0YWcpKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgdG9waWNUYWdzOmZ1bmN0aW9uKHRhZyl7XHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgdmFyIGZiID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKTtcclxuICAgICAgICB2YXIgZGF0YVJldCA9ICcnO1xyXG5cclxuICAgICAgICByZXR1cm4gZmIuY2hpbGQoJ3RhZ3MvJyt0YWcpXHJcbiAgICAgICAgICAub24oJ2NoaWxkX2FkZGVkJywgZnVuY3Rpb24odGFnU25hcCl7XHJcbiAgICAgICAgICAgIGZiLmNoaWxkKCd0b3BpY3MnKVxyXG4gICAgICAgICAgICAgIC5vcmRlckJ5Q2hpbGQoXCJ0YWdzXCIpXHJcbiAgICAgICAgICAgICAgLmVxdWFsVG8odGFnKVxyXG4gICAgICAgICAgICAgIC5vbignY2hpbGRfYWRkZWQnLCBmdW5jdGlvbih0b3BpY1NuYXApIHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIC8vc2hvdyggZXh0ZW5kKHt9LCB0YWdTbmFwLnZhbCgpLCB0b3BpY1NuYXAudmFsKCkpICk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXh0ZW5kKHt9LCB0YWdTbmFwLnZhbCgpLCB0b3BpY1NuYXAudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhUmV0KTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGFycjogdGFnc1xyXG5cclxuICAgIH1cclxuICAgIHJldHVybiBUYWdzO1xyXG4gIH0pXHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5jb250cm9sbGVyKCdUb3BpY0xhbmRpbmdDdHJsJywgZnVuY3Rpb24gKCRzdGF0ZSwgJHNjb3BlLCBTbHVnLCBUb3BpY3MsIEF1dGgsIFVzZXJzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vUmVzb2x2ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzT3duZXIsdG9waWNMYW5kaW5nLCByZXBseUxpc3QsIHZpZXdEYXRhLCBmb2xsb3dlcnMpIHtcclxuXHJcbiAgICB2YXIgdG9waWNMYW5kaW5nQ3RybCA9IHRoaXNcclxuXHJcblxyXG4gICAgdG9waWNMYW5kaW5nQ3RybC5hdXRoICAgICAgICAgPSBBdXRoO1xyXG4gICAgdG9waWNMYW5kaW5nQ3RybC51c2VycyAgICAgICAgPSBVc2VycztcclxuICAgIHRvcGljTGFuZGluZ0N0cmwudG9waWNMYW5kaW5nID0gdG9waWNMYW5kaW5nO1xyXG4gICAgdG9waWNMYW5kaW5nQ3RybC50b3BpY3MgICAgICAgPSBUb3BpY3M7XHJcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnJlcGx5TGlzdCAgICA9IHJlcGx5TGlzdDtcclxuICAgIHRvcGljTGFuZGluZ0N0cmwudmlld3MgICAgICAgID0gdmlld0RhdGE7XHJcbiAgICB0b3BpY0xhbmRpbmdDdHJsLmZvbGxvd2VycyAgICA9IGZvbGxvd2VycztcclxuICAgIHRvcGljTGFuZGluZ0N0cmwuaXNPd25lciAgICAgID0gaXNPd25lcjtcclxuXHJcblxyXG5cclxuXHJcbiAgICAvL0dldHRpbmcgUmVwbGllcyBpbiByZXBsaWVzXHJcbiAgICB0b3BpY0xhbmRpbmdDdHJsLmluUmVwbHlBcnIgPSBbXTtcclxuICAgIHRvcGljTGFuZGluZ0N0cmwucmVwbHlJblJlcGx5ID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgIGZvcih2YXIgaT0wOyBpPHRvcGljTGFuZGluZ0N0cmwucmVwbHlMaXN0Lmxlbmd0aDtpKyspe1xyXG4gICAgICAgIHZhciB0b3BpY0lkID0gdG9waWNMYW5kaW5nQ3RybC5yZXBseUxpc3RbaV0udG9waWNJZDtcclxuICAgICAgICB2YXIgcmVwbHlJZCA9IHRvcGljTGFuZGluZ0N0cmwucmVwbHlMaXN0W2ldLiRpZDtcclxuICAgICAgICB0b3BpY0xhbmRpbmdDdHJsLmluUmVwbHlBcnJbaV0gPSB0b3BpY0xhbmRpbmdDdHJsLnRvcGljcy5yZXBseUluUmVwbHkodG9waWNJZCxyZXBseUlkKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRvcGljTGFuZGluZ0N0cmwucmVwbHlJblJlcGx5KCk7XHJcbiAgfSlcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmNvbnRyb2xsZXIoJ1RvcGljQ3RybCcsIGZ1bmN0aW9uKCRzdGF0ZSwkc2NvcGUsJHJvb3RTY29wZSwgJG1kRGlhbG9nLCAkbWRNZWRpYSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGh0dHAsRmlyZWJhc2VVcmwsJHRyYW5zbGF0ZSwkbm90aWZpY2F0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1NlcnZpY2VzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGlTZXJ2aWNlLFRhZ3MsIFRvcGljcywgQXV0aCwgVXNlcnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNsdWcsUGxhY2VzLCBMYW5ndWFnZXMsQXJjaGl2ZSl7XHJcblxyXG4gICAgdmFyIHRvcGljQ3RybCA9IHRoaXM7XHJcblxyXG5cclxuICAgIC8vUGFyc2VyIGhlcmVcclxuICAgIHRvcGljQ3RybC50YWdzICAgICAgPSBUYWdzO1xyXG4gICAgdG9waWNDdHJsLnRvcGljcyAgICA9IFRvcGljcztcclxuICAgIHRvcGljQ3RybC5hdXRoICAgICAgPSBBdXRoO1xyXG4gICAgdG9waWNDdHJsLnVzZXJzICAgICA9IFVzZXJzO1xyXG4gICAgdG9waWNDdHJsLmxhbmd1YWdlcyA9IExhbmd1YWdlcztcclxuICAgIHRvcGljQ3RybC5wbGFjZXMgICAgPSBQbGFjZXM7XHJcbiAgICB0b3BpY0N0cmwuYXJjaGl2ZSAgID0gQXJjaGl2ZTtcclxuICAgIHRvcGljQ3RybC5ub3RpICAgICAgPSBOb3RpU2VydmljZTtcclxuXHJcbiAgICBpZih0b3BpY0N0cmwuYXV0aC5yZWYuZ2V0QXV0aCgpICE9IG51bGwgKXtcclxuICAgICAgdG9waWNDdHJsLnByb2ZpbGUgID0gdG9waWNDdHJsLnVzZXJzLmdldFByb2ZpbGUodG9waWNDdHJsLmF1dGgucmVmLmdldEF1dGgoKS51aWQpO1xyXG4gICAgICB0b3BpY0N0cmwudWlkID0gdG9waWNDdHJsLnByb2ZpbGUuJGlkO1xyXG4gICAgICB0b3BpY0N0cmwudXNlclJlZiA9IHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpO1xyXG4gICAgICB0b3BpY0N0cmwudXNlclVwdm90ZWRUb3BpY3MgPSB0b3BpY0N0cmwudXNlcnMudXB2b3Rlcyh0b3BpY0N0cmwudWlkKTtcclxuICAgICAgdG9waWNDdHJsLnVzZXJEb3dudm90ZWRUb3BpY3MgPSB0b3BpY0N0cmwudXNlcnMuZG93bnZvdGVzKHRvcGljQ3RybC51aWQpO1xyXG4gICAgICB0b3BpY0N0cmwudXNlckZvbGxvd2luZyA9IHRvcGljQ3RybC51c2Vycy5mb2xsb3dpbmcodG9waWNDdHJsLnVpZCk7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICB0b3BpY0N0cmwucHJvZmlsZSA9Jyc7XHJcbiAgICAgIHRvcGljQ3RybC51aWQgPSAnJztcclxuICAgICAgdG9waWNDdHJsLnVzZXJSZWYgPSAnJztcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIC8vUHJlc2V0IFBhcmFtZXRlcnNcclxuICAgIHRvcGljQ3RybC5pbWFnZVN0cmluZ3MgID0gW107XHJcbiAgICB0b3BpY0N0cmwuaW1hZ2VUZXh0ICAgICA9IFtdO1xyXG4gICAgdG9waWNDdHJsLmluUmVwbHlBcnIgICAgPSBbXTtcclxuICAgIHRvcGljQ3RybC5sb2FkQnVzeSAgICAgID0gZmFsc2U7XHJcbiAgICB0b3BpY0N0cmwuc2x1Z1JldHVybiAgICA9IG51bGw7XHJcbiAgICB0b3BpY0N0cmwuY3JpdGVyaWEgICAgICA9IGZhbHNlO1xyXG4gICAgdG9waWNDdHJsLmNyaXRlcmlhUmVwbHkgPSBudWxsO1xyXG4gICAgdG9waWNDdHJsLnJldmlld0NyaXRlcmlhPWZhbHNlO1xyXG4gICAgdG9waWNDdHJsLmNyaXRSZXBseURhdGEgPSBudWxsO1xyXG5cclxuICAgIC8vaWYgYWxsb3cgbnVsbCBpbiB0aGUgZm9ybVxyXG4gICAgdG9waWNDdHJsLm5ld1RvcGljICAgICAgPSB7XHJcbiAgICAgICdsb2NhdGlvbic6ICcnLFxyXG4gICAgICAndXJsJyA6ICcnLFxyXG4gICAgICAnaXBJbmZvJzogJycsXHJcbiAgICAgICd0YWdzJzogJycsXHJcbiAgICAgICdib2R5JzogJydcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy9DYWxjIGF2ZXJhZ2UgcmV2aWV3IGlucHV0IGluIHJlcGx5XHJcbiAgICB0b3BpY0N0cmwuYXZnUmV2aWV3UmVwbHkgPSBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgdmFyIG9iakNvdW50ID0gT2JqZWN0LmtleXModG9waWNDdHJsLmNyaXRlcmlhUmVwbHkpLmxlbmd0aDtcclxuICAgICAgdmFyIGF2ZyA9IDBcclxuICAgICAgZm9yKHZhciBpPTA7aTxvYmpDb3VudDtpKyspe1xyXG4gICAgICAgIGF2ZyA9IGF2ZyArIHRvcGljQ3RybC5jcml0ZXJpYVJlcGx5W2ldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0b3BpY0N0cmwucmVwbHlSZXZpZXdBdmVyYWdlID0gYXZnL29iakNvdW50O1xyXG5cclxuICAgICAgY29uc29sZS5sb2codG9waWNDdHJsLmNyaXRlcmlhUmVwbHkpO1xyXG5cclxuICAgICAgdG9waWNDdHJsLmNyaXRSZXBseURhdGEgPSB7IGF2ZzogdG9waWNDdHJsLnJlcGx5UmV2aWV3QXZlcmFnZSwgZGF0YTogdG9waWNDdHJsLmNyaXRlcmlhUmVwbHl9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vR2V0IHRoZSBhdmVyYWdlIHNjb3JlIGZyb20gY3JpdGVyaWEgdmFsdWVzXHJcbiAgICB0b3BpY0N0cmwuYXZnUmV2aWV3U2NvcmUgPSBmdW5jdGlvbihkYXRhKXtcclxuICAgICAgaWYoZGF0YSlcclxuICAgICAge1xyXG4gICAgICB2YXIgYXZnID0wO1xyXG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgYXZnID0gYXZnICsgZGF0YVtpXS5yYXRpbmc7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGF2Zy9kYXRhLmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvL0xhYmVsIGZvciByZW1vdmUgdG9waWNzXHJcbiAgICAkdHJhbnNsYXRlKFsnS0VZX1JFTU9WRScsICdLRVlfQ0FOQ0VMJywnS0VZX0NPTkZfUkVNT1ZFJywnS0VZX0NPTkZfUkVNX0MnXSkudGhlbihmdW5jdGlvbiAodHJhbnNsYXRpb25zKSB7XHJcbiAgICAgIHRvcGljQ3RybC5yZW1vdmVUcmFucyA9IHRyYW5zbGF0aW9ucy5LRVlfUkVNT1ZFO1xyXG4gICAgICB0b3BpY0N0cmwuY2FuY2VsVHJhbnMgPSB0cmFuc2xhdGlvbnMuS0VZX0NBTkNFTDtcclxuICAgICAgdG9waWNDdHJsLmNvbmZpcm1SZW0gID0gdHJhbnNsYXRpb25zLktFWV9DT05GX1JFTU9WRTtcclxuICAgICAgdG9waWNDdHJsLmNvbmZpcm1SZW1Db250ZW50ID0gIHRyYW5zbGF0aW9ucy5LRVlfQ09ORl9SRU1fQztcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB0b3BpY0N0cmwudXNlck5hbWUgPSBmdW5jdGlvbih1c2VySWQpe1xyXG4gICAgICBpZih1c2VySWQhPSBudWxsKXtcclxuICAgICAgICAvL3JldHVybiB0b3BpY0N0cmwudXNlcnMuZ2V0RGlzcGxheU5hbWUodXNlcklkKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxuICAgIC8vTG9naW4gZm9yIG1hdGVyaWFsXHJcbiAgICB0b3BpY0N0cmwuc2hvd01kTG9naW4gPSBmdW5jdGlvbihldikge1xyXG4gICAgICB2YXIgdXNlRnVsbFNjcmVlbiA9ICgkbWRNZWRpYSgnc20nKSB8fCAkbWRNZWRpYSgneHMnKSkgJiYgJHNjb3BlLmN1c3RvbUZ1bGxzY3JlZW47XHJcbiAgICAgICRtZERpYWxvZy5zaG93KHtcclxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXHJcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL21kLWxvZ2luLWZvcm0uaHRtbCcsXHJcbiAgICAgICAgICBwYXJlbnQ6IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KSxcclxuICAgICAgICAgIHRhcmdldEV2ZW50OiBldixcclxuICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWUsXHJcbiAgICAgICAgICBmdWxsc2NyZWVuOiB1c2VGdWxsU2NyZWVuXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIHRvcGljQ3RybC5kZWNvZGVUZXh0ID0gZnVuY3Rpb24odGV4dCl7XHJcbiAgICAgIC8vcmV0dXJuICRmaWx0ZXIoJ3NsdWdpZnknKShpdGVtLm5hbWUpO1xyXG4gICAgICBjb25zb2xlLmxvZyhkZWNvZGVVUkkodGV4dCkpO1xyXG4gICAgICByZXR1cm4gZGVjb2RlVVJJKHRleHQpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICB0b3BpY0N0cmwubG9hZE1vcmUgPSBmdW5jdGlvbihpdGVtcykge1xyXG4gICAgICB0b3BpY0N0cmwubG9hZEJ1c3kgPSB0cnVlO1xyXG4gICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZGF0YS5wdXNoKGl0ZW1zW2ldKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgcmV0dXJuIGRhdGFcclxuICAgIH07XHJcblxyXG4gICAgdG9waWNDdHJsLmxvYWRUYWdzID0gZnVuY3Rpb24ocXVlcnkpIHtcclxuICAgICAgY29uc29sZS5sb2codG9waWNDdHJsLnRhZ3MudGFnc1VybCgpKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qdG9waWNDdHJsLnVzZXJzLmdldExvY2F0aW9uSVAoKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmlwSW5mbyA9IGRhdGE7XHJcbiAgICB9KTsqL1xyXG5cclxuXHJcbiAgICAvL1VwbG9hZCBQcm9maWxlIGltYWdlXHJcbiAgICB0b3BpY0N0cmwudXBsb2FkRmlsZSA9IGZ1bmN0aW9uKGZpbGVzLGluZGV4KSB7XHJcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChmaWxlcywgZnVuY3Rpb24gKGZsb3dGaWxlLCBpbmRleCkge1xyXG4gICAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgdmFyIHVyaSA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XHJcbiAgICAgICAgICB0b3BpY0N0cmwuaW1hZ2VTdHJpbmdzW2luZGV4XSA9IHVyaTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGZpbGVSZWFkZXIucmVhZEFzRGF0YVVSTChmbG93RmlsZS5maWxlKTtcclxuICAgICAgfSlcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vU2hvdyBjb25maXJtIHJlbW92ZSB0b3BpY1xyXG4gICAgdG9waWNDdHJsLnNob3dDb25maXJtUmVtb3ZlID0gZnVuY3Rpb24oZXYsdG9waWNfb3duZXIsb2JqKXtcclxuICAgICAgLy8gQXBwZW5kaW5nIGRpYWxvZyB0byBkb2N1bWVudC5ib2R5IHRvIGNvdmVyIHNpZGVuYXYgaW4gZG9jcyBhcHBcclxuICAgICAgdmFyIGNvbmZpcm0gPSAkbWREaWFsb2cuY29uZmlybSgpXHJcbiAgICAgICAgLnRpdGxlKHRvcGljQ3RybC5jb25maXJtUmVtKVxyXG4gICAgICAgIC50ZXh0Q29udGVudCh0b3BpY0N0cmwuY29uZmlybVJlbUNvbnRlbnQpXHJcbiAgICAgICAgLnRhcmdldEV2ZW50KGV2KVxyXG4gICAgICAgIC5vayh0b3BpY0N0cmwucmVtb3ZlVHJhbnMpXHJcbiAgICAgICAgLmNhbmNlbCh0b3BpY0N0cmwuY2FuY2VsVHJhbnMpO1xyXG4gICAgICAkbWREaWFsb2cuc2hvdyhjb25maXJtKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmKHRvcGljQ3RybC5yZW1vdmVUb3BpYyh0b3BpY19vd25lcixvYmopKXtcclxuICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vUmVtb3ZlIHRvcGljXHJcbiAgICB0b3BpY0N0cmwucmVtb3ZlVG9waWMgPSBmdW5jdGlvbih0b3BpY19vd25lcixvYmope1xyXG4gICAgICAvL3ZlcmlmeSBpZiB0aGUgdG9waWMgb3duZXIgYW5kIHRoZSBsb2dpbiBvd25lciBpcyB0aGUgc2FtZSBwcGxcclxuICAgICAgaWYodG9waWNfb3duZXIgPT0gdG9waWNDdHJsLnVpZCl7XHJcbiAgICAgICAgbW92ZUZiUmVjb3JkKHRvcGljQ3RybC50b3BpY3MucmVmQ2hpbGQob2JqLiRpZCksIHRvcGljQ3RybC5hcmNoaXZlLmFkZENoaWxkKG9iai4kaWQpKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgIH1lbHNle1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy9SZXBseSB0byB0b3BpY1xyXG4gICAgdG9waWNDdHJsLnJlcGx5ID0gZnVuY3Rpb24odG9waWNPYmope1xyXG5cclxuICAgICAgdG9waWNDdHJsLnRvcGljcy5yZXBseUFycih0b3BpY09iai4kaWQpLiRhZGQoe1xyXG4gICAgICAgIHRvcGljSWQ6ICB0b3BpY09iai4kaWQsXHJcbiAgICAgICAgYm9keTogICAgIHRvcGljQ3RybC5uZXdSZXBseS5ib2R5LFxyXG4gICAgICAgIHVpZDogICAgICB0b3BpY0N0cmwudWlkLFxyXG4gICAgICAgIHJldmlldzogICB0b3BpY0N0cmwuY3JpdFJlcGx5RGF0YSxcclxuICAgICAgICBjcmVhdGVkOiAgbW9tZW50KCkudG9JU09TdHJpbmcoKVxyXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy9Ob3RpZnkgdG9waWMgb3duZXJcclxuICAgICAgICAvL3RvcGljT2JqIHJlZmVycyB0byB0aGUgcHJvcGVydHkgb2YgdGhpcyBvYmplY3RcclxuICAgICAgICB0b3BpY0N0cmwubm90aS51cGRhdGVOb3RpZmljYXRpb25Db3VudCh0b3BpY09iai4kaWQsdG9waWNPYmoudWlkLHRvcGljQ3RybC51aWQpO1xyXG4gICAgICB9KVxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG4gICAgICB0b3BpY0N0cmwudG9waWNzLnJlcGx5Q291bnQodG9waWNPYmouJGlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICBpZighZGF0YS5jb3VudCl7XHJcbiAgICAgICAgICB0b3BpY0N0cmwudG9waWNzLnJlcGx5Q291bnRSZWYodG9waWNPYmouJGlkKS5zZXQoMSk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICB0b3BpY0N0cmwudG9waWNzLnJlcGx5Q291bnRSZWYodG9waWNPYmouJGlkKVxyXG4gICAgICAgICAgICAuc2V0KGRhdGEuY291bnQgKzEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgLy9TdGF0IHVwZGF0ZSBmb3IgdXNlclxyXG4gICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9jb21tZW50L2NvdW50JylcclxuICAgICAgICAuc2V0KHRvcGljQ3RybC5wcm9maWxlLnN0YXQuY29tbWVudC5jb3VudCArIDEpO1xyXG5cclxuICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvY29tbWVudC90b3BpY3MvJyt0b3BpY09iai4kaWQpXHJcbiAgICAgICAgLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICAvL1JlcGx5IGluIHJlcGx5XHJcbiAgICB0b3BpY0N0cmwucmVwbHlJblJlcGx5ID0gZnVuY3Rpb24odG9waWNJZCxyZXBseUlkKXtcclxuICAgICAgdG9waWNDdHJsLnRvcGljcy5yZXBseUluUmVwbHlBcnIodG9waWNJZCxyZXBseUlkKS4kYWRkKHtcclxuICAgICAgICBib2R5OiAgICAgdG9waWNDdHJsLnJlcGx5SW5SZXBseS5ib2R5LFxyXG4gICAgICAgIHVpZDogICAgICB0b3BpY0N0cmwudWlkLFxyXG4gICAgICAgIGNyZWF0ZWQ6ICBtb21lbnQoKS50b0lTT1N0cmluZygpXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICB0b3BpY0N0cmwuYWRkTmV3Q2hvaWNlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBuZXdJdGVtTm8gPSB0b3BpY0N0cmwucmV2aWV3Q3JpdGVyaWEubGVuZ3RoKzE7XHJcbiAgICAgIHRvcGljQ3RybC5yZXZpZXdDcml0ZXJpYS5wdXNoKHsnaWQnOidjcml0ZXJpYScrbmV3SXRlbU5vfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRvcGljQ3RybC5yZW1vdmVDaG9pY2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGxhc3RJdGVtID0gdG9waWNDdHJsLnJldmlld0NyaXRlcmlhLmxlbmd0aC0xO1xyXG4gICAgICB0b3BpY0N0cmwucmV2aWV3Q3JpdGVyaWEuc3BsaWNlKGxhc3RJdGVtKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vQ3JlYXRlIG5ldyB0b3BpY1xyXG4gICAgdG9waWNDdHJsLmNyZWF0ZVRvcGljID0gZnVuY3Rpb24oY2F0ZWdvcnksaXNEcmFmdCl7XHJcblxyXG4gICAgICAvL0NoZWNrIGlmIHdlIGhhdmUgbG9jYXRpb24gZGV0YWlsc1xyXG4gICAgICB2YXIgbG9jYXRpb25EZXRhaWwgPSAnJztcclxuXHJcbiAgICAgIGlmKHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbiAhPT0gJycgKXtcclxuICAgICAgICBjb25zb2xlLmxvZyh0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24pO1xyXG4gICAgICAgIGxvY2F0aW9uRGV0YWlsID0ge1xyXG4gICAgICAgICAgcGxhY2VfaWQ6IHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLnBsYWNlX2lkLFxyXG4gICAgICAgICAgc2x1ZzogICAgIFNsdWcuc2x1Z2lmeSh0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5uYW1lKSxcclxuICAgICAgICAgIG5hbWU6ICAgICB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5uYW1lLFxyXG4gICAgICAgICAgYWRkcmVzczogIHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLmZvcm1hdHRlZF9hZGRyZXNzLFxyXG4gICAgICAgICAgbGF0OiAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxhdCgpLFxyXG4gICAgICAgICAgbG5nOiAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxyXG4gICAgICAgICAgbG5nOiAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxyXG4gICAgICAgICAgbG5nOiAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAvKiBERUJVRyBGT1JNIFZBTFVFXHJcbiAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgdHlwZTogICAgICAgICAgIHRvcGljQ3RybC50eXBlLFxyXG4gICAgICAgIGxhbmc6ICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMubGFuZyxcclxuICAgICAgICB0b3BpYzogICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLnRvcGljLFxyXG4gICAgICAgIGJvZHk6ICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMuYm9keSxcclxuICAgICAgICBjYXRlZ29yeTogICAgICAgY2F0ZWdvcnksXHJcbiAgICAgICAgdWlkOiAgICAgICAgICAgIHRvcGljQ3RybC51aWQsXHJcbiAgICAgICAgc2x1ZzogICAgICAgICAgIFNsdWcuc2x1Z2lmeSh0b3BpY0N0cmwubmV3VG9waWMudG9waWMpLFxyXG4gICAgICAgIHBob3RvczogICAgICAgICB0b3BpY0N0cmwuaW1hZ2VTdHJpbmdzLFxyXG4gICAgICAgIHBob3Rvc190ZXh0OiAgICB0b3BpY0N0cmwuaW1hZ2VUZXh0LFxyXG4gICAgICAgIGxvY2F0aW9uOiAgICAgICBsb2NhdGlvbkRldGFpbCxcclxuICAgICAgICB1cmw6ICAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLnVybCxcclxuICAgICAgICBkcmFmdDogICAgICAgICAgaXNEcmFmdCxcclxuICAgICAgICBjcmVhdGVkOiAgICAgICAgbW9tZW50KCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICB0YWdzOiAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLnRhZ3MsXHJcbiAgICAgICAgdXNlcklQOiAgICAgICB0b3BpY0N0cmwubmV3VG9waWMuaXBJbmZvXHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAqL1xyXG5cclxuICAgICAgdG9waWNDdHJsLnRvcGljcy5hcnIuJGFkZCh7XHJcbiAgICAgICAgICB0eXBlOiAgICAgICAgICAgdG9waWNDdHJsLnR5cGUsXHJcbiAgICAgICAgICBsYW5nOiAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmxhbmcsXHJcbiAgICAgICAgICB0b3BpYzogICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLnRvcGljLFxyXG4gICAgICAgICAgYm9keTogICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5ib2R5LFxyXG4gICAgICAgICAgY2F0ZWdvcnk6ICAgICAgIGNhdGVnb3J5LFxyXG4gICAgICAgICAgdWlkOiAgICAgICAgICAgIHRvcGljQ3RybC51aWQsXHJcbiAgICAgICAgICAvL3NsdWc6ICAgICAgICAgICBTbHVnLnNsdWdpZnkodG9waWNDdHJsLm5ld1RvcGljLnRvcGljKSxcclxuICAgICAgICAgIHNsdWc6ICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMudG9waWMsXHJcbiAgICAgICAgICBwaG90b3M6ICAgICAgICAgdG9waWNDdHJsLmltYWdlU3RyaW5ncyxcclxuICAgICAgICAgIHBob3Rvc190ZXh0OiAgICB0b3BpY0N0cmwuaW1hZ2VUZXh0LFxyXG4gICAgICAgICAgbG9jYXRpb246ICAgICAgIGxvY2F0aW9uRGV0YWlsLFxyXG4gICAgICAgICAgdXJsOiAgICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy51cmwsXHJcbiAgICAgICAgICBkcmFmdDogICAgICAgICAgaXNEcmFmdCxcclxuICAgICAgICAgIGNyZWF0ZWQ6ICAgICAgICBtb21lbnQoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgICAgdGFnczogICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy50YWdzLFxyXG4gICAgICAgICAgdXNlcklQOiAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5pcEluZm8sXHJcbiAgICAgICAgICByZXZpZXc6ICAgICAgICAgdG9waWNDdHJsLnJldmlld0NyaXRlcmlhLFxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odG9waWMpe1xyXG5cclxuICAgICAgICAgIHZhciBzbHVnVGV4dCA9Jyc7XHJcbiAgICAgICAgICAvL2lmIHdlIGFyZSB1bmFibGUgdG8gY29udmVydCB0byBzbHVnIHRoZW4gd2UgdXNlIHRoZSB0b3BpYyB0ZXh0LCBlbHNlIHVzZSBzbHVnXHJcbiAgICAgICAgICBpZihTbHVnLnNsdWdpZnkodG9waWNDdHJsLm5ld1RvcGljLnRvcGljKSA9PScnKXtcclxuICAgICAgICAgICAgc2x1Z1RleHQgPSB0b3BpY0N0cmwubmV3VG9waWMudG9waWM7XHJcbiAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgc2x1Z1RleHQgPSBTbHVnLnNsdWdpZnkodG9waWNDdHJsLm5ld1RvcGljLnRvcGljKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvL1VwZGF0ZSBzbHVnIHdpdGggdG9waWMgS2V5XHJcbiAgICAgICAgICB0b3BpY0N0cmwudG9waWNzLmdldFRvcGljQnlLZXkodG9waWMua2V5KCkpLnVwZGF0ZSh7XCJzbHVnXCI6c2x1Z1RleHQrdG9waWMua2V5KCl9KTtcclxuXHJcbiAgICAgICAgICAvL1N0YXQgdXBkYXRlXHJcbiAgICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9wb3N0ZWQvY291bnQnKVxyXG4gICAgICAgICAgICAuc2V0KHRvcGljQ3RybC5wcm9maWxlLnN0YXQucG9zdGVkLmNvdW50ICsgMSk7XHJcblxyXG4gICAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvcG9zdGVkL3RvcGljcy8nK3RvcGljLmtleSgpKVxyXG4gICAgICAgICAgICAucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgICAvL0lmIHRoZXJlIGlzIGxvY2F0aW9uXHJcbiAgICAgICAgICBpZihsb2NhdGlvbkRldGFpbCAhPT0gJycpe1xyXG5cclxuICAgICAgICAgICAgdG9waWNDdHJsLnBsYWNlcy5hZGRDaGlsZChsb2NhdGlvbkRldGFpbC5wbGFjZV9pZClcclxuICAgICAgICAgICAgICAgICAgICAgIC5jaGlsZCh0b3BpYy5rZXkoKSlcclxuICAgICAgICAgICAgICAgICAgICAgIC5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAgICAgdG9waWNDdHJsLnBsYWNlcy5hZGRDaGlsZChsb2NhdGlvbkRldGFpbC5wbGFjZV9pZClcclxuICAgICAgICAgICAgICAuY2hpbGQoJ2luZm8nKS5zZXQobG9jYXRpb25EZXRhaWwpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vaWYgdGhlcmUgYXJlIHRhZ3NcclxuICAgICAgICAgIGlmKHRvcGljQ3RybC5uZXdUb3BpYy50YWdzICE9PSBudWxsKXtcclxuICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHRvcGljQ3RybC5uZXdUb3BpYy50YWdzLmxlbmd0aDsgKytpbmRleCkge1xyXG4gICAgICAgICAgICAgIHRvcGljQ3RybC50YWdzLmFkZENoaWxkKHRvcGljQ3RybC5uZXdUb3BpYy50YWdzW2luZGV4XS50ZXh0KVxyXG4gICAgICAgICAgICAgICAgLmNoaWxkKHRvcGljLmtleSgpKS5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy9Ob3RpZnkgZm9sbG93ZXJcclxuICAgICAgICAgIHRvcGljQ3RybC5ub3RpLm5vdGlmeUZvbGxvd2VyKHRvcGljLmtleSgpLHRvcGljQ3RybC51aWQpO1xyXG5cclxuXHJcbiAgICAgICAgICAvL1Jlc2V0IGZvcm0gaGVyZVxyXG4gICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljID0ge1xyXG4gICAgICAgICAgICBib2R5OiAnJ1xyXG4gICAgICAgICAgfTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvL0NoZWNrIGlmIHVzZXIgaXMgYWxyZWFkeSBmb2xsb3dpbmcgdXNlclxyXG4gICAgdG9waWNDdHJsLmNoZWNrRm9sbG93ID0gZnVuY3Rpb24oZm9sbG93X3VpZCl7XHJcbiAgICAgIGlmKHRvcGljQ3RybC51c2Vycy5jaGVja0ZvbGxvdyh0b3BpY0N0cmwudWlkLGZvbGxvd191aWQpKXtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vRm9sbG93IFVzZXJcclxuICAgIHRvcGljQ3RybC5mb2xsb3dVc2VyID0gZnVuY3Rpb24oZm9sbG93X3VpZCl7XHJcblxyXG4gICAgICAvL1VwZGF0ZSB0aGUgcGVyc29uIHRoYXQgYmVpbmcgZm9sbG93LCBjcmVkaXQgdGhlbSBmb3IgaGF2aW5nIGZvbGxvd2VyXHJcbiAgICAgIHRvcGljQ3RybC51c2Vycy5nZXRQcm9maWxlKGZvbGxvd191aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcblxyXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKGZvbGxvd191aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2VyL2NvdW50JylcclxuICAgICAgICAgIC5zZXQoZGF0YS5zdGF0LmZvbGxvd2VyLmNvdW50ICsgMSk7XHJcblxyXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKGZvbGxvd191aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2VyL3VpZC8nKyB0b3BpY0N0cmwudWlkKVxyXG4gICAgICAgICAgLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy9VcGRhdGUgdGhlIHBlcnNvbiB0aGF0IGlzIGZvbGxvd2luZywgY3JlZGl0IHRoZW0gZm9yIGhhdmluZyBmb2xsb3dpbmdcclxuICAgICAgdG9waWNDdHJsLnVzZXJzLmdldFByb2ZpbGUodG9waWNDdHJsLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuXHJcbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvZm9sbG93aW5nL2NvdW50JylcclxuICAgICAgICAgIC5zZXQoZGF0YS5zdGF0LmZvbGxvd2VyLmNvdW50ICsgMSk7XHJcblxyXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2luZy91aWQvJysgZm9sbG93X3VpZClcclxuICAgICAgICAgIC5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy9VbmZvbGxvdyBVc2VyXHJcbiAgICB0b3BpY0N0cmwudW5mb2xsb3dVc2VyID0gZnVuY3Rpb24oZm9sbG93X3VpZCl7XHJcblxyXG4gICAgICAvL1VwZGF0ZSB0aGUgcGVyc29uIHRoYXQgYmVpbmcgZm9sbG93LCBjcmVkaXQgdGhlbSBmb3IgaGF2aW5nIGZvbGxvd2VyXHJcbiAgICAgIHRvcGljQ3RybC51c2Vycy5nZXRQcm9maWxlKGZvbGxvd191aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcblxyXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKGZvbGxvd191aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2VyL2NvdW50JylcclxuICAgICAgICAgIC5zZXQoZGF0YS5zdGF0LmZvbGxvd2VyLmNvdW50IC0gMSk7XHJcblxyXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKGZvbGxvd191aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2VyL3VpZC8nKyB0b3BpY0N0cmwudWlkKS5yZW1vdmUoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvL1VwZGF0ZSB0aGUgcGVyc29uIHRoYXQgaXMgZm9sbG93aW5nLCBjcmVkaXQgdGhlbSBmb3IgaGF2aW5nIGZvbGxvd2luZ1xyXG4gICAgICB0b3BpY0N0cmwudXNlcnMuZ2V0UHJvZmlsZSh0b3BpY0N0cmwudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG5cclxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dpbmcvY291bnQnKVxyXG4gICAgICAgICAgLnNldChkYXRhLnN0YXQuZm9sbG93aW5nLmNvdW50IC0gMSk7XHJcblxyXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2luZy91aWQvJysgZm9sbG93X3VpZCkucmVtb3ZlKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgICAvL3Vwdm90ZVxyXG4gICAgdG9waWNDdHJsLnVwdm90ZSA9IGZ1bmN0aW9uKHRvcGljKXtcclxuXHJcbiAgICAgIGlmKHRvcGljLmRvd252b3RlcyAhPSB1bmRlZmluZWQgJiYgdG9waWMuZG93bnZvdGVzW3RvcGljQ3RybC51aWRdICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgdG9waWNDdHJsLmNhbmNlbERvd252b3RlKHRvcGljKTtcclxuICAgICAgfVxyXG4gICAgICB0b3BpY0N0cmwudG9waWNzLnVwdm90ZVRvcGljKHRvcGljLiRpZCwgdG9waWNDdHJsLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICAgIHRvcGljQ3RybC51c2VyVXB2b3RlZFRvcGljcy5jaGlsZCh0b3BpYy4kaWQpLnNldCh2YWx1ZS4kdmFsdWUpO1xyXG5cclxuICAgICAgICAvL1N0YXQgdXBkYXRlXHJcbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLmdldFByb2ZpbGUodG9waWMudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG5cclxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpYy51aWQpLmNoaWxkKCdzdGF0L3Vwdm90ZWQvY291bnQnKVxyXG4gICAgICAgICAgLnNldChkYXRhLnN0YXQudXB2b3RlZC5jb3VudCArIDEpO1xyXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljLnVpZCkuY2hpbGQoJ3N0YXQvdXB2b3RlZC90b3BpY3MvJyt0b3BpYy4kaWQpXHJcbiAgICAgICAgICAucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICB0b3BpY0N0cmwuY2FuY2VsVXB2b3RlID0gZnVuY3Rpb24odG9waWMpe1xyXG4gICAgICB0b3BpY0N0cmwudG9waWNzLnVuZG9VcHZvdGUodG9waWMuJGlkLCB0b3BpY0N0cmwudWlkKTtcclxuXHJcbiAgICAgIHRvcGljQ3RybC51c2Vycy5nZXRQcm9maWxlKHRvcGljLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuXHJcbiAgICAgICAgLy9TdGF0IHVwZGF0ZVxyXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljLnVpZCkuY2hpbGQoJ3N0YXQvdXB2b3RlZC9jb3VudCcpXHJcbiAgICAgICAgICAuc2V0KGRhdGEuc3RhdC51cHZvdGVkLmNvdW50IC0gMSk7XHJcblxyXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljLnVpZCkuY2hpbGQoJ3N0YXQvdXB2b3RlZC90b3BpY3MvJyt0b3BpYy4kaWQpLnJlbW92ZSgpO1xyXG4gICAgICB9KTtcclxuXHJcblxyXG4gICAgICB0b3BpY0N0cmwudXNlclVwdm90ZWRUb3BpY3MuY2hpbGQodG9waWMuJGlkKS5yZW1vdmUoZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZW1vdmVkIHN1Y2Nlc3NmdWxseSFcIik7XHJcbiAgICAgICAgICB9fSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vZG93bnZvdGVcclxuICAgIHRvcGljQ3RybC5kb3dudm90ZSA9IGZ1bmN0aW9uKHRvcGljKXtcclxuICAgICAgaWYodG9waWMudXB2b3RlcyAhPSB1bmRlZmluZWQgJiYgdG9waWMudXB2b3Rlc1t0b3BpY0N0cmwudWlkXSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgIHRvcGljQ3RybC5jYW5jZWxVcHZvdGUodG9waWMpO1xyXG4gICAgICB9XHJcbiAgICAgIHRvcGljQ3RybC50b3BpY3MuZG93bnZvdGVUb3BpYyh0b3BpYy4kaWQsIHRvcGljQ3RybC51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgICB0b3BpY0N0cmwudXNlckRvd252b3RlZFRvcGljcy5jaGlsZCh0b3BpYy4kaWQpLnNldCh2YWx1ZS4kdmFsdWUpO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdG9waWNDdHJsLmNhbmNlbERvd252b3RlID0gZnVuY3Rpb24odG9waWMpe1xyXG4gICAgICB0b3BpY0N0cmwudG9waWNzLnVuZG9Eb3dudm90ZSh0b3BpYy4kaWQsIHRvcGljQ3RybC51aWQpO1xyXG4gICAgICB0b3BpY0N0cmwudXNlckRvd252b3RlZFRvcGljcy5jaGlsZCh0b3BpYy4kaWQpLnJlbW92ZShmdW5jdGlvbihlcnJvcil7XHJcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOlwiLCBlcnJvcik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlbW92ZWQgc3VjY2Vzc2Z1bGx5IVwiKTtcclxuICAgICAgICAgIH19KTtcclxuICAgIH07XHJcblxyXG4gICAgLy9mb2xsb3cgdG9waWNcclxuICAgIHRvcGljQ3RybC5mb2xsb3dUb3BpYyA9IGZ1bmN0aW9uKHRvcGljKXtcclxuICAgICAgdG9waWNDdHJsLnRvcGljcy5mb2xsb3codG9waWMuJGlkLCB0b3BpY0N0cmwudWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgICAgdG9waWNDdHJsLnVzZXJGb2xsb3dpbmcuY2hpbGQodG9waWMuJGlkKS5zZXQodmFsdWUuaGlzdG9yeVt0b3BpY0N0cmwudWlkXSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICB0b3BpY0N0cmwudW5mb2xsb3dUb3BpYyA9IGZ1bmN0aW9uKHRvcGljKXtcclxuICAgICAgdG9waWNDdHJsLnRvcGljcy51bmZvbGxvdyh0b3BpYy4kaWQsIHRvcGljQ3RybC51aWQpO1xyXG4gICAgICB0b3BpY0N0cmwudXNlckZvbGxvd2luZy5jaGlsZCh0b3BpYy4kaWQpLnJlbW92ZShmdW5jdGlvbihlcnJvcil7XHJcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOlwiLCBlcnJvcik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlbW92ZWQgc3VjY2Vzc2Z1bGx5IVwiKTtcclxuICAgICAgICAgIH19KTtcclxuICAgIH07XHJcblxyXG4gIH0pO1xyXG5cclxuXHJcbi8vaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20va2F0b3d1bGYvNjA5OTA0MlxyXG5mdW5jdGlvbiBtb3ZlRmJSZWNvcmQob2xkUmVmLCBuZXdSZWYpIHtcclxuICBvbGRSZWYub25jZSgndmFsdWUnLCBmdW5jdGlvbiAoc25hcCkge1xyXG4gICAgbmV3UmVmLnNldChzbmFwLnZhbCgpLCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgaWYgKCFlcnJvcikge1xyXG4gICAgICAgIG9sZFJlZi5yZW1vdmUoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICh0eXBlb2YoY29uc29sZSkgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUuZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLy8gVG9waWMgbGlzdFxyXG4gIC5mYWN0b3J5KCdUb3BpY3MnLCBmdW5jdGlvbiAoJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBcnJheSwgRmlyZWJhc2VVcmwpIHtcclxuICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwgKyAndG9waWNzJylcclxuICAgIHZhciB0b3BpY3MgPSAkZmlyZWJhc2VPYmplY3QocmVmKVxyXG4gICAgdmFyIHRvcGljc0FyciA9ICRmaXJlYmFzZUFycmF5KHJlZilcclxuICAgIHZhciB0b3BpY0tleSA9ICcnXHJcblxyXG4gICAgdmFyIFRvcGljcyA9IHtcclxuICAgICAgLy8gR2V0IHRvcGljIHRhZ1xyXG4gICAgICBnZXRUYWc6IGZ1bmN0aW9uICh0YWcpIHtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLm9yZGVyQnlDaGlsZCgndGFncycpLmVxdWFsVG8odGFnKSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIEdldCB0b3BpYyBzbHVnXHJcbiAgICAgIGdldFNsdWc6IGZ1bmN0aW9uIChzbHVnKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSByZWYub3JkZXJCeUNoaWxkKCdzbHVnJykuZXF1YWxUbyhzbHVnKVxyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShkYXRhKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gR2V0dGluZyB0aGUgbGlzdCBvZiB0b3BpY3MgY3JlYXRlZCBieSB1c2VyX2lkXHJcbiAgICAgIGNyZWF0ZWRCeTogZnVuY3Rpb24gKHVpZCkge1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYub3JkZXJCeUNoaWxkKCd1aWQnKS5lcXVhbFRvKHVpZCkpXHJcblxyXG4gICAgICB9LFxyXG4gICAgICByZWZDaGlsZDogZnVuY3Rpb24gKGNoaWxkKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZChjaGlsZClcclxuICAgICAgfSxcclxuICAgICAgY291bnRVc2VyVG9waWNzOiBmdW5jdGlvbiAoKSB7fSxcclxuXHJcbiAgICAgIC8vIEdldHRpbmcgdGhlIGxpc3Qgb2YgdG9waWMgYmFzZSBvbiBjYXRlZ29yeVxyXG4gICAgICBsaXN0OiBmdW5jdGlvbiAoY2F0ZWdvcnkpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IHJlZi5vcmRlckJ5Q2hpbGQoJ2NhdGVnb3J5JykuZXF1YWxUbyhjYXRlZ29yeSlcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkoZGF0YSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIG5hbWU6IGZ1bmN0aW9uICh0b3BpY19zbHVnKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSByZWYub3JkZXJCeUNoaWxkKCdzbHVnJykuZXF1YWxUbyh0b3BpY19zbHVnKVxyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QoZGF0YSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFJldHVybiB0b3BpYyBkZXRhaWxzIGluIFJlZlxyXG4gICAgICBmb3J0b3BpY1JlZjogZnVuY3Rpb24gKHRvcGljX3NsdWcpIHtcclxuICAgICAgICByZXR1cm4gcmVmLm9yZGVyQnlDaGlsZCgnc2x1ZycpLmVxdWFsVG8odG9waWNfc2x1ZylcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGdldFRvcGljQnlLZXk6IGZ1bmN0aW9uICh0b3BpY19rZXkpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsICsgJ3RvcGljcy8nICsgdG9waWNfa2V5KVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgZ2V0VG9waWNCeVNsdWc6IGZ1bmN0aW9uICh0b3BpY19zbHVnKSB7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5vcmRlckJ5Q2hpbGQoJ3NsdWcnKS5lcXVhbFRvKHRvcGljX3NsdWcpLmxpbWl0VG9GaXJzdCgxKSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGluY3JlbWVudFZpZXc6IGZ1bmN0aW9uICh0b3BpY19zbHVnKSB7fSxcclxuXHJcbiAgICAgIC8vIFJldHVybiB0b3BpYyBkZXRhaWxzIGluIGFycmF5XHJcbiAgICAgIGZvcnRvcGljOiBmdW5jdGlvbiAodG9waWNfc2x1Zykge1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShUb3BpY3MuZm9ydG9waWNSZWYodG9waWNfc2x1ZykpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBSZXBseSBsaXN0aW5nXHJcbiAgICAgIHJlcGx5TGlzdDogZnVuY3Rpb24gKHRvcGljSWQpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IHJlZi5jaGlsZCh0b3BpY0lkICsgJy9yZXBsaWVzJylcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkoZGF0YSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFJlcGx5IEFycmF5XHJcbiAgICAgIHJlcGx5QXJyOiBmdW5jdGlvbiAodG9waWNJZCkge1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQodG9waWNJZCArICcvcmVwbGllcycpKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gUmVwbHkgY291bnRcclxuICAgICAgcmVwbHlDb3VudDogZnVuY3Rpb24gKHRvcGljSWQpIHtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9yZXBsaWVzLycpKVxyXG4gICAgICB9LFxyXG4gICAgICByZXBseUNvdW50UmVmOiBmdW5jdGlvbiAodG9waWNJZCkge1xyXG4gICAgICAgIHJldHVybiByZWYuY2hpbGQodG9waWNJZCArICcvcmVwbGllcy9jb3VudCcpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICByZXBseUluUmVwbHk6IGZ1bmN0aW9uICh0b3BpY0lkLCByZXBseUlkKSB7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9yZXBsaWVzLycgKyByZXBseUlkICsgJy9pblJlcGx5JykpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBSZXBseSBpbiBSZXBseSBBcnJheVxyXG4gICAgICByZXBseUluUmVwbHlBcnI6IGZ1bmN0aW9uICh0b3BpY0lkLCByZXBseUlkKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKHRvcGljSWQgKyAnL3JlcGxpZXMvJytyZXBseUlkKycvaW5SZXBseScpKSlcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKHRvcGljSWQgKyAnL3JlcGxpZXMvJyArIHJlcGx5SWQgKyAnL2luUmVwbHknKSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIHVwdm90ZXNcclxuICAgICAgZ2V0VXB2b3RlczogZnVuY3Rpb24gKHRvcGljSWQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgcmVmOiByZWYuY2hpbGQodG9waWNJZCArICcvdXB2b3RlcycpLFxyXG4gICAgICAgICAgYXJyYXk6ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCh0b3BpY0lkICsgJy91cHZvdGVzJykpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gZG93bnZvdGVzXHJcbiAgICAgIGdldERvd252b3RlczogZnVuY3Rpb24gKHRvcGljSWQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgcmVmOiByZWYuY2hpbGQodG9waWNJZCArICcvZG93bnZvdGVzJyksXHJcbiAgICAgICAgICBhcnJheTogJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKHRvcGljSWQgKyAnL2Rvd252b3RlcycpKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIGZvbGxvd2Vyc1xyXG4gICAgICBnZXRGb2xsb3dlcnM6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHJlZjogcmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLFxyXG4gICAgICAgICAgb2JqOiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIHVwdm90ZVRvcGljOiBmdW5jdGlvbiAodG9waWNJZCwgdWlkKSB7XHJcbiAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL3Vwdm90ZXMnKS5jaGlsZCh1aWQpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKVxyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL3Vwdm90ZXMnKS5jaGlsZCh1aWQpKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgdW5kb1Vwdm90ZTogZnVuY3Rpb24gKHRvcGljSWQsIHVpZCkge1xyXG4gICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy91cHZvdGVzJykuY2hpbGQodWlkKS5yZW1vdmUoZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOicsIGVycm9yKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlbW92ZWQgc3VjY2Vzc2Z1bGx5IScpXHJcbiAgICAgICAgICB9fSlcclxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKHRvcGljSWQgKyAnL3Vwdm90ZXMnKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgZG93bnZvdGVUb3BpYzogZnVuY3Rpb24gKHRvcGljSWQsIHVpZCkge1xyXG4gICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9kb3dudm90ZXMnKS5jaGlsZCh1aWQpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKVxyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL2Rvd252b3RlcycpLmNoaWxkKHVpZCkpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICB1bmRvRG93bnZvdGU6IGZ1bmN0aW9uICh0b3BpY0lkLCB1aWQpIHtcclxuICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvZG93bnZvdGVzJykuY2hpbGQodWlkKS5yZW1vdmUoZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOicsIGVycm9yKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlbW92ZWQgc3VjY2Vzc2Z1bGx5IScpXHJcbiAgICAgICAgICB9fSlcclxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKHRvcGljSWQgKyAnL2Rvd252b3RlcycpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBmb2xsb3c6IGZ1bmN0aW9uICh0b3BpY0lkLCB1aWQpIHtcclxuICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykuY2hpbGQoJ2hpc3RvcnknKS5jaGlsZCh1aWQpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKVxyXG4gICAgICAgICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykuY2hpbGQoJ2NvdW50JykpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICBpZiAoZGF0YS52YWx1ZSA9PT0gbnVsbCB8fCBkYXRhLnZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLmNoaWxkKCdjb3VudCcpLnNldCgxKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLmNoaWxkKCdjb3VudCcpLnNldChkYXRhLiR2YWx1ZSArIDEpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICB1bmZvbGxvdzogZnVuY3Rpb24gKHRvcGljSWQsIHVpZCkge1xyXG4gICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKS5jaGlsZCgnaGlzdG9yeScpLmNoaWxkKHVpZCkucmVtb3ZlKGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvcjonLCBlcnJvcilcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZW1vdmVkIHN1Y2Nlc3NmdWxseSEnKVxyXG4gICAgICAgICAgICAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLmNoaWxkKCdjb3VudCcpKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKS5jaGlsZCgnY291bnQnKS5zZXQoZGF0YS4kdmFsdWUgLSAxKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfX0pXHJcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgZ2V0Vmlld3M6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHJlZjogcmVmLmNoaWxkKHRvcGljSWQpLmNoaWxkKCd2aWV3cycpLFxyXG4gICAgICAgICAgb2JqOiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQpLmNoaWxkKCd2aWV3cycpKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIGxhdGVzdEZlZWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLm9yZGVyQnlDaGlsZCgnY3JlYXRlZCcpLmxpbWl0VG9MYXN0KDEwKSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHRvcGljc0J5VGFnOiBmdW5jdGlvbiAodGFnKSB7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5vcmRlckJ5Q2hpbGQoJ3RhZ3MnKS5lcXVhbFRvKHRhZykpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBSZXR1cm4gYXJyYXlcclxuICAgICAgYXJyOiAkZmlyZWJhc2VBcnJheShyZWYpLFxyXG5cclxuICAgICAgYWxsOiB0b3BpY3MsXHJcbiAgICAgIHJlZjogcmVmXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBUb3BpY3NcclxuXHJcbiAgfSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuY29udHJvbGxlcignUHJvZmlsZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRzdGF0ZSwgJGZpbHRlciwgbWQ1LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1NlcnZpY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF1dGgsVXNlcnMsVG9waWNzLCBGYWNlYm9vayxub3RpZnksQ2F0ZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vUmVzb2x2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlLGlzT3duZXIsdXNlclBvc3RzKXtcbiAgICB2YXIgcHJvZmlsZUN0cmwgPSB0aGlzO1xuXG4gICAgLy9QYXJzZXJcbiAgICBwcm9maWxlQ3RybC5wcm9maWxlICAgPSBwcm9maWxlO1xuICAgIHByb2ZpbGVDdHJsLmF1dGggICAgICA9IEF1dGg7XG4gICAgcHJvZmlsZUN0cmwudXNlcnMgICAgID0gVXNlcnM7XG4gICAgcHJvZmlsZUN0cmwudG9waWNzICAgID0gVG9waWNzO1xuICAgIHByb2ZpbGVDdHJsLmZhY2Vib29rICA9IEZhY2Vib29rO1xuICAgIHByb2ZpbGVDdHJsLmlzT3duZXIgICA9IGlzT3duZXI7XG4gICAgcHJvZmlsZUN0cmwuY2F0ZSAgICAgID0gQ2F0ZVNlcnZpY2U7XG4gICAgcHJvZmlsZUN0cmwuJHN0YXRlICAgID0gJHN0YXRlO1xuICAgIHByb2ZpbGVDdHJsLnVzZXJQb3N0cyA9IHVzZXJQb3N0cztcblxuICAgIHByb2ZpbGVDdHJsLmZlZWQgPSAnJztcbiAgICBwcm9maWxlQ3RybC5lZGl0SW5pdCA9ICd1c2VyRWRpdCc7XG5cbiAgICBwcm9maWxlQ3RybC5uYW1lRXhpc3Q9IGZhbHNlO1xuXG5cbiAgICBwcm9maWxlQ3RybC5nZXRVc2VyUG9zdCA9IGZ1bmN0aW9uKHVpZCl7XG4gICAgICBwcm9maWxlQ3RybC5mZWVkID0gcHJvZmlsZUN0cmwudG9waWNzLmNyZWF0ZWRCeSh1aWQpO1xuICAgIH1cblxuXG5cbiAgICAvKkxpbmsgYWNjb3VudCB3aXRoIGZhY2Vib29rKi9cbiAgICBwcm9maWxlQ3RybC5saW5rRmFjZWJvb2sgPSBmdW5jdGlvbigpe1xuICAgICAgcHJvZmlsZUN0cmwuZmFjZWJvb2subG9naW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgcHJvZmlsZUN0cmwuZmFjZWJvb2suZ2V0TG9naW5TdGF0dXMoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gJ2Nvbm5lY3RlZCcpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2dnZWRJbiA9IHRydWU7XG4gICAgICAgICAgICBwcm9maWxlQ3RybC5mYWNlYm9vay5hcGkoJy9tZScsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm90IGxvZ2dlZCBpblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvL1RoZSBvcmlnaW5hbCB2YWx1ZSBmcm9tIHByb2ZpbGVcbiAgICBwcm9maWxlQ3RybC5vbGRQcm9maWxlVmFsdWUgPSBwcm9maWxlQ3RybC5wcm9maWxlO1xuXG5cbiAgICBwcm9maWxlQ3RybC51c2VyQ3JlYXRlZCA9IGZ1bmN0aW9uKHVpZCl7XG4gICAgICByZXR1cm4gcHJvZmlsZUN0cmwudG9waWNzLmNyZWF0ZWRCeSh1aWQpO1xuICAgIH1cblxuXG4gICAgLy9QcmVzZXQgUGFyYW1ldGVyc1xuICAgIHByb2ZpbGVDdHJsLmltYWdlU3RyaW5ncyAgICA9IFtdO1xuICAgIHByb2ZpbGVDdHJsLnVzZXJDYXRlRm9sbG93ICA9IFtdO1xuICAgIHByb2ZpbGVDdHJsLmNhdGVJc0ZvbGxvdyAgICA9IFtdO1xuICAgIHByb2ZpbGVDdHJsLmZvbGxvd0xpc3QgICAgICA9ICcnO1xuXG5cblxuXG5cbiAgICBwcm9maWxlQ3RybC5mb2xsb3dDYXRlTGlzdEFyciA9IGZ1bmN0aW9uKHVpZCl7XG4gICAgICBwcm9maWxlQ3RybC5mb2xsb3dMaXN0ID0gcHJvZmlsZUN0cmwuY2F0ZS5mb2xsb3dMaXN0KHVpZCk7XG4gICAgfVxuXG4gICAgaWYoQXV0aC5yZWYuZ2V0QXV0aCgpKXtcbiAgICAgIHByb2ZpbGVDdHJsLmZvbGxvd0NhdGVMaXN0QXJyKEF1dGgucmVmLmdldEF1dGgoKS51aWQpO1xuICAgIH1cblxuICAgIHByb2ZpbGVDdHJsLmZvbGxvd0NhdGUgPSBmdW5jdGlvbihpbmRleCxjYXRlX3NsdWcpe1xuICAgICAgcHJvZmlsZUN0cmwuY2F0ZUlzRm9sbG93W2luZGV4XSAgPSB0cnVlO1xuICAgICAgcHJvZmlsZUN0cmwuY2F0ZS5hZGRDaGlsZChjYXRlX3NsdWcrJy9mb2xsb3dlcicpXG4gICAgICAgIC5jaGlsZChBdXRoLnJlZi5nZXRBdXRoKCkudWlkKS5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xuICAgIH1cblxuXG5cblxuXG4gICAgLy9VcGxvYWQgUHJvZmlsZSBpbWFnZVxuICAgIHByb2ZpbGVDdHJsLnVwbG9hZEZpbGUgPSBmdW5jdGlvbihmaWxlcykge1xuICAgICAgYW5ndWxhci5mb3JFYWNoKGZpbGVzLCBmdW5jdGlvbiAoZmxvd0ZpbGUsIGkpIHtcbiAgICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgIHZhciB1cmkgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgIHByb2ZpbGVDdHJsLmltYWdlU3RyaW5nc1tpXSA9IHVyaTtcbiAgICAgICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnVwZGF0ZSh7XCJwaG90b1wiOiB1cml9KVxuICAgICAgICAgIG5vdGlmeSh7bWVzc2FnZTonU2F2ZWQnLHBvc2l0aW9uOidjZW50ZXInLGR1cmF0aW9uOiAzMDAwIH0pO1xuICAgICAgICB9O1xuICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0RhdGFVUkwoZmxvd0ZpbGUuZmlsZSk7XG4gICAgICB9KVxuICAgIH07XG5cblxuICAgIC8vU2F2ZSBwcm9maWxlIHdpdGggcHJvZmlsZUN0cmwucHJvZmlsZVxuICAgIC8vcGFyYW1zOiByZWRpcmVjdCwgaWYgZXhpc3QgdGhlbiByZWRpcmVjdCBhZnRlciBzYXZlXG4gICAgcHJvZmlsZUN0cmwuc2F2ZVByb2ZpbGUgPSBmdW5jdGlvbihyZWRpcmVjdCl7XG4gICAgICBwcm9maWxlQ3RybC5wcm9maWxlLnVwZGF0ZWQgPSBtb21lbnQoKS50b0lTT1N0cmluZygpO1xuXG5cbiAgICAgIGlmKHByb2ZpbGVDdHJsLmxvY2F0aW9uICE9PSBudWxsICkge1xuICAgICAgICBsb2NhdGlvbkRldGFpbCA9IHtcbiAgICAgICAgICBwbGFjZV9pZDogcHJvZmlsZUN0cmwubG9jYXRpb24uZGV0YWlscy5wbGFjZV9pZCxcbiAgICAgICAgICBuYW1lOiBwcm9maWxlQ3RybC5sb2NhdGlvbi5kZXRhaWxzLm5hbWUsXG4gICAgICAgICAgYWRkcmVzczogcHJvZmlsZUN0cmwubG9jYXRpb24uZGV0YWlscy5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICBsYXQ6IHByb2ZpbGVDdHJsLmxvY2F0aW9uLmRldGFpbHMuZ2VvbWV0cnkubG9jYXRpb24ubGF0KCksXG4gICAgICAgICAgbG5nOiBwcm9maWxlQ3RybC5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxuICAgICAgICB9XG5cbiAgICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS51c2VyTG9jYXRpb24gPSBsb2NhdGlvbkRldGFpbDtcbiAgICAgIH1cblxuICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS4kc2F2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vdGlmeSh7bWVzc2FnZTonU2F2ZWQnLHBvc2l0aW9uOidjZW50ZXInLGR1cmF0aW9uOiAzMDAwIH0pO1xuICAgICAgICBpZihyZWRpcmVjdCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAkc3RhdGUuZ28ocmVkaXJlY3QpO1xuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuICAgICAgICBub3RpZnkoe21lc3NhZ2U6J0Vycm9yIHNhdmluZyBkYXRhJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy9VcGRhdGUgbmFtZVxuICAgIHByb2ZpbGVDdHJsLnVwZGF0ZU5hbWUgPSBmdW5jdGlvbigpe1xuXG4gICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnVwZGF0ZShcbiAgICAgICAge1xuICAgICAgICAgIFwiZmlyc3RuYW1lXCI6ICBwcm9maWxlQ3RybC5wcm9maWxlLmZpcnN0bmFtZSxcbiAgICAgICAgICBcImxhc3RuYW1lXCI6ICAgcHJvZmlsZUN0cmwucHJvZmlsZS5sYXN0bmFtZSxcbiAgICAgICAgfVxuICAgICAgKVxuXG4gICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQrJy9sb2cnKS5wdXNoKCkuc2V0KHtcbiAgICAgICAgYWN0aW9uOiAgIFwibmFtZV9jaGFuZ2VcIixcbiAgICAgICAgb2xkbmFtZTogIHByb2ZpbGVDdHJsLm9sZFByb2ZpbGVWYWx1ZS5maXJzdG5hbWUgKyBcIi1cIiArIHByb2ZpbGVDdHJsLm9sZFByb2ZpbGVWYWx1ZS5sYXN0bmFtZSxcbiAgICAgICAgY3JlYXRlZDogIG1vbWVudCgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH0pO1xuXG4gICAgICBub3RpZnkoe21lc3NhZ2U6J1NhdmVkJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICB9XG5cblxuICAgIC8vVXBkYXRlIEJpb1xuICAgIHByb2ZpbGVDdHJsLnVwZGF0ZUJpbyA9IGZ1bmN0aW9uKCl7XG4gICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnVwZGF0ZSh7XCJiaW9ncmFwaHlcIjogcHJvZmlsZUN0cmwucHJvZmlsZS5iaW9ncmFwaHl9KVxuXG4gICAgICBub3RpZnkoe21lc3NhZ2U6J1NhdmVkJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICB9XG5cblxuICAgIHByb2ZpbGVDdHJsLnVwZGF0ZVByb2ZpbGUgPSBmdW5jdGlvbigpe1xuICAgICAgLy9wcm9maWxlQ3RybC5wcm9maWxlLmVtYWlsSGFzaCA9IG1kNS5jcmVhdGVIYXNoKGF1dGgucGFzc3dvcmQuZW1haWwpO1xuICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS4kc2F2ZSgpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQnKTtcbiAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIC8vQ2hlY2sgaWYgdXNlciBleGlzdCwgcmV0dXJuIGZhbHNlIGlmIHRoZXkgZG9cbiAgICBwcm9maWxlQ3RybC5jaGVja1VzZXJuYW1lID0gZnVuY3Rpb24oKXtcblxuICAgICAgcHJvZmlsZUN0cmwudXNlcnMuY2hlY2tVc2VybmFtZUV4aXN0KHByb2ZpbGVDdHJsLnByb2ZpbGUuZGlzcGxheU5hbWUpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgaWYoc25hcHNob3QudmFsKCkgIT09IG51bGwpe1xuICAgICAgICAgIHJldHVybiBwcm9maWxlQ3RybC5uYW1lRXhpc3Q9dHJ1ZTtcbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgIHJldHVybiBwcm9maWxlQ3RybC5uYW1lRXhpc3Q9ZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5mYWN0b3J5KCdVc2VycycsIGZ1bmN0aW9uICgkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBGaXJlYmFzZVVybCwgJGh0dHApIHtcclxuICAgIHZhciB1c2Vyc1JlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCArICd1c2VycycpXHJcbiAgICB2YXIgdXNlcnMgPSAkZmlyZWJhc2VBcnJheSh1c2Vyc1JlZilcclxuXHJcbiAgICB2YXIgVXNlcnMgPSB7XHJcbiAgICAgIGdldExvY2F0aW9uSVA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgdXJsOiAnaHR0cDovL2lwaW5mby5pby9qc29uJyxcclxuICAgICAgICAgIG1ldGhvZDogJ0dFVCdcclxuICAgICAgICB9KVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgZ2V0TG9jYXRpb25JUERhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgdXJsOiAnaHR0cDovL2lwaW5mby5pby9qc29uJyxcclxuICAgICAgICAgIG1ldGhvZDogJ0dFVCdcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICByZXR1cm4gZGF0YS5kYXRhXHJcbiAgICAgICAgfSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHByb2ZpbGU6IGZ1bmN0aW9uKHVpZCl7XHJcbiAgICAgICAgcmV0dXJuIHVzZXJzLiRnZXRSZWNvcmQodWlkKTtcclxuICAgICAgfSxcclxuXHJcblxyXG4gICAgICAvL1NlYXJjaCBhbmQgcmV0dXJuIHVzZXJuYW1lXHJcbiAgICAgIGdldFByb2ZpbGVCeVVzZXJuYW1lOmZ1bmN0aW9uKHVzZXJuYW1lKXtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkodXNlcnNSZWYub3JkZXJCeUNoaWxkKCdkaXNwbGF5TmFtZScpLmVxdWFsVG8odXNlcm5hbWUpKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vQ2hlY2sgaWYgdXNlcm5hbWUgZXhpc3QsIGlmIG5vdCByZXR1cm4gbnVsbFxyXG4gICAgICBjaGVja1VzZXJuYW1lRXhpc3Q6ZnVuY3Rpb24odXNlcm5hbWUpe1xyXG4gICAgICAgIHJldHVybiB1c2Vyc1JlZi5vcmRlckJ5Q2hpbGQoJ2Rpc3BsYXlOYW1lJykuZXF1YWxUbyh1c2VybmFtZSk7XHJcbiAgICAgIH0sXHJcblxyXG5cclxuICAgICAgZ2V0UHJvZmlsZTogZnVuY3Rpb24gKHVpZCkge1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QodXNlcnNSZWYuY2hpbGQodWlkKSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGdldERpc3BsYXlOYW1lOiBmdW5jdGlvbiAodWlkKSB7XHJcbiAgICAgICAgaWYgKHVpZCAhPT0gbnVsbCB8fCB1aWQgIT09ICcnKSB7XHJcbiAgICAgICAgICByZXR1cm4gdXNlcnMuJGdldFJlY29yZCh1aWQpLmRpc3BsYXlOYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vR2V0IHVzZXIgRm9sbG93ZXJzXHJcbiAgICAgIGdldEZvbGxvd2VyOmZ1bmN0aW9uKHVpZCl7XHJcbiAgICAgICAgcmV0dXJuIHVzZXJzUmVmLmNoaWxkKHVpZCsnL3N0YXQvZm9sbG93ZXIvdWlkJyk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvL0NoZWNrIGlmIHVzZXIgaXMgYWxyZWFkeSBmb2xsb3dpbmdcclxuICAgICAgY2hlY2tGb2xsb3c6ZnVuY3Rpb24odWlkLGZvbGxvd19pZCl7XHJcblxyXG4gICAgICAgIHZhciBmb2xsb3c9ZmFsc2U7XHJcbiAgICAgICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsndXNlcnMvJyt1aWQrJy9zdGF0L2ZvbGxvd2luZy91aWQvJytmb2xsb3dfaWQpO1xyXG4gICAgICAgIHJlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3QpIHtcclxuICAgICAgICAgIGZvbGxvdyA9IHNuYXBzaG90LmV4aXN0cygpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgcmV0dXJuIGZvbGxvdztcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vQ2hhbmdlIHBhc3N3b3JkXHJcbiAgICAgIHVzZXJDaGFuZ2VQYXNzd29yZDpmdW5jdGlvbihlbWFpbCxvbGRwYXNzLG5ld3Bhc3Mpe1xyXG5cclxuICAgICAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKTtcclxuICAgICAgICByZWYuY2hhbmdlUGFzc3dvcmQoe1xyXG4gICAgICAgICAgZW1haWw6IGVtYWlsLFxyXG4gICAgICAgICAgb2xkUGFzc3dvcmQ6IG9sZHBhc3MsXHJcbiAgICAgICAgICBuZXdQYXNzd29yZDogbmV3cGFzc1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChlcnJvci5jb2RlKSB7XHJcbiAgICAgICAgICAgICAgY2FzZSBcIklOVkFMSURfUEFTU1dPUkRcIjpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlIHNwZWNpZmllZCB1c2VyIGFjY291bnQgcGFzc3dvcmQgaXMgaW5jb3JyZWN0LlwiKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIGNhc2UgXCJJTlZBTElEX1VTRVJcIjpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlIHNwZWNpZmllZCB1c2VyIGFjY291bnQgZG9lcyBub3QgZXhpc3QuXCIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3IgY2hhbmdpbmcgcGFzc3dvcmQ6XCIsIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVc2VyIHBhc3N3b3JkIGNoYW5nZWQgc3VjY2Vzc2Z1bGx5IVwiKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHVzZXJSZWY6IGZ1bmN0aW9uICh1aWQpIHtcclxuICAgICAgICByZXR1cm4gdXNlcnNSZWYuY2hpbGQodWlkKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgdXB2b3RlczogZnVuY3Rpb24gKHVpZCkge1xyXG4gICAgICAgIHJldHVybiB1c2Vyc1JlZi5jaGlsZCh1aWQpLmNoaWxkKCd1cHZvdGVzJylcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGRvd252b3RlczogZnVuY3Rpb24gKHVpZCkge1xyXG4gICAgICAgIHJldHVybiB1c2Vyc1JlZi5jaGlsZCh1aWQpLmNoaWxkKCdkb3dudm90ZXMnKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy9Vc2VyIGZvbGxvd2luZyB0b3BpY1xyXG4gICAgICBmb2xsb3dpbmc6IGZ1bmN0aW9uICh1aWQpIHtcclxuICAgICAgICByZXR1cm4gdXNlcnNSZWYuY2hpbGQodWlkKS5jaGlsZCgnZm9sbG93aW5nJylcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHVzZXJBcnJSZWY6IGZ1bmN0aW9uICh1aWQpIHtcclxuICAgICAgICByZXR1cm4gdXNlcnNSZWYuY2hpbGQodWlkKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgYWxsOiB1c2Vyc1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBVc2Vyc1xyXG4gIH0pXHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5mYWN0b3J5KCdVbmlxdWVJREdlbmVyYXRvcicsIGZ1bmN0aW9uKCl7ICBcclxuICAgIC8qKlxyXG4gICAgICogRmFuY3kgSUQgZ2VuZXJhdG9yIHRoYXQgY3JlYXRlcyAyMC1jaGFyYWN0ZXIgc3RyaW5nIGlkZW50aWZpZXJzIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG4gICAgICpcclxuICAgICAqIDEuIFRoZXkncmUgYmFzZWQgb24gdGltZXN0YW1wIHNvIHRoYXQgdGhleSBzb3J0ICphZnRlciogYW55IGV4aXN0aW5nIGlkcy5cclxuICAgICAqIDIuIFRoZXkgY29udGFpbiA3Mi1iaXRzIG9mIHJhbmRvbSBkYXRhIGFmdGVyIHRoZSB0aW1lc3RhbXAgc28gdGhhdCBJRHMgd29uJ3QgY29sbGlkZSB3aXRoIG90aGVyIGNsaWVudHMnIElEcy5cclxuICAgICAqIDMuIFRoZXkgc29ydCAqbGV4aWNvZ3JhcGhpY2FsbHkqIChzbyB0aGUgdGltZXN0YW1wIGlzIGNvbnZlcnRlZCB0byBjaGFyYWN0ZXJzIHRoYXQgd2lsbCBzb3J0IHByb3Blcmx5KS5cclxuICAgICAqIDQuIFRoZXkncmUgbW9ub3RvbmljYWxseSBpbmNyZWFzaW5nLiAgRXZlbiBpZiB5b3UgZ2VuZXJhdGUgbW9yZSB0aGFuIG9uZSBpbiB0aGUgc2FtZSB0aW1lc3RhbXAsIHRoZVxyXG4gICAgICogICAgbGF0dGVyIG9uZXMgd2lsbCBzb3J0IGFmdGVyIHRoZSBmb3JtZXIgb25lcy4gIFdlIGRvIHRoaXMgYnkgdXNpbmcgdGhlIHByZXZpb3VzIHJhbmRvbSBiaXRzXHJcbiAgICAgKiAgICBidXQgXCJpbmNyZW1lbnRpbmdcIiB0aGVtIGJ5IDEgKG9ubHkgaW4gdGhlIGNhc2Ugb2YgYSB0aW1lc3RhbXAgY29sbGlzaW9uKS5cclxuICAgICAqL1xyXG4gICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgIGdlbmVyYXRlUHVzaElEOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgLy8gTW9kZWxlZCBhZnRlciBiYXNlNjQgd2ViLXNhZmUgY2hhcnMsIGJ1dCBvcmRlcmVkIGJ5IEFTQ0lJLlxyXG4gICAgICAgICAgICB2YXIgUFVTSF9DSEFSUyA9ICctMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaX2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6JztcclxuXHJcbiAgICAgICAgICAgIC8vIFRpbWVzdGFtcCBvZiBsYXN0IHB1c2gsIHVzZWQgdG8gcHJldmVudCBsb2NhbCBjb2xsaXNpb25zIGlmIHlvdSBwdXNoIHR3aWNlIGluIG9uZSBtcy5cclxuICAgICAgICAgICAgdmFyIGxhc3RQdXNoVGltZSA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBXZSBnZW5lcmF0ZSA3Mi1iaXRzIG9mIHJhbmRvbW5lc3Mgd2hpY2ggZ2V0IHR1cm5lZCBpbnRvIDEyIGNoYXJhY3RlcnMgYW5kIGFwcGVuZGVkIHRvIHRoZVxyXG4gICAgICAgICAgICAvLyB0aW1lc3RhbXAgdG8gcHJldmVudCBjb2xsaXNpb25zIHdpdGggb3RoZXIgY2xpZW50cy4gIFdlIHN0b3JlIHRoZSBsYXN0IGNoYXJhY3RlcnMgd2VcclxuICAgICAgICAgICAgLy8gZ2VuZXJhdGVkIGJlY2F1c2UgaW4gdGhlIGV2ZW50IG9mIGEgY29sbGlzaW9uLCB3ZSdsbCB1c2UgdGhvc2Ugc2FtZSBjaGFyYWN0ZXJzIGV4Y2VwdFxyXG4gICAgICAgICAgICAvLyBcImluY3JlbWVudGVkXCIgYnkgb25lLlxyXG4gICAgICAgICAgICB2YXIgbGFzdFJhbmRDaGFycyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgLy8gcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgICB2YXIgZHVwbGljYXRlVGltZSA9IChub3cgPT09IGxhc3RQdXNoVGltZSk7XHJcbiAgICAgICAgICAgICAgbGFzdFB1c2hUaW1lID0gbm93O1xyXG5cclxuICAgICAgICAgICAgICB2YXIgdGltZVN0YW1wQ2hhcnMgPSBuZXcgQXJyYXkoOCk7XHJcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDc7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lU3RhbXBDaGFyc1tpXSA9IFBVU0hfQ0hBUlMuY2hhckF0KG5vdyAlIDY0KTtcclxuICAgICAgICAgICAgICAgIC8vIE5PVEU6IENhbid0IHVzZSA8PCBoZXJlIGJlY2F1c2UgamF2YXNjcmlwdCB3aWxsIGNvbnZlcnQgdG8gaW50IGFuZCBsb3NlIHRoZSB1cHBlciBiaXRzLlxyXG4gICAgICAgICAgICAgICAgbm93ID0gTWF0aC5mbG9vcihub3cgLyA2NCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChub3cgIT09IDApIHRocm93IG5ldyBFcnJvcignV2Ugc2hvdWxkIGhhdmUgY29udmVydGVkIHRoZSBlbnRpcmUgdGltZXN0YW1wLicpO1xyXG5cclxuICAgICAgICAgICAgICB2YXIgaWQgPSB0aW1lU3RhbXBDaGFycy5qb2luKCcnKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCFkdXBsaWNhdGVUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICBsYXN0UmFuZENoYXJzW2ldID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNjQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgdGltZXN0YW1wIGhhc24ndCBjaGFuZ2VkIHNpbmNlIGxhc3QgcHVzaCwgdXNlIHRoZSBzYW1lIHJhbmRvbSBudW1iZXIsIGV4Y2VwdCBpbmNyZW1lbnRlZCBieSAxLlxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMTE7IGkgPj0gMCAmJiBsYXN0UmFuZENoYXJzW2ldID09PSA2MzsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgIGxhc3RSYW5kQ2hhcnNbaV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGFzdFJhbmRDaGFyc1tpXSsrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWQgKz0gUFVTSF9DSEFSUy5jaGFyQXQobGFzdFJhbmRDaGFyc1tpXSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmKGlkLmxlbmd0aCAhPSAyMCkgdGhyb3cgbmV3IEVycm9yKCdMZW5ndGggc2hvdWxkIGJlIDIwLicpO1xyXG5cclxuICAgICAgICAgICAgICByZXR1cm4gaWQ7XHJcbiAgICAgICAgICAgIC8vIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgfSkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
