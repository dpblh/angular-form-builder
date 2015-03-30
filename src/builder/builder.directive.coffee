angular.module 'builder'


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
