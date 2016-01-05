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
    'slugifier'
  ])

  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('pink');
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
            templateUrl: 'templates/html/category-grid.html'
          },
          'header@home': {
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
                //console.log(Topics.list($stateParams.Slug));
                return Topics.list($stateParams.Slug);
              }
            }
          },
          'header@category': {
            templateUrl: 'templates/toolbar/main_toolbar.html',
          }
        }
      })


      //Topic laning page
      .state('topic',{
        url:'/{Slug}/',
        views:{
          '':{
            controller: 'TopicLandingCtrl as topicLandingCtrl',
            templateUrl:  'topics/index.html',
            resolve:{
              topicLanding: function($stateParams,Topics){
                return Topics.fortopic($stateParams.Slug);
              }
            }
          },
          'header@topic': {
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
              profile: function ($state,$rootScope, Auth, Users){
                return Auth.$requireAuth().then(function(auth){
                  return Users.getProfile(auth.uid).$loaded().then(function (profile){
                    if(profile.displayName){
                      $rootScope.profile = profile;
                      console.log($rootScope.profile);
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
