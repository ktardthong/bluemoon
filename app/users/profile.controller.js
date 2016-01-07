angular.module('App')
  .controller('ProfileCtrl', function($scope, $rootScope, $state, md5, Auth,Users, auth, profile){
    var profileCtrl = this;

    //Parser
    profileCtrl.profile = profile;
    profileCtrl.auth    = Auth;
    profileCtrl.users   = Users;

    if(Auth.ref.getAuth() != null ){
      profileCtrl.profile  = profileCtrl.users.getProfile(Auth.ref.getAuth().uid);
    }
    else{
      profileCtrl.profile =''
    }


    //Preset Parameters
    profileCtrl.imageStrings = [];


    //Upload Profile image
    profileCtrl.uploadFile = function(files) {
      angular.forEach(files, function (flowFile, i) {
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
          var uri = event.target.result;
          profileCtrl.imageStrings[i] = uri;
          profileCtrl.users.userArrRef(Auth.ref.getAuth().uid).update({"photo": uri})
        };
        fileReader.readAsDataURL(flowFile.file);
      })
    };


    profileCtrl.updateProfile = function(){
      profileCtrl.profile.emailHash = md5.createHash(auth.password.email);
      profileCtrl.profile.$save().then(function(){
        $state.go('dashboard');
      });
    };


  });
