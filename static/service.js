
'use strict';

wz.channel.on( 'message' , function( info , text ){

  if( info.sender === api.system.user().id ){
    return;
  }

  wz.user( info.sender, function( error, user ){

    if( error ){
      return;
    }

    api.banner()
      .setTitle( user.fullName )
      .setText( text )
      .setIcon( user.avatar.tiny )
      // To Do -> .sound( 'marimba' )
      .on( 'click', function(){})
      .render();

  });

});
