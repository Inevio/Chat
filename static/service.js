'use strict';

var myContactID  = api.system.user().id;

wz.channel.on( 'message' , function( info , o ){

  if( info.sender === api.system.user().id ){
    return;
  }

  wz.user( info.sender, function( error, user ){

    if( error ){
      return;
    }

    var name = o.groupName ? o.groupName : user.fullName;

    api.banner()
      .setTitle( name )
      .setText( o.txt )
      .setIcon( user.avatar.tiny )
      // To Do -> .sound( 'marimba' )
      .on( 'click', function(){})
      .render();

  });

});

var updateBadge = function( num , add ){

  var actualBadge = wz.app.getBadge();

  if ( add ) {
    wz.app.setBadge( parseInt(actualBadge) + num  );
  }else{
    wz.app.setBadge( parseInt(actualBadge) - num  );
  }


};

wql.getChannels( myContactID , function( error , channels ){

  channels.forEach( function( channel , i ){

    wql.getLastRead( [ channel.id , myContactID ] , function( error , lastRead ){

      wql.getUnreads( [ channel.id, lastRead[0]['last_read'] ] , function( error , notSeen ){

        updateBadge( notSeen[0]['COUNT(*)'] , true );

      });

    });

  });

});

api.channel.on( 'message', function( message , text ){

  if ( text.action === 'message' ) {

    if (wz.app.getViews().length === 0) {
      updateBadge( 1 , true );
    }

  }

});
