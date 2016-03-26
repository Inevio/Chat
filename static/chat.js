var myContacts = [];

// Local Variables
var app               = $( this );
var chatIcon          = $( '.chat-icon' );
var chat              = $( '.chat' );
var contactPrototype  = $( '.contact.wz-prototype' );
var chatPrototype     = $( '.channel.wz-prototype' );
var contactList       = $( '.contact-list' );
var channelList       = $( '.channel-list' );
var chatTab           = $( '.chat-tab' );
var chatButton        = $( '.chat-tab-selector' );
var contactTab        = $( '.contact-tab' );
var contactsButton    = $( '.contact-tab-selector' );
var sendButton        = $( '.conversation-send' );
var content           = $( '.ui-content' );
var lastMessage       = $( '.conversation-moreinfo' );
var searchBox         = $( '.chat-search input' );
var closeChatButton   = $( '.close-coversation' );
var newGroupButton    = $( '.new-group-button' );
var groupMenu         = $( '.group-menu' );
var backGroup         = $( '.group-menu .back' );
var memberPrototype   = $( '.member.wz-prototype' );
var memberList        = $( '.member-list' );
var cancelNewGroup    = $( '.cancel-group' );
var saveNewGroup      = $( '.save-group' );
var removeGroup       = $( '.remove-group' );

// COLOR PALETTE
var colorPalette = [
  {name: 'blue' , light: '#a6d2fa', text:'#2a77ad' , border:'#1664a5'},
  {name: 'green' , light: '#badb95', text:'#306e0d' , border:'#3c7919'},
  {name: 'purple' , light: '#d8ccf1', text:'#9064e1' , border:'#6742aa'},
  {name: 'orange' , light: '#f7c97e', text:'#b45d1f' , border:'#f68738'},
  {name: 'brown' , light: '#b2a59d', text:'#5a4638' , border:'#6e5646'},
  {name: 'green2' , light: '#8cd0b3', text:'#0a5a36' , border:'#128a54'},
  {name: 'red' , light: '#ec9a97', text:'#912521' , border:'#e13d35'},
  {name: 'pink' , light: '#f7beec', text:'#9c4ba5' , border:'#b44b9f'},
  {name: 'grey' , light: '#97a1a9', text:'#353b43' , border:'#384a59'},
  {name: 'yellow' , light: '#fbe27d', text:'#84740b' , border:'#ffb400'},
];

// DOM Events
app.key( 'f1' , function(){

  $( '.ui-window' ).toggleClass( 'dark' );

});

chatButton.on( 'click' , function(){

  changeTab('chat');

});

contactsButton.on( 'click' , function(){

  changeTab('contact');

});

sendButton.on( 'click' , function(){

  sendMessage();

});

app.key( 'enter' ,function(){

  sendMessage();

});

searchBox.on( 'input' , function(){

  filterElements( $( this ).val() );

});

wz.channel.on( 'message' , function( message , text ){

  messageRecived( message , text );

});

closeChatButton.on( 'click' , function(){

  content.removeClass( 'visible' );

  if ( chatButton.hasClass( 'active' ) ) {

    $( '.chatDom.active' ).removeClass( 'active' );

  }else{

    $( '.contactDom.active' ).removeClass( 'active' );

  }

});

newGroupButton.on( 'click' , function(){

  newGroup();

});

backGroup.on( 'click' , function(){

  groupMenu.removeClass( 'visible' );
  removeGroup.removeClass( 'visible' );

});

cancelNewGroup.on( 'click' , function(){

  groupMenu.removeClass( 'visible' );
  removeGroup.removeClass( 'visible' );

});

saveNewGroup.on( 'click' , function(){

  saveGroup();

});

wz.channel.on( 'destroyed' , function( info ){

  chatDeleted( info );

});

wz.channel.on( 'userAdded', function( info, userId ){

  userAdded( info , userId );

});

removeGroup.on( 'click' , function(){

  deleteOrExitGroup();

});

// FUNCTIONS
var setTexts = function(){
  $( '.chat-tab-selector span' ).text(lang.chats);
  $( '.contact-tab-selector span' ).text(lang.contacts);
  $( '.conversation-input input' ).attr('placeholder', lang.msg);
  $( '.chat-search input' ).attr('placeholder', lang.search);;
  $( '.close-coversation' ).text(lang.close);
  $( '.conversation-send' ).text(lang.send);
  $( '.new-group-button span' ).text(lang.newGroup);
  $( '.no-chat-txt' ).text(lang.noChat);
  $( '.group-menu .back span' ).text(lang.back);
  $( '.group-menu .edit' ).text(lang.edit);
  $( '.group-info .title' ).text(lang.info);
  $( '.group-members .title' ).text(lang.MEMBERS);
  $( '.group-create-txt' ).text(lang.newGroupTitle);
  $( '.save-group span' ).text(lang.save);
  $( '.cancel-group span' ).text(lang.cancel);
  $( '.group-name-input input' ).attr('placeholder', lang.groupName);
}

var checkTab = function(){

  // Load channels
  if ( chatButton.hasClass( 'active' ) ) {
    changeTab( 'chat' );

    // Load contacts
  }else{
    changeTab( 'contact' );
  }

}

var changeTab = function(tab){

  switch(tab) {

    case 'chat':

    // Make it active and visible
    contactsButton.removeClass('active');
    chatButton.addClass('active');
    contactTab.removeClass( 'visible' );
    chatTab.addClass( 'visible' );
    newGroupButton.removeClass( 'visible' );
    groupMenu.removeClass( 'visible' );
    removeGroup.removeClass( 'visible' );

    break;

    case 'contact':

    // Make it active and visible
    chatButton.removeClass( 'active' );
    contactsButton.addClass( 'active' );
    chatTab.removeClass( 'visible' );
    contactTab.addClass( 'visible' );
    newGroupButton.addClass( 'visible' );

    break;

  }

}

var getContacts = function(){

  wz.user.friendList( false, function( error, list ){

    if ( error ) { console.log('ERROR: ', error ); }

    console.log( 'metiendo contactos' , list );

    asyncEach( list , function( c , cb ){

      wql.getSingleChannel( [ wz.system.user().id , c.id ] , function( error , message ){

        console.log( 'USR1(' , wz.system.user().id , ') USR2(' , c.id , ') CANAL=' , message );

        if ( error ) { console.log('ERROR: ', error ); }

        // Existe el canal
        if (message.length > 0) {

          wz.channel( message[0][ 'id_channel' ] , function( error, channel ){

            if ( error ) { console.log('ERROR: ', error ); }

            appendContact( c , channel , cb );

          });

        }
        // No existe el canal
        else{

          appendContact( c , null , cb );

        }

      });

    } , function(){

      wz.user.connectedFriends( true, function( error, list ){

        $.each( list , function( i , friendId ){

          var friend = $( '.user-id-' + friendId );

          updateContactState( friend , true , friendId );

        });

      });

    });

  });

}

var getChats = function( callback ){

  wql.getChannels( wz.system.user().id , function( error , message ){

    if ( error ) { console.log('ERROR: ', error ); }

    $.each( message , function( i , channel ){

      // No repeat chats already appended
      var chats = $( '.chatDom' );
      for (var i = 0; i < chats.length; i++) {

        var ch = chats.eq(i).data( 'channel' );

        if( ch.id == channel.id ){

          return;

        }

      }

      wql.getUsersInChannel( channel.id , function( error , users ){

        wz.user.friendList( false, function( error, friends ){

          var isGroup = channel.name != null ? true : false;
          var groupName = channel.name;

          if( !isGroup ){

            var me = wz.system.user().id;
            var you;

            if( me == users[0].user ){

              you = users[1].user;

            }else{

              you = users[0].user;

            }

            $.each( friends , function( index , element ){

              if ( element.id == you ) {

                wz.channel( channel.id , function( error, channel ){

                  appendChat( channel , element , groupName , function( chat ){

                    callback( chat );

                  });

                });

              }

            });

          }else{

            wz.channel( channel.id , function( error, channel ){

              var usersInGroup = [];

              for (var i = 0; i < users.length; i++) {

                for (var j = 0; j < friends.length; j++) {

                  if ( users[i].user == friends[j].id ) {

                    usersInGroup.push( friends[j] );

                  }

                }

              }

              appendChat( channel , usersInGroup , groupName , function( chat ){

                callback( chat );

              });

            });

          }

        });

      });

    });

  });

}

var appendContact = function( c , channel , callback ){

  wql.getChannelSeen( c.id , function( error , notSeen ){

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
    contact
    .addClass( 'user-id-' + c.id );

    myContacts.push( { id : c.id , status : false } );

    if( channel != undefined ){ contact.data( 'channel' , channel ) }

    var list = $( '.contactDom' );

    if ( list.length > 0 ) {

      var inserted = false;

      $.each( list , function( i , o ){

        if( !inserted && c.fullName.localeCompare( $(o).find( '.contact-name' ).text() ) === -1 ){

          inserted = true;

          $(o).before( contact );

        }

      });

      if ( !inserted ) {

        list.eq( list.length - 1 ).after( contact );

      }

    }else{

      contactList.append( contact );

    }


    if ( notSeen[0] != undefined && notSeen[0]['not_seen'] > 0 ) {

      contact.data( 'notSeen' , notSeen[0]['not_seen'] );

    }

    callback();

  });

}

var appendChat = function( c , user , groupName , callback ){

  wql.getMessages( c.id , function( error, messages ){

    wql.getChannelSeen( c.id , function( error , notSeen ){

      if ( error ) { console.log('ERROR: ', error ); }

      var lastMsg;

      for( var i = 0; i < messages.length; i++ ){

        if( i+1 == messages.length ){

          var lastMsg = messages[i];

        }

      }

      var chat = chatPrototype.clone();

      chat
      .removeClass( 'wz-prototype' )
      .addClass( 'chatDom' );

      if( groupName == null ){

        chat
        .find( '.channel-name' ).text( user.fullName );
        chat
        .find( '.channel-img' ).css( 'background-image' , 'url(' + user.avatar.big + ')' );

        if(lastMsg != undefined){

          var date = new Date(lastMsg.time);

          chat
          .find( '.channel-last-time' ).text( getStringHour( date ) );
          chat
          .find( '.channel-last-msg' ).text( lastMsg.text );

        }

      }else{

        chat
        .find( '.channel-name' ).text( groupName );

        setGroupAvatar( groupName , chat.find( '.channel-img' ) );

        if(lastMsg != undefined){

          var date = new Date(lastMsg.time);

          chat
          .find( '.channel-last-time' ).text( getStringHour( date ) );
          chat
          .find( '.channel-last-msg' ).text( lastMsg.text );

        }

      }

      channelList.append( chat );

      chat
      .data( 'channel' , c );
      chat
      .data( 'user' , user );
      chat
      .data( 'isGroup' , groupName );
      chat
      .on( 'click' , function(){
        selectChat( $( this ) );
      });

      if ( notSeen[0]['not_seen'] > 0 ) {

        chat.data( 'notSeen' , notSeen[0]['not_seen'] );
        chat.find( '.channel-badge' ).addClass( 'visible' );
        chat.find( '.channel-badge span' ).text( notSeen[0]['not_seen'] );

      }

      setActiveChat( chat );

      callback( chat );

    });

  });

}

var selectContact = function( contact ){

  groupMenu.removeClass( 'visible' );
  removeGroup.removeClass( 'visible' );

  $( '.conversation-input input' ).focus();

  var channel = contact.data( 'channel' );

  // Make active
  $( '.contactDom.active' ).removeClass( 'active' );
  contact.addClass( 'active' );
  content.addClass( 'visible' );

  // Set header
  $( '.conversation-name' ).text( contact.find( '.contact-name' ).text() );

  if ( channel == undefined ) {

    $( '.conversation-header' ).data( 'channel' , null );
    $( '.messageDom' ).remove();


  }else{

    $( '.conversation-header' ).data( 'channel' , channel );
    listMessages( channel );

    contact.data( 'notSeen' , null );
    wql.updateChannelSeen( [ 0 , channel.id ] , function( error , message ){

      if ( error ) { console.log('ERROR: ', error ); }

    });

  }

  if ( contact.hasClass( 'conected' ) ) {

    lastMessage.text( lang.conected );

  }else{

    lastMessage.text( lang.disconected );

  }

}

var selectChat = function( chat ){

  groupMenu.removeClass( 'visible' );
  removeGroup.removeClass( 'visible' );

  $( '.conversation-input input' ).focus();

  var channel = chat.data( 'channel' );
  var contact = chat.data( 'user' );

  // Make active
  $( '.chatDom.active' ).removeClass( 'active' );
  chat.addClass( 'active' );
  content.addClass( 'visible' );

  // Set header
  $( '.conversation-name' ).text( chat.find( '.channel-name' ).text() );

  if ( channel == undefined ) {

    $( '.conversation-header' ).data( 'channel' , null );
    $( '.messageDom' ).remove();


  }else{

    $( '.conversation-header' ).data( 'channel' , channel );
    listMessages( channel );

    chat.data( 'notSeen' , null );
    chat.find( '.channel-badge' ).removeClass( 'visible' );

    if( chat.data( 'isGroup' ) != null ){

      $( '.conversation-header' ).off( 'click' );
      $( '.conversation-header' ).on( 'click' , function(){

        viewGroup();

      });

    }

    wql.updateChannelSeen( [ 0 , channel.id ] , function( error , message ){

      if ( error ) { console.log('ERROR: ', error ); }

    });

    if ( !Array.isArray( contact ) && isConected( contact.id ) ) {

      lastMessage.text( lang.conected );

    }else{

      lastMessage.text( lang.disconected );

    }

  }

}

var listMessages = function( channel ){

  $( '.messageDom' ).remove();

  wql.getMessages( channel.id , function( error, messages ){

    if ( error ) { console.log('ERROR: ', error ); }

    for( var i = 0; i < messages.length; i++ ){

      if ( messages[i].sender == wz.system.user().id ) {

        printMessage( messages[ i ].text , null , messages[ i ].time );

      }else{

        var users = $( '.chatDom.active' ).data( 'user' );

        if ( !Array.isArray( users ) ) {

          printMessage( messages[ i ].text , users , messages[ i ].time );

        }else{

          for (var j = 0; j < users.length; j++) {

            if ( users[j].id == messages[ i ].sender ) {

              printMessage( messages[ i ].text , users[j] , messages[ i ].time );

            }

          }

        }

      }

    }

  });

}

var isConected = function( user ){

  var conected = false;

  for (var i = 0; i < myContacts.length; i++) {

    if ( myContacts[i].id = user && myContacts[i].status ) {

      conected = true;

    }

  }

  return conected;

}

var printMessage = function( text , sender , time , animate ){

  var message;
  var date = new Date( time );
  var hh = date.getHours();
  var mm = date.getMinutes();

  if(hh<10) {
    hh='0'+hh
  }

  if(mm<10) {
    mm='0'+mm
  }

  if( sender == null ){

    message = $( '.message-me.wz-prototype' ).clone();
    message
    .removeClass( 'wz-prototype' )
    .addClass( 'messageDom' )
    .find( '.message-text' ).text( text );
    message
    .find( '.message-time' ).text( hh + ':' + mm );

  }else{

    message = $( '.message-other.wz-prototype' ).clone();
    message
    .removeClass( 'wz-prototype' )
    .addClass( 'messageDom' )
    message
    .find( '.message-text' ).text( text );

    if ( $( '.chatDom.active' ).data( 'isGroup' ) != null ) {

      var senderName = sender.fullName;
      message.find( '.sender' ).addClass( 'visible' );
      message.find( '.sender' ).text( senderName );
      message.find( '.sender' ).css( 'color' , colorPalette[ selectColor( senderName ) ].text );

    }

    message
    .find( '.message-time' ).text( hh + ':' + mm );

    message
    .find( '.message-avatar' ).css( 'background-image' , 'url(' + sender.avatar.big + ')' );

  }

  $( '.message-container' ).append( message );

  if(animate){

    $( '.message-container' ).stop().clearQueue().animate( { scrollTop : message[0].offsetTop }, 400  );

  }else{

    $( '.message-container' ).scrollTop( message[0].offsetTop );

  }

}

var initChat = function(){

  app.css({'border-radius'    : '6px',
  'background-color' : '#2c3238'
  });

  setTexts();
  checkTab();
  getContacts();
  getChats(function(){});

}

var sendMessage = function(){

  var txt = $( '.conversation-input input' ).val();
  var channel = $( '.conversation-header' ).data( 'channel' );
  var contactApi = $( '.contactDom.active' ).data( 'contact' );

  // Clean sender
  $( '.conversation-input input' ).val('');

  if ( channel == null ) {

    wz.channel( function( error , channel ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.addChannel( [ channel.id , null ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.addUserInChannel( [ channel.id , contactApi.id ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          wql.addUserInChannel( [ channel.id , wz.system.user().id ] , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.addUser( contactApi.id , function(){

              $( '.contactDom.active' ).data( 'channel' , channel );
              $( '.conversation-header' ).data( 'channel' , channel );
              send( txt , channel );

            });

          });

        });

      });

    });

  }else{

    send( txt , channel );

  }

}

var send = function( message , channel ){

  if( message != '' ){

    channel.send( message , function( error ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.addMessage( [ message , wz.system.user().id , channel.id ] , function( error , messages ){

        if ( error ) { console.log('ERROR: ', error ); }

      });

    });

  }

}

var timeElapsed = function( lastTime ){

  var now = new Date();
  var last = new Date( lastTime );

  if( now.getFullYear() > last.getFullYear() ){

    return lang.last + ' ' + ( now.getFullYear() - last.getFullYear() ) + ' ' + lang.years;

  }else if( now.getMonth() > last.getMonth() ){

    return lang.last + ' ' + ( now.getMonth() - last.getMonth() ) + ' ' + lang.months;

  }else if( now.getDate() > last.getDate() ){

    return lang.last + ' ' + ( now.getDate() - last.getDate() ) + ' ' + lang.days;

  }else if( now.getHours() > last.getHours() ){

    return lang.last + ' ' + ( now.getHours() - last.getHours() ) + ' ' + lang.hours;

  }else{

    return lang.last + ' ' + ( now.getMinutes() - last.getMinutes() ) + ' ' + lang.minutes;

  }

}

var startsWithContacts = function( wordToCompare ){

  return function( index , element ) {

    return $( element ).find( '.contact-name' ).text().toLowerCase().indexOf( wordToCompare.toLowerCase() ) !== -1;

  }

}

var startsWithChats = function( wordToCompare ){

  return function( index , element ) {

    return $( element ).find( '.channel-name' ).text().toLowerCase().indexOf( wordToCompare.toLowerCase() ) !== -1;

  }

}

var filterElements = function( filter ){

  // Search chats
  if ( chatButton.hasClass( 'active' ) ) {

    var chats = $( '.chatDom' );
    chats.show();
    var chatsToShow = chats.filter( startsWithChats( filter ) );
    var chatsToHide = chats.not( chatsToShow );
    chatsToHide.hide();

    // Search contacts
  }else{

    var contacts = $( '.contactDom' );
    contacts.show();
    var contactsToShow = contacts.filter( startsWithContacts( filter ) );
    var contactsToHide = contacts.not( contactsToShow );
    contactsToHide.hide();

  }

}

var setActiveChat = function( chat ){

  var channelActive = $( '.conversation-header' ).data( 'channel' );

  if (channelActive != undefined && chat.data( 'channel' ).id == channelActive.id) {

    chat.click();

  }

}

var messageRecived = function( message , txt ){

  var channelActive = $( '.conversation-header' ).data( 'channel' );
  var date = new Date();

  var chats = $( '.chatDom' );
  var chat = '';
  var printed = false;

  // If I am on contact tab
  if ( contactsButton.hasClass( 'active' ) ) {

    var contacts = $( '.contactDom' );
    $.each( contacts , function( i , c ){

      var contact = contacts.eq(i);

      wql.getUsersInChannel( message.id , function( error , users ){

        var me = wz.system.user().id;
        var you;

        if( me == users[0].user ){

          you = users[1].user;

        }else{

          you = users[0].user;

        }

        // This is the contact who is speaking
        if (  contact.data( 'contact' ).id == you ) {

          wz.channel( message.id , function( error, channel ){

            contact.data( 'channel' , channel );
            console.log( 'nuevo channel al contact: ' , contact );

            // If is active
            if( contacts.eq(i).hasClass( 'active' ) ){

              $( '.conversation-header' ).data( 'channel' , channel );

              if ( message.sender == wz.system.user().id ) {

                printMessage( txt , null , date.getTime() , true );

              }else{

                var user = contact.data( 'contact' );

                printMessage( txt , user , date.getTime() , true );

              }


              // If isn't active
            }else{

              var notSeen = contact.data( 'notSeen' );
              if ( !notSeen ) {

                notSeen = 1;

              }else{

                notSeen = notSeen + 1;

              }

              contact.data( 'notSeen' , notSeen );
              wql.updateChannelSeen( [ notSeen , channel.id ] , function( error , message ){

                if ( error ) { console.log('ERROR: ', error ); }

              });

            }

          });

        }

      });

    });

    // If I am on chat tab
  }else{

    // Search message's chat
    for (var i = 0; i < chats.length; i++) {

      var current = chats.eq(i);

      if ( current.data( 'channel' ).id == message.id ) {

        chat = current;

      }

    }

    // The chat is not created
    if( chat == '' ){

      getChats(function( chat ){

        chat.data( 'notSeen' , 1 );
        wql.updateChannelSeen( [ notSeen , message.id ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          chat.find( '.channel-badge' ).addClass( 'visible' );
          chat.find( '.channel-badge span' ).text(1);

          setChatInfo( chat , txt );

        });

      });

      // I am on this chat
    }else if( channelActive && channelActive.id == message.id ){


      if ( message.sender == wz.system.user().id ) {

        printMessage( txt , null , date.getTime() , true );

      }else{

        var users = chat.data( 'user' );

        if ( !Array.isArray( users ) ) {

          printMessage( txt , users , date.getTime() , true );

        }else{

          for (var j = 0; j < users.length; j++) {

            if ( users[j].id == message.sender ) {

              printMessage( txt , users[j] , date.getTime() , true );

            }

          }

        }

      }

      lastMessage.text( timeElapsed( date.getTime() ) );

      if ( isConected( message.sender ) ) {

        lastMessage.text( lang.conected );

      }

      setChatInfo( chat , txt );

      // I am in other chat
    }else{

      var notSeen = chat.data( 'notSeen' );
      if ( !notSeen ) {

        notSeen = 1;

      }else{

        notSeen = notSeen + 1;

      }

      chat.data( 'notSeen' , notSeen );
      wql.updateChannelSeen( [ notSeen , message.id ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        chat.find( '.channel-badge' ).addClass( 'visible' );
        chat.find( '.channel-badge span' ).text( notSeen );

        setChatInfo( chat , txt );

      });

    }

  }

}

var setChatInfo = function( chat , txt ){

  chat.insertBefore( $( '.chatDom' ).eq(0) );
  chat.find( '.channel-last-msg' ).text( txt );
  var date = new Date();
  chat.find( '.channel-last-time' ).text( getStringHour( date ) );

}

var getStringHour = function( date ){

  var hh = date.getHours();
  var mm = date.getMinutes();

  if(hh<10) {
    hh='0'+hh
  }

  if(mm<10) {
    mm='0'+mm
  }

  return hh + ':' + mm;

}

var newGroup = function(){

  // Make it visible
  $( '.group-menu .visible' ).removeClass( 'visible' );
  groupMenu.addClass( 'visible' ).addClass( 'group-new' );
  $( '.group-new' ).addClass( 'visible' );

  setGroupAvatar( '?' , $( '.group-avatar' ) );

  $( '.memberDom' ).remove();
  wz.user.friendList( false, function( error, list ){

    $.each( list , function( index , friend ){

      appendMember( friend );

    });

    $( '.search-members input' ).on( 'input' , function(){

      filterMembers( $( this ).val() );

    });

  });

}

var filterMembers = function( filter ){

  var members = $( '.memberDom' );
  members.show();
  var membersToShow = members.filter( startsWithMember( filter ) );
  var membersNotToShow = members.not( membersToShow );
  membersNotToShow.hide();

}

var startsWithMember = function( wordToCompare ){

  return function( index , element ) {

    return $( element ).find( 'span' ).text().toLowerCase().indexOf( wordToCompare.toLowerCase() ) !== -1;

  }

}

var saveGroup = function(){

  if ( groupMenu.hasClass( 'group-edit' ) ) {

    editGroup();

  }else{

    createNewGroup();

  }

}

var editGroup = function(){

  var groupName = $( '.group-name-input input' ).val();
  var members = $( '.memberDom.active' );
  var channel = $( '.chatDom.active' ).data( 'channel' );

  if ( groupName != '' ) {

    if ( members.length == 0 ) {

      alert( lang.noMemberError );
      return;

    }

    wql.updateChannelName( [ groupName , channel.id ] , function( error , message ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.getUsersInChannel( channel.id , function( error , users ){

        if ( error ) { console.log('ERROR: ', error ); }

        $.each( users , function( i , user ){

          channel.removeUser( user.user , function( error ){

            if ( error ) { console.log('ERROR: ', error ); }

          });

        });

        wql.deleteUsersInChannel( channel.id , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          wql.addUserInChannel( [ channel.id , wz.system.user().id ] , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.addUser( wz.system.user().id , function(){

              $.each( members , function( index , member ){

                var contact = $( member ).data( 'contact' );

                wql.addUserInChannel( [ channel.id , contact.id ] , function( error , message ){

                  if ( error ) { console.log('ERROR: ', error ); }

                  channel.addUser( contact.id , function(){

                    groupMenu.removeClass( 'visible' );
                    removeGroup.removeClass( 'visible' );

                  });

                });

              });

            });

          });

        });

      });

    });

  }else{

    alert( lang.groupNameError );

  }

}

var createNewGroup = function(){

  var groupName = $( '.group-name-input input' ).val();
  var members = $( '.memberDom.active' );

  if ( groupName != '' ) {

    if ( members.length == 0 ) {

      alert( lang.noMemberError );
      return;

    }

    wz.channel( function( error , channel ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.addChannel( [ channel.id , groupName ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.addUserInChannel( [ channel.id , wz.system.user().id ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.addUser( wz.system.user().id , function(){

            $.each( members , function( index , member ){

              var contact = $( member ).data( 'contact' );

              wql.addUserInChannel( [ channel.id , contact.id ] , function( error , message ){

                if ( error ) { console.log('ERROR: ', error ); }

                channel.addUser( contact.id , function(){

                  groupMenu.removeClass( 'visible' );
                  removeGroup.removeClass( 'visible' );

                });

              });

            });

          });

        });

      });

    });

  }else{

    alert( lang.groupNameError );

  }

}

var setGroupAvatar = function( groupName , avatar ){

  var expNameWords = groupName.split(' ');

  avatar.html( '<span>' + (expNameWords[0] || ' ')[0].toUpperCase() + (expNameWords[1] || ' ')[0].toUpperCase() + '</span>');

  var colorId = selectColor( groupName );

  avatar.css('background-image', 'none');
  avatar.css('background-color', colorPalette[colorId].light);
  avatar.css('border', '1px solid ' + colorPalette[colorId].border);
  avatar.css('border-style', 'solid');
  avatar.find( 'span' ).css('color', colorPalette[colorId].text);

}


var selectColor = function( string ){

  var id = 0;

  for (var i = 0; i < string.length; i++) {

    id += string.charCodeAt(i);
    id++;

  }

  return id = id%colorPalette.length;

}

var viewGroup = function(){

  // Make it visible
  $( '.group-menu .visible' ).removeClass( 'visible' );
  groupMenu.addClass( 'visible' ).addClass( 'group-view' );
  $( '.group-view' ).addClass( 'visible' );

  $( '.memberDom' ).remove();
  var members = $( '.chatDom.active' ).data( 'user' );
  var groupName = $( '.chatDom.active' ).data( 'isGroup' );

  $( '.group-name' ).text( groupName );

  if ( members ) {

    $( '.group-members-txt' ).text( ( members.length + 1 ) + ' ' + lang.members );

  }else{

    $( '.group-members-txt' ).text( '1 ' + lang.members );

  }

  setRemoveButton();

  setGroupAvatar( groupName , $( '.group-avatar' ) );

  wz.user( wz.system.user().id , function( error, user ){

    $( '.memberDom' ).remove();

    $( '.chatDom.active' ).data( 'channel' ).list( function( error, users ){

      var admin = users[0];

      appendMember( user , admin ).addClass( 'me' );

      $.each( members , function( index , m ){

        appendMember( m , admin );

      });

      $( '.search-members input' ).off( 'input' );
      $( '.search-members input' ).on( 'input' , function(){

        filterMembers( $( this ).val() );

      });

      $( '.group-header .edit' ).off( 'click' );
      $( '.group-header .edit' ).on( 'click' , function(){

        editGroupMode( groupName );

      });

    });

  });

}

var editGroupMode = function( groupName ){

  console.log( 'entrando en modo edit' );

  $( '.group-menu .visible' ).removeClass( 'visible' );
  groupMenu.addClass( 'visible' ).addClass( 'group-edit' );
  $( '.group-edit' ).addClass( 'visible' );

  $( '.group-name-input input' ).val( groupName );

  $( '.memberDom' ).remove();

  wz.user.friendList( false, function( error, list ){

    $( '.chatDom.active' ).data( 'channel' ).list( function( error, users ){

      var admin = users[0];

      $.each( list , function( index , friend ){

        appendMember( friend , admin );

      });

      $.each( $( '.memberDom' ) , function( index , member ){

        $.each( $( '.chatDom.active' ).data( 'user' ) , function( index , memberAdded ){

          if ( $( member ).data( 'contact' ).id == memberAdded.id ) {

            $( member ).find( '.ui-checkbox' ).addClass( 'active' );
            $( member ).addClass( 'active' );

          }

        });

      });

      $( '.search-members input' ).off( 'input' );
      $( '.search-members input' ).on( 'input' , function(){

        filterMembers( $( this ).val() );

      });

    });

  });

}

var appendMember = function( user , admin ){

  var member = memberPrototype.clone();
  member
  .removeClass( 'wz-prototype' )
  .addClass( 'memberDom' )
  .find( '.member-avatar' ).css( 'background-image' , 'url(' + user.avatar.big + ')' );

  if( user.id == admin ){

    member.find( 'span' ).text( user.fullName + ' (' + lang.admin + ')' );

  }else{

    member.find( 'span' ).text( user.fullName );

  }

  member.find( 'span' ).on( 'click' , function(){

    $( this ).parent().find( '.ui-checkbox' ).toggleClass( 'active' );
    $( this ).parent().toggleClass( 'active' );

  });

  member.find( '.member-avatar' ).on( 'click' , function(){

    $( this ).parent().find( '.ui-checkbox' ).toggleClass( 'active' );
    $( this ).parent().toggleClass( 'active' );

  });

  member.find( '.ui-checkbox' ).on( 'click' , function(){

    $( this ).parent().toggleClass( 'active' );

  });

  member.data( 'contact' , user );

  memberList.append( member );

  return member;

}

var chatDeleted = function( info ){

  var chats = $( '.chatDom' );

  $.each( chats , function( index , chat ){

    var channel = $( chat ).data( 'channel' );

    if ( channel.id == info.id ) {

      var chat = $( chat );

      if ( chat.hasClass( 'active' ) ) {

        groupMenu.removeClass( 'visible' );
        removeGroup.removeClass( 'visible' )

      }

      chat.remove();

    }

  });

}

var userAdded = function( info , userId ){

  console.log('usuario añadido!', info , userId);

  if( wz.system.user().id != info.sender ){

    getChats( function(){} );

  }

}

var setRemoveButton = function(){

  var channel = $( '.chatDom.active' ).data( 'channel' );
  removeGroup.addClass( 'visible' );
  removeGroup.off( 'click' );

  channel.list( function( error, users ){

    var admin = users[0];

    // I'm the admin
    if ( wz.system.user().id == admin ) {

      removeGroup.find( 'span' ).text(lang.deleteExit);

      removeGroup.on( 'click' , function(){

        wql.deleteUsersInChannel( channel.id , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          wql.deleteChannel( channel.id , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.destroy();

            groupMenu.removeClass( 'visible' );
            removeGroup.removeClass( 'visible' );
            $( '.chatDom.active' ).remove();

          });

        });

      });

    }else{

      removeGroup.find( 'span' ).text(lang.exitGroup);

      removeGroup.on( 'click' , function(){

        wql.deleteUserInChannel( [ channel.id , wz.system.user().id ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.leave( function( error ){

            if ( error ) { console.log('ERROR: ', error ); }

            groupMenu.removeClass( 'visible' );
            removeGroup.removeClass( 'visible' );
            $( '.chatDom.active' ).remove();

          });

        });

      });

    }

  });

}

var updateContactState = function( friend , state , id ){

  if ( state ) {

    friend.addClass( 'conected' );

    for (var i = 0; i < myContacts.length; i++) {

      if ( myContacts[i].id == id ) {

        myContacts[i].status = true;

      }

    }

  }else{

    friend.removeClass( 'conected' );

    for (var i = 0; i < myContacts.length; i++) {

      if ( myContacts[i].id == id ) {

        myContacts[i].status = false;

      }

    }

  }

}

var asyncEach = function( list, step, callback ){

  var position = 0;
  var closed   = false;
  var checkEnd = function( error ){

    if( closed ){
      return;
    }

    position++;

    if( position === list.length || error ){

      closed = true;

      callback( error );

      // Nullify
      list = step = callback = position = checkEnd = closed = null;

    }

  };

  if( !list.length ){
    return callback();
  }

  list.forEach( function( item ){
    step( item, checkEnd );
  });

};

// INIT Chat
initChat();
