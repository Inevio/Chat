'use strict';

var myContactID  = api.system.user().id;

api.channel.on( 'message' , function( info , o ){

  // The app is oppened, so don't show the banner
  if (wz.app.getViews().length != 0) {
    return;
  }

  // I am the sender , so don't show the banner
  if (info.sender == myContactID) {
    return;
  }

  // If recieved is a message increment Badge, and show the banner
  if ( o.action === 'message' ) {

    updateBadge( 1 , true );

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
        .on( 'click', function(){

          wz.app.openApp( 232 , info.id , function(o){});

        })
        .render();

    });

  }

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
