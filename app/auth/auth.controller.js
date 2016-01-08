angular.module('App')
  .controller('AuthCtrl', function(Auth, Users, $state,$rootScope,$mdSidenav,$log){
    var authCtrl = this;


    //Parser
    authCtrl.auth     = Auth;
    authCtrl.users    = Users;
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

    authCtrl.login = function (){
      authCtrl.auth.auth.$authWithPassword(authCtrl.user).then(function (auth){
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


    authCtrl.toggleRight = buildToggler('right');
    function buildToggler(navID) {
      return function() {
        $mdSidenav(navID)
          .toggle()
      };
    }
  });
