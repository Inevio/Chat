// Local Variables
var app               = $( this );
var chatIcon          = $( '.chat-icon' );
var chat              = $( '.chat' );
var contactPrototype  = $( '.contact.wz-prototype' );
var contactList       = $( '.contact-list' );
var chatTab           = $( '.chat-tab' );
var chatButton        = $( '.chat-tab-selector' );
var contactTab       = $( '.contact-tab' );
var contactsButton    = $( '.contact-tab-selector' );

// DOM Events
app.key('space',function(){
 $( '.ui-window' ).toggleClass( 'dark' );
});

chatButton.on('click', function(){
  changeTab('chat');
});

contactsButton.on('click', function(){
  changeTab('contact');
});

var setTexts = function(){
  $( '.chat-tab-selector span' ).text(lang.chats);
  $( '.contact-tab-selector span' ).text(lang.contacts);
  $( '.conversation-input input' ).attr('placeholder', lang.msg);
  $( '.close-coversation' ).text(lang.close);
  $( '.conversation-send' ).text(lang.send);
  $( '.new-group-button span' ).text(lang.newGroup);
}

var checkTab = function(){

  //Load channels
  if ( chatButton.hasClass( 'active' ) ) {
    changeTab( 'chat' );

  //Load contacts
  }else{
    changeTab( 'contact' );
  }

}

var changeTab = function(tab){

  switch(tab) {

    case 'chat':

      //Make it active and visible
      contactsButton.removeClass('active');
      chatButton.addClass('active');
      contactTab.removeClass( 'visible' );
      chatTab.addClass( 'visible' );

      break;

    case 'contact':

      //Make it active and visible
      chatButton.removeClass( 'active' );
      contactsButton.addClass( 'active' );
      chatTab.removeClass( 'visible' );
      contactTab.addClass( 'visible' );

      //Insert contacts in DOM
      $( '.contactDom' ).remove();
      getContacts();

      break;

  }

}

var getContacts = function(){

    wz.user.friendList( false, function( error, list ){

      if ( error ) { console.log('ERROR: ', error ); }

        console.log( 'metiendo contactos' , list );

        list.forEach(function( c ){

          wql.getSingleChannel( [ wz.system.user().id , c.id ] , function( error , message ){

            console.log( 'USR1(' , wz.system.user().id , ') USR2(' , c.id , ') CANAL=' , message );

            if ( error ) { console.log('ERROR: ', error ); }

            // Existe el canal
            if (message.length > 0) {

              wz.channel( message[ 'id_channel' ] , function( error, channel ){

                if ( error ) { console.log('ERROR: ', error ); }

                appendContact(c , channel);

              });

            }
            // No existe el canal
            else{

              appendContact(c);

            }

        });

      });

    });

}

var appendContact = function( c , channel ){

  var contact = contactPrototype.clone();

  contact
      .removeClass( 'wz-prototype' )
      .addClass( 'contactDom' )
      .find( '.contact-name' ).text( c.fullName );
  contact
      .find( '.contact-img' ).css( 'background-image' , 'url(' + c.avatar.big + ')' );
  contact
      .on( 'click' , function(){
        selectContact( $( this ) );
      });
  contact
      .data( 'contact' , c );

  if( channel != undefined ){ contact.data( 'channel' , channel ) }

  contactList.append( contact );

}

var selectContact = function( contact ){

  var channel = contact.data( 'channel' );
  var contactApi = contact.data( 'contact' );

  // Make active
  $( '.contactDom.active' ).removeClass( 'active' );
  contact.addClass( 'active' );

  // Set header
  $( '.conversation-name' ).text( contact.find( '.contact-name' ).text() );

  // No channel
  if( channel == undefined ){

  wz.channel( function( error , channel ){

    if ( error ) { console.log('ERROR: ', error ); }

    wql.addChannel( [ channel.id , null ] , function( error , message ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.addUserInChannel( [ channel.id , contactApi.id ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.addUserInChannel( [ channel.id , wz.system.user().id ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.addUser( contactApi.id , function(){

            contact.data( 'channel' , channel );

          });

        });

      });

    });

  });

  //Channel
  }else{

    console.log( 'Channel encontrado!' , channel );

    listMessages( channel );

  }
}

var listMessages = function( channel ){

  wql.getMessages( channel , function( error, messages ){

    if ( error ) { console.log('ERROR: ', error ); }

    for( var i = 0; i < messages.length; i++ ){
      printMessage( messages[ i ].text , messages[ i ].sender , messages[ i ].time );
    }

  });

}

var printMessage = function( text , sender , time ){

}

var initChat = function(){

  app.css({'border-radius'    : '6px',
           'background-color' : '#2c3238'
  });

  setTexts();
  checkTab();

}

// INIT Chat
initChat();
