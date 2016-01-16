'use strict'

/**
 * @ngdoc overview
 * @name angularfireSlackApp
 * @description
 * # angularfireSlackApp
 *
 * Main module of the application.
 */
angular
  .module('App', [
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
    'facebook', // Facebook - https://github.com/Ciul/angular-facebook
    'angular-web-notification', //https://github.com/sagiegurari/angular-web-notification
    'angular-flexslider', //IMage slider - https://github.com/thenikso/angular-flexslider

    //Emoticon -- http://mistic100.github.io/angular-smilies/
    'ngSanitize',
    'ui.bootstrap', // OR mgcrea.ngStrap
    'angular-smilies'

  ])

  .config(function ($mdThemingProvider) {
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
  })


  //Facebook Config
  .config(
    function (FacebookProvider) {
      var myAppId = '931376120263856'
      FacebookProvider.setAppId(myAppId)
      FacebookProvider.init(myAppId)
    }
  )

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        views: {
          '': {
            controller: 'HomeCtrl as  homeCtrl',
            templateUrl: 'home/home.html',
            resolve: {
              requireNoAuth: function ($state, Auth) {
                return Auth.auth.$requireAuth().then(function (auth) {
                  $state.go('dashboard')
                }, function (error) {
                  return error
                })
              }
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

      .state('category', {
        url: '/category/{Slug}',
        views: {
          '': {
            controller: 'CateCtrl as cateCtrl',
            templateUrl: 'category/index.html',
            resolve: {
              // Getting Category details
              cateName: function ($stateParams, Category) {
                return Category.getName($stateParams.Slug).$loaded()
              },
              // Getting list of category topics here
              cateTopics: function ($stateParams, Topics) {
                return Topics.list($stateParams.Slug)
              }
            }
          },
          'header@category': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }
        }
      })


      //Places landing page
      .state('places',{
        url: '/places/{place_slug}/{place_id}',
        views: {
          'header@places': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          },
          '':{
            controller: 'PlacesCtrl as placesCtrl',
            templateUrl: 'place/index.html',
            resolve:{
              placeLanding:function(Places,Topics,$stateParams,$firebaseArray){
                var data;
                Places.getPlaceRef($stateParams.place_id).on("value", function(snapshot) {
                  data = snapshot.val();
                  console.log(snapshot.val());
                });
                return data;
                //return  $firebaseArray(Places.getPlaceRef($stateParams.place_id));
              }
            }
          }
        }
      })


      //Tag landing page
      .state('tag',{
        url: '/tag/{Tag}',
        views: {
          'header@tag': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          },
          '':{
            controller: 'TagCtrl as tagCtrl',
            templateUrl: 'tag/index.html',
            resolve:{
              tagName: function($stateParams){
                return $stateParams.Tag;
              },
              tagLanding:function(Tags,Topics,$stateParams,$firebaseArray){
                return  $firebaseArray(Tags.getTagRef($stateParams.Tag));
              }
            }
          }
        }
      })


      // Topic landing page
      .state('topic', {
        url: '/{Slug}',
        views: {
          '': {
            controller: 'TopicLandingCtrl as topicLandingCtrl',
            templateUrl: 'topics/index.html',
            resolve: {
              isOwner: function(Auth,Users,$stateParams,Topics){

                var topicUid = '';
                //If user login, check if they are the topic owner
                if(Auth.ref.getAuth()){
                  return Topics.fortopic($stateParams.Slug).$loaded().then(function (data) {
                    if (data[0] != null) {
                      topicUid = data[0].uid
                      if(Auth.ref.getAuth().uid == topicUid )
                      {
                        return true;
                      }else{
                        return false;
                      }
                    }
                  });
                }else{
                  return false;
                }
              },
              topicLanding: function ($stateParams, Topics) {
                return Topics.fortopic($stateParams.Slug)
              },
              replyList: function ($stateParams, Topics, $state) {
                var topicKey = ''
                return Topics.fortopic($stateParams.Slug).$loaded().then(function (data) {
                  if (data[0] != null) {
                    topicKey = data[0].$id
                  } else {
                    $state.go('topic-notfound')
                  }
                  return Topics.replyList(topicKey)
                })
              },
              viewData: function ($stateParams, Topics, Users, Auth) {
                var topicKey, views
                var time = moment().toISOString()
                var historyObj = {'userIP': '', 'created': time}
                Users.getLocationIP().success(function (data) {
                  historyObj.userIP = data.data
                }).then(function (data) {
                  historyObj.userIP = data.data
                })
                return Topics.getTopicBySlug($stateParams.Slug).$loaded().then(function (data) {
                  if (data != null) {
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
              },
              followers: function ($stateParams, Topics) {
                return Topics.getTopicBySlug($stateParams.Slug).$loaded().then(function (data) {
                  var topicKey = data[0].$id
                  return Topics.getFollowers(topicKey).obj.$loaded().then(function (value) {
                    return value
                  })
                })
              }
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
        url: '/notfound'
      })

      // Profile landing page
      .state('profile', {
        url: '/profile/{Name}',
        views: {
          '': {
            controller: 'ProfileCtrl as profileCtrl',
            templateUrl: 'profile/index.html',
            resolve: {
              isOwner: function(Auth,Users,$stateParams){
                if(Auth.ref.getAuth()) {
                  return Users.getProfileByUsername($stateParams.Name).$loaded().then(function (profile) {
                    if (profile[0].$id == Auth.ref.getAuth().uid) {
                      return true;
                    } else {
                      return false;
                    }
                  })
                }else{
                  return false;
                }
              },
              profile: function ($state,$stateParams, $rootScope, Auth, Users) {
                return Users.getProfileByUsername($stateParams.Name).$loaded().then(function (profile) {
                  console.log(profile);
                  return profile;
                });
              },
            }
          },
          'header@profile': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }

        }
      })

      // Profile landing page
      .state('profileEdit', {
        url: '/profile/{Name}/edit',
        views: {
          '': {
            controller: 'ProfileCtrl as profileCtrl',
            templateUrl: 'profile/edit.html',
            resolve: {
              profile: function ($state, $rootScope, Auth, Users) {
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
              },
              auth: function ($state, Users, Auth) {
                return Auth.auth.$requireAuth().catch(function () {
                  $state.go('home')
                })
              }
            }
          },
          'header@profileEdit': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }

        }
      })


      // Dashboard
      .state('dashboard', {
        url: '/user/dashboard',
        controller: 'DashboardCtrl as dashboardCtrl',
        views: {

          '': {
            controller: 'ProfileCtrl as profileCtrl',
            templateUrl: 'dashboard/index.html',
            resolve: {
              isOwner: function(){
                return true;
              },
              profile: function ($state, $rootScope, Auth, Users) {
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
                  return error
                })
              },
              auth: function ($state, Users, Auth) {
                return Auth.auth.$requireAuth().catch(function () {
                  $state.go('home')
                })
              }
            }
          },
          'header@dashboard': {
            controller: 'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }
        }
      })

      .state('get_started', {
        url: '/user/get_started',
        views: {
          '': {
            controller: 'ProfileCtrl as profileCtrl',
            templateUrl: 'auth/get_started.html',
            resolve: {
              isOwner: function(){
                return true;
              },
              profile: function (Users, Auth) {
                return Auth.auth.$requireAuth().then(function (auth) {
                  return Users.getProfile(auth.uid).$loaded()
                })
              },
              auth: function ($state, Users, Auth) {
                return Auth.auth.$requireAuth().catch(function () {
                  $state.go('home')
                })
              }
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
          requireNoAuth: function ($state, Auth) {
            return Auth.auth.$requireAuth().then(function (auth) {
              $state.go('home')
            }, function (error) {
              return error
            })
          }
        }
      })

    $urlRouterProvider.otherwise('/')
  })

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


  //Formatting texts to include new line
  .filter('nl2br', function ($sce) {
    return function (text) {
      return text ? $sce.trustAsHtml(text.replace(/\n/g, '<br/>')) : '';
    };
  })

  .constant('FirebaseUrl', 'https://bmxyz.firebaseio.com/')
