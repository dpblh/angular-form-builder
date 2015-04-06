(function() {
  angular.module('form', ['builder.directive', 'builder.provider', 'builder.services', 'validator']);

}).call(this);


/*
    component:
        It is like a class.
        The base components are textInput, textArea, select, check, radio.
        User can custom the form with components.
    formObject:
        It is like an object (an instance of the component).
        User can custom the label, description, required and validation of the input.
    form:
        This is for end-user. There are form groups int the form.
        They can input the value to the form.
 */

(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('builder.provider', ['builder.services']).provider('$builder', function() {
    var $http, $injector, $templateCache, utilsBuilder;
    $injector = null;
    $http = null;
    $templateCache = null;
    utilsBuilder = null;
    this.config = {
      popoverPlacement: 'right'
    };
    this.components = {};
    this.groups = [];
    this.broadcastChannel = {
      updateInput: '$updateInput'
    };
    this.forms = {
      "default": []
    };
    this.convertComponent = function(name, component) {
      var result, _ref, _ref1, _ref10, _ref11, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      result = {
        name: name,
        group: (_ref = component.group) != null ? _ref : 'Default',
        label: (_ref1 = component.label) != null ? _ref1 : '',
        description: (_ref2 = component.description) != null ? _ref2 : '',
        placeholder: (_ref3 = component.placeholder) != null ? _ref3 : '',
        editable: (_ref4 = component.editable) != null ? _ref4 : true,
        required: (_ref5 = component.required) != null ? _ref5 : false,
        show: (_ref6 = component.show) != null ? _ref6 : 'true',
        validation: (_ref7 = component.validation) != null ? _ref7 : '/.*/',
        validationOptions: (_ref8 = component.validationOptions) != null ? _ref8 : [],
        someOptions: (_ref9 = component.someOptions) != null ? _ref9 : {},
        options: (_ref10 = component.options) != null ? _ref10 : [],
        arrayToText: (_ref11 = component.arrayToText) != null ? _ref11 : false,
        template: component.template,
        templateUrl: component.templateUrl,
        popoverTemplate: component.popoverTemplate,
        popoverTemplateUrl: component.popoverTemplateUrl
      };
      if (!result.template && !result.templateUrl) {
        console.error("The template is empty.");
      }
      if (!result.popoverTemplate && !result.popoverTemplateUrl) {
        console.error("The popoverTemplate is empty.");
      }
      return result;
    };
    this.convertFormObject = function(name, formObject) {
      var component, result, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (formObject == null) {
        formObject = {};
      }
      component = this.components[formObject.component];
      if (component == null) {
        throw "The component " + formObject.component + " was not registered.";
      }
      result = {
        id: formObject.id || utilsBuilder.guid(),
        component: formObject.component,
        modelName: formObject.modelName,
        editable: (_ref = formObject.editable) != null ? _ref : component.editable,
        index: (_ref1 = formObject.index) != null ? _ref1 : 0,
        label: (_ref2 = formObject.label) != null ? _ref2 : component.label,
        description: (_ref3 = formObject.description) != null ? _ref3 : component.description,
        placeholder: (_ref4 = formObject.placeholder) != null ? _ref4 : component.placeholder,
        options: (_ref5 = formObject.options) != null ? _ref5 : component.options,
        someOptions: (_ref6 = formObject.someOptions) != null ? _ref6 : {},
        required: (_ref7 = formObject.required) != null ? _ref7 : component.required,
        show: (_ref8 = formObject.show) != null ? _ref8 : component.show,
        validation: (_ref9 = formObject.validation) != null ? _ref9 : component.validation
      };
      return result;
    };
    this.reindexFormObject = (function(_this) {
      return function(name) {
        var formObjects, index, _i, _ref;
        formObjects = _this.forms[name];
        for (index = _i = 0, _ref = formObjects.length; _i < _ref; index = _i += 1) {
          formObjects[index].index = index;
        }
      };
    })(this);
    this.setupProviders = (function(_this) {
      return function(injector) {
        $injector = injector;
        $http = $injector.get('$http');
        $templateCache = $injector.get('$templateCache');
        return utilsBuilder = $injector.get('utilsBuilder');
      };
    })(this);
    this.loadTemplate = function(component) {

      /*
      Load template for components.
      @param component: {object} The component of $builder.
       */
      if (component.template == null) {
        $http.get(component.templateUrl, {
          cache: $templateCache
        }).success(function(template) {
          return component.template = template;
        });
      }
      if (component.popoverTemplate == null) {
        return $http.get(component.popoverTemplateUrl, {
          cache: $templateCache
        }).success(function(template) {
          return component.popoverTemplate = template;
        });
      }
    };
    this.registerComponent = (function(_this) {
      return function(name, component) {
        var newComponent, _ref;
        if (component == null) {
          component = {};
        }

        /*
        Register the component for form-builder.
        @param name: The component name.
        @param component: The component object.
            group: {string} The component group.
            label: {string} The label of the input.
            description: {string} The description of the input.
            placeholder: {string} The placeholder of the input.
            editable: {bool} Is the form object editable?
            required: {bool} Is the form object required?
            validation: {string} angular-validator. "/regex/" or "[rule1, rule2]". (default is RegExp(.*))
            validationOptions: {array} [{rule: angular-validator, label: 'option label'}] the options for the validation. (default is [])
            options: {array} The input options.
            arrayToText: {bool} checkbox could use this to convert input (default is no)
            template: {string} html template
            templateUrl: {string} The url of the template.
            popoverTemplate: {string} html template
            popoverTemplateUrl: {string} The url of the popover template.
         */
        if (_this.components[name] == null) {
          newComponent = _this.convertComponent(name, component);
          _this.components[name] = newComponent;
          if ($injector != null) {
            _this.loadTemplate(newComponent);
          }
          if (_ref = newComponent.group, __indexOf.call(_this.groups, _ref) < 0) {
            _this.groups.push(newComponent.group);
          }
        } else {
          console.error("The component " + name + " was registered.");
        }
      };
    })(this);
    this.addFormObject = (function(_this) {
      return function(name, formObject) {
        var _base;
        if (formObject == null) {
          formObject = {};
        }

        /*
        Insert the form object into the form at last.
         */
        if ((_base = _this.forms)[name] == null) {
          _base[name] = [];
        }
        return _this.insertFormObject(name, _this.forms[name].length, formObject);
      };
    })(this);
    this.addAllFormObject = (function(_this) {
      return function(name, formObjects) {
        if (formObjects == null) {
          formObjects = [];
        }

        /*
            does not work with raw data
         */
        return _this.forms[name] = formObjects;
      };
    })(this);
    this.insertFormObject = (function(_this) {
      return function(name, index, formObject) {
        var _base;
        if (formObject == null) {
          formObject = {};
        }

        /*
        Insert the form object into the form at {index}.
        @param name: The form name.
        @param index: The form object index.
        @param form: The form object.
            id: The form object id.
            component: {string} The component name
            editable: {bool} Is the form object editable? (default is yes)
            label: {string} The form object label.
            description: {string} The form object description.
            placeholder: {string} The form object placeholder.
            options: {array} The form object options.
            required: {bool} Is the form object required? (default is no)
            validation: {string} angular-validator. "/regex/" or "[rule1, rule2]".
            [index]: {int} The form object index. It will be updated by $builder.
        @return: The form object.
         */
        if ((_base = _this.forms)[name] == null) {
          _base[name] = [];
        }
        if (index > _this.forms[name].length) {
          index = _this.forms[name].length;
        } else if (index < 0) {
          index = 0;
        }
        _this.forms[name].splice(index, 0, _this.convertFormObject(name, formObject));
        _this.reindexFormObject(name);
        return _this.forms[name][index];
      };
    })(this);
    this.removeFormObject = (function(_this) {
      return function(name, index) {

        /*
        Remove the form object by the index.
        @param name: The form name.
        @param index: The form object index.
         */
        var formObjects;
        formObjects = _this.forms[name];
        formObjects.splice(index, 1);
        return _this.reindexFormObject(name);
      };
    })(this);
    this.updateFormObjectIndex = (function(_this) {
      return function(name, oldIndex, newIndex) {

        /*
        Update the index of the form object.
        @param name: The form name.
        @param oldIndex: The old index.
        @param newIndex: The new index.
         */
        var formObject, formObjects;
        if (oldIndex === newIndex) {
          return;
        }
        formObjects = _this.forms[name];
        formObject = formObjects.splice(oldIndex, 1)[0];
        formObjects.splice(newIndex, 0, formObject);
        return _this.reindexFormObject(name);
      };
    })(this);
    this.$get = [
      '$injector', (function(_this) {
        return function($injector) {
          var component, name, _ref;
          _this.setupProviders($injector);
          _ref = _this.components;
          for (name in _ref) {
            component = _ref[name];
            _this.loadTemplate(component);
          }
          return {
            config: _this.config,
            components: _this.components,
            groups: _this.groups,
            forms: _this.forms,
            broadcastChannel: _this.broadcastChannel,
            registerComponent: _this.registerComponent,
            addFormObject: _this.addFormObject,
            addAllFormObject: _this.addAllFormObject,
            insertFormObject: _this.insertFormObject,
            removeFormObject: _this.removeFormObject,
            updateFormObjectIndex: _this.updateFormObjectIndex
          };
        };
      })(this)
    ];
  });

}).call(this);


/*
  utils service
 */

(function() {
  angular.module('builder.services', []).factory('utilsBuilder', [
    function() {
      return {
        guid: function() {
          var s4;
          s4 = function() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
          };
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        },
        copyObjectToScope: function(object, scope) {

          /*
          Copy object (ng-repeat="object in objects") to scope without `hashKey`.
           */
          var key, value;
          for (key in object) {
            value = object[key];
            if (key !== '$$hashKey') {
              scope[key] = value;
            }
          }
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('form').directive('fbFormObject', [
    '$injector', function($injector) {
      var $builder, $compile, $parse, $timeout;
      $builder = $injector.get('$builder');
      $compile = $injector.get('$compile');
      $parse = $injector.get('$parse');
      $timeout = $injector.get('$timeout');
      return {
        restrict: 'A',
        controller: 'fbFormObjectController',
        link: function(scope, element, attrs) {
          var initValue;
          scope.formObject = $parse(attrs.fbFormObject)(scope);
          scope.$component = $builder.components[scope.formObject.component];
          scope.$on($builder.broadcastChannel.updateInput, function() {
            return scope.updateInput(scope.inputText);
          });
          if (scope.$component.arrayToText) {
            scope.inputArray = [];
            scope.$watch('inputArray', function(newValue, oldValue) {
              var checked, index, _ref;
              if (newValue === oldValue) {
                return;
              }
              checked = [];
              for (index in scope.inputArray) {
                if (scope.inputArray[index]) {
                  checked.push((_ref = scope.options[index]) != null ? _ref : scope.inputArray[index]);
                }
              }
              return scope.inputText = checked;
            }, true);
          }
          initValue = true;
          scope.$watch('inputText', function() {
            if (initValue === true) {
              return initValue = false;
            }
            return scope.updateInput(scope.inputText);
          });
          scope.$watch('modelName', function(newValue, oldValue) {
            var modelTime;
            if (!oldValue) {
              return;
            }
            $timeout.cancel(modelTime);
            return modelTime = $timeout(function() {
              var currentObject, firstObject, index, objectsPool, value, _i, _j, _len, _len1, _ref, _results;
              objectsPool = [];
              currentObject = scope.$parent.output;
              _ref = oldValue.split('.');
              for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
                value = _ref[index];
                objectsPool.push({
                  parent: currentObject,
                  name: value
                });
                currentObject = currentObject[value];
              }
              objectsPool = objectsPool.reverse();
              firstObject = objectsPool.shift();
              firstObject.parent[firstObject.name] = void 0;
              _results = [];
              for (_j = 0, _len1 = objectsPool.length; _j < _len1; _j++) {
                value = objectsPool[_j];
                if (angular.equals({}, value.parent[value.name])) {
                  _results.push(delete value.parent[value.name]);
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
            }, 1000);
          });
          scope.$watch(attrs.fbFormObject, function() {
            return scope.copyObjectToScope(scope.formObject);
          }, true);
          scope.$watch('$component.template', function(template) {
            var $input;
            if (!template) {
              return;
            }
            $input = element.find("[ng-model='inputText']");
            $input.attr({
              validator: '{{validation}}'
            });
            element.html(template);
            return $compile(element.contents())(scope);
          });
          if (!scope.$component.arrayToText && scope.formObject.options.length > 0) {
            scope.inputText = scope.formObject.options[0];
          }
          return scope.$watch("output." + scope.formObject.modelName, function(value) {
            if (scope.$component.arrayToText) {
              return scope.inputArray = value;
            } else {
              return scope.inputText = value;
            }
          });
        }
      };
    }
  ]).controller('fbFormObjectController', [
    '$scope', '$injector', function($scope, $injector) {
      var $builder, utilsBuilder;
      $builder = $injector.get('$builder');
      utilsBuilder = $injector.get('utilsBuilder');
      $scope.copyObjectToScope = function(object) {
        return utilsBuilder.copyObjectToScope(object, $scope);
      };
      return $scope.updateInput = function(value) {

        /*
        Copy current scope.input[X] to $parent.input.
        Set model value
        @param value: The input value.
         */
        var setValue;
        setValue = function(path, value2) {
          var currentData, index, _i, _len;
          currentData = $scope.$parent.output;
          for (index = _i = 0, _len = path.length; _i < _len; index = ++_i) {
            value = path[index];
            if (!(path.length > index + 1)) {
              continue;
            }
            if (!currentData[value]) {
              currentData[value] = {};
            }
            currentData = currentData[value];
          }
          return currentData[path[path.length - 1]] = value2;
        };
        if ($scope.formObject.modelName) {
          return setValue($scope.formObject.modelName.split('.'), value);
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('form').directive('fbForm', [
    '$injector', function($injector) {
      return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
          formName: '@fbForm',
          output: '=ngModel',
          input: '=fbDefault'
        },
        template: "<div class='fb-form-object' ng-repeat=\"object in form\" fb-form-object=\"object\"></div>",
        controller: 'fbFormController',
        link: function(scope, element, attrs) {
          var $builder, _base, _name;
          $builder = $injector.get('$builder');
          if ((_base = $builder.forms)[_name = scope.formName] == null) {
            _base[_name] = [];
          }
          return scope.form = $builder.forms[scope.formName];
        }
      };
    }
  ]).controller('fbFormController', [
    '$scope', '$injector', function($scope, $injector) {
      var $builder, $timeout;
      $builder = $injector.get('$builder');
      $timeout = $injector.get('$timeout');
      if ($scope.output == null) {
        $scope.output = {};
      }
      return $scope.$watch('form', function() {
        return $timeout(function() {
          return $scope.$broadcast($builder.broadcastChannel.updateInput);
        });
      }, true);
    }
  ]);

}).call(this);

(function() {
  angular.module('form').directive('fbLayout', [
    '$builder', function($builder) {
      return {
        restrict: 'A',
        scope: {
          layout: '=fbLayout',
          output: '=fbOutput',
          input: '=fbInput'
        },
        template: "<div class=\"container-fluid\">\n    <div class='row' ng-repeat=\"row in layout.rows\">\n        <legend ng-if=\"row.label\" ng-bind=\"row.label\"></legend>\n        <div class=\"col-md-{{column.width}}\" ng-repeat=\"column in row.columns\">\n            <div ng-model=\"output\" fb-form=\"{{$parent.$index + '' + $index}}\" fb-default=\"input\"></div>\n        </div>\n    </div>\n</div>\n",
        link: function(scope) {
          var rebuild;
          scope.defaultValue = {};
          if (scope.output == null) {
            scope.output = {};
          }
          rebuild = function() {
            var column, i, j, row, _i, _len, _ref, _results;
            if (!scope.layout || !scope.layout.rows) {
              return;
            }
            _ref = scope.layout.rows;
            _results = [];
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
              row = _ref[i];
              _results.push((function() {
                var _j, _len1, _ref1, _results1;
                _ref1 = row.columns;
                _results1 = [];
                for (j = _j = 0, _len1 = _ref1.length; _j < _len1; j = ++_j) {
                  column = _ref1[j];
                  _results1.push($builder.addAllFormObject("" + i + j, column.formData.views));
                }
                return _results1;
              })());
            }
            return _results;
          };
          scope.$watch('layout', function() {
            return rebuild();
          });
          return rebuild();
        }
      };
    }
  ]);

}).call(this);

(function() {
  'use strict';
  angular.module('builder.directive', []).directive('builderShow', [
    '$parse', function($parse) {
      return {
        restrict: 'A',
        multiElement: true,
        scope: {
          builderShow: '='
        },
        link: function(scope, element) {
          return scope.$watch('builderShow', function(newValue) {
            var e, showFn;
            scope.model = scope.$parent.$parent.output;
            try {
              showFn = $parse(newValue);
            } catch (_error) {
              e = _error;
            }
            if (this.unwatch) {
              this.unwatch();
            }
            if (showFn) {
              return this.unwatch = scope.$watch(function() {
                return showFn(scope);
              }, function(value) {
                if (value) {
                  return element.removeClass('ng-hide');
                } else {
                  return element.addClass('ng-hide');
                }
              });
            }
          });
        }
      };
    }
  ]);

}).call(this);
