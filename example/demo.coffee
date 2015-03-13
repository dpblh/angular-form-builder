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


.controller 'DemoController', ['$scope', '$builder', '$validator', '$timeout', ($scope, $builder, $validator, $timeout) ->
    # ----------------------------------------
    # builder
    # ----------------------------------------

    $scope.model =
        id: 1
#    $timeout( ->
    $scope.layout =
    {
        "rows": [{
            "columns": [{
                "width": 6, "formData": {
                    "inputs": [], "name": "example", "views": [
                        "id": "a1c5624a-a44d-c220-56f3-03d22828323d"
                        "component": "checkbox"
                        "editable": true
                        "index": 0
                        "label": "Checkbox"
                        "description": "description"
                        "placeholder": "placeholder"
                        "options": ["value one", "value two"]
                        "required": false
                        "validation": "/.*/"
                        "modelName": "personal.data.lastName"
                    ,
                        "id":"ea1f2e51-4d37-4460-b67e-f0f32c9ea22e"
                        "component":"textInput"
                        "editable":true,"index":1
                        "label":"Text Input"
                        "description":"description"
                        "placeholder":"placeholder"
                        "options":[]
                        "required":false
                        "validation":"/.*/"
                        "modelName":"personal.data.middleName"
                    ]
                }
            }]
        }]
        default:
            "personal":
                "data":
                    "lastName":
                        ["value one","value two"]
                    "middleName":
                        "ser"
    }
#    , 5000)


    $timeout(
        -> $scope.layout.default.personal.data.middleName = "fggggggggggggggggg"
    , 1000)


#    $scope.default =
#        "ert":
#            ["value one","value two"]
#        "one":
#            ["value one","value two"]

#    $scope.layout =
#        rows: []




    $scope.submit = ->
        $validator.validate $scope, 'default'
        .success -> console.log 'success'
        .error -> console.log 'error'
]