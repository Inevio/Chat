
'use strict';

wz.webrtc.on( 'incomingCall', function( userId, prevSpd ){

    wz.user( userId, function( error, user ){

        if( error ){
            return;
        }

        wz.app.createView( { type : 'incomingCall', user : user, prevSpd : prevSpd } );

    });
    
});
