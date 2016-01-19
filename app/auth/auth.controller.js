angular.module('App')
  .controller('AuthCtrl', function(Auth, Users, $state,$rootScope,$mdSidenav,$translate, $cookies){
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



    //Change language
    authCtrl.toggleLang = function (langKey) {
      $translate.use(langKey);

      // Setting a cookie
      $cookies.put('userLang', langKey);

      //If user registered
      if(Auth.ref.getAuth())
      {
        //authCtrl.users.ref(Auth.ref.getAuth().uid).update({lang: langKey});
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
  });
