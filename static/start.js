return alert( lang.updating );

var app  = $( this );
var mobile = app.hasClass('wz-mobile-view');
var myContactID  = api.system.user().id;
var desktop  = $(this).parent().parent();

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

  var action = params[0];
  var options = params[1];
  var callback = params[2];

  switch (action) {

    case 'push':
      start();
      break

    case 'open-chat':
      start();
      break;

    case 'new-world-chat':

      options.world.getChannelForApp( 14 , function( e , channelId ){
        if(e) console.log('ERROR: ', e);
        api.channel( channelId , function( e , channel ){
          if(e) console.log('ERROR: ', e);
          wql.addWorldChannel( [ channel.id , options.world.name , options.world.id , Date.now() ] , function( e , message ){
            if(e) console.log('ERROR: ', e);
            channel.list(function( e , userList ){
              if(e) console.log('ERROR: ', e);
              userList.forEach(function( user ){
                wql.addUserInChannel( [ channel.id , user ] , function( e , message ){
                  if(e) console.log('ERROR: ', e);
                  api.app.removeView(app);
                });
              });
            });
          });
        });
      });
      break;

    case 'open-world-chat':
      start();
      break;

    case 'remove-world-user-chat':{

      wql.getWorldChannel( [ options.world.id ] , function( e , channel ){
        if(e) console.log('ERROR: ', e);
        wql.deleteUserInChannel( [ channel[0].id , myContactID ] , function( e , message ){
            if(e) console.log('ERROR: ', e);
            wql.getUsersInChannel( [ channel[0].id ] , function( e , users ){
              if(e) console.log('ERROR: ', e);
              if (users.length === 0) {
                wql.deleteChannel( [ channel[0].id ] , function(){
                  if(e) console.log('ERROR: ', e);
                });
              }
              api.app.removeView(app);
            });
        });
      });



    }

  }

}
