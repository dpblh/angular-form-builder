angular.module 'builder'


# ----------------------------------------
# fb-layout-builder
# ----------------------------------------
.directive 'fbLayoutBuilder', ['$builder', '$compile', 'utilsBuilder', ($builder, $compile, utilsBuilder) ->
    fbLayoutBuilder =
        restrict: 'A',
        scope:
            layout: '=fbLayoutBuilder'
        template:
            """
            <div class="panel panel-default" style='position: relative;'>
                <div class="panel-heading">
                    <h3 class="panel-title">Builder</h3>
                </div>
                <div class="container-fluid">
                    <div class="row" ng-repeat="row in layout.rows">
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

                <div ng-repeat='row in layout.rows'>
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

            rebuild = ->
                return if !scope.layout or !scope.layout.rows
                for row, i in scope.layout.rows
                    for column, j in row.columns
                        $builder.addAllFormObject "#{i}#{j}", column.formData.views

            scope.$watch 'layout', -> rebuild()
            rebuild()

            viewPopover = $compile(fbLayoutBuilder.templatePopover) scope

            $(element).popover
                html: yes
                title: 'layout settings'
                content: viewPopover
                container: 'body'
                placement: 'right'

            scope.showSettings = no

            scope.removeRow = (row) ->
                scope.layout.rows.splice scope.layout.rows.indexOf(row), 1

            scope.removeColumn = (row, column) ->
                row.columns.splice row.columns.indexOf(column), 1

            scope.addColumn = (row) ->
                indexRow = scope.layout.rows.indexOf row
                indexColumn = row.columns.length
                row.columns.push
                    width: 12, formData:
                        inputs: [],
                        name: "example",
                        views: [{
                            "id": utilsBuilder.guid(),
                            "component": "textInput",
                            "editable": true,
                            "index": 2,
                            "label": "Text Input2",
                            "description": "description",
                            "placeholder": "placeholder",
                            "options": [],
                            "required": false,
                            "validation": "/.*/"
                        }]
                $builder.addAllFormObject("#{indexRow}#{indexColumn}", scope.layout.rows[indexRow].columns[indexColumn].formData.views)

            scope.addRow = ->
                index = scope.layout.rows.length
                scope.layout.rows.push
                    columns: [{
                        width: 12, formData: {
                            inputs: [],
                            name: "example",
                            views: [{
                                "id": utilsBuilder.guid(),
                                "component": "textInput",
                                "editable": true,
                                "index": 2,
                                "label": "Text Input2",
                                "description": "description",
                                "placeholder": "placeholder",
                                "options": [],
                                "required": false,
                                "validation": "/.*/"
                            }]
                        }
                    }]
                $builder.addAllFormObject("#{index}0", scope.layout.rows[index].columns[0].formData.views)
    fbLayoutBuilder
]
