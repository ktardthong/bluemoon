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

  // Facebook Config
  .config(
    function (FacebookProvider) {
      var myAppId = '931376120263856'
      FacebookProvider.setAppId(myAppId)
      FacebookProvider.init(myAppId)
    }
  )

  //Security for Translate
  .config(function ($translateProvider) {
    $translateProvider.preferredLanguage('Eng');
    // Enable escaping of HTML
    $translateProvider.useSanitizeValueStrategy('escape');
  })



  .config(function ($stateProvider, $urlRouterProvider,$controllerProvider) {

    app.registerCtrl = $controllerProvider.register;

    $stateProvider
      .state('home', {
        url: '/',
        views: {
          '': {
            controller: 'DashboardCtrl as  dashboardCtrl',
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
            controller: 'DashboardCtrl as  dashboardCtrl',
            templateUrl: 'home/trend.html',
            resolve: {
              feed: function (Topics) {
                return Topics.latestFeed()
              }
            }
          },
        }
      })


      // Category Landing
      .state('category', {
        url: '/category/{Slug}',
        views: {
          '': {
            //controller: 'CateCtrl as cateCtrl',
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
              placeLanding: function (Places, Topics, $stateParams, $firebaseArray) {
                var data
                Places.getPlaceRef($stateParams.place_id).on('value', function (snapshot) {
                  data = snapshot.val()
                  console.log(snapshot.val())
                })
                return data
              // return  $firebaseArray(Places.getPlaceRef($stateParams.place_id))
              }
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
              tagName: function ($stateParams) {
                return $stateParams.Tag
              },

              tagLanding: function (Topics, $stateParams, Tags) {
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
              }
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
              isOwner: function (Auth, Users, $stateParams, Topics) {
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
              },
              topicLanding: function ($stateParams, Topics) {
                return Topics.fortopic($stateParams.Slug).$loaded();
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
              isOwner: function (Auth, Users, $stateParams) {
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
              },
              userPosts: function (Users, Topics, $stateParams) {
                return Users.getProfileByUsername($stateParams.Name).$loaded().then(function (profile) {
                  if (profile[0].$id !== 'undefined') {
                    return Topics.createdBy(profile[0].$id)
                  }
                })
              },
              profile: function ($state, $stateParams, $rootScope, Auth, Users) {
                return Users.getProfileByUsername($stateParams.Name).$loaded().then(function (profile) {
                  return profile
                })
              }
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
              profile: function ($state, $rootScope, Auth, Users) {
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
              },
              auth: function ($state, Users, Auth) {
                return Auth.auth.$requireAuth().catch(function () {
                  $state.go('home')
                })
              }
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
              cateName: function ($stateParams, Category) {
                return Category.getName($stateParams.Slug).$loaded()
              },
              // Getting list of category topics here
              cateTopics: function ($stateParams, Topics) {
                return Topics.list($stateParams.Slug)
              }
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
            templateUrl: 'templates/html/login-form.html'
          }
        }
      })

      .state('register', {
        url: '/user/register',
        views: {
          '': {
            templateUrl: 'auth/register.html'
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

  .filter('decodeURI', function () {
    return function (text) {
      return text ? decodeURI(text) : ''
    }
  })

  // Formatting texts to include new line
  .filter('nl2br', function ($sce) {
    return function (text) {
      return text ? $sce.trustAsHtml(text.replace(/\n/g, '<br/>')) : ''
    }
  })

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
