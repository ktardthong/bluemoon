angular.module('App')
  .controller('ProfileCtrl', function($scope, $rootScope, $state, md5, Auth,Users, auth, notify, profile, Topics, Facebook){
    var profileCtrl = this;

    //Parser
    profileCtrl.profile = profile;
    profileCtrl.auth    = Auth;
    profileCtrl.users   = Users;
    profileCtrl.topics  = Topics;
    profileCtrl.facebook= Facebook;


    profileCtrl.linkFacebook = function(){

      console.log("click");

      profileCtrl.facebook.login(function(response) {

        profileCtrl.facebook.getLoginStatus(function(response){
          if(response.status === 'connected') {
            $scope.loggedIn = true;
            profileCtrl.facebook.api('/me', function(response) {
              console.log(response);
            });
          } else {
              console.log("not logged in");
          }
        });
      });
    }


    //The original value from profile
    profileCtrl.oldProfileValue = profileCtrl.profile;


    if(Auth.ref.getAuth() != null ){
      profileCtrl.profile  = profileCtrl.users.getProfile(Auth.ref.getAuth().uid);
    }
    else{
      profileCtrl.profile =''
    }


    profileCtrl.userCreated = function(uid){
      return profileCtrl.topics.createdBy(uid);
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
          notify({message:'Saved',position:'center',duration: 3000 });
        };
        fileReader.readAsDataURL(flowFile.file);
      })
    };


    //Update name
    profileCtrl.updateName = function(){

      profileCtrl.users.userArrRef(Auth.ref.getAuth().uid).update(
        {
          "firstname":  profileCtrl.profile.firstname,
          "lastname":   profileCtrl.profile.lastname,
        }
      )

      profileCtrl.users.userArrRef(Auth.ref.getAuth().uid+'/log').push().set({
        action:   "name_change",
        oldname:  profileCtrl.oldProfileValue.firstname + "-" + profileCtrl.oldProfileValue.lastname,
        created:  moment().toISOString()
      });

      notify({message:'Saved',position:'center',duration: 3000 });
    }


    //Update Bio
    profileCtrl.updateBio = function(){
      profileCtrl.users.userArrRef(Auth.ref.getAuth().uid).update({"biography": profileCtrl.profile.biography})

      notify({message:'Saved',position:'center',duration: 3000 });
    }


    profileCtrl.updateProfile = function(){
      profileCtrl.profile.emailHash = md5.createHash(auth.password.email);
      profileCtrl.profile.$save().then(function(){
        $state.go('dashboard');
      });
    };


  });
