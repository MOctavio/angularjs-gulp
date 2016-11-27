angular.module('demoApp.controllers')
    .controller('HomeController', ['demoService', function(demoService) {
        const vm = this;
        vm.messagge = demoService.getMessagge();
    }]);
