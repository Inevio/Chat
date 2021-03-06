'use strict'

// Globals
var app
var contactPrototype      = $( '.contact.wz-prototype' );
var conversationPrototype = $( '.channel.wz-prototype' );

// Constants
var COLORS = [ '#4fb0c6' , '#d09e88' , '#fab1ce' , '#4698e0' , '#e85c5c', '#ebab10', '#5cab7d' , '#a593e0', '#fc913a' , '#58c9b9' ]

// Libraries
var async = {

  each : function( list, step, callback ){

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

  },

  parallel : function( fns, callback ){

    var list     = Object.keys( fns )
    var position = 0;
    var closed   = false;
    var res      = {}
    var checkEnd = function( i, error, value ){

      if( closed ){
        return;
      }

      res[ i ] = value
      position++;

      if( position === list.length || error ){

        closed = true;

        callback( error, res );

        // Nullify
        list = callback = position = checkEnd = closed = null;

      }

    };

    if( !list.length ){
      return callback();
    }

    list.forEach( function( fn ){
      fns[ fn ]( checkEnd.bind( null, fn ) );
    });

  }

}

var selectColor = function( string ){

  var id = 0;

  for (var i = 0; i < string.length; i++) {
    id += string.charCodeAt(i);
  }

  return id % colorPalette.length;

}

// Objects
var App = function( dom ){

  //this.dom = dom

  /*this._domContactsList = $('.contact-list', this.dom)
  this._domConversationsList = $('.channel-list', this.dom)
  this._domMessageContainer = $('.message-container', this.dom)
  this._domMessageMePrototype = $('.message-me.wz-prototype', this._domMessageContainer)
  this._domMessageOtherPrototype = $('.message-other.wz-prototype', this._domMessageContainer)
  this._domCurrentConversation*/

  this.openedChat
  this.contacts = {}
  this.conversations = {}
  //this._mainAreaMode
  //this._sidebarMode

  // Translate UI
  //this._translateInterface()

  // Set modes
  //this._changeMainAreaMode( App.MAINAREA_NULL )
  //this._changeSidebarMode( App.SIDEBAR_NULL )

  // Bind events
  //this._bindEvents()

  // Load all info
  //this._fullLoad()

  return this

}

// Static values
App.MAINAREA_NULL = 0
App.MAINAREA_CONVERSATION = 1
App.SIDEBAR_NULL = 0
App.SIDEBAR_CONVERSATIONS = 1
App.SIDEBAR_CONTACTS = 2

// Private methods
/*App.prototype._appendMessage = function( message ){

  if( !this.openedChat || this.openedChat.context.id !== message.context ){
    return
  }

  var dom = ( message.sender === api.system.user().id ? this._domMessageMePrototype : this._domMessageOtherPrototype ).clone().removeClass('wz-prototype').data( 'message', message )
  var date = new Date( message.time )
  var hh = ( '0' + date.getHours().toString() ).slice(-2)
  var mm = ( '0' + date.getMinutes().toString() ).slice(-2)
  var text = message.data.text

  text = text.replace( /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/ , '<a href="$1" target="_blank">$1</a>')
  //textProcessed = text.replace( /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/ , '<a href="$1" target="_blank">$1</a>' );
  //textProcessed = text.replace( /((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/ig, '<a href="$1" target="_blank">$1</a>' );
  text = text.replace(/\n/g, "<br />")
  text = $('<div/>').html( text )

  text.find('a').each( function(){

    if( !(/^http(s)?:\/\//i).test( $(this).attr('href') ) ){
      $(this).attr( 'href', 'http://' + $(this).attr('href') ).addClass('wz-selectable')
    }

  })

  text = text.html()

  dom.find( '.message-text' ).html( text )
  dom.find( '.message-time' ).text( hh + ':' + mm )

  if( this.conversations[ message.context ].isGroup ){

    var senderName = this.contacts[ message.sender ].user.fullName
    dom.addClass( 'sender-group' ).find('.sender').addClass( 'visible' ).text( senderName ).css( 'color' , COLORS[ selectColor( senderName ) ] )

  }

  if( message.sender !== api.system.user().id ){
    dom.find( '.message-avatar' ).css( 'background-image' , 'url(' + this.contacts[ message.sender ].user.avatar.big + ')' )
    message.markAsAttended( console.log.bind( console ) )
  }

  if( message.attended.length ){
    dom.addClass('readed')
  }

  var down = this._isScrolledToBottom()
  dom.addClass( 'message-' + message.id )
  this._domMessageContainer.append( dom )

  if( down ){
    this._domMessageContainer.scrollTop( this._domMessageContainer[ 0 ].scrollHeight )
  }

}*/

/*App.prototype._bindEvents = function(){

  var that = this

  // DOM Events
  this.dom.on( 'click', '.tab-selector', function(){

    if( $(this).hasClass('chat-tab-selector') ){
      that._changeSidebarMode( App.SIDEBAR_CONVERSATIONS )
    }else if( $(this).hasClass('contact-tab-selector') ){
      that._changeSidebarMode( App.SIDEBAR_CONTACTS )
    }

  })

  this._domConversationsList.on( 'click', '.channel', function(){
    that.openConversation( that.conversations[ parseInt( $(this).attr('data-id') ) ] )
  })

  this._domContactsList.on( 'click', '.contact', function(){
    that.openConversationWithContact( that.contacts[ parseInt( $(this).attr('data-id') ) ] )
  })

  this.dom.on( 'keypress', function( e ){

    if( e.which === 13 && !e.shiftKey && that.openedChat ){

      e.preventDefault();
      that.openedChat.sendBuffer();

    }

  })

  // COM API Events
  api.com.on( 'message', function( event ){

    if( event.data.action === 'message' ){

      that._ensureConversation( event.context, function( err ){

        // To Do -> Error

        that.conversations[ event.context ].updateLastMessage( event )
        that._appendMessage( event )

      })

    }

  })

  api.com.on( 'messageMarkedAsAttended', function( comMessageId, comContextId, userId, notificationId ){
    that._updateMessageAttendedUI( comMessageId, comContextId )
  })

}*/

/*App.prototype._changeMainAreaMode = function( value ){

  if( this._mainAreaMode === value ){
    return
  }

  this._mainAreaMode = value

  if( this._mainAreaMode === App.MAINAREA_NULL ){
    $('.ui-content').removeClass('visible')
    $('.no-content').addClass('visible')
  }else if( this._mainAreaMode === App.MAINAREA_CONVERSATION ){
    $('.ui-content').addClass('visible')
    $('.no-content').removeClass('visible')
  }

}*/

/*App.prototype._changeSidebarMode = function( value ){

  if( this._sidebarMode === value ){
    return
  }

  this._sidebarMode = value

  this.dom.find('.chat-footer > section').removeClass('active')
  this.dom.find('.chat-body > section').removeClass('visible')

  if( this._sidebarMode === App.SIDEBAR_CONVERSATIONS ){
    this.dom.find('.chat-footer .chat-tab-selector').addClass('active')
    this.dom.find('.chat-body .chat-tab').addClass('visible')
  }else if( this._sidebarMode === App.SIDEBAR_CONTACTS ){
    this.dom.find('.chat-footer .contact-tab-selector').addClass('active')
    this.dom.find('.chat-body .contact-tab').addClass('visible')
  }

}*/

/*App.prototype._cleanMessages = function(){
  this._domMessageContainer.empty()
}*/

/*App.prototype._ensureConversation = function( contextId, callback ){

  if( this.conversations[ contextId ] ){
    return callback()
  }

  api.com.get( contextId, function( err, context ){

    this.addConversation( context )
    callback()

  }.bind(this))

}*/

/*App.prototype._fullLoad = function(){

  // To Do -> Remove timeout

  async.parallel({

    contacts : this._loadFullContactsList.bind(this),
    conversations : this._loadFullConversationsList.bind(this)

  }, function( err, res ){

    console.log( res )

    if( this._sidebarMode !== App.SIDEBAR_NULL ){
      return
    }if( res.conversations.length ){
      this._changeSidebarMode( App.SIDEBAR_CONVERSATIONS )
    }else if( res.contacts.contacts.length ){
      this._changeSidebarMode( App.SIDEBAR_CONTACTS )
    }else{
      // To Do -> Show forever alone
    }

  }.bind(this))

  return this

}*/

/*App.prototype._isScrolledToBottom = function(){
  return this._domMessageContainer[ 0 ].scrollHeight - this._domMessageContainer[ 0 ].scrollTop === this._domMessageContainer[ 0 ].clientHeight
}*/

/*App.prototype._loadFullContactsList = function( callback ){

  callback = api.tool.secureCallback( callback )

  async.parallel({

    contacts : function( callback ){
      api.user.friendList( false, callback )
    },

    connected : function( callback ){
      api.user.connectedFriends( true, callback )
    }

  }, function( err, res ){

    // To Do -> Error

    this.contacts = {}

    res.contacts.forEach( function( user ){
      this.addContact( user )
    }.bind( this ))

    res.connected.forEach( function( userId ){
      this.setContactConnection( userId, true )
    }.bind( this ))

    this._updateAllConversationsUI()
    callback( null, res )

  }.bind( this ))

}*/

/*App.prototype._loadFullConversationsList = function( callback ){

  callback = api.tool.secureCallback( callback )

  api.com.list({ protocol : 'chat' }, function( err, contexts ){

    // To Do -> Error

    contexts.forEach( function( context ){
      this.addConversation( context )
    }.bind( this ))

    callback( null, contexts )

  }.bind( this ) )

}*/

/*App.prototype._translateInterface = function(){

  $('.addPeople span', this.dom).text( lang.addPeople);
  $('.app-color .dark', this.dom).text(lang.dark);
  $('.app-color .white', this.dom).text(lang.white);
  $('.cancel-group span', this.dom).text(lang.cancel);
  $('.chat-search input', this.dom).attr('placeholder', lang.search);
  $('.chat-tab-selector span', this.dom).text(lang.chats);
  $('.click-chat-txt', this.dom).text(lang.clickChat);
  $('.close-coversation', this.dom).text(lang.close);
  $('.contact-tab-selector span', this.dom).text(lang.contacts);
  $('.conversation-input textarea', this.dom).attr('placeholder', lang.msg);
  $('.group-info .title', this.dom).text(lang.info);
  $('.group-members .title', this.dom).text(lang.members);
  $('.group-members input', this.dom).attr('placeholder', lang.searchContacts);
  $('.group-menu .back span', this.dom).text(lang.back);
  $('.group-menu .edit', this.dom).text(lang.edit);
  $('.group-name', this.dom).text(lang.groupName);
  $('.group-name-input input', this.dom).attr('placeholder', lang.groupName);
  $('.groupName', this.dom).text(lang.nameGroup);
  $('.invite .add', this.dom).text( lang.invite.add );
  $('.invite .next', this.dom).text( lang.invite.send );
  $('.invite h1', this.dom).text( lang.invite.title );
  $('.invite h2', this.dom).html( lang.invite.subtitle );
  $('.invite h3', this.dom).text( lang.invite.email );
  $('.new-group-button span', this.dom).text(lang.newGroup);
  $('.no-chat-txt', this.dom).text(lang.noChat);
  $('.save-group span', this.dom).text(lang.save);
  $('.send-txt', this.dom).text(lang.send);

}*/

/*App.prototype._updateAllConversationsUI = function(){

  for( var i in this.conversations ){
    this.conversations[ i ].updateUI()
  }

}*/

/*App.prototype._updateConversationsListUI = function(){

  var list = []

  for( var i in this.conversations ){
    list.push( this.conversations[ i ] )
  }

  list = list.sort( function( a, b ){

  })

  this._domConversationsList.empty().append( list.map( function( item ){ return item.dom }) )

}*/

/*App.prototype._updateMessageAttendedUI = function( messageId, contextId ){

  if( !this.openedChat || this.openedChat.context.id !== contextId ){
    return
  }

  this._domMessageContainer.find( '.message-' + messageId ).addClass('readed')

}*/

// Public methods
/*App.prototype.addConversation = function( context ){

  if( this.conversations[ context.id ] ){
    return this
  }

  this.conversations[ context.id ] = new Conversation( this, context )

  this._updateConversationsListUI()

  return this

}*/

/*App.prototype.addContact = function( user ){

  if( this.contacts[ user.id ] ){
    return this
  }

  this.contacts[ user.id ] = new Contact( this, user )

  this.updateContactsListUI()

  return this

}*/

/*App.prototype.setContactConnection = function( id, connected ){

  if( this.contacts[ id ] ){
    this.contacts[ id ].setConnection( connected )
  }

  return this

}*/

/*App.prototype.openConversation = function( conversation ){

  this._changeSidebarMode( App.SIDEBAR_CONVERSATIONS )

  if( this.openedChat && conversation.context.id === this.openedChat.context.id ){
    return this
  }

  if( this.openedChat ){
    this.openedChat.setOpened( false )
  }

  this.openedChat = conversation.setOpened( true )

  this._changeMainAreaMode( App.MAINAREA_CONVERSATION )
  $('.conversation-name, .conver-header .conver-title').text( conversation.name )

  if( conversation.isGroup ){
    $('.conversation-moreinfo, .conver-moreinfo').removeClass('conected').text( conversation.users.length )
  }else if( this.contacts[ conversation.users[ 0 ] ] && this.contacts[ conversation.users[ 0 ] ].connected ) {
    $('.conversation-moreinfo, .conver-moreinfo').addClass('conected').text( lang.conected );
  }else{
    $('.conversation-moreinfo, .conver-moreinfo').removeClass('conected').text( lang.disconected );
  }

  $( '.conversation-input textarea' ).val('').focus();

  this._cleanMessages()
  conversation.context.getMessages( { withAttendedStatus : true }, function( err, list ){

    // To Do -> Error
    list.forEach( function( message ){
      this._appendMessage( message )
    }.bind(this))

  }.bind(this))

  return this

}*/

/*App.prototype.openConversationWithContact = function( contact ){

  var conversation

  for( var i in this.conversations ){

    if( this.conversations[ i ].isGroup ){
      continue
    }

    if( this.conversations[ i ].users[ 0 ] === contact.user.id ){
      conversation = this.conversations[ i ]
      break
    }

  }

  if( conversation ){
    return this.openConversation( conversation )
  }

  var context = new FakeContext( contact.user.id )

  this.addConversation( context )
  this.openConversation( this.conversations[ context.id ] )

  return this

}*/

/*App.prototype.updateContactsListUI = function(){

  var list = []

  for( var i in this.contacts ){
    list.push( this.contacts[ i ] )
  }

  list = list.sort( function( a, b ){

    if( a.connected && b.connected ){
      return a.user.fullName.localeCompare( b.user.fullName )
    }

    if( a.connected ){
      return -1
    }

    return 1

  })

  this._domContactsList.empty().append( list.map( function( item ){ return item.dom }) )

}*/

/*App.prototype.updateConversationId = function( oldId, newId ){

  this.conversations[ newId ] = this.conversations[ oldId ]
  delete this.conversations[ oldId ]
  this._updateConversationsListUI()

  return this

}*/

/*var Contact = function( app, user ){

  this.app = app
  this.dom = contactPrototype.clone().removeClass('wz-prototype')
  this.user = user
  this.connected = false

  // Update UI
  this.dom.addClass( 'user-id-' + this.user.id );
  this.dom.find('.contact-name').text( this.user.fullName )
  this.dom.find('.contact-img').css( 'background-image', 'url(' + this.user.avatar.big + ')' )
  this.dom.attr( 'data-id', this.user.id )

  return this

}*/

/*Contact.prototype.setConnection = function( value ){

  this.connected = !!value

  if( this.connected ){
    this.dom.addClass('conected')
  }else{
    this.dom.removeClass('connected')
  }

  this.app.updateContactsListUI()

  return this

}*/

/*var Conversation = function( app, context ){

  this.app = app
  this.context = context
  this.dom = conversationPrototype.clone().removeClass('wz-prototype')
  this.users = []
  this.world
  this.lastMessage
  this.opened = false
  this.isGroup = false // To Do
  this.name // To Do -> Default value

  // Set UI
  this._loadAdditionalInfo()
  this.updateUI()

  return this

}*/

/*Conversation.prototype._loadAdditionalInfo = function(){

  this.context.getUsers( { full : false }, function( err, list ){

    this.users = api.tool.arrayDifference( list, [ api.system.user().id ] )

    this.updateUI()

  }.bind( this ))

  this.context.getMessages( { withAttendedStatus : true }, function( err, list ){ // To Do -> Limit to the last one
    this.updateLastMessage( list[ list.length - 1 ] )
  }.bind( this ))

}*/

/*Conversation.prototype._upgradeToRealConversation = function( callback ){

  if( !( this.context instanceof FakeContext ) ){
    return callback()
  }

  this.context.getUsers( function( err, users ){

    api.com.create( { protocol : 'chat', users : users }, function( err, context ){

      // To Do -> Err

      var oldId = this.context.id

      this.context = context
      this.updateUI()
      this.app.updateConversationId( oldId, context.id )
      callback()

    }.bind( this ))

  }.bind( this ))

}*/

/*Conversation.prototype.sendBuffer = function(){

  var value = $.trim( this.app.dom.find('.conversation-input textarea').val() )

  if( !value ){
    return
  }

  this._upgradeToRealConversation( function(){

    this.app.dom.find('.conversation-input textarea').val('')
    this.context.send( { data : { action : 'message', text : value }, persistency : true, notify : value }, function( err ){
      // To Do -> Error
    })

  }.bind( this ))

  return this

}*/

/*Conversation.prototype.setOpened = function( value ){

  this.opened = !!value

  if( this.opened ){
    this.dom.addClass('active')
  }else{
    this.dom.removeClass('active')
  }

  return this

}*/

/*Conversation.prototype.updateLastMessage = function( message ){

  this.lastMessage = message
  this.updateUI()

}*/

/*Conversation.prototype.updateUI = function(){

  var img

  if( this.context.name ){
    this.name = this.context.name
  }else if( this.app.contacts[ this.users[ 0 ] ] ){
    this.name = this.app.contacts[ this.users[ 0 ] ].user.fullName
  }else{
    // To Do -> lang.unknown
  }

  if( this.world ){
    img = this.world.icon.big // To Do -> Mirar si es el tamaño adecuado
  }else if( this.app.contacts[ this.users[ 0 ] ] ){
    img = this.app.contacts[ this.users[ 0 ] ].user.avatar.big // To Do -> Mirar si es el tamaño adecuado
  }else{
    // To Do -> Unknown
  }

  //TODO llamar a la view
  view.updateConversationUI();
  //this.dom.attr( 'data-id', this.context.id )
  //this.dom.find('.channel-name').text( this.name );
  //this.dom.find('.channel-img').css( 'background-image' , 'url(' + img + ')' )
  //this.dom.find('.channel-last-msg').text( this.lastMessage ? this.lastMessage.data.text : '' )

}*/

/*var FakeContext = function( userId ){

  this.id = --FakeContext.idCounter
  this._users = [ userId ]

  return this

}*/

/*FakeContext.prototype.getUsers = function( options, callback ){

  if( arguments.length === 1 ){
    callback = options
    options  = {}
  }

  if( !options.full ){
    return callback( null, this._users )
  }

  async.map( this._users, function( userId, callback ){
    // To Do
  }, callback )

};*/

/*FakeContext.prototype.getMessages = function( options, callback ){

  if( arguments.length === 1 ){
    callback = options
    options = {}
  }

  callback( null, [] )

}*/

FakeContext.idCounter = 0

// Start
app = new App( $(this) )

return

// CHAT 1.0.11
var animationDuration = 500;
var MODE_CHAT = 0;
var MODE_CONTACTS = 1;
var MODE_CONVERSATION = 2;
var MODE_INFORMATION = 3;
var MODE_CREATING_GROUP = 4;
var MODE_EDITING_GROUP = 5;
var MODE_ANIMATING = -1;
var mode = 0; // 0 == Chats tab, 1 == Contacts tab, 2 == Conversation tab, 3 == Information tab, 4 == creating group, 5 == editing group, -1 == transition
var prevMode = 0;

var myContacts = [];
var groupMembers = [];
var me = api.system.user()
var lastMsg;
var warnWritingTimeOut = false;
var listenWritingTimeOut = false;
var loadingMsgs = false;
var firstLoad;
var lastMessageReceived;
var adminMode         = false;
var creatingChannel   = false;
var lastReadId        = -1;
var heightToScroll    = -1;
var unreadTimeOut;
var loadingChat       = false;
var animationEffect   = 'cubic-bezier(.4,0,.2,1)';
var socketWorking     = true;
var language          = null;
var messageScrollBlock;

// Local Variables
var app               = $( this );
var desktop           = $( this ).parent().parent();
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
var lastMessage       = $( '.conversation-moreinfo, .conver-moreinfo' );
var searchBox         = $( '.chat-search input' );
var searchBoxDelete   = $( '.chat-search .delete-content' );
var closeChatButton   = $( '.close-coversation' );
var newGroupButton    = $( '.new-group-button, .new-group' );
var navbar            = $(  '.ui-navbar');
var groupMenu         = $( '.group-menu' );
var nameGroup         = $(  '.group-name');
var backGroup         = $( '.group-menu .back' );
var memberPrototype   = $( '.member.wz-prototype' );
var memberList        = $( '.member-list' );
var cancelNewGroup    = $( '.cancel-group' );
var saveNewGroup      = $( '.save-group, .accept-button' );
var removeGroup       = $( '.remove-group' );
var conversationDel   = $( '.conversation-input .delete-content' );
var closeApp          = $( '.ui-close' );
var searchMembers     = $( '.search-members input' );
var msgInput          = $( '.conversation-input textarea' );
var colorChange       = $( '.app-color' );
var msgContainer      = $( '.message-container' );
var separatorPrototype = $( '.separator.wz-prototype' );
var myContactID       = api.system.user().id;

var MAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,4}))$/

var window = app.parents().slice( -1 )[ 0 ].parentNode.defaultView;

var mobile = app.hasClass('wz-mobile-view');

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

// --- EVENTS ---
// SERVER EVENTS
api.com.on( 'message', function( event ){
  objectRecieved( event )
})

api.channel.on( 'message' , function( message , text ){
  objectRecieved( message , text );
});

api.channel.on( 'destroyed' , function( info ){
  chatDeleted( info );
});

api.channel.on( 'userAdded', function( info, userId ){
  userAdded( info , userId );
});

api.notification.on( 'new', function( notification ){
  console.log( notification )
  //TODO comprobar si la notificacion es de chat o no y si tenemos que tratarla
})

api.notification.on( 'attended', function( list ){
  console.log( list )
  //TODO comprobar si la notificacion marcada como atendida es de chat o no y si tenemos que tratarla
})

api.user.on( 'connect' , function( user ){

  updateContactState( $( '.user-id-' + user.id ) , true , user.id );
  updateState( user.id , true );

});

api.user.on( 'disconnect' , function( user ){

  updateContactState( $( '.user-id-' + user.id ) , false , user.id );
  updateState( user.id , false );

});

api.user.on( 'friendAdded', function( user ){
  getContacts();
});

api.user.on( 'friendRemoved', function( user ){
  getContacts();
});

api.system.on( 'connect' ,function(){

  /*getContacts();
  getChats();*/

  socketWorking = true;
  console.log($( '.chatDom.active' ).data());
  console.log('connect',mode);
  if( mode === MODE_CONVERSATION ){
    selectChat( $( '.chatDom.active' ) );
  }else if( mode === MODE_CHAT ){
    getChats();
  }

});

api.system.on( 'disconnect' ,function(){
  console.log('disconnect');
  socketWorking = false;
});
// END SERVER EVENTS


// UI EVENTS
/*
chatButton.on( 'click' , function(e){
  changeTab('chat');
});

contactsButton.on( 'click' , function(){

  filterElements( '' );
  searchBox.val( '' );
  changeTab('contact');
  if( !mobile ){
    searchBox.focus();
  }

});
*/

sendButton.on( 'click' , function(){

  if( socketWorking ){

    msgInput.css('height','24px');
    msgInput.focus();
    sendMessage();

  }else{

    if( mobile ){
      navigator.notification.alert( '', function(){},lang.cantSend );
    }else{
      alert( lang.cantSend );
    }

  }

});

searchBoxDelete.on( 'click' , function(){
  filterElements( '' );
});

searchBox.on( 'input' , function(){
  filterElements( $( this ).val() );
});

closeChatButton.on( 'click' , function(){

  hideContent();

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
  //removeGroup.removeClass( 'visible' );

});

cancelNewGroup.on( 'click' , function(){

  groupMenu.removeClass( 'visible' );
  //removeGroup.removeClass( 'visible' );

});

saveNewGroup.on( 'click' , function(){
  saveGroup();
});

removeGroup.on( 'click' , function(){
  deleteOrExitGroup();
});

conversationDel.on( 'click' , function(){
  msgInput.val('');
});

closeApp.on( 'click' , function(){

  var position = api.view.getPosition();

  wql.updateUserPreference( [ myContactID , app.width() , app.height() , $( '.ui-window' ).hasClass('dark') , position.x , position.y , app.width() , app.height() , $( '.ui-window' ).hasClass('dark') , position.x , position.y ] , function( error , message ){

    console.log(error, message);

  });

});

searchMembers.on( 'input' , function(){

  filterMembers( $( this ).val() );

});

content.on( 'click' , function(){

  var selection = $(this).selection();
  if ( !mobile && ( !selection || selection.width === 0 ) ) {
    msgInput.focus();
  }

});

msgInput.on( 'keydown' , function(){

  if ( !warnWritingTimeOut ) {

    warnWriting();

  }

});

colorChange.on( 'click' , function(){

  if ( $( '.ui-window' ).hasClass( 'dark' ) ) {

    $(this).find('i').stop().clearQueue().transition({

      'margin-left' : '18px'

    }, 250, animationEffect);

  }else{

    $(this).find('i').stop().clearQueue().transition({

      'margin-left' : '2px'

    }, 250, animationEffect);

  }

  app.toggleClass( 'dark' );
  $( '.ui-window' ).toggleClass( 'dark' );
  //$( '.conversation-input input' ).val('');

});

msgContainer.on( 'scroll' , function( e ){

  if ( loadingMsgs ) {
    e.preventDefault();
  }

  if ( $(this).scrollTop() < 200 ) {
    loadMoreMsgs();
  }

  //Si estoy a mas de 400 pixeles del final y no está el boton de ir al final en pantalla
  if( !checkScrollBottom(300) && !$('.go-bottom').hasClass('active') ){
    showGoBottom(false);
  }else if( checkScrollBottom(300) && $('.go-bottom').hasClass('active') ){
    hideGoBottom();
  }

});

desktop.on( 'message' , function( e , action , options ){

  checkParams( action , options );

});

// END UI EVENTS

// APP EVENTS
app
.on( 'contextmenu', '.chatDom', function(e){

  var channelNotFound = true;
  var channelDom = $( e.target );

  while (channelNotFound) {

    if( channelDom.hasClass( 'chatDom' ) ){
      channelNotFound = false;
    }else{
      channelDom = channelDom.parent();
    }

  }

  var channel = channelDom.data( 'channel' );
  var user = channelDom.data('user').id;

  if ( !channelDom.data('isGroup') ) {

    var menu = api.menu();

    menu.addOption( lang.deleteChat , function(){

      wql.deleteUsersInChannel( channel.id , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.deleteChannel( channel.id , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          $( '.user-id-' + user ).data( 'channel' , null );
          channel.destroy();

        });

      });

    });

    menu.render();

  }

})

.on( 'click' , '.chatDom' , function(){

  if( !$( this ).hasClass( 'active' ) || $( this ).find('.channel-badge').hasClass('visible') ){
    selectChat( $( this ) );
  }

  $('.chat-search input').val('');
  filterElements( '' );

})

.on( 'ui-view-focus', function(){

  var chatActive = $( '.chatDom.active' );
  if (chatActive.length > 0) {
    chatActive.click();
  }

})

.on( 'keypress', function( e ){

  if( e.which === 13 ){

    if ( !e.shiftKey ) {

      e.preventDefault();
      sendMessage();

    }

  }
})

.on( 'click' , '.viewGroup' , function(){

  viewGroup();

})

.on( 'click' , '.contactDom' , function(){

  selectContact( $( this ) );
  $('.chat-search input').val('');
  filterElements( '' );

})

.on( 'click' , '.group-header .edit, .edit-button, .addPeople' , function(){

  editGroupMode( $( '.chatDom.active' ).data( 'isGroup' ) );

})

.on( 'click' , '.memberDom span' , function(){

  $( this ).parent().find( '.ui-checkbox' ).toggleClass( 'active' );
  $( this ).parent().toggleClass( 'active' );

})

.on( 'click' , '.memberDom .member-avatar' , function(){

  $( this ).parent().find( '.ui-checkbox' ).toggleClass( 'active' );
  $( this ).parent().toggleClass( 'active' );

})

.on( 'click', '.memberDom .ui-checkbox' , function(){

  $( this ).parent().toggleClass( 'active' );

})

.on( 'click' , '.removeGroup' , function(){

  var channel = $( '.chatDom.active' ).data( 'channel' );

  wql.deleteUsersInChannel( channel.id , function( error , message ){

    if ( error ) { console.log('ERROR: ', error ); }

    wql.deleteChannel( channel.id , function( error , message ){

      if ( error ) { console.log('ERROR: ', error ); }

      channel.destroy();

      groupMenu.removeClass( 'visible' );
      //removeGroup.removeClass( 'visible' );
      $( '.chatDom-' + channel.id ).remove();
      hideContent();

    });

  });

})

.on( 'click' , '.exitGroup' , function(){

  var channel = $( '.chatDom.active' ).data( 'channel' );

  wql.deleteUserInChannel( [ channel.id , myContactID ] , function( error , message ){

    if ( error ) { console.log('ERROR: ', error ); }

    channel.leave( function( error ){

      if ( error ) { console.log('ERROR: ', error ); }

      groupMenu.removeClass( 'visible' );
      //removeGroup.removeClass( 'visible' );
      $( '.chatDom.active' ).remove();
      hideContent();

    });

  });

})

.on( 'click' , '.conversation-input', function(){

  $(this).find('textarea').focus();

})

.on( 'ui-view-resize ui-view-maximize ui-view-unmaximize', function(){

  //$( '.message-container' ).scrollTop(9999999);

})

.on('click','.back-button', function(){
  goBack();
})

.on('click', '.go-bottom', function(){
  goBottom();
})

.on( 'click', '.invite .add', function(){

  var input = $('<input class="full">');
  $(this).before( input );
  $(this).parent().scrollTop( $(this).parent()[ 0 ].scrollHeight );
  input.focus();

})

.on( 'click', '.invite h2 b', function(){
  api.app.openApp(2);
})

.on( 'keyup', '.invite input', function(){
  $(this).removeClass('wrong')
  updateAvailableInviteNextButton()
})

.on( 'change blur', '.invite input', function(){
  if( !$(this).val().length ){
    $(this).removeClass('wrong')
    return updateAvailableInviteNextButton()
  }
  if( MAIL_REGEXP.test( $(this).val() ) ){
    $(this).removeClass('wrong')
  }else{
    $(this).addClass('wrong')
  }
  updateAvailableInviteNextButton()
})

.on( 'click', '.invite .next:not(.disabled)', function(){

  var mails = [];

  $('.invite input').each( function(){

    //console.log( $(this).val().length && MAIL_REGEXP.test( $(this).val() ) );
    if( $(this).val().length && MAIL_REGEXP.test( $(this).val() ) ){
      mails.push( $(this).val() )
    }

  });

  api.user.inviteByMail( mails, function(error){

    if( error ){
      alert(error);
    }else{
      api.banner()
          .setTitle( lang.invite.invitationSentTitle )
          .setText( lang.invite.invitationSentSubtitle )
          .setIcon( 'https://static.horbito.com/app/14/icon.png' )
          .render();
    }

  })

})

.on('backbutton', function( e ){
  e.stopPropagation();
  goBack();
})

.on('getChats', function( e , o ){
  chatDeleted(o);
  getChats();
})


// END APP EVENTS

// FUNCTIONS
var appendChat = function( context, callback ){

  callback = api.tool.secureCallback( callback )

  if( $( '.chatDom-' + context.id ).length ){
    return callback()
  }

  asyncParallel({

    message : function( callback ){
      wql.getLastMessage( context.id, callback )
    },

    lastRead : function( callback ){
      wql.getLastRead( [ context.id, myContactID ], callback )

    },

    counted : function( callback ){
      api.notification.count( { customIdLike : context.id + '-%' }, callback )
    },

    users : function( callback ){
      context.getUsers( { full : true }, callback )
    }

  }, function( err, res ){

    if( err ){ console.log('ERROR: ', err ) }

    // Variables
    var message  = res.message
    var lastRead = res.lastRead
    var counted  = res.counted
    var users    = res.users
    var lastMsg  = message[ 0 ]
    var chat     = chatPrototype.clone().removeClass('wz-prototype').addClass( 'chatDom chatDom-' + context.id )

    // Set title
    // If it's a group
    if( context.name ){

    }else{

      var otherUser = users.filter( function( user ){ return user.id !== myContactID })[ 0 ]

      chat.find('.channel-name').text( otherUser.fullName );
      chat.find('.channel-img').css( 'background-image' , 'url(' + otherUser.avatar.big + ')' )

    }

    // Set last message
    // If it's group
    if( context.name && lastMsg ){

      var otherUser = users.filter( function( user ){ return user.id !== lastMsg.sender })[ 0 ]
      var date      = new Date( lastMsg.time );

      chat.find( '.channel-last-time' ).text( timeElapsed( date ) );
      chat.find( '.channel-last-msg' ).html( '<i>' + ( lastMsg.sender === myContactID ? lang.you : usr.name ) + '</i>' + ': ' + lastMsg.text );

    }/*else{

        if( channel.time != null ){

          var date = new Date( channel.time );
          chat.find( '.channel-last-time' ).text( timeElapsed( date ) );

        }

      }*/

      /*chat.find( '.channel-name' ).text( context.name );

      if (isWorldChannel) {
        chat.addClass('world-chat');
      }

      setGroupAvatar( context.name , chat.find( '.channel-img' ) );

    }else{



      if( lastMsg ){

        var date = new Date( lastMsg.time );

        chat.find( '.channel-last-time' ).text( timeElapsed( date ) );

        if ( lastMsg.sender == myContactID ) {

          chat.find( '.channel-last-msg' ).html( '<i>' + lang.you + '</i>' + ': ' + lastMsg.text );

        }else {

          chat.find( '.channel-last-msg' ).text( lastMsg.text );

        }

      }

    }*/

    // No repeat chats already appended
    if ( $( '.chatDom-' + context.id ).length != 0 ) {

      if( callback ){ callback(); };
      return;

    }else{

      if (lastMsg) {
        appendChatInOrder( chat , new Date( lastMsg.time ) );
        chat
        .data( 'time' , new Date( lastMsg.time ) );
      }else{

        var date = '';

        if( context.time != null ){
          date = context.time;
        }

        appendChatInOrder( chat , new Date(date) );
        chat
        .data( 'time' , new Date(date) );

      }

      if( counted > 0 ) {

        $('.chatDom-' + context.id).data( 'notSeen' , counted );
        $('.chatDom-' + context.id).find( '.channel-badge' ).addClass('visible').find('span').text( counted )

      }

    }

    chat.data( 'channel' , context );
    chat.data( 'user' , users );
    chat.data( 'isGroup' , context.name );

    setActiveChat( chat );
    callback();

  })

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

var appendContact = function( c , channel ){

  var contact = contactPrototype.clone();

  contact
  .removeClass( 'wz-prototype' )
  .addClass( 'contactDom' )
  .find( '.contact-name' ).text( c.fullName );

  contact.find( '.contact-img' ).css( 'background-image' , 'url(' + c.avatar.big + ')' );

  contact
  .data( 'contact' , c );
  contact
  .addClass( 'user-id-' + c.id );

  myContacts.push( { id : c.id , status : false , name: c.name } );

  if( channel != undefined ){ contact.data( 'channel' , channel ) }

  contactList.append( $( '.contactDom' ).add( contact ).sort( function( a, b ){

    a = $(a).data('contact');
    b = $(b).data('contact');

    if( isConected( a.id ) === isConected( b.id ) ){
      return a.fullName.localeCompare( b.fullName );
    }

    if( isConected( a.id ) ){
      return -1;
    }

    return 1;

  }) );

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

  member.data( 'contact' , user );

  memberList.append( member );

  return member;

}

var arrDiff = function ( a1, a2 ) {

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

var asyncParallel = function( fns, callback ){

  var list     = Object.keys( fns )
  var position = 0;
  var closed   = false;
  var res      = {}
  var checkEnd = function( i, error, value ){

    if( closed ){
      return;
    }

    res[ i ] = value
    position++;

    if( position === list.length || error ){

      closed = true;

      callback( error, res );

      // Nullify
      list = callback = position = checkEnd = closed = null;

    }

  };

  if( !list.length ){
    return callback();
  }

  list.forEach( function( fn ){
    fns[ fn ]( checkEnd.bind( null, fn ) );
  });

}

/*
var changeTab = function( tab ){

  switch(tab) {

    // Make it active and visible
    case 'chat':

      mode = MODE_CHAT;
      prevMode = mode;
      $('.unread-messages').hide();
      contactsButton.removeClass('active');
      chatButton.addClass('active');
      contactTab.removeClass( 'visible' );
      chatTab.addClass( 'visible' );
      navbar.addClass('inChats');
      colorChange.addClass( 'visible' );
      groupMenu.removeClass( 'visible' );
      //removeGroup.removeClass( 'visible' );
      if( mobile ){
        $( '.ui-header-mobile .window-title' ).text(lang.chats);
        newGroupButton.hide();
      }
      else{
        newGroupButton.removeClass( 'visible' );
      }

      break;

    // Make it active and visible
    case 'contact':

      mode = MODE_CONTACTS;
      prevMode = mode;
      chatButton.removeClass( 'active' );
      contactsButton.addClass( 'active' );
      chatTab.removeClass( 'visible' );
      contactTab.addClass( 'visible' );
      navbar.removeClass('inChats');
      colorChange.addClass( 'visible');
      newGroupButton.addClass( 'visible' );

      if( mobile ){
        $( '.ui-header-mobile .window-title' ).text(lang.contacts);
        newGroupButton.hide();
      }

      break;

  }

}
*/

var chatDeleted = function( info ){

  var chat = $( '.chatDom-' + info.id );

  if ( chat.hasClass( 'active' ) ) {
    hideContent();
  }

  chat.remove();

}

var checkScrollBottom = function( value ){

  //Si no se le pasa valor, usamos 100 por defecto
  if( !value ){
    value = 100;
  }

  if( $('.message-container').scrollTop() + $('.message-container').height() > $('.message-container')[0].scrollHeight - value ) {
    return true;
  }

  return false;

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

      wql.addChannel( [ channel.id , groupName, Date.now() ] , function( error , message ){

        console.log(channel.id, groupName);
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
                  //removeGroup.removeClass( 'visible' );
                  getChats( function(){

                    if( mobile ){
                      goBack();
                    }else{
                      $('.chatDom-'+channel.id).click();
                    }

                  });

                });

              });

            });

          });

        });

      });

    });

  }else{

    if( mobile ){
      navigator.notification.alert( '', function(){},lang.groupNameError );
    }else{
      alert( lang.groupNameError );
    }

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
          //removeGroup.removeClass( 'visible' );
          if( mobile ){
            $('.chatDom.active').remove();
          }

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
              //removeGroup.removeClass( 'visible' );
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

  goBack(function(){});

}

var editGroupMode = function( groupName ){

  prevMode = mode;
  mode = MODE_EDITING_GROUP;

  if( mobile ){

    $('.edit-button').hide();
    $('.accept-button').show();

  }

  //$( '.group-menu .visible' ).removeClass( 'visible' );
  groupMenu.removeClass('group-view').removeClass('group-new').addClass('group-edit');

  //$( '.group-edit' ).addClass( 'visible' );
  $( '.group-name editMode' ).text(lang.nameGroup);
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

    });

  });

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

var filterMembers = function( filter ){

  var members = $( '.memberDom' );
  members.show();
  var membersToShow = members.filter( startsWithMember( filter ) );
  var membersNotToShow = members.not( membersToShow );
  membersNotToShow.hide();

}

/*
var getChats = function( callback ){

  console.time('channels');

  api.com.list({ protocol : 'chat' }, function( err, contexts ){

    if ( err ) { console.log('ERROR: ', err ); }

    if( !contexts.length ){
      return contactsButton.click();
    }

    for( var i = 0; i < contexts.length; i++ ){
      appendChat( contexts[ i ] )
    }

    /*
    $.each( contexts, function( i, context ){

      var isWorldChannel = context.world_id ? true : false;

      //channelApi.time = context.time;

      context.getUsers( { full : true }, function( err, users ){

        if ( err ) { console.log('ERROR: ', err ); }

        var isGroup = !!context.name

        if( !isGroup ){

          var you = myContactID === users[ 0 ].id ? users[ 1 ] : users[ 0 ];

          appendChat( context , you , context.name , isWorldChannel , function(){

            if( callback ){
              callback();
            }

          });

        }else{

          var usersInGroup = [];

          users.forEach( function( user ){

            if( user.id !== myContactID ){
              usersInGroup.push( user );
            }

          })

          appendChat( context , usersInGroup , context.name , isWorldChannel , function(){

            if( callback ){
              callback();
            }

          });

        }

      });

    });
    *//*

  });

}
*/
/*
var getContacts = function(){

  var friends   = $.Deferred();
  var connected = $.Deferred();
  var channels  = $.Deferred();

  api.user.friendList( false, function( error, list ){
    friends.resolve( list );
  });

  api.user.connectedFriends( true, function( error, list ){
    connected.resolve( list );
  });

  wql.getSingleChannel( [ myContactID, myContactID ], function( error, list ){

    var res = [];

    if( list && list.length ){

      asyncEach( list, function( channel, callback ){

        api.channel( channel.id_channel, function( error, chn ){

          chn.user = channel.user;

          res.push( chn );
          callback();

        });

      }, function(){
        channels.resolve( res );
      });

    }else{
      channels.resolve( [] );
    }

  });

  $.when( friends, connected, channels ).done( function( friends, connected, channels ){

    if ( friends.length === 0 ) {

      if( !mobile ){

        if( app.hasClass('dark') ){
          colorChange.click();
        }

        $('.no-contacts').addClass('active');

      }

      return;

    }

    for( var i = 0; i < friends.length; i++ ){

      var channel     = channels.filter( function( item ){ return item.user === friends[ i ].id; })[ 0 ];
      var isConnected = !!connected.filter( function( id ){ return id === friends[ i ].id; })[ 0 ];

      if( channel ){
        delete channel.user
      }

      appendContact( friends[ i ], channel || null )
      updateContactState( $( '.user-id-' + friends[ i ].id ) , isConnected , friends[ i ].id )

    }

  });

}
*/

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

var goBottom = function(){

  $('.message-container').scrollTop( $('.messageDom:last')[0].offsetTop );
  hideGoBottom();

}

var goBack = function(){

  if( mobile && mode != MODE_ANIMATING ){

    $('.unread-messages').hide();

    if( mode == MODE_INFORMATION || mode == MODE_CREATING_GROUP ){

      if( mode == MODE_CREATING_GROUP ){

        $('.initial-header .new-group').addClass('visible');
        $('.initial-header .back-button').removeClass('visible');
        //$('.initial-header .more-button').show();
        $('.initial-header .accept-button').hide();

      }else{

        $('.conver-header').transition({
          'x': '0'
        },animationDuration, animationEffect);

        $('.info-header').transition({
          'x': '100%'
        },animationDuration, animationEffect);

      }

      mode = MODE_ANIMATING;
      $('.group-menu').transition({
        'x' : '100%'
      }, animationDuration, animationEffect, function(){

        mode = prevMode;
        groupMenu.removeClass( 'visible' );
        //removeGroup.removeClass( 'visible' );

      });

    }else if( mode == MODE_CONVERSATION ){

      mode = MODE_ANIMATING;
      $('.initial-header').transition({
        'x': '0'
      },animationDuration, animationEffect);

      $('.conver-header').transition({
        'x': '100%'
      },animationDuration, animationEffect);

      $( '.contactDom.active' ).removeClass( 'active' );
      $( '.chatDom.active' ).removeClass( 'active' );
      $('.ui-navbar').transition({
        'x' : 0
      },animationDuration, animationEffect);

      content.stop().clearQueue().transition({
        'x' : '100%'
      },animationDuration, animationEffect, function(){

        mode = prevMode;
        $(this).hide().removeClass( 'visible' );

      });

    }else if( mode == MODE_EDITING_GROUP ){

      mode = MODE_ANIMATING;
      $('.group-menu').transition({
        'x' : '100%'
      }, animationDuration, animationEffect, function(){

        mode = MODE_CONVERSATION;
        $('.accept-button').hide();
        $('.edit-button').show();
        cancelNewGroup.click();

      });

      $('.conver-header').transition({
        'x': '0'
      },animationDuration, animationEffect);

      $('.info-header').transition({
        'x': '100%'
      },animationDuration, animationEffect);

    }

  }

}

var hideContent = function(){

  $( '.no-content' ).show();
  content.removeClass( 'visible' );

}

var hideGoBottom = function(){
  $('.go-bottom').removeClass('active unread');
  $('.unread-separator').remove();
};

var resetChatsClass = function(){

  groupMenu.find('.group-view').removeClass('group-view');
  groupMenu.find('.group-edit').removeClass('group-edit');
  groupMenu.find('.group-new').removeClass('group-new');
  $('.addPeople').hide();
  $('.edit').hide();
}

var getLanguage = function(){

  api.config.getLanguages( function( error, languages, used ){

    if( used.code === "es" || used.code === "es-es" ){
      language = "es"
    }else if( used.code === "en" || used.code === "en-us" || used.code === "en-en" ){
      language = "en"
    }

  })

}

var initChat = function(){

  //getLanguage()
  translateUI()
  setMobile()
  checkTab()
  getContacts()
  getChats()

  if( params ){
    checkParams( params[0] , params[1] );
  }

  msgInput.textareaAutoSize();

  resetChatsClass();

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

var launchBanner = function( name , text , avatar , callback ){

  api.banner()
  .setTitle( name )
  .setText( text )
  .setIcon( avatar)
  // To Do -> .sound( 'marimba' )
  .on( 'click', callback )
  .render()

}

var listMessages = function( context ){

  $( '.messageDom' ).remove();
  $( '.separatorDom' ).remove();

  var promisesArray = [];
  var lastReadPromise = $.Deferred();
  promisesArray.push( lastReadPromise );

  var isGroup = context.name;

  var users = $( '.chatDom.active' ).data( 'user' );

  if ( Array.isArray( users ) ) {
    isGroup = true;
  }

  context.getMessages( { withAttendedStatus : true }, function( err, messages ){

    if( err ){ console.log('ERROR: ', err ) }

    /*if ( isGroup ) {

      // Check for antique users messages
      var usersNeccesary = users.slice(0);

      messages.forEach(function( message ){

        var userFound = false;

        users.forEach(function( user ){

          var found = false;
          for (var i = 0; i < usersNeccesary.length; i++) {
              if (usersNeccesary[i].id === user.id) {
                  found = true;
              }
          }

          if ( user.id === message.sender && usersNeccesary.indexOf( user ) === -1 && !found) {

            userFound = true;
            usersNeccesary.push( user );

          }

        });

        if ( !userFound ) {

          var userPromise = $.Deferred();
          promisesArray.push( userPromise );
          api.user( message.sender , function( err , usr ){

            var found = false;
            for (var i = 0; i < usersNeccesary.length; i++) {
                if (usersNeccesary[i].id === usr.id) {
                    found = true;
                }
            }

            if ( !found ) {
              usersNeccesary.push( usr );
            }

            userPromise.resolve();

          })

        }

      });

    }

    wql.getLastRead( [ channel.id , myContactID ] , function( error , lastRead ){

      if( lastRead && lastRead[0].last_read ){
        lastReadId = lastRead[0].last_read;
      }else{
        lastReadId = -1;
      }

      lastReadPromise.resolve();

    });

    // All users necessary on var users
    $.when.apply( null, promisesArray ).done( function(){
    */

    for( var i = 0; i < messages.length; i++ ){

      console.log( messages )

      if ( messages[i].sender == myContactID ) {
        printMessage( messages[ i ] , null , messages[ i ].time , true, null, null, true )
      }else if( !isGroup ) {
        printMessage( messages[ i ] , users , messages[ i ].time , true, null, null, true );
      }else{

        for (var j = 0; j < usersNeccesary.length; j++) {

          if ( usersNeccesary[ j ].id === messages[ i ].sender ) {
            printMessage( messages[ i ] , usersNeccesary[j] , messages[ i ].time , true, null, null, true );
            j = usersNeccesary.length
          }

        }

      }

      if( i === messages.length -1 ){

        if( checkScrollBottom() ){

          clearTimeout( unreadTimeOut );
          unreadTimeOut = setTimeout( function(){
            $('.unread-separator').remove();
            $('.message-container').scrollTop( $('.message-container').scrollTop() );
          }, 3000);

        }

      }

    }

      /*

      if( messages && messages.length > 0){

        var lastReadId = messages[ messages.length - 1].id;

        console.log( api.notification )
        api.notification.markAsAttended({ customId : channel.id + '-' + lastReadId, previous : channel.id + '-%' })
        wql.updateLastRead( [ lastReadId , channel.id, myContactID ] , function( error , message ){
          console.log(4,error,message)
          if ( error ) { console.log('ERROR: ', error ); }
          $('.chatDom.active').data( 'notSeen' , 0 );

          if ( isGroup ) {

            var aux = 0 ;
            $( '.messageDom' ).removeClass('readed');

            $.each( users , function( i , user ){

              wql.getLastRead( [ channel.id , user.id ] , function( error , lastRead ){

                if ( lastRead[0].last_read > aux ) {

                  aux = lastRead[0].last_read;

                  var lastMsgRead = $( '.msg-id-' + lastRead[0].last_read);
                  var allMessages = lastMsgRead.parent().find( '.messageDom' );
                  var index = allMessages.index( lastMsgRead ) + 1;

                  allMessages.removeClass('readed');
                  allMessages.slice( 0 , index ).addClass( 'readed' );

                }

              });

              channel.send( { 'action' : 'updateRead' , 'id' : channel.id , 'lastRead' : lastReadId } , function( error ){
                // To Do -> Error
              });

            });

          }else {

            wql.getLastRead( [ channel.id , users.id ] , function( error , lastRead ){

              var lastMsgRead = $( '.msg-id-' + lastRead[0].last_read);
              var allMessages = lastMsgRead.parent().find( '.messageDom' );
              var index = allMessages.index( lastMsgRead ) + 1;

              allMessages.removeClass('readed');
              allMessages.slice( 0 , index ).addClass( 'readed' );

            });

            channel.send(  { 'action' : 'updateRead' , 'id' : channel.id , 'lastRead' : lastReadId } , function( error ){

              if ( error ) { console.log('ERROR: ', error ); }

            });

          }

        });

      }

    });*/

  })

  return

  /*wql.getMessages( channel.id , function( error, messages ){

    messages = messages.reverse();*/

}

var listenWriting = function( senderId ){

  var writingText = lang.writing;

  if( $( '.chatDom.active' ).data( 'isGroup' ) && senderId ){

    api.user( senderId , function( error, user ){

      if( error ){
        console.log('ERROR: ' + error);
      }else{
        lastMessage.text( user.name + ' ' + lang.is + ' ' + writingText );
      }

    });

  }else{
    lastMessage.text( writingText );
  }

  clearTimeout( listenWritingTimeOut );

  listenWritingTimeOut = setTimeout(function(){

    lastMessage.text( lang.conected );

  }, 1000);

}

var loadMoreMsgs = function(){

  if (loadingMsgs) {
    return;
  }

  loadingMsgs = true;
  firstLoad = true;

  var firstMsg = $( '.messageDom' ).eq(0);
  var channel = $( '.active.chatDom' ).data( 'channel' );
  var users = $( '.active.chatDom' ).data( 'user' );

  messageScrollBlock = firstMsg;

  wql.getMessagesFrom( [ channel.id , firstMsg.data( 'id' ) ] , function( error , messages ){

    $.each( messages , function( i, msg ){

      if( msg.sender === myContactID ){

        var user = null;

      }else if ( Array.isArray( users ) ) {

        var user = users.find(function( u ){
          return u.id === msg.sender;
        });

      }else{
        var user = users;
      }

      printMessage( msg , user , msg.time , false , true , true );

    });

    loadingMsgs = false;

  });

}

var messageNotReaded = function( message ){

  updateBadge( 1 , true );

  console.log(mode);
  if( mode != MODE_CHAT ){//No estamos en la lista de chats
    $('.unread-messages').show();
  }

  var notSeen = $('.chatDom-' + message.id).data( 'notSeen' );
  notSeen = notSeen ? notSeen + 1 : 1;
  $('.chatDom-' + message.id).data( 'notSeen' , notSeen );
  $('.chatDom-' + message.id).find( '.channel-badge' ).addClass('visible').find('span').text( notSeen );
  console.log('pip2')

}

var messageRecieved = function( message ){

  console.log( message )

  var channelActive = $( '.chatDom.active' ).data( 'channel' );
  var chat          = $( '.chatDom-' + message.context );
  var date          = new Date( message.time );
  var printed       = false;
  var messageRec    = message;

  // ESTOY EN LA CONV
  if( channelActive && channelActive.id === message.context ){

    printMessage( message, null , date );
    return
    // SOY EL EMISOR
    if( message.sender === myContactID ){

      api.notification.markAsAttended({ customId : channelActive.id + '-' + o.id, previous : channelActive.id + '-%' })
      wql.updateLastRead( [ o.id , channelActive.id, myContactID ] , function( error , message ){
        console.log(1,error,message)
        if ( error ) { console.log('ERROR: ', error ); }
        printMessage( o , null , date );
      });

      var users = chat.data('user');

      if( !Array.isArray( users ) ){

        setChatInfo( chat , o , message.sender , false );

      }else{

        setChatInfo( chat , o , message.sender , true );

      }

      // SOY RECEPTOR
    }else{

      var users = chat.data('user');

      // CANAL SIMPLE
      if( !Array.isArray( users ) ){

        setChatInfo( chat , o , message.sender , false );

        api.notification.markAsAttended({ customId : channelActive.id + '-' + o.id, previous : channelActive.id + '-%' })
        wql.updateLastRead( [ o.id , channelActive.id, myContactID ] , function( error , message ){
          console.log(2,error,message)
          if ( error ) { console.log('ERROR: ', error ); }

          printMessage( o , users , date );

        });

        if (!app.parent().hasClass( 'wz-app-focus' )) {

          if ( message.sender != myContactID ) {

            messageNotReaded( messageRec );

            launchBanner( users.fullName , o.txt , users.avatar.tiny , function(){

              $( '.chatDom-' + message.id ).click();
              api.app.viewToFront( app );

            });

          }

        }

        // GRUPO
      }else{

        setChatInfo( chat , o , message.sender , true );

        $.each( users , function( i , user ){

          if ( user.id === message.sender ) {

            api.notification.markAsAttended({ customId : channelActive.id + '-' + o.id, previous : channelActive.id + '-%' })
            wql.updateLastRead( [ o.id , channelActive.id, myContactID ] , function( error , message ){
              console.log(3,error,message)
              if ( error ) { console.log('ERROR: ', error ); }

              $( '.user-id-' + user.id ).data( 'channel' , channelActive );

              printMessage( o , user , date );

            });

            if (!app.parent().hasClass( 'wz-app-focus' )) {

              if ( message.sender != myContactID ) {

                api.user( message.sender, function( error, user ){

                  messageNotReaded( messageRec );

                  launchBanner( user.fullName , o.txt , user.avatar.tiny , function(){

                    $( '.chatDom-' + message.id ).click();
                    api.app.viewToFront( app );

                  });

                });

              }

            }

          }

        });

      }

    }

  }else{

    if ( message.sender != myContactID ) {
      messageNotReaded( messageRec );

      api.user( message.sender, function( error, user ){

        launchBanner( user.fullName , o.txt , user.avatar.tiny , function(){

          $( '.chatDom-' + message.id ).click();
          api.app.viewToFront( app );

        });

      });

    }

    var users = chat.data('user');

    if( !Array.isArray( users ) ){

      setChatInfo( chat , o , message.sender , false );

    }else{

      setChatInfo( chat , o , message.sender , true );

    }

  }

}

var newGroup = function(){

  // Make it visible
  if( mode != MODE_ANIMATING ){

    nameGroup.text(lang.nameGroup);

    //$( '.group-menu .visible' ).removeClass( 'visible' );
    groupMenu.removeClass('group-edit').removeClass('group-view');
    groupMenu.addClass( 'visible' ).addClass( 'group-new' );
    //$( '.group-new' ).addClass( 'visible' );
    $( '.group-name-input input' ).val( '' );
    $( '.search-members input' ).val( '' );
    //$( '.group-members-txt' ).hide();

    if( mobile ){

      prevMode = mode;
      mode = MODE_ANIMATING;
      $('.group-menu').transition({
        'x' : 0
      }, animationDuration, animationEffect, function(){
        mode = MODE_CREATING_GROUP;
      });
      $('.initial-header .new-group').removeClass('visible');
      $('.initial-header .back-button').addClass('visible');
      //$('.initial-header .more-button').hide();
      $('.initial-header .accept-button').show();

    }

    setGroupAvatar( '?' , $( '.group-avatar' ) );

    $( '.memberDom' ).remove();
    api.user.friendList( false, function( error, list ){

      $.each( list , function( index , friend ){

        appendMember( friend );

      });

    });

  }


}

var objectRecieved = function( message ){

  var channelActive = $( '.chatDom.active' ).data( 'channel' );
  var o = message.data

  console.log( o )

  switch ( o.action ) {

    // USER REMOVED
    case 'userRemoved':

    var active = $( '.chatDom-' + o.id );

    if ( o.userId == myContactID ) {

      active.remove();
      content.removeClass( 'visible' );

    }

    break;


    // GROUP NAME CHANGE
    case 'nameChange':

    var active = $( '.chatDom-' + o.id );

    if ( active.length > 0 ) {

      if( channelActive && o.id == channelActive.id ) {

        active.remove();
        getChats(function(){

          $( '.chatDom-' + o.id ).click();

        });

      }else{

        active.remove();
        getChats();

      }

    }

    break;

    // MESSAGE READED
    case 'updateRead':

    if ( channelActive && message.id == channelActive.id && message.sender != myContactID ) {

      var lastMsgRead = $( '.msg-id-' + o.lastRead );
      var index = lastMsgRead.index();

      lastMsgRead.parent().find( '.messageDom' ).slice( 0 , ++index ).addClass( 'readed' );

    }
    break;

    case 'writing':

    if ( channelActive && message.id == channelActive.id && message.sender != myContactID ) {

      listenWriting(message.sender);

    }
    break;

    // MESSAGE
    case 'message':

    /* COMPRUEBO QUE NO ES UN MENSAJE REPETIDO, YA QUE NO SE PORQUE SE ENVIA 2 VECES AL HACER UN UNICO .send() */
    /*if ( lastMessageReceived && o.id === lastMessageReceived.id ) {
      return;
    }
    lastMessageReceived = o;
    /* -- */

    /*if ( channelActive && message.id === channelActive.id && message.sender !== myContactID ){
      printMessage( message , null , message.time , true, null, null, true )
    return*/
    messageRecieved( message/*, o , channelActive*/ );

    /*
    if ( channelActive && message.id == channelActive.id && message.sender != myContactID && app.parent().hasClass( 'wz-app-focus' ) ) {

      var interval = setInterval(function(){
        channelActive.send(  { 'action' : 'updateRead' , 'id' : message.id , 'lastRead' : o.id } , function( error ){
        });
        clearInterval(interval);
      }, 1000);

    }*/

    break;

  }

}

var openChat = function( id , mode ){

  if ( mode === 'world' ) {

    var timeout = setTimeout(function(){
      $( '.chatDom-' + id ).click();
    }, 1000);

  }else if( mode === 'user' ){

    var timeout = setTimeout(function(){
      changeTab( 'contact' );
      $( '.user-id-' + id ).click();
    }, 1000);

  }

}

/*
var printMessage = function( msg , sender , time , noAnimate , byScroll , checked, listing ){

  var message;
  var date = new Date( time );
  var hh = date.getHours();
  var mm = date.getMinutes();
  var text = msg.data.text || msg.data.txt

  text = text.replace( /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/ , '<a href="$1" target="_blank">$1</a>');
  //textProcessed = text.replace( /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/ , '<a href="$1" target="_blank">$1</a>' );
  //textProcessed = text.replace( /((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/ig, '<a href="$1" target="_blank">$1</a>' );
  text = text.replace(/\n/g, "<br />");
  text = $('<div></div>').html( text );

  text.find('a').each( function(){

    if( !(/^http(s)?:\/\//i).test( $(this).attr('href') ) ){
      $(this).attr( 'href', 'http://' + $(this).attr('href') ).addClass('wz-selectable');
    }

  });

  text = text.html();


  if( hh < 10 ){
    hh = '0' + hh;
  }

  if( mm < 10 ){
    mm = '0' + mm;
  }

  if( sender == null ){

    message = $( '.message-me.wz-prototype' ).clone();
    message
      .removeClass( 'wz-prototype' )
      .addClass( 'messageDom' )
      .find( '.message-text' ).html( text );
      message
      .find( '.message-time' ).text( hh + ':' + mm );

  }else{

    message = $( '.message-other.wz-prototype' ).clone();
    message
      .removeClass( 'wz-prototype' )
      .addClass( 'messageDom' );
    message
      .find( '.message-text' ).html( text );

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

  message.addClass( 'messageDom' ).addClass( 'msg-id-' + msg.id );
  message.data( 'id' , msg.id );
  message.data( 'date' , date );

  if ( byScroll ){

    if ( $( '.msg-id-' + msg.id ).length === 0 ) {
      $( '.messageDom' ).eq(0).before( message );
    }else{

      console.log('REP');
      return;

    }

  }else{

    if ( $( '.msg-id-' + msg.id ).length === 0 ) {
      msgContainer.append( message );
    }else{

      console.log('REP');
      return;

    }

  }

  var now = new Date();
  var yesterday = new Date();
  yesterday.setDate( now.getDate() - 1 );
  var lastMsg = message.prev().not('.wz-prototype');
  if (lastMsg.hasClass('wz-scroll-bar')) {
    lastMsg = lastMsg.prev().not('.wz-prototype');
  }
  var nextMsg = message.next().not('.wz-prototype');

  var separator = separatorPrototype.clone();
  separator.removeClass( 'wz-prototype' ).addClass( 'separatorDom' );

  if( !byScroll && !lastMsg.hasClass('separatorDom') && ( lastMsg.length === 0 || !lastMsg.data('date') || date.getFullYear() != lastMsg.data('date').getFullYear() || date.getMonth() != lastMsg.data('date').getMonth() || date.getDate() != lastMsg.data('date').getDate()) ){

    if ( now.getFullYear() == date.getFullYear() && now.getMonth() == date.getMonth() && now.getDate() == date.getDate() ) {
      separator.find( 'span' ).text( 'Hoy' );
    }else{
      separator.find( 'span' ).text( timeElapsed( date ) );
    }
    message.before( separator );

  }else if( byScroll && !nextMsg.hasClass('separatorDom') && ( date.getFullYear() != nextMsg.data('date').getFullYear() || date.getMonth() != nextMsg.data('date').getMonth() || date.getDate() != nextMsg.data('date').getDate()) ){

    if ( now.getFullYear() == nextMsg.data('date').getFullYear() && now.getMonth() == nextMsg.data('date').getMonth() && now.getDate() == nextMsg.data('date').getDate() ) {
      separator.find( 'span' ).text( 'Hoy' );
    }else{
      separator.find( 'span' ).text( dateToString( nextMsg.data('date') ) );
    }
    message.after( separator );

  }

  if( !byScroll ){

     if( lastReadId === msg.id && listing ){

      msgContainer.scrollTop( message[0].offsetTop + message.outerHeight(true) );
      heightToScroll = message.outerHeight(true); //Activo el modo scroll

    }else if( heightToScroll !== -1 && listing ){

      if( message.prev().data('id') === lastReadId && sender != null ){

        var sep = separatorPrototype.clone();
        sep.removeClass( 'wz-prototype' ).addClass( 'unread-separator' );
        sep.find( 'span' ).text( 'Mensajes sin leer' );
        message.before( sep );
        heightToScroll += sep.outerHeight();

      }

      //console.log( heightToScroll + message.outerHeight(true), app.height() );
      if( ( heightToScroll + message.outerHeight(true) ) < app.height() ){

        heightToScroll += message.outerHeight(true);
        msgContainer.scrollTop( message[0].offsetTop );

      }else{
        heightToScroll = -1; //Desactivamos para mejorar el rendimiento
      }

    }else if( !noAnimate && ( sender == null || checkScrollBottom() ) ){
      msgContainer.stop().clearQueue().animate( { scrollTop : message[0].offsetTop }, 400  );
    }else if( !noAnimate && sender != null && !checkScrollBottom() && !checked ){
      showGoBottom( true );
    }

  }else{
    //bloqueo de scroll
    console.log( messageScrollBlock );
    msgContainer.scrollTop(messageScrollBlock.offset().top - msgContainer.offset().top + msgContainer.scrollTop());
  }

  if ( checked ) {
    message.addClass( 'readed' );
  }

}
*/

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

/*
var selectChat = function( chat ){

  console.log( chat )

  if( loadingChat ){
    return
  }

  loadingChat = true;

  if( mode != MODE_ANIMATING ){

    groupMenu.removeClass( 'visible' );
    removeGroup.removeClass( 'visible' );

    var channel = chat.data( 'channel' );
    var contact = chat.data( 'user' );

    lastMessage.removeClass( 'conected' );
    $( '.chatDom.active' ).removeClass( 'active' );
    chat.addClass( 'active' );

    if( !mobile ){

      showContent();
      msgInput.focus();

    }else{

      prevMode = mode;
      mode = MODE_ANIMATING;
      $('.initial-header').transition({
        'x': '-100%'
      },animationDuration, animationEffect);

      $('.conver-header').transition({
        'x': '0'
      },animationDuration, animationEffect);

      $('.conver-avatar').css('background-image', chat.find('.channel-img').css('background-image') );
      content.show().transition({
        'x' : 0
      },animationDuration, animationEffect, function(){
        mode = MODE_CONVERSATION;
        $(this).addClass( 'visible' );
        //msgInput.focus();
      });

      $('.ui-navbar').transition({
        'x' : '-100%'
      },animationDuration, animationEffect);

    }

    // Set header
    $( '.conversation-name, .conver-header .conver-title' ).text( chat.find( '.channel-name' ).text() );

    if ( channel == undefined ) {

      //$( '.conversation-header' ).data( 'channel' , null );
      $( '.messageDom' ).remove();
      $( '.separatorDom' ).remove();


    }else{

      //$( '.conversation-header' ).data( 'channel' , channel );
      listMessages( channel );

      chat.data( 'notSeen' , null );
      if ( chat.find( '.channel-badge' ).hasClass( 'visible' ) ) {
        //TODO marcar como atendidas las notificaciones de este chat
        updateBadge( parseInt(chat.find( '.channel-badge span' ).text()) , false );
      }
      chat.find( '.channel-badge' ).removeClass( 'visible' );

      $( '.conversation-header' ).off( 'click' );

      if( chat.data( 'isGroup' ) != null ){

        if( mobile ){

          $( '.conver-info' ).addClass( 'viewGroup' );
          $( '.conver-avatar' ).hide();
          $( '.conver-avatar-group' ).show();
          setGroupAvatar( chat.find( '.channel-name' ).text() , $( '.conver-avatar-group' ) );

        }else{
          $( '.conversation-header' ).addClass( 'viewGroup' );
        }

      }else{

        if( mobile ){
          $( '.conver-avatar' ).show();
          $( '.conver-avatar-group' ).hide();
          $( '.conver-info' ).removeClass( 'viewGroup' );
        }else{
          $( '.conversation-header' ).removeClass( 'viewGroup' );
        }

      }

      if ( chat.data( 'isGroup' ) == null ) {

        if ( isConected( contact.id ) ) {

          lastMessage.addClass( 'conected' );
          lastMessage.text( lang.conected );

        }else {

          lastMessage.removeClass( 'conected' );
          lastMessage.text( lang.disconected );

        }

      }else{

        lastMessage.text( ( contact.length + 1 ) + ' ' + lang.members );

      }

    }

    loadingChat = false;

  }

}
*/

var selectColor = function( string ){

  var id = 0;

  for (var i = 0; i < string.length; i++) {

    id += string.charCodeAt(i);
    id++;

  }

  return id = id%colorPalette.length;

}

var selectContact = function( contact ){

  if( mode != MODE_ANIMATING ){

    groupMenu.removeClass( 'visible' );
    removeGroup.removeClass( 'visible' );

    $( '.conversation-header' ).off( 'click' );

    var channel = contact.data( 'channel' );
    $( '.contactDom.active' ).removeClass( 'active' );
    contact.addClass( 'active' );

    if( !mobile ){

      showContent();
      msgInput.focus();

    }else{

      prevMode = mode;
      mode = MODE_ANIMATING;

      $('.initial-header').transition({
        'x': '-100%'
      },animationDuration, animationEffect);

      $('.conver-header').transition({
        'x': '0'
      },animationDuration, animationEffect);

      $('.conver-avatar').css('background-image', contact.find('.contact-img').css('background-image') );
      content.show().transition({
        'x' : 0
      },animationDuration, animationEffect, function(){
        mode = MODE_CONVERSATION;
        $(this).addClass( 'visible' );
        //msgInput.focus();
      });

      $('.ui-navbar').transition({
        'x' : '-100%'
      },animationDuration, animationEffect);

    }

    // Set header
    $( '.conversation-name, .conver-header .conver-title' ).text( contact.find( '.contact-name' ).text() );

    if ( channel == undefined ) {

      $( '.messageDom' ).remove();
      $( '.separatorDom' ).remove();
      $( '.chatDom.active' ).removeClass( 'active' );

    }else{

      $( '.chatDom.active' ).removeClass( 'active' );
      $( '.chatDom-' + channel.id ).addClass( 'active' );
      listMessages( channel );
      changeTab('chat');

    }

    if ( contact.hasClass( 'conected' ) ) {

      lastMessage.addClass( 'conected' );
      lastMessage.text( lang.conected );

    }else{

      lastMessage.removeClass( 'conected' );
      lastMessage.text( lang.disconected );

    }

  }

}

var sendMessage = function(){

  console.log('sendMessage')

  var message = $.trim( msgInput.val() )

  // Clean sender
  msgInput.val('');

  if( !message ){
    return
  }

  var context = $( '.chatDom.active' ).data( 'channel' );
  var myName  = me.name;
  var sender  = ( context.name ? ( context.name + ' - ' + myName ) : myName ).trim() + ':\n';
  var data    = {

    action    : 'message',
    text      : message,
    groupName : context.name

  }

  context.send({

    data         : data,
    persistency  : true,
    /*notification : { push : { customId : context.id + '-' + messages.insertId, message : sender + message, data : { 'context' : context.id, 'message' : message.insertId } } }*/

  }, function( error ){

  })

}

var setActiveChat = function( chat ){

  var channelActive = $( '.chatDom.active' ).data( 'channel' );

  if (channelActive != undefined && chat.data( 'channel' ).id == channelActive.id) {
    chat.click();
  }

}

var setChatInfo = function( chat , o , user , isGroup ){

  api.user( user , function( e , usr ){

    var name = usr.name;

    if ( isGroup ) {

      if ( usr.id == myContactID ){
        chat.find( '.channel-last-msg' ).html( '<i>' + lang.you + '</i>' + ': ' + o.txt );
      }else{
        chat.find( '.channel-last-msg' ).html( '<i>' + name + '</i>' + ': ' + o.txt );
      }

    }else{

      if ( usr.id == myContactID ){
        chat.find( '.channel-last-msg' ).html( '<i>' + lang.you + '</i>' + ': ' + o.txt );
      }else{
        chat.find( '.channel-last-msg' ).text( o.txt );
      }

    }

    chat.insertBefore( $( '.chatDom' ).eq(0) );
    chat.find( '.channel-last-time' ).text( timeElapsed( new Date() ) );

  });

}

var setGroupAvatar = function( groupName , avatar ){

  var expNameWords = groupName.split(' ');

  avatar.html( '<span>' + (expNameWords[0] || ' ')[0].toUpperCase() + (expNameWords[1] || ' ')[0].toUpperCase() + '</span>');

  var colorId = selectColor( groupName );

  avatar.addClass('group').css({
    'background-image'  : 'none',
    'background-color'  : colorPalette[colorId].light,
    'border-color'      : colorPalette[colorId].border,
    'border-style'      : 'solid'
  });
  avatar.find( 'span' ).css('color', colorPalette[colorId].text);

}

var setMobile = function(){

  if( mobile ){

    StatusBar.backgroundColorByHexString("#2c3238");
    StatusBar.styleLightContent();

    $('.inChats').removeClass('inChats');
    newGroupButton.hide();

    $('.conversation-send-desktop').hide();

    $('input, textarea').on('focus', function(){
      Keyboard.shrinkView(true);
    })

    .on('blur', function(){
      Keyboard.shrinkView(false);
    });

    $(window).on('resize',function(){
      $('.message-container').scrollTop( $('.message-container')[ 0 ].scrollHeight );
    })

  }else{
    $('.conversation-send-mobile').hide();
  }

}

var setRemoveButton = function(){

  var channel = $( '.chatDom.active' ).data( 'channel' );
  //removeGroup.addClass( 'visible' );
  removeGroup.off( 'click' );


  if ($( '.chatDom.active' ).hasClass('world-chat')) {
    removeGroup.removeClass( 'visible' );
  }

  channel.list( function( error, users ){

    var admin = users[0];

    // I'm the admin
    if ( myContactID == admin ) {

      removeGroup.find( 'span' ).text(lang.deleteExit);
      adminMode = true;
      $( '.group-header .edit' ).addClass('visible');
      //removeGroup.addClass( 'removeGroup' );

    }else{

      adminMode = false;
      removeGroup.find( 'span' ).text(lang.exitGroup);
      $( '.group-header .edit' ).removeClass('visible');
      //removeGroup.addClass( 'exitGroup' );

    }

  });

}

var translateUI = function(){

  $( '.chat-tab-selector span' ).text(lang.chats);
  $( '.contact-tab-selector span' ).text(lang.contacts);
  msgInput.attr('placeholder', lang.msg);
  $( '.chat-search input' ).attr('placeholder', lang.search);
  $(  '.group-members input').attr('placeholder', lang.searchContacts);
  $( '.close-coversation' ).text(lang.close);
  $( '.send-txt' ).text(lang.send);
  $( '.new-group-button span' ).text(lang.newGroup);
  $( '.no-chat-txt' ).text(lang.noChat);
  $( '.click-chat-txt' ).text(lang.clickChat);
  $( '.group-menu .back span' ).text(lang.back);
  $( '.group-menu .edit' ).text(lang.edit);
  $( '.group-info .title' ).text(lang.info);
  $( '.group-members .title' ).text(lang.members);
  $( '.save-group span' ).text(lang.save);
  $( '.cancel-group span' ).text(lang.cancel);
  $( '.group-name-input input' ).attr('placeholder', lang.groupName);
  $( '.group-name').text(lang.groupName);
  $( '.groupName').text(lang.nameGroup);
  $( '.app-color .white' ).text(lang.white);
  $( '.app-color .dark' ).text(lang.dark);

  $('.invite h1').text( lang.invite.title );
  $('.invite h2').html( lang.invite.subtitle );
  $('.invite h3').text( lang.invite.email );
  $('.invite .add').text( lang.invite.add );
  $('.invite .next').text( lang.invite.send );
  $('.addPeople span').text( lang.addPeople);

}

var showContent = function(){

  content.addClass( 'visible' );
  $( '.no-content' ).hide();

}

var showGoBottom = function( withBadge ){

  $('.go-bottom').addClass('active');
  if( withBadge ){
    $('.go-bottom').addClass('unread');
  }

}

var startsWithChats = function( wordToCompare ){

  return function( index , element ) {
    return $( element ).find( '.channel-name' ).text().toLowerCase().indexOf( wordToCompare.toLowerCase() ) !== -1;
  }

}

var startsWithContacts = function( wordToCompare ){

  return function( index , element ) {
    return $( element ).find( '.contact-name' ).text().toLowerCase().indexOf( wordToCompare.toLowerCase() ) !== -1;
  }

}

var startsWithMember = function( wordToCompare ){

  return function( index , element ) {

    return $( element ).find( 'span' ).text().toLowerCase().indexOf( wordToCompare.toLowerCase() ) !== -1;

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
    var month = last.getMonth()+1;

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

var dateToString = function( date ){

  var day = date.getDate();
  var month = date.getMonth();
  var year = date.getFullYear().toString().substring( 2 , 4 );

  if(day<10) {
    day='0'+day
  }

  if(month<10) {
    month='0'+month
  }

  return day + '/' + month + '/' + year;

}

var updateAvailableInviteNextButton = function(){

  var validMails = 0
  $('.invite input').each( function(){
    if( $(this).val().length && MAIL_REGEXP.test( $(this).val() ) ){
      validMails++
    }
  })
  if( validMails ){
    $('.invite .next').removeClass('disabled')
  }else{
    $('.invite .next').addClass('disabled')
  }

}

var updateBadge = function( num , add ){

  var actualBadge = api.app.getBadge();

  console.log('add',add,actualBadge,parseInt( actualBadge ),num)

  if ( add ) {
    api.app.setBadge( parseInt( actualBadge ) + num );
  }else{
    api.app.setBadge( parseInt( actualBadge ) - num );
  }


};

var updateContactState = function( friend , state , id ){

  if( state ){
    friend.addClass( 'conected' );
  }else{
    friend.removeClass( 'conected' );
  }


  for (var i = 0; i < myContacts.length; i++) {

    if ( myContacts[i].id == id ) {

      myContacts[i].status = state ? true : false;
      break;

    }

  }

}

var updateState = function( userId , state ){

  var chats = $( '.chatDom' );

  $.each( chats , function( i , chat ){

    var chatUser = $( chat ).data( 'user' );

    if ( chatUser && chatUser.id == userId && $( chat ).hasClass( 'active' ) ) {

      if ( state ) {

        lastMessage.addClass( 'conected' );
        lastMessage.text( lang.conected );

      }else{

        lastMessage.removeClass( 'conected' );
        lastMessage.text( lang.disconected );

      }

    }

  });

}

var userAdded = function( info , userId ){

  if( info.sender != myContactID && myContactID === userId ){
    getChats();
  }

}

var viewGroup = function(){

  if( mode != MODE_ANIMATING ){

    // Make it visible
    //$( '.group-menu .visible' ).removeClass( 'visible' );
    groupMenu.addClass( 'visible' ).removeClass('group-new').removeClass('group-edit').addClass( 'group-view' );
    //$( '.group-view' ).addClass( 'visible' );

    if( mobile ){

      prevMode = mode;
      mode = MODE_ANIMATING;
      $( '.group-menu' ).transition({
        'x' : 0
      }, animationDuration, animationEffect, function(){
        mode = MODE_INFORMATION;
      });

      $( '.conver-header' ).transition({
        'x': '-100%'
      },animationDuration, animationEffect);

      $( '.info-header' ).transition({
        'x': '0'
      },animationDuration, animationEffect);

    }
    if(!mobile){
      $('.hideBtn').removeClass('visible');
    }

    $( '.memberDom' ).remove();
    var members = $( '.chatDom.active' ).data( 'user' );
    var groupName = $( '.chatDom.active' ).data( 'isGroup' );

    $( '.group-name' ).text( groupName );

    if ( members ) {

      $( '.group-members-txt' ).show();
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

        if( admin == myContactID ){
          $('.info-header .edit-button').show();
          $('.addPeople').show();
        }else{
          $('.info-header .edit-button').hide();
          $('.addPeople').hide();
        }

        groupMembers = [];
        appendMember( user , admin ).addClass( 'me' );
        groupMembers.push(myContactID);

        $.each( members , function( index , m ){

          appendMember( m , admin );
          groupMembers.push(m.id);

        });

      });

    });

  }

}

var warnWriting = function(){

  lastMsg = Date.now();
  var channel = $( '.active.chatDom' ).data( 'channel' );

  if( channel ){

    warnWritingTimeOut = setTimeout(function(){

      if ( ( Date.now() - lastMsg ) > 500  ) {
        channel.send(  { 'action' : 'writing' , 'id' : channel.id } , function( error ){});
      }

      warnWritingTimeOut = false;

    }, 500);

  }

}

var checkParams = function( action , options ){

  switch (action) {

    case 'push':
      getChats( function(){
        $( '.chatDom-' + params[ 1 ].channelId ).click();
      });

    case 'open-chat':

      openChat( options.chatId , options.openMode );

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
                });
              });
            });
          });
        });
      });
      break;

    case 'open-world-chat':

      api.app.viewToFront( app );
      wql.getWorldChannel( [ options.world.id ] , function( e , channelFound ){
        if ( channelFound.length > 0 ) {
          wql.addUserInChannel( [ channelFound[0].id , myContactID ] , function( e , message ){
            if(e) console.log('ERROR: ', e);
            getChats(function(){
              openChat( channelFound[0].id , 'world' );
            });
          });
        }else{
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
                      getChats(function(){
                        openChat( channel.id , 'world' );
                      });
                    });
                  });
                });
              });
            });
          });
        }
      });
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
              }else{
                chatDeleted( { id: channel[0].id } );
              }
            });
        });
      });
    }

  }

}

// INIT Chat
// It allows textareaAutoSize to be initialized
setTimeout( initChat, 0 )