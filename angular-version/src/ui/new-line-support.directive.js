app.directive('newLineSupport', ['$log', function ($log) {
    return {
        restrict: 'A',
        require: 'ngModel', // Require the ngModel controller to update the model
        link: function (scope, element, attrs, ngModelCtrl) {
            element.bind("keydown", function (e) {
                if (e.keyCode === 13) { // Enter key
                    var val = element.val();
                    var start = element[0].selectionStart;
                    var end = element[0].selectionEnd;

                    // Insert a newline character at the current caret position.
                    var newVal = val.substring(0, start) + "\n" + val.substring(end);

                    // Update the ngModel with the new value so that Angular's digest cycle reprocesses the change
                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(newVal);
                        ngModelCtrl.$render();
                    });

                    // Place the caret after the newline.
                    element[0].selectionStart = element[0].selectionEnd = start + 1;
                    $log.log("new line added", newVal);

                    e.preventDefault();
                    return false;
                }
            });
        }
    };
}]);