angular.module('App')
  .controller('TopicCtrl', function($state,$scope,$rootScope, $mdDialog, $mdMedia,$scope,$http,FirebaseUrl,
                                    //Services
                                    Tags, Topics, Auth, Users, Slug,Places, Languages){

    var topicCtrl = this;


    //Parser here
    topicCtrl.tags      = Tags;
    topicCtrl.topics    = Topics;
    topicCtrl.auth      = Auth;
    topicCtrl.users     = Users;
    topicCtrl.languages = Languages;
    topicCtrl.places    = Places;


    if(topicCtrl.auth.ref.getAuth() != null ){
      topicCtrl.profile  = topicCtrl.users.getProfile(topicCtrl.auth.ref.getAuth().uid);
      topicCtrl.uid = topicCtrl.profile.$id;
      topicCtrl.userRef = topicCtrl.users.userRef(topicCtrl.uid);
      topicCtrl.userUpvotedTopics = topicCtrl.users.upvotes(topicCtrl.uid);
      topicCtrl.userDownvotedTopics = topicCtrl.users.downvotes(topicCtrl.uid);
      topicCtrl.userFollowing = topicCtrl.users.following(topicCtrl.uid);
    }
    else{
      topicCtrl.profile ='';
      topicCtrl.uid = '';
      topicCtrl.userRef = '';
    }

    topicCtrl.userName = function(userId){
      if(userId!= null){
        return topicCtrl.users.getDisplayName(userId);
      }
    }


    //Preset Parameters
    topicCtrl.imageStrings = [];
    topicCtrl.imageText    = [];
    topicCtrl.inReplyArr    = [];
    topicCtrl.loadBusy = false;
    topicCtrl.slugReturn   = null;
    topicCtrl.newTopic = {
      'location': '',
      'url' : '',
      'ipInfo': '',
      'tags': ''
    }


    topicCtrl.showMdLogin = function(ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
      $mdDialog.show({
          controller: 'AuthCtrl as authCtrl',
          templateUrl: 'templates/html/md-login-form.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          fullscreen: useFullScreen
        })
/*        .then(function (answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });*/
    }



    topicCtrl.decodeText = function(text){
      //return $filter('slugify')(item.name);
      console.log(decodeURI(text));
      return decodeURI(text);
    }


    topicCtrl.loadMore = function(items) {
      topicCtrl.loadBusy = true;
      var data = [];
      for (var i = 0; i < items.length; i++) {
        data.push(items[i]);
      }
      console.log(data);
      return data
    };

    topicCtrl.loadTags = function(query) {
      console.log(topicCtrl.tags.tagsUrl());
    };


    topicCtrl.users.getLocationIP().success(function(data) {
      topicCtrl.newTopic.ipInfo = data;
    });


    //Upload Profile image
    topicCtrl.uploadFile = function(files) {
      angular.forEach(files, function (flowFile, i) {
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
          var uri = event.target.result;
          console.log(uri);
          topicCtrl.imageStrings[i] = uri;
        };
        fileReader.readAsDataURL(flowFile.file);
      })
    };


    //Reply to topic
    topicCtrl.reply = function(topicId){

      topicCtrl.topics.replyCount(topicId).$loaded().then(function(data){
        if(!data.count){

          topicCtrl.topics.replyCountRef(topicId).set(1);
        }else{
          console.log('increment here');
          topicCtrl.topics.replyCountRef(topicId)
            .set(data.count +1);
        }

      });



      topicCtrl.topics.replyArr(topicId).$add({
        topicId:  topicId,
        body:     topicCtrl.newReply.body,
        uid:      topicCtrl.uid,
        created:  moment().toISOString()
      })

      //Stat update
      topicCtrl.users.userRef(topicCtrl.uid).child('stat/comment/count')
        .set(topicCtrl.profile.stat.comment.count + 1);

      topicCtrl.users.userRef(topicCtrl.uid).child('stat/comment/topics/'+topicId)
        .push().set(moment().toISOString());
    }


    //Reply in reply
    topicCtrl.replyInReply = function(topicId,replyId){
      topicCtrl.topics.replyInReplyArr(topicId,replyId).$add({
        body:     topicCtrl.replyInReply.body,
        uid:      topicCtrl.uid,
        created:  moment().toISOString()
      })
    }


    //Check slug
    topicCtrl.checkSlug =function(){
      topicCtrl.slugReturn =  topicCtrl.topics.getSlug(topicCtrl.newTopic.topic);
      console.log(topicCtrl.slugReturn);
    }


    //Create new topic
    topicCtrl.createTopic = function(category,isDraft){

      //Check if we have location details
      var locationDetail = '';

      if(topicCtrl.newTopic.location !== '' ){
        console.log(topicCtrl.newTopic.location);
        locationDetail = {
          place_id: topicCtrl.newTopic.location.details.place_id,
          slug:     Slug.slugify(topicCtrl.newTopic.location.details.name),
          name:     topicCtrl.newTopic.location.details.name,
          address:  topicCtrl.newTopic.location.details.formatted_address,
          lat:      topicCtrl.newTopic.location.details.geometry.location.lat(),
          lng:      topicCtrl.newTopic.location.details.geometry.location.lng(),
          lng:      topicCtrl.newTopic.location.details.geometry.location.lng(),
          lng:      topicCtrl.newTopic.location.details.geometry.location.lng(),
        }
      }

     /* DEBUG FORM VALUE
        var data = {
        type:           topicCtrl.type,
        lang:           topicCtrl.newTopic.lang,
        topic:          topicCtrl.newTopic.topic,
        body:           topicCtrl.newTopic.body,
        category:       category,
        uid:            topicCtrl.uid,
        slug:           Slug.slugify(topicCtrl.newTopic.topic),
        photos:         topicCtrl.imageStrings,
        photos_text:    topicCtrl.imageText,
        location:       locationDetail,
        url:            topicCtrl.newTopic.url,
        draft:          isDraft,
        created:        moment().toISOString(),
        tags:           topicCtrl.newTopic.tags,
        userIP:       topicCtrl.newTopic.ipInfo
      };
      console.log(data);
      */

      topicCtrl.topics.arr.$add({
          type:           topicCtrl.type,
          lang:           topicCtrl.newTopic.lang,
          topic:          topicCtrl.newTopic.topic,
          body:           topicCtrl.newTopic.body,
          category:       category,
          uid:            topicCtrl.uid,
          //slug:           Slug.slugify(topicCtrl.newTopic.topic),
          slug:           topicCtrl.newTopic.topic,
          photos:         topicCtrl.imageStrings,
          photos_text:    topicCtrl.imageText,
          location:       locationDetail,
          url:            topicCtrl.newTopic.url,
          draft:          isDraft,
          created:        moment().toISOString(),
          tags:           topicCtrl.newTopic.tags,
          userIP:        topicCtrl.newTopic.ipInfo
        }).then(function(topic){

          //Update slug with topic Key
          topicCtrl.topics.getTopicByKey(topic.key()).update({"slug":topicCtrl.newTopic.topic+topic.key()});

          //Stat update
          topicCtrl.users.userRef(topicCtrl.uid).child('stat/posted/count')
            .set(topicCtrl.profile.stat.posted.count + 1);

          topicCtrl.users.userRef(topicCtrl.uid).child('stat/posted/topics/'+topic.key())
            .push().set(moment().toISOString());

          //If there is location
          if(locationDetail !== ''){

            topicCtrl.places.addChild(locationDetail.place_id)
                      .child(topic.key())
                      .push().set(moment().toISOString());

            topicCtrl.places.addChild(locationDetail.place_id)
              .child('info').set(locationDetail);
          }

          //if there are tags
          if(topicCtrl.newTopic.tags !== null){
            for (index = 0; index < topicCtrl.newTopic.tags.length; ++index) {
              topicCtrl.tags.addChild(topicCtrl.newTopic.tags[index].text)
                .child(topic.key()).push().set(moment().toISOString());
            }
          }
        topicCtrl.newTopic = {
          body: ''
        };
      });
    };


    //Check if user is already following user
    topicCtrl.checkFollow = function(follow_uid){
      if(topicCtrl.users.checkFollow(topicCtrl.uid,follow_uid)){
        return true;
      }else{
        return false;
      }
    }


    //Follow User
    topicCtrl.followUser = function(follow_uid){

      //Update the person that being follow, credit them for having follower
      topicCtrl.users.getProfile(follow_uid).$loaded().then(function (data) {

        topicCtrl.users.userRef(follow_uid).child('stat/follower/count')
          .set(data.stat.follower.count + 1);

        topicCtrl.users.userRef(follow_uid).child('stat/follower/uid/'+ topicCtrl.uid)
          .push().set(moment().toISOString());
      });

      //Update the person that is following, credit them for having following
      topicCtrl.users.getProfile(topicCtrl.uid).$loaded().then(function (data) {

        topicCtrl.users.userRef(topicCtrl.uid).child('stat/following/count')
          .set(data.stat.follower.count + 1);

        topicCtrl.users.userRef(topicCtrl.uid).child('stat/following/uid/'+ follow_uid)
          .push().set(moment().toISOString());
      });
    }


    //Unfollow User
    topicCtrl.unfollowUser = function(follow_uid){

      //Update the person that being follow, credit them for having follower
      topicCtrl.users.getProfile(follow_uid).$loaded().then(function (data) {

        topicCtrl.users.userRef(follow_uid).child('stat/follower/count')
          .set(data.stat.follower.count - 1);

        topicCtrl.users.userRef(follow_uid).child('stat/follower/uid/'+ topicCtrl.uid).remove();
      });

      //Update the person that is following, credit them for having following
      topicCtrl.users.getProfile(topicCtrl.uid).$loaded().then(function (data) {

        topicCtrl.users.userRef(topicCtrl.uid).child('stat/following/count')
          .set(data.stat.following.count - 1);

        topicCtrl.users.userRef(topicCtrl.uid).child('stat/following/uid/'+ follow_uid).remove();
      });

    }



     //upvote
    topicCtrl.upvote = function(topic){

      if(topic.downvotes != undefined && topic.downvotes[topicCtrl.uid] != undefined){
        topicCtrl.cancelDownvote(topic);
      }
      topicCtrl.topics.upvoteTopic(topic.$id, topicCtrl.uid).$loaded().then(function(value){
        topicCtrl.userUpvotedTopics.child(topic.$id).set(value.$value);

        //Stat update
        topicCtrl.users.getProfile(topic.uid).$loaded().then(function (data) {

        topicCtrl.users.userRef(topic.uid).child('stat/upvoted/count')
          .set(data.stat.upvoted.count + 1);
        topicCtrl.users.userRef(topic.uid).child('stat/upvoted/topics/'+topic.$id)
          .push().set(moment().toISOString());
        });

      });
    };

    topicCtrl.cancelUpvote = function(topic){
      topicCtrl.topics.undoUpvote(topic.$id, topicCtrl.uid);

      topicCtrl.users.getProfile(topic.uid).$loaded().then(function (data) {

        //Stat update
        topicCtrl.users.userRef(topic.uid).child('stat/upvoted/count')
          .set(data.stat.upvoted.count - 1);

        topicCtrl.users.userRef(topic.uid).child('stat/upvoted/topics/'+topic.$id).remove();
      });


      topicCtrl.userUpvotedTopics.child(topic.$id).remove(function(error){
            if (error) {
            console.log("Error:", error);
          } else {
            console.log("Removed successfully!");
          }});
    };

    //downvote
    topicCtrl.downvote = function(topic){
      if(topic.upvotes != undefined && topic.upvotes[topicCtrl.uid] != undefined){
        topicCtrl.cancelUpvote(topic);
      }
      topicCtrl.topics.downvoteTopic(topic.$id, topicCtrl.uid).$loaded().then(function(value){
        topicCtrl.userDownvotedTopics.child(topic.$id).set(value.$value);
      });
    };

    topicCtrl.cancelDownvote = function(topic){
      topicCtrl.topics.undoDownvote(topic.$id, topicCtrl.uid);
      topicCtrl.userDownvotedTopics.child(topic.$id).remove(function(error){
            if (error) {
            console.log("Error:", error);
          } else {
            console.log("Removed successfully!");
          }});
    };

    //follow topic
    topicCtrl.followTopic = function(topic){
      topicCtrl.topics.follow(topic.$id, topicCtrl.uid).$loaded().then(function(value){
        topicCtrl.userFollowing.child(topic.$id).set(value.history[topicCtrl.uid]);
      });
    };

    topicCtrl.unfollowTopic = function(topic){
      topicCtrl.topics.unfollow(topic.$id, topicCtrl.uid);
      topicCtrl.userFollowing.child(topic.$id).remove(function(error){
            if (error) {
            console.log("Error:", error);
          } else {
            console.log("Removed successfully!");
          }});
    };

  });
