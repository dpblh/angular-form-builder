angular.module 'form'


# ----------------------------------------
# fb-form-object
# ----------------------------------------
.directive 'fbFormObject', ['$injector', ($injector) ->
    # providers
    $builder = $injector.get '$builder'
    $compile = $injector.get '$compile'
    $parse = $injector.get '$parse'
    $timeout = $injector.get '$timeout'

    restrict: 'A'
    controller: 'fbFormObjectController'
    link: (scope, element, attrs) ->
        # ----------------------------------------
        # variables
        # ----------------------------------------
        scope.formObject = $parse(attrs.fbFormObject) scope
        scope.validationGroup = 'default'
        scope.$component = $builder.components[scope.formObject.component]

        # ----------------------------------------
        # scope
        # ----------------------------------------
        # listen (formObject updated
        scope.$on $builder.broadcastChannel.updateInput, -> scope.updateInput scope.inputText
        if scope.$component.arrayToText
            scope.inputArray = []
            # watch (end-user updated input of the form
            scope.$watch 'inputArray', (newValue, oldValue) ->
                # array input, like checkbox
                return if newValue is oldValue
                checked = []
                for index of scope.inputArray when scope.inputArray[index]
                    checked.push scope.options[index] ? scope.inputArray[index]
                scope.inputText = checked
            , yes
        initValue = yes
        scope.$watch 'inputText', ->
            return initValue = no if initValue == yes
            scope.updateInput scope.inputText
        scope.$watch 'modelName', (newValue, oldValue) ->
            return unless oldValue
            $timeout.cancel modelTime
            modelTime = $timeout ->
                objectsPool = []
                currentObject =  scope.$parent.output
                for value, index in oldValue.split '.'
                    objectsPool.push
                        parent: currentObject
                        name: value
                    currentObject = currentObject[value]

                objectsPool = objectsPool.reverse()
                firstObject = objectsPool.shift()
                firstObject.parent[firstObject.name] = undefined
                for value in objectsPool
                    delete value.parent[value.name] if angular.equals {}, value.parent[value.name]
            ,1000

        # watch (management updated form objects
        scope.$watch attrs.fbFormObject, ->
            scope.copyObjectToScope scope.formObject
        , yes

        scope.$watch '$component.template', (template) ->
            return if not template
            # add validator
            element.html template
            $input = element.find "input"
            $input.attr
                validator: '{{validation}}'
            # compile
            $compile(element.contents()) scope

        # select the first option
        if not scope.$component.arrayToText and scope.formObject.options.length > 0
            scope.inputText = scope.formObject.options[0]

        # set default value
        scope.$watch "output.#{scope.formObject.modelName}", (value) ->
            if scope.$component.arrayToText
                scope.inputArray = value
            else
                scope.inputText = value
]


# ----------------------------------------
# fbFormObjectController
# ----------------------------------------
.controller 'fbFormObjectController', ['$scope', '$injector', ($scope, $injector) ->
    # providers
    $builder = $injector.get '$builder'
    utilsBuilder = $injector.get 'utilsBuilder'

    $scope.copyObjectToScope = (object) -> utilsBuilder.copyObjectToScope object, $scope

    $scope.updateInput = (value) ->
        ###
        Copy current scope.input[X] to $parent.input.
        Set model value
        @param value: The input value.
        ###

        setValue = (path, value2) ->
            currentData = $scope.$parent.output
            for value, index in path when path.length > index+1
                currentData[value] = {} unless currentData[value]
                currentData = currentData[value]
            currentData[path[path.length - 1]] = value2

        setValue($scope.formObject.modelName.split('.'), value) if $scope.formObject.modelName

]
