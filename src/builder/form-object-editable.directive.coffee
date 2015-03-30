angular.module 'builder'


# ----------------------------------------
# fb-form-object-editable
# ----------------------------------------
.directive 'fbFormObjectEditable', ['$injector', ($injector) ->
    # providers
    $builder = $injector.get '$builder'
    $drag = $injector.get '$drag'
    $compile = $injector.get '$compile'
    $validator = $injector.get '$validator'

    restrict: 'A'
    controller: 'fbFormObjectEditableController'
    scope:
        formObject: '=fbFormObjectEditable'
    link: (scope, element) ->
        scope.formName = scope.$parent.formName
        scope.inputArray = [] # just for fix warning
        # get component
        scope.$component = $builder.components[scope.formObject.component]
        # setup scope
        scope.setupScope scope.formObject

        # compile formObject
        scope.$watch '$component.template', (template) ->
            return if not template
            view = $compile(template) scope
            $(element).html view

        # disable click event
        $(element).on 'click', -> no

        # draggable
        $drag.draggable $(element),
            object:
                formObject: scope.formObject

        # do not setup bootstrap popover
        return if not scope.formObject.editable

        # ----------------------------------------
        # bootstrap popover
        # ----------------------------------------
        popover = {}
        scope.$watch '$component.popoverTemplate', (template) ->
            return if not template
            $(element).removeClass popover.id
            popover =
                id: "fb-#{Math.random().toString().substr(2)}"
                isClickedSave: no # If didn't click save then rollback
                view: null
                html: template
            popover.html = $(popover.html).addClass popover.id
            # compile popover
            popover.view = $compile(popover.html) scope
            $(element).addClass popover.id
            $(element).popover
                html: yes
                title: scope.$component.label
                content: popover.view
                container: 'body'
                placement: $builder.config.popoverPlacement
        scope.popover =
            save: ($event) ->
                ###
                The save event of the popover.
                ###
                $event.preventDefault()
                $validator.validate(scope).success ->
                    popover.isClickedSave = yes
                    $(element).popover 'hide'
                return
            remove: ($event) ->
                ###
                The delete event of the popover.
                ###
                $event.preventDefault()

                $builder.removeFormObject scope.$parent.formName, scope.$parent.$index
                $(element).popover 'hide'
                return
            shown: ->
                ###
                The shown event of the popover.
                ###
                scope.data.backup()
                popover.isClickedSave = no
            cancel: ($event) ->
                ###
                The cancel event of the popover.
                ###
                scope.data.rollback()
                if $event
                    # clicked cancel by user
                    $event.preventDefault()
                    $(element).popover 'hide'
                return
        # ----------------------------------------
        # popover.show
        # ----------------------------------------
        $(element).on 'show.bs.popover', ->
            return no if $drag.isMouseMoved()
            # hide other popovers
            $("div.fb-form-object-editable:not(.#{popover.id})").popover 'hide'

            $popover = $("form.#{popover.id}").closest '.popover'
            if $popover.length > 0
                # fixed offset
                elementOrigin = $(element).offset().top + $(element).height() / 2
                popoverTop = elementOrigin - $popover.height() / 2
                $popover.css
                    position: 'absolute'
                    top: popoverTop

                $popover.show()
                setTimeout ->
                    $popover.addClass 'in'
                    $(element).triggerHandler 'shown.bs.popover'
                , 0
                no
        # ----------------------------------------
        # popover.shown
        # ----------------------------------------
        $(element).on 'shown.bs.popover', ->
            # select the first input
            $(".popover .#{popover.id} input:first").select()
            scope.$apply -> scope.popover.shown()
            return
        # ----------------------------------------
        # popover.hide
        # ----------------------------------------
        $(element).on 'hide.bs.popover', ->
            # do not remove the DOM
            $popover = $("form.#{popover.id}").closest '.popover'
            if not popover.isClickedSave
                # eval the cancel event
                if scope.$$phase or scope.$root.$$phase
                    scope.popover.cancel()
                else
                    scope.$apply -> scope.popover.cancel()
            $popover.removeClass 'in'
            setTimeout ->
                $popover.hide()
            , 300
            no
]

.controller 'fbFormObjectEditableController', ['$scope', '$injector', ($scope, $injector) ->
    $builder = $injector.get '$builder'
    utilsBuilder = $injector.get 'utilsBuilder'

    $scope.setupScope = (formObject) ->
        ###
        1. Copy origin formObject (ng-repeat="object in formObjects") to scope.
        2. Setup optionsText with formObject.options.
        3. Watch scope.label, .description, .placeholder, .required, .options then copy to origin formObject.
        4. Watch scope.optionsText then convert to scope.options.
        5. setup validationOptions
        ###
        utilsBuilder.copyObjectToScope formObject, $scope

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


