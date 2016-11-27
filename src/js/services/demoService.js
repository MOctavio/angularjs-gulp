angular.module('demoApp.services')
    .factory('demoService', [function() {
        const get = function() {
            return 'AngularJs & Gulp';
        };
        return {
            getMessagge: get
        };
    }]);
