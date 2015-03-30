angular.module 'form'


# ----------------------------------------
# fb-form
# ----------------------------------------
.directive 'fbForm', ['$injector', ($injector) ->
    restrict: 'A'
    require: 'ngModel'  # form data (end-user input value)
    scope:
    # input model for scops in ng-repeat
        formName: '@fbForm'
        output: '=ngModel'
        input: '=fbDefault'
    template:
        """
        <div class='fb-form-object' ng-repeat="object in form" fb-form-object="object"></div>
        """
    controller: 'fbFormController'
    link: (scope, element, attrs) ->
        # providers
        $builder = $injector.get '$builder'

        # get the form for controller
        $builder.forms[scope.formName] ?= []
        scope.form = $builder.forms[scope.formName]
]

# ----------------------------------------
# fbFormController
# ----------------------------------------
.controller 'fbFormController', ['$scope', '$injector', ($scope, $injector) ->
    # providers
    $builder = $injector.get '$builder'
    $timeout = $injector.get '$timeout'

    # set default for input
    $scope.output ?= {}
    $scope.$watch 'form', ->
        # remove superfluous input
        # tell children to update input value.
        # ! use $timeout for waiting $scope updated.
        $timeout ->
            $scope.$broadcast $builder.broadcastChannel.updateInput
    , yes
]

