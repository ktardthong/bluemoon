angular.module('App')
  .controller('AuthCtrl', function(Auth, $state){
    var authCtrl = this;

    authCtrl.user = {
      email: '',
      password: ''
    };

    authCtrl.login = function (){
      Auth.$authWithPassword(authCtrl.user).then(function (auth){
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
