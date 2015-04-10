angular.module 'builder.components', ['form', 'validator.rules']

.config ['$builderProvider', 'rulesProvider', '$validatorProvider', ($builderProvider, rulesProvider, $validatorProvider) ->

    rulesProvider.register 'none', '/.*/'
    rulesProvider.register 'default', '[default]'
    rulesProvider.register 'number', '[number, default]'
    rulesProvider.register 'email', '[email, default]'
    rulesProvider.register 'url', '[url, default]'

    $validatorProvider.register 'default',
        validator: -> no
        error: ''

    # ----------------------------------------
    # text input
    # ----------------------------------------
    $builderProvider.registerComponent 'textInput',
        group: 'Default'
        modelName: 'model name'
        label: 'Text Input'
        description: 'description'
        placeholder: 'placeholder'
        required: no
        show: 'true'
        validationOptions: rulesProvider.rules
        template:
            """
            <div class="form-group" builder-show="show">
                <label for="{{formName+index}}" class="col-sm-4 control-label" ng-class="{'fb-required':required}">{{label}}</label>
                <div class="col-sm-8">
                    <input type="text" ng-model="inputText" validator-required="{{required}}" validator-group="{{validationGroup}}" id="{{formName+index}}" class="form-control" placeholder="{{placeholder}}"/>
                    <p class='help-block' ng-if='description'>{{description}}</p>
                </div>
            </div>
            """
        popoverTemplate:
            """
            <form>
                <div class="form-group">
                    <label class='control-label'>Model name</label>
                    <input type='text' ng-model="modelName" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Label</label>
                    <input type='text' ng-model="label" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Description</label>
                    <input type='text' ng-model="description" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Placeholder</label>
                    <input type='text' ng-model="placeholder" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>ngShow</label>
                    <input type='text' ng-model="show" class='form-control'/>
                </div>
                <div class="checkbox">
                    <label>
                        <input type='checkbox' ng-model="required" />
                        Required</label>
                </div>
                <div class="form-group" ng-if="validationOptions.length > 0">
                    <label class='control-label'>Validation</label>
                    <select ng-model="$parent.validation" class='form-control' ng-options="option.rule as option.label for option in validationOptions"></select>
                </div>

                <hr/>
                <div class='form-group'>
                    <input type='submit' ng-click="popover.save($event)" class='btn btn-primary' value='Save'/>
                    <input type='button' ng-click="popover.cancel($event)" class='btn btn-default' value='Cancel'/>
                    <input type='button' ng-click="popover.remove($event)" class='btn btn-danger' value='Delete'/>
                </div>
            </form>
            """

    # ----------------------------------------
    # Text area
    # ----------------------------------------
    $builderProvider.registerComponent 'textArea',
        group: 'Default'
        modelName: 'model name'
        label: 'Text Area'
        description: 'description'
        placeholder: 'placeholder'
        required: no
        show: 'true'
        template:
            """
            <div class="form-group" builder-show="show">
                <label for="{{formName+index}}" class="col-sm-4 control-label" ng-class="{'fb-required':required}">{{label}}</label>
                <div class="col-sm-8">
                    <textarea type="text" ng-model="inputText" validator-required="{{required}}" validator="[default]" validator-group="{{validationGroup}}" id="{{formName+index}}" class="form-control" rows='6' placeholder="{{placeholder}}"/>
                    <p class='help-block' ng-if='description'>{{description}}</p>
                </div>
            </div>
            """
        popoverTemplate:
            """
            <form>
                <div class="form-group">
                    <label class='control-label'>Model name</label>
                    <input type='text' ng-model="modelName" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Label</label>
                    <input type='text' ng-model="label" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Description</label>
                    <input type='text' ng-model="description" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Placeholder</label>
                    <input type='text' ng-model="placeholder" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>ngShow</label>
                    <input type='text' ng-model="show" class='form-control'/>
                </div>
                <div class="checkbox">
                    <label>
                        <input type='checkbox' ng-model="required" />
                        Required</label>
                </div>

                <hr/>
                <div class='form-group'>
                    <input type='submit' ng-click="popover.save($event)" class='btn btn-primary' value='Save'/>
                    <input type='button' ng-click="popover.cancel($event)" class='btn btn-default' value='Cancel'/>
                    <input type='button' ng-click="popover.remove($event)" class='btn btn-danger' value='Delete'/>
                </div>
            </form>
            """

    # ----------------------------------------
    # checkbox
    # ----------------------------------------
    $builderProvider.registerComponent 'checkbox',
        group: 'Default'
        modelName: 'model name'
        label: 'Checkbox'
        description: 'description'
        placeholder: 'placeholder'
        required: no
        show: 'true'
        options: ['value one', 'value two']
        arrayToText: yes
        template:
            """
            <div class="form-group" builder-show="show">
                <label for="{{formName+index}}" class="col-sm-4 control-label" ng-class="{'fb-required':required}">{{label}}</label>
                <div class="col-sm-8">
                    <input type='hidden' ng-model="inputText" validator-required="{{required}}" validator="[default]" validator-group="{{validationGroup}}"/>
                    <div class='checkbox' ng-repeat="item in options track by $index">
                        <label><input type='checkbox' ng-model="$parent.inputArray[$index]" ng-checked='$parent.inputArray[$index]' value='item'/>
                            {{item}}
                        </label>
                    </div>
                    <p class='help-block' ng-if='description'>{{description}}</p>
                </div>
            </div>
            """
        popoverTemplate:
            """
            <form>
                <div class="form-group">
                    <label class='control-label'>Model name</label>
                    <input type='text' ng-model="modelName" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Label</label>
                    <input type='text' ng-model="label" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Description</label>
                    <input type='text' ng-model="description" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Options</label>
                    <textarea class="form-control" rows="3" ng-model="optionsText"/>
                </div>
                <div class="form-group">
                    <label class='control-label'>ngShow</label>
                    <input type='text' ng-model="show" class='form-control'/>
                </div>
                <div class="checkbox">
                    <label>
                        <input type='checkbox' ng-model="required" />
                        Required
                    </label>
                </div>

                <hr/>
                <div class='form-group'>
                    <input type='submit' ng-click="popover.save($event)" class='btn btn-primary' value='Save'/>
                    <input type='button' ng-click="popover.cancel($event)" class='btn btn-default' value='Cancel'/>
                    <input type='button' ng-click="popover.remove($event)" class='btn btn-danger' value='Delete'/>
                </div>
            </form>
            """

    $builderProvider.registerComponent 'check',
        group: 'Default'
        modelName: 'model name'
        label: 'Check'
        description: 'description'
        placeholder: 'placeholder'
        required: no
        show: 'true'
        template:
            """
            <div class="form-group" builder-show="show">
                <label for="{{formName+index}}" class="col-sm-4 control-label" ng-class="{'fb-required':required}">{{label}}</label>
                <div class="col-sm-8">
                    <label><input type='checkbox' validator="[default]" ng-model="inputText" validator-group="{{validationGroup}}"/>
                        {{item}}
                    </label>
                    <p class='help-block' ng-if='description'>{{description}}</p>
                </div>
            </div>
            """
        popoverTemplate:
            """
            <form>
                <div class="form-group">
                    <label class='control-label'>Model name</label>
                    <input type='text' ng-model="modelName" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Label</label>
                    <input type='text' ng-model="label" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Description</label>
                    <input type='text' ng-model="description" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>ngShow</label>
                    <input type='text' ng-model="show" class='form-control'/>
                </div>
                <div class="checkbox">
                    <label>
                        <input type='checkbox' ng-model="required" />
                        Required
                    </label>
                </div>

                <hr/>
                <div class='form-group'>
                    <input type='submit' ng-click="popover.save($event)" class='btn btn-primary' value='Save'/>
                    <input type='button' ng-click="popover.cancel($event)" class='btn btn-default' value='Cancel'/>
                    <input type='button' ng-click="popover.remove($event)" class='btn btn-danger' value='Delete'/>
                </div>
            </form>
            """

    # ----------------------------------------
    # radio
    # ----------------------------------------
    $builderProvider.registerComponent 'radio',
        group: 'Default'
        modelName: 'model name'
        label: 'Radio'
        description: 'description'
        placeholder: 'placeholder'
        required: no
        show: 'true'
        options: ['value one', 'value two']
        template:
            """
            <div class="form-group" builder-show="show">
                <label for="{{formName+index}}" class="col-sm-4 control-label" ng-class="{'fb-required':required}">{{label}}</label>
                <div class="col-sm-8">
                    <div class='radio' ng-repeat="item in options track by $index">
                        <label><input name='{{formName+index}}' ng-model="$parent.inputText" validator-group="{{validationGroup}}" validator="[default]" value='{{item}}' type='radio'/>
                            {{item}}
                        </label>
                    </div>
                    <p class='help-block' ng-if='description'>{{description}}</p>
                </div>
            </div>
            """
        popoverTemplate:
            """
            <form>
                <div class="form-group">
                    <label class='control-label'>Model name</label>
                    <input type='text' ng-model="modelName" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Label</label>
                    <input type='text' ng-model="label" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Description</label>
                    <input type='text' ng-model="description" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Options</label>
                    <textarea class="form-control" rows="3" ng-model="optionsText"/>
                </div>
                <div class="form-group">
                    <label class='control-label'>ngShow</label>
                    <input type='text' ng-model="show" class='form-control'/>
                </div>

                <hr/>
                <div class='form-group'>
                    <input type='submit' ng-click="popover.save($event)" class='btn btn-primary' value='Save'/>
                    <input type='button' ng-click="popover.cancel($event)" class='btn btn-default' value='Cancel'/>
                    <input type='button' ng-click="popover.remove($event)" class='btn btn-danger' value='Delete'/>
                </div>
            </form>
            """

    # ----------------------------------------
    # select
    # ----------------------------------------
    $builderProvider.registerComponent 'select',
        group: 'Default'
        modelName: 'model name'
        label: 'Select'
        description: 'description'
        placeholder: 'placeholder'
        required: no
        show: 'true'
        options: ['value one', 'value two']
        template:
            """
            <div class="form-group" builder-show="show">
                <label for="{{formName+index}}" class="col-sm-4 control-label">{{label}}</label>
                <div class="col-sm-8">
                    <select ng-options="value for value in options" id="{{formName+index}}" class="form-control" validator-group="{{validationGroup}}"
                        ng-model="inputText" validator="[default]" ng-init="inputText = options[0]"/>
                    <p class='help-block' ng-if='description'>{{description}}</p>
                </div>
            </div>
            """
        popoverTemplate:
            """
            <form>
                <div class="form-group">
                    <label class='control-label'>Model name</label>
                    <input type='text' ng-model="modelName" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Label</label>
                    <input type='text' ng-model="label" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Description</label>
                    <input type='text' ng-model="description" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Options</label>
                    <textarea class="form-control" rows="3" ng-model="optionsText"/>
                </div>
                <div class="form-group">
                    <label class='control-label'>ngShow</label>
                    <input type='text' ng-model="show" class='form-control'/>
                </div>

                <hr/>
                <div class='form-group'>
                    <input type='submit' ng-click="popover.save($event)" class='btn btn-primary' value='Save'/>
                    <input type='button' ng-click="popover.cancel($event)" class='btn btn-default' value='Cancel'/>
                    <input type='button' ng-click="popover.remove($event)" class='btn btn-danger' value='Delete'/>
                </div>
            </form>
            """
]
