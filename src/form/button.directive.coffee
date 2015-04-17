'use strict'
angular.module 'builder.directive'
.directive 'builderButton', ['$rootScope', ($rootScope)->
    restrict: 'E'
    scope:
        source: '@'
        label: '@'
        color: '@'
    replace: true
    template: '<label class="btn {{color}} btn-form" ng-click="click()" ng-bind="label"></label>'
    link: (scope)->
        scope.click = ->
            $rootScope.formScope.$eval(scope.source)
]