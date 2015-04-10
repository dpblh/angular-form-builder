###
  rules service
###
angular.module 'form'
.provider 'rules', ->
    $get: ->
        @rules
    rules: []
    register: (label, rule)->
        @rules.push
            label: label
            rule: rule

