# ----------------------------------------
# Shared functions
# ----------------------------------------
copyObjectToScope = (object, scope) ->
    ###
    Copy object (ng-repeat="object in objects") to scope without `hashKey`.
    ###
    for key, value of object when key isnt '$$hashKey'
        # copy object.{} to scope.{}
        scope[key] = value
    return


# ----------------------------------------
# builder.controller
# ----------------------------------------
angular.module 'builder.controller', ['builder.provider']

# ----------------------------------------
# fbFormObjectEditableController
# ----------------------------------------
.controller 'fbFormObjectEditableController', ['$scope', '$injector', ($scope, $injector) ->
    $builder = $injector.get '$builder'

    $scope.setupScope = (formObject) ->
        ###
        1. Copy origin formObject (ng-repeat="object in formObjects") to scope.
        2. Setup optionsText with formObject.options.
        3. Watch scope.label, .description, .placeholder, .required, .options then copy to origin formObject.
        4. Watch scope.optionsText then convert to scope.options.
        5. setup validationOptions
        ###
        copyObjectToScope formObject, $scope

        $scope.optionsText = formObject.options.join '\n'

        $scope.$watch '[modelName, label, description, placeholder, required, options, validation, someOptions]', ->
            formObject.modelName = $scope.modelName
            formObject.label = $scope.label
            formObject.description = $scope.description
            formObject.placeholder = $scope.placeholder
            formObject.required = $scope.required
            formObject.options = $scope.options
            formObject.validation = $scope.validation
            formObject.someOptions = $scope.someOptions
        , yes

        $scope.$watch 'optionsText', (text) ->
            $scope.options = (x for x in text.split('\n') when x.length > 0)
            $scope.inputText = $scope.options[0]

        component = $builder.components[formObject.component]
        $scope.validationOptions = component.validationOptions

    $scope.data =
        model: null
        backup: ->
            ###
            Backup input value.
            ###
            @model =
                modelName: $scope.modelName
                label: $scope.label
                description: $scope.description
                placeholder: $scope.placeholder
                required: $scope.required
                optionsText: $scope.optionsText
                validation: $scope.validation
                someOptions: angular.copy $scope.someOptions
        rollback: ->
            ###
            Rollback input value.
            ###
            return if not @model
            $scope.modelName = @model.modelName
            $scope.label = @model.label
            $scope.description = @model.description
            $scope.placeholder = @model.placeholder
            $scope.required = @model.required
            $scope.optionsText = @model.optionsText
            $scope.validation = @model.validation
            $scope.someOptions = @model.someOptions
]


# ----------------------------------------
# fbComponentsController
# ----------------------------------------
.controller 'fbComponentsController', ['$scope', '$injector', ($scope, $injector) ->
    # providers
    $builder = $injector.get '$builder'

    # action
    $scope.selectGroup = ($event, group) ->
        $event?.preventDefault()
        $scope.activeGroup = group
        $scope.components = []
        for name, component of $builder.components when component.group is group
            $scope.components.push component

    $scope.groups = $builder.groups
    $scope.activeGroup = $scope.groups[0]
    $scope.allComponents = $builder.components
    $scope.$watch 'allComponents', -> $scope.selectGroup null, $scope.activeGroup
]


# ----------------------------------------
# fbComponentController
# ----------------------------------------
.controller 'fbComponentController', ['$scope', ($scope) ->
    $scope.copyObjectToScope = (object) -> copyObjectToScope object, $scope
]


# ----------------------------------------
# fbFormController
# ----------------------------------------
.controller 'fbFormController', ['$scope', '$injector', ($scope, $injector) ->
    # providers
    $builder = $injector.get '$builder'
    $timeout = $injector.get '$timeout'

    # set default for input
    $scope.model ?= {}
    $scope.$watch 'form', ->
        # remove superfluous input
        # tell children to update input value.
        # ! use $timeout for waiting $scope updated.
        $timeout ->
            $scope.$broadcast $builder.broadcastChannel.updateInput
    , yes
]


# ----------------------------------------
# fbFormObjectController
# ----------------------------------------
.controller 'fbFormObjectController', ['$scope', '$injector', ($scope, $injector) ->
    # providers
    $builder = $injector.get '$builder'

    $scope.copyObjectToScope = (object) -> copyObjectToScope object, $scope

    $scope.updateInput = (value) ->
        ###
        Copy current scope.input[X] to $parent.input.
        Set model value
        @param value: The input value.
        ###

        setValue = (path, value2) ->
            currentData = $scope.$parent.model
            for value, index in path when path.length > index+1
                currentData[value] = {} unless currentData[value]
                currentData = currentData[value]
            currentData[path[path.length - 1]] = value2

        setValue($scope.formObject.modelName.split('.'), value) if $scope.formObject.modelName

]
