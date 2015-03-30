angular.module 'form'


.directive 'fbLayout', ['$builder', ($builder) ->

    restrict: 'A'
    scope:
        layout: '=fbLayout'
        output: '=fbOutput'
        input: '=fbInput'
    template:
        """
        <div class="container-fluid">
            <div class='row' ng-repeat="row in layout.rows">
                <legend ng-if="row.label" ng-bind="row.label"></legend>
                <div class="col-md-{{column.width}}" ng-repeat="column in row.columns">
                    <div ng-model="output" fb-form="{{$parent.$index + '' + $index}}" fb-default="input"></div>
                </div>
            </div>
        </div>

        """
    link: (scope) ->

        scope.defaultValue = {}
        scope.output ?= {}

        rebuild = ->
            return if !scope.layout or !scope.layout.rows
            for row, i in scope.layout.rows
                for column, j in row.columns
                    $builder.addAllFormObject "#{i}#{j}", column.formData.views

        scope.$watch 'layout', -> rebuild()
        rebuild()

]
