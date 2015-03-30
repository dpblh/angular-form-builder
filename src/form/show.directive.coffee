'use strict';
angular.module 'builder.directive', []

.directive 'builderShow', ['$parse', ($parse) ->

    restrict: 'A'
    multiElement: true,
    scope:
        builderShow: '='
    link: (scope, element) ->
        scope.$watch 'builderShow', (newValue)->
            scope.model = scope.$parent.$parent.output
            try showFn = $parse newValue catch e then
            @unwatch() if @unwatch
            if showFn
                @unwatch = scope.$watch ->
                    showFn scope
                , (value) ->
                    if value then element.removeClass('ng-hide') else element.addClass('ng-hide')
]