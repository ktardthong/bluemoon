angular.module('App')
  .factory('Auth', function($firebaseAuth, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl);
    var auth = $firebaseAuth(ref);

    console.log("auth service");

    var Auth = {

      ref:ref,
      auth: auth,

      getUid:function(){
        var uid = ref.getAuth();
        if(uid != null ){
          return ref.getAuth().uid;
        }
        else{
          return false;
        }
      },
    }

    return Auth;
  });
