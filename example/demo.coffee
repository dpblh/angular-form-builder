angular.module 'app', ['builder', 'builder.components', 'validator.rules']

.run ['$builder', ($builder) ->
    $builder.registerComponent 'sampleInput',
        group: 'from html'
        label: 'Sample'
        description: 'From html template'
        placeholder: 'placeholder'
        required: no
        validationOptions: [
            {label: 'none', rule: '/.*/'}
            {label: 'number', rule: '[number]'}
            {label: 'email', rule: '[email]'}
            {label: 'url', rule: '[url]'}
        ]
        templateUrl: 'example/template.html'
        popoverTemplateUrl: 'example/popoverTemplate.html'

    # ----------------------------------------
    # two text input
    # ----------------------------------------
    $builder.registerComponent 'name',
        group: 'Default'
        label: 'Name'
        required: no
        arrayToText: yes
        template:
            """
            <div class="form-group">
                <label for="{{formName+index}}" class="col-md-4 control-label" ng-class="{'fb-required':required}">{{label}}</label>
                <div class="col-md-8">
                    <input type='hidden' ng-model="inputText" validator-required="{{required}}" validator-group="{{formName}}"/>
                    <div class="col-sm-6" style="padding-left: 0;">
                        <input type="text"
                            ng-model="inputArray[0]"
                            class="form-control" id="{{formName+index}}-0"/>
                        <p class='help-block'>First name</p>
                    </div>
                    <div class="col-sm-6" style="padding-left: 0;">
                        <input type="text"
                            ng-model="inputArray[1]"
                            class="form-control" id="{{formName+index}}-1"/>
                        <p class='help-block'>Last name</p>
                    </div>
                </div>
            </div>
            """
        popoverTemplate:
            """
            <form>
                <div class="form-group">
                    <label class='control-label'>Label</label>
                    <input type='text' ng-model="label" validator="[required]" class='form-control'/>
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
]


.controller 'DemoController', ['$scope', '$builder', '$validator', ($scope, $builder, $validator) ->
    # ----------------------------------------
    # builder
    # ----------------------------------------


    $scope.default = {};

    $scope.layout =
        rows:
            [
                {
                    columns: [{
                        width: 6, formData: {
                            inputs: [{"id": "example2", "label": "Text Input2", "value": "hello"}],
                            name: "example",
                            views: [{
                                "id": "example2",
                                "component": "textInput",
                                "editable": true,
                                "label": "Text Input2",
                                "description": "description",
                                "placeholder": "placeholder",
                                "options": [],
                                "required": false,
                                "validation": "/.*/"
                            }]
                        }
                    }, {
                        width: 6, formData: {
                            inputs: [],
                            name: "example",
                            views: [{
                                "id": "example3",
                                "component": "textInput",
                                "editable": true,
                                "label": "Text Input2",
                                "description": "description",
                                "placeholder": "placeholder",
                                "options": [],
                                "required": false,
                                "validation": "/.*/"
                            }]
                        }
                    }]
                },
                {
                    columns: [{
                        width: 12, formData: {
                            inputs: [],
                            name: "example",
                            views: [{
                                "id": "example4",
                                "component": "textInput",
                                "editable": true,
                                "label": "Text Input2",
                                "description": "description",
                                "placeholder": "placeholder",
                                "options": [],
                                "required": false,
                                "validation": "/.*/"
                            }]
                        }
                    }]
                }
            ]

    $scope.submit = ->
        $validator.validate $scope, 'default'
        .success -> console.log 'success'
        .error -> console.log 'error'
]