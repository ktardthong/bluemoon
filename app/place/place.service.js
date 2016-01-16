angular.module('App')
  .factory('Places', function($firebaseArray, FirebaseUrl){

    var ref = new Firebase(FirebaseUrl+'places');
    var placeDetail_ref = new Firebase(FirebaseUrl+'places_details');

    var places = $firebaseArray(ref);

    var Places = {
      addChild: function(childname){
        return ref.child(childname)
      },

      addPlaceDetailChild: function(childname){
        return placeDetail_ref.child(childname)
      },

      getPlaceRef:function(place_id){
        return ref.child(place_id+'/info');
      },
      arr: places
    }
    return Places;
  })
