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
          'header@home': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }
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
          'header@trending': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }
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
          'header@category': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }
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
          'header@topic': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }
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
          'header@acccountEdit': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }

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
          },
          'header@login': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }
        }
      })

      .state('register', {
        url: '/user/register',
        views: {
          '': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'auth/register.html'
          },
          'header@register': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
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

   /* $scope.$watch(function() {
      console.log('watching...');
      return authCtrl.notification.unreadNotification();
    },function(val){
      console.log(val);
      if($scope.badgeNotifcation.$value > 0)
      {
        $notification('New message from Qanya', {
          body: 'Hello '+ authCtrl.profile.displayName,
          dir: 'auto',
          lang: 'en',
          tag: 'my-tag',
          icon: 'http://www.cl.cam.ac.uk/research/srg/netos/images/qsense-logo.png',
          //delay: 1000, // in ms
          focusWindowOnClick: true // focus the window on click
        })
      }
    }, true);*/


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
        ref.once("value",function(){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguY29udHJvbGxlci5qcyIsImF1dGguc2VydmljZS5qcyIsImNhdGVnb3J5LmNvbnRyb2xsZXIuanMiLCJjYXRlZ29yeS5zZXJ2aWNlLmpzIiwicG9zdC5zZXJ2aWNlLmpzIiwiZGFzaGJvYXJkLmNvbnRyb2xsZXIuanMiLCJkaXJlY3RpdmVzLmpzIiwiaG9tZS5jb250cm9sbGVyLmpzIiwibGFuZy5qcyIsIm5vdGlmaWNhdGlvbi5jb250cm9sbGVyLmpzIiwibm90aWZpY2F0aW9uLnNlcnZpY2UuanMiLCJwbGFjZS5jb250cm9sbGVyLmpzIiwicGxhY2Uuc2VydmljZS5qcyIsInV0aWxpdGllcy5zZXJ2aWNlLmpzIiwidGFnLmNvbnRyb2xsZXIuanMiLCJ0YWcuc2VydmljZS5qcyIsInRvcGljLWxhbmRpbmcuY29udHJvbGxlci5qcyIsInRvcGljcy5jb250cm9sbGVyLmpzIiwidG9waWNzLnNlcnZpY2UuanMiLCJwcm9maWxlLmNvbnRyb2xsZXIuanMiLCJ1c2Vycy5zZXJ2aWNlLmpzIiwiaGVscGVycy5zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQUtBLElBQUEsTUFBQSxRQUFBLE9BQUEsT0FBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBOzs7SUFHQTtJQUNBO0lBQ0E7O0lBRUE7SUFDQTs7OztHQUlBLDhCQUFBLFVBQUEsb0JBQUE7SUFDQSxtQkFBQSxjQUFBLFNBQUE7TUFDQSxNQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO01BQ0EsUUFBQTtNQUNBLFFBQUE7TUFDQSxRQUFBO01BQ0EsUUFBQTtNQUNBLHdCQUFBOztNQUVBLHNCQUFBLENBQUEsTUFBQTtRQUNBLE9BQUEsT0FBQSxPQUFBO01B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QUdBLGtDQUFBLFVBQUEsUUFBQSxPQUFBLE1BQUE7Z0JBQ0EsT0FBQSxLQUFBLEtBQUEsZUFBQSxNQUFBLFlBQUE7a0JBQ0EsT0FBQSxHQUFBOzs7OztVQUtBLHNCQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7Ozs7O09BS0EsTUFBQSxTQUFBO1FBQ0EsS0FBQTtRQUNBLE9BQUE7VUFDQSxJQUFBO1lBQ0EsYUFBQTs7VUFFQSxvQkFBQTtZQUNBLFlBQUE7WUFDQSxhQUFBOztVQUVBLGdCQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7Ozs7O09BS0EsTUFBQSxZQUFBO1FBQ0EsS0FBQTtRQUNBLE9BQUE7VUFDQSxJQUFBO1lBQ0EsWUFBQTtZQUNBLGFBQUE7O1VBRUEsbUJBQUE7WUFDQSxZQUFBO1lBQ0EsYUFBQTs7O1FBR0EsU0FBQTtVQUNBLGtDQUFBLFVBQUEsUUFBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLEtBQUEsZUFBQSxLQUFBLFVBQUEsTUFBQTtjQUNBLE9BQUEsR0FBQTtlQUNBLFVBQUEsT0FBQTtjQUNBLE9BQUE7Ozs7OztJQU1BLG1CQUFBLFVBQUE7OztHQUdBLE9BQUEsaUJBQUEsWUFBQTtJQUNBLE9BQUEsVUFBQSxPQUFBLE9BQUEsU0FBQTtNQUNBLElBQUEsV0FBQTtNQUNBLFFBQUEsUUFBQSxPQUFBLFVBQUEsTUFBQTtRQUNBLFNBQUEsS0FBQSxLQUFBLEtBQUEsSUFBQTs7TUFFQSxTQUFBLEtBQUEsVUFBQSxHQUFBLEdBQUE7UUFDQSxRQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsSUFBQSxDQUFBOztNQUVBLElBQUEsU0FBQSxTQUFBO01BQ0EsT0FBQTs7OztHQUlBLE9BQUEsYUFBQSxZQUFBO0lBQ0EsT0FBQSxVQUFBLE1BQUE7TUFDQSxPQUFBLE9BQUEsVUFBQSxRQUFBOzs7OztHQUtBLE9BQUEsa0JBQUEsVUFBQSxNQUFBO0lBQ0EsT0FBQSxVQUFBLE1BQUE7TUFDQSxPQUFBLE9BQUEsS0FBQSxZQUFBLEtBQUEsUUFBQSxPQUFBLFlBQUE7Ozs7R0FJQSxTQUFBLGVBQUE7O0FBRUEsU0FBQSxNQUFBLE1BQUE7RUFDQSxRQUFBLElBQUE7RUFDQSxPQUFBLEtBQUEsVUFBQSxNQUFBLE1BQUE7Ozs7QUFJQSxTQUFBLFFBQUEsTUFBQTtFQUNBLElBQUEsUUFBQSxNQUFBLFVBQUEsTUFBQSxLQUFBLFdBQUE7RUFDQSxNQUFBLFFBQUEsVUFBQSxHQUFBO0lBQ0EsSUFBQSxLQUFBLFFBQUEsT0FBQSxVQUFBO01BQ0EsS0FBQSxJQUFBLEtBQUEsR0FBQTtRQUNBLElBQUEsRUFBQSxlQUFBLElBQUE7VUFDQSxLQUFBLEtBQUEsRUFBQTs7Ozs7RUFLQSxPQUFBOzs7QUN4cEJBLFFBQUEsT0FBQTtHQUNBLFdBQUEsd0lBQUEsU0FBQSxPQUFBLE1BQUEsT0FBQSxPQUFBLFdBQUEsV0FBQSxZQUFBO21DQUNBLFlBQUEsY0FBQTtJQUNBLElBQUEsV0FBQTs7O0lBR0EsY0FBQTtPQUNBLEtBQUEsVUFBQSxZQUFBO1FBQ0EsUUFBQSxJQUFBOzs7O0lBSUEsU0FBQSxXQUFBO0lBQ0EsU0FBQSxXQUFBO0lBQ0EsU0FBQSxlQUFBOzs7SUFHQSxHQUFBLEtBQUEsSUFBQSxhQUFBLE1BQUE7TUFDQSxTQUFBLFdBQUEsU0FBQSxNQUFBLFdBQUEsS0FBQSxJQUFBLFVBQUE7O1FBRUE7TUFDQSxTQUFBLFNBQUE7Ozs7SUFJQSxTQUFBLE9BQUE7TUFDQSxPQUFBO01BQ0EsVUFBQTs7Ozs7Ozs7Ozs7Ozs7SUFjQSxPQUFBLG1CQUFBLFNBQUE7OztJQUdBLFNBQUEsZUFBQSxVQUFBO01BQ0EsU0FBQSxhQUFBLFlBQUEsU0FBQSxRQUFBOzs7SUFHQSxTQUFBLFlBQUEsVUFBQTtNQUNBLFFBQUEsSUFBQSxlQUFBLFNBQUEsa0JBQUE7Ozs7SUFJQSxPQUFBLE9BQUEsUUFBQSxTQUFBLFVBQUEsVUFBQTtNQUNBLElBQUEsT0FBQSxLQUFBLFNBQUEsR0FBQTtRQUNBLE9BQUEsV0FBQSxlQUFBLE9BQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUF5QkEsU0FBQSxhQUFBLFVBQUEsU0FBQTtNQUNBLFdBQUEsSUFBQTs7TUFFQSxTQUFBLElBQUEsWUFBQTs7TUFFQSxHQUFBLEtBQUEsSUFBQSxVQUFBO1FBQ0EsU0FBQSxNQUFBLFdBQUEsS0FBQSxJQUFBLFVBQUEsS0FBQSxPQUFBLENBQUEsT0FBQTs7Ozs7SUFLQSxHQUFBLENBQUEsU0FBQSxRQUFBLEtBQUE7TUFDQSxHQUFBLFNBQUEsSUFBQSxZQUFBO1FBQ0EsU0FBQSxXQUFBLFNBQUEsSUFBQTtXQUNBO1FBQ0EsU0FBQSxXQUFBOzs7UUFHQTtNQUNBLFNBQUEsV0FBQSxTQUFBLFFBQUE7Ozs7O0lBS0EsU0FBQSxRQUFBLFdBQUE7TUFDQSxTQUFBLEtBQUEsS0FBQSxrQkFBQSxTQUFBLE1BQUEsS0FBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLEdBQUE7U0FDQSxVQUFBLE1BQUE7UUFDQSxTQUFBLFFBQUE7Ozs7O0lBS0EsU0FBQSxTQUFBLFVBQUE7TUFDQSxLQUFBLEtBQUE7TUFDQSxPQUFBLEdBQUE7Ozs7SUFJQSxTQUFBLFdBQUEsV0FBQTtNQUNBLEtBQUEsS0FBQSxZQUFBLFNBQUEsTUFBQSxLQUFBLFVBQUEsS0FBQTtRQUNBLFNBQUE7U0FDQSxVQUFBLE1BQUE7UUFDQSxTQUFBLFFBQUE7Ozs7O0lBS0EsU0FBQSxjQUFBLGFBQUE7SUFDQSxTQUFBLGFBQUEsT0FBQTtNQUNBLE9BQUEsV0FBQTtRQUNBLFdBQUE7V0FDQTs7Ozs7QUNwSUEsUUFBQSxPQUFBO0dBQ0EsUUFBQSx5Q0FBQSxTQUFBLGVBQUEsWUFBQTtJQUNBLElBQUEsTUFBQSxJQUFBLFNBQUE7SUFDQSxJQUFBLE9BQUEsY0FBQTs7SUFFQSxJQUFBLE9BQUE7TUFDQSxJQUFBO01BQ0EsTUFBQTs7TUFFQSxPQUFBLFVBQUE7UUFDQSxJQUFBLE1BQUEsSUFBQTtRQUNBLEdBQUEsT0FBQSxNQUFBO1VBQ0EsT0FBQSxJQUFBLFVBQUE7O1lBRUE7VUFDQSxPQUFBOzs7OztJQUtBLE9BQUE7OztBQ3BCQSxRQUFBLE9BQUE7R0FDQSxXQUFBLDZEQUFBLFNBQUEsUUFBQSxTQUFBLFNBQUEsV0FBQTtJQUNBLElBQUEsV0FBQTs7O0lBR0EsU0FBQSxhQUFBO0lBQ0EsU0FBQSxhQUFBO0lBQ0EsU0FBQSxhQUFBOzs7O0FDUEEsUUFBQSxPQUFBOzs7R0FHQSxRQUFBLG9FQUFBLFNBQUEsaUJBQUEsaUJBQUEsWUFBQTtJQUNBLElBQUEsU0FBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsYUFBQSxnQkFBQTs7SUFFQSxJQUFBLE9BQUE7O01BRUEsTUFBQSxTQUFBLFdBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsZ0JBQUE7OztNQUdBLFVBQUEsU0FBQSxXQUFBO1FBQ0EsT0FBQSxnQkFBQSxTQUFBLE1BQUE7OztNQUdBLFVBQUEsU0FBQSxVQUFBO1FBQ0EsT0FBQSxJQUFBLE1BQUE7OztNQUdBLFdBQUEsU0FBQSxJQUFBO1FBQ0EsSUFBQSxPQUFBLElBQUEsYUFBQSxpQkFBQSxRQUFBO1FBQ0EsT0FBQSxlQUFBOzs7TUFHQSxTQUFBLFNBQUEsS0FBQSxJQUFBO1FBQ0EsSUFBQSxTQUFBLElBQUEsU0FBQSxZQUFBLGNBQUEsS0FBQSxhQUFBO1FBQ0EsSUFBQTs7O01BR0EsV0FBQSxTQUFBLEtBQUEsSUFBQTtRQUNBLElBQUEsT0FBQTtRQUNBLElBQUEsU0FBQSxJQUFBLFNBQUEsWUFBQSxjQUFBLEtBQUEsYUFBQTtRQUNBLElBQUEsS0FBQSxTQUFBLFNBQUEsVUFBQTtVQUNBLFNBQUEsU0FBQTs7UUFFQSxPQUFBOztNQUVBLEtBQUEsZUFBQTtNQUNBLElBQUE7O0lBRUEsT0FBQTs7OztBQzNDQSxRQUFBLE9BQUE7OztHQUdBLFFBQUEsMkNBQUEsU0FBQSxpQkFBQSxZQUFBO0lBQ0EsSUFBQSxTQUFBLElBQUEsU0FBQSxZQUFBO0lBQ0EsSUFBQSxTQUFBLGdCQUFBOztJQUVBLElBQUEsS0FBQTtNQUNBLFdBQUEsU0FBQSxXQUFBO1FBQ0EsSUFBQSxPQUFBLElBQUEsYUFBQSxRQUFBLFFBQUE7UUFDQSxPQUFBLGdCQUFBOztNQUVBLFVBQUEsU0FBQSxXQUFBO1FBQ0EsT0FBQSxnQkFBQSxTQUFB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QSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7OztNQUdBLGtCQUFBO01BQ0Esa0JBQUE7Ozs7TUFJQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTtNQUNBLHdCQUFBO01BQ0Esd0JBQUE7TUFDQSx3QkFBQTs7Ozs7TUFLQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7OztNQUdBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTs7OztJQUlBLG1CQUFBLGFBQUEsT0FBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBO01BQ0Esa0JBQUE7TUFDQSxrQkFBQTtNQUNBLGtCQUFBOzs7SUFHQSxtQkFBQSxrQkFBQTs7O0FDL0ZBLFFBQUEsT0FBQTtHQUNBLFdBQUEsNERBQUEsU0FBQSxPQUFBLFNBQUEsT0FBQSxZQUFBO0lBQ0EsSUFBQSxXQUFBOzs7SUFHQSxTQUFBLFNBQUE7SUFDQSxTQUFBLFNBQUE7SUFDQSxTQUFBLGNBQUE7O0lBRUEsU0FBQSxVQUFBLFNBQUEsSUFBQTtNQUNBLE9BQUEsU0FBQSxJQUFBLEtBQUEsS0FBQSxLQUFBOzs7O0FDVkEsUUFBQSxPQUFBOztHQUVBLFFBQUEsOEZBQUEsU0FBQSxpQkFBQSxpQkFBQTttQ0FDQSxNQUFBLGNBQUE7SUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUE7SUFDQSxJQUFBLE9BQUEsZ0JBQUE7SUFDQSxJQUFBLFFBQUE7O0lBRUEsSUFBQSxvQkFBQTs7O0lBR0EsSUFBQSxlQUFBOzs7TUFHQSxtQkFBQSxTQUFBLElBQUE7UUFDQSxJQUFBLE1BQUEsSUFBQSxTQUFBLFlBQUEsZ0JBQUEsSUFBQTtRQUNBLElBQUE7UUFDQSxJQUFBLEdBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxVQUFBLFNBQUE7O1FBRUEsSUFBQSxLQUFBLFFBQUEsVUFBQTtVQUNBLGNBQUEsMEJBQUE7WUFDQSxNQUFBLFNBQUE7WUFDQSxLQUFBO1lBQ0EsTUFBQTtZQUNBLEtBQUE7WUFDQSxNQUFBOztZQUVBLG9CQUFBOzs7UUFHQSxPQUFBOzs7O01BSUEsZUFBQSxTQUFBLFFBQUEsSUFBQTtRQUNBLElBQUEsTUFBQSxNQUFBLFlBQUE7UUFDQSxJQUFBLEtBQUEsU0FBQSxTQUFBLFVBQUE7VUFDQSxTQUFBLFFBQUEsU0FBQSxlQUFBOztZQUVBLGFBQUEsd0JBQUEsUUFBQSxjQUFBOzs7Ozs7TUFNQSxVQUFBLFNBQUEsUUFBQSxJQUFBLFNBQUE7O1FBRUEsUUFBQSxJQUFBLE9BQUE7UUFDQSxRQUFBLElBQUEsYUFBQTs7UUFFQSxhQUFBLFNBQUEsS0FBQSxPQUFBLElBQUE7VUFDQSxZQUFBO1VBQ0EsWUFBQTtVQUNBLFlBQUE7VUFDQSxZQUFBLFNBQUE7Ozs7Ozs7TUFPQSxZQUFBLFNBQUEsSUFBQTtRQUNBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQSxnQkFBQSxJQUFBO1FBQ0EsSUFBQSxJQUFBOzs7Ozs7TUFNQSx3QkFBQSxTQUFBLFFBQUEsSUFBQSxTQUFBOztRQUVBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQSxnQkFBQSxJQUFBO1FBQ0EsSUFBQSxLQUFBLFNBQUEsU0FBQSxVQUFBOztTQUVBLEdBQUEsU0FBQSxTQUFBLE9BQUE7WUFDQSxJQUFBLElBQUE7ZUFDQTtZQUNBLElBQUEsSUFBQSxTQUFBLFFBQUE7O1dBRUEsVUFBQSxhQUFBO1VBQ0EsUUFBQSxJQUFBLHNCQUFBLFlBQUE7Ozs7UUFJQSxhQUFBLFVBQUEsUUFBQSxJQUFBOzs7OztNQUtBLFNBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxJQUFBLE1BQUE7OztNQUdBLFlBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxnQkFBQSxJQUFBLE1BQUE7OztNQUdBLEtBQUEsZUFBQTtNQUNBLEtBQUE7O0lBRUEsT0FBQTs7OztBQ3JHQSxRQUFBLE9BQUE7R0FDQSxXQUFBLGtKQUFBLFNBQUEsT0FBQSxPQUFBLFlBQUEsV0FBQTs7cUNBRUEsTUFBQSxRQUFBLE1BQUEsT0FBQSxLQUFBO3FDQUNBLGNBQUE7O0lBRUEsSUFBQSxhQUFBO0lBQ0EsUUFBQSxJQUFBO0lBQ0EsV0FBQSxlQUFBOzs7OztBQ1JBLFFBQUEsT0FBQTtHQUNBLFFBQUEsNENBQUEsU0FBQSxnQkFBQSxZQUFBOztJQUVBLElBQUEsTUFBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsa0JBQUEsSUFBQSxTQUFBLFlBQUE7O0lBRUEsSUFBQSxTQUFBLGVBQUE7O0lBRUEsSUFBQSxTQUFBO01BQ0EsVUFBQSxTQUFBLFVBQUE7UUFDQSxPQUFBLElBQUEsTUFBQTs7O01BR0EscUJBQUEsU0FBQSxVQUFBO1FBQ0EsT0FBQSxnQkFBQSxNQUFBOzs7TUFHQSxZQUFBLFNBQUEsU0FBQTtRQUNBLE9BQUEsSUFBQSxNQUFBLFNBQUE7O01BRUEsS0FBQTs7SUFFQSxPQUFBOzs7QUN0QkEsUUFBQSxPQUFBOzs7R0FHQSxRQUFBLGlFQUFBLFNBQUEsaUJBQUEsZ0JBQUEsWUFBQTtJQUNBLElBQUEsU0FBQSxJQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsYUFBQSxnQkFBQTtJQUNBLElBQUEsV0FBQSxlQUFBOztJQUVBLElBQUEsV0FBQTtNQUNBLFNBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxPQUFBLElBQUEsTUFBQTtRQUNBLE9BQUEsZ0JBQUE7OztNQUdBLEtBQUE7O0lBRUEsT0FBQTs7Ozs7R0FLQSxRQUFBLCtDQUFBLFNBQUEsZ0JBQUEsWUFBQTtJQUNBLElBQUEsTUFBQSxJQUFBLFNB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QUNBLFVBQUEsc0JBQUEsVUFBQSxNQUFBLFVBQUEsVUFBQTtNQUNBLFVBQUEsZ0JBQUEsVUFBQSxNQUFBLFVBQUEsVUFBQTs7UUFFQTtNQUNBLFVBQUEsU0FBQTtNQUNBLFVBQUEsTUFBQTtNQUNBLFVBQUEsVUFBQTs7Ozs7O0lBTUEsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBLGdCQUFBO0lBQ0EsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBLGdCQUFBO0lBQ0EsVUFBQSxnQkFBQTtJQUNBLFVBQUEsZUFBQTtJQUNBLFVBQUEsZ0JBQUE7OztJQUdBLFVBQUEsZ0JBQUE7TUFDQSxZQUFBO01BQ0EsUUFBQTtNQUNBLFVBQUE7TUFDQSxRQUFBO01BQ0EsUUFBQTs7Ozs7SUFLQSxVQUFBLGlCQUFBLFVBQUE7O01BRUEsSUFBQSxXQUFBLE9BQUEsS0FBQSxVQUFBLGVBQUE7TUFDQSxJQUFBLE1BQUE7TUFDQSxJQUFBLElBQUEsRUFBQSxFQUFBLEVBQUEsU0FBQSxJQUFBO1FBQ0EsTUFBQSxNQUFBLFVBQUEsY0FBQTs7O01BR0EsVUFBQSxxQkFBQSxJQUFBOztNQUVBLFFBQUEsSUFBQSxVQUFBOztNQUVBLFVBQUEsZ0JBQUEsRUFBQSxLQUFBLFVBQUEsb0JBQUEsTUFBQSxVQUFBOzs7OztJQUtBLFVBQUEsaUJBQUEsU0FBQSxLQUFBO01BQ0EsR0FBQTtNQUNBO01BQ0EsSUFBQSxLQUFBO01BQ0EsSUFBQSxJQUFBLEVBQUEsRUFBQSxFQUFBLEtBQUEsT0FBQSxJQUFBO1FBQ0EsTUFBQSxNQUFBLEtBQUEsR0FBQTs7TUFFQSxPQUFBLElBQUEsS0FBQTs7Ozs7O0lBTUEsV0FBQSxDQUFBLGNBQUEsYUFBQSxrQkFBQSxtQkFBQSxLQUFBLFVBQUEsY0FBQTtNQUNBLFVBQUEsY0FBQSxhQUFBO01BQ0EsVUFBQSxjQUFBLGFBQUE7TUFDQSxVQUFBLGNBQUEsYUFBQTtNQUNBLFVBQUEscUJBQUEsYUFBQTs7OztJQUlBLFVBQUEsV0FBQSxTQUFBLE9BQUE7TUFDQSxHQUFBLFNBQUEsS0FBQTs7Ozs7Ozs7O0lBU0EsVUFBQSxjQUFBLFNBQUEsSUFBQTtNQUNBLElBQUEsZ0JBQUEsQ0FBQSxTQUFBLFNBQUEsU0FBQSxVQUFBLE9BQUE7TUFDQSxVQUFBLEtBQUE7VUFDQSxZQUFBO1VBQ0EsYUFBQTtVQUNBLFFBQUEsUUFBQSxRQUFBLFNBQUE7VUFDQSxhQUFBO1VBQ0EscUJBQUE7VUFDQSxZQUFBOzs7Ozs7SUFNQSxVQUFBLGFBQUEsU0FBQSxLQUFBOztNQUVBLFFBQUEsSUFBQSxVQUFBO01BQ0EsT0FBQSxVQUFBOzs7O0lBSUEsVUFBQSxXQUFBLFNBQUEsT0FBQTtNQUNBLFVBQUEsV0FBQTtNQUNBLElBQUEsT0FBQTtNQUNBLEtBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxNQUFBLFFBQUEsS0FBQTtRQUNBLEtBQUEsS0FBQSxNQUFBOztNQUVBLFFBQUEsSUFBQTtNQUNBLE9BQUE7OztJQUdBLFVBQUEsV0FBQSxTQUFBLE9BQUE7TUFDQSxRQUFBLElBQUEsVUFBQSxLQUFBOzs7Ozs7Ozs7O0lBVUEsVUFBQSxhQUFBLFNBQUEsTUFBQSxPQUFBO01BQ0EsUUFBQSxRQUFBLE9BQUEsVUFBQSxVQUFBLE9BQUE7UUFDQSxJQUFBLGFBQUEsSUFBQTtRQUNBLFdBQUEsU0FBQSxVQUFBLE9BQUE7VUFDQSxJQUFBLE1BQUEsTUFBQSxPQUFBO1VBQ0EsVUFBQSxhQUFBLFNBQUE7O1FBRUEsV0FBQSxjQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsb0JBQUEsU0FBQSxHQUFBLFlBQUEsSUFBQTs7TUFFQSxJQUFBLFVBQUEsVUFBQTtTQUNBLE1BQUEsVUFBQTtTQUNBLFlBQUEsVUFBQTtTQUNBLFlBQUE7U0FDQSxHQUFBLFVBQUE7U0FDQSxPQUFBLFVBQUE7TUFDQSxVQUFBLEtBQUEsU0FBQSxLQUFBLFdBQUE7UUFDQSxHQUFBLFVBQUEsWUFBQSxZQUFBLEtBQUE7VUFDQSxPQUFBLEdBQUE7Ozs7Ozs7SUFPQSxVQUFBLGNBQUEsU0FBQSxZQUFBLElBQUE7O01BRUEsR0FBQSxlQUFBLFVBQUEsSUFBQTtRQUNBLGFBQUEsVUFBQSxPQUFBLFNBQUEsSUFBQSxNQUFBLFVBQUEsUUFBQSxTQUFBLElBQUE7UUFDQSxPQUFBO1lBQ0E7UUFDQSxPQUFBOzs7Ozs7SUFNQSxVQUFBLFFBQUEsU0FBQSxTQUFBOztNQUVBLFVBQUEsT0FBQSxTQUFBLFNBQUEsS0FBQSxLQUFBO1FBQ0EsVUFBQSxTQUFBO1FBQ0EsVUFBQSxVQUFBLFNBQUE7UUFDQSxVQUFBLFVBQUE7UUFDQSxVQUFBLFVBQUE7UUFDQSxVQUFBLFNBQUE7U0FDQSxLQUFBLFVBQUE7OztRQUdBLFVBQUEsS0FBQSx3QkFBQSxTQUFBLElBQUEsU0FBQSxJQUFBLFVBQUE7Ozs7Ozs7O01BUUEsVUFBQSxPQUFBLFdBQUEsU0FBQSxLQUFBLFVBQUEsS0FBQSxTQUFBLEtBQUE7UUFDQSxHQUFBLENBQUEsS0FBQSxNQUFBO1VBQ0EsVUFBQSxPQUFBLGNBQUEsU0FBQSxLQUFBLElBQUE7YUFDQTtVQUNBLFVBQUEsT0FBQSxjQUFBLFNBQUE7YUFDQSxJQUFBLEtBQUEsT0FBQTs7Ozs7O01BTUEsVUFBQSxNQUFBLFFBQUEsVUFBQSxLQUFBLE1BQUE7U0FDQSxJQUFBLFVBQUEsUUFBQSxLQUFBLFFBQUEsUUFBQTs7TUFFQSxVQUFBLE1BQUEsUUFBQSxVQUFBLEtBQUEsTUFBQSx1QkFBQSxTQUFBO1NBQ0EsT0FBQSxJQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsZUFBQSxTQUFBLFFBQUEsUUFBQTtNQUNBLFVBQUEsT0FBQSxnQkFBQSxRQUFBLFNBQUEsS0FBQTtRQUNBLFVBQUEsVUFBQSxhQUFBO1FBQ0EsVUFBQSxVQUFBO1FBQ0EsVUFBQSxTQUFBOzs7Ozs7SUFNQSxVQUFBLGVBQUEsV0FBQTtNQUNBLElBQUEsWUFBQSxVQUFBLGVBQUEsT0FBQTtNQUNBLFVBQUEsZUFBQSxLQUFBLENBQUEsS0FBQSxXQUFBOzs7SUFHQSxVQUFBLGVBQUEsV0FBQTtNQUNBLElBQUEsV0FBQSxVQUFBLGVBQUEsT0FBQTtNQUNBLFVBQUEsZUFBQSxPQUFBOzs7OztJQUtBLFVBQUEsY0FBQSxTQUFBLFNBQUEsUUFBQTs7O01BR0EsSUFBQSxpQkFBQTs7TUFFQSxHQUFBLFVBQUEsU0FBQSxhQUFBLElBQUE7UUFDQSxRQUFBLElBQUEsVUFBQSxTQUFBO1FBQ0EsaUJBQUE7VUFDQSxVQUFBLFVBQUEsU0FBQSxTQUFBLFFBQUE7VUFDQSxVQUFBLEtBQUEsUUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQTtVQUNBLFVBQUEsVUFBQSxTQUFBLFNBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxVQUFBLFVBQUEsU0FBQSxTQUFBLFFBQUEsU0FBQSxTQUFBO1VBQ0EsVUFBQSxVQUFBLFNBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXlCQSxVQUFBLE9BQUEsSUFBQSxLQUFBO1VBQ0EsZ0JBQUEsVUFBQTtVQUNBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBLFVBQUEsU0FBQTtVQUNBLGdCQUFBO1VBQ0EsZ0JBQUEsVUFBQTs7VUFFQSxnQkFBQSxVQUFBLFNBQUE7VUFDQSxnQkFBQSxVQUFBO1VBQ0EsZ0JBQUEsVUFBQTtVQUNBLGdCQUFBO1VBQ0EsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUE7VUFDQSxnQkFBQSxTQUFBO1VBQ0EsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUEsVUFBQSxTQUFBO1VBQ0EsZ0JBQUEsVUFBQTtXQUNBLEtBQUEsU0FBQSxNQUFBOztVQUVBLElBQUEsVUFBQTs7VUFFQSxHQUFBLEtBQUEsUUFBQSxVQUFBLFNBQUEsU0FBQSxHQUFBO1lBQ0EsV0FBQSxVQUFBLFNBQUE7ZUFDQTtZQUNBLFdBQUEsS0FBQSxRQUFBLFVBQUEsU0FBQTs7OztVQUlBLFVBQUEsT0FBQSxjQUFBLE1BQUEsT0FBQSxPQUFBLENBQUEsT0FBQSxTQUFBLE1BQUE7OztVQUdBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBO2FBQ0EsSUFBQSxVQUFBLFFBQUEsS0FBQSxPQUFBLFFBQUE7O1VBRUEsVUFBQSxNQUFBLFFBQUEsVUFBQSxLQUFBLE1BQUEsc0JBQUEsTUFBQTthQUNBLE9BQUEsSUFBQSxTQUFBOzs7VUFHQSxHQUFBLG1CQUFBLEdBQUE7O1lBRUEsVUFBQSxPQUFBLFNBQUEsZUFBQTt1QkFDQSxNQUFBLE1BQUE7dUJBQ0EsT0FBQSxJQUFBLFNBQUE7O1lBRUEsVUFBQSxPQUFBLFNBQUEsZUFBQTtlQUNBLE1BQUEsUUFBQSxJQUFBOzs7O1VBSUEsR0FBQSxVQUFBLFNBQUEsU0FBQSxLQUFBO1lBQ0EsS0FBQSxJQUFBLFFBQUEsR0FBQSxRQUFBLFVBQUEsU0FBQSxLQUFBLFFBQUEsRUFBQSxPQUFBO2NBQ0EsVUFBQSxLQUFBLFNBQUEsVUFBQSxTQUFBLEtBQUEsT0FBQTtpQkFDQSxNQUFBLE1BQUEsT0FBQSxPQUFBLElBQUEsU0FBQTs7Ozs7VUFLQSxVQUFBLEtBQUEsZUFBQSxNQUFBLE1BQUEsVUFBQTs7OztVQUlBLFVBQUEsV0FBQTtZQUNBLE1BQUE7Ozs7Ozs7SUFPQSxVQUFBLGNBQUEsU0FBQSxXQUFBO01BQ0EsR0FBQSxVQUFBLE1BQUEsWUFBQSxVQUFBLElBQUEsWUFBQTtRQUNBLE9BQUE7V0FDQTtRQUNBLE9BQUE7Ozs7OztJQU1BLFVBQUEsYUFBQSxTQUFBLFdBQUE7OztNQUdBLFVBQUEsTUFBQSxXQUFBLFlBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxZQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxTQUFBLFFBQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsWUFBQSxNQUFBLHNCQUFBLFVBQUE7V0FDQSxPQUFBLElBQUEsU0FBQTs7OztNQUlBLFVBQUEsTUFBQSxXQUFBLFVBQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxNQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBO1dBQ0EsSUFBQSxLQUFBLEtBQUEsU0FBQSxRQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBLHVCQUFBO1dBQ0EsT0FBQSxJQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsZUFBQSxTQUFBLFdBQUE7OztNQUdBLFVBQUEsTUFBQSxXQUFBLFlBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTs7UUFFQSxVQUFBLE1BQUEsUUFBQSxZQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxTQUFBLFFBQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsWUFBQSxNQUFBLHNCQUFBLFVBQUEsS0FBQTs7OztNQUlBLFVBQUEsTUFBQSxXQUFBLFVBQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxNQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBO1dBQ0EsSUFBQSxLQUFBLEtBQUEsVUFBQSxRQUFBOztRQUVBLFVBQUEsTUFBQSxRQUFBLFVBQUEsS0FBQSxNQUFBLHVCQUFBLFlBQUE7Ozs7Ozs7O0lBUUEsVUFBQSxTQUFBLFNBQUEsTUFBQTs7TUFFQSxHQUFBLE1BQUEsYUFBQSxhQUFBLE1BQUEsVUFBQSxVQUFBLFFBQUEsVUFBQTtRQUNBLFVBQUEsZUFBQTs7TUFFQSxVQUFBLE9BQUEsWUFBQSxNQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsS0FBQSxTQUFBLE1BQUE7UUFDQSxVQUFBLGtCQUFBLE1BQUEsTUFBQSxLQUFBLElBQUEsTUFBQTs7O1FBR0EsVUFBQSxNQUFBLFdBQUEsTUFBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsTUFBQSxLQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxRQUFBLFFBQUE7UUFDQSxVQUFBLE1BQUEsUUFBQSxNQUFBLEtBQUEsTUFBQSx1QkFBQSxNQUFBO1dBQ0EsT0FBQSxJQUFBLFNBQUE7Ozs7OztJQU1BLFVBQUEsZUFBQSxTQUFBLE1BQUE7TUFDQSxVQUFBLE9BQUEsV0FBQSxNQUFBLEtBQUEsVUFBQTs7TUFFQSxVQUFBLE1BQUEsV0FBQSxNQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsTUFBQTs7O1FBR0EsVUFBQSxNQUFBLFFBQUEsTUFBQSxLQUFBLE1BQUE7V0FDQSxJQUFBLEtBQUEsS0FBQSxRQUFBLFFBQUE7O1FBRUEsVUFBQSxNQUFBLFFBQUEsTUFBQSxLQUFBLE1BQUEsdUJBQUEsTUFBQSxLQUFBOzs7O01BSUEsVUFBQSxrQkFBQSxNQUFBLE1BQUEsS0FBQSxPQUFBLFNBQUEsTUFBQTtZQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsSUFBQSxVQUFBO2lCQUNBO1lBQ0EsUUFBQSxJQUFBOzs7OztJQUtBLFVBQUEsV0FBQSxTQUFBLE1BQUE7TUFDQSxHQUFBLE1BQUEsV0FBQSxhQUFBLE1BQUEsUUFBQSxVQUFBLFFBQUEsVUFBQTtRQUNBLFVBQUEsYUFBQTs7TUFFQSxVQUFBLE9BQUEsY0FBQSxNQUFBLEtBQUEsVUFBQSxLQUFBLFVBQUEsS0FBQSxTQUFBLE1BQUE7UUFDQSxVQUFBLG9CQUFBLE1BQUEsTUFBQSxLQUFBLElBQUEsTUFBQTs7OztJQUlBLFVBQUEsaUJBQUEsU0FBQSxNQUFBO01BQ0EsVUFBQSxPQUFBLGFBQUEsTUFBQSxLQUFBLFVBQUE7TUFDQSxVQUFBLG9CQUFBLE1BQUEsTUFBQSxLQUFBLE9BQUEsU0FBQSxNQUFBO1lBQ0EsSUFBQSxPQUFBO1lBQ0EsUUFBQSxJQUFBLFVBQUE7aUJBQ0E7WUFDQSxRQUFBLElBQUE7Ozs7O0lBS0EsVUFBQSxjQUFBLFNBQUEsTUFBQTtNQUNBLFVBQUEsT0FBQSxPQUFBLE1BQUEsS0FBQSxVQUFBLEtBQUEsVUFBQSxLQUFBLFNBQUEsTUFBQTtRQUNBLFVBQUEsY0FBQSxNQUFBLE1BQUEsS0FBQSxJQUFBLE1BQUEsUUFBQSxVQUFBOzs7O0lBSUEsVUFBQSxnQkFBQSxTQUFBLE1BQUE7TUFDQSxVQUFBLE9BQUEsU0FBQSxNQUFBLEtBQUEsVUFBQTtNQUNBLFVBQUEsY0FBQSxNQUFBLE1BQUEsS0FBQSxPQUFBLFNBQUEsTUFBQTtZQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsSUFBQSxVQUFBO2lCQUNBO1lBQ0EsUUFBQSxJQUFBOzs7Ozs7OztBQVFBLFNBQUEsYUFBQSxRQUFBLFFBQUE7RUFDQSxPQUFBLEtBQUEsU0FBQSxVQUFBLE1BQUE7SUFDQSxPQUFBLElBQUEsS0FBQSxPQUFBLFVBQUEsT0FBQTtNQUNBLElBQUEsQ0FBQSxPQUFBO1FBQ0EsT0FBQTs7V0FFQSxJQUFBLE9BQUEsYUFBQSxlQUFBLFFBQUEsT0FBQTtRQUNBLFFBQUEsTUFBQTs7Ozs7O0FDL2ZBLFFBQUEsT0FBQTs7R0FFQSxRQUFBLCtEQUFBLFVBQUEsaUJBQUEsZ0JBQUEsYUFBQTtJQUNBLElBQUEsTUFBQSxJQUFBLFNBQUEsY0FBQTtJQUNBLElBQUEsU0FBQSxnQkFBQTtJQUNBLElBQUEsWUFBQSxlQUFBO0lBQ0EsSUFBQSxXQUFBOztJQUVBLElBQUEsU0FBQTs7TUFFQSxRQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsZUFBQSxJQUFBLGFBQUEsUUFBQSxRQUFBOzs7O01BSUEsU0FBQSxVQUFBLE1BQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsZUFBQTs7OztNQUlBLFdBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxPQUFBLFFBQUE7OztNQUdBLFVBQUEsVUFBQSxPQUFBO1FBQ0EsT0FBQSxJQUFBLE1BQUE7O01BRUEsaUJBQUEsWUFBQTs7O01BR0EsTUFBQSxVQUFBLFVBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFlBQUEsUUFBQTtRQUNBLE9BQUEsZUFBQTs7O01BR0EsTUFBQSxVQUFBLFlBQUE7UUFDQSxJQUFBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsZ0JBQUE7Ozs7TUFJQSxhQUFBLFVBQUEsWUFBQTtRQUNBLE9BQUEsSUFBQSxhQUFBLFFBQUEsUUFBQTs7O01BR0EsZUFBQSxVQUFBLFdBQUE7UUFDQSxPQUFBLElBQUEsU0FBQSxjQUFBLFlBQUE7OztNQUdBLGdCQUFBLFVBQUEsWUFBQTtRQUNBLE9BQUEsZUFBQSxJQUFBLGFBQUEsUUFBQSxRQUFBLFlBQUEsYUFBQTs7O01BR0EsZUFBQSxVQUFBLFlBQUE7OztNQUdBLFVBQUEsVUFBQSxZQUFBO1FBQ0EsT0FBQSxlQUFBLE9BQUEsWUFBQTs7OztNQUlBLFdBQUEsVUFBQSxTQUFBO1FBQ0EsSUFBQSxPQUFBLElBQUEsTUFBQSxVQUFBO1FBQ0EsT0FBQSxlQUFBOzs7O01BSUEsVUFBQSxVQUFBLFNBQUE7UUFDQSxPQUFBLGVBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7TUFJQSxZQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUE7O01BRUEsZUFBQSxVQUFBLFNBQUE7UUFDQSxPQUFBLElBQUEsTUFBQSxVQUFBOzs7TUFHQSxjQUFBLFVBQUEsU0FBQSxTQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsVUFBQTs7OztNQUlBLGlCQUFBLFVBQUEsU0FBQSxTQUFBOztRQUVBLE9BQUEsZUFBQSxJQUFBLE1BQUEsVUFBQSxjQUFBLFVBQUE7Ozs7TUFJQSxZQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUE7VUFDQSxLQUFBLElBQUEsTUFBQSxVQUFBO1VBQ0EsT0FBQSxlQUFBLElBQUEsTUFBQSxVQUFBOzs7OztNQUtBLGNBQUEsVUFBQSxTQUFBO1FBQ0EsT0FBQTtVQUNBLEtBQUEsSUFBQSxNQUFBLFVBQUE7VUFDQSxPQUFBLGVBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7O01BS0EsY0FBQSxVQUFBLFNBQUE7UUFDQSxPQUFBO1VBQ0EsS0FBQSxJQUFBLE1BQUEsVUFBQTtVQUNBLEtBQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUE7Ozs7TUFJQSxhQUFBLFVBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxNQUFBLFVBQUEsWUFBQSxNQUFBLEtBQUEsSUFBQSxTQUFBO1FBQ0EsT0FBQSxnQkFBQSxJQUFBLE1BQUEsVUFBQSxZQUFBLE1BQUE7OztNQUdBLFlBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxZQUFBLE1BQUEsS0FBQSxPQUFBLFVBQUEsT0FBQTtVQUNBLElBQUEsT0FBQTtZQUNBLFFBQUEsSUFBQSxVQUFBO2lCQUNBO1lBQ0EsUUFBQSxJQUFBOztRQUVBLE9BQUEsSUFBQSxNQUFBLFVBQUE7OztNQUdBLGVBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsS0FBQSxJQUFBLFNBQUE7UUFDQSxPQUFBLGdCQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQTs7O01BR0EsY0FBQSxVQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxLQUFBLE9BQUEsVUFBQSxPQUFBO1VBQ0EsSUFBQSxPQUFBO1lBQ0EsUUFBQSxJQUFBLFVBQUE7aUJBQ0E7WUFDQSxRQUFBLElBQUE7O1FBRUEsT0FBQSxJQUFBLE1BQUEsVUFBQTs7O01BR0EsUUFBQSxVQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxXQUFBLE1BQUEsS0FBQSxJQUFBLFNBQUE7UUFDQSxnQkFBQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsVUFBQSxVQUFBLEtBQUEsVUFBQSxNQUFBO1VBQ0EsSUFBQSxLQUFBLFVBQUEsUUFBQSxLQUFBLFVBQUEsV0FBQTtZQUNBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxTQUFBLElBQUE7aUJBQ0E7WUFDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsU0FBQSxJQUFBLEtBQUEsU0FBQTs7OztRQUlBLE9BQUEsZ0JBQUEsSUFBQSxNQUFBLFVBQUE7OztNQUdBLFVBQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsV0FBQSxNQUFBLEtBQUEsT0FBQSxVQUFBLE9BQUE7VUFDQSxJQUFBLE9BQUE7WUFDQSxRQUFBLElBQUEsVUFBQTtpQkFDQTtZQUNBLFFBQUEsSUFBQTtZQUNBLGdCQUFBLElBQUEsTUFBQSxVQUFBLGNBQUEsTUFBQSxVQUFBLFVBQUEsS0FBQSxVQUFBLE1BQUE7Y0FDQSxJQUFBLE1BQUEsVUFBQSxjQUFBLE1BQUEsU0FBQSxJQUFBLEtBQUEsU0FBQTs7O1FBR0EsT0FBQSxJQUFBLE1BQUEsVUFBQTs7O01BR0EsVUFBQSxVQUFBLFNBQUE7UUFDQSxPQUFBO1VBQ0EsS0FBQSxJQUFBLE1BQUEsU0FBQSxNQUFBO1VBQ0EsS0FBQSxnQkFBQSxJQUFBLE1BQUEsU0FBQSxNQUFBOzs7O01BSUEsWUFBQSxZQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxXQUFBLFlBQUE7OztNQUdBLGFBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxlQUFBLElBQUEsYUFBQSxRQUFBLFFBQUE7Ozs7TUFJQSxLQUFBLGVBQUE7O01BRUEsS0FBQTtNQUNBLEtBQUE7OztJQUdBLE9BQUE7Ozs7QUNoTUEsUUFBQSxPQUFBO0dBQ0EsV0FBQSx1S0FBQSxTQUFBLFFBQUEsWUFBQSxRQUFBLFNBQUE7O3NDQUVBLEtBQUEsTUFBQSxRQUFBLFNBQUEsT0FBQTs7c0NBRUEsUUFBQSxRQUFBLFVBQUE7SUFDQSxJQUFBLGNBQUE7OztJQUdBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTtJQUNBLFlBQUEsWUFBQTs7SUFFQSxZQUFBLE9BQUE7SUFDQSxZQUFBLFdBQUE7O0lBRUEsWUFBQSxXQUFBOzs7SUFHQSxZQUFBLGNBQUEsU0FBQSxJQUFBO01BQ0EsWUFBQSxPQUFBLFlBQUEsT0FBQSxVQUFBOzs7Ozs7SUFNQSxZQUFBLGVBQUEsVUFBQTtNQUNBLFlBQUEsU0FBQSxNQUFBLFNBQUEsVUFBQTtRQUNBLFlBQUEsU0FBQSxlQUFBLFNBQUEsU0FBQTtVQUNBLEdBQUEsU0FBQSxXQUFBLGFBQUE7WUFDQSxPQUFBLFdBQUE7WUFDQSxZQUFBLFNBQUEsSUFBQSxPQUFBLFNBQUEsVUFBQTtjQUNBLFFBQUEsSUFBQTs7aUJBRUE7Y0FDQSxRQUFBLElBQUE7Ozs7Ozs7O0lBUUEsWUFBQSxrQkFBQSxZQUFBOzs7SUFHQSxZQUFBLGNBQUEsU0FBQSxJQUFBO01BQ0EsT0FBQSxZQUFBLE9BQUEsVUFBQTs7Ozs7SUFLQSxZQUFBLGtCQUFBO0lBQ0EsWUFBQSxrQkFBQTtJQUNBLFlBQUEsa0JBQUE7SUFDQSxZQUFBLGtCQUFBOzs7Ozs7SUFNQSxZQUFBLG9CQUFBLFNBQUEsSUFBQTtNQUNBLFlBQUEsYUFBQSxZQUFBLEtBQUEsV0FBQTs7O0lBR0EsR0FBQSxLQUFBLElBQUEsVUFBQTtNQUNBLFlBQUEsa0JBQUEsS0FBQSxJQUFBLFVBQUE7OztJQUdBLFlBQUEsYUFBQSxTQUFBLE1BQUEsVUFBQTtNQUNBLFlBQUEsYUFBQSxVQUFBO01BQ0EsWUFBQSxLQUFBLFNBQUEsVUFBQTtTQUNBLE1BQUEsS0FBQSxJQUFBLFVBQUEsS0FBQSxPQUFBLElBQUEsU0FBQTs7Ozs7Ozs7SUFRQSxZQUFBLGFBQUEsU0FBQSxPQUFBO01BQ0EsUUFBQSxRQUFBLE9BQUEsVUFBQSxVQUFBLEdBQUE7UUFDQSxJQUFBLGFBQUEsSUFBQTtRQUNBLFdBQUEsU0FBQSxVQUFBLE9BQUE7VUFDQSxJQUFBLE1BQUEsTUFBQSxPQUFBO1VBQ0EsWUFBQSxhQUFBLEtBQUE7VUFDQSxZQUFBLE1BQUEsV0FBQSxLQUFBLElBQUEsVUFBQSxLQUFBLE9BQUEsQ0FBQSxTQUFBO1VBQ0EsT0FBQSxDQUFBLFFBQUEsUUFBQSxTQUFBLFNBQUEsVUFBQTs7UUFFQSxXQUFBLGNBQUEsU0FBQTs7Ozs7OztJQU9BLFlBQUEsY0FBQSxTQUFBLFNBQUE7TUFDQSxZQUFBLFFBQUEsVUFBQSxTQUFBOzs7TUFHQSxHQUFBLFlBQUEsYUFBQSxPQUFBO1FBQ0EsaUJBQUE7VUFDQSxVQUFBLFlBQUEsU0FBQSxRQUFBO1VBQ0EsTUFBQSxZQUFBLFNBQUEsUUFBQTtVQUNBLFNBQUEsWUFBQSxTQUFBLFFBQUE7VUFDQSxLQUFBLFlBQUEsU0FBQSxRQUFBLFNBQUEsU0FBQTtVQUNBLEtBQUEsWUFBQSxTQUFBLFFBQUEsU0FBQSxTQUFBOzs7UUFHQSxZQUFBLFFBQUEsZUFBQTs7O01BR0EsWUFBQSxRQUFBLFFBQUEsS0FBQSxXQUFBO1FBQ0EsT0FBQSxDQUFBLFFBQUEsUUFBQSxTQUFBLFNBQUEsVUFBQTtRQUNBLEdBQUEsYUFBQSxVQUFBO1VBQ0EsT0FBQSxHQUFBOztTQUVBLE1BQUEsU0FBQSxPQUFBO1FBQ0EsT0FBQSxDQUFBLFFBQUEsb0JBQUEsU0FBQSxTQUFBLFVBQUE7Ozs7OztJQU1BLFlBQUEsYUFBQSxVQUFBOztNQUVBLFlBQUEsTUFBQSxXQUFBLEtBQUEsSUFBQSxVQUFBLEtBQUE7UUFDQTtVQUNBLGNBQUEsWUFBQSxRQUFBO1VBQ0EsY0FBQSxZQUFBLFFBQUE7Ozs7TUFJQSxZQUFBLE1BQUEsV0FBQSxLQUFBLElBQUEsVUFBQSxJQUFBLFFBQUEsT0FBQSxJQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUEsWUFBQSxnQkFBQSxZQUFBLE1BQUEsWUFBQSxnQkFBQTtRQUNBLFVBQUEsU0FBQTs7O01BR0EsT0FBQSxDQUFBLFFBQUEsUUFBQSxTQUFBLFNBQUEsVUFBQTs7Ozs7SUFLQSxZQUFBLFlBQUEsVUFBQTtNQUNBLFlBQUEsTUFBQSxXQUFBLEtBQUEsSUFBQSxVQUFBLEtBQUEsT0FBQSxDQUFBLGFBQUEsWUFBQSxRQUFBOztNQUVBLE9BQUEsQ0FBQSxRQUFBLFFBQUEsU0FBQSxTQUFBLFVBQUE7Ozs7SUFJQSxZQUFBLGdCQUFBLFVBQUE7O01BRUEsWUFBQSxRQUFBLFFBQUEsS0FBQSxVQUFBO1FBQ0EsT0FBQSxHQUFBOzs7Ozs7SUFNQSxZQUFBLGdCQUFBLFVBQUE7O01BRUEsWUFBQSxNQUFBLG1CQUFBLFlBQUEsUUFBQSxhQUFBLEtBQUEsU0FBQSxTQUFBLFVBQUE7UUFDQSxHQUFBLFNBQUEsVUFBQSxLQUFBO1VBQ0EsT0FBQSxZQUFBLFVBQUE7Y0FDQTtVQUNBLE9BQUEsWUFBQSxVQUFBOzs7Ozs7O0FDNUtBLFFBQUEsT0FBQTtHQUNBLFFBQUEsdUVBQUEsVUFBQSxnQkFBQSxpQkFBQSxhQUFBLE9BQUE7SUFDQSxJQUFBLFdBQUEsSUFBQSxTQUFBLGNBQUE7SUFDQSxJQUFBLFFBQUEsZUFBQTs7SUFFQSxJQUFBLFFBQUE7TUFDQSxlQUFBLFlBQUE7UUFDQSxPQUFBLE1BQUE7VUFDQSxLQUFBO1VBQ0EsUUFBQTs7OztNQUlBLG1CQUFBLFlBQUE7UUFDQSxPQUFBLE1BQUE7VUFDQSxLQUFBO1VBQ0EsUUFBQTtXQUNBLEtBQUEsVUFBQSxNQUFBO1VBQ0EsT0FBQSxLQUFBOzs7O01BSUEsU0FBQSxTQUFBLElBQUE7UUFDQSxPQUFBLE1BQUEsV0FBQTs7Ozs7TUFLQSxxQkFBQSxTQUFBLFNBQUE7UUFDQSxPQUFBLGVBQUEsU0FBQSxhQUFBLGVBQUEsUUFBQTs7OztNQUlBLG1CQUFBLFNBQUEsU0FBQTtRQUNBLE9BQUEsU0FBQSxhQUFBLGVBQUEsUUFBQTs7OztNQUlBLFlBQUEsVUFBQSxLQUFBO1FBQ0EsT0FBQSxnQkFBQSxTQUFBLE1BQUE7OztNQUdBLGdCQUFBLFVBQUEsS0FBQTtRQUNBLElBQUEsUUFBQSxRQUFBLFFBQUEsSUFBQTtVQUNBLE9BQUEsTUFBQSxXQUFBLEtBQUE7Ozs7O01BS0EsWUFBQSxTQUFBLElBQUE7UUFDQSxPQUFBLFNBQUEsTUFBQSxJQUFBOzs7O01BSUEsWUFBQSxTQUFBLElBQUEsVUFBQTs7UUFFQSxJQUFBLE9BQUE7UUFDQSxJQUFBLFNBQUEsSUFBQSxTQUFBLFlBQUEsU0FBQSxJQUFBLHVCQUFBO1FBQ0EsSUFBQSxLQUFBLFNBQUEsU0FBQSxVQUFBO1VBQ0EsU0FBQSxTQUFBOztRQUVBLE9BQUE7Ozs7TUFJQSxtQkFBQSxTQUFBLE1BQUEsUUFBQSxRQUFBOztRQUVBLElBQUEsTUFBQSxJQUFBLFNBQUE7UUFDQSxJQUFBLGVBQUE7VUFDQSxPQUFBO1VBQ0EsYUFBQTtVQUNBLGFBQUE7V0FDQSxTQUFBLE9BQUE7VUFDQSxJQUFBLE9BQUE7WUFDQSxRQUFBLE1BQUE7Y0FDQSxLQUFBO2dCQUNBLFFBQUEsSUFBQTtnQkFDQTtjQUNBLEtBQUE7Z0JBQ0EsUUFBQSxJQUFBO2dCQUNBO2NBQ0E7Z0JBQ0EsUUFBQSxJQUFBLDRCQUFBOztpQkFFQTtZQUNBLFFBQUEsSUFBQTs7Ozs7TUFLQSxTQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsU0FBQSxNQUFBOzs7TUFHQSxTQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsU0FBQSxNQUFBLEtBQUEsTUFBQTs7O01BR0EsV0FBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLFNBQUEsTUFBQSxLQUFBLE1BQUE7Ozs7TUFJQSxXQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsU0FBQSxNQUFBLEtBQUEsTUFBQTs7O01BR0EsWUFBQSxVQUFBLEtBQUE7UUFDQSxPQUFBLFNBQUEsTUFBQTs7O01BR0EsS0FBQTs7O0lBR0EsT0FBQTs7O0FDbEhBLFFBQUEsT0FBQTtHQUNBLFFBQUEscUJBQUEsVUFBQTs7Ozs7Ozs7Ozs7S0FXQSxPQUFBOztRQUVBLGVBQUEsVUFBQTs7WUFFQSxJQUFBLGFBQUE7OztZQUdBLElBQUEsZUFBQTs7Ozs7O1lBTUEsSUFBQSxnQkFBQTs7O2NBR0EsSUFBQSxNQUFBLElBQUEsT0FBQTtjQUNBLElBQUEsaUJBQUEsUUFBQTtjQUNBLGVBQUE7O2NBRUEsSUFBQSxpQkFBQSxJQUFBLE1BQUE7Y0FDQSxLQUFBLElBQUEsSUFBQSxHQUFBLEtBQUEsR0FBQSxLQUFBO2dCQUNBLGVBQUEsS0FBQSxXQUFBLE9BQUEsTUFBQTs7Z0JBRUEsTUFBQSxLQUFBLE1BQUEsTUFBQTs7Y0FFQSxJQUFBLFFBQUEsR0FBQSxNQUFBLElBQUEsTUFBQTs7Y0FFQSxJQUFBLEtBQUEsZUFBQSxLQUFBOztjQUVBLElBQUEsQ0FBQSxlQUFBO2dCQUNBLEtBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxLQUFBO2tCQUNBLGNBQUEsS0FBQSxLQUFBLE1BQUEsS0FBQSxXQUFBOztxQkFFQTs7Z0JBRUEsS0FBQSxJQUFBLElBQUEsS0FBQSxLQUFBLGNBQUEsT0FBQSxJQUFBLEtBQUE7a0JBQ0EsY0FBQSxLQUFBOztnQkFFQSxjQUFBOztjQUVBLEtBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxLQUFBO2dCQUNBLE1BQUEsV0FBQSxPQUFBLGNBQUE7O2NBRUEsR0FBQSxHQUFBLFVBQUEsSUFBQSxNQUFBLElBQUEsTUFBQTs7Y0FFQSxPQUFBOzs7O0lBSUEiLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWFpbiBtb2R1bGUgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICovXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ0FwcCcsIFtcbiAgICAnZmlyZWJhc2UnLFxuICAgICdhbmd1bGFyLW1kNScsIC8vIEVuY3J5cHQgZW1haWxcbiAgICAndWkucm91dGVyJyxcbiAgICAnbmdNYXRlcmlhbCcsIC8vIEludGVyZmFjZVxuICAgICdhbmd1bGFyTW9tZW50JywgLy8gVGltZSBtYW5hZ2VtZW50XG4gICAgJ2Zsb3cnLCAvLyBJbWFnZSB1cGxvYWRcbiAgICAnc2x1Z2lmaWVyJywgLy8gQ3JlYXRlIFNsdWdzXG4gICAgJ25nQXV0b2NvbXBsZXRlJywgLy8gR29vZ2xlIHBsYWNlc1xuICAgICduZ1RhZ3NJbnB1dCcsIC8vIFRhZ3NcbiAgICAnY2dOb3RpZnknLCAvLyBOb3RpZmljYXRpb24gLSBodHRwczovL2dpdGh1Yi5jb20vY2dyb3NzL2FuZ3VsYXItbm90aWZ5XG4gICAgJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnLCAvLyBUcmFuc2xhdGlvbiAtIGh0dHBzOi8vYW5ndWxhci10cmFuc2xhdGUuZ2l0aHViLmlvL1xuICAgICdmYWNlYm9vaycsICAgICAgIC8vICBGYWNlYm9vayAtIGh0dHBzOi8vZ2l0aHViLmNvbS9DaXVsL2FuZ3VsYXItZmFjZWJvb2tcbiAgICAnYW5ndWxhci1mbGV4c2xpZGVyJywgLy8gSW1hZ2Ugc2xpZGVyIC0gaHR0cHM6Ly9naXRodWIuY29tL3RoZW5pa3NvL2FuZ3VsYXItZmxleHNsaWRlclxuXG4gICAgLy8gRW1vdGljb24gLS0gaHR0cDovL21pc3RpYzEwMC5naXRodWIuaW8vYW5ndWxhci1zbWlsaWVzL1xuICAgICduZ1Nhbml0aXplJyxcbiAgICAndWkuYm9vdHN0cmFwJywgICAvLyAgT1IgbWdjcmVhLm5nU3RyYXBcbiAgICAnYW5ndWxhci1zbWlsaWVzJyxcblxuICAgICduZ0Nvb2tpZXMnLCAgICAgIC8vICBjb29raWVzIHN0dWZmXG4gICAgJ25vdGlmaWNhdGlvbicsICAgLy8gIHdlYiBub3RpZmljYXRpb24gLSBodHRwczovL2dpdGh1Yi5jb20vbmVvemlyby9hbmd1bGFyLW5vdGlmaWNhdGlvblxuXG4gIF0pXG5cbiAgLmNvbmZpZyhmdW5jdGlvbiAoJG1kVGhlbWluZ1Byb3ZpZGVyKSB7XG4gICAgJG1kVGhlbWluZ1Byb3ZpZGVyLmRlZmluZVBhbGV0dGUoJ3NsYWNrJywge1xuICAgICAgJzUwJzogJ2ZmZWJlZScsXG4gICAgICAnMTAwJzogJ2ZmY2RkMicsXG4gICAgICAnMjAwJzogJ2VmOWE5YScsXG4gICAgICAnMzAwJzogJ2U1NzM3MycsXG4gICAgICAnNDAwJzogJ2VmNTM1MCcsXG4gICAgICAnNTAwJzogJzREMzk0QicsIC8vIHByaW1hcnkgY29sb3VyXG4gICAgICAnNjAwJzogJ2U1MzkzNScsXG4gICAgICAnNzAwJzogJ2QzMmYyZicsXG4gICAgICAnODAwJzogJ2M2MjgyOCcsXG4gICAgICAnOTAwJzogJ2I3MWMxYycsXG4gICAgICAnQTEwMCc6ICdmZjhhODAnLFxuICAgICAgJ0EyMDAnOiAnZmY1MjUyJyxcbiAgICAgICdBNDAwJzogJ2ZmMTc0NCcsXG4gICAgICAnQTcwMCc6ICdkNTAwMDAnLFxuICAgICAgJ2NvbnRyYXN0RGVmYXVsdENvbG9yJzogJ2xpZ2h0JywgLy8gd2hldGhlciwgYnkgZGVmYXVsdCwgdGV4dCAoY29udHJhc3QpXG4gICAgICAvLyBvbiB0aGlzIHBhbGV0dGUgc2hvdWxkIGJlIGRhcmsgb3IgbGlnaHRcbiAgICAgICdjb250cmFzdERhcmtDb2xvcnMnOiBbJzUwJywgJzEwMCcsIC8vIGh1ZXMgd2hpY2ggY29udHJhc3Qgc2hvdWxkIGJlICdkYXJrJyBieSBkZWZhdWx0XG4gICAgICAgICcyMDAnLCAnMzAwJywgJzQwMCcsICdBMTAwJ10sXG4gICAgICAnY29udHJhc3RMaWdodENvbG9ycyc6IHVuZGVmaW5lZCAvLyBjb3VsZCBhbHNvIHNwZWNpZnkgdGhpcyBpZiBkZWZhdWx0IHdhcyAnZGFyaydcbiAgICB9KVxuICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGVmYXVsdCcpXG4gICAgICAucHJpbWFyeVBhbGV0dGUoJ3NsYWNrJylcbiAgfSlcblxuICAvLyBGYWNlYm9vayBDb25maWdcbiAgLmNvbmZpZyhcbiAgICBmdW5jdGlvbiAoRmFjZWJvb2tQcm92aWRlcikge1xuICAgICAgdmFyIG15QXBwSWQgPSAnOTMxMzc2MTIwMjYzODU2J1xuICAgICAgRmFjZWJvb2tQcm92aWRlci5zZXRBcHBJZChteUFwcElkKVxuICAgICAgRmFjZWJvb2tQcm92aWRlci5pbml0KG15QXBwSWQpXG4gICAgfVxuICApXG5cbiAgLy9TZWN1cml0eSBmb3IgVHJhbnNsYXRlXG4gIC5jb25maWcoZnVuY3Rpb24gKCR0cmFuc2xhdGVQcm92aWRlcikge1xuICAgICR0cmFuc2xhdGVQcm92aWRlci5wcmVmZXJyZWRMYW5ndWFnZSgnRW5nJyk7XG4gICAgLy8gRW5hYmxlIGVzY2FwaW5nIG9mIEhUTUxcbiAgICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5KCdlc2NhcGUnKTtcbiAgfSlcblxuXG5cbiAgLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnSG9tZUN0cmwgYXMgIGhvbWVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnaG9tZS9ob21lLmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICByZXF1aXJlTm9BdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBBdXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGguYXV0aC4kcmVxdWlyZUF1dGgoKS50aGVuKGZ1bmN0aW9uIChhdXRoKSB7XG4gICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2Rhc2hib2FyZCcpXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmZWVkOiBmdW5jdGlvbiAoVG9waWNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5sYXRlc3RGZWVkKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2xvZ2luLWZvcm1AaG9tZSc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9odG1sL2xvZ2luLWZvcm0uaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgICdoZWFkZXJAaG9tZSc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90b29sYmFyL21haW5fdG9vbGJhci5odG1sJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuXG4gICAgICAvL1RyZW5kaW5nXG4gICAgICAuc3RhdGUoJ3RyZW5kaW5nJywge1xuICAgICAgICB1cmw6ICcvZXhwbG9yZS90cmVuZGluZycsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ3RybCBhcyAgaG9tZUN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdob21lL3RyZW5kLmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICBmZWVkOiBmdW5jdGlvbiAoVG9waWNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5sYXRlc3RGZWVkKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2hlYWRlckB0cmVuZGluZyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90b29sYmFyL21haW5fdG9vbGJhci5odG1sJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuXG4gICAgICAvLyBDYXRlZ29yeSBMYW5kaW5nXG4gICAgICAuc3RhdGUoJ2NhdGVnb3J5Jywge1xuICAgICAgICB1cmw6ICcvY2F0ZWdvcnkve1NsdWd9JyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NhdGVDdHJsIGFzIGNhdGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnY2F0ZWdvcnkvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIC8vIEdldHRpbmcgQ2F0ZWdvcnkgZGV0YWlsc1xuICAgICAgICAgICAgICBjYXRlTmFtZTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgQ2F0ZWdvcnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQ2F0ZWdvcnkuZ2V0TmFtZSgkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIC8vIEdldHRpbmcgbGlzdCBvZiBjYXRlZ29yeSB0b3BpY3MgaGVyZVxuICAgICAgICAgICAgICBjYXRlVG9waWNzOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmxpc3QoJHN0YXRlUGFyYW1zLlNsdWcpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICdoZWFkZXJAY2F0ZWdvcnknOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cblxuICAgICAgLy8gUGxhY2VzIGxhbmRpbmcgcGFnZVxuICAgICAgLnN0YXRlKCdwbGFjZXMnLCB7XG4gICAgICAgIHVybDogJy9wbGFjZXMve3BsYWNlX3NsdWd9L3twbGFjZV9pZH0nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICdoZWFkZXJAcGxhY2VzJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1BsYWNlc0N0cmwgYXMgcGxhY2VzQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BsYWNlL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICBwbGFjZUxhbmRpbmc6IGZ1bmN0aW9uIChQbGFjZXMsIFRvcGljcywgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VBcnJheSkge1xuICAgICAgICAgICAgICAgIHZhciBkYXRhXG4gICAgICAgICAgICAgICAgUGxhY2VzLmdldFBsYWNlUmVmKCRzdGF0ZVBhcmFtcy5wbGFjZV9pZCkub24oJ3ZhbHVlJywgZnVuY3Rpb24gKHNuYXBzaG90KSB7XG4gICAgICAgICAgICAgICAgICBkYXRhID0gc25hcHNob3QudmFsKClcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNuYXBzaG90LnZhbCgpKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgICAgICAgICAgLy8gcmV0dXJuICAkZmlyZWJhc2VBcnJheShQbGFjZXMuZ2V0UGxhY2VSZWYoJHN0YXRlUGFyYW1zLnBsYWNlX2lkKSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuXG4gICAgICAvLyBUYWcgbGFuZGluZyBwYWdlXG4gICAgICAuc3RhdGUoJ3RhZycsIHtcbiAgICAgICAgdXJsOiAnL3RhZy97VGFnfScsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ2hlYWRlckB0YWcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnVGFnQ3RybCBhcyB0YWdDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGFnL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICB0YWdOYW1lOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzdGF0ZVBhcmFtcy5UYWdcbiAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICB0YWdMYW5kaW5nOiBmdW5jdGlvbiAoVG9waWNzLCAkc3RhdGVQYXJhbXMsIFRhZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFnID0gJHN0YXRlUGFyYW1zLlRhZ1xuICAgICAgICAgICAgICAgIC8vIHZhciBmYiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybClcbiAgICAgICAgICAgICAgICAvLyB2YXIgZGF0YVJldCA9ICcnXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHNob3coVGFncy50b3BpY1RhZ3ModGFnKSlcbiAgICAgICAgICAgICAgICAvKnJldHVybiBmYi5jaGlsZCgndGFncy8nICsgdGFnKVxuICAgICAgICAgICAgICAgICAgICAub24oJ3ZhbHVlJywgZnVuY3Rpb24gKHRhZ1NuYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmIuY2hpbGQoJ3RvcGljcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAub3JkZXJCeUNoaWxkKFwidGFnc1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmVxdWFsVG8odGFnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCd2YWx1ZScsIGZ1bmN0aW9uICh0b3BpY1NuYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNob3coIGV4dGVuZCh7fSwgdGFnU25hcC52YWwoKSwgdG9waWNTbmFwLnZhbCgpKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8hKmRhdGFSZXQgPSBleHRlbmQoe30sIHRhZ1NuYXAudmFsKCksIHRvcGljU25hcC52YWwoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJGZpcmViYXNlQXJyYXkoZGF0YVJldCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhUmV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAqIS9cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pKi9cbiAgICAgICAgICAgICAgICAvLyB2YXIgdGFnT2JqID0gVGFncy5nZXRUYWdPYmplY3QodGFnKVxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0YWdPYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vICAgcmV0dXJuIFRvcGljcy50b3BpY3NCeVRhZyh0YWcpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24gKHNuYXApIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coZXh0ZW5kKHt9LCB0YWdPYmouJHZhbHVlLCBzbmFwLnZhbCgpKSlcbiAgICAgICAgICAgICAgICAvLyAgICAgcmV0dXJuIGV4dGVuZCh7fSwgdGFnT2JqLiR2YWx1ZSwgc25hcC52YWwoKSlcbiAgICAgICAgICAgICAgICAvLyAgIH0pXG4gICAgICAgICAgICAgICAgLy8gfSlcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgZmIub25jZSgndmFsdWUnLCBmdW5jdGlvbihzbmFwc2hvdCkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGRhdGEgPSBzbmFwc2hvdC52YWwoKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGRhdGFTbmFwKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdmFyIGluZGV4ID0gd29yZC5pbmRleE9mKCcgJylcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgZmlyc3QgPSBkYXRhU25hcC5OYW1lLnN1YnN0cmluZygwLCBpbmRleClcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgbGFzdCA9IHdvcmQuc3Vic3RyaW5nKGluZGV4ICsgMSlcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgY2FuZGlkYXRlID0gZGF0YVNuYXAuTmFtZVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIGlmIChjYW5kaWRhdGUuaW5kZXhPZihmaXJzdCkgPj0gMCAmJiBjYW5kaWRhdGUuaW5kZXhPZihsYXN0KSA+PSAwKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhU25hcC5DSUQpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgcmVqZWN0KCdTb21lIHNvcnQgb2YgZmFpbHVyZScpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgICAgIC8vIH0pXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLnRvcGljc0J5VGFnKHRhZylcbiAgICAgICAgICAgICAgLy8gLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcCl7XG4gICAgICAgICAgICAgIC8vIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cblxuICAgICAgLy8gVG9waWMgbGFuZGluZyBwYWdlXG4gICAgICAuc3RhdGUoJ3RvcGljJywge1xuICAgICAgICB1cmw6ICcve1NsdWd9JyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIC8qU2x1ZzogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywkc3RhdGUsQXV0aCkge1xuICAgICAgICAgICAgJHN0YXRlUGFyYW1zLlNsdWcgPSBkZWNvZGVVUklDb21wb25lbnQoJHN0YXRlUGFyYW1zLlNsdWcpXG4gICAgICAgICAgICBpZigkc3RhdGVQYXJhbXMuU2x1ZyA9PSAnJyl7XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSovXG4gICAgICAgIH0sXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdUb3BpY0xhbmRpbmdDdHJsIGFzIHRvcGljTGFuZGluZ0N0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0b3BpY3MvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uIChBdXRoLCBVc2VycywgJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9waWNVaWQgPSAnJ1xuICAgICAgICAgICAgICAgIC8vIElmIHVzZXIgbG9naW4sIGNoZWNrIGlmIHRoZXkgYXJlIHRoZSB0b3BpYyBvd25lclxuICAgICAgICAgICAgICAgIGlmIChBdXRoLnJlZi5nZXRBdXRoKCkpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZm9ydG9waWMoJHN0YXRlUGFyYW1zLlNsdWcpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhWzBdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICB0b3BpY1VpZCA9IGRhdGFbMF0udWlkXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKEF1dGgucmVmLmdldEF1dGgoKS51aWQgPT0gdG9waWNVaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0b3BpY0xhbmRpbmc6IGZ1bmN0aW9uICgkc3RhdGVQYXJhbXMsIFRvcGljcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZm9ydG9waWMoJHN0YXRlUGFyYW1zLlNsdWcpLiRsb2FkZWQoKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVwbHlMaXN0OiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MsICRzdGF0ZSkge1xuICAgICAgICAgICAgICAgIHZhciB0b3BpY0tleSA9ICcnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5mb3J0b3BpYygkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkYXRhWzBdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9waWNLZXkgPSBkYXRhWzBdLiRpZFxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCd0b3BpYy1ub3Rmb3VuZCcpXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLnJlcGx5TGlzdCh0b3BpY0tleSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB2aWV3RGF0YTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgVG9waWNzLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHZhciB0b3BpY0tleSwgdmlld3NcbiAgICAgICAgICAgICAgICB2YXIgdGltZSA9IG1vbWVudCgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICB2YXIgaGlzdG9yeU9iaiA9IHsndXNlcklQJzogJycsICdjcmVhdGVkJzogdGltZX1cbiAgICAgICAgICAgICAgICBVc2Vycy5nZXRMb2NhdGlvbklQKCkuc3VjY2VzcyhmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgaGlzdG9yeU9iai51c2VySVAgPSBkYXRhLmRhdGFcbiAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICBoaXN0b3J5T2JqLnVzZXJJUCA9IGRhdGEuZGF0YVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5nZXRUb3BpY0J5U2x1Zygkc3RhdGVQYXJhbXMuU2x1ZykuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChkYXRhWzBdLiRpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9waWNLZXkgPSBkYXRhWzBdLiRpZFxuICAgICAgICAgICAgICAgICAgICB2aWV3cyA9IFRvcGljcy5nZXRWaWV3cyh0b3BpY0tleSlcblxuICAgICAgICAgICAgICAgICAgICB2aWV3cy5vYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb3VudCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3cy5yZWYuY2hpbGQoJ2NvdW50Jykuc2V0KDEpXG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdzLnJlZi5jaGlsZCgnY291bnQnKS5zZXQoZGF0YS5jb3VudCArIDEpXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkudGhlbihmdW5jdGlvbiAoYXV0aCkge1xuICAgICAgICAgICAgICAgICAgICAgIHZhciB1aWQgPSBhdXRoLnVpZFxuICAgICAgICAgICAgICAgICAgICAgIHZpZXdzLnJlZi5jaGlsZCgnaGlzdG9yeScpLmNoaWxkKHVpZCkucHVzaCgpLnNldChoaXN0b3J5T2JqKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCd2aWV3cycpLmNoaWxkKHRvcGljS2V5KS5wdXNoKCkuc2V0KGhpc3RvcnlPYmopXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdmlld3Mub2JqXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZm9sbG93ZXJzOiBmdW5jdGlvbiAoJHN0YXRlUGFyYW1zLCBUb3BpY3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVG9waWNzLmdldFRvcGljQnlTbHVnKCRzdGF0ZVBhcmFtcy5TbHVnKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgdmFyIHRvcGljS2V5ID0gZGF0YVswXS4kaWRcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUb3BpY3MuZ2V0Rm9sbG93ZXJzKHRvcGljS2V5KS5vYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnaGVhZGVyQHRvcGljJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBUb3BpYyBub3QgZm91bmRcbiAgICAgIC5zdGF0ZSgndG9waWMtbm90Zm91bmQnLCB7XG4gICAgICAgIHVybDogJy9lcnIvbm90Zm91bmQnXG4gICAgICB9KVxuXG4gICAgICAvLyBQcm9maWxlIGxhbmRpbmcgcGFnZVxuICAgICAgLnN0YXRlKCdwcm9maWxlJywge1xuICAgICAgICB1cmw6ICcvcHJvZmlsZS97TmFtZX0nLFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnUHJvZmlsZUN0cmwgYXMgcHJvZmlsZUN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICBpc093bmVyOiBmdW5jdGlvbiAoQXV0aCwgVXNlcnMsICRzdGF0ZVBhcmFtcykge1xuICAgICAgICAgICAgICAgIGlmIChBdXRoLnJlZi5nZXRBdXRoKCkpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlQnlVc2VybmFtZSgkc3RhdGVQYXJhbXMuTmFtZSkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHByb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2ZpbGVbMF0uJGlkID09IEF1dGgucmVmLmdldEF1dGgoKS51aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHVzZXJQb3N0czogZnVuY3Rpb24gKFVzZXJzLCBUb3BpY3MsICRzdGF0ZVBhcmFtcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlQnlVc2VybmFtZSgkc3RhdGVQYXJhbXMuTmFtZSkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHByb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChwcm9maWxlWzBdLiRpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRvcGljcy5jcmVhdGVkQnkocHJvZmlsZVswXS4kaWQpXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcHJvZmlsZTogZnVuY3Rpb24gKCRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkcm9vdFNjb3BlLCBBdXRoLCBVc2Vycykge1xuICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlQnlVc2VybmFtZSgkc3RhdGVQYXJhbXMuTmFtZSkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHByb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9maWxlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2hlYWRlckBwcm9maWxlJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIFByb2ZpbGUgbGFuZGluZyBwYWdlXG4gICAgICAvLyBAcHJvZmlsZUN0cmxcbiAgICAgIC5zdGF0ZSgnYWNjY291bnRFZGl0Jywge1xuICAgICAgICB1cmw6ICcvYWNjb3VudC9lZGl0JyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAncGFzc3dvcmRFZGl0QGFjY2NvdW50RWRpdCc6IHtcbiAgICAgICAgICAgIHVybDogJy9hY2NvdW50L2NoYW5nZVBhc3N3b3JkJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZmlsZS9wYXNzd2QuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgICd1c2VyRWRpdEBhY2Njb3VudEVkaXQnOiB7XG4gICAgICAgICAgICB1cmw6ICcvYWNjb3VudC9lZGl0LWZvcm0nLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlL2VkaXQtZm9ybS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ3RybCBhcyBwcm9maWxlQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGUvZWRpdC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgdXNlclBvc3RzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9maWxlOiBmdW5jdGlvbiAoJHN0YXRlLCAkcm9vdFNjb3BlLCBBdXRoLCBVc2Vycykge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkudGhlbihmdW5jdGlvbiAoYXV0aCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFVzZXJzLmdldFByb2ZpbGUoYXV0aC51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9maWxlLmRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb2ZpbGVcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2dldF9zdGFydGVkJylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgYXV0aDogZnVuY3Rpb24gKCRzdGF0ZSwgVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2hlYWRlckBhY2Njb3VudEVkaXQnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLnN0YXRlKCdhY2NvdW50UGFzc3dvcmQnLCB7XG4gICAgICAgIHVybDogJy9hY2NvdW50L2NoYW5nZVBhc3N3b3JkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlL3Bhc3N3ZC5odG1sJ1xuICAgICAgfSlcblxuICAgICAgLnN0YXRlKCdhY2NvdW50VXNlckVkaXQnLCB7XG4gICAgICAgIHVybDogJy9hY2NvdW50L2VkaXQtZm9ybScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZmlsZS9lZGl0LWZvcm0uaHRtbCdcbiAgICAgIH0pXG5cbiAgICAgIC8vIERhc2hib2FyZFxuICAgICAgLy8gQHByb2ZpbGVDdHJsXG4gICAgICAuc3RhdGUoJ2Rhc2hib2FyZCcsIHtcbiAgICAgICAgdXJsOiAnL3VzZXIvZGFzaGJvYXJkJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwgYXMgZGFzaGJvYXJkQ3RybCcsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ3RybCBhcyBwcm9maWxlQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rhc2hib2FyZC9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgdXNlclBvc3RzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9maWxlOiBmdW5jdGlvbiAoJHN0YXRlLCAkcm9vdFNjb3BlLCBBdXRoLCBVc2Vycykge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkudGhlbihmdW5jdGlvbiAoYXV0aCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFVzZXJzLmdldFByb2ZpbGUoYXV0aC51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIG5vIHN0YXQgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGlmICghcHJvZmlsZS5zdGF0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgVXNlcnMudXNlclJlZihhdXRoLnVpZCkuY2hpbGQoJ3N0YXQvdXB2b3RlZC9jb3VudCcpLnNldCgwKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCdzdGF0L3Bvc3RlZC9jb3VudCcpLnNldCgwKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCdzdGF0L2NvbW1lbnQvY291bnQnKS5zZXQoMClcbiAgICAgICAgICAgICAgICAgICAgICBVc2Vycy51c2VyUmVmKGF1dGgudWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dlci9jb3VudCcpLnNldCgwKVxuICAgICAgICAgICAgICAgICAgICAgIFVzZXJzLnVzZXJSZWYoYXV0aC51aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2luZy9jb3VudCcpLnNldCgwKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgbm8gZGlzcGxheW5hbWUgLSBnbyB0byBnZXRfc3RhcnRlZFxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvZmlsZS5kaXNwbGF5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9maWxlXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdnZXRfc3RhcnRlZCcpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgYXV0aDogZnVuY3Rpb24gKCRzdGF0ZSwgVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2hlYWRlckBkYXNoYm9hcmQnOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIEZvbGxsb3cgQ2F0ZWdvcnlcbiAgICAgIC8vIEBwcm9maWxlQ3RybFxuICAgICAgLnN0YXRlKCdmb2xsb3dfY2F0ZXMnLCB7XG4gICAgICAgIHVybDogJy91c2VyL2ZvbGxvdy1jYXRlZ29yaWVzJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXV0aC9mb2xsb3ctY2F0ZWdvcmllcy5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgdXNlclBvc3RzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9maWxlOiBmdW5jdGlvbiAoVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlKGF1dGgudWlkKS4kbG9hZGVkKClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBhdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnaGVhZGVyQGZvbGxvd19jYXRlcyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90b29sYmFyL21haW5fdG9vbGJhci5odG1sJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gR2V0dGluZyBzdGFydGVkXG4gICAgICAvLyBAcHJvZmlsZUN0cmxcbiAgICAgIC5zdGF0ZSgnZ2V0X3N0YXJ0ZWQnLCB7XG4gICAgICAgIHVybDogJy91c2VyL2dldF9zdGFydGVkJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAnJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIHByb2ZpbGVDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXV0aC9nZXRfc3RhcnRlZC5odG1sJyxcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgdXNlclBvc3RzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGlzT3duZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwcm9maWxlOiBmdW5jdGlvbiAoVXNlcnMsIEF1dGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBVc2Vycy5nZXRQcm9maWxlKGF1dGgudWlkKS4kbG9hZGVkKClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBhdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBVc2VycywgQXV0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoLmF1dGguJHJlcXVpcmVBdXRoKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnaGVhZGVyQGdldF9zdGFydGVkJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvdXNlci9sb2dpbicsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXV0aC9sb2dpbi5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2xvZ2luLWZvcm1AbG9naW4nOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC9sb2dpbi1mb3JtLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnaGVhZGVyQGxvZ2luJzoge1xuICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsIGFzIGF1dGhDdHJsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Rvb2xiYXIvbWFpbl90b29sYmFyLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgICB1cmw6ICcvdXNlci9yZWdpc3RlcicsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJyc6IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCBhcyBhdXRoQ3RybCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2F1dGgvcmVnaXN0ZXIuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgICdoZWFkZXJAcmVnaXN0ZXInOiB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdG9vbGJhci9tYWluX3Rvb2xiYXIuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICByZXF1aXJlTm9BdXRoOiBmdW5jdGlvbiAoJHN0YXRlLCBBdXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gQXV0aC5hdXRoLiRyZXF1aXJlQXV0aCgpLnRoZW4oZnVuY3Rpb24gKGF1dGgpIHtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICByZXR1cm4gZXJyb3JcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpXG4gIH0pXG5cbiAgLmZpbHRlcignb3JkZXJPYmplY3RCeScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGl0ZW1zLCBmaWVsZCwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGZpbHRlcmVkID0gW11cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChpdGVtcywgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgZmlsdGVyZWQucHVzaChpdGVtLiRpZCkuc2V0KGl0ZW0pXG4gICAgICB9KVxuICAgICAgZmlsdGVyZWQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gKGFbZmllbGRdID4gYltmaWVsZF0gPyAxIDogLTEpXG4gICAgICB9KVxuICAgICAgaWYgKHJldmVyc2UpIGZpbHRlcmVkLnJldmVyc2UoKVxuICAgICAgcmV0dXJuIGZpbHRlcmVkXG4gICAgfVxuICB9KVxuXG4gIC5maWx0ZXIoJ2RlY29kZVVSSScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0ID8gZGVjb2RlVVJJKHRleHQpIDogJydcbiAgICB9XG4gIH0pXG5cbiAgLy8gRm9ybWF0dGluZyB0ZXh0cyB0byBpbmNsdWRlIG5ldyBsaW5lXG4gIC5maWx0ZXIoJ25sMmJyJywgZnVuY3Rpb24gKCRzY2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0ID8gJHNjZS50cnVzdEFzSHRtbCh0ZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKSkgOiAnJ1xuICAgIH1cbiAgfSlcblxuICAuY29uc3RhbnQoJ0ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vYm14eXouZmlyZWJhc2Vpby5jb20vJylcblxuZnVuY3Rpb24gc2hvdyAoZGF0YSkge1xuICBjb25zb2xlLmxvZyhkYXRhKVxuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMilcbn1cblxuLy8gZm9yIGpvaW5pbmcgLSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9rYXRvd3VsZi82NTk4MjM4XG5mdW5jdGlvbiBleHRlbmQgKGJhc2UpIHtcbiAgdmFyIHBhcnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgaWYgKHAgJiYgdHlwZW9mIChwKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGsgaW4gcCkge1xuICAgICAgICBpZiAocC5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgIGJhc2Vba10gPSBwW2tdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBiYXNlXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcbiAgLmNvbnRyb2xsZXIoJ0F1dGhDdHJsJywgZnVuY3Rpb24oJHNjb3BlLEF1dGgsIFVzZXJzLCAkc3RhdGUsJHJvb3RTY29wZSwkbWRTaWRlbmF2LCR0cmFuc2xhdGUsICRjb29raWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RpU2VydmljZSwkbm90aWZpY2F0aW9uKXtcbiAgICB2YXIgYXV0aEN0cmwgPSB0aGlzO1xuXG4gICAgLy9Bc2sgZm9yIG5vdGlmaWNhdGlvbiBwZXJtaXNzaW9uXG4gICAgJG5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbigpXG4gICAgICAudGhlbihmdW5jdGlvbiAocGVybWlzc2lvbikge1xuICAgICAgICBjb25zb2xlLmxvZyhwZXJtaXNzaW9uKTsgLy8gZGVmYXVsdCwgZ3JhbnRlZCwgZGVuaWVkXG4gICAgICB9KTtcblxuICAgIC8vUGFyc2VyXG4gICAgYXV0aEN0cmwuYXV0aCAgICAgPSBBdXRoO1xuICAgIGF1dGhDdHJsLnVzZXJzICAgID0gVXNlcnM7XG4gICAgYXV0aEN0cmwubm90aWZpY2F0aW9uID0gTm90aVNlcnZpY2U7XG5cblxuICAgIGlmKEF1dGgucmVmLmdldEF1dGgoKSAhPSBudWxsICl7XG4gICAgICBhdXRoQ3RybC5wcm9maWxlICA9IGF1dGhDdHJsLnVzZXJzLmdldFByb2ZpbGUoQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCk7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBhdXRoQ3RybC5wcm9maWxlID0nJ1xuICAgIH1cblxuXG4gICAgYXV0aEN0cmwudXNlciA9IHtcbiAgICAgIGVtYWlsOiAnJyxcbiAgICAgIHBhc3N3b3JkOiAnJ1xuICAgIH07XG5cblxuXG4gICAgLy9HZXQgdGhlIGJhZGdlIG5vdGlmaWNhdGlvblxuICAgIC8qYXV0aEN0cmwuYmFkZ2VOb3RpZmljYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgcmV0dXJuIGF1dGhDdHJsLm5vdGlmaWNhdGlvbi5hZGRBcnJDaGlsZChhdXRoQ3RybC5wcm9maWxlLiRpZCArICcvdW5yZWFkJykuJGxvYWRlZCgpO1xuICAgIH1cblxuICAgIGF1dGhDdHJsLmJhZGdlVmFsdWUgPSBhdXRoQ3RybC5iYWRnZU5vdGlmaWNhdGlvbjtcblxuICAgIGNvbnNvbGUubG9nKGF1dGhDdHJsLmJhZGdlTm90aWZpY2F0aW9uKTsqL1xuXG4gICAgJHNjb3BlLmJhZGdlTm90aWZjYXRpb24gPSBhdXRoQ3RybC5iYWRnZU5vdGlmaWNhdGlvbjtcblxuICAgIC8vUmVzZXQgY291bnRlclxuICAgIGF1dGhDdHJsLnJlc2V0Q291bnRlciA9IGZ1bmN0aW9uKCl7XG4gICAgICBhdXRoQ3RybC5ub3RpZmljYXRpb24ucmVzZXRVbnJlYWQoYXV0aEN0cmwucHJvZmlsZS4kaWQpO1xuICAgIH1cblxuICAgIGF1dGhDdHJsLmNoYW5nZVZhbCA9IGZ1bmN0aW9uKCl7XG4gICAgICBjb25zb2xlLmxvZygnYmFkZ2UgdmFsdWUgJythdXRoQ3RybC5iYWRnZU5vdGlmaWNhdGlvbi4kdmFsdWUpO1xuXG4gICAgfVxuXG4gICAgJHNjb3BlLiR3YXRjaChcIm5hbWVcIiwgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICBpZiAoJHNjb3BlLm5hbWUubGVuZ3RoID4gMCkge1xuICAgICAgICAkc2NvcGUuZ3JlZXRpbmcgPSBcIkdyZWV0aW5ncyBcIiArICRzY29wZS5uYW1lO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAvKiAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgY29uc29sZS5sb2coJ3dhdGNoaW5nLi4uJyk7XG4gICAgICByZXR1cm4gYXV0aEN0cmwubm90aWZpY2F0aW9uLnVucmVhZE5vdGlmaWNhdGlvbigpO1xuICAgIH0sZnVuY3Rpb24odmFsKXtcbiAgICAgIGNvbnNvbGUubG9nKHZhbCk7XG4gICAgICBpZigkc2NvcGUuYmFkZ2VOb3RpZmNhdGlvbi4kdmFsdWUgPiAwKVxuICAgICAge1xuICAgICAgICAkbm90aWZpY2F0aW9uKCdOZXcgbWVzc2FnZSBmcm9tIFFhbnlhJywge1xuICAgICAgICAgIGJvZHk6ICdIZWxsbyAnKyBhdXRoQ3RybC5wcm9maWxlLmRpc3BsYXlOYW1lLFxuICAgICAgICAgIGRpcjogJ2F1dG8nLFxuICAgICAgICAgIGxhbmc6ICdlbicsXG4gICAgICAgICAgdGFnOiAnbXktdGFnJyxcbiAgICAgICAgICBpY29uOiAnaHR0cDovL3d3dy5jbC5jYW0uYWMudWsvcmVzZWFyY2gvc3JnL25ldG9zL2ltYWdlcy9xc2Vuc2UtbG9nby5wbmcnLFxuICAgICAgICAgIC8vZGVsYXk6IDEwMDAsIC8vIGluIG1zXG4gICAgICAgICAgZm9jdXNXaW5kb3dPbkNsaWNrOiB0cnVlIC8vIGZvY3VzIHRoZSB3aW5kb3cgb24gY2xpY2tcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LCB0cnVlKTsqL1xuXG5cbiAgICAvL0NoYW5nZSBsYW5ndWFnZVxuICAgIGF1dGhDdHJsLnRvZ2dsZUxhbmcgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgJHRyYW5zbGF0ZS51c2UobGFuZ0tleSk7XG4gICAgICAvLyBTZXR0aW5nIGEgY29va2llXG4gICAgICAkY29va2llcy5wdXQoJ3VzZXJMYW5nJywgbGFuZ0tleSk7XG4gICAgICAvL0lmIHVzZXIgcmVnaXN0ZXJlZCAtIHVwZGF0ZSB0aGlzIGluIHRoZWlyIHByZWZlcmVuY2VcbiAgICAgIGlmKEF1dGgucmVmLmdldEF1dGgoKSl7XG4gICAgICAgIGF1dGhDdHJsLnVzZXJzLnVzZXJBcnJSZWYoQXV0aC5yZWYuZ2V0QXV0aCgpLnVpZCkudXBkYXRlKHtcImxhbmdcIjpsYW5nS2V5fSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL0NoZWNrayB1c2VyIHNlbGVjdGVkIGxhbmd1YWdlXG4gICAgaWYoIWF1dGhDdHJsLnByb2ZpbGUubGFuZyl7XG4gICAgICBpZigkY29va2llcy5nZXQoJ3VzZXJMYW5nJykpe1xuICAgICAgICBhdXRoQ3RybC50b2dnbGVMYW5nKCRjb29raWVzLmdldCgndXNlckxhbmcnKSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYXV0aEN0cmwudG9nZ2xlTGFuZygnRW5nJyk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBhdXRoQ3RybC50b2dnbGVMYW5nKGF1dGhDdHJsLnByb2ZpbGUubGFuZyk7XG4gICAgfVxuXG5cbiAgICAvL0xvZ2luXG4gICAgYXV0aEN0cmwubG9naW4gPSBmdW5jdGlvbiAoKXtcbiAgICAgIGF1dGhDdHJsLmF1dGguYXV0aC4kYXV0aFdpdGhQYXNzd29yZChhdXRoQ3RybC51c2VyKS50aGVuKGZ1bmN0aW9uIChhdXRoKXtcbiAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQnKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcil7XG4gICAgICAgIGF1dGhDdHJsLmVycm9yID0gZXJyb3I7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy9Mb2dvdXRcbiAgICBhdXRoQ3RybC5sb2dvdXQgPSBmdW5jdGlvbigpe1xuICAgICAgQXV0aC5hdXRoLiR1bmF1dGgoKTtcbiAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICB9XG5cbiAgICAvL1JlZ2lzdGVyIHVzZXJcbiAgICBhdXRoQ3RybC5yZWdpc3RlciA9IGZ1bmN0aW9uICgpe1xuICAgICAgQXV0aC5hdXRoLiRjcmVhdGVVc2VyKGF1dGhDdHJsLnVzZXIpLnRoZW4oZnVuY3Rpb24gKHVzZXIpe1xuICAgICAgICBhdXRoQ3RybC5sb2dpbigpO1xuICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKXtcbiAgICAgICAgYXV0aEN0cmwuZXJyb3IgPSBlcnJvcjtcbiAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIGF1dGhDdHJsLnRvZ2dsZVJpZ2h0ID0gYnVpbGRUb2dnbGVyKCdyaWdodCcpO1xuICAgIGZ1bmN0aW9uIGJ1aWxkVG9nZ2xlcihuYXZJRCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAkbWRTaWRlbmF2KG5hdklEKVxuICAgICAgICAgIC50b2dnbGUoKVxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmZhY3RvcnkoJ0F1dGgnLCBmdW5jdGlvbigkZmlyZWJhc2VBdXRoLCBGaXJlYmFzZVVybCl7XHJcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKTtcclxuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aChyZWYpO1xyXG5cclxuICAgIHZhciBBdXRoID0ge1xyXG4gICAgICByZWY6cmVmLFxyXG4gICAgICBhdXRoOiBhdXRoLFxyXG5cclxuICAgICAgZ2V0VWlkOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIHVpZCA9IHJlZi5nZXRBdXRoKCk7XHJcbiAgICAgICAgaWYodWlkICE9IG51bGwgKXtcclxuICAgICAgICAgIHJldHVybiByZWYuZ2V0QXV0aCgpLnVpZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIEF1dGg7XHJcbiAgfSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5jb250cm9sbGVyKCdDYXRlQ3RybCcsIGZ1bmN0aW9uKCRzdGF0ZSwgQ2F0ZWdvcnksY2F0ZU5hbWUsY2F0ZVRvcGljcyl7XHJcbiAgICB2YXIgY2F0ZUN0cmwgPSB0aGlzO1xyXG5cclxuICAgIC8vUGFyc2Vyc1xyXG4gICAgY2F0ZUN0cmwuY2F0ZU5hbWUgICA9IGNhdGVOYW1lO1xyXG4gICAgY2F0ZUN0cmwuY2F0ZWdvcnkgICA9IENhdGVnb3J5O1xyXG4gICAgY2F0ZUN0cmwuY2F0ZVRvcGljcyA9IGNhdGVUb3BpY3M7XHJcblxyXG4gIH0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuXHJcbiAgLy9Ub3BpYyBsaXN0XHJcbiAgLmZhY3RvcnkoJ0NhdGVTZXJ2aWNlJywgZnVuY3Rpb24oJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBcnJheSAsIEZpcmViYXNlVXJsKXtcclxuICAgIHZhciByZWYgICAgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ2NhdGVnb3JpZXMnKTtcclxuICAgIHZhciBjYXRlZ29yaWVzID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XHJcblxyXG4gICAgdmFyIENhdGUgPSB7XHJcblxyXG4gICAgICBuYW1lOiBmdW5jdGlvbih0b3BpY19zbHVnKXtcclxuICAgICAgICB2YXIgZGF0YSA9IHJlZi5vcmRlckJ5Q2hpbGQoXCJzbHVnXCIpLmVxdWFsVG8odG9waWNfc2x1Zyk7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChkYXRhKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGZvcnRvcGljOiBmdW5jdGlvbih0b3BpY19zbHVnKXtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHVzZXJzUmVmLmNoaWxkKHVpZCkpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgYWRkQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkbmFtZSl7XHJcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZChjaGlsZG5hbWUpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBmb2xsb3dMaXN0OmZ1bmN0aW9uKHVpZCl7XHJcbiAgICAgICAgdmFyIGRhdGEgPSByZWYub3JkZXJCeUNoaWxkKFwibmV3cy9mb2xsb3dlclwiKS5lcXVhbFRvKHVpZCk7XHJcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KGRhdGEpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgdW5Gb2xsb3c6ZnVuY3Rpb24oc2x1Zyx1aWQpe1xyXG4gICAgICAgIHZhciByZWYgICAgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ2NhdGVnb3JpZXMvJytzbHVnKycvZm9sbG93ZXIvJyt1aWQpO1xyXG4gICAgICAgIHJlZi5yZW1vdmUoKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHVzZXJGb2xsb3c6ZnVuY3Rpb24oc2x1Zyx1aWQpe1xyXG4gICAgICAgIHZhciBmb2xsb3c9ZmFsc2U7XHJcbiAgICAgICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnY2F0ZWdvcmllcy8nK3NsdWcrJy9mb2xsb3dlci8nK3VpZCk7XHJcbiAgICAgICAgcmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCkge1xyXG4gICAgICAgICAgZm9sbG93ID0gc25hcHNob3QuZXhpc3RzKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4gZm9sbG93O1xyXG4gICAgICB9LFxyXG4gICAgICBhcnI6ICRmaXJlYmFzZUFycmF5KHJlZiksXHJcbiAgICAgIGFsbDpjYXRlZ29yaWVzXHJcbiAgICB9XHJcbiAgICByZXR1cm4gQ2F0ZTtcclxuICB9KVxyXG5cclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcblxyXG4gIC8vVG9waWMgbGlzdFxyXG4gIC5mYWN0b3J5KCdQb3N0JywgZnVuY3Rpb24oJGZpcmViYXNlT2JqZWN0LCBGaXJlYmFzZVVybCl7XHJcbiAgICB2YXIgcmVmICAgID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKyd0b3BpY3MnKTtcclxuICAgIHZhciB0b3BpY3MgPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcclxuXHJcbiAgICB2YXIgVFMgPSB7XHJcbiAgICAgIHRvcGljTmFtZTogZnVuY3Rpb24odG9waWNfc2x1Zyl7XHJcbiAgICAgICAgdmFyIGRhdGEgPSByZWYub3JkZXJCeUNoaWxkKFwic2x1Z1wiKS5lcXVhbFRvKHRvcGljX3NsdWcpO1xyXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QoZGF0YSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGZvcnRvcGljOiBmdW5jdGlvbih0b3BpY19zbHVnKXtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHVzZXJzUmVmLmNoaWxkKHVpZCkpO1xyXG4gICAgICB9LFxyXG4gICAgICBhbGw6dG9waWNzXHJcbiAgICB9XHJcbiAgICByZXR1cm4gVFM7XHJcbiAgfSlcclxuXHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5jb250cm9sbGVyKCdEYXNoYm9hcmRDdHJsJywgZnVuY3Rpb24oQXV0aCwgJHN0YXRlLENhdGVnb3J5LENhdGVTZXJ2aWNlLFRhZ3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCwgJG1kU2lkZW5hdiwgJGxvZykge1xyXG4gICAgdmFyIGRhc2hib2FyZEN0cmwgPSB0aGlzO1xyXG5cclxuICAgIGRhc2hib2FyZEN0cmwuYXV0aCA9IEF1dGg7XHJcblxyXG4gICAgZGFzaGJvYXJkQ3RybC5jYXRlID0gQ2F0ZVNlcnZpY2U7XHJcbiAgICBkYXNoYm9hcmRDdHJsLmNhdGVnb3JpZXMgICAgICA9IENhdGVnb3J5LmFsbDtcclxuICAgIGRhc2hib2FyZEN0cmwudG9waWNfZ3JpZCAgPSBmYWxzZTtcclxuICAgIGRhc2hib2FyZEN0cmwudGFncyAgICAgICAgPSBUYWdzLmFycjtcclxuXHJcbiAgICBkYXNoYm9hcmRDdHJsLnVzZXJDYXRlRm9sbG93ICA9IFtdO1xyXG4gICAgZGFzaGJvYXJkQ3RybC5jYXRlSXNGb2xsb3cgICAgPSBbXTtcclxuICAgIGRhc2hib2FyZEN0cmwuZm9sbG93TGlzdCAgICAgID0gJyc7XHJcblxyXG5cclxuICAgIC8vQ2xvc2UgU2lkZSBiYXJcclxuICAgIGRhc2hib2FyZEN0cmwuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICRtZFNpZGVuYXYoJ3JpZ2h0JykuY2xvc2UoKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIGRhc2hib2FyZEN0cmwuZm9sbG93Q2F0ZSA9IGZ1bmN0aW9uKGNhdGVfc2x1Zyl7XHJcbiAgICAgIGRhc2hib2FyZEN0cmwuY2F0ZS5hZGRDaGlsZChjYXRlX3NsdWcrJy9mb2xsb3dlcicpXHJcbiAgICAgICAgLmNoaWxkKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuXG5cbiAgLy9CYWRnZSBub3RpZmljYXRpb25cbiAgLmRpcmVjdGl2ZSgnYmFkZ2VOb3RpZmljYXRpb24nLGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAgICAgJ0UnLFxuICAgICAgdHJhbnNjbHVkZTogICB0cnVlLFxuICAgICAgY29udHJvbGxlcjogICAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICAndGVtcGxhdGVzL2h0bWwvYmFkZ2Utbm90aWZpY2F0aW9uLmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgbm90aWZpY2F0aW9uOiAnPSdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cblxuICAvL0xpc3Qgb2YgY2F0ZWdvcmllcyBvbiB0aGUgc2lkZXJiYXJcbiAgLmRpcmVjdGl2ZSgncmV2aWV3U2NvcmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAgICAgJ0UnLFxuICAgICAgdHJhbnNjbHVkZTogICB0cnVlLFxuICAgICAgY29udHJvbGxlcjogICAnVG9waWNDdHJsIGFzIHRvcGljQ3RybCcsXG4gICAgICB0ZW1wbGF0ZVVybDogICd0ZW1wbGF0ZXMvaHRtbC9yZXZpZXctc3VtbWFyeS1saXN0Lmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgcmV2aWV3OiAnPSdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cblxuICAvL0ZvbGxvdyBCdXR0b25cbiAgLmRpcmVjdGl2ZSgndXNlckZvbGxvd2VyQnRuJyxmdW5jdGlvbigpe1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogICAgICdFJyxcbiAgICAgIHRyYW5zY2x1ZGU6ICAgdHJ1ZSxcbiAgICAgIGNvbnRyb2xsZXI6ICAgJ1RvcGljQ3RybCBhcyB0b3BpY0N0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICAndGVtcGxhdGVzL2h0bWwvZm9sbG93LXVzZXIuaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICBmb2xsb3c6ICc9J1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuXG4gIC8vQ2F0ZWdvcnkgZm9sbG93IGJ1dHRvblxuICAuZGlyZWN0aXZlKCdjYXRlRm9sbG93QnRuJyxmdW5jdGlvbigpe1xuICAgIHJldHVybiB7XG4gICAgICBjb250cm9sbGVyOiAnRGFzaGJvYXJkQ3RybCBhcyBkYXNoYm9hcmRDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvY2F0ZWdvcnktZm9sbG93LWJ0bi5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIGNhdGU6ICc9J1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICAvL0xpc3Qgb2YgY2F0ZWdvcmllcyBvbiB0aGUgc2lkZXJiYXJcbiAgLmRpcmVjdGl2ZSgndG9waWNHcmlkJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb250cm9sbGVyOiAnRGFzaGJvYXJkQ3RybCBhcyBkYXNoYm9hcmRDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvY2F0ZWdvcnktZ3JpZC5odG1sJ1xuICAgIH1cbiAgfSlcblxuICAvL0dyaWQgVGFncyBmb3Igc2lkZWJhclxuICAuZGlyZWN0aXZlKCd0YWdHcmlkJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb250cm9sbGVyOiAnRGFzaGJvYXJkQ3RybCBhcyBkYXNoYm9hcmRDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvdGFnLWdyaWQuaHRtbCdcbiAgICB9XG4gIH0pXG5cblxuICAuZGlyZWN0aXZlKCd0b3BpY0NyZWF0ZScsIGZ1bmN0aW9uKCl7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29udHJvbGxlcjogJ1RvcGljQ3RybCBhcyB0b3BpY0N0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC90b3BpYy1jcmVhdGUuaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICB0b3BpYzogJz0nXG4gICAgICB9XG4gICAgfVxuXG4gIH0pXG5cblxuICAuZGlyZWN0aXZlKCd0b3BpY0xpc3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRyb2xsZXI6ICdUb3BpY0N0cmwgYXMgdG9waWNDdHJsJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvdG9waWMtbGlzdC5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIHRvcGljczogJz0nXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG5cbiAgLmRpcmVjdGl2ZSgndG9waWNBY3Rpb25zQ2FyZCcsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29udHJvbGxlcjogJ1RvcGljQ3RybCBhcyB0b3BpY0N0cmwnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaHRtbC90b3BpYy1hY3Rpb25zLWNhcmQuaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICB0b3BpYzogJz0nXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG5cbiAgLy9mb3IgdGFncyAtIG1heCB0YWdzXG4gIC5kaXJlY3RpdmUoJ2VuZm9yY2VNYXhUYWdzJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVxdWlyZTogJ25nTW9kZWwnLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdDdHJsKSB7XG4gICAgICB2YXIgbWF4VGFncyA9IGF0dHJzLm1heFRhZ3MgPyBwYXJzZUludChhdHRycy5tYXhUYWdzLCAnNCcpIDogbnVsbDtcblxuICAgICAgbmdDdHJsLiRwYXJzZXJzLnB1c2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlICYmIG1heFRhZ3MgJiYgdmFsdWUubGVuZ3RoID4gbWF4VGFncykge1xuICAgICAgICAgIHZhbHVlLnNwbGljZSh2YWx1ZS5sZW5ndGggLSAxLCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5jb250cm9sbGVyKCdIb21lQ3RybCcsIGZ1bmN0aW9uKCRzdGF0ZSxDYXRlZ29yeSxUb3BpY3MsZmVlZCl7XHJcbiAgICB2YXIgaG9tZUN0cmwgPSB0aGlzO1xyXG5cclxuICAgIGhvbWVDdHJsLnRvcGljcyA9IENhdGVnb3J5O1xyXG4gICAgaG9tZUN0cmwudG9waWNzID0gVG9waWNzO1xyXG4gICAgaG9tZUN0cmwuZmVlZCAgID0gZmVlZDtcclxuICB9KTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmNvbmZpZyhbJyR0cmFuc2xhdGVQcm92aWRlcicsIGZ1bmN0aW9uICgkdHJhbnNsYXRlUHJvdmlkZXIpIHtcclxuICAgICR0cmFuc2xhdGVQcm92aWRlci50cmFuc2xhdGlvbnMoJ0VuZycsIHtcclxuICAgICAgJ0tFWV9EQVNIQk9BUkQnOiAgJ0Rhc2hib2FyZCcsXHJcbiAgICAgICdLRVlfTEFOR1VBR0VTJzogICdMYW5ndWFnZXMnLFxyXG4gICAgICAnS0VZX0hPTUUnOiAgICAgICAnSG9tZScsXHJcbiAgICAgICdLRVlfUkVHSVNURVInOiAgICdSZWdpc3RlcicsXHJcbiAgICAgICdLRVlfTE9HSU4nOiAgICAgICdMb2cgaW4nLFxyXG4gICAgICAnS0VZX0xPR09VVCc6ICAgICAnTG9nIG91dCcsXHJcbiAgICAgICdLRVlfRk9MTE9XJzogICAgICdGb2xsb3cnLFxyXG4gICAgICAnS0VZX0ZPTExPV0VSJzogICAnRm9sbG93ZXInLFxyXG4gICAgICAnS0VZX1VORk9MTE9XJzogICAnVW5mb2xsb3cnLFxyXG4gICAgICAnS0VZX0ZPTExPV0lORyc6ICAnRm9sbG93aW5nJyxcclxuICAgICAgJ0tFWV9QT1NUJzogICAgICAgJ1Bvc3QnLFxyXG4gICAgICAnS0VZX1BPU1RFRCc6ICAgICAnUG9zdGVkJyxcclxuICAgICAgJ0tFWV9VUFZPVEUnOiAgICAgJ1Vwdm90ZScsXHJcbiAgICAgICdLRVlfVVBWT1RFRCc6ICAgICdVcHZvdGVkJyxcclxuICAgICAgJ0tFWV9EV05fVk9URSc6ICAgJ0Rvd252b3RlJyxcclxuICAgICAgJ0tFWV9EV05fVk9URUQnOiAgJ0Rvd252b3RlZCcsXHJcbiAgICAgICdLRVlfVklFVyc6ICAgICAgICdWaWV3JyxcclxuICAgICAgJ0tFWV9SRU1PVkUnOiAgICAgJ1JlbW92ZScsXHJcbiAgICAgICdLRVlfQ0FOQ0VMJzogICAgICdDYW5jZWwnLFxyXG4gICAgICAnS0VZX1FVRVNUSU9OJzogICAnUXVlc3Rpb24nLFxyXG4gICAgICAnS0VZX1RPUElDJzogICAgICAnVG9waWMnLFxyXG4gICAgICAnS0VZX0NIR19QV0QnOiAgICAnQ2hhbmdlIFBhc3N3b3JkJyxcclxuICAgICAgJ0tFWV9QQVNTV09SRCc6ICAgJ1Bhc3N3b3JkJyxcclxuICAgICAgJ0tFWV9PTERfUFdEJzogICAgJ09sZCBQYXNzd29yZCcsXHJcbiAgICAgICdLRVlfTkVXX1BXRCc6ICAgICdOZXcgUGFzc3dvcmQnLFxyXG4gICAgICAnS0VZX05FV19QV0RfQyc6ICAnTmV3IHBhc3N3b3JkIGNvbmZpcm1hdGlvbicsXHJcbiAgICAgICdLRVlfU0FWRSc6ICAgICAgICdTYXZlJyxcclxuICAgICAgJ0tFWV9TQVZFX0RSQUZUJzogJ1NhdmUgYXMgZHJhZnQnLFxyXG4gICAgICAnS0VZX1RBR1MnOiAgICAgICAnVGFncycsXHJcbiAgICAgICdLRVlfRVhQTE9SRSc6ICAgICdFeHBsb3JlJyxcclxuICAgICAgJ0tFWV9DT01NRU5UUyc6ICAgJ0NvbW1lbnRzJyxcclxuICAgICAgJ0tFWV9SRVBMWSc6ICAgICAgJ1JlcGx5JyxcclxuICAgICAgJ0tFWV9SRVZJRVcnOiAgICAgJ1JldmlldycsXHJcbiAgICAgICdLRVlfRURJVCc6ICAgICAgICdFZGl0JyxcclxuICAgICAgJ0tFWV9UUkVORCc6ICAgICAgJ1RyZW5kJyxcclxuICAgICAgJ0tFWV9UUkVORElORyc6ICAgJ1RyZW5kaW5nJyxcclxuICAgICAgJ0tFWV9XUklURV9SRVBMWSc6J1dyaXRlIGEgcmVwbHknLFxyXG4gICAgICAnS0VZX0xBVEVTVF9GRUVEJzonTGF0ZXN0IEZlZWQnLFxyXG5cclxuICAgICAgLy9SZW1vdmUgdG9waWNcclxuICAgICAgJ0tFWV9DT05GX1JFTU9WRSc6J0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmU/JyxcclxuICAgICAgJ0tFWV9DT05GX1JFTV9DJzogJ09uY2UgcmVtb3ZlLCB5b3Ugd2lsbCBub3QgYmUgYWJsZXRvIHRvIGdldCB0aGlzIHRvcGljIGJhY2snLFxyXG5cclxuXHJcbiAgICAgIC8vU0VOVEVOQ0VcclxuICAgICAgJ0tFWV9XSEFUX09OX1VSX01JTkQnOiAgJ1doYXRcXCdzIG9uIHlvdXIgbWluZD8nLFxyXG4gICAgICAnS0VZX1lPVV9XQU5UX0ZPTExPVyc6ICAnWW91IG1heSB3YW50IHRvIGZvbGxvdycsXHJcbiAgICAgICdLRVlfTk9fQUNDVF9SRUdJU1RFUic6ICdEb25cXCd0IGhhdmUgYWNjb3VudD8gUmVnaXN0ZXInLFxyXG4gICAgICAnS0VZX0NBTlRfQ0hOR19VU0VSJzogICAnRG9uXFwndCBoYXZlIGFjY291bnQ/IFJlZ2lzdGVyJyxcclxuICAgICAgJ0tFWV9ZT1VSX0FDQ09VTlQnOiAgICAgJ1lvdXIgYWNjb3VudCcsXHJcbiAgICAgICdLRVlfTk9USElOR19IRVJFJzogICAgICdOb3RoaW5nIGhlcmUsIHlldCcsXHJcbiAgICAgICdLRVlfV0hPX1RPX0ZPTExPVyc6ICAgICdXaG8gdG8gZm9sbG93JyxcclxuICAgICAgJ0tFWV9DQVRfV0lMTF9BUFBFQVInOiAgJ0ZvbGxvdyBzb21lIGNhdGVnb3JpZXMgYW5kIGl0IHdpbGwgYXBwZWFyIGhlcmUnLFxyXG4gICAgICAnS0VZX1dIVF9VUl9TVE9SWSc6ICAgICAnV2hhdFxcJ3MgeW91ciBzdG9yeScsXHJcbiAgICAgICdLRVlfV1JUX0NPTU1FTlQnOiAgICAgICdXcml0ZSBhIGNvbW1lbnQnLFxyXG5cclxuXHJcblxyXG4gICAgICAvL1VTRVIgSU5QVVRcclxuICAgICAgJ0tFWV9GSVJTVE5BTUUnOiAgJ0ZpcnN0IG5hbWUnLFxyXG4gICAgICAnS0VZX0xBU1ROQU1FJzogICAnTGFzdCBuYW1lJyxcclxuICAgICAgJ0tFWV9CSVJUSERBWSc6ICAgJ0JpcnRoZGF5JyxcclxuICAgICAgJ0tFWV9NT05USCc6ICAgICAgJ01vbnRoJyxcclxuICAgICAgJ0tFWV9EQVknOiAgICAgICAgJ0RheScsXHJcbiAgICAgICdLRVlfRU1BSUwnOiAgICAgICdFbWFpbCcsXHJcbiAgICAgICdLRVlfQ09ORl9FTUFJTCc6ICdDb25maXJtIEVtYWlsJyxcclxuICAgICAgJ0tFWV9HRU5ERVInOiAgICAgJ0dlbmRlcicsXHJcbiAgICAgICdLRVlfTUFMRSc6ICAgICAgICdNYWxlJyxcclxuICAgICAgJ0tFWV9GRU1BTEUnOiAgICAgJ0ZlbWFsZScsXHJcbiAgICAgICdLRVlfVVNFUk5BTUUnOiAgICdVc2VybmFtZScsXHJcbiAgICAgICdLRVlfTE9DQVRJT04nOiAgICdMb2NhdGlvbicsXHJcblxyXG4gICAgICAvL1VzZXIgRWRpdFxyXG4gICAgICAnS0VZX0VEX1BST0ZJTEUnOiAnRWRpdCBQcm9maWxlJyxcclxuICAgICAgJ0tFWV9FRF9DSEdfUFdEJzogJ0NoYW5nZSBQYXNzd29yZCcsXHJcbiAgICAgICdLRVlfRURfUFJPRklMRSc6ICdFZGl0IFByb2ZpbGUnLFxyXG4gICAgICAnS0VZX0VEX1NJVEUnOiAgICAnV2Vic2l0ZScsXHJcbiAgICAgICdLRVlfRURfUEhPTkUnOiAgICdQaG9uZScsXHJcbiAgICAgICdLRVlfRURfQklPJzogICAgICdCaW9ncmFwaHknLFxyXG5cclxuICAgIH0pO1xyXG5cclxuICAgICR0cmFuc2xhdGVQcm92aWRlci50cmFuc2xhdGlvbnMoJ+C5hOC4l+C4oicsIHtcclxuICAgICAgJ0tFWV9EQVNIQk9BUkQnOiAgJ+C4q+C5ieC4reC4h+C4l+C4seC5ieC4h+C4q+C4oeC4lCcsXHJcbiAgICAgICdLRVlfTEFOR1VBR0VTJzogICfguKDguLLguKnguLInLFxyXG4gICAgICAnS0VZX0hPTUUnOiAgICAgICAn4Lir4LiZ4LmJ4Liy4LmB4Lij4LiBJyxcclxuICAgICAgJ0tFWV9SRUdJU1RFUic6ICAgJ+C4quC4oeC4seC4hOC4o+C5g+C4iuC5iScsXHJcbiAgICAgICdLRVlfTE9HSU4nOiAgICAgICfguYDguILguYnguLLguKrguLnguYjguKPguLDguJrguJonLFxyXG4gICAgICAnS0VZX0ZPTExPVyc6ICAgICAn4LiV4Li04LiU4LiV4Liy4LihJyxcclxuICAgICAgJ0tFWV9QT1NUJzogICAgICAgJ+C5guC4nuC4quC4leC5jCdcclxuICAgIH0pO1xyXG5cclxuICAgICR0cmFuc2xhdGVQcm92aWRlci5wcmVmZXJyZWRMYW5ndWFnZSgnZW4nKTtcclxuICB9XSlcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmNvbnRyb2xsZXIoJ05vdGlDdHJsJywgZnVuY3Rpb24oJHN0YXRlLENhdGVnb3J5LFRvcGljcyxOb3RpU2VydmljZSl7XHJcbiAgICB2YXIgbm90aUN0cmwgPSB0aGlzO1xyXG5cclxuXHJcbiAgICBub3RpQ3RybC50b3BpY3MgPSBUb3BpY3M7XHJcbiAgICBub3RpQ3RybC5mZWVkICAgPSBmZWVkO1xyXG4gICAgbm90aUN0cmwubm90aVNlcnZpY2UgPSBOb3RpU2VydmljZTtcclxuXHJcbiAgICBub3RpQ3RybC5ub3RpZnlUbyA9ZnVuY3Rpb24odWlkKXtcclxuICAgICAgcmV0dXJuIG5vdGlDdHJsLmFyci5wdXNoKHVpZCkuJGFkZCh1aWQpXHJcbiAgICB9XHJcbiAgfSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuXG4gIC5mYWN0b3J5KCdOb3RpU2VydmljZScsIGZ1bmN0aW9uKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXkgLCBGaXJlYmFzZVVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVXNlcnMsJG5vdGlmaWNhdGlvbil7XG4gICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbm90aWZpY2F0aW9uJyk7XG4gICAgdmFyIG5vdGkgPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcbiAgICB2YXIgdXNlcnMgPSBVc2VycztcblxuICAgIHZhciBvYnNlcnZlckNhbGxiYWNrcyA9IFtdO1xuXG5cbiAgICB2YXIgTm90aWZpY2F0aW9uID0ge1xuXG4gICAgICAvL0Rpc3BsYXkgdW5yZWFkXG4gICAgICB1bnJlYWROb3RpZmljYXRpb246ZnVuY3Rpb24odWlkKXtcbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbm90aWZpY2F0aW9uLycrdWlkKycvdW5yZWFkJyk7XG4gICAgICAgIHZhciBjb3VudGVyO1xuICAgICAgICByZWYub24oXCJ2YWx1ZVwiLGZ1bmN0aW9uKHNuYXBzaG90KXtcbiAgICAgICAgICBjb3VudGVyID0gc25hcHNob3QudmFsKCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZWYub25jZShcInZhbHVlXCIsZnVuY3Rpb24oKXtcbiAgICAgICAgICAkbm90aWZpY2F0aW9uKCdOZXcgbWVzc2FnZSBmcm9tIFFhbnlhJywge1xuICAgICAgICAgICAgYm9keTogJ0hlbGxvICcrdWlkLFxuICAgICAgICAgICAgZGlyOiAnYXV0bycsXG4gICAgICAgICAgICBsYW5nOiAnZW4nLFxuICAgICAgICAgICAgdGFnOiAnbXktdGFnJyxcbiAgICAgICAgICAgIGljb246ICdodHRwOi8vd3d3LmNsLmNhbS5hYy51ay9yZXNlYXJjaC9zcmcvbmV0b3MvaW1hZ2VzL3FzZW5zZS1sb2dvLnBuZycsXG4gICAgICAgICAgICAvL2RlbGF5OiAxMDAwLCAvLyBpbiBtc1xuICAgICAgICAgICAgZm9jdXNXaW5kb3dPbkNsaWNrOiB0cnVlIC8vIGZvY3VzIHRoZSB3aW5kb3cgb24gY2xpY2tcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGNvdW50ZXIgO1xuICAgICAgfSxcblxuICAgICAgLy9Ob3RpZnkgZm9sbG93ZXJzXG4gICAgICBub3RpZnlGb2xsb3dlcjpmdW5jdGlvbih0b3BpY0lkLHVpZCl7XG4gICAgICAgIHZhciByZWYgPSB1c2Vycy5nZXRGb2xsb3dlcih1aWQpO1xuICAgICAgICByZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgc25hcHNob3QuZm9yRWFjaChmdW5jdGlvbihjaGlsZFNuYXBzaG90KSB7XG4gICAgICAgICAgICAvL3VwZGF0ZSBub3RpZmljYXRpb24gYW5kIGRldGFpbHNcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvbi51cGRhdGVOb3RpZmljYXRpb25Db3VudCh0b3BpY0lkLGNoaWxkU25hcHNob3Qua2V5KCkpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICAvL0FkZCBkZXRhaWwgZm9yIHRoaXMgbm90aWZpY3RpYW9uXG4gICAgICBub3RpZnlMb2c6ZnVuY3Rpb24odG9waWNJZCx1aWQsZnJvbV91aWQpe1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwidWlkIFwiK3VpZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZnJvbSB1aWQgXCIrIGZyb21fdWlkKTtcblxuICAgICAgICBOb3RpZmljYXRpb24uYWRkQ2hpbGQodWlkKS5wdXNoKCkuc2V0KHtcbiAgICAgICAgICB0b3BpY0lkOiAgICB0b3BpY0lkLFxuICAgICAgICAgIGZyb206ICAgICAgIGZyb21fdWlkLFxuICAgICAgICAgIGlzX3JlYWQ6ICAgIGZhbHNlLFxuICAgICAgICAgIHRpbWVzdGFtcDogIG1vbWVudCgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfSk7XG5cbiAgICAgIH0sXG5cblxuICAgICAgLy9SZXNldCB1bnJlYWQgY291bnRlclxuICAgICAgcmVzZXRVbnJlYWQ6ZnVuY3Rpb24odWlkKXtcbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnbm90aWZpY2F0aW9uLycrdWlkKycvdW5yZWFkJyk7XG4gICAgICAgIHJlZi5zZXQoMCk7XG4gICAgICB9LFxuXG5cbiAgICAgIC8vVXBkYXRlIG5vdGlmaWNhdGlvblxuICAgICAgLy9AcGFyYW1zIHVpZCAtIHdobyB0aGlzIG5vdGlmaWNhdGlvbiBpcyBnb2luZyB0b1xuICAgICAgdXBkYXRlTm90aWZpY2F0aW9uQ291bnQ6ZnVuY3Rpb24odG9waWNJZCx1aWQsZnJvbV91aWQpe1xuXG4gICAgICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwrJ25vdGlmaWNhdGlvbi8nK3VpZCsnL3VucmVhZCcpO1xuICAgICAgICByZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgLy9kZWZhdWx0IHVucmVhZCBpcyAxXG4gICAgICAgICBpZihzbmFwc2hvdC52YWwoKSA9PSAnbnVsbCcpe1xuICAgICAgICAgICAgcmVmLnNldCgxKVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVmLnNldChzbmFwc2hvdC52YWwoKSArIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yT2JqZWN0KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJUaGUgcmVhZCBmYWlsZWQ6IFwiICsgZXJyb3JPYmplY3QuY29kZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vQWRkIHRvIGxvZ1xuICAgICAgICBOb3RpZmljYXRpb24ubm90aWZ5TG9nKHRvcGljSWQsdWlkLGZyb21fdWlkKTtcblxuICAgICAgfSxcblxuXG4gICAgICBhZGRDaGlsZDpmdW5jdGlvbihjaGlsZCl7XG4gICAgICAgIHJldHVybiByZWYuY2hpbGQoY2hpbGQpO1xuICAgICAgfSxcblxuICAgICAgYWRkQXJyQ2hpbGQ6ZnVuY3Rpb24oY2hpbGQpe1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZChjaGlsZCkpO1xuICAgICAgfSxcblxuICAgICAgYXJyOiAkZmlyZWJhc2VBcnJheShyZWYpLFxuICAgICAgYWxsOiBub3RpXG4gICAgfVxuICAgIHJldHVybiBOb3RpZmljYXRpb247XG4gIH0pXG5cbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxyXG4gIC5jb250cm9sbGVyKCdQbGFjZXNDdHJsJywgZnVuY3Rpb24oJHN0YXRlLCRzY29wZSwkcm9vdFNjb3BlLCAkbWREaWFsb2csICRtZE1lZGlhLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9TZXJ2aWNlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFncywgVG9waWNzLCBBdXRoLCBVc2VycywgU2x1ZyxMYW5ndWFnZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZUxhbmRpbmcpIHtcclxuXHJcbiAgICB2YXIgcGxhY2VzQ3RybCA9IHRoaXM7XHJcbiAgICBjb25zb2xlLmxvZyhwbGFjZUxhbmRpbmcpO1xyXG4gICAgcGxhY2VzQ3RybC5wbGFjZUxhbmRpbmcgPSBwbGFjZUxhbmRpbmc7XHJcblxyXG4gIH0pO1xyXG5cclxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmZhY3RvcnkoJ1BsYWNlcycsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCBGaXJlYmFzZVVybCl7XHJcblxyXG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsncGxhY2VzJyk7XHJcbiAgICB2YXIgcGxhY2VEZXRhaWxfcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydwbGFjZXNfZGV0YWlscycpO1xyXG5cclxuICAgIHZhciBwbGFjZXMgPSAkZmlyZWJhc2VBcnJheShyZWYpO1xyXG5cclxuICAgIHZhciBQbGFjZXMgPSB7XHJcbiAgICAgIGFkZENoaWxkOiBmdW5jdGlvbihjaGlsZG5hbWUpe1xyXG4gICAgICAgIHJldHVybiByZWYuY2hpbGQoY2hpbGRuYW1lKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgYWRkUGxhY2VEZXRhaWxDaGlsZDogZnVuY3Rpb24oY2hpbGRuYW1lKXtcclxuICAgICAgICByZXR1cm4gcGxhY2VEZXRhaWxfcmVmLmNoaWxkKGNoaWxkbmFtZSlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGdldFBsYWNlUmVmOmZ1bmN0aW9uKHBsYWNlX2lkKXtcclxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKHBsYWNlX2lkKycvaW5mbycpO1xyXG4gICAgICB9LFxyXG4gICAgICBhcnI6IHBsYWNlc1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFBsYWNlcztcclxuICB9KVxyXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuXHJcbiAgLy9DYXRlZ29yeSBsaXN0XHJcbiAgLmZhY3RvcnkoJ0NhdGVnb3J5JywgZnVuY3Rpb24oJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBcnJheSwgRmlyZWJhc2VVcmwpe1xyXG4gICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsnY2F0ZWdvcmllcycpO1xyXG4gICAgdmFyIGNhdGVnb3JpZXMgPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcclxuICAgIHZhciB0b3BpY0FyciA9ICRmaXJlYmFzZUFycmF5KHJlZik7XHJcblxyXG4gICAgdmFyIENhdGVnb3J5ID0ge1xyXG4gICAgICBnZXROYW1lOiBmdW5jdGlvbihzbHVnKXtcclxuICAgICAgICB2YXIgZGF0YSA9IHJlZi5jaGlsZChzbHVnKTtcclxuICAgICAgICByZXR1cm4gJGZpcmViYXNlT2JqZWN0KGRhdGEpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgYWxsOiBjYXRlZ29yaWVzXHJcbiAgICB9XHJcbiAgICByZXR1cm4gQ2F0ZWdvcnk7XHJcbiAgfSlcclxuXHJcblxyXG4gIC8vTGFuZ3VhZ2VzXHJcbiAgLmZhY3RvcnkoJ0xhbmd1YWdlcycsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCBGaXJlYmFzZVVybCl7XHJcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydsYW5ndWFnZXMnKTtcclxuICAgIHZhciBsYW5nID0gJGZpcmViYXNlQXJyYXkocmVmKTtcclxuXHJcbiAgICByZXR1cm4gbGFuZztcclxuICB9KVxyXG5cclxuXHJcbiAgLy9MYW5ndWFnZXNcclxuICAuZmFjdG9yeSgnQXJjaGl2ZScsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCBGaXJlYmFzZVVybCl7XHJcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKydhcmNoaXZlJyk7XHJcbiAgICB2YXIgYXJjaGl2ZSA9ICRmaXJlYmFzZUFycmF5KHJlZik7XHJcblxyXG4gICAgdmFyIEFyY2hpdmUgPXtcclxuICAgICAgYWRkQ2hpbGQ6IGZ1bmN0aW9uKHNsdWcpe1xyXG4gICAgICAgIHJldHVybiByZWYuY2hpbGQoc2x1Zyk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlZjogcmVmLFxyXG4gICAgICBhcnI6IGFyY2hpdmVcclxuICAgIH1cclxuICAgIHJldHVybiBBcmNoaXZlO1xyXG4gIH0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnQXBwJylcclxuICAuY29udHJvbGxlcignVGFnQ3RybCcsIGZ1bmN0aW9uKEF1dGgsIFVzZXJzLCAkc3RhdGUsJHJvb3RTY29wZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vUmVzb2x2ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnTGFuZGluZyx0YWdOYW1lKSB7XHJcblxyXG4gICAgdmFyIHRhZ0N0cmwgPSB0aGlzO1xyXG4gICAgdGFnQ3RybC50YWdMYW5kaW5nICA9IHRhZ0xhbmRpbmc7XHJcbiAgICB0YWdDdHJsLnRhZ05hbWUgICAgID0gdGFnTmFtZTtcclxuXHJcbiAgfSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuZmFjdG9yeSgnVGFncycsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIEZpcmViYXNlVXJsLCAkcSl7XG5cbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsKyd0YWdzJyk7XG4gICAgdmFyIHRhZ3MgPSAkZmlyZWJhc2VBcnJheShyZWYpO1xuXG4gICAgdmFyIFRhZ3MgPSB7XG5cbiAgICAgIGFkZENoaWxkOiBmdW5jdGlvbihjaGlsZG5hbWUpe1xuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKGNoaWxkbmFtZSlcbiAgICAgIH0sXG5cbiAgICAgIHRhZ3NVcmw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZik7XG4gICAgICB9LFxuXG4gICAgICBnZXRUYWdSZWY6ZnVuY3Rpb24odGFnKXtcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZCh0YWcpO1xuICAgICAgfSxcblxuICAgICAgZ2V0VGFnT2JqZWN0OmZ1bmN0aW9uKHRhZyl7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRhZykpXG4gICAgICB9LFxuXG4gICAgICB0b3BpY1RhZ3M6ZnVuY3Rpb24odGFnKXtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICB2YXIgZmIgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwpO1xuICAgICAgICB2YXIgZGF0YVJldCA9ICcnO1xuXG4gICAgICAgIHJldHVybiBmYi5jaGlsZCgndGFncy8nK3RhZylcbiAgICAgICAgICAub24oJ2NoaWxkX2FkZGVkJywgZnVuY3Rpb24odGFnU25hcCl7XG4gICAgICAgICAgICBmYi5jaGlsZCgndG9waWNzJylcbiAgICAgICAgICAgICAgLm9yZGVyQnlDaGlsZChcInRhZ3NcIilcbiAgICAgICAgICAgICAgLmVxdWFsVG8odGFnKVxuICAgICAgICAgICAgICAub24oJ2NoaWxkX2FkZGVkJywgZnVuY3Rpb24odG9waWNTbmFwKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIC8vc2hvdyggZXh0ZW5kKHt9LCB0YWdTbmFwLnZhbCgpLCB0b3BpY1NuYXAudmFsKCkpICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVuZCh7fSwgdGFnU25hcC52YWwoKSwgdG9waWNTbmFwLnZhbCgpKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGFSZXQpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICBhcnI6IHRhZ3NcblxuICAgIH1cbiAgICByZXR1cm4gVGFncztcbiAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuY29udHJvbGxlcignVG9waWNMYW5kaW5nQ3RybCcsIGZ1bmN0aW9uICgkc3RhdGUsICRzY29wZSwgU2x1ZywgVG9waWNzLCBBdXRoLCBVc2VycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9SZXNvbHZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzT3duZXIsdG9waWNMYW5kaW5nLCByZXBseUxpc3QsIHZpZXdEYXRhLCBmb2xsb3dlcnMpIHtcblxuICAgIHZhciB0b3BpY0xhbmRpbmdDdHJsID0gdGhpc1xuXG5cbiAgICB0b3BpY0xhbmRpbmdDdHJsLmF1dGggICAgICAgICA9IEF1dGg7XG4gICAgdG9waWNMYW5kaW5nQ3RybC51c2VycyAgICAgICAgPSBVc2VycztcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnRvcGljTGFuZGluZyA9IHRvcGljTGFuZGluZztcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnRvcGljcyAgICAgICA9IFRvcGljcztcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnJlcGx5TGlzdCAgICA9IHJlcGx5TGlzdDtcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnZpZXdzICAgICAgICA9IHZpZXdEYXRhO1xuICAgIHRvcGljTGFuZGluZ0N0cmwuZm9sbG93ZXJzICAgID0gZm9sbG93ZXJzO1xuICAgIHRvcGljTGFuZGluZ0N0cmwuaXNPd25lciAgICAgID0gaXNPd25lcjtcblxuXG5cblxuICAgIC8vR2V0dGluZyBSZXBsaWVzIGluIHJlcGxpZXNcbiAgICB0b3BpY0xhbmRpbmdDdHJsLmluUmVwbHlBcnIgPSBbXTtcbiAgICB0b3BpY0xhbmRpbmdDdHJsLnJlcGx5SW5SZXBseSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgIGZvcih2YXIgaT0wOyBpPHRvcGljTGFuZGluZ0N0cmwucmVwbHlMaXN0Lmxlbmd0aDtpKyspe1xuICAgICAgICB2YXIgdG9waWNJZCA9IHRvcGljTGFuZGluZ0N0cmwucmVwbHlMaXN0W2ldLnRvcGljSWQ7XG4gICAgICAgIHZhciByZXBseUlkID0gdG9waWNMYW5kaW5nQ3RybC5yZXBseUxpc3RbaV0uJGlkO1xuICAgICAgICB0b3BpY0xhbmRpbmdDdHJsLmluUmVwbHlBcnJbaV0gPSB0b3BpY0xhbmRpbmdDdHJsLnRvcGljcy5yZXBseUluUmVwbHkodG9waWNJZCxyZXBseUlkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0b3BpY0xhbmRpbmdDdHJsLnJlcGx5SW5SZXBseSgpO1xuICB9KVxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC5jb250cm9sbGVyKCdUb3BpY0N0cmwnLCBmdW5jdGlvbigkc3RhdGUsJHNjb3BlLCRyb290U2NvcGUsICRtZERpYWxvZywgJG1kTWVkaWEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaHR0cCxGaXJlYmFzZVVybCwkdHJhbnNsYXRlLCRub3RpZmljYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1NlcnZpY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RpU2VydmljZSxUYWdzLCBUb3BpY3MsIEF1dGgsIFVzZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2x1ZyxQbGFjZXMsIExhbmd1YWdlcyxBcmNoaXZlKXtcblxuICAgIHZhciB0b3BpY0N0cmwgPSB0aGlzO1xuXG5cbiAgICAvL1BhcnNlciBoZXJlXG4gICAgdG9waWNDdHJsLnRhZ3MgICAgICA9IFRhZ3M7XG4gICAgdG9waWNDdHJsLnRvcGljcyAgICA9IFRvcGljcztcbiAgICB0b3BpY0N0cmwuYXV0aCAgICAgID0gQXV0aDtcbiAgICB0b3BpY0N0cmwudXNlcnMgICAgID0gVXNlcnM7XG4gICAgdG9waWNDdHJsLmxhbmd1YWdlcyA9IExhbmd1YWdlcztcbiAgICB0b3BpY0N0cmwucGxhY2VzICAgID0gUGxhY2VzO1xuICAgIHRvcGljQ3RybC5hcmNoaXZlICAgPSBBcmNoaXZlO1xuICAgIHRvcGljQ3RybC5ub3RpICAgICAgPSBOb3RpU2VydmljZTtcblxuICAgIGlmKHRvcGljQ3RybC5hdXRoLnJlZi5nZXRBdXRoKCkgIT0gbnVsbCApe1xuICAgICAgdG9waWNDdHJsLnByb2ZpbGUgID0gdG9waWNDdHJsLnVzZXJzLmdldFByb2ZpbGUodG9waWNDdHJsLmF1dGgucmVmLmdldEF1dGgoKS51aWQpO1xuICAgICAgdG9waWNDdHJsLnVpZCA9IHRvcGljQ3RybC5wcm9maWxlLiRpZDtcbiAgICAgIHRvcGljQ3RybC51c2VyUmVmID0gdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCk7XG4gICAgICB0b3BpY0N0cmwudXNlclVwdm90ZWRUb3BpY3MgPSB0b3BpY0N0cmwudXNlcnMudXB2b3Rlcyh0b3BpY0N0cmwudWlkKTtcbiAgICAgIHRvcGljQ3RybC51c2VyRG93bnZvdGVkVG9waWNzID0gdG9waWNDdHJsLnVzZXJzLmRvd252b3Rlcyh0b3BpY0N0cmwudWlkKTtcbiAgICAgIHRvcGljQ3RybC51c2VyRm9sbG93aW5nID0gdG9waWNDdHJsLnVzZXJzLmZvbGxvd2luZyh0b3BpY0N0cmwudWlkKTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgIHRvcGljQ3RybC5wcm9maWxlID0nJztcbiAgICAgIHRvcGljQ3RybC51aWQgPSAnJztcbiAgICAgIHRvcGljQ3RybC51c2VyUmVmID0gJyc7XG4gICAgfVxuXG5cblxuICAgIC8vUHJlc2V0IFBhcmFtZXRlcnNcbiAgICB0b3BpY0N0cmwuaW1hZ2VTdHJpbmdzICA9IFtdO1xuICAgIHRvcGljQ3RybC5pbWFnZVRleHQgICAgID0gW107XG4gICAgdG9waWNDdHJsLmluUmVwbHlBcnIgICAgPSBbXTtcbiAgICB0b3BpY0N0cmwubG9hZEJ1c3kgICAgICA9IGZhbHNlO1xuICAgIHRvcGljQ3RybC5zbHVnUmV0dXJuICAgID0gbnVsbDtcbiAgICB0b3BpY0N0cmwuY3JpdGVyaWEgICAgICA9IGZhbHNlO1xuICAgIHRvcGljQ3RybC5jcml0ZXJpYVJlcGx5ID0gbnVsbDtcbiAgICB0b3BpY0N0cmwucmV2aWV3Q3JpdGVyaWE9ZmFsc2U7XG4gICAgdG9waWNDdHJsLmNyaXRSZXBseURhdGEgPSBudWxsO1xuXG4gICAgLy9pZiBhbGxvdyBudWxsIGluIHRoZSBmb3JtXG4gICAgdG9waWNDdHJsLm5ld1RvcGljICAgICAgPSB7XG4gICAgICAnbG9jYXRpb24nOiAnJyxcbiAgICAgICd1cmwnIDogJycsXG4gICAgICAnaXBJbmZvJzogJycsXG4gICAgICAndGFncyc6ICcnLFxuICAgICAgJ2JvZHknOiAnJ1xuICAgIH1cblxuXG4gICAgLy9DYWxjIGF2ZXJhZ2UgcmV2aWV3IGlucHV0IGluIHJlcGx5XG4gICAgdG9waWNDdHJsLmF2Z1Jldmlld1JlcGx5ID0gZnVuY3Rpb24oKXtcblxuICAgICAgdmFyIG9iakNvdW50ID0gT2JqZWN0LmtleXModG9waWNDdHJsLmNyaXRlcmlhUmVwbHkpLmxlbmd0aDtcbiAgICAgIHZhciBhdmcgPSAwXG4gICAgICBmb3IodmFyIGk9MDtpPG9iakNvdW50O2krKyl7XG4gICAgICAgIGF2ZyA9IGF2ZyArIHRvcGljQ3RybC5jcml0ZXJpYVJlcGx5W2ldO1xuICAgICAgfVxuXG4gICAgICB0b3BpY0N0cmwucmVwbHlSZXZpZXdBdmVyYWdlID0gYXZnL29iakNvdW50O1xuXG4gICAgICBjb25zb2xlLmxvZyh0b3BpY0N0cmwuY3JpdGVyaWFSZXBseSk7XG5cbiAgICAgIHRvcGljQ3RybC5jcml0UmVwbHlEYXRhID0geyBhdmc6IHRvcGljQ3RybC5yZXBseVJldmlld0F2ZXJhZ2UsIGRhdGE6IHRvcGljQ3RybC5jcml0ZXJpYVJlcGx5fVxuICAgIH1cblxuXG4gICAgLy9HZXQgdGhlIGF2ZXJhZ2Ugc2NvcmUgZnJvbSBjcml0ZXJpYSB2YWx1ZXNcbiAgICB0b3BpY0N0cmwuYXZnUmV2aWV3U2NvcmUgPSBmdW5jdGlvbihkYXRhKXtcbiAgICAgIGlmKGRhdGEpXG4gICAgICB7XG4gICAgICB2YXIgYXZnID0wO1xuICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xuICAgICAgICBhdmcgPSBhdmcgKyBkYXRhW2ldLnJhdGluZztcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdmcvZGF0YS5sZW5ndGg7XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICAvL0xhYmVsIGZvciByZW1vdmUgdG9waWNzXG4gICAgJHRyYW5zbGF0ZShbJ0tFWV9SRU1PVkUnLCAnS0VZX0NBTkNFTCcsJ0tFWV9DT05GX1JFTU9WRScsJ0tFWV9DT05GX1JFTV9DJ10pLnRoZW4oZnVuY3Rpb24gKHRyYW5zbGF0aW9ucykge1xuICAgICAgdG9waWNDdHJsLnJlbW92ZVRyYW5zID0gdHJhbnNsYXRpb25zLktFWV9SRU1PVkU7XG4gICAgICB0b3BpY0N0cmwuY2FuY2VsVHJhbnMgPSB0cmFuc2xhdGlvbnMuS0VZX0NBTkNFTDtcbiAgICAgIHRvcGljQ3RybC5jb25maXJtUmVtICA9IHRyYW5zbGF0aW9ucy5LRVlfQ09ORl9SRU1PVkU7XG4gICAgICB0b3BpY0N0cmwuY29uZmlybVJlbUNvbnRlbnQgPSAgdHJhbnNsYXRpb25zLktFWV9DT05GX1JFTV9DO1xuICAgIH0pO1xuXG5cbiAgICB0b3BpY0N0cmwudXNlck5hbWUgPSBmdW5jdGlvbih1c2VySWQpe1xuICAgICAgaWYodXNlcklkIT0gbnVsbCl7XG4gICAgICAgIC8vcmV0dXJuIHRvcGljQ3RybC51c2Vycy5nZXREaXNwbGF5TmFtZSh1c2VySWQpO1xuICAgICAgfVxuICAgIH1cblxuXG5cblxuICAgIC8vTG9naW4gZm9yIG1hdGVyaWFsXG4gICAgdG9waWNDdHJsLnNob3dNZExvZ2luID0gZnVuY3Rpb24oZXYpIHtcbiAgICAgIHZhciB1c2VGdWxsU2NyZWVuID0gKCRtZE1lZGlhKCdzbScpIHx8ICRtZE1lZGlhKCd4cycpKSAmJiAkc2NvcGUuY3VzdG9tRnVsbHNjcmVlbjtcbiAgICAgICRtZERpYWxvZy5zaG93KHtcbiAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwgYXMgYXV0aEN0cmwnLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2h0bWwvbWQtbG9naW4tZm9ybS5odG1sJyxcbiAgICAgICAgICBwYXJlbnQ6IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KSxcbiAgICAgICAgICB0YXJnZXRFdmVudDogZXYsXG4gICAgICAgICAgY2xpY2tPdXRzaWRlVG9DbG9zZTogdHJ1ZSxcbiAgICAgICAgICBmdWxsc2NyZWVuOiB1c2VGdWxsU2NyZWVuXG4gICAgICAgIH0pXG4gICAgfVxuXG5cblxuICAgIHRvcGljQ3RybC5kZWNvZGVUZXh0ID0gZnVuY3Rpb24odGV4dCl7XG4gICAgICAvL3JldHVybiAkZmlsdGVyKCdzbHVnaWZ5JykoaXRlbS5uYW1lKTtcbiAgICAgIGNvbnNvbGUubG9nKGRlY29kZVVSSSh0ZXh0KSk7XG4gICAgICByZXR1cm4gZGVjb2RlVVJJKHRleHQpO1xuICAgIH1cblxuXG4gICAgdG9waWNDdHJsLmxvYWRNb3JlID0gZnVuY3Rpb24oaXRlbXMpIHtcbiAgICAgIHRvcGljQ3RybC5sb2FkQnVzeSA9IHRydWU7XG4gICAgICB2YXIgZGF0YSA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkYXRhLnB1c2goaXRlbXNbaV0pO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICByZXR1cm4gZGF0YVxuICAgIH07XG5cbiAgICB0b3BpY0N0cmwubG9hZFRhZ3MgPSBmdW5jdGlvbihxdWVyeSkge1xuICAgICAgY29uc29sZS5sb2codG9waWNDdHJsLnRhZ3MudGFnc1VybCgpKTtcbiAgICB9O1xuXG5cbiAgICAvKnRvcGljQ3RybC51c2Vycy5nZXRMb2NhdGlvbklQKCkuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICB0b3BpY0N0cmwubmV3VG9waWMuaXBJbmZvID0gZGF0YTtcbiAgICB9KTsqL1xuXG5cbiAgICAvL1VwbG9hZCBQcm9maWxlIGltYWdlXG4gICAgdG9waWNDdHJsLnVwbG9hZEZpbGUgPSBmdW5jdGlvbihmaWxlcyxpbmRleCkge1xuICAgICAgYW5ndWxhci5mb3JFYWNoKGZpbGVzLCBmdW5jdGlvbiAoZmxvd0ZpbGUsIGluZGV4KSB7XG4gICAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICB2YXIgdXJpID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICB0b3BpY0N0cmwuaW1hZ2VTdHJpbmdzW2luZGV4XSA9IHVyaTtcbiAgICAgICAgfTtcbiAgICAgICAgZmlsZVJlYWRlci5yZWFkQXNEYXRhVVJMKGZsb3dGaWxlLmZpbGUpO1xuICAgICAgfSlcbiAgICB9O1xuXG5cbiAgICAvL1Nob3cgY29uZmlybSByZW1vdmUgdG9waWNcbiAgICB0b3BpY0N0cmwuc2hvd0NvbmZpcm1SZW1vdmUgPSBmdW5jdGlvbihldix0b3BpY19vd25lcixvYmope1xuICAgICAgLy8gQXBwZW5kaW5nIGRpYWxvZyB0byBkb2N1bWVudC5ib2R5IHRvIGNvdmVyIHNpZGVuYXYgaW4gZG9jcyBhcHBcbiAgICAgIHZhciBjb25maXJtID0gJG1kRGlhbG9nLmNvbmZpcm0oKVxuICAgICAgICAudGl0bGUodG9waWNDdHJsLmNvbmZpcm1SZW0pXG4gICAgICAgIC50ZXh0Q29udGVudCh0b3BpY0N0cmwuY29uZmlybVJlbUNvbnRlbnQpXG4gICAgICAgIC50YXJnZXRFdmVudChldilcbiAgICAgICAgLm9rKHRvcGljQ3RybC5yZW1vdmVUcmFucylcbiAgICAgICAgLmNhbmNlbCh0b3BpY0N0cmwuY2FuY2VsVHJhbnMpO1xuICAgICAgJG1kRGlhbG9nLnNob3coY29uZmlybSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgaWYodG9waWNDdHJsLnJlbW92ZVRvcGljKHRvcGljX293bmVyLG9iaikpe1xuICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIC8vUmVtb3ZlIHRvcGljXG4gICAgdG9waWNDdHJsLnJlbW92ZVRvcGljID0gZnVuY3Rpb24odG9waWNfb3duZXIsb2JqKXtcbiAgICAgIC8vdmVyaWZ5IGlmIHRoZSB0b3BpYyBvd25lciBhbmQgdGhlIGxvZ2luIG93bmVyIGlzIHRoZSBzYW1lIHBwbFxuICAgICAgaWYodG9waWNfb3duZXIgPT0gdG9waWNDdHJsLnVpZCl7XG4gICAgICAgIG1vdmVGYlJlY29yZCh0b3BpY0N0cmwudG9waWNzLnJlZkNoaWxkKG9iai4kaWQpLCB0b3BpY0N0cmwuYXJjaGl2ZS5hZGRDaGlsZChvYmouJGlkKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgfVxuICAgIH1cblxuXG4gICAgLy9SZXBseSB0byB0b3BpY1xuICAgIHRvcGljQ3RybC5yZXBseSA9IGZ1bmN0aW9uKHRvcGljT2JqKXtcblxuICAgICAgdG9waWNDdHJsLnRvcGljcy5yZXBseUFycih0b3BpY09iai4kaWQpLiRhZGQoe1xuICAgICAgICB0b3BpY0lkOiAgdG9waWNPYmouJGlkLFxuICAgICAgICBib2R5OiAgICAgdG9waWNDdHJsLm5ld1JlcGx5LmJvZHksXG4gICAgICAgIHVpZDogICAgICB0b3BpY0N0cmwudWlkLFxuICAgICAgICByZXZpZXc6ICAgdG9waWNDdHJsLmNyaXRSZXBseURhdGEsXG4gICAgICAgIGNyZWF0ZWQ6ICBtb21lbnQoKS50b0lTT1N0cmluZygpXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vTm90aWZ5IHRvcGljIG93bmVyXG4gICAgICAgIC8vdG9waWNPYmogcmVmZXJzIHRvIHRoZSBwcm9wZXJ0eSBvZiB0aGlzIG9iamVjdFxuICAgICAgICB0b3BpY0N0cmwubm90aS51cGRhdGVOb3RpZmljYXRpb25Db3VudCh0b3BpY09iai4kaWQsdG9waWNPYmoudWlkLHRvcGljQ3RybC51aWQpO1xuICAgICAgfSlcblxuXG5cblxuXG5cbiAgICAgIHRvcGljQ3RybC50b3BpY3MucmVwbHlDb3VudCh0b3BpY09iai4kaWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICBpZighZGF0YS5jb3VudCl7XG4gICAgICAgICAgdG9waWNDdHJsLnRvcGljcy5yZXBseUNvdW50UmVmKHRvcGljT2JqLiRpZCkuc2V0KDEpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0b3BpY0N0cmwudG9waWNzLnJlcGx5Q291bnRSZWYodG9waWNPYmouJGlkKVxuICAgICAgICAgICAgLnNldChkYXRhLmNvdW50ICsxKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cblxuICAgICAgLy9TdGF0IHVwZGF0ZSBmb3IgdXNlclxuICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvY29tbWVudC9jb3VudCcpXG4gICAgICAgIC5zZXQodG9waWNDdHJsLnByb2ZpbGUuc3RhdC5jb21tZW50LmNvdW50ICsgMSk7XG5cbiAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L2NvbW1lbnQvdG9waWNzLycrdG9waWNPYmouJGlkKVxuICAgICAgICAucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcbiAgICB9XG5cblxuXG4gICAgLy9SZXBseSBpbiByZXBseVxuICAgIHRvcGljQ3RybC5yZXBseUluUmVwbHkgPSBmdW5jdGlvbih0b3BpY0lkLHJlcGx5SWQpe1xuICAgICAgdG9waWNDdHJsLnRvcGljcy5yZXBseUluUmVwbHlBcnIodG9waWNJZCxyZXBseUlkKS4kYWRkKHtcbiAgICAgICAgYm9keTogICAgIHRvcGljQ3RybC5yZXBseUluUmVwbHkuYm9keSxcbiAgICAgICAgdWlkOiAgICAgIHRvcGljQ3RybC51aWQsXG4gICAgICAgIGNyZWF0ZWQ6ICBtb21lbnQoKS50b0lTT1N0cmluZygpXG4gICAgICB9KVxuICAgIH1cblxuXG5cbiAgICB0b3BpY0N0cmwuYWRkTmV3Q2hvaWNlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbmV3SXRlbU5vID0gdG9waWNDdHJsLnJldmlld0NyaXRlcmlhLmxlbmd0aCsxO1xuICAgICAgdG9waWNDdHJsLnJldmlld0NyaXRlcmlhLnB1c2goeydpZCc6J2NyaXRlcmlhJytuZXdJdGVtTm99KTtcbiAgICB9O1xuXG4gICAgdG9waWNDdHJsLnJlbW92ZUNob2ljZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxhc3RJdGVtID0gdG9waWNDdHJsLnJldmlld0NyaXRlcmlhLmxlbmd0aC0xO1xuICAgICAgdG9waWNDdHJsLnJldmlld0NyaXRlcmlhLnNwbGljZShsYXN0SXRlbSk7XG4gICAgfTtcblxuXG4gICAgLy9DcmVhdGUgbmV3IHRvcGljXG4gICAgdG9waWNDdHJsLmNyZWF0ZVRvcGljID0gZnVuY3Rpb24oY2F0ZWdvcnksaXNEcmFmdCl7XG5cbiAgICAgIC8vQ2hlY2sgaWYgd2UgaGF2ZSBsb2NhdGlvbiBkZXRhaWxzXG4gICAgICB2YXIgbG9jYXRpb25EZXRhaWwgPSAnJztcblxuICAgICAgaWYodG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uICE9PSAnJyApe1xuICAgICAgICBjb25zb2xlLmxvZyh0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24pO1xuICAgICAgICBsb2NhdGlvbkRldGFpbCA9IHtcbiAgICAgICAgICBwbGFjZV9pZDogdG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uLmRldGFpbHMucGxhY2VfaWQsXG4gICAgICAgICAgc2x1ZzogICAgIFNsdWcuc2x1Z2lmeSh0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5uYW1lKSxcbiAgICAgICAgICBuYW1lOiAgICAgdG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uLmRldGFpbHMubmFtZSxcbiAgICAgICAgICBhZGRyZXNzOiAgdG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uLmRldGFpbHMuZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgbGF0OiAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxhdCgpLFxuICAgICAgICAgIGxuZzogICAgICB0b3BpY0N0cmwubmV3VG9waWMubG9jYXRpb24uZGV0YWlscy5nZW9tZXRyeS5sb2NhdGlvbi5sbmcoKSxcbiAgICAgICAgICBsbmc6ICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmxvY2F0aW9uLmRldGFpbHMuZ2VvbWV0cnkubG9jYXRpb24ubG5nKCksXG4gICAgICAgICAgbG5nOiAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgLyogREVCVUcgRk9STSBWQUxVRVxuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgdHlwZTogICAgICAgICAgIHRvcGljQ3RybC50eXBlLFxuICAgICAgICBsYW5nOiAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmxhbmcsXG4gICAgICAgIHRvcGljOiAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMudG9waWMsXG4gICAgICAgIGJvZHk6ICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMuYm9keSxcbiAgICAgICAgY2F0ZWdvcnk6ICAgICAgIGNhdGVnb3J5LFxuICAgICAgICB1aWQ6ICAgICAgICAgICAgdG9waWNDdHJsLnVpZCxcbiAgICAgICAgc2x1ZzogICAgICAgICAgIFNsdWcuc2x1Z2lmeSh0b3BpY0N0cmwubmV3VG9waWMudG9waWMpLFxuICAgICAgICBwaG90b3M6ICAgICAgICAgdG9waWNDdHJsLmltYWdlU3RyaW5ncyxcbiAgICAgICAgcGhvdG9zX3RleHQ6ICAgIHRvcGljQ3RybC5pbWFnZVRleHQsXG4gICAgICAgIGxvY2F0aW9uOiAgICAgICBsb2NhdGlvbkRldGFpbCxcbiAgICAgICAgdXJsOiAgICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy51cmwsXG4gICAgICAgIGRyYWZ0OiAgICAgICAgICBpc0RyYWZ0LFxuICAgICAgICBjcmVhdGVkOiAgICAgICAgbW9tZW50KCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgdGFnczogICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy50YWdzLFxuICAgICAgICB1c2VySVA6ICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy5pcEluZm9cbiAgICAgIH07XG4gICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICovXG5cbiAgICAgIHRvcGljQ3RybC50b3BpY3MuYXJyLiRhZGQoe1xuICAgICAgICAgIHR5cGU6ICAgICAgICAgICB0b3BpY0N0cmwudHlwZSxcbiAgICAgICAgICBsYW5nOiAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmxhbmcsXG4gICAgICAgICAgdG9waWM6ICAgICAgICAgIHRvcGljQ3RybC5uZXdUb3BpYy50b3BpYyxcbiAgICAgICAgICBib2R5OiAgICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmJvZHksXG4gICAgICAgICAgY2F0ZWdvcnk6ICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgIHVpZDogICAgICAgICAgICB0b3BpY0N0cmwudWlkLFxuICAgICAgICAgIC8vc2x1ZzogICAgICAgICAgIFNsdWcuc2x1Z2lmeSh0b3BpY0N0cmwubmV3VG9waWMudG9waWMpLFxuICAgICAgICAgIHNsdWc6ICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMudG9waWMsXG4gICAgICAgICAgcGhvdG9zOiAgICAgICAgIHRvcGljQ3RybC5pbWFnZVN0cmluZ3MsXG4gICAgICAgICAgcGhvdG9zX3RleHQ6ICAgIHRvcGljQ3RybC5pbWFnZVRleHQsXG4gICAgICAgICAgbG9jYXRpb246ICAgICAgIGxvY2F0aW9uRGV0YWlsLFxuICAgICAgICAgIHVybDogICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMudXJsLFxuICAgICAgICAgIGRyYWZ0OiAgICAgICAgICBpc0RyYWZ0LFxuICAgICAgICAgIGNyZWF0ZWQ6ICAgICAgICBtb21lbnQoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgIHRhZ3M6ICAgICAgICAgICB0b3BpY0N0cmwubmV3VG9waWMudGFncyxcbiAgICAgICAgICB1c2VySVA6ICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljLmlwSW5mbyxcbiAgICAgICAgICByZXZpZXc6ICAgICAgICAgdG9waWNDdHJsLnJldmlld0NyaXRlcmlhLFxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHRvcGljKXtcblxuICAgICAgICAgIHZhciBzbHVnVGV4dCA9Jyc7XG4gICAgICAgICAgLy9pZiB3ZSBhcmUgdW5hYmxlIHRvIGNvbnZlcnQgdG8gc2x1ZyB0aGVuIHdlIHVzZSB0aGUgdG9waWMgdGV4dCwgZWxzZSB1c2Ugc2x1Z1xuICAgICAgICAgIGlmKFNsdWcuc2x1Z2lmeSh0b3BpY0N0cmwubmV3VG9waWMudG9waWMpID09Jycpe1xuICAgICAgICAgICAgc2x1Z1RleHQgPSB0b3BpY0N0cmwubmV3VG9waWMudG9waWM7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBzbHVnVGV4dCA9IFNsdWcuc2x1Z2lmeSh0b3BpY0N0cmwubmV3VG9waWMudG9waWMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vVXBkYXRlIHNsdWcgd2l0aCB0b3BpYyBLZXlcbiAgICAgICAgICB0b3BpY0N0cmwudG9waWNzLmdldFRvcGljQnlLZXkodG9waWMua2V5KCkpLnVwZGF0ZSh7XCJzbHVnXCI6c2x1Z1RleHQrdG9waWMua2V5KCl9KTtcblxuICAgICAgICAgIC8vU3RhdCB1cGRhdGVcbiAgICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9wb3N0ZWQvY291bnQnKVxuICAgICAgICAgICAgLnNldCh0b3BpY0N0cmwucHJvZmlsZS5zdGF0LnBvc3RlZC5jb3VudCArIDEpO1xuXG4gICAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvcG9zdGVkL3RvcGljcy8nK3RvcGljLmtleSgpKVxuICAgICAgICAgICAgLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XG5cbiAgICAgICAgICAvL0lmIHRoZXJlIGlzIGxvY2F0aW9uXG4gICAgICAgICAgaWYobG9jYXRpb25EZXRhaWwgIT09ICcnKXtcblxuICAgICAgICAgICAgdG9waWNDdHJsLnBsYWNlcy5hZGRDaGlsZChsb2NhdGlvbkRldGFpbC5wbGFjZV9pZClcbiAgICAgICAgICAgICAgICAgICAgICAuY2hpbGQodG9waWMua2V5KCkpXG4gICAgICAgICAgICAgICAgICAgICAgLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XG5cbiAgICAgICAgICAgIHRvcGljQ3RybC5wbGFjZXMuYWRkQ2hpbGQobG9jYXRpb25EZXRhaWwucGxhY2VfaWQpXG4gICAgICAgICAgICAgIC5jaGlsZCgnaW5mbycpLnNldChsb2NhdGlvbkRldGFpbCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy9pZiB0aGVyZSBhcmUgdGFnc1xuICAgICAgICAgIGlmKHRvcGljQ3RybC5uZXdUb3BpYy50YWdzICE9PSBudWxsKXtcbiAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB0b3BpY0N0cmwubmV3VG9waWMudGFncy5sZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgICAgICAgICAgdG9waWNDdHJsLnRhZ3MuYWRkQ2hpbGQodG9waWNDdHJsLm5ld1RvcGljLnRhZ3NbaW5kZXhdLnRleHQpXG4gICAgICAgICAgICAgICAgLmNoaWxkKHRvcGljLmtleSgpKS5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vTm90aWZ5IGZvbGxvd2VyXG4gICAgICAgICAgdG9waWNDdHJsLm5vdGkubm90aWZ5Rm9sbG93ZXIodG9waWMua2V5KCksdG9waWNDdHJsLnVpZCk7XG5cblxuICAgICAgICAgIC8vUmVzZXQgZm9ybSBoZXJlXG4gICAgICAgICAgdG9waWNDdHJsLm5ld1RvcGljID0ge1xuICAgICAgICAgICAgYm9keTogJydcbiAgICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfTtcblxuXG4gICAgLy9DaGVjayBpZiB1c2VyIGlzIGFscmVhZHkgZm9sbG93aW5nIHVzZXJcbiAgICB0b3BpY0N0cmwuY2hlY2tGb2xsb3cgPSBmdW5jdGlvbihmb2xsb3dfdWlkKXtcbiAgICAgIGlmKHRvcGljQ3RybC51c2Vycy5jaGVja0ZvbGxvdyh0b3BpY0N0cmwudWlkLGZvbGxvd191aWQpKXtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuXG4gICAgLy9Gb2xsb3cgVXNlclxuICAgIHRvcGljQ3RybC5mb2xsb3dVc2VyID0gZnVuY3Rpb24oZm9sbG93X3VpZCl7XG5cbiAgICAgIC8vVXBkYXRlIHRoZSBwZXJzb24gdGhhdCBiZWluZyBmb2xsb3csIGNyZWRpdCB0aGVtIGZvciBoYXZpbmcgZm9sbG93ZXJcbiAgICAgIHRvcGljQ3RybC51c2Vycy5nZXRQcm9maWxlKGZvbGxvd191aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYoZm9sbG93X3VpZCkuY2hpbGQoJ3N0YXQvZm9sbG93ZXIvY291bnQnKVxuICAgICAgICAgIC5zZXQoZGF0YS5zdGF0LmZvbGxvd2VyLmNvdW50ICsgMSk7XG5cbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYoZm9sbG93X3VpZCkuY2hpbGQoJ3N0YXQvZm9sbG93ZXIvdWlkLycrIHRvcGljQ3RybC51aWQpXG4gICAgICAgICAgLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XG4gICAgICB9KTtcblxuICAgICAgLy9VcGRhdGUgdGhlIHBlcnNvbiB0aGF0IGlzIGZvbGxvd2luZywgY3JlZGl0IHRoZW0gZm9yIGhhdmluZyBmb2xsb3dpbmdcbiAgICAgIHRvcGljQ3RybC51c2Vycy5nZXRQcm9maWxlKHRvcGljQ3RybC51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWNDdHJsLnVpZCkuY2hpbGQoJ3N0YXQvZm9sbG93aW5nL2NvdW50JylcbiAgICAgICAgICAuc2V0KGRhdGEuc3RhdC5mb2xsb3dlci5jb3VudCArIDEpO1xuXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2luZy91aWQvJysgZm9sbG93X3VpZClcbiAgICAgICAgICAucHVzaCgpLnNldChtb21lbnQoKS50b0lTT1N0cmluZygpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy9VbmZvbGxvdyBVc2VyXG4gICAgdG9waWNDdHJsLnVuZm9sbG93VXNlciA9IGZ1bmN0aW9uKGZvbGxvd191aWQpe1xuXG4gICAgICAvL1VwZGF0ZSB0aGUgcGVyc29uIHRoYXQgYmVpbmcgZm9sbG93LCBjcmVkaXQgdGhlbSBmb3IgaGF2aW5nIGZvbGxvd2VyXG4gICAgICB0b3BpY0N0cmwudXNlcnMuZ2V0UHJvZmlsZShmb2xsb3dfdWlkKS4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKGZvbGxvd191aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2VyL2NvdW50JylcbiAgICAgICAgICAuc2V0KGRhdGEuc3RhdC5mb2xsb3dlci5jb3VudCAtIDEpO1xuXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKGZvbGxvd191aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2VyL3VpZC8nKyB0b3BpY0N0cmwudWlkKS5yZW1vdmUoKTtcbiAgICAgIH0pO1xuXG4gICAgICAvL1VwZGF0ZSB0aGUgcGVyc29uIHRoYXQgaXMgZm9sbG93aW5nLCBjcmVkaXQgdGhlbSBmb3IgaGF2aW5nIGZvbGxvd2luZ1xuICAgICAgdG9waWNDdHJsLnVzZXJzLmdldFByb2ZpbGUodG9waWNDdHJsLnVpZCkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpY0N0cmwudWlkKS5jaGlsZCgnc3RhdC9mb2xsb3dpbmcvY291bnQnKVxuICAgICAgICAgIC5zZXQoZGF0YS5zdGF0LmZvbGxvd2luZy5jb3VudCAtIDEpO1xuXG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljQ3RybC51aWQpLmNoaWxkKCdzdGF0L2ZvbGxvd2luZy91aWQvJysgZm9sbG93X3VpZCkucmVtb3ZlKCk7XG4gICAgICB9KTtcblxuICAgIH1cblxuXG5cbiAgICAgLy91cHZvdGVcbiAgICB0b3BpY0N0cmwudXB2b3RlID0gZnVuY3Rpb24odG9waWMpe1xuXG4gICAgICBpZih0b3BpYy5kb3dudm90ZXMgIT0gdW5kZWZpbmVkICYmIHRvcGljLmRvd252b3Rlc1t0b3BpY0N0cmwudWlkXSAhPSB1bmRlZmluZWQpe1xuICAgICAgICB0b3BpY0N0cmwuY2FuY2VsRG93bnZvdGUodG9waWMpO1xuICAgICAgfVxuICAgICAgdG9waWNDdHJsLnRvcGljcy51cHZvdGVUb3BpYyh0b3BpYy4kaWQsIHRvcGljQ3RybC51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgdG9waWNDdHJsLnVzZXJVcHZvdGVkVG9waWNzLmNoaWxkKHRvcGljLiRpZCkuc2V0KHZhbHVlLiR2YWx1ZSk7XG5cbiAgICAgICAgLy9TdGF0IHVwZGF0ZVxuICAgICAgICB0b3BpY0N0cmwudXNlcnMuZ2V0UHJvZmlsZSh0b3BpYy51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgdG9waWNDdHJsLnVzZXJzLnVzZXJSZWYodG9waWMudWlkKS5jaGlsZCgnc3RhdC91cHZvdGVkL2NvdW50JylcbiAgICAgICAgICAuc2V0KGRhdGEuc3RhdC51cHZvdGVkLmNvdW50ICsgMSk7XG4gICAgICAgIHRvcGljQ3RybC51c2Vycy51c2VyUmVmKHRvcGljLnVpZCkuY2hpbGQoJ3N0YXQvdXB2b3RlZC90b3BpY3MvJyt0b3BpYy4kaWQpXG4gICAgICAgICAgLnB1c2goKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdG9waWNDdHJsLmNhbmNlbFVwdm90ZSA9IGZ1bmN0aW9uKHRvcGljKXtcbiAgICAgIHRvcGljQ3RybC50b3BpY3MudW5kb1Vwdm90ZSh0b3BpYy4kaWQsIHRvcGljQ3RybC51aWQpO1xuXG4gICAgICB0b3BpY0N0cmwudXNlcnMuZ2V0UHJvZmlsZSh0b3BpYy51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgLy9TdGF0IHVwZGF0ZVxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpYy51aWQpLmNoaWxkKCdzdGF0L3Vwdm90ZWQvY291bnQnKVxuICAgICAgICAgIC5zZXQoZGF0YS5zdGF0LnVwdm90ZWQuY291bnQgLSAxKTtcblxuICAgICAgICB0b3BpY0N0cmwudXNlcnMudXNlclJlZih0b3BpYy51aWQpLmNoaWxkKCdzdGF0L3Vwdm90ZWQvdG9waWNzLycrdG9waWMuJGlkKS5yZW1vdmUoKTtcbiAgICAgIH0pO1xuXG5cbiAgICAgIHRvcGljQ3RybC51c2VyVXB2b3RlZFRvcGljcy5jaGlsZCh0b3BpYy4kaWQpLnJlbW92ZShmdW5jdGlvbihlcnJvcil7XG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6XCIsIGVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZW1vdmVkIHN1Y2Nlc3NmdWxseSFcIik7XG4gICAgICAgICAgfX0pO1xuICAgIH07XG5cbiAgICAvL2Rvd252b3RlXG4gICAgdG9waWNDdHJsLmRvd252b3RlID0gZnVuY3Rpb24odG9waWMpe1xuICAgICAgaWYodG9waWMudXB2b3RlcyAhPSB1bmRlZmluZWQgJiYgdG9waWMudXB2b3Rlc1t0b3BpY0N0cmwudWlkXSAhPSB1bmRlZmluZWQpe1xuICAgICAgICB0b3BpY0N0cmwuY2FuY2VsVXB2b3RlKHRvcGljKTtcbiAgICAgIH1cbiAgICAgIHRvcGljQ3RybC50b3BpY3MuZG93bnZvdGVUb3BpYyh0b3BpYy4kaWQsIHRvcGljQ3RybC51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgdG9waWNDdHJsLnVzZXJEb3dudm90ZWRUb3BpY3MuY2hpbGQodG9waWMuJGlkKS5zZXQodmFsdWUuJHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0b3BpY0N0cmwuY2FuY2VsRG93bnZvdGUgPSBmdW5jdGlvbih0b3BpYyl7XG4gICAgICB0b3BpY0N0cmwudG9waWNzLnVuZG9Eb3dudm90ZSh0b3BpYy4kaWQsIHRvcGljQ3RybC51aWQpO1xuICAgICAgdG9waWNDdHJsLnVzZXJEb3dudm90ZWRUb3BpY3MuY2hpbGQodG9waWMuJGlkKS5yZW1vdmUoZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOlwiLCBlcnJvcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVtb3ZlZCBzdWNjZXNzZnVsbHkhXCIpO1xuICAgICAgICAgIH19KTtcbiAgICB9O1xuXG4gICAgLy9mb2xsb3cgdG9waWNcbiAgICB0b3BpY0N0cmwuZm9sbG93VG9waWMgPSBmdW5jdGlvbih0b3BpYyl7XG4gICAgICB0b3BpY0N0cmwudG9waWNzLmZvbGxvdyh0b3BpYy4kaWQsIHRvcGljQ3RybC51aWQpLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgdG9waWNDdHJsLnVzZXJGb2xsb3dpbmcuY2hpbGQodG9waWMuJGlkKS5zZXQodmFsdWUuaGlzdG9yeVt0b3BpY0N0cmwudWlkXSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdG9waWNDdHJsLnVuZm9sbG93VG9waWMgPSBmdW5jdGlvbih0b3BpYyl7XG4gICAgICB0b3BpY0N0cmwudG9waWNzLnVuZm9sbG93KHRvcGljLiRpZCwgdG9waWNDdHJsLnVpZCk7XG4gICAgICB0b3BpY0N0cmwudXNlckZvbGxvd2luZy5jaGlsZCh0b3BpYy4kaWQpLnJlbW92ZShmdW5jdGlvbihlcnJvcil7XG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6XCIsIGVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZW1vdmVkIHN1Y2Nlc3NmdWxseSFcIik7XG4gICAgICAgICAgfX0pO1xuICAgIH07XG5cbiAgfSk7XG5cblxuLy9odHRwczovL2dpc3QuZ2l0aHViLmNvbS9rYXRvd3VsZi82MDk5MDQyXG5mdW5jdGlvbiBtb3ZlRmJSZWNvcmQob2xkUmVmLCBuZXdSZWYpIHtcbiAgb2xkUmVmLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24gKHNuYXApIHtcbiAgICBuZXdSZWYuc2V0KHNuYXAudmFsKCksIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICBvbGRSZWYucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICh0eXBlb2YoY29uc29sZSkgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXG4gIC8vIFRvcGljIGxpc3RcbiAgLmZhY3RvcnkoJ1RvcGljcycsIGZ1bmN0aW9uICgkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5LCBGaXJlYmFzZVVybCkge1xuICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwgKyAndG9waWNzJylcbiAgICB2YXIgdG9waWNzID0gJGZpcmViYXNlT2JqZWN0KHJlZilcbiAgICB2YXIgdG9waWNzQXJyID0gJGZpcmViYXNlQXJyYXkocmVmKVxuICAgIHZhciB0b3BpY0tleSA9ICcnXG5cbiAgICB2YXIgVG9waWNzID0ge1xuICAgICAgLy8gR2V0IHRvcGljIHRhZ1xuICAgICAgZ2V0VGFnOiBmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYub3JkZXJCeUNoaWxkKCd0YWdzJykuZXF1YWxUbyh0YWcpKVxuICAgICAgfSxcblxuICAgICAgLy8gR2V0IHRvcGljIHNsdWdcbiAgICAgIGdldFNsdWc6IGZ1bmN0aW9uIChzbHVnKSB7XG4gICAgICAgIHZhciBkYXRhID0gcmVmLm9yZGVyQnlDaGlsZCgnc2x1ZycpLmVxdWFsVG8oc2x1ZylcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KGRhdGEpXG4gICAgICB9LFxuXG4gICAgICAvLyBHZXR0aW5nIHRoZSBsaXN0IG9mIHRvcGljcyBjcmVhdGVkIGJ5IHVzZXJfaWRcbiAgICAgIGNyZWF0ZWRCeTogZnVuY3Rpb24gKHVpZCkge1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLm9yZGVyQnlDaGlsZCgndWlkJykuZXF1YWxUbyh1aWQpKVxuXG4gICAgICB9LFxuICAgICAgcmVmQ2hpbGQ6IGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKGNoaWxkKVxuICAgICAgfSxcbiAgICAgIGNvdW50VXNlclRvcGljczogZnVuY3Rpb24gKCkge30sXG5cbiAgICAgIC8vIEdldHRpbmcgdGhlIGxpc3Qgb2YgdG9waWMgYmFzZSBvbiBjYXRlZ29yeVxuICAgICAgbGlzdDogZnVuY3Rpb24gKGNhdGVnb3J5KSB7XG4gICAgICAgIHZhciBkYXRhID0gcmVmLm9yZGVyQnlDaGlsZCgnY2F0ZWdvcnknKS5lcXVhbFRvKGNhdGVnb3J5KVxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkoZGF0YSlcbiAgICAgIH0sXG5cbiAgICAgIG5hbWU6IGZ1bmN0aW9uICh0b3BpY19zbHVnKSB7XG4gICAgICAgIHZhciBkYXRhID0gcmVmLm9yZGVyQnlDaGlsZCgnc2x1ZycpLmVxdWFsVG8odG9waWNfc2x1ZylcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChkYXRhKVxuICAgICAgfSxcblxuICAgICAgLy8gUmV0dXJuIHRvcGljIGRldGFpbHMgaW4gUmVmXG4gICAgICBmb3J0b3BpY1JlZjogZnVuY3Rpb24gKHRvcGljX3NsdWcpIHtcbiAgICAgICAgcmV0dXJuIHJlZi5vcmRlckJ5Q2hpbGQoJ3NsdWcnKS5lcXVhbFRvKHRvcGljX3NsdWcpXG4gICAgICB9LFxuXG4gICAgICBnZXRUb3BpY0J5S2V5OiBmdW5jdGlvbiAodG9waWNfa2V5KSB7XG4gICAgICAgIHJldHVybiBuZXcgRmlyZWJhc2UoRmlyZWJhc2VVcmwgKyAndG9waWNzLycgKyB0b3BpY19rZXkpXG4gICAgICB9LFxuXG4gICAgICBnZXRUb3BpY0J5U2x1ZzogZnVuY3Rpb24gKHRvcGljX3NsdWcpIHtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5vcmRlckJ5Q2hpbGQoJ3NsdWcnKS5lcXVhbFRvKHRvcGljX3NsdWcpLmxpbWl0VG9GaXJzdCgxKSlcbiAgICAgIH0sXG5cbiAgICAgIGluY3JlbWVudFZpZXc6IGZ1bmN0aW9uICh0b3BpY19zbHVnKSB7fSxcblxuICAgICAgLy8gUmV0dXJuIHRvcGljIGRldGFpbHMgaW4gYXJyYXlcbiAgICAgIGZvcnRvcGljOiBmdW5jdGlvbiAodG9waWNfc2x1Zykge1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkoVG9waWNzLmZvcnRvcGljUmVmKHRvcGljX3NsdWcpKVxuICAgICAgfSxcblxuICAgICAgLy8gUmVwbHkgbGlzdGluZ1xuICAgICAgcmVwbHlMaXN0OiBmdW5jdGlvbiAodG9waWNJZCkge1xuICAgICAgICB2YXIgZGF0YSA9IHJlZi5jaGlsZCh0b3BpY0lkICsgJy9yZXBsaWVzJylcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KGRhdGEpXG4gICAgICB9LFxuXG4gICAgICAvLyBSZXBseSBBcnJheVxuICAgICAgcmVwbHlBcnI6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQodG9waWNJZCArICcvcmVwbGllcycpKVxuICAgICAgfSxcblxuICAgICAgLy8gUmVwbHkgY291bnRcbiAgICAgIHJlcGx5Q291bnQ6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL3JlcGxpZXMvJykpXG4gICAgICB9LFxuICAgICAgcmVwbHlDb3VudFJlZjogZnVuY3Rpb24gKHRvcGljSWQpIHtcbiAgICAgICAgcmV0dXJuIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9yZXBsaWVzL2NvdW50JylcbiAgICAgIH0sXG5cbiAgICAgIHJlcGx5SW5SZXBseTogZnVuY3Rpb24gKHRvcGljSWQsIHJlcGx5SWQpIHtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9yZXBsaWVzLycgKyByZXBseUlkICsgJy9pblJlcGx5JykpXG4gICAgICB9LFxuXG4gICAgICAvLyBSZXBseSBpbiBSZXBseSBBcnJheVxuICAgICAgcmVwbHlJblJlcGx5QXJyOiBmdW5jdGlvbiAodG9waWNJZCwgcmVwbHlJZCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQodG9waWNJZCArICcvcmVwbGllcy8nK3JlcGx5SWQrJy9pblJlcGx5JykpKVxuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKHRvcGljSWQgKyAnL3JlcGxpZXMvJyArIHJlcGx5SWQgKyAnL2luUmVwbHknKSlcbiAgICAgIH0sXG5cbiAgICAgIC8vIHVwdm90ZXNcbiAgICAgIGdldFVwdm90ZXM6IGZ1bmN0aW9uICh0b3BpY0lkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmVmOiByZWYuY2hpbGQodG9waWNJZCArICcvdXB2b3RlcycpLFxuICAgICAgICAgIGFycmF5OiAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQodG9waWNJZCArICcvdXB2b3RlcycpKVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBkb3dudm90ZXNcbiAgICAgIGdldERvd252b3RlczogZnVuY3Rpb24gKHRvcGljSWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZWY6IHJlZi5jaGlsZCh0b3BpY0lkICsgJy9kb3dudm90ZXMnKSxcbiAgICAgICAgICBhcnJheTogJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKHRvcGljSWQgKyAnL2Rvd252b3RlcycpKVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBmb2xsb3dlcnNcbiAgICAgIGdldEZvbGxvd2VyczogZnVuY3Rpb24gKHRvcGljSWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZWY6IHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKSxcbiAgICAgICAgICBvYmo6ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQodG9waWNJZCArICcvZm9sbG93ZXJzJykpXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIHVwdm90ZVRvcGljOiBmdW5jdGlvbiAodG9waWNJZCwgdWlkKSB7XG4gICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy91cHZvdGVzJykuY2hpbGQodWlkKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSlcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQodG9waWNJZCArICcvdXB2b3RlcycpLmNoaWxkKHVpZCkpXG4gICAgICB9LFxuXG4gICAgICB1bmRvVXB2b3RlOiBmdW5jdGlvbiAodG9waWNJZCwgdWlkKSB7XG4gICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy91cHZvdGVzJykuY2hpbGQodWlkKS5yZW1vdmUoZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3I6JywgZXJyb3IpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZW1vdmVkIHN1Y2Nlc3NmdWxseSEnKVxuICAgICAgICAgIH19KVxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKHRvcGljSWQgKyAnL3Vwdm90ZXMnKVxuICAgICAgfSxcblxuICAgICAgZG93bnZvdGVUb3BpYzogZnVuY3Rpb24gKHRvcGljSWQsIHVpZCkge1xuICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvZG93bnZvdGVzJykuY2hpbGQodWlkKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSlcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQodG9waWNJZCArICcvZG93bnZvdGVzJykuY2hpbGQodWlkKSlcbiAgICAgIH0sXG5cbiAgICAgIHVuZG9Eb3dudm90ZTogZnVuY3Rpb24gKHRvcGljSWQsIHVpZCkge1xuICAgICAgICByZWYuY2hpbGQodG9waWNJZCArICcvZG93bnZvdGVzJykuY2hpbGQodWlkKS5yZW1vdmUoZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3I6JywgZXJyb3IpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZW1vdmVkIHN1Y2Nlc3NmdWxseSEnKVxuICAgICAgICAgIH19KVxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKHRvcGljSWQgKyAnL2Rvd252b3RlcycpXG4gICAgICB9LFxuXG4gICAgICBmb2xsb3c6IGZ1bmN0aW9uICh0b3BpY0lkLCB1aWQpIHtcbiAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLmNoaWxkKCdoaXN0b3J5JykuY2hpbGQodWlkKS5zZXQobW9tZW50KCkudG9JU09TdHJpbmcoKSlcbiAgICAgICAgJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKS5jaGlsZCgnY291bnQnKSkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICBpZiAoZGF0YS52YWx1ZSA9PT0gbnVsbCB8fCBkYXRhLnZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKS5jaGlsZCgnY291bnQnKS5zZXQoMSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLmNoaWxkKCdjb3VudCcpLnNldChkYXRhLiR2YWx1ZSArIDEpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpKVxuICAgICAgfSxcblxuICAgICAgdW5mb2xsb3c6IGZ1bmN0aW9uICh0b3BpY0lkLCB1aWQpIHtcbiAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLmNoaWxkKCdoaXN0b3J5JykuY2hpbGQodWlkKS5yZW1vdmUoZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3I6JywgZXJyb3IpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZW1vdmVkIHN1Y2Nlc3NmdWxseSEnKVxuICAgICAgICAgICAgJGZpcmViYXNlT2JqZWN0KHJlZi5jaGlsZCh0b3BpY0lkICsgJy9mb2xsb3dlcnMnKS5jaGlsZCgnY291bnQnKSkuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgcmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpLmNoaWxkKCdjb3VudCcpLnNldChkYXRhLiR2YWx1ZSAtIDEpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH19KVxuICAgICAgICByZXR1cm4gcmVmLmNoaWxkKHRvcGljSWQgKyAnL2ZvbGxvd2VycycpXG4gICAgICB9LFxuXG4gICAgICBnZXRWaWV3czogZnVuY3Rpb24gKHRvcGljSWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZWY6IHJlZi5jaGlsZCh0b3BpY0lkKS5jaGlsZCgndmlld3MnKSxcbiAgICAgICAgICBvYmo6ICRmaXJlYmFzZU9iamVjdChyZWYuY2hpbGQodG9waWNJZCkuY2hpbGQoJ3ZpZXdzJykpXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGxhdGVzdEZlZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5vcmRlckJ5Q2hpbGQoJ2NyZWF0ZWQnKS5saW1pdFRvTGFzdCgxMCkpXG4gICAgICB9LFxuXG4gICAgICB0b3BpY3NCeVRhZzogZnVuY3Rpb24gKHRhZykge1xuICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLm9yZGVyQnlDaGlsZCgndGFncycpLmVxdWFsVG8odGFnKSlcbiAgICAgIH0sXG5cbiAgICAgIC8vIFJldHVybiBhcnJheVxuICAgICAgYXJyOiAkZmlyZWJhc2VBcnJheShyZWYpLFxuXG4gICAgICBhbGw6IHRvcGljcyxcbiAgICAgIHJlZjogcmVmXG4gICAgfTtcblxuICAgIHJldHVybiBUb3BpY3NcblxuICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuY29udHJvbGxlcignUHJvZmlsZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRzdGF0ZSwgJGZpbHRlciwgbWQ1LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1NlcnZpY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF1dGgsVXNlcnMsVG9waWNzLCBGYWNlYm9vayxub3RpZnksQ2F0ZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vUmVzb2x2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlLGlzT3duZXIsdXNlclBvc3RzKXtcbiAgICB2YXIgcHJvZmlsZUN0cmwgPSB0aGlzO1xuXG4gICAgLy9QYXJzZXJcbiAgICBwcm9maWxlQ3RybC5wcm9maWxlICAgPSBwcm9maWxlO1xuICAgIHByb2ZpbGVDdHJsLmF1dGggICAgICA9IEF1dGg7XG4gICAgcHJvZmlsZUN0cmwudXNlcnMgICAgID0gVXNlcnM7XG4gICAgcHJvZmlsZUN0cmwudG9waWNzICAgID0gVG9waWNzO1xuICAgIHByb2ZpbGVDdHJsLmZhY2Vib29rICA9IEZhY2Vib29rO1xuICAgIHByb2ZpbGVDdHJsLmlzT3duZXIgICA9IGlzT3duZXI7XG4gICAgcHJvZmlsZUN0cmwuY2F0ZSAgICAgID0gQ2F0ZVNlcnZpY2U7XG4gICAgcHJvZmlsZUN0cmwuJHN0YXRlICAgID0gJHN0YXRlO1xuICAgIHByb2ZpbGVDdHJsLnVzZXJQb3N0cyA9IHVzZXJQb3N0cztcblxuICAgIHByb2ZpbGVDdHJsLmZlZWQgPSAnJztcbiAgICBwcm9maWxlQ3RybC5lZGl0SW5pdCA9ICd1c2VyRWRpdCc7XG5cbiAgICBwcm9maWxlQ3RybC5uYW1lRXhpc3Q9IGZhbHNlO1xuXG5cbiAgICBwcm9maWxlQ3RybC5nZXRVc2VyUG9zdCA9IGZ1bmN0aW9uKHVpZCl7XG4gICAgICBwcm9maWxlQ3RybC5mZWVkID0gcHJvZmlsZUN0cmwudG9waWNzLmNyZWF0ZWRCeSh1aWQpO1xuICAgIH1cblxuXG5cbiAgICAvKkxpbmsgYWNjb3VudCB3aXRoIGZhY2Vib29rKi9cbiAgICBwcm9maWxlQ3RybC5saW5rRmFjZWJvb2sgPSBmdW5jdGlvbigpe1xuICAgICAgcHJvZmlsZUN0cmwuZmFjZWJvb2subG9naW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgcHJvZmlsZUN0cmwuZmFjZWJvb2suZ2V0TG9naW5TdGF0dXMoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gJ2Nvbm5lY3RlZCcpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2dnZWRJbiA9IHRydWU7XG4gICAgICAgICAgICBwcm9maWxlQ3RybC5mYWNlYm9vay5hcGkoJy9tZScsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm90IGxvZ2dlZCBpblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvL1RoZSBvcmlnaW5hbCB2YWx1ZSBmcm9tIHByb2ZpbGVcbiAgICBwcm9maWxlQ3RybC5vbGRQcm9maWxlVmFsdWUgPSBwcm9maWxlQ3RybC5wcm9maWxlO1xuXG5cbiAgICBwcm9maWxlQ3RybC51c2VyQ3JlYXRlZCA9IGZ1bmN0aW9uKHVpZCl7XG4gICAgICByZXR1cm4gcHJvZmlsZUN0cmwudG9waWNzLmNyZWF0ZWRCeSh1aWQpO1xuICAgIH1cblxuXG4gICAgLy9QcmVzZXQgUGFyYW1ldGVyc1xuICAgIHByb2ZpbGVDdHJsLmltYWdlU3RyaW5ncyAgICA9IFtdO1xuICAgIHByb2ZpbGVDdHJsLnVzZXJDYXRlRm9sbG93ICA9IFtdO1xuICAgIHByb2ZpbGVDdHJsLmNhdGVJc0ZvbGxvdyAgICA9IFtdO1xuICAgIHByb2ZpbGVDdHJsLmZvbGxvd0xpc3QgICAgICA9ICcnO1xuXG5cblxuXG5cbiAgICBwcm9maWxlQ3RybC5mb2xsb3dDYXRlTGlzdEFyciA9IGZ1bmN0aW9uKHVpZCl7XG4gICAgICBwcm9maWxlQ3RybC5mb2xsb3dMaXN0ID0gcHJvZmlsZUN0cmwuY2F0ZS5mb2xsb3dMaXN0KHVpZCk7XG4gICAgfVxuXG4gICAgaWYoQXV0aC5yZWYuZ2V0QXV0aCgpKXtcbiAgICAgIHByb2ZpbGVDdHJsLmZvbGxvd0NhdGVMaXN0QXJyKEF1dGgucmVmLmdldEF1dGgoKS51aWQpO1xuICAgIH1cblxuICAgIHByb2ZpbGVDdHJsLmZvbGxvd0NhdGUgPSBmdW5jdGlvbihpbmRleCxjYXRlX3NsdWcpe1xuICAgICAgcHJvZmlsZUN0cmwuY2F0ZUlzRm9sbG93W2luZGV4XSAgPSB0cnVlO1xuICAgICAgcHJvZmlsZUN0cmwuY2F0ZS5hZGRDaGlsZChjYXRlX3NsdWcrJy9mb2xsb3dlcicpXG4gICAgICAgIC5jaGlsZChBdXRoLnJlZi5nZXRBdXRoKCkudWlkKS5wdXNoKCkuc2V0KG1vbWVudCgpLnRvSVNPU3RyaW5nKCkpO1xuICAgIH1cblxuXG5cblxuXG4gICAgLy9VcGxvYWQgUHJvZmlsZSBpbWFnZVxuICAgIHByb2ZpbGVDdHJsLnVwbG9hZEZpbGUgPSBmdW5jdGlvbihmaWxlcykge1xuICAgICAgYW5ndWxhci5mb3JFYWNoKGZpbGVzLCBmdW5jdGlvbiAoZmxvd0ZpbGUsIGkpIHtcbiAgICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgIHZhciB1cmkgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgIHByb2ZpbGVDdHJsLmltYWdlU3RyaW5nc1tpXSA9IHVyaTtcbiAgICAgICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnVwZGF0ZSh7XCJwaG90b1wiOiB1cml9KVxuICAgICAgICAgIG5vdGlmeSh7bWVzc2FnZTonU2F2ZWQnLHBvc2l0aW9uOidjZW50ZXInLGR1cmF0aW9uOiAzMDAwIH0pO1xuICAgICAgICB9O1xuICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0RhdGFVUkwoZmxvd0ZpbGUuZmlsZSk7XG4gICAgICB9KVxuICAgIH07XG5cblxuICAgIC8vU2F2ZSBwcm9maWxlIHdpdGggcHJvZmlsZUN0cmwucHJvZmlsZVxuICAgIC8vcGFyYW1zOiByZWRpcmVjdCwgaWYgZXhpc3QgdGhlbiByZWRpcmVjdCBhZnRlciBzYXZlXG4gICAgcHJvZmlsZUN0cmwuc2F2ZVByb2ZpbGUgPSBmdW5jdGlvbihyZWRpcmVjdCl7XG4gICAgICBwcm9maWxlQ3RybC5wcm9maWxlLnVwZGF0ZWQgPSBtb21lbnQoKS50b0lTT1N0cmluZygpO1xuXG5cbiAgICAgIGlmKHByb2ZpbGVDdHJsLmxvY2F0aW9uICE9PSBudWxsICkge1xuICAgICAgICBsb2NhdGlvbkRldGFpbCA9IHtcbiAgICAgICAgICBwbGFjZV9pZDogcHJvZmlsZUN0cmwubG9jYXRpb24uZGV0YWlscy5wbGFjZV9pZCxcbiAgICAgICAgICBuYW1lOiBwcm9maWxlQ3RybC5sb2NhdGlvbi5kZXRhaWxzLm5hbWUsXG4gICAgICAgICAgYWRkcmVzczogcHJvZmlsZUN0cmwubG9jYXRpb24uZGV0YWlscy5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICBsYXQ6IHByb2ZpbGVDdHJsLmxvY2F0aW9uLmRldGFpbHMuZ2VvbWV0cnkubG9jYXRpb24ubGF0KCksXG4gICAgICAgICAgbG5nOiBwcm9maWxlQ3RybC5sb2NhdGlvbi5kZXRhaWxzLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxuICAgICAgICB9XG5cbiAgICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS51c2VyTG9jYXRpb24gPSBsb2NhdGlvbkRldGFpbDtcbiAgICAgIH1cblxuICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS4kc2F2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vdGlmeSh7bWVzc2FnZTonU2F2ZWQnLHBvc2l0aW9uOidjZW50ZXInLGR1cmF0aW9uOiAzMDAwIH0pO1xuICAgICAgICBpZihyZWRpcmVjdCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAkc3RhdGUuZ28ocmVkaXJlY3QpO1xuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuICAgICAgICBub3RpZnkoe21lc3NhZ2U6J0Vycm9yIHNhdmluZyBkYXRhJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy9VcGRhdGUgbmFtZVxuICAgIHByb2ZpbGVDdHJsLnVwZGF0ZU5hbWUgPSBmdW5jdGlvbigpe1xuXG4gICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnVwZGF0ZShcbiAgICAgICAge1xuICAgICAgICAgIFwiZmlyc3RuYW1lXCI6ICBwcm9maWxlQ3RybC5wcm9maWxlLmZpcnN0bmFtZSxcbiAgICAgICAgICBcImxhc3RuYW1lXCI6ICAgcHJvZmlsZUN0cmwucHJvZmlsZS5sYXN0bmFtZSxcbiAgICAgICAgfVxuICAgICAgKVxuXG4gICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQrJy9sb2cnKS5wdXNoKCkuc2V0KHtcbiAgICAgICAgYWN0aW9uOiAgIFwibmFtZV9jaGFuZ2VcIixcbiAgICAgICAgb2xkbmFtZTogIHByb2ZpbGVDdHJsLm9sZFByb2ZpbGVWYWx1ZS5maXJzdG5hbWUgKyBcIi1cIiArIHByb2ZpbGVDdHJsLm9sZFByb2ZpbGVWYWx1ZS5sYXN0bmFtZSxcbiAgICAgICAgY3JlYXRlZDogIG1vbWVudCgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH0pO1xuXG4gICAgICBub3RpZnkoe21lc3NhZ2U6J1NhdmVkJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICB9XG5cblxuICAgIC8vVXBkYXRlIEJpb1xuICAgIHByb2ZpbGVDdHJsLnVwZGF0ZUJpbyA9IGZ1bmN0aW9uKCl7XG4gICAgICBwcm9maWxlQ3RybC51c2Vycy51c2VyQXJyUmVmKEF1dGgucmVmLmdldEF1dGgoKS51aWQpLnVwZGF0ZSh7XCJiaW9ncmFwaHlcIjogcHJvZmlsZUN0cmwucHJvZmlsZS5iaW9ncmFwaHl9KVxuXG4gICAgICBub3RpZnkoe21lc3NhZ2U6J1NhdmVkJyxwb3NpdGlvbjonY2VudGVyJyxkdXJhdGlvbjogMzAwMCB9KTtcbiAgICB9XG5cblxuICAgIHByb2ZpbGVDdHJsLnVwZGF0ZVByb2ZpbGUgPSBmdW5jdGlvbigpe1xuICAgICAgLy9wcm9maWxlQ3RybC5wcm9maWxlLmVtYWlsSGFzaCA9IG1kNS5jcmVhdGVIYXNoKGF1dGgucGFzc3dvcmQuZW1haWwpO1xuICAgICAgcHJvZmlsZUN0cmwucHJvZmlsZS4kc2F2ZSgpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQnKTtcbiAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIC8vQ2hlY2sgaWYgdXNlciBleGlzdCwgcmV0dXJuIGZhbHNlIGlmIHRoZXkgZG9cbiAgICBwcm9maWxlQ3RybC5jaGVja1VzZXJuYW1lID0gZnVuY3Rpb24oKXtcblxuICAgICAgcHJvZmlsZUN0cmwudXNlcnMuY2hlY2tVc2VybmFtZUV4aXN0KHByb2ZpbGVDdHJsLnByb2ZpbGUuZGlzcGxheU5hbWUpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcHNob3QpIHtcbiAgICAgICAgaWYoc25hcHNob3QudmFsKCkgIT09IG51bGwpe1xuICAgICAgICAgIHJldHVybiBwcm9maWxlQ3RybC5uYW1lRXhpc3Q9dHJ1ZTtcbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgIHJldHVybiBwcm9maWxlQ3RybC5uYW1lRXhpc3Q9ZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdBcHAnKVxuICAuZmFjdG9yeSgnVXNlcnMnLCBmdW5jdGlvbiAoJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgRmlyZWJhc2VVcmwsICRodHRwKSB7XG4gICAgdmFyIHVzZXJzUmVmID0gbmV3IEZpcmViYXNlKEZpcmViYXNlVXJsICsgJ3VzZXJzJylcbiAgICB2YXIgdXNlcnMgPSAkZmlyZWJhc2VBcnJheSh1c2Vyc1JlZilcblxuICAgIHZhciBVc2VycyA9IHtcbiAgICAgIGdldExvY2F0aW9uSVA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgICB1cmw6ICdodHRwOi8vaXBpbmZvLmlvL2pzb24nLFxuICAgICAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICAgICAgfSlcbiAgICAgIH0sXG5cbiAgICAgIGdldExvY2F0aW9uSVBEYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgICAgdXJsOiAnaHR0cDovL2lwaW5mby5pby9qc29uJyxcbiAgICAgICAgICBtZXRob2Q6ICdHRVQnXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gZGF0YS5kYXRhXG4gICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICBwcm9maWxlOiBmdW5jdGlvbih1aWQpe1xuICAgICAgICByZXR1cm4gdXNlcnMuJGdldFJlY29yZCh1aWQpO1xuICAgICAgfSxcblxuXG4gICAgICAvL1NlYXJjaCBhbmQgcmV0dXJuIHVzZXJuYW1lXG4gICAgICBnZXRQcm9maWxlQnlVc2VybmFtZTpmdW5jdGlvbih1c2VybmFtZSl7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheSh1c2Vyc1JlZi5vcmRlckJ5Q2hpbGQoJ2Rpc3BsYXlOYW1lJykuZXF1YWxUbyh1c2VybmFtZSkpO1xuICAgICAgfSxcblxuICAgICAgLy9DaGVjayBpZiB1c2VybmFtZSBleGlzdCwgaWYgbm90IHJldHVybiBudWxsXG4gICAgICBjaGVja1VzZXJuYW1lRXhpc3Q6ZnVuY3Rpb24odXNlcm5hbWUpe1xuICAgICAgICByZXR1cm4gdXNlcnNSZWYub3JkZXJCeUNoaWxkKCdkaXNwbGF5TmFtZScpLmVxdWFsVG8odXNlcm5hbWUpO1xuICAgICAgfSxcblxuXG4gICAgICBnZXRQcm9maWxlOiBmdW5jdGlvbiAodWlkKSB7XG4gICAgICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3QodXNlcnNSZWYuY2hpbGQodWlkKSlcbiAgICAgIH0sXG5cbiAgICAgIGdldERpc3BsYXlOYW1lOiBmdW5jdGlvbiAodWlkKSB7XG4gICAgICAgIGlmICh1aWQgIT09IG51bGwgfHwgdWlkICE9PSAnJykge1xuICAgICAgICAgIHJldHVybiB1c2Vycy4kZ2V0UmVjb3JkKHVpZCkuZGlzcGxheU5hbWU7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vR2V0IHVzZXIgRm9sbG93ZXJzXG4gICAgICBnZXRGb2xsb3dlcjpmdW5jdGlvbih1aWQpe1xuICAgICAgICByZXR1cm4gdXNlcnNSZWYuY2hpbGQodWlkKycvc3RhdC9mb2xsb3dlci91aWQnKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vQ2hlY2sgaWYgdXNlciBpcyBhbHJlYWR5IGZvbGxvd2luZ1xuICAgICAgY2hlY2tGb2xsb3c6ZnVuY3Rpb24odWlkLGZvbGxvd19pZCl7XG5cbiAgICAgICAgdmFyIGZvbGxvdz1mYWxzZTtcbiAgICAgICAgdmFyIHJlZiAgICA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCsndXNlcnMvJyt1aWQrJy9zdGF0L2ZvbGxvd2luZy91aWQvJytmb2xsb3dfaWQpO1xuICAgICAgICByZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgICAgZm9sbG93ID0gc25hcHNob3QuZXhpc3RzKCk7XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBmb2xsb3c7XG4gICAgICB9LFxuXG4gICAgICAvL0NoYW5nZSBwYXNzd29yZFxuICAgICAgdXNlckNoYW5nZVBhc3N3b3JkOmZ1bmN0aW9uKGVtYWlsLG9sZHBhc3MsbmV3cGFzcyl7XG5cbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGaXJlYmFzZVVybCk7XG4gICAgICAgIHJlZi5jaGFuZ2VQYXNzd29yZCh7XG4gICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgIG9sZFBhc3N3b3JkOiBvbGRwYXNzLFxuICAgICAgICAgIG5ld1Bhc3N3b3JkOiBuZXdwYXNzXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGVycm9yLmNvZGUpIHtcbiAgICAgICAgICAgICAgY2FzZSBcIklOVkFMSURfUEFTU1dPUkRcIjpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZSBzcGVjaWZpZWQgdXNlciBhY2NvdW50IHBhc3N3b3JkIGlzIGluY29ycmVjdC5cIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgXCJJTlZBTElEX1VTRVJcIjpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZSBzcGVjaWZpZWQgdXNlciBhY2NvdW50IGRvZXMgbm90IGV4aXN0LlwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yIGNoYW5naW5nIHBhc3N3b3JkOlwiLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVXNlciBwYXNzd29yZCBjaGFuZ2VkIHN1Y2Nlc3NmdWxseSFcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIHVzZXJSZWY6IGZ1bmN0aW9uICh1aWQpIHtcbiAgICAgICAgcmV0dXJuIHVzZXJzUmVmLmNoaWxkKHVpZClcbiAgICAgIH0sXG5cbiAgICAgIHVwdm90ZXM6IGZ1bmN0aW9uICh1aWQpIHtcbiAgICAgICAgcmV0dXJuIHVzZXJzUmVmLmNoaWxkKHVpZCkuY2hpbGQoJ3Vwdm90ZXMnKVxuICAgICAgfSxcblxuICAgICAgZG93bnZvdGVzOiBmdW5jdGlvbiAodWlkKSB7XG4gICAgICAgIHJldHVybiB1c2Vyc1JlZi5jaGlsZCh1aWQpLmNoaWxkKCdkb3dudm90ZXMnKVxuICAgICAgfSxcblxuICAgICAgLy9Vc2VyIGZvbGxvd2luZyB0b3BpY1xuICAgICAgZm9sbG93aW5nOiBmdW5jdGlvbiAodWlkKSB7XG4gICAgICAgIHJldHVybiB1c2Vyc1JlZi5jaGlsZCh1aWQpLmNoaWxkKCdmb2xsb3dpbmcnKVxuICAgICAgfSxcblxuICAgICAgdXNlckFyclJlZjogZnVuY3Rpb24gKHVpZCkge1xuICAgICAgICByZXR1cm4gdXNlcnNSZWYuY2hpbGQodWlkKVxuICAgICAgfSxcblxuICAgICAgYWxsOiB1c2Vyc1xuICAgIH1cblxuICAgIHJldHVybiBVc2Vyc1xuICB9KVxuIiwiYW5ndWxhci5tb2R1bGUoJ0FwcCcpXHJcbiAgLmZhY3RvcnkoJ1VuaXF1ZUlER2VuZXJhdG9yJywgZnVuY3Rpb24oKXsgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBGYW5jeSBJRCBnZW5lcmF0b3IgdGhhdCBjcmVhdGVzIDIwLWNoYXJhY3RlciBzdHJpbmcgaWRlbnRpZmllcnMgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XHJcbiAgICAgKlxyXG4gICAgICogMS4gVGhleSdyZSBiYXNlZCBvbiB0aW1lc3RhbXAgc28gdGhhdCB0aGV5IHNvcnQgKmFmdGVyKiBhbnkgZXhpc3RpbmcgaWRzLlxyXG4gICAgICogMi4gVGhleSBjb250YWluIDcyLWJpdHMgb2YgcmFuZG9tIGRhdGEgYWZ0ZXIgdGhlIHRpbWVzdGFtcCBzbyB0aGF0IElEcyB3b24ndCBjb2xsaWRlIHdpdGggb3RoZXIgY2xpZW50cycgSURzLlxyXG4gICAgICogMy4gVGhleSBzb3J0ICpsZXhpY29ncmFwaGljYWxseSogKHNvIHRoZSB0aW1lc3RhbXAgaXMgY29udmVydGVkIHRvIGNoYXJhY3RlcnMgdGhhdCB3aWxsIHNvcnQgcHJvcGVybHkpLlxyXG4gICAgICogNC4gVGhleSdyZSBtb25vdG9uaWNhbGx5IGluY3JlYXNpbmcuICBFdmVuIGlmIHlvdSBnZW5lcmF0ZSBtb3JlIHRoYW4gb25lIGluIHRoZSBzYW1lIHRpbWVzdGFtcCwgdGhlXHJcbiAgICAgKiAgICBsYXR0ZXIgb25lcyB3aWxsIHNvcnQgYWZ0ZXIgdGhlIGZvcm1lciBvbmVzLiAgV2UgZG8gdGhpcyBieSB1c2luZyB0aGUgcHJldmlvdXMgcmFuZG9tIGJpdHNcclxuICAgICAqICAgIGJ1dCBcImluY3JlbWVudGluZ1wiIHRoZW0gYnkgMSAob25seSBpbiB0aGUgY2FzZSBvZiBhIHRpbWVzdGFtcCBjb2xsaXNpb24pLlxyXG4gICAgICovXHJcbiAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgZ2VuZXJhdGVQdXNoSUQ6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAvLyBNb2RlbGVkIGFmdGVyIGJhc2U2NCB3ZWItc2FmZSBjaGFycywgYnV0IG9yZGVyZWQgYnkgQVNDSUkuXHJcbiAgICAgICAgICAgIHZhciBQVVNIX0NIQVJTID0gJy0wMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpfYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonO1xyXG5cclxuICAgICAgICAgICAgLy8gVGltZXN0YW1wIG9mIGxhc3QgcHVzaCwgdXNlZCB0byBwcmV2ZW50IGxvY2FsIGNvbGxpc2lvbnMgaWYgeW91IHB1c2ggdHdpY2UgaW4gb25lIG1zLlxyXG4gICAgICAgICAgICB2YXIgbGFzdFB1c2hUaW1lID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIFdlIGdlbmVyYXRlIDcyLWJpdHMgb2YgcmFuZG9tbmVzcyB3aGljaCBnZXQgdHVybmVkIGludG8gMTIgY2hhcmFjdGVycyBhbmQgYXBwZW5kZWQgdG8gdGhlXHJcbiAgICAgICAgICAgIC8vIHRpbWVzdGFtcCB0byBwcmV2ZW50IGNvbGxpc2lvbnMgd2l0aCBvdGhlciBjbGllbnRzLiAgV2Ugc3RvcmUgdGhlIGxhc3QgY2hhcmFjdGVycyB3ZVxyXG4gICAgICAgICAgICAvLyBnZW5lcmF0ZWQgYmVjYXVzZSBpbiB0aGUgZXZlbnQgb2YgYSBjb2xsaXNpb24sIHdlJ2xsIHVzZSB0aG9zZSBzYW1lIGNoYXJhY3RlcnMgZXhjZXB0XHJcbiAgICAgICAgICAgIC8vIFwiaW5jcmVtZW50ZWRcIiBieSBvbmUuXHJcbiAgICAgICAgICAgIHZhciBsYXN0UmFuZENoYXJzID0gW107XHJcblxyXG4gICAgICAgICAgICAvLyByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgICAgIHZhciBkdXBsaWNhdGVUaW1lID0gKG5vdyA9PT0gbGFzdFB1c2hUaW1lKTtcclxuICAgICAgICAgICAgICBsYXN0UHVzaFRpbWUgPSBub3c7XHJcblxyXG4gICAgICAgICAgICAgIHZhciB0aW1lU3RhbXBDaGFycyA9IG5ldyBBcnJheSg4KTtcclxuICAgICAgICAgICAgICBmb3IgKHZhciBpID0gNzsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIHRpbWVTdGFtcENoYXJzW2ldID0gUFVTSF9DSEFSUy5jaGFyQXQobm93ICUgNjQpO1xyXG4gICAgICAgICAgICAgICAgLy8gTk9URTogQ2FuJ3QgdXNlIDw8IGhlcmUgYmVjYXVzZSBqYXZhc2NyaXB0IHdpbGwgY29udmVydCB0byBpbnQgYW5kIGxvc2UgdGhlIHVwcGVyIGJpdHMuXHJcbiAgICAgICAgICAgICAgICBub3cgPSBNYXRoLmZsb29yKG5vdyAvIDY0KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKG5vdyAhPT0gMCkgdGhyb3cgbmV3IEVycm9yKCdXZSBzaG91bGQgaGF2ZSBjb252ZXJ0ZWQgdGhlIGVudGlyZSB0aW1lc3RhbXAuJyk7XHJcblxyXG4gICAgICAgICAgICAgIHZhciBpZCA9IHRpbWVTdGFtcENoYXJzLmpvaW4oJycpO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoIWR1cGxpY2F0ZVRpbWUpIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAxMjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgIGxhc3RSYW5kQ2hhcnNbaV0gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2NCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSB0aW1lc3RhbXAgaGFzbid0IGNoYW5nZWQgc2luY2UgbGFzdCBwdXNoLCB1c2UgdGhlIHNhbWUgcmFuZG9tIG51bWJlciwgZXhjZXB0IGluY3JlbWVudGVkIGJ5IDEuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAxMTsgaSA+PSAwICYmIGxhc3RSYW5kQ2hhcnNbaV0gPT09IDYzOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgbGFzdFJhbmRDaGFyc1tpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsYXN0UmFuZENoYXJzW2ldKys7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAxMjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZCArPSBQVVNIX0NIQVJTLmNoYXJBdChsYXN0UmFuZENoYXJzW2ldKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYoaWQubGVuZ3RoICE9IDIwKSB0aHJvdyBuZXcgRXJyb3IoJ0xlbmd0aCBzaG91bGQgYmUgMjAuJyk7XHJcblxyXG4gICAgICAgICAgICAgIHJldHVybiBpZDtcclxuICAgICAgICAgICAgLy8gfTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICB9KSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
