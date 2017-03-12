'use strict';
var myContactID  = api.system.user().id;
var lastMessageReceived;

api.channel.on( 'userAdded' , function( channel , userAdded ){
  api.channel( channel.id , function( e , channel ){
    if(e) console.log('ERROR: ', e);
    wql.addUserInChannel( [ channel.id , userAdded ] , function( e , message ){
      if(e) console.log('ERROR: ', e);
      if (api.app.getViews().length != 0) {
        api.app.getViews( 'main' ).trigger( 'getChats' );
      }
    });
  });
});

api.channel.on( 'userRemoved' , function( channel , userRemoved ){
  wql.deleteUserInChannel( [ channel.id , userRemoved ] , function( e , message ){
      if(e) console.log('ERROR: ', e);
      wql.getUsersInChannel( [ channel.id ] , function( e , users ){
        if(e) console.log('ERROR: ', e);
        if (users.length === 0) {
          wql.deleteChannel( [ channel[0].id ] , function(){
            if(e) console.log('ERROR: ', e);
          });
        }
        if (api.app.getViews().length != 0) {
          api.app.getViews( 'main' ).trigger( 'getChats' );
        }
      });
  });
});

api.channel.on( 'message' , function( info , o ){

  // The app is oppened, so don't show the banner
  if (api.app.getViews().length != 0) {
    return;
  }

  // I am the sender , so don't show the banner
  if (info.sender == myContactID) {
    return;
  }

  // If recieved is a message increment Badge, and show the banner
  if ( o.action === 'message' ) {

    /* COMPRUEBO QUE NO ES UN MENSAJE REPETIDO, YA QUE NO SE PORQUE SE ENVIA 2 VECES AL HACER UN UNICO .send() */
    if ( lastMessageReceived && o.id === lastMessageReceived.id ) {
      return;
    }
    lastMessageReceived = o;
    /* -- */

    updateBadge( 1 , true );

    api.user( info.sender, function( error, user ){

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

          api.app.openApp( 232 , info.id , function(o){});

        })
        .render();

    });

  }

});

var updateBadge = function( num , add ){

  var actualBadge = api.app.getBadge();

  if ( add ) {
    api.app.setBadge( parseInt(actualBadge) + num  );
  }else{
    api.app.setBadge( parseInt(actualBadge) - num  );
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

api.notification.on( 'notification', function( data ){

  console.log('recibo notification', data);

  var info = [ 'push' , { channelId : parseInt( data.data.channel ) , messageId : parseInt( data.data.message ) }  ]

  if( !data.foreground ){
    api.app.createView( info );
  }


});
