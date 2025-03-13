app.directive('resizeSync', ['$window', function($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            // Get the highlighted code element
            var highlightedEl = angular.element(document.querySelector('.highlighted-code'));
            var editorContainer = angular.element(document.querySelector('.editor-container'));
            var panelBody = editorContainer.parent();

            // Create ResizeObserver to detect size changes
            if ($window.ResizeObserver) {
                var ro = new ResizeObserver(function(entries) {
                    for (var i = 0; i < entries.length; i++) {
                        var entry = entries[i];
                        var newHeight = entry.target.offsetHeight;
                        var newWidth = entry.target.offsetWidth;

                        // Update the highlight div dimensions
                        highlightedEl.css({
                            width: newWidth + 'px',
                            height: newHeight + 'px'
                        });

                        // Update the container dimensions
                        editorContainer.css({
                            width: newWidth + 'px',
                            height: newHeight + 'px'
                        });
                    }
                });

                // Observe the textarea
                ro.observe(element[0]);

                // Clean up when scope is destroyed
                scope.$on('$destroy', function() {
                    ro.disconnect();
                });
            } else {
                // Fallback for browsers without ResizeObserver
                element.on('mouseup', function() {
                    var newHeight = element[0].offsetHeight;
                    var newWidth = element[0].offsetWidth;

                    highlightedEl.css({
                        width: newWidth + 'px',
                        height: newHeight + 'px'
                    });

                    editorContainer.css({
                        width: newWidth + 'px',
                        height: newHeight + 'px'
                    });
                });
            }

            // Initial size sync
            highlightedEl.css({
                width: element[0].offsetWidth + 'px',
                height: element[0].offsetHeight + 'px'
            });
        }
    };
}]);