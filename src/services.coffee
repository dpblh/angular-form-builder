###
  utils service
###
angular.module 'builder.services', []

.factory 'utilsBuilder', [ ->

  guid:  ->
    s4 = ->
      Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()

]