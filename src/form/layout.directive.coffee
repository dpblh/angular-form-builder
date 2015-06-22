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
            <ul class="nav nav-tabs nav-justified" ng-show='layout.tabs.length > 1'>
                <li ng-repeat="tab in layout.tabs" ng-class="{active:rows == tab.rows}">
                    <a href='#' ng-click="selectTab($event, tab)">{{tab.label}}</a>
                </li>
            </ul>
            <div class='row' ng-repeat="row in rows">
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

        scope.rows = scope.layout.tabs[0].rows

        scope.selectTab = ($event, tab)->
            $event?.preventDefault()
            $event?.stopPropagation()
            scope.rows = tab.rows

        rebuild = ->
            return if !scope.rows
            for row, i in scope.rows
                for column, j in row.columns
                    $builder.addAllFormObject "#{i}#{j}", column.formData.views

        scope.$watch 'rows', -> rebuild()
        rebuild()

]
