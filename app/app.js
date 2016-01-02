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
    'ngMaterial'
  ])

  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue-grey')
      .accentPalette('deep-orange');
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
               return Auth.$requireAuth().then(function(auth){
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
          'topic-grid@home':{
            templateUrl: 'templates/html/topic-grid.html'
          },
          'header@home': {
            templateUrl: 'templates/toolbar/main_toolbar.html',
          },
        },
      })


      .state('topics',{
        url: '/topic/{topicSlug}',
        controller:  'AuthCtrl as authCtrl',
        views:{
          '':{
            controller:   'TopicCtrl as topicCtrl',
            templateUrl:  'topic/index.html',
            resolve:{
              topicName: function($stateParams, Topics) {
                console.log($stateParams.topicSlug);
                return Topics.getName($stateParams.topicSlug);
              }
              /*topicName: function($stateParams, TopicService) {
                return TopicService.name($stateParams.topicSlug).$loaded();
              }*/

              /*posts: function($stateParams, TopicService){
                return TopicService.forChannel($stateParams.topicSlug).$loaded();
              }*/
            }
          },
          'header@topics': {
            templateUrl: 'templates/toolbar/main_toolbar.html',
          }
        }
      })

      .state('dashboard', {
        url: '/dashboard',
        controller: 'DashboardCtrl as dashboardCtrl',
        views:{
          '':{
            controller: 'ProfileCtrl as profileCtrl',
            templateUrl: 'dashboard/index.html',
            resolve:{
              profile: function ($state, Auth, Users){
                return Auth.$requireAuth().then(function(auth){
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
                return Auth.$requireAuth().catch(function(){
                  $state.go('home');
                });

              }
            }
          },
          'topic-grid@dashboard':{
            controller: 'HomeCtrl as  homeCtrl',
            templateUrl: 'templates/html/topic-grid.html'
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
                return Auth.$requireAuth().then(function(auth){
                  return Users.getProfile(auth.uid).$loaded();
                });
              },
              auth: function($state, Users, Auth){
                return Auth.$requireAuth().catch(function(){
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
        url: '/login',
        views:{
          '':{
            //controller: 'HomeCtrl as  homeCtrl',
            templateUrl: 'auth/login.html'
          },
          'login-form@login':{
            controller:  'AuthCtrl as authCtrl',
            templateUrl: 'templates/html/login-form.html'
          },
          'header@login': {
            templateUrl: 'templates/toolbar/main_toolbar.html'
          }
        },
        resolve: {
          requireNoAuth: function($state, Auth){
            return Auth.$requireAuth().then(function(auth){
              $state.go('home');
            }, function(error){
              return;
            });
          }
        }
      })


      .state('register', {
        url: '/register',
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
            return Auth.$requireAuth().then(function(auth){
              $state.go('home');
            }, function(error){
              return;
            });
          }
        }
      });

    $urlRouterProvider.otherwise('/');
  })
  .constant('FirebaseUrl', 'https://bmxyz.firebaseio.com/');
