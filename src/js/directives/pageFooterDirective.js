angular.module('demoApp.directives')
    .directive('pageFooter', [function() {
        return {
            restrict: 'E',
            templateUrl: '/views/partials/_pageFooter.html'
        };
    }]);
