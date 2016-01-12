angular.module('App')
  .directive('topicGrid', function () {
    return {
      controller: 'DashboardCtrl as dashboardCtrl',
      templateUrl: 'templates/html/category-grid.html'
    }
  })


  .directive('topicCreate', function(){

    return {
      controller: 'TopicCtrl as topicCtrl',
      templateUrl: 'templates/html/topic-create.html',
      scope: {
        topic: '='
      }
    }

  })


  .directive('topicList', function () {
    return {
      controller: 'TopicCtrl as topicCtrl',
      templateUrl: 'templates/html/topic-list.html',
      scope: {
        topics: '='
      }
    }
  })


  .directive('topicActionsCard', function () {
    return {
      controller: 'TopicCtrl as topicCtrl',
      templateUrl: 'templates/html/topic-actions-card.html',
      scope: {
        topic: '='
      }
    }
  })


  //for tags - max tags
  .directive('enforceMaxTags', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngCtrl) {
      var maxTags = attrs.maxTags ? parseInt(attrs.maxTags, '4') : null;

      ngCtrl.$parsers.push(function(value) {
        if (value && maxTags && value.length > maxTags) {
          value.splice(value.length - 1, 1);
        }
        return value;
      });
    }
  };
});
