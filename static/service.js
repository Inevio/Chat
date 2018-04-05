'use strict'

var myUserID = api.system.user().id

var updateBadge = function( num, add ){

  if( num != null ){
    console.log('Chat badge actualizado, tienes: ' + parseInt(num) + ' notificationes')
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

  if ( data.protocol != 'chat') {
    return
  }

  if( data.sender === myUserID ){
    return
  }

  //updateBadge( null, true )
  if( api.app.getViews('main').length === 0 ){

    api.user( data.sender, function( error, user ){

      if( error ){
        return this.view.launchAlert( error );
      }

      api.banner()
        .setTitle( user.fullName )
        .setText( data.message )
        .setIcon( user.avatar.tiny )
        // To Do -> .sound( 'marimba' )
        .on( 'click', function(){

          api.app.createView( data.comContext, 'main' );
          //this.openConversation( notification.comContext );         

        })
        .render()

    });

  }


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
