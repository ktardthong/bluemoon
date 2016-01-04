angular.module('App')
  .controller('CateCtrl', function($state, Category,cateName,cateTopics){
    var cateCtrl = this;

    //Parsers
    cateCtrl.cateName   = cateName;
    cateCtrl.category   = Category;
    cateCtrl.cateTopics = cateTopics;

  });
