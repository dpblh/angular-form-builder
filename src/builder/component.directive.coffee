angular.module 'builder'


# ----------------------------------------
# fb-component
# ----------------------------------------
.directive 'fbComponent', ['$injector', ($injector) ->
    # providers
    $builder = $injector.get '$builder'
    $drag = $injector.get '$drag'
    $compile = $injector.get '$compile'

    restrict: 'A'
    scope:
        component: '=fbComponent'
    controller: 'fbComponentController'
    link: (scope, element) ->
        scope.copyObjectToScope scope.component

        $drag.draggable $(element),
            mode: 'mirror'
            defer: no
            object:
                componentName: scope.component.name

        scope.$watch 'component.template', (template) ->
            return if not template
            view = $compile(template) scope
            $(element).html view
]

# ----------------------------------------
# fbComponentController
# ----------------------------------------
.controller 'fbComponentController', ['$scope', 'utilsBuilder', ($scope, utilsBuilder) ->
    $scope.copyObjectToScope = (object) -> utilsBuilder.copyObjectToScope object, $scope
]
