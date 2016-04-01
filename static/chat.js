var myContacts = [];
var groupMembers = [];

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
var searchBoxDelete   = $( '.chat-search .delete-content' );
var closeChatButton   = $( '.close-coversation' );
var newGroupButton    = $( '.new-group-button' );
var groupMenu         = $( '.group-menu' );
var backGroup         = $( '.group-menu .back' );
var memberPrototype   = $( '.member.wz-prototype' );
var memberList        = $( '.member-list' );
var cancelNewGroup    = $( '.cancel-group' );
var saveNewGroup      = $( '.save-group' );
var removeGroup       = $( '.remove-group' );
var conversationDel   = $( '.conversation-input .delete-content' );
var myContactID       = api.system.user().id;
var adminMode         = false;

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

var colors = [ '#4fb0c6' , '#d09e88' , '#fab1ce' , '#4698e0' , '#e85c5c', '#ebab10', '#5cab7d' , '#a593e0', '#fc913a' , '#58c9b9' ]

// DOM Events
app.key( 'esc' , function(){
  $( '.ui-window' ).toggleClass( 'dark' );
  $( '.conversation-input input' ).val('');
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

app.key( 'enter' , function(){
  sendMessage();
});

searchBoxDelete.on( 'click' , function(){
  filterElements( '' );
});

searchBox.on( 'input' , function(){
  filterElements( $( this ).val() );
});

api.channel.on( 'message' , function( message , text ){
  messageReceived( message , text );
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

api.channel.on( 'destroyed' , function( info ){
  chatDeleted( info );
});

api.channel.on( 'userAdded', function( info, userId ){
  userAdded( info , userId );
});

removeGroup.on( 'click' , function(){
  deleteOrExitGroup();
});

wz.user.on( 'connect' , function( user ){

  updateContactState( $( '.user-id-' + user.id ) , true , user.id );
  updateState( user.id , true );

});

wz.user.on( 'disconnect' , function( user ){

  updateContactState( $( '.user-id-' + user.id ) , false , user.id );
  updateState( user.id , false );

});

conversationDel.on( 'click' , function(){
  $( '.conversation-input input' ).val('');
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

    // Make it active and visible
    case 'chat':

    contactsButton.removeClass('active');
    chatButton.addClass('active');
    contactTab.removeClass( 'visible' );
    chatTab.addClass( 'visible' );
    newGroupButton.removeClass( 'visible' );
    groupMenu.removeClass( 'visible' );
    removeGroup.removeClass( 'visible' );

    break;

    // Make it active and visible
    case 'contact':

    chatButton.removeClass( 'active' );
    contactsButton.addClass( 'active' );
    chatTab.removeClass( 'visible' );
    contactTab.addClass( 'visible' );
    newGroupButton.addClass( 'visible' );

    break;

  }

}

var getContacts = function(){

  api.user.friendList( false, function( error, list ){

    if ( error ) { console.log('ERROR: ', error ); }

    asyncEach( list , function( c , cb ){

      wql.getSingleChannel( [ myContactID , c.id ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        // Existe el canal
        if (message.length > 0) {

          api.channel( message[0][ 'id_channel' ] , function( error, channel ){

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

      api.user.connectedFriends( true, function( error, list ){

        $.each( list , function( i , friendId ){

          var friend = $( '.user-id-' + friendId );

          console.log( 'estableciendo como conectados' , myContacts );
          updateContactState( friend , true , friendId );

        });

      });

    });

  });

}

var getChats = function( callback ){

  wql.getChannels( myContactID , function( error , channels ){

    if ( error ) { console.log('ERROR: ', error ); }

    if( !channels.length ){
      return contactsButton.click();
    }

    $.each( channels , function( i , channel ){

      // No repeat chats already appended
      if ( $( '.chatDom-' + channel.id ).length != 0 ) {

        return;

      }

      wql.getUsersInChannel( channel.id , function( error , users ){

        api.user.friendList( false, function( error, friends ){

          var isGroup = channel.name != null ? true : false;
          var groupName = channel.name;

          if( !isGroup ){

            var me = myContactID;
            var you;

            if( me == users[0].user ){

              you = users[1].user;

            }else{

              you = users[0].user;

            }


            asyncEach( friends , function( element , cb ){

              if ( element.id == you ) {

                api.channel( channel.id , function( error, channel ){

                  appendChat( channel , element , groupName , cb );

                });

              }else{

                cb();

              }

            } , function(){

              if( callback ){
                callback();
              }

            });

          }else{

            api.channel( channel.id , function( error, channel ){

              var usersInGroup = [];

              for (var i = 0; i < users.length; i++) {

                for (var j = 0; j < friends.length; j++) {

                  if ( users[i].user == friends[j].id ) {

                    usersInGroup.push( friends[j] );

                  }

                }

              }

              appendChat( channel , usersInGroup , groupName , function(){

                if( callback ){
                  callback();
                }

              });

            });

          }

        });

      });

    });

  });

}

var appendContact = function( c , channel , callback ){

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
  console.log( 'lista de conectados actualizada' , myContacts );

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

  callback();

}

var appendChat = function( c , user , groupName , callback ){

  chatButton.click();

  wql.getMessages( c.id , function( error, messages ){

    messages = messages.reverse();

    wql.getLastRead( [c.id, myContactID] , function( error , lastRead ){

      wql.getUnreads( [c.id, lastRead[0]['last_read']] , function( error , notSeen ){

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
        .addClass( 'chatDom' )
        .addClass( 'chatDom-' + c.id );

        if( groupName == null ){

          chat
          .find( '.channel-name' ).text( user.fullName );
          chat
          .find( '.channel-img' ).css( 'background-image' , 'url(' + user.avatar.big + ')' );

          if(lastMsg != undefined){

            var date = new Date( lastMsg.time );

            chat
            .find( '.channel-last-time' ).text( timeElapsed( date ) );
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
            .find( '.channel-last-time' ).text( timeElapsed( date ) );
            chat
            .find( '.channel-last-msg' ).text( lastMsg.text );

          }

        }

        // No repeat chats already appended
        if ( $( '.chatDom-' + c.id ).length != 0 ) {

          if( callback ){ callback(); };
          return;

        }else{

          if (lastMsg) {
            appendChatInOrder( chat , new Date( lastMsg.time ) );
            chat
            .data( 'time' , new Date( lastMsg.time ) );
          }else{
            appendChatInOrder( chat , new Date() );
            chat
            .data( 'time' , new Date() );
          }

          if ( notSeen[0] != undefined && notSeen[0]['COUNT(*)'] > 0 ) {

            $('.chatDom-' + c.id).data( 'notSeen' , notSeen[0]['COUNT(*)'] );
            $('.chatDom-' + c.id).find( '.channel-badge' ).addClass('visible').find('span').text( notSeen[0]['COUNT(*)'] );

          }

        }

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

      setActiveChat( chat );

      if( callback ){ callback(); };

    });

  });

});

}

var appendChatInOrder = function( chat , time ){

  var chats = $( '.chatDom' );
  var appended = false;

  if ( chats.length == 0 ) {
    channelList.append( chat );
  }

  $.each( chats , function( i , c ){

    var chatInCourse = $(c);
    var timeInCourse = chatInCourse.data( 'time' );

    if( time > timeInCourse && !appended ){
      chatInCourse.before( chat );
      appended = true;
    }

  });

  if ( !appended ) {
    chats.eq( chats.length - 1 ).after( chat );
  }

}

var selectContact = function( contact ){

  groupMenu.removeClass( 'visible' );
  removeGroup.removeClass( 'visible' );

  $( '.conversation-input input' ).focus();
  $( '.conversation-header' ).off( 'click' );

  var channel = contact.data( 'channel' );
  //console.log( 'contacto seleccionado:' , contact , channel );

  // Make active
  $( '.contactDom.active' ).removeClass( 'active' );
  contact.addClass( 'active' );
  content.addClass( 'visible' );

  // Set header
  $( '.conversation-name' ).text( contact.find( '.contact-name' ).text() );

  if ( channel == undefined ) {

    $( '.messageDom' ).remove();
    $( '.chatDom.active' ).removeClass( 'active' );

  }else{

    $( '.chatDom.active' ).removeClass( 'active' );
    $( '.chatDom-' + channel.id ).addClass( 'active' );;
    listMessages( channel );

  }

  console.log( 'miro si esta conectado por la clase del contacto' , contact );
  if ( contact.hasClass( 'conected' ) ) {

    lastMessage.text( lang.conected );

  }else{

    lastMessage.text( lang.disconected );

  }

}

var selectChat = function( chat ){

  groupMenu.removeClass( 'visible' );
  removeGroup.removeClass( 'visible' );

  var channel = chat.data( 'channel' );
  var contact = chat.data( 'user' );

  //console.log( 'chat seleccionado:' , contact , channel );

  // Make active
  $( '.chatDom.active' ).removeClass( 'active' );
  chat.addClass( 'active' );
  content.addClass( 'visible' );
  $( '.conversation-input input' ).focus();

  // Set header
  $( '.conversation-name' ).text( chat.find( '.channel-name' ).text() );

  if ( channel == undefined ) {

    //$( '.conversation-header' ).data( 'channel' , null );
    $( '.messageDom' ).remove();


  }else{

    //$( '.conversation-header' ).data( 'channel' , channel );
    listMessages( channel );

    chat.data( 'notSeen' , null );
    chat.find( '.channel-badge' ).removeClass( 'visible' );
    $( '.conversation-header' ).off( 'click' );

    if( chat.data( 'isGroup' ) != null ){

      $( '.conversation-header' ).on( 'click' , function(){

        viewGroup();

      });

    }

  if ( chat.data( 'isGroup' ) == null ) {

    if ( isConected( contact.id ) ) {

      lastMessage.text( lang.conected );

    }else {

      lastMessage.text( lang.disconected );

    }
    console.log( 'pregunto conectados con isConecteed' , contact.id , myContacts );

  }else{

    lastMessage.text( ( contact.length + 1 ) + ' ' + lang.members );

  }

}

}

var listMessages = function( channel ){

  $( '.messageDom' ).remove();

  wql.getMessages( channel.id , function( error, messages ){

    messages = messages.reverse();

    if ( error ) { console.log('ERROR: ', error ); }

    for( var i = 0; i < messages.length; i++ ){

      if ( messages[i].sender == myContactID ) {

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

    if( messages && messages.length > 0){

      wql.updateLastRead( [ messages[ messages.length - 1].id , channel.id, myContactID ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }
        $('.chatDom.active').data( 'notSeen' , 0 );
        $('.chatDom.active').find('.channel-badge').removeClass('visible').find('span').text(0);

      });

    }

  });

}

var isConected = function( user ){

  var conected = false;

  for (var i = 0; i < myContacts.length; i++) {

    if ( myContacts[i].id == user && myContacts[i].status ) {

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
      message.addClass( 'sender-group' );
      message.find( '.sender' ).addClass( 'visible' );
      message.find( '.sender' ).text( senderName );
      message.find( '.sender' ).css( 'color' , colors[ selectColor( senderName ) ] );

    }

    message
    .find( '.message-time' ).text( hh + ':' + mm );

    message
    .find( '.message-avatar' ).css( 'background-image' , 'url(' + sender.avatar.big + ')' );

  }

  message.addClass( 'messageDom' );
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
getChats();

}

var sendMessage = function(){

  var txt = $( '.conversation-input input' ).val();
  var channel = $( '.chatDom.active' ).data( 'channel' );

  var contactApi = $( '.contactDom.active' ).data( 'contact' );

  //console.log( 'send message:' , contactApi , channel );

  // Clean sender
  $( '.conversation-input input' ).val('');

  if ( channel == null ) {

    api.channel( function( error , channel ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.addChannel( [ channel.id , null ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.addUserInChannel( [ channel.id , contactApi.id ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          wql.addUserInChannel( [ channel.id , myContactID ] , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.addUser( contactApi.id , function(){

              $( '.contactDom.active' ).data( 'channel' , channel );
              $( '.chatDom.active' ).data( 'channel' , channel );
              send( txt , channel );
              getChats( function(){

                $( '.chatDom-' + channel.id ).click();

              });

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

    wql.addMessage( [ message , myContactID , channel.id ] , function( error , messages ){

      if ( error ) { console.log('ERROR: ', error ); }

      channel.send(  { 'action' : 'message' , 'txt' : message , 'id' : messages.insertId } , { background : wz.system.user().name + ': ' + message } , function( error ){

        if ( error ) { console.log('ERROR: ', error ); }

      });

    });

  }

}

var timeElapsed = function( lastTime ){

  var now = new Date();
  var last = new Date( lastTime );
  var message;
  var calculated = false;

  if( now.getFullYear() === last.getFullYear() ){

    if( now.getDate() === last.getDate() ){

      message = getStringHour( lastTime );
      calculated = true;

    }else if( new Date ( now.setDate( now.getDate() - 1 ) ).getDate() === last.getDate() ){

      message = lang.lastDay;
      calculated = true;

    }

  }

  if ( !calculated ) {

    var day = last.getDate();
    var month = last.getMonth();

    if(day<10) {
      day='0'+day
    }

    if(month<10) {
      month='0'+month
    }

    message = day + '/' + month + '/' + last.getFullYear().toString().substring( 2 , 4 );
    calculated = true;

  }

  return message;

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

  var channelActive = $( '.chatDom.active' ).data( 'channel' );

  if (channelActive != undefined && chat.data( 'channel' ).id == channelActive.id) {
    chat.click();
  }

}

var messageReceived = function( message , o ){

  var channelActive = $( '.chatDom.active' ).data( 'channel' );
  var chat          = $( '.chatDom-' + message.id );
  var date          = Date.now();
  var printed       = false;

  //console.log( 'message recived' , channelActive );

  // USER REMOVED
  if( o.action == 'userRemoved' ){

    var active = $( '.chatDom-' + o.id );

    if ( o.userId == myContactID ) {

      if( channelActive && o.id == channelActive.id ) {

        active.remove();
        content.removeClass( 'visible' );

      }else{

        active.remove();

      }

    }
    return;
  }

  // GROUP NAME CHANGE
  if( o.action == 'nameChange' ){

    var active = $( '.chatDom-' + o.id );

    if ( o.userId != myContactID ) {

      if( channelActive && o.id == channelActive.id ){

        active.remove();

        getChats( function(){

          $( '.chatDom-' + channelActive.id ).click();

        });

      }else{
        active.remove();
        getChats();
      }

    }

    return;
  }

  // MESSAGE
  setChatInfo( chat , o );
  if( channelActive && channelActive.id === message.id ){

    if( message.sender === myContactID ){

      wql.updateLastRead( [ o.id , channelActive.id, myContactID ] , function( error , message ){
        if ( error ) { console.log('ERROR: ', error ); }
        printMessage( o.txt , null , date , true );
      });

    }else{

      var users = chat.data('user');

      if( !Array.isArray( users ) ){

        wql.updateLastRead( [ o.id , channelActive.id, myContactID ] , function( error , message ){
          if ( error ) { console.log('ERROR: ', error ); }
          printMessage( o.txt , users , date , true );
        });

      }else{

        $.each( users , function( i , user ){

          if ( user.id === message.sender ) {

            wql.updateLastRead( [ o.id , channelActive.id, myContactID ] , function( error , message ){

              if ( error ) { console.log('ERROR: ', error ); }

              $( '.user-id-' + user.id ).data( 'channel' , channelActive );

              printMessage( o.txt , user , date , true );

            });

          }

        });

      }
    }

  }else{

    wql.getLastRead( [message.id, myContactID] , function( error , lastRead ){

      wql.getUnreads( [message.id, lastRead[0]['last_read'] ] , function( error , notSeen ){

        if ( notSeen[0] != undefined && notSeen[0]['COUNT(*)'] > 0 ) {

          $('.chatDom-' + message.id).data( 'notSeen' , notSeen[0]['COUNT(*)'] );
          $('.chatDom-' + message.id).find( '.channel-badge' ).addClass('visible').find('span').text( notSeen[0]['COUNT(*)'] );

        }

      });

    });

  }

}

var setChatInfo = function( chat , o ){

  chat.insertBefore( $( '.chatDom' ).eq(0) );
  chat.find( '.channel-last-msg' ).text( o.txt );
  chat.find( '.channel-last-time' ).text( timeElapsed( new Date() ) );

}

var getStringHour = function( date ){

  var now = new Date();

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
  $( '.group-name-input input' ).val( '' );
  $( '.search-members input' ).val( '' );

  setGroupAvatar( '?' , $( '.group-avatar' ) );

  $( '.memberDom' ).remove();
  api.user.friendList( false, function( error, list ){

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

    if( adminMode ){
      editGroup();
    }else{
      alert( lang.exitAdmin );
    }

  }else{

    createNewGroup();

  }

}

var editGroup = function(){

  var groupName = $( '.group-name-input input' ).val();
  var members = $( '.memberDom.active' );
  var channel = $( '.chatDom.active' ).data( 'channel' );
  var membersHaveTo = [];

  if ( groupName != '' ) {

    if ( members.length == 0 ) {

      alert( lang.noMemberError );
      return;

    }

    for (var i = 0; i < members.length; i++) {

      contact = members.eq(i).data( 'contact' );
      membersHaveTo.push( contact.id );

    }

    membersHaveTo.push( myContactID );

    var toDelete = [];
    var toAdd = [];
    var aux = arrDiff( groupMembers , membersHaveTo );
    for (var i = 0; i < aux.length; i++) {
      if (groupMembers.indexOf(parseInt(aux[i])) != -1) {
        toDelete.push(aux[i]);
      }else{
        toAdd.push(aux[i]);
      }

    }

    wql.updateChannelName( [ groupName , channel.id ] , function( error , message ){

      if ( error ) { console.log('ERROR: ', error ); }

      asyncEach( toDelete , function( c , cb ){

        wql.deleteUserInChannel( [ channel.id , parseInt(c) ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.send(  { 'action' : 'userRemoved' , 'txt' : groupName , 'id' : channel.id , 'userId' : parseInt(c) } , function( error ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.removeUser( parseInt(c), function( error ){

              if ( error ) { console.log('ERROR: ', error ); }
              cb();

            });

          });

        });

      }, function(){

        if ( toAdd.length === 0 ) {

          groupMenu.removeClass( 'visible' );
          removeGroup.removeClass( 'visible' );
          $('.chatDom.active').remove();
          getChats( function(){

            $( '.chatDom-' + channel.id ).click();

            channel.send(  { 'action' : 'nameChange' , 'txt' : groupName , 'id' : channel.id , 'userId' : myContactID } , function( error ){

              if ( error ) { console.log('ERROR: ', error ); }

            });

          });

        }

        $.each( toAdd , function( i , user ){

          wql.addUserInChannel( [ channel.id , parseInt(user) ] , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.addUser( parseInt(user) , function(){

              groupMenu.removeClass( 'visible' );
              removeGroup.removeClass( 'visible' );
              $('.chatDom.active').remove();
              getChats( function(){

                $( '.chatDom-' + channel.id ).click();

                channel.send(  { 'action' : 'nameChange' , 'txt' : groupName , 'id' : channel.id , 'userId' : myContactID } , function( error ){

                  if ( error ) { console.log('ERROR: ', error ); }

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

    api.channel( function( error , channel ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.addChannel( [ channel.id , groupName ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.addUserInChannel( [ channel.id , myContactID ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.addUser( myContactID , function(){

            $.each( members , function( index , member ){

              var contact = $( member ).data( 'contact' );

              wql.addUserInChannel( [ channel.id , contact.id ] , function( error , message ){

                if ( error ) { console.log('ERROR: ', error ); }

                channel.addUser( contact.id , function(){

                  groupMenu.removeClass( 'visible' );
                  removeGroup.removeClass( 'visible' );
                  getChats();

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

  avatar.css({
    'background-image'  : 'none',
    'background-color'  : colorPalette[colorId].light,
    'border'            : '2px solid ' + colorPalette[colorId].border,
    'border-style'      : 'solid',
    'width'             : '44px',
    'height'            : '44px'
  });
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

  api.user( myContactID , function( error, user ){

    $( '.memberDom' ).remove();

    $( '.chatDom.active' ).data( 'channel' ).list( function( error, users ){

      var admin = users[0];

      groupMembers = [];
      appendMember( user , admin ).addClass( 'me' );
      groupMembers.push(myContactID);

      $.each( members , function( index , m ){

        appendMember( m , admin );
        groupMembers.push(m.id);

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

  $( '.group-menu .visible' ).removeClass( 'visible' );
  groupMenu.addClass( 'visible' ).addClass( 'group-edit' );
  $( '.group-edit' ).addClass( 'visible' );

  $( '.group-name-input input' ).val( groupName );

  $( '.memberDom' ).remove();

  api.user.friendList( false, function( error, list ){

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

  member.on( 'click' , function(){

    $( this ).find( '.ui-checkbox' ).toggleClass( 'active' );
    $( this ).toggleClass( 'active' );

  });

  if( user.id == admin ){

    member.find( 'span' ).text( user.fullName + ' (' + lang.admin + ')' );
    member.find( 'span' ).off( 'click' );
    member.find( 'span' ).on( 'click' , function(){

      alert( lang.exitAdmin );

    });

    member.find( '.member-avatar' ).off( 'click' );
    member.find( '.member-avatar' ).on( 'click' , function(){

      alert( lang.exitAdmin );

    });

    member.off( 'click' );
    member.on( 'click' , function(){

      alert( lang.exitAdmin );

    });

    member.find( '.ui-checkbox' ).on( 'click' , function(){

      $(this).toggleClass( 'active' );
      alert( lang.exitAdmin );

    });

  }else{

    member.find( 'span' ).text( user.fullName );

  }

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

  if( info.sender != myContactID && myContactID == userId ){

    getChats();

  }

}

var setRemoveButton = function(){

  var channel = $( '.chatDom.active' ).data( 'channel' );
  removeGroup.addClass( 'visible' );
  removeGroup.off( 'click' );

  channel.list( function( error, users ){

    var admin = users[0];

    // I'm the admin
    if ( myContactID == admin ) {

      removeGroup.find( 'span' ).text(lang.deleteExit);
      adminMode = true;
      $('.group-header .edit').addClass('visible');

      removeGroup.on( 'click' , function(){

        wql.deleteUsersInChannel( channel.id , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          wql.deleteChannel( channel.id , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.destroy();

            groupMenu.removeClass( 'visible' );
            removeGroup.removeClass( 'visible' );
            $( '.chatDom.active' ).remove();
            content.removeClass( 'visible' );

          });

        });

      });

    }else{

      adminMode = false;
      removeGroup.find( 'span' ).text(lang.exitGroup);
      $('.group-header .edit').removeClass('visible');

      removeGroup.on( 'click' , function(){

        wql.deleteUserInChannel( [ channel.id , myContactID ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.leave( function( error ){

            if ( error ) { console.log('ERROR: ', error ); }

            groupMenu.removeClass( 'visible' );
            removeGroup.removeClass( 'visible' );
            $( '.chatDom.active' ).remove();
            content.removeClass( 'visible' );

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

var arrDiff = function (a1, a2) {

  var a = [], diff = [];

  for (var i = 0; i < a1.length; i++) {
    a[a1[i]] = true;
  }

  for (var i = 0; i < a2.length; i++) {
    if (a[a2[i]]) {
      delete a[a2[i]];
    } else {
      a[a2[i]] = true;
    }
  }

  for (var k in a) {
    diff.push(k);
  }

  return diff;
};

var updateState = function( userId , state ){

  var chats = $( '.chatDom' );

  $.each( chats , function( i , chat ){

    var chatUser = $( chat ).data( 'user' );
    if ( chatUser && chatUser.id == userId ) {

      if ( state ) {
        lastMessage.text( lang.conected );
      }else{
        lastMessage.text( lang.disconected );
      }

    }

  });

}

// INIT Chat
initChat();
