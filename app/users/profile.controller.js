angular.module('App')
  .controller('ProfileCtrl', function($scope, $rootScope, $state, md5,Auth, auth, profile){
    var profileCtrl = this;

    //Parser
    profileCtrl.profile = profile;
    profileCtrl.auth    = Auth;



    //Preset Parameters
    profileCtrl.imageStrings = [];


    //Upload Profile image
    profileCtrl.uploadFile = function(files) {
      angular.forEach(files, function (flowFile, i) {
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
          var uri = event.target.result;
          profileCtrl.imageStrings[i] = uri;
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
