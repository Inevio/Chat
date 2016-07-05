var app  = $( this );

wql.getUserPreference( api.system.user().id , function( error , preferences ){

  if ( preferences.length > 0 ) {

    preferences = preferences[0];

    wz.view.setSize( preferences.width , preferences.height );

    if ( preferences.dark ) {
      $( '.ui-window' ).addClass( 'dark' );
    }

  }

  app.css({'border-radius'    : '6px',
  'background-color' : '#2c3238'
  });

  start();

});

app.on( 'app-param', function( e, params ){

  var action = params[0];
  var world = params[1];
  var callback = params[2];

  if (!world.owner) {
    return;
  }

  switch (action) {

    case 'new-chat':

    api.channel( function( error , channel ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.addWorldChannel( [ channel.id , world.name , world.id ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.addUserInChannel( [ channel.id , world.owner ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.addUser( world.owner , function( error ){

            if ( error ) { console.log('ERROR: ', error ); }

            callback( 'chat generado, todo ok!' );
            wz.app.removeView(app);

          });

        });

      });

    });
    break;

    case 'join-chat':

    wql.getWorldChannel( world.id , function( error , obj ){

      if ( error ) { console.log('ERROR: ', error ); }

      var chatId = obj[0].id;

      wz.channel( chatId , function( error, channel ){

        wql.addUserInChannel( [ channel.id , world.owner ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.addUser( world.owner , function( error ){

            if ( error ) { console.log('ERROR: ', error ); }

            callback( 'me he unido al chat, todo ok!' );
            wz.app.removeView(app);

          });

        });

      });

    });

    break;

    case 'open-chat':

    wql.getWorldChannel( world.id , function( error , obj ){

      if ( error ) { console.log('ERROR: ', error ); }

      var chatId = obj[0].id;

      var timeout = setTimeout(function(){
        $( '.chatDom-' + chatId ).click();
      }, 1000);

      callback( 'chat abierto, todo ok!' );

    });

    break;

    case 'remove-chat':

    wql.getWorldChannel( world.id , function( error , obj ){

      if ( error ) { console.log('ERROR: ', error ); }

      var chatId = obj[0].id;

      wz.channel( chatId , function( error, channel ){

        wql.deleteUsersInChannel( channel.id , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          wql.deleteChannel( channel.id , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            callback( 'chat borrado, todo ok!' );
            wz.app.removeView(app);

          });

        });

      });

    });

    break;

  }

});
