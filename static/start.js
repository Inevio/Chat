var app  = $( this );
var mobile = app.hasClass('wz-mobile-view');

if( mobile ){
  app.addClass('dark');
  $('.ui-window.chat').addClass('dark');
  StatusBar.backgroundColorByHexString("#2c3238");
}

if ( !params ) {

  wql.getUserPreference( api.system.user().id , function( error , preferences ){

    if( !error ){

      if ( preferences.length > 0 ) {

        preferences = preferences[0];

        if( ( preferences.width < api.tool.desktopWidth() ) && ( preferences.height < api.tool.desktopHeight() ) ){
          api.view.setSize( preferences.width , preferences.height );
        }

        if ( preferences.dark ) {
          app.addClass('dark');
          $( '.ui-window' ).addClass( 'dark' );
        }

      }

    }

    start();

  });

}else{

  if( params[ 0 ] === 'push' ){
    return start();
  }

  var action = params[0];
  var o = params[1];
  var callback = params[2];

  if ( ! o.type ) {
    return;
  }

  switch (action) {

    case 'new-chat':

    if ( o.type === 'world' ) {

      var world = o.content;

      api.channel( function( error , channel ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.addWorldChannel( [ channel.id , world.name , world.id ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          wql.addUserInChannel( [ channel.id , world.owner ] , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.addUser( world.owner , function( error ){

              if ( error ) { console.log('ERROR: ', error ); }

              callback( 'chat generado, todo ok!' );
              api.app.removeView(app);

            });

          });

        });

      });

    }

    break;

    case 'join-chat':

    if ( o.type === 'world' ) {

      var world = o.content;

      wql.getWorldChannel( world.id , function( error , obj ){

        if ( error ) { console.log('ERROR: ', error ); }

        var chatId = obj[0].id;

        api.channel( chatId , function( error, channel ){

          wql.addUserInChannel( [ channel.id , world.owner ] , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.addUser( world.owner , function( error ){

              if ( error ) { console.log('ERROR: ', error ); }

              callback( 'me he unido al chat, todo ok!' );
              api.app.removeView(app);

            });

          });

        });

      });

    }

    break;

    case 'open-chat':

    start();
    break;

    case 'remove-chat':

    if ( o.type === 'world' ) {

      var world = o.content;

      wql.getWorldChannel( world.id , function( error , obj ){

        if ( error ) { console.log('ERROR: ', error ); }

        var chatId = obj[0].id;

        api.channel( chatId , function( error, channel ){

          wql.deleteUsersInChannel( channel.id , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            wql.deleteChannel( channel.id , function( error , message ){

              if ( error ) { console.log('ERROR: ', error ); }

              callback( 'chat borrado, todo ok!' );
              api.app.removeView(app);

            });

          });

        });

      });

    }

    break;

  }

}
