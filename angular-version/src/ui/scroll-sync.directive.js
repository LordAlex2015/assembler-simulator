app.directive('scrollSync', ['$log', function($log) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.on('scroll mousemove mouseup', function() {
                scope.$apply(function() {
                    scope.$eval(attrs.scrollSync);
                });
            });
        }
    };
}]);