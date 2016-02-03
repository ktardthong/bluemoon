angular.module('App')
  .controller('AuthCtrl', function($scope,Auth, Users, $state,$rootScope,$mdSidenav,$translate, $cookies,
                                   NotiService,$notification){

    console.log("authCtrl");

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

    authCtrl.badgeValue = 0;

    if(Auth.ref.getAuth() != null ){
      authCtrl.profile    = authCtrl.users.getProfile(Auth.ref.getAuth().uid);
      //authCtrl.badgeValue = authCtrl.notification.unreadNotification(authCtrl.profile.$id);
    }
    else{
      authCtrl.profile =''
    }

    authCtrl.user = {
      email: '',
      password: ''
    };


    $scope.$watch('badgeValue',function(){
      console.log(">>>" + authCtrl.badgeValue.value);
      return NotiService.unreadNotification(authCtrl.profile.$id).then(function(val){
        authCtrl.badgeValue = val;
      });


      //return authCtrl.badgeValue = authCtrl.notification.unreadNotification(authCtrl.profile.$id);
    })

    console.log(authCtrl.badgeValue);


    //Reset counter
    authCtrl.resetCounter = function(){
      authCtrl.notification.resetUnread(authCtrl.profile.$id);
    }


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
  });
