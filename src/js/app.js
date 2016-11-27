angular.module('demoApp', ['ui.router', 'demoApp.services', 'demoApp.controllers', 'demoApp.directives', 'demoApp.filters'])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'views/home/home.html'
            });
    }]);

angular.module('demoApp.services', []);
angular.module('demoApp.controllers', []);
angular.module('demoApp.directives', []);
angular.module('demoApp.filters', []);
