angular.module('App')
  .controller('ProfileCtrl', function($scope, $rootScope, $state, $filter, md5,
                                      //Services
                                      Auth,Users,Topics, Facebook,notify,CateService,
                                      //Resolve
                                      profile,isOwner,userPosts){
    var profileCtrl = this;

    //Parser
    profileCtrl.profile   = profile;
    profileCtrl.auth      = Auth;
    profileCtrl.users     = Users;
    profileCtrl.topics    = Topics;
    profileCtrl.facebook  = Facebook;
    profileCtrl.isOwner   = isOwner;
    profileCtrl.cate      = CateService;
    profileCtrl.$state    = $state;
    profileCtrl.userPosts = userPosts;

    profileCtrl.feed = '';
    profileCtrl.editInit = 'userEdit';

    profileCtrl.nameExist= false;


    profileCtrl.getUserPost = function(uid){
      console.log(uid);
      profileCtrl.feed = profileCtrl.topics.createdBy(uid);
    }



    /*Link account with facebook*/
    profileCtrl.linkFacebook = function(){
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


    profileCtrl.userCreated = function(uid){
      return profileCtrl.topics.createdBy(uid);
    }


    //Preset Parameters
    profileCtrl.imageStrings    = [];
    profileCtrl.userCateFollow  = [];
    profileCtrl.cateIsFollow    = [];
    profileCtrl.followList      = '';





    profileCtrl.followCateListArr = function(uid){
      profileCtrl.followList = profileCtrl.cate.followList(uid);
      console.log(profileCtrl.followList);
    }

    if(Auth.ref.getAuth()){
      profileCtrl.followCateListArr(Auth.ref.getAuth().uid);
    }

    profileCtrl.followCate = function(index,cate_slug){
      console.log(cate_slug);
      //profileCtrl.userCateFollow[index] = cate_slug;
      profileCtrl.cateIsFollow[index]  = true;

      console.log(profileCtrl.cate.userFollow(cate_slug,Auth.ref.getAuth().uid));

      profileCtrl.cate.addChild(cate_slug+'/follower')
        .child(Auth.ref.getAuth().uid).push().set(moment().toISOString());
    }





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


    //Save profile with profileCtrl.profile
    //params: redirect, if exist then redirect after save
    profileCtrl.saveProfile = function(redirect){
      profileCtrl.profile.updated = moment().toISOString();


      if(profileCtrl.location !== null ) {
        locationDetail = {
          place_id: profileCtrl.location.details.place_id,
          name: profileCtrl.location.details.name,
          address: profileCtrl.location.details.formatted_address,
          lat: profileCtrl.location.details.geometry.location.lat(),
          lng: profileCtrl.location.details.geometry.location.lng(),
        }

        profileCtrl.profile.userLocation = locationDetail;
      }

      profileCtrl.profile.$save().then(function() {
        notify({message:'Saved',position:'center',duration: 3000 });
        console.log(redirect);
        if(redirect !== undefined){
          $state.go(redirect);
        }
      }).catch(function(error) {
        notify({message:'Error saving data',position:'center',duration: 3000 });
      });
    }


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
      //profileCtrl.profile.emailHash = md5.createHash(auth.password.email);
      profileCtrl.profile.$save().then(function(){
        $state.go('dashboard');
      });
    };


    //Check if user exist, return false if they do
    profileCtrl.checkUsername = function(){

      profileCtrl.users.checkUsernameExist(profileCtrl.profile.displayName).once('value', function(snapshot) {
        if(snapshot.val() !== null){
          return profileCtrl.nameExist=true;
        }else {
          return profileCtrl.nameExist=false;
        }
      });
    }

  });
