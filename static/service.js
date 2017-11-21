'use strict'

var myUserID = api.system.user().id

var updateBadge = function( num, add ){

  if( num != null ){
    api.app.setBadge( parseInt( num ) )
  }else{

    var actualBadge = api.app.getBadge()
    if ( add ) {
      api.app.setBadge( parseInt(actualBadge) + 1 )
    }else{
      api.app.setBadge( parseInt(actualBadge) - 1 )
    }

  }

}

api.notification.on( 'new', function( data ){

  if( data.sender === myUserID ){
    return
  }

  //updateBadge( null, true )

  api.notification.count( 'chat' , function( err, counted ){

    if( !err ){
      updateBadge( counted )
    }

  })

})

api.notification.on( 'attended', function(){

  //updateBadge( null, false )

  api.notification.count( 'chat' , {}, function( err, counted ){

    if( !err ){
      updateBadge( counted )
    }

  })

})

//Start
api.notification.count( 'chat' , {}, function( err, counted ){

  if( !err ){
    updateBadge( counted )
  }

})
