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
