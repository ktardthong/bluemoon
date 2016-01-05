angular.module('App')
  .controller('AuthCtrl', function(Auth, Users, $state,$rootScope){
    var authCtrl = this;

    authCtrl.user = {
      email: '',
      password: ''
    };

    authCtrl.login = function (){
      Auth.$authWithPassword(authCtrl.user).then(function (auth){
        Users.getProfile(auth.uid).$loaded().then(function(profile){
          $rootScope.profile = profile;
        });
        $state.go('dashboard');
      }, function (error){
        authCtrl.error = error;
      });
    };

    authCtrl.logout = function(){
      Auth.$unauth();
    }

    authCtrl.register = function (){
      Auth.$createUser(authCtrl.user).then(function (user){
        authCtrl.login();
      }, function (error){
        authCtrl.error = error;
      });
    };

  });
