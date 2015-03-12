
# ----------------------------------------
# builder.directive
# ----------------------------------------
angular.module 'builder.directive', [
    'builder.provider'
    'builder.services'
    'builder.controller'
    'builder.drag'
    'validator'
]


# ----------------------------------------
# fb-builder
# ----------------------------------------
.directive 'fbBuilder', ['$injector', ($injector) ->
    # providers
    $builder = $injector.get '$builder'
    $drag = $injector.get '$drag'

    restrict: 'A'
    scope:
        fbBuilder: '='
        formName: '@'
    template:
        """
        <div class='form-horizontal'>
            <div class='fb-form-object-editable' ng-repeat="object in formObjects"
                fb-form-object-editable="object"></div>
        </div>
        """
    link: (scope, element, attrs) ->
        # ----------------------------------------
        # valuables
        # ----------------------------------------
        $builder.forms[scope.formName] ?= []
        scope.formObjects = $builder.forms[scope.formName]
        beginMove = yes

        $(element).addClass 'fb-builder'
        $drag.droppable $(element),
            move: (e) ->
                if beginMove
                    # hide all popovers
                    $("div.fb-form-object-editable").popover 'hide'
                    beginMove = no

                $formObjects = $(element).find '.fb-form-object-editable:not(.empty,.dragging)'
                if $formObjects.length is 0
                    # there are no components in the builder.
                    if $(element).find('.fb-form-object-editable.empty').length is 0
                        $(element).find('>div:first').append $("<div class='fb-form-object-editable empty'></div>")
                    return

                # the positions could added .empty div.
                positions = []
                # first
                positions.push -1000
                for index in [0...$formObjects.length] by 1
                    $formObject = $($formObjects[index])
                    offset = $formObject.offset()
                    height = $formObject.height()
                    positions.push offset.top + height / 2
                positions.push positions[positions.length - 1] + 1000   # last

                # search where should I insert the .empty
                for index in [1...positions.length] by 1
                    if e.pageY > positions[index - 1] and e.pageY <= positions[index]
                        # you known, this one
                        $(element).find('.empty').remove()
                        $empty = $ "<div class='fb-form-object-editable empty'></div>"
                        if index - 1 < $formObjects.length
                            $empty.insertBefore $($formObjects[index - 1])
                        else
                            $empty.insertAfter $($formObjects[index - 2])
                        break
                return
            out: ->
                if beginMove
                    # hide all popovers
                    $("div.fb-form-object-editable").popover 'hide'
                    beginMove = no

                $(element).find('.empty').remove()
            up: (e, isHover, draggable) ->
                beginMove = yes
                if not $drag.isMouseMoved()
                    # click event
                    $(element).find('.empty').remove()
                    return

                if not isHover and draggable.mode is 'drag'
                    # remove the form object by draggin out
                    formObject = draggable.object.formObject
                    if formObject.editable
                        $builder.removeFormObject scope.formName, formObject.index
                else if isHover
                    if draggable.mode is 'mirror'
                        # insert a form object
                        $builder.insertFormObject scope.formName, $(element).find('.empty').index(),
                            component: draggable.object.componentName
                    if draggable.mode is 'drag'
                        # update the index of form objects
                        oldIndex = draggable.object.formObject.index
                        newIndex = $(element).find('.empty').index()
                        newIndex-- if oldIndex < newIndex
                        $builder.updateFormObjectIndex scope.formName, oldIndex, newIndex
                $(element).find('.empty').remove()
]

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


# ----------------------------------------
# fb-components
# ----------------------------------------
.directive 'fbComponents', ->
    restrict: 'A'
    template:
        """
        <ul ng-if="groups.length > 1" class="nav nav-tabs nav-justified">
            <li ng-repeat="group in groups" ng-class="{active:activeGroup==group}">
                <a href='#' ng-click="selectGroup($event, group)">{{group}}</a>
            </li>
        </ul>
        <div class='form-horizontal'>
            <div class='fb-component' ng-repeat="component in components"
                fb-component="component"></div>
        </div>
        """
    controller: 'fbComponentsController'

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
# fb-layout-builder
# ----------------------------------------
.directive 'fbLayoutBuilder', ['$builder', '$compile', 'utils', ($builder, $compile, utils) ->
    fbLayoutBuilder =
        restrict: 'A',
        scope:
            layout: '=fbLayoutBuilder'
        template:
            """
            <div class="panel panel-default" style='position: relative;'>
                <div class="panel-heading">
                    <h3 class="panel-title">Builder</h3>
                </div>

                <div class="row" ng-repeat="row in layout.rows">
                    <div class="col-md-{{column.width}}" ng-repeat="column in row.columns">
                        <div fb-builder="column.formData.views" form-name="{{$parent.$index + '' + $index}}"></div>
                    </div>
                </div>
            </div>

            """
        templatePopover:
            """
            <form role="form" class='form-horizontal'>

                    <div class="form-group" ng-repeat='row in layout.rows'>
                        <label class='col-lg-1 control-label' ng-click="removeRow(row)">x</label>
                        <div class='col-lg-11'>
                            <div class='col-lg-{{column.width}}' ng-repeat='column in row.columns'>
                                <input type='text' class='form-control' ng-model='column.width'/>
                                <label class='col-lg-1 control-label' ng-click='removeColumn(row, column)'>x</label>
                            </div>
                            <label class='btn btn-default' ng-click='addColumn(row)'>+</label>
                        </div>
                    </div>

                <label class='btn btn-default' ng-click='addRow()'>+</label>
            </form>
            """
        link: (scope, element) ->

            viewPopover = $compile(fbLayoutBuilder.templatePopover) scope

            $(element).popover
                html: yes
                title: 'layout settings'
                content: viewPopover
                container: 'body'
                placement: 'right'

            scope.showSettings = no

            scope.removeRow = (row) ->
                scope.layout.rows.splice scope.layout.rows.indexOf(row), 1

            scope.removeColumn = (row, column) ->
                row.columns.splice row.columns.indexOf(column), 1

            scope.addColumn = (row) ->
                indexRow = scope.layout.rows.indexOf row
                indexColumn = row.columns.length
                row.columns.push
                  width: 12, formData:
                      inputs: [],
                      name: "example",
                      views: [{
                          "id": utils.guid(),
                          "component": "textInput",
                          "editable": true,
                          "index": 2,
                          "label": "Text Input2",
                          "description": "description",
                          "placeholder": "placeholder",
                          "options": [],
                          "required": false,
                          "validation": "/.*/"
                      }]
                $builder.addAllFormObject("#{indexRow}#{indexColumn}", scope.layout.rows[indexRow].columns[indexColumn].formData.views)

            scope.addRow = ->
                index = scope.layout.rows.length
                scope.layout.rows.push
                    columns: [{
                        width: 12, formData: {
                            inputs: [],
                            name: "example",
                            views: [{
                                "id": utils.guid(),
                                "component": "textInput",
                                "editable": true,
                                "index": 2,
                                "label": "Text Input2",
                                "description": "description",
                                "placeholder": "placeholder",
                                "options": [],
                                "required": false,
                                "validation": "/.*/"
                            }]
                        }
                    }]
                $builder.addAllFormObject("#{index}0", scope.layout.rows[index].columns[0].formData.views)
    fbLayoutBuilder
]


.directive 'fbLayout', ['$builder', ($builder) ->

    restrict: 'A'
    scope:
        layout: '=fbLayout'
        model: '='
    template:
        """
        <div class="row" ng-repeat="row in layout.rows">
            <div class="col-md-{{column.width}}" ng-repeat="column in row.columns">
                <div ng-model="column.formData.inputs" model="model" fb-form="{{$parent.$index + '' + $index}}" fb-default="defaultValue[$parent.$index + '' + $index]"></div>
            </div>
        </div>
        """
    link: (scope) ->

        scope.defaultValue = {}
        scope.model ?= {}

        for row, i in scope.layout.rows
            for column, j in row.columns
                $builder.addAllFormObject "#{i}#{j}", column.formData.views
                scope.defaultValue["#{i}#{j}"] = {}
                for input in column.formData.inputs
                    scope.defaultValue["#{i}#{j}"][input.id] = input.value

]

# ----------------------------------------
# fb-form
# ----------------------------------------
.directive 'fbForm', ['$injector', ($injector) ->
    restrict: 'A'
    require: 'ngModel'  # form data (end-user input value)
    scope:
        # input model for scops in ng-repeat
        formName: '@fbForm'
        input: '=ngModel'
        model: '='
        default: '=fbDefault'
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
# fb-form-object
# ----------------------------------------
.directive 'fbFormObject', ['$injector', ($injector) ->
    # providers
    $builder = $injector.get '$builder'
    $compile = $injector.get '$compile'
    $parse = $injector.get '$parse'

    restrict: 'A'
    controller: 'fbFormObjectController'
    link: (scope, element, attrs) ->
        # ----------------------------------------
        # variables
        # ----------------------------------------
        scope.formObject = $parse(attrs.fbFormObject) scope
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
        scope.$watch 'inputText', -> scope.updateInput scope.inputText
        scope.$watch 'modelName', (newValue, oldValue) ->
            delete scope.$parent.model[oldValue] if scope.$parent.model[oldValue]
        # watch (management updated form objects
        scope.$watch attrs.fbFormObject, ->
            scope.copyObjectToScope scope.formObject
        , yes

        scope.$watch '$component.template', (template) ->
            return if not template
            $template = $(template)
            # add validator
            $input = $template.find "[ng-model='inputText']"
            $input.attr
                validator: '{{validation}}'
            # compile
            view = $compile($template) scope
            $(element).html view

        # select the first option
        if not scope.$component.arrayToText and scope.formObject.options.length > 0
            scope.inputText = scope.formObject.options[0]

        # set default value
        scope.$watch "default['#{scope.formObject.id}']", (value) ->
            return if not value
            if scope.$component.arrayToText
                scope.inputArray = value
            else
                scope.inputText = value
]
