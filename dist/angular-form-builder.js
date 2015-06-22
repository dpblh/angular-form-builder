(function() {
  angular.module('builder', ['form', 'builder.provider', 'builder.services', 'builder.drag', 'validator']);

}).call(this);

(function() {
  angular.module('builder.directive', []);

  angular.module('form', ['builder.directive', 'builder.provider', 'builder.services', 'validator']);

}).call(this);

(function() {
  angular.module('builder').directive('fbBuilder', [
    '$injector', function($injector) {
      var $builder, $drag;
      $builder = $injector.get('$builder');
      $drag = $injector.get('$drag');
      return {
        restrict: 'A',
        scope: {
          fbBuilder: '=',
          formName: '@'
        },
        template: "<div class='form-horizontal'>\n    <div class='fb-form-object-editable' ng-repeat=\"object in formObjects\"\n        fb-form-object-editable=\"object\"></div>\n</div>",
        link: function(scope, element, attrs) {
          var beginMove, _base, _name;
          if ((_base = $builder.forms)[_name = scope.formName] == null) {
            _base[_name] = [];
          }
          scope.formObjects = $builder.forms[scope.formName];
          beginMove = true;
          $(element).addClass('fb-builder');
          return $drag.droppable($(element), {
            move: function(e) {
              var $empty, $formObject, $formObjects, height, index, offset, positions, _i, _j, _ref, _ref1;
              if (beginMove) {
                $("div.fb-form-object-editable").popover('hide');
                beginMove = false;
              }
              $formObjects = $(element).find('.fb-form-object-editable:not(.empty,.dragging)');
              if ($formObjects.length === 0) {
                if ($(element).find('.fb-form-object-editable.empty').length === 0) {
                  $(element).find('>div:first').append($("<div class='fb-form-object-editable empty'></div>"));
                }
                return;
              }
              positions = [];
              positions.push(-1000);
              for (index = _i = 0, _ref = $formObjects.length; _i < _ref; index = _i += 1) {
                $formObject = $($formObjects[index]);
                offset = $formObject.offset();
                height = $formObject.height();
                positions.push(offset.top + height / 2);
              }
              positions.push(positions[positions.length - 1] + 1000);
              for (index = _j = 1, _ref1 = positions.length; _j < _ref1; index = _j += 1) {
                if (e.pageY > positions[index - 1] && e.pageY <= positions[index]) {
                  $(element).find('.empty').remove();
                  $empty = $("<div class='fb-form-object-editable empty'></div>");
                  if (index - 1 < $formObjects.length) {
                    $empty.insertBefore($($formObjects[index - 1]));
                  } else {
                    $empty.insertAfter($($formObjects[index - 2]));
                  }
                  break;
                }
              }
            },
            out: function() {
              if (beginMove) {
                $("div.fb-form-object-editable").popover('hide');
                beginMove = false;
              }
              return $(element).find('.empty').remove();
            },
            up: function(e, isHover, draggable, remove, currentForm) {
              var formObject, newIndex;
              beginMove = true;
              if (!$drag.isMouseMoved()) {
                $(element).find('.empty').remove();
                return;
              }
              if (draggable.mode === 'drag') {
                formObject = draggable.object.formObject;
                if (remove && formObject.editable) {
                  formObject.removed = scope.formName;
                  return;
                } else if (formObject.editable && formObject.removed) {
                  newIndex = $(element).find('.empty').index();
                  if (newIndex !== -1) {
                    if (newIndex >= formObject.index && currentForm) {
                      newIndex -= 1;
                    }
                  }
                  $builder.removeFormObject(formObject.removed, formObject.index);
                  $builder.insertFormObject(scope.formName, newIndex, formObject);
                }
              } else if (isHover && draggable.mode === 'mirror') {
                $builder.insertFormObject(scope.formName, $(element).find('.empty').index(), {
                  component: draggable.object.componentName
                });
              }
              return $(element).find('.empty').remove();
            }
          });
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('builder').directive('fbComponent', [
    '$injector', function($injector) {
      var $builder, $compile, $drag;
      $builder = $injector.get('$builder');
      $drag = $injector.get('$drag');
      $compile = $injector.get('$compile');
      return {
        restrict: 'A',
        scope: {
          component: '=fbComponent'
        },
        controller: 'fbComponentController',
        link: function(scope, element) {
          scope.copyObjectToScope(scope.component);
          $drag.draggable($(element), {
            mode: 'mirror',
            defer: false,
            object: {
              componentName: scope.component.name
            }
          });
          return scope.$watch('component.template', function(template) {
            var view;
            if (!template) {
              return;
            }
            view = $compile(template)(scope);
            return $(element).html(view);
          });
        }
      };
    }
  ]).controller('fbComponentController', [
    '$scope', 'utilsBuilder', function($scope, utilsBuilder) {
      return $scope.copyObjectToScope = function(object) {
        return utilsBuilder.copyObjectToScope(object, $scope);
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('builder').directive('fbComponents', function() {
    return {
      restrict: 'A',
      template: "<ul ng-if=\"groups.length > 1\" class=\"nav nav-tabs nav-justified\">\n    <li ng-repeat=\"group in groups\" ng-class=\"{active:activeGroup==group}\">\n        <a href='#' ng-click=\"selectGroup($event, group)\">{{group}}</a>\n    </li>\n</ul>\n<div class='form-horizontal'>\n    <div class='fb-component' ng-repeat=\"component in components\"\n        fb-component=\"component\"></div>\n</div>",
      controller: 'fbComponentsController'
    };
  }).controller('fbComponentsController', [
    '$scope', '$injector', function($scope, $injector) {
      var $builder;
      $builder = $injector.get('$builder');
      $scope.selectGroup = function($event, group) {
        var component, name, _ref, _results;
        if ($event != null) {
          $event.preventDefault();
        }
        $scope.activeGroup = group;
        $scope.components = [];
        _ref = $builder.components;
        _results = [];
        for (name in _ref) {
          component = _ref[name];
          if (component.group === group) {
            _results.push($scope.components.push(component));
          }
        }
        return _results;
      };
      $scope.groups = $builder.groups;
      $scope.activeGroup = $scope.groups[0];
      $scope.allComponents = $builder.components;
      return $scope.$watch('allComponents', function() {
        return $scope.selectGroup(null, $scope.activeGroup);
      });
    }
  ]);

}).call(this);

(function() {
  angular.module('builder.drag', []).provider('$drag', function() {
    var $injector, $rootScope, delay;
    $injector = null;
    $rootScope = null;
    this.data = {
      draggables: {},
      droppables: {}
    };
    this.mouseMoved = false;
    this.isMouseMoved = (function(_this) {
      return function() {
        return _this.mouseMoved;
      };
    })(this);
    this.hooks = {
      down: {},
      move: {},
      up: {}
    };
    this.eventMouseMove = function() {};
    this.eventMouseUp = function() {};
    $((function(_this) {
      return function() {
        var prevX;
        prevX = null;
        $(document).on('mousedown', function(e) {
          var func, key, _ref;
          _this.mouseDown = true;
          _this.mouseMoved = false;
          _ref = _this.hooks.down;
          for (key in _ref) {
            func = _ref[key];
            func(e);
          }
        });
        $(document).on('mousemove', function(e) {
          var func, key, _ref;
          if (!_this.mouseDown) {
            return false;
          }
          if (!prevX || prevX === e.clientX) {
            return prevX = e.clientX;
          }
          _this.mouseMoved = true;
          _ref = _this.hooks.move;
          for (key in _ref) {
            func = _ref[key];
            func(e);
          }
        });
        return $(document).on('mouseup', function(e) {
          var func, key, _ref;
          _this.mouseDown = false;
          _ref = _this.hooks.up;
          for (key in _ref) {
            func = _ref[key];
            func(e);
          }
        });
      };
    })(this));
    this.currentId = 0;
    this.getNewId = (function(_this) {
      return function() {
        return "" + (_this.currentId++);
      };
    })(this);
    this.setupEasing = function() {
      return jQuery.extend(jQuery.easing, {
        easeOutQuad: function(x, t, b, c, d) {
          return -c * (t /= d) * (t - 2) + b;
        }
      });
    };
    this.setupProviders = function(injector) {

      /*
      Setup providers.
       */
      $injector = injector;
      return $rootScope = $injector.get('$rootScope');
    };
    this.isHover = (function(_this) {
      return function($elementA, $elementB) {

        /*
        Is element A hover on element B?
        @param $elementA: jQuery object
        @param $elementB: jQuery object
         */
        var isHover, offsetA, offsetB, sizeA, sizeB;
        offsetA = $elementA.offset();
        offsetB = $elementB.offset();
        sizeA = {
          width: $elementA.width(),
          height: $elementA.height()
        };
        sizeB = {
          width: $elementB.width(),
          height: $elementB.height()
        };
        isHover = {
          x: false,
          y: false
        };
        isHover.x = offsetA.left > offsetB.left && offsetA.left < offsetB.left + sizeB.width;
        isHover.x = isHover.x || offsetA.left + sizeA.width > offsetB.left && offsetA.left + sizeA.width < offsetB.left + sizeB.width;
        if (!isHover) {
          return false;
        }
        isHover.y = offsetA.top > offsetB.top && offsetA.top < offsetB.top + sizeB.height;
        isHover.y = isHover.y || offsetA.top + sizeA.height > offsetB.top && offsetA.top + sizeA.height < offsetB.top + sizeB.height;
        return isHover.x && isHover.y;
      };
    })(this);
    delay = function(ms, func) {
      return setTimeout(function() {
        return func();
      }, ms);
    };
    this.autoScroll = {
      up: false,
      down: false,
      scrolling: false,
      scroll: (function(_this) {
        return function() {
          _this.autoScroll.scrolling = true;
          if (_this.autoScroll.up) {
            $('html, body').dequeue().animate({
              scrollTop: $(window).scrollTop() - 50
            }, 100, 'easeOutQuad');
            return delay(100, function() {
              return _this.autoScroll.scroll();
            });
          } else if (_this.autoScroll.down) {
            $('html, body').dequeue().animate({
              scrollTop: $(window).scrollTop() + 50
            }, 100, 'easeOutQuad');
            return delay(100, function() {
              return _this.autoScroll.scroll();
            });
          } else {
            return _this.autoScroll.scrolling = false;
          }
        };
      })(this),
      start: (function(_this) {
        return function(e) {
          if (e.clientY < 50) {
            _this.autoScroll.up = true;
            _this.autoScroll.down = false;
            if (!_this.autoScroll.scrolling) {
              return _this.autoScroll.scroll();
            }
          } else if (e.clientY > $(window).innerHeight() - 50) {
            _this.autoScroll.up = false;
            _this.autoScroll.down = true;
            if (!_this.autoScroll.scrolling) {
              return _this.autoScroll.scroll();
            }
          } else {
            _this.autoScroll.up = false;
            return _this.autoScroll.down = false;
          }
        };
      })(this),
      stop: (function(_this) {
        return function() {
          _this.autoScroll.up = false;
          return _this.autoScroll.down = false;
        };
      })(this)
    };
    this.dragMirrorMode = (function(_this) {
      return function($element, defer, object) {
        var result;
        if (defer == null) {
          defer = true;
        }
        result = {
          id: _this.getNewId(),
          mode: 'mirror',
          maternal: $element[0],
          element: null,
          object: object
        };
        $element.on('mousedown', function(e) {
          var $clone;
          e.preventDefault();
          $clone = $element.clone();
          result.element = $clone[0];
          $clone.addClass("fb-draggable form-horizontal prepare-dragging");
          _this.hooks.move.drag = function(e, defer) {
            var droppable, id, _ref, _results;
            if ($clone.hasClass('prepare-dragging')) {
              $clone.css({
                width: $element.width(),
                height: $element.height()
              });
              $clone.removeClass('prepare-dragging');
              $clone.addClass('dragging');
              if (defer) {
                return;
              }
            }
            $clone.offset({
              left: e.pageX - $clone.width() / 2,
              top: e.pageY - $clone.height() / 2
            });
            _this.autoScroll.start(e);
            _ref = _this.data.droppables;
            _results = [];
            for (id in _ref) {
              droppable = _ref[id];
              if (_this.isHover($clone, $(droppable.element))) {
                _results.push(droppable.move(e, result));
              } else {
                _results.push(droppable.out(e, result));
              }
            }
            return _results;
          };
          _this.hooks.up.drag = function(e) {
            var droppable, id, isHover, _ref;
            _ref = _this.data.droppables;
            for (id in _ref) {
              droppable = _ref[id];
              isHover = _this.isHover($clone, $(droppable.element));
              droppable.up(e, isHover, result);
            }
            delete _this.hooks.move.drag;
            delete _this.hooks.up.drag;
            result.element = null;
            $clone.remove();
            return _this.autoScroll.stop();
          };
          $('body').append($clone);
          if (!defer) {
            return _this.hooks.move.drag(e, defer);
          }
        });
        return result;
      };
    })(this);
    this.dragDragMode = (function(_this) {
      return function($element, defer, object) {
        var result;
        if (defer == null) {
          defer = true;
        }
        result = {
          id: _this.getNewId(),
          mode: 'drag',
          maternal: null,
          element: $element[0],
          object: object
        };
        $element.addClass('fb-draggable');
        $element.on('mousedown', function(e) {
          e.preventDefault();
          if ($element.hasClass('dragging')) {
            return;
          }
          $element.addClass('prepare-dragging');
          _this.hooks.move.drag = function(e, defer) {
            var droppable, id, _ref;
            if ($element.hasClass('prepare-dragging')) {
              $element.css({
                width: $element.width(),
                height: $element.height()
              });
              $element.removeClass('prepare-dragging');
              $element.addClass('dragging');
              if (defer) {
                return;
              }
            }
            $element.offset({
              left: e.pageX - $element.width() / 2,
              top: e.pageY - $element.height() / 2
            });
            _this.autoScroll.start(e);
            _ref = _this.data.droppables;
            for (id in _ref) {
              droppable = _ref[id];
              if (_this.isHover($element, $(droppable.element))) {
                droppable.move(e, result);
              } else {
                droppable.out(e, result);
              }
            }
          };
          _this.hooks.up.drag = function(e) {
            var currentForm, droppable, dropped, hover, id, _ref;
            dropped = {
              from: null,
              to: null
            };
            _ref = _this.data.droppables;
            for (id in _ref) {
              droppable = _ref[id];
              if (droppable.element.contains(e.target)) {
                dropped.from = droppable;
              }
              if (_this.isHover($element, $(droppable.element))) {
                dropped.to = droppable;
              }
            }
            hover = dropped.from && _this.isHover($element, $(dropped.from.element));
            currentForm = dropped.to && dropped.to.element.contains(e.target);
            if (dropped.from) {
              dropped.from.up(e, hover, result, true);
            }
            if (dropped.to) {
              dropped.to.up(e, true, result, false, currentForm);
            }
            delete result.object.formObject.removed;
            delete _this.hooks.move.drag;
            delete _this.hooks.up.drag;
            $element.css({
              width: '',
              height: '',
              left: '',
              top: ''
            });
            $element.removeClass('dragging defer-dragging');
            return _this.autoScroll.stop();
          };
          if (!defer) {
            return _this.hooks.move.drag(e, defer);
          }
        });
        return result;
      };
    })(this);
    this.dropMode = (function(_this) {
      return function($element, options) {
        var result;
        result = {
          id: _this.getNewId(),
          element: $element[0],
          move: function(e, draggable) {
            return $rootScope.$apply(function() {
              return typeof options.move === "function" ? options.move(e, draggable) : void 0;
            });
          },
          up: function(e, isHover, draggable, remove, currentForm) {
            return $rootScope.$apply(function() {
              return typeof options.up === "function" ? options.up(e, isHover, draggable, remove, currentForm) : void 0;
            });
          },
          out: function(e, draggable) {
            return $rootScope.$apply(function() {
              return typeof options.out === "function" ? options.out(e, draggable) : void 0;
            });
          }
        };
        return result;
      };
    })(this);
    this.draggable = (function(_this) {
      return function($element, options) {
        var draggable, element, result, _i, _j, _len, _len1;
        if (options == null) {
          options = {};
        }

        /*
        Make the element could be drag.
        @param element: The jQuery element.
        @param options: Options
            mode: 'drag' [default], 'mirror'
            defer: yes/no. defer dragging
            object: custom information
         */
        result = [];
        if (options.mode === 'mirror') {
          for (_i = 0, _len = $element.length; _i < _len; _i++) {
            element = $element[_i];
            draggable = _this.dragMirrorMode($(element), options.defer, options.object);
            result.push(draggable.id);
            _this.data.draggables[draggable.id] = draggable;
          }
        } else {
          for (_j = 0, _len1 = $element.length; _j < _len1; _j++) {
            element = $element[_j];
            draggable = _this.dragDragMode($(element), options.defer, options.object);
            result.push(draggable.id);
            _this.data.draggables[draggable.id] = draggable;
          }
        }
        return result;
      };
    })(this);
    this.droppable = (function(_this) {
      return function($element, options) {
        var droppable, element, result, _i, _len;
        if (options == null) {
          options = {};
        }

        /*
        Make the element coulde be drop.
        @param $element: The jQuery element.
        @param options: The droppable options.
            move: The custom mouse move callback. (e, draggable)->
            up: The custom mouse up callback. (e, isHover, draggable)->
            out: The custom mouse out callback. (e, draggable)->
         */
        result = [];
        for (_i = 0, _len = $element.length; _i < _len; _i++) {
          element = $element[_i];
          droppable = _this.dropMode($(element), options);
          result.push(droppable);
          _this.data.droppables[droppable.id] = droppable;
        }
        return result;
      };
    })(this);
    this.get = function($injector) {
      this.setupEasing();
      this.setupProviders($injector);
      return {
        isMouseMoved: this.isMouseMoved,
        data: this.data,
        draggable: this.draggable,
        droppable: this.droppable
      };
    };
    this.get.$inject = ['$injector'];
    this.$get = this.get;
  });

}).call(this);

(function() {
  angular.module('builder').directive('fbFormObjectEditable', [
    '$injector', function($injector) {
      var $builder, $compile, $drag, $validator;
      $builder = $injector.get('$builder');
      $drag = $injector.get('$drag');
      $compile = $injector.get('$compile');
      $validator = $injector.get('$validator');
      return {
        restrict: 'A',
        controller: 'fbFormObjectEditableController',
        scope: {
          formObject: '=fbFormObjectEditable'
        },
        link: function(scope, element) {
          var popover;
          scope.formName = scope.$parent.formName;
          scope.inputArray = [];
          scope.$component = $builder.components[scope.formObject.component];
          scope.setupScope(scope.formObject);
          scope.$watch('$component.template', function(template) {
            var view;
            if (!template) {
              return;
            }
            view = $compile(template)(scope);
            return $(element).html(view);
          });
          $(element).on('click', function() {
            return false;
          });
          $drag.draggable($(element), {
            object: {
              formObject: scope.formObject
            }
          });
          if (!scope.formObject.editable) {
            return;
          }
          popover = {};
          scope.$watch('$component.popoverTemplate', function(template) {
            if (!template) {
              return;
            }
            $(element).removeClass(popover.id);
            popover = {
              id: "fb-" + (Math.random().toString().substr(2)),
              isClickedSave: false,
              view: null,
              html: template
            };
            popover.html = $(popover.html).addClass(popover.id);
            popover.view = $compile(popover.html)(scope);
            $(element).addClass(popover.id);
            return $(element).popover({
              html: true,
              title: scope.$component.label,
              content: popover.view,
              container: 'body',
              placement: $builder.config.popoverPlacement
            });
          });
          scope.popover = {
            save: function($event) {

              /*
              The save event of the popover.
               */
              $event.preventDefault();
              $validator.validate(scope).success(function() {
                popover.isClickedSave = true;
                return $(element).popover('hide');
              });
            },
            remove: function($event) {

              /*
              The delete event of the popover.
               */
              $event.preventDefault();
              $builder.removeFormObject(scope.$parent.formName, scope.$parent.$index);
              $(element).popover('hide');
            },
            shown: function() {

              /*
              The shown event of the popover.
               */
              scope.data.backup();
              return popover.isClickedSave = false;
            },
            cancel: function($event) {

              /*
              The cancel event of the popover.
               */
              scope.data.rollback();
              if ($event) {
                $event.preventDefault();
                $(element).popover('hide');
              }
            }
          };
          $(element).on('show.bs.popover', function() {
            var $popover, elementOrigin, popoverTop;
            if ($drag.isMouseMoved()) {
              return false;
            }
            $("div.fb-form-object-editable:not(." + popover.id + "), div.layout").popover('hide');
            $popover = $("form." + popover.id).closest('.popover');
            if ($popover.length > 0) {
              elementOrigin = $(element).offset().top + $(element).height() / 2;
              popoverTop = elementOrigin - $popover.height() / 2;
              $popover.css({
                position: 'absolute',
                top: popoverTop
              });
              $popover.show();
              setTimeout(function() {
                $popover.addClass('in');
                return $(element).triggerHandler('shown.bs.popover');
              }, 0);
              return false;
            }
          });
          $(element).on('shown.bs.popover', function() {
            $(".popover ." + popover.id + " input:first").select();
            scope.$apply(function() {
              return scope.popover.shown();
            });
          });
          return $(element).on('hide.bs.popover', function() {
            var $popover;
            $popover = $("form." + popover.id).closest('.popover');
            if (!popover.isClickedSave) {
              if (scope.$$phase || scope.$root.$$phase) {
                scope.popover.cancel();
              } else {
                scope.$apply(function() {
                  return scope.popover.cancel();
                });
              }
            }
            $popover.removeClass('in');
            setTimeout(function() {
              return $popover.hide();
            }, 300);
            return false;
          });
        }
      };
    }
  ]).controller('fbFormObjectEditableController', [
    '$scope', '$injector', function($scope, $injector) {
      var $builder, utilsBuilder;
      $builder = $injector.get('$builder');
      utilsBuilder = $injector.get('utilsBuilder');
      $scope.setupScope = function(formObject) {

        /*
        1. Copy origin formObject (ng-repeat="object in formObjects") to scope.
        2. Setup optionsText with formObject.options.
        3. Watch scope.label, .description, .placeholder, .required, .options then copy to origin formObject.
        4. Watch scope.optionsText then convert to scope.options.
        5. setup validationOptions
         */
        var component;
        utilsBuilder.copyObjectToScope(formObject, $scope);
        $scope.optionsText = formObject.options.join('\n');
        $scope.$watch('[modelName, label, description, placeholder, show, required, options, validation, someOptions]', function() {
          formObject.modelName = $scope.modelName;
          formObject.label = $scope.label;
          formObject.description = $scope.description;
          formObject.placeholder = $scope.placeholder;
          formObject.required = $scope.required;
          formObject.show = $scope.show;
          formObject.options = $scope.options;
          formObject.validation = $scope.validation;
          return formObject.someOptions = $scope.someOptions;
        }, true);
        $scope.$watch('optionsText', function(text) {
          var x;
          $scope.options = (function() {
            var _i, _len, _ref, _results;
            _ref = text.split('\n');
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              x = _ref[_i];
              if (x.length > 0) {
                _results.push(x);
              }
            }
            return _results;
          })();
          return $scope.inputText = $scope.options[0];
        });
        component = $builder.components[formObject.component];
        return $scope.validationOptions = component.validationOptions;
      };
      return $scope.data = {
        model: null,
        backup: function() {

          /*
          Backup input value.
           */
          return this.model = {
            modelName: $scope.modelName,
            label: $scope.label,
            description: $scope.description,
            placeholder: $scope.placeholder,
            required: $scope.required,
            show: $scope.show,
            optionsText: $scope.optionsText,
            validation: $scope.validation,
            someOptions: angular.copy($scope.someOptions)
          };
        },
        rollback: function() {

          /*
          Rollback input value.
           */
          if (!this.model) {
            return;
          }
          $scope.modelName = this.model.modelName;
          $scope.label = this.model.label;
          $scope.description = this.model.description;
          $scope.placeholder = this.model.placeholder;
          $scope.required = this.model.required;
          $scope.show = this.model.show;
          $scope.optionsText = this.model.optionsText;
          $scope.validation = this.model.validation;
          return $scope.someOptions = this.model.someOptions;
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('builder').directive('fbLayoutBuilder', [
    '$builder', '$compile', 'utilsBuilder', '$drag', function($builder, $compile, utilsBuilder, $drag) {
      var fbLayoutBuilder;
      fbLayoutBuilder = {
        restrict: 'A',
        scope: {
          layout: '=fbLayoutBuilder'
        },
        template: "<div class=\"panel panel-default layout\" style='position: relative;'>\n    <div class=\"panel-heading\">\n        <h3 class=\"panel-title\">Builder</h3>\n    </div>\n    <div class=\"container-fluid\">\n        <ul class=\"nav nav-tabs nav-justified\">\n            <li ng-repeat=\"tab in layout.tabs\" ng-class=\"{active:rows == tab.rows}\" ng-init=\"toggleInput = false\">\n                <a href='#' ng-show='!toggleInput' ng-click=\"selectTab($event, tab)\">{{tab.label}}\n                    <span class=\"glyphicon glyphicon-remove-sign\" ng-click=\"removeTab($event, tab)\"></span>\n                    <span class=\"glyphicon glyphicon-edit\" ng-click='toggleInput = true'></span>\n                </a>\n                <div ng-show='toggleInput'>\n                    <input type=\"text\" ng-model=\"tab.label\"/>\n                    <span class=\"glyphicon glyphicon-ok\" ng-click='toggleInput = false; $event.preventDefault(); $event.stopPropagation()'></span>\n                </div>\n            </li>\n            <li ng-click=\"addTab($event)\">\n                <a href='#'><span class=\"glyphicon glyphicon-plus-sign\"></span></a>\n            </li>\n        </ul>\n        <div class=\"row\" ng-repeat=\"row in rows\">\n            <legend ng-if=\"row.label\" ng-bind=\"row.label\"></legend>\n            <div class=\"col-md-{{column.width}}\" ng-repeat=\"column in row.columns\">\n                <div fb-builder=\"column.formData.views\" form-name=\"{{$parent.$index + '' + $index}}\"></div>\n            </div>\n        </div>\n    </div>\n\n</div>\n",
        templatePopover: "<form role=\"form\" class='form-horizontal'>\n\n    <div ng-repeat='row in rows'>\n        <div class=\"form-group\">\n            <label class='col-lg-4 control-label' ng-click=\"removeRow(row)\"><span style='color: red'>x</span> удалить строку</label>\n        </div>\n        <div class=\"form-group\">\n            <label class='col-lg-4 control-label'>Наименование строки</label>\n            <div class='col-lg-8'>\n                <input type='text' class='form-control col-lg-8' ng-model='row.label'/>\n            </div>\n\n        </div>\n        <div class=\"form-group\">\n\n                <div class='col-lg-3' ng-repeat='column in row.columns'>\n                    <input type='text' class='form-control' ng-model='column.width'/>\n                    <label class='col-lg-1 control-label' ng-click='removeColumn(row, column)'><span style='color: red'>x</span></label>\n                </div>\n\n                <label class='btn btn-default' ng-click='addColumn(row)'>+</label>\n        </div>\n    </div>\n\n    <label class='btn btn-default' ng-click='addRow()'>+</label>\n</form>",
        link: function(scope, element) {
          var rebuild, viewPopover;
          scope.rows = scope.layout.tabs[0].rows;
          scope.selectTab = function($event, tab) {
            if ($event != null) {
              $event.preventDefault();
            }
            if ($event != null) {
              $event.stopPropagation();
            }
            return scope.rows = tab.rows;
          };
          rebuild = function() {
            var column, i, j, row, _i, _len, _ref, _results;
            if (!scope.rows) {
              return;
            }
            _ref = scope.rows;
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
          scope.$watch('rows', function() {
            return rebuild();
          });
          viewPopover = $compile(fbLayoutBuilder.templatePopover)(scope);
          $(element).popover({
            html: true,
            title: 'layout settings',
            content: viewPopover,
            container: 'body',
            placement: 'right'
          });
          $(element).on('show.bs.popover', function() {
            if ($drag.isMouseMoved()) {
              return false;
            }
          });
          scope.removeRow = function(row) {
            return scope.rows.splice(scope.rows.indexOf(row), 1);
          };
          scope.removeColumn = function(row, column) {
            return row.columns.splice(row.columns.indexOf(column), 1);
          };
          scope.removeTab = function($event, tab) {
            var _ref;
            if ($event != null) {
              $event.preventDefault();
            }
            if ($event != null) {
              $event.stopPropagation();
            }
            scope.layout.tabs.splice(scope.layout.tabs.indexOf(tab), 1);
            return scope.rows = (_ref = scope.layout.tabs[0]) != null ? _ref.rows : void 0;
          };
          scope.addTab = function($event) {
            if ($event != null) {
              $event.preventDefault();
            }
            if ($event != null) {
              $event.stopPropagation();
            }
            scope.layout.tabs.push({
              label: 'new',
              rows: [
                {
                  columns: [
                    {
                      width: 12,
                      formData: {
                        views: []
                      }
                    }
                  ]
                }
              ]
            });
            return scope.rows = scope.layout.tabs[scope.layout.tabs.length - 1].rows;
          };
          scope.addColumn = function(row) {
            var indexColumn, indexRow;
            indexRow = scope.rows.indexOf(row);
            indexColumn = row.columns.length;
            row.columns.push({
              width: 12,
              formData: {
                views: []
              }
            });
            return $builder.addAllFormObject("" + indexRow + indexColumn, scope.rows[indexRow].columns[indexColumn].formData.views);
          };
          return scope.addRow = function() {
            var index;
            index = scope.rows.length;
            scope.rows.push({
              columns: [
                {
                  width: 12,
                  formData: {
                    views: []
                  }
                }
              ]
            });
            return $builder.addAllFormObject("" + index + "0", scope.rows[index].columns[0].formData.views);
          };
        }
      };
      return fbLayoutBuilder;
    }
  ]);

}).call(this);

(function() {
  'use strict';
  angular.module('builder.directive').directive('builderButton', [
    '$rootScope', function($rootScope) {
      return {
        restrict: 'E',
        scope: {
          source: '@',
          label: '@',
          color: '@'
        },
        replace: true,
        template: '<label class="btn {{color}} btn-form" ng-click="click()" ng-bind="label"></label>',
        link: function(scope) {
          return scope.click = function() {
            return $rootScope.formScope.$eval(scope.source);
          };
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
          scope.validationGroup = 'default';
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
            element.html(template);
            $input = element.find("input");
            $input.attr({
              validator: '{{validation}}'
            });
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
        template: "<div class=\"container-fluid\">\n    <ul class=\"nav nav-tabs nav-justified\" ng-show='layout.tabs.length > 1'>\n        <li ng-repeat=\"tab in layout.tabs\" ng-class=\"{active:rows == tab.rows}\">\n            <a href='#' ng-click=\"selectTab($event, tab)\">{{tab.label}}</a>\n        </li>\n    </ul>\n    <div class='row' ng-repeat=\"row in rows\">\n        <legend ng-if=\"row.label\" ng-bind=\"row.label\"></legend>\n        <div class=\"col-md-{{column.width}}\" ng-repeat=\"column in row.columns\">\n            <div ng-model=\"output\" fb-form=\"{{$parent.$index + '' + $index}}\" fb-default=\"input\"></div>\n        </div>\n    </div>\n</div>\n",
        link: function(scope) {
          var rebuild;
          scope.defaultValue = {};
          if (scope.output == null) {
            scope.output = {};
          }
          scope.rows = scope.layout.tabs[0].rows;
          scope.selectTab = function($event, tab) {
            if ($event != null) {
              $event.preventDefault();
            }
            if ($event != null) {
              $event.stopPropagation();
            }
            return scope.rows = tab.rows;
          };
          rebuild = function() {
            var column, i, j, row, _i, _len, _ref, _results;
            if (!scope.rows) {
              return;
            }
            _ref = scope.rows;
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
          scope.$watch('rows', function() {
            return rebuild();
          });
          return rebuild();
        }
      };
    }
  ]);

}).call(this);


/*
  rules service
 */

(function() {
  angular.module('form').provider('rules', function() {
    return {
      $get: function() {
        return this.rules;
      },
      rules: [],
      register: function(label, rule) {
        return this.rules.push({
          label: label,
          rule: rule
        });
      }
    };
  });

}).call(this);

(function() {
  'use strict';
  angular.module('builder.directive').directive('builderShow', [
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
        someObject: (_ref9 = component.someObject) != null ? _ref9 : {},
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
        someObject: (_ref6 = formObject.someObject) != null ? _ref6 : angular.copy(component.someObject),
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
