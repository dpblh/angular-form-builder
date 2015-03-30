###
  utils service
###
angular.module 'builder.services', []

.factory 'utilsBuilder', [ ->

  guid:  ->
    s4 = ->
      Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()

  copyObjectToScope: (object, scope) ->
    ###
    Copy object (ng-repeat="object in objects") to scope without `hashKey`.
    ###
    for key, value of object when key isnt '$$hashKey'
      # copy object.{} to scope.{}
      scope[key] = value
    return


]