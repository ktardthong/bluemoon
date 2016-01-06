'use strict';

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
    'angular-md5',
    'ui.router',
    'ngMaterial',
    'slugifier',
    'angularMoment',
    'flow'
  ])

  .config(function($mdThemingProvider) {
    $mdThemingProvider.definePalette('slack', {
      '50': 'ffebee',
      '100': 'ffcdd2',
      '200': 'ef9a9a',
      '300': 'e57373',
      '400': 'ef5350',
      '500': '4D394B',
      '600': 'e53935',
      '700': 'd32f2f',
      '800': 'c62828',
      '900': 'b71c1c',
      'A100': 'ff8a80',
      'A200': 'ff5252',
      'A400': 'ff1744',
      'A700': 'd50000',
      'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                          // on this palette should be dark or light
      'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
        '200', '300', '400', 'A100'],
      'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });
    $mdThemingProvider.theme('default')
      .primaryPalette('slack')
  })


  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        views:{
          '':{
            controller: 'HomeCtrl as  homeCtrl',
            templateUrl: 'home/home.html',
            resolve:{
               requireNoAuth: function($state, Auth){
               return Auth.auth.$requireAuth().then(function(auth){
               $state.go('dashboard');
               }, function(error){
               return;
               });
               }
            }
          },
          'login-form@home':{
            controller:  'AuthCtrl as authCtrl',
            templateUrl: 'templates/html/login-form.html'
          },
          'header@home': {
            controller:  'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html',
          },
        },
      })


      .state('category',{
        url: '/category/{Slug}',
        views:{
          '':{
            controller:   'CateCtrl as cateCtrl',
            templateUrl:  'category/index.html',
            resolve:{
              //Getting Category details
              cateName: function($stateParams, Category) {
                return Category.getName($stateParams.Slug).$loaded();
              },
              //Getting list of category topics here
              cateTopics:function($stateParams,Topics){
                return Topics.list($stateParams.Slug);
              }
            }
          },
          'header@category': {
            controller:  'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html',
          }
        }
      })


      //Topic landing page
      .state('topic',{
        url:'/{Slug}',
        views:{
          '':{
            controller: 'TopicLandingCtrl as topicLandingCtrl',
            templateUrl:  'topics/index.html',
            resolve:{
              topicLanding: function($stateParams,Topics){
                return Topics.fortopic($stateParams.Slug);
              },
              replyList:function($stateParams,Topics){
                var topicKey = '';
                return Topics.fortopic($stateParams.Slug).$loaded().then(function(data){
                  if(data[0] != null)
                  {
                    topicKey = data[0].$id;
                  }
                  return Topics.replyList(topicKey);
                })
              }
            }
          },
          'header@topic': {
            controller:  'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html',
          }
        }
      })


      .state('dashboard', {
        url: '/user/dashboard',
        controller: 'DashboardCtrl as dashboardCtrl',
        views:{
          '':{
            controller: 'ProfileCtrl as profileCtrl',
            templateUrl: 'dashboard/index.html',
            resolve:{
              profile: function ($state,$rootScope, Auth, Users){
                return Auth.auth.$requireAuth().then(function(auth){
                  return Users.getProfile(auth.uid).$loaded().then(function (profile){
                    if(profile.displayName){
                      return profile;
                    } else {
                      $state.go('get_started');
                    }
                  });
                }, function(error){
                  $state.go('home');
                });
              },
              auth: function($state, Users, Auth){
                return Auth.auth.$requireAuth().catch(function(){
                  $state.go('home');
                });
              }
            }
          },
          'topic-grid@dashboard':{
            controller: 'HomeCtrl as  homeCtrl',
            templateUrl: 'templates/html/category-grid.html'
          },
          'header@dashboard': {
            controller:  'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html',
          }
        }
      })


      .state('get_started',{
        url: '/get_started',
        views:{
          '':{
            controller: 'ProfileCtrl as profileCtrl',
            templateUrl: 'auth/get_started.html',
            resolve:{
              profile: function(Users, Auth){
                return Auth.auth.$requireAuth().then(function(auth){
                  return Users.getProfile(auth.uid).$loaded();
                });
              },
              auth: function($state, Users, Auth){
                return Auth.auth.$requireAuth().catch(function(){
                  $state.go('home');
                });

              }
            }
          },
          'header@get_started': {
            controller:  'AuthCtrl as authCtrl',
            templateUrl: 'templates/toolbar/main_toolbar.html',
          }
        }
      })


      .state('login', {
        url: '/user/login',
        views:{
          '':{
            templateUrl: 'auth/login.html'
          },
          'login-form@login':{
            controller:  'AuthCtrl as authCtrl',
            templateUrl: 'templates/html/login-form.html'
          },
          'header@login': {
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }
        }
      })


      .state('register', {
        url: '/user/register',
        views:{
          '':{
            controller:  'AuthCtrl as authCtrl',
            templateUrl: 'auth/register.html'
          },
          'header@register': {
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }
        },
        resolve: {
          requireNoAuth: function($state, Auth){
            return Auth.auth.$requireAuth().then(function(auth){
              $state.go('home');
            }, function(error){
              return;
            });
          }
        }
      });

    $urlRouterProvider.otherwise('/');
  })

  .filter('orderObjectBy', function() {
    return function(items, field, reverse) {
      var filtered = [];
      angular.forEach(items, function(item) {
        filtered.push(item);
      });
      filtered.sort(function (a, b) {
        return (a[field] > b[field] ? 1 : -1);
      });
      if(reverse) filtered.reverse();
      return filtered;
    };
  })

  .constant('FirebaseUrl', 'https://bmxyz.firebaseio.com/');
