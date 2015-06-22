angular.module 'builder'


# ----------------------------------------
# fb-layout-builder
# ----------------------------------------
.directive 'fbLayoutBuilder', ['$builder', '$compile', 'utilsBuilder', '$drag', ($builder, $compile, utilsBuilder, $drag) ->
    fbLayoutBuilder =
        restrict: 'A',
        scope:
            layout: '=fbLayoutBuilder'
        template:
            """
            <div class="panel panel-default layout" style='position: relative;'>
                <div class="panel-heading">
                    <h3 class="panel-title">Builder</h3>
                </div>
                <div class="container-fluid">
                    <ul class="nav nav-tabs nav-justified">
                        <li ng-repeat="tab in layout.tabs" ng-class="{active:rows == tab.rows}" ng-init="toggleInput = false">
                            <a href='#' ng-show='!toggleInput' ng-click="selectTab($event, tab)">{{tab.label}}
                                <span class="glyphicon glyphicon-remove-sign" ng-click="removeTab($event, tab)"></span>
                                <span class="glyphicon glyphicon-edit" ng-click='toggleInput = true'></span>
                            </a>
                            <div ng-show='toggleInput'>
                                <input type="text" ng-model="tab.label"/>
                                <span class="glyphicon glyphicon-ok" ng-click='toggleInput = false; $event.preventDefault(); $event.stopPropagation()'></span>
                            </div>
                        </li>
                        <li ng-click="addTab($event)">
                            <a href='#'><span class="glyphicon glyphicon-plus-sign"></span></a>
                        </li>
                    </ul>
                    <div class="row" ng-repeat="row in rows">
                        <legend ng-if="row.label" ng-bind="row.label"></legend>
                        <div class="col-md-{{column.width}}" ng-repeat="column in row.columns">
                            <div fb-builder="column.formData.views" form-name="{{$parent.$index + '' + $index}}"></div>
                        </div>
                    </div>
                </div>

            </div>

            """
        templatePopover:
            """
            <form role="form" class='form-horizontal'>

                <div ng-repeat='row in rows'>
                    <div class="form-group">
                        <label class='col-lg-4 control-label' ng-click="removeRow(row)"><span style='color: red'>x</span> удалить строку</label>
                    </div>
                    <div class="form-group">
                        <label class='col-lg-4 control-label'>Наименование строки</label>
                        <div class='col-lg-8'>
                            <input type='text' class='form-control col-lg-8' ng-model='row.label'/>
                        </div>

                    </div>
                    <div class="form-group">

                            <div class='col-lg-3' ng-repeat='column in row.columns'>
                                <input type='text' class='form-control' ng-model='column.width'/>
                                <label class='col-lg-1 control-label' ng-click='removeColumn(row, column)'><span style='color: red'>x</span></label>
                            </div>

                            <label class='btn btn-default' ng-click='addColumn(row)'>+</label>
                    </div>
                </div>

                <label class='btn btn-default' ng-click='addRow()'>+</label>
            </form>
            """
        link: (scope, element) ->

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

            viewPopover = $compile(fbLayoutBuilder.templatePopover) scope

            $(element).popover
                html: yes
                title: 'layout settings'
                content: viewPopover
                container: 'body'
                placement: 'right'

            $(element).on 'show.bs.popover', ->
                return no if $drag.isMouseMoved()

            scope.removeRow = (row) ->
                scope.rows.splice scope.rows.indexOf(row), 1

            scope.removeColumn = (row, column) ->
                row.columns.splice row.columns.indexOf(column), 1

            scope.removeTab = ($event, tab) ->
                $event?.preventDefault()
                $event?.stopPropagation()
                scope.layout.tabs.splice scope.layout.tabs.indexOf(tab), 1
                scope.rows = scope.layout.tabs[0]?.rows

            scope.addTab = ($event)->
                $event?.preventDefault()
                $event?.stopPropagation()
                scope.layout.tabs.push
                    label: 'new',
                    rows: [
                        columns: [{
                            width: 12, formData:
                                views: []
                        }]
                    ]
                scope.rows = scope.layout.tabs[scope.layout.tabs.length - 1].rows

            scope.addColumn = (row) ->
                indexRow = scope.rows.indexOf row
                indexColumn = row.columns.length
                row.columns.push
                    width: 12, formData:
                        views: []
                $builder.addAllFormObject("#{indexRow}#{indexColumn}", scope.rows[indexRow].columns[indexColumn].formData.views)

            scope.addRow = ->
                index = scope.rows.length
                scope.rows.push
                    columns: [{
                        width: 12, formData:
                            views: []
                    }]
                $builder.addAllFormObject("#{index}0", scope.rows[index].columns[0].formData.views)
    fbLayoutBuilder
]
