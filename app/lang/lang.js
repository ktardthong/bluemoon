angular.module('App')
  .config(['$translateProvider', function ($translateProvider) {
    $translateProvider.translations('Eng', {
      'KEY_DASHBOARD':  'Dashboard',
      'KEY_LANGUAGES':  'Languages',
      'KEY_HOME':       'Home',
      'KEY_REGISTER':   'Register',
      'KEY_LOGIN':      'Login',
      'KEY_FOLLOW':     'Follow',
      'KEY_POST':       'Post',
      'KEY_QUESTION':   'Question',
      'KEY_TOPIC':      'Topic',
      'KEY_PASSWORD':   'Password',
      'KEY_SAVE_DRAFT': 'Save as draft',
      'KEY_TAGS':       'Tags',
      'KEY_EXPLORE':    'Explore',
      'KEY_COMMENTS':   'Comments',
      'KEY_REPLY':      'Reply',
      'KEY_WRITE_REPLY':'Write a reply',

      //SENTENCE
      'KEY_NO_ACCT_REGISTER': 'Don\'t have account? Register',


      //USER INPUT
      'KEY_FIRSTNAME':  'First name',
      'KEY_LASTNAME':   'Last name',
      'KEY_BIRTHDAY':   'Birthday',
      'KEY_MONTH':      'Month',
      'KEY_DAY':        'Day',
      'KEY_EMAIL':      'Email',
      'KEY_CONF_EMAIL': 'Confirm Email',
      'KEY_GENDER':     'Gender',
      'KEY_MALE':       'Male',
      'KEY_FEMALE':     'Female',
      'KEY_USERNAME':   'Username',
      'KEY_LOCATION':   'Location',


    });

    $translateProvider.translations('ไทย', {
      'KEY_DASHBOARD':  'ห้องทั้งหมด',
      'KEY_LANGUAGES':  'ภาษา',
      'KEY_HOME':       'หน้าแรก',
      'KEY_REGISTER':   'สมัครใช้',
      'KEY_LOGIN':      'เข้าสู่ระบบ',
      'KEY_FOLLOW':     'ติดตาม',
      'KEY_POST':       'โพสต์'
    });

    $translateProvider.preferredLanguage('en');
  }])
