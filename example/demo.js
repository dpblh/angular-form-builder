(function() {
  angular.module('app', ['builder', 'builder.components', 'validator.rules']).run([
    '$builder', function($builder) {
      $builder.registerComponent('sampleInput', {
        group: 'from html',
        label: 'Sample',
        description: 'From html template',
        placeholder: 'placeholder',
        required: false,
        validationOptions: [
          {
            label: 'none',
            rule: '/.*/'
          }, {
            label: 'number',
            rule: '[number]'
          }, {
            label: 'email',
            rule: '[email]'
          }, {
            label: 'url',
            rule: '[url]'
          }
        ],
        templateUrl: 'example/template.html',
        popoverTemplateUrl: 'example/popoverTemplate.html'
      });
      return $builder.registerComponent('name', {
        group: 'Default',
        label: 'Name',
        required: false,
        arrayToText: true,
        template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-md-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-md-8\">\n        <input type='hidden' ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[0]\"\n                class=\"form-control\" id=\"{{formName+index}}-0\"/>\n            <p class='help-block'>First name</p>\n        </div>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[1]\"\n                class=\"form-control\" id=\"{{formName+index}}-1\"/>\n            <p class='help-block'>Last name</p>\n        </div>\n    </div>\n</div>",
        popoverTemplate: "<form>\n    <div class=\"form-group\">\n        <label class='control-label'>Label</label>\n        <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type='checkbox' ng-model=\"required\" />\n            Required\n        </label>\n    </div>\n\n    <hr/>\n    <div class='form-group'>\n        <input type='submit' ng-click=\"popover.save($event)\" class='btn btn-primary' value='Save'/>\n        <input type='button' ng-click=\"popover.cancel($event)\" class='btn btn-default' value='Cancel'/>\n        <input type='button' ng-click=\"popover.remove($event)\" class='btn btn-danger' value='Delete'/>\n    </div>\n</form>"
      });
    }
  ]).controller('DemoController', [
    '$scope', '$builder', '$validator', '$timeout', function($scope, $builder, $validator, $timeout) {
      $scope.layout = {
        "rows": [
          {
            "label": "Персональные данные",
            "columns": [
              {
                "width": 6,
                "formData": {
                  "name": "example",
                  "views": [
                    {
                      "id": "a1c5624a-a44d-c220-56f3-03d22828323d",
                      "component": "checkbox",
                      "show": "true",
                      "editable": true,
                      "index": 0,
                      "label": "Checkbox",
                      "description": "description",
                      "placeholder": "placeholder",
                      "options": ["value one", "value two"],
                      "required": false,
                      "validation": "/.*/",
                      "modelName": "personal.data.lastName"
                    }, {
                      "id": "ea1f2e51-4d37-4460-b67e-f0f32c9ea22e",
                      "component": "textInput",
                      "show": "true",
                      "editable": true,
                      "index": 1,
                      "label": "Text Input",
                      "description": "description",
                      "placeholder": "placeholder",
                      "options": [],
                      "required": false,
                      "validation": "/.*/",
                      "modelName": "personal.data.middleName"
                    }, {
                      "id": "8e3e143c-40ea-e61d-e051-c81ce1be2ab1",
                      "component": "check",
                      "show": "true",
                      "editable": true,
                      "index": 2,
                      "label": "Check",
                      "description": "description",
                      "placeholder": "placeholder",
                      "options": [],
                      "required": false,
                      "validation": "/.*/",
                      "modelName": "personal.data.eeee"
                    }
                  ]
                }
              }
            ]
          }
        ]
      };
      $scope.output = {};
      $scope.output = {
        "personal": {
          "data": {
            "lastName": ["value one"],
            "middleName": "1111111111111111111111111",
            "eeee": true
          }
        }
      };
      $timeout(function() {
        return $scope.output = {
          "personal": {
            "data": {
              "lastName": ["value one", "value two"],
              "middleName": "serddddddd",
              "eeee": false
            }
          }
        };
      }, 2000);
      $timeout(function() {
        return $scope.output.personal.data.middleName = 'serddddddwerwwrwerd';
      }, 4000);
      $scope.input = {
        "personal": {
          "data": {
            "lastName": ["value one", "value two"],
            "middleName": "ser"
          }
        }
      };
      return $scope.submit = function() {
        return $validator.validate($scope, 'default').success(function() {
          return console.log('success');
        }).error(function() {
          return console.log('error');
        });
      };
    }
  ]);

}).call(this);
