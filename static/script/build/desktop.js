
var win = $(this);
// Static values
const MAINAREA_NULL = 0
const MAINAREA_CONVERSATION = 1
const MAINAREA_GROUPMODE = 2
const SIDEBAR_NULL = 0
const SIDEBAR_CONVERSATIONS = 1
const SIDEBAR_CONTACTS = 2

var view = ( function(){

	var contactPrototype      = $( '.contact.wz-prototype' );
	var conversationPrototype = $( '.channel.wz-prototype' );
	var memberPrototype      	= $( '.member.wz-prototype' );

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

  class View{

  	constructor(){

  		//this.model = model;
  		this.dom = win;

  		this._domContactsList = $('.contact-list', this.dom)
		  this._domConversationsList = $('.channel-list', this.dom)
		  this._domMessageContainer = $('.message-container', this.dom)
		  this._domMessageMePrototype = $('.message-me.wz-prototype', this._domMessageContainer)
		  this._domMessageOtherPrototype = $('.message-other.wz-prototype', this._domMessageContainer)
		  this._domGroupMemberList = $( '.member-list', this.dom );
		  this._domCurrentConversation

  		this._translateInterface();
  		// Set modes
		  //this.changeMainAreaMode( MAINAREA_NULL )
		  //this.changeSidebarMode( SIDEBAR_NULL )

  	}

		_cleanMessages(){
		  this._domMessageContainer.empty()
		}

		_isScrolledToBottom(){
		  return this._domMessageContainer[ 0 ].scrollHeight - this._domMessageContainer[ 0 ].scrollTop === this._domMessageContainer[ 0 ].clientHeight
		}

		_selectColor( string ){

		  var id = 0;

		  for (var i = 0; i < string.length; i++) {

		    id += string.charCodeAt(i);
		    id++;

		  }
		  return id = id%colorPalette.length;

		}

		_setGroupAvatar( groupName , avatar ){

		  var expNameWords = groupName.split(' ');

		  avatar.html( '<span>' + (expNameWords[0] || ' ')[0].toUpperCase() + (expNameWords[1] || ' ')[0].toUpperCase() + '</span>');

		  var colorId = this._selectColor( groupName );

		  avatar.addClass('group').css({
		    'background-image'  : 'none',
		    'background-color'  : colorPalette[colorId].light,
		    'border-color'      : colorPalette[colorId].border,
		    'border-style'      : 'solid'
		  });
		  avatar.find( 'span' ).css('color', colorPalette[colorId].text);

		}

  	_translateInterface(){

		  $( '.addPeople span' , this.dom ).text( lang.addPeople );
		  $( '.app-color .dark' , this.dom ).text( lang.dark );
		  $( '.app-color .white' , this.dom ).text( lang.white );
		  $( '.cancel-group span' , this.dom ).text( lang.cancel );
		  $( '.chat-search input' , this.dom ).attr( 'placeholder' , lang.search );
		  $( '.chat-tab-selector span' , this.dom ).text( lang.chats );
		  $( '.click-chat-txt' , this.dom ).text( lang.clickChat );
		  $( '.close-coversation' , this.dom ).text( lang.close );
		  $( '.contact-tab-selector span' , this.dom ).text( lang.contacts );
		  $( '.conversation-input textarea' , this.dom ).attr( 'placeholder' , lang.msg );
		  $( '.group-info .title' , this.dom ).text( lang.info );
		  $( '.group-members .title' , this.dom ).text( lang.members );
		  $( '.group-members input' , this.dom ).attr( 'placeholder' , lang.searchContacts );
		  $( '.group-menu .back span' , this.dom ).text( lang.back );
		  $( '.group-menu .edit' , this.dom ).text( lang.edit );
		  $( '.group-name' , this.dom ).text( lang.groupName );
		  $( '.group-name-input input' , this.dom ).attr( 'placeholder' , lang.groupName );
		  $( '.groupName' , this.dom ).text( lang.nameGroup );
		  $( '.invite .add' , this.dom ).text( lang.invite.add );
		  $( '.invite .next' , this.dom ).text( lang.invite.send );
		  $( '.invite h1' , this.dom ).text( lang.invite.title );
		  $( '.invite h2' , this.dom ).html( lang.invite.subtitle );
		  $( '.invite h3' , this.dom ).text( lang.invite.email );
		  $( '.new-group-button span' , this.dom ).text( lang.newGroup );
		  $( '.no-chat-txt' , this.dom ).text( lang.noChat );
		  $( '.save-group span' , this.dom ).text( lang.save );
		  $( '.send-txt' , this.dom ).text( lang.send );

  	}

  	appendMessage( message, senderName, senderAvatar ){

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

		  if( senderName ){
		    dom.addClass( 'sender-group' ).find('.sender').addClass( 'visible' ).text( senderName ).css( 'color' , COLORS[ selectColor( senderName ) ] )
		  }

		  if( message.sender !== api.system.user().id ){
		    dom.find( '.message-avatar' ).css( 'background-image' , 'url(' + senderAvatar + ')' )
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

  	}

		changeMainAreaMode( value, additionalData ){

		  if( value === MAINAREA_NULL ){

		    $('.ui-content').removeClass('visible')
		    $('.no-content').addClass('visible')
		    this.hideGroupMenu();

		  }else if( value === MAINAREA_CONVERSATION ){

		    $('.ui-content').addClass('visible')
		    $('.no-content').removeClass('visible')
		    this.hideGroupMenu();

		  }else if( value === MAINAREA_GROUPMODE && additionalData && additionalData.length ){
		 		this.startCreateGroup( additionalData );
		  }

		}

  	changeSidebarMode( value ){

		  this.dom.find( '.chat-footer > section' ).removeClass( 'active' )
		  this.dom.find( '.chat-body > section' ).removeClass( 'visible' )

		  if( value === SIDEBAR_CONVERSATIONS ){

		    this.dom.find( '.chat-footer .chat-tab-selector' ).addClass( 'active' )
		    this.dom.find( '.chat-body .chat-tab' ).addClass( 'visible' )
		    this.dom.find( '.ui-navbar' ).addClass( 'inChats' )
		    this.dom.find( '.new-group-button' ).removeClass( 'visible' )

		  }else if( value === SIDEBAR_CONTACTS ){

		    this.dom.find( '.chat-footer .contact-tab-selector' ).addClass( 'active' )
		    this.dom.find( '.chat-body .contact-tab' ).addClass( 'visible' )
		    this.dom.find( '.ui-navbar' ).removeClass( 'inChats' )
		    this.dom.find( '.new-group-button' ).addClass( 'visible' )

		  }

		}

		clearInput(){
			this.dom.find('.conversation-input textarea').val('')
		}

		conversationSetOpened( conversationId, value ){

			if( value ){
		    $( '.channel-id-' + conversationId ).addClass('active')
		  }else{
		    $( '.channel-id-' + conversationId ).removeClass('active')
		  }

		}

		filterChats( filter ){

	    var chats = $( '.channel' );
	    var containerToCompare = '.channel-name';
	    chats.show();
	    var chatsToShow = chats.filter( this.startsWith( filter, containerToCompare ) );
	    var chatsToHide = chats.not( chatsToShow );
	    chatsToHide.hide();

		}

		filterContacts( filter, groupFilter ){

			var contacts;
			var containerToCompare;

			if( groupFilter ){

				contacts = $( '.memberDom' );
				containerToCompare = 'span';

			}else{

				contacts = $( '.contact' );
				containerToCompare = '.contact-name';

			}

	    contacts.show();
	    var contactsToShow = contacts.filter( this.startsWith( filter, containerToCompare ) );
	    var contactsToHide = contacts.not( contactsToShow );
	    contactsToHide.hide();

		}

		hideGroupMenu(){
			$( '.group-menu' ).removeClass( 'visible' );
		}

		launchAlert( message ){
			alert( message );
		}

		markMessageAsRead( messageId ){
			this._domMessageContainer.find( '.message-' + messageId ).addClass('readed')
		}

		openConversation( conversation, isConnected ){

		  $('.conversation-name, .conver-header .conver-title').text( conversation.name )

		  if( conversation.isGroup ){
		    $('.conversation-moreinfo, .conver-moreinfo').removeClass('conected').text( conversation.users.length )
		  }else if( isConnected ) {
		    $('.conversation-moreinfo, .conver-moreinfo').addClass('conected').text( lang.conected );
		  }else{
		    $('.conversation-moreinfo, .conver-moreinfo').removeClass('conected').text( lang.disconected );
		  }

		  $( '.conversation-input textarea' ).val('').focus();

		  this._cleanMessages()

		}

		startCreateGroup( friendList ){

			$( '.group-menu' ).removeClass('group-edit').removeClass('group-view');
	    $( '.group-menu' ).addClass( 'visible' ).addClass( 'group-new' );
	    $( '.group-name-input input' ).val( '' );
	    $( '.search-members input' ).val( '' );

	    this._setGroupAvatar( '?' , $( '.group-avatar' ) );
	    $( '.memberDom' ).remove();

	    this._domGroupMemberList.empty().append( friendList.map( function( item ){

	    	item.dom = memberPrototype.clone().removeClass('wz-prototype')
			  item.dom.find( 'span' ).text( item.user.fullName );
			  item.dom.addClass( 'memberDom' );
			  item.dom.find( '.member-avatar' ).css( 'background-image' , 'url(' + item.user.avatar.big + ')' );
			  item.dom.attr( 'data-id', item.user.id )

		  	return item.dom 


	    }))

		}

		startsWith( wordToCompare, containterToCompare ){

		  return function( index , element ) {
		    return $( element ).find( containterToCompare ).text().toLowerCase().indexOf( wordToCompare.toLowerCase() ) !== -1;
		  }

		}

		updateContactsListUI( list ){

			list = list.sort( function( a, b ){

		    if( a.connected && b.connected ){
		      return a.user.fullName.localeCompare( b.user.fullName )
		    }

		    if( a.connected ){
		      return -1
		    }

		    return 1

		  })

		  this._domContactsList.empty().append( list.map( function( item ){ 

	  		item.dom = contactPrototype.clone().removeClass('wz-prototype')
	  		item.dom.addClass( 'user-id-' + item.user.id );
			  item.dom.find('.contact-name').text( item.user.fullName )
			  item.dom.find('.contact-img').css( 'background-image', 'url(' + item.user.avatar.big + ')' )
			  item.dom.attr( 'data-id', item.user.id )

		  	return item.dom

		  }) )

		}

  	updateConversationUI( conversation ){

  		var conversationDom = $( '.channel-id-' + conversation.context.id );
  		conversationDom.attr( 'data-id' , conversation.context.id );
		  conversationDom.find( '.channel-name' ).text( conversation.name );
		  conversationDom.find( '.channel-img' ).css( 'background-image' , 'url(' + conversation.img + ')' );
		  conversationDom.find( '.channel-last-msg' ).text( conversation.lastMessage ? conversation.lastMessage.data.text : '' );

  	}

  	updateConversationsListUI( list ){

		  list = list.sort( function( a, b ){

		  })

		  this._domConversationsList.empty().append( list.map( function( item ){ 

		  	item.dom = conversationPrototype.clone().removeClass('wz-prototype')
			  item.dom.addClass( 'channel-id-' + item.context.id );
		  	item.dom.attr( 'data-id', item.context.id )
			  item.dom.find('.channel-name').text( item.name );
			  item.dom.find('.channel-img').css( 'background-image' , 'url(' + item.img + ')' )
			  item.dom.find('.channel-last-msg').text( item.lastMessage ? item.lastMessage.data.text : '' )

		  	return item.dom 

		  }) )


  	}

  }

  class Contact{

  	constructor( app, user ){

  		this.dom = contactPrototype.clone().removeClass('wz-prototype')
  		this.dom.addClass( 'user-id-' + this.user.id );
		  this.dom.find('.contact-name').text( this.user.fullName )
		  this.dom.find('.contact-img').css( 'background-image', 'url(' + this.user.avatar.big + ')' )
		  this.dom.attr( 'data-id', this.user.id )

  	}

   	setConnection( value ){

		  if( !!value ){
		    this.dom.addClass('conected')
		  }else{
		    this.dom.removeClass('connected')
		  }

  	}

  }

  class Conversation{

  	constructor( app, context ){

  		this.dom = contactPrototype.clone().removeClass('wz-prototype')
  		this.dom.addClass( 'user-id-' + this.user.id );
		  this.dom.find('.contact-name').text( this.user.fullName )
		  this.dom.find('.contact-img').css( 'background-image', 'url(' + this.user.avatar.big + ')' )
		  this.dom.attr( 'data-id', this.user.id )

  	}

  }

  return new View()

})()

var model = ( function( view ){

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

  class Model{

  	constructor( view ){

  		this.view = view;
  	  this.openedChat
		  this.contacts = {}
		  this.conversations = {}
		  this._mainAreaMode
		  this._prevMainAreaMode = MAINAREA_NULL
  		this._sidebarMode

		  this.changeMainAreaMode( MAINAREA_NULL )
		  this.changeSidebarMode( SIDEBAR_NULL )
  		this.fullLoad();

  	}

  	_loadFullContactList( callback ){

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

  	};

  	_loadFullConversationsList( callback ){

		  callback = api.tool.secureCallback( callback )

		  api.com.list({ protocol : 'chat' }, function( err, contexts ){

		    // To Do -> Error
		    contexts.forEach( function( context ){
		      this.addConversation( context )
		    }.bind( this ))

		    callback( null, contexts )

		  }.bind( this ) )

		}

		_updateAllConversationsUI(){

		  for( var i in this.conversations ){
		    this.conversations[ i ].updateUI()
		  }

		}

		addConversation( context ){

		  if( this.conversations[ context.id ] ){
		    return this
		  }

		  this.conversations[ context.id ] = new Conversation( this, context )
		  this.updateConversationsListUI()
		  return this

		}

		addContact( user ){

		  if( this.contacts[ user.id ] ){
		    return this
		  }

		  this.contacts[ user.id ] = new Contact( this, user )
		  this.updateContactsListUI()
		  return this

		}

		appendMessage( message ){

			var senderName = null;
			var senderAvatar = null;

		  if( !this.openedChat || this.openedChat.context.id !== message.context ){
		    return
		  }

		  if( this.conversations[ message.context ].isGroup ){
		    senderName = this.contacts[ message.sender ].user.fullName
		  }

		  if( message.sender !== api.system.user().id ){
				senderAvatar = this.contacts[ message.sender ].user.avatar.big
			}

		  view.appendMessage( message, senderName, senderAvatar );

		}

		changeMainAreaMode( value, list ){

		  if( this._mainAreaMode === value ){
		    return
		  }

		  this._prevMainAreaMode = this._mainAreaMode
		  this._mainAreaMode = value

			view.changeMainAreaMode( value, list );

		}

		changeSidebarMode( value ){

		  if( this._sidebarMode === value ){
		    return
		  }

		  this._sidebarMode = value
		  view.changeSidebarMode( value )

		}

		ensureConversation( contextId, callback ){

		  if( this.conversations[ contextId ] ){
		    return callback()
		  }

		  api.com.get( contextId, function( err, event ){

		  	if( err ){
		  		return callback(err);
		  	}

		    this.addConversation( event )
		    callback();

		  }.bind(this))

		}

		filterElements( filter, groupSearch ){

		  if( groupSearch ){
		  	view.filterContacts( filter, groupSearch );
		  }else if( this._sidebarMode === SIDEBAR_CONVERSATIONS ){
		  	view.filterChats( filter )
		  }else if( this._sidebarMode === SIDEBAR_CONTACTS ){
		  	view.filterContacts( filter, false )
		  }

		}

		fullLoad(){

		  // To Do -> Remove timeout

		  async.parallel({

		    contacts : this._loadFullContactList.bind(this),
		    conversations : this._loadFullConversationsList.bind(this)

		  }, function( err, res ){

		    if( err ){
		    	return console.log( err );
		    }

		    if( this._sidebarMode !== SIDEBAR_NULL ){
		      return
		    }
		    if( res.conversations.length ){
		      this.changeSidebarMode( SIDEBAR_CONVERSATIONS )
		    }else if( res.contacts.contacts.length ){
		      this.changeSidebarMode( SIDEBAR_CONTACTS )
		    }else{
		      // To Do -> Show forever alone
		    }

		  }.bind(this))

		  return this;

		}

		handleMessage( message ){

			this.conversations[ message.context ].updateLastMessage( message )
      this.appendMessage( message )

		}

		hideGroupMenu(){
			view.hideGroupMenu();
		}

		openConversation( conversationId ){

			var conversation;
			if( typeof conversationId == 'number' ){
				conversation = this.conversations[ conversationId ];
			}else{
				conversation = conversationId;
			}
			
			var isConnected = this.contacts[ conversation.users[ 0 ] ] && this.contacts[ conversation.users[ 0 ] ].connected;

		  this.changeSidebarMode( SIDEBAR_CONVERSATIONS )

		  if( this.openedChat && conversation.context.id === this.openedChat.context.id ){
		    return this
		  }

		  if( this.openedChat ){
		    this.openedChat.setOpened( false )
		  }

		  this.openedChat = conversation.setOpened( true )

		  this.changeMainAreaMode( MAINAREA_CONVERSATION )

		  view.openConversation( conversation, isConnected );

		  conversation.context.getMessages( { withAttendedStatus : true }, function( err, list ){

		    // To Do -> Error
		    list.forEach( function( message ){
		      this.appendMessage( message )
		    }.bind(this))

		  }.bind(this))

		  return this

		}

		openConversationWithContact( contactId ){

			var contact = this.contacts[ contactId ];

		  var conversation;

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

		}

		saveGroup( info ){

			//Disable edit group
			if( this.openedChat ){
				return
			}

			if( info.name === '' ){
				return view.launchAlert( 'Wrong name' );
			}
			if( info.members.length === 0 ){
				return view.launchAlert( 'Wrong users' );
			}

			var list = []

		  info.members.each( function(){
		    list.push( $(this).attr('data-id') )
		  });
		  console.log( list );

		  info.members = list;

			new Conversation( this, null, info );

		}

		sendBuffer( value ){

			if( this.openedChat && value ){
				this.openedChat.sendBuffer( value );
			}

		}

		setContactConnection( id, connected ){

		  if( this.contacts[ id ] ){
		    this.contacts[ id ].setConnection( connected )
		  }

		  return this

		}

		startCreateGroup(){

			if( this._mainAreaMode === MAINAREA_GROUPMODE ){
				return;
			}

		  var list = []

		  for( var i in this.contacts ){
		    list.push( this.contacts[ i ] )
		  }

			this.changeMainAreaMode( MAINAREA_GROUPMODE, list );

			//view.startCreateGroup( list );

	    /*if( mobile ){

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

	    }*/

		}

		updateContactsListUI(){

		  var list = []

		  for( var i in this.contacts ){
		    list.push( this.contacts[ i ] )
		  }

		  this.view.updateContactsListUI( list );
		
		}

		updateConversationId( oldId, newId ){

		  this.conversations[ newId ] = this.conversations[ oldId ]
		  delete this.conversations[ oldId ]
		  this.updateConversationsListUI()

		  return this;

		}

		updateConversationsListUI(){

		  var list = []

		  for( var i in this.conversations ){
		    list.push( this.conversations[ i ] )
		  }

			this.view.updateConversationsListUI( list );

		}

		updateMessageAttendedUI( messageId, contextId ){

		  if( !this.openedChat || this.openedChat.context.id !== contextId ){
		    return
		  }

		  view.markMessageAsRead( messageId );

		}

  }

  class Contact{

  	constructor( app, user ){

  		this.app = app;
  		this.user = user;
  		this.connected = false;

  	}

  	setConnection( value ){

  		this.connected = !!value
		  this.app.updateContactsListUI()

		  return this;

  	}

  }

  class Conversation{

  	constructor( app, context, info ){

  		this.app = app;
		  this.context = context
		  this.world
		  this.lastMessage
		  this.opened = false

		  if( info ){

		  	this.isGroup = true;
		  	this.name = info.name || '';
		  	this.users = info.members || []

		  }else{

		  	this.isGroup = false // To Do
		  	this.name = '';
		  	this.users = []

		  }

		  this.img;

		  // Set UI
		  this._startConversation()

  	}

  	_loadAdditionalInfo(){

		  this.context.getUsers( { full : false }, function( err, list ){

		    this.users = api.tool.arrayDifference( list, [ api.system.user().id ] )
		    this.updateUI();

		  }.bind( this ))

		  this.context.getMessages( { withAttendedStatus : true }, function( err, list ){ // To Do -> Limit to the last one

		    this.updateLastMessage( list[ list.length - 1 ] );

		  }.bind( this ))

		}

		_startConversation(){


			if( this.context ){

				this.updateUI()
				this._loadAdditionalInfo();

			}else{

		    api.com.create( 
		    { 
		    	protocol : 'chat', 
		    	name: this.name, 
		    	users : this.users 
		    }, function( err, context ){

		    	if( err ){
		    		return view.launchAlert( err ); 
		    	}
		      // To Do -> Err
		      this.app.ensureConversation( context.id, function(){

		      	this.context = context
		      	this._loadAdditionalInfo();

		      }.bind(this))
		      

		    }.bind( this ))

			}

		}

		_upgradeToRealConversation( callback ){

			//Creating group
		  if( !( this.context instanceof FakeContext ) ){
		    return callback()
		  }

		  this.context.getUsers( function( err, users ){

		    api.com.create( { protocol : 'chat', users : users }, function( err, context ){

		      // To Do -> Err

		      var oldId = this.context.id

		      this.context = context
		      this.app.updateConversationId( oldId, context.id )
		      callback()

		    }.bind( this ))

		  }.bind( this ))

		}

		sendBuffer( value ){

		  if( !value ){
		    return
		  }

		  this._upgradeToRealConversation( function(){

		  	view.clearInput();
		    this.context.send( { data : { action : 'message', text : value }, persistency : true, notify : value }, function( err ){

		      // To Do -> Error
		      if( err ){
		      	return
		      }

		      //updateLastMessage( this)

		    })

		  }.bind( this ))

		  return this;

		}

		setOpened( value ){

		  this.opened = !!value
		  view.conversationSetOpened( this.context.id, this.opened );

		  return this;

		}

		updateLastMessage( message ){

		  this.lastMessage = message
		  view.updateConversationUI( this );

		}

		updateUI(){

		  var img

		  if( this.context.name ){
		    this.name = this.context.name
		  }else if( this.app.contacts[ this.users[ 0 ] ] ){
		    this.name = this.app.contacts[ this.users[ 0 ] ].user.fullName
		  }else{
		    // To Do -> lang.unknown
		  }

		  if( this.world ){
		    this.img = this.world.icon.big // To Do -> Mirar si es el tamaño adecuado
		  }else if( this.app.contacts[ this.users[ 0 ] ] ){
		    this.img = this.app.contacts[ this.users[ 0 ] ].user.avatar.big // To Do -> Mirar si es el tamaño adecuado
		  }else{
		    // To Do -> Unknown
		  }

		  //TODO llamar a la view
		  view.updateConversationUI( this );

		}

  }

  class FakeContext{

  	constructor( userId ){

		  this.id = --FakeContext.idCounter
		  this._users = [ userId ]

  	}

  	getUsers( options, callback ){

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

		};

		getMessages( options, callback ){

		  if( arguments.length === 1 ){
		    callback = options
		    options = {}
		  }

		  callback( null, [] )

		}

  }

  FakeContext.idCounter = 0

  return new Model( view )

})( view )

var controller = ( function( model, view ){

  class Controller{

    constructor( model, view ){

      this.dom = win
      this._domContactsList = $('.contact-list', this.dom)
      this._domConversationsList = $('.channel-list', this.dom)
      this._domMessageContainer = $('.message-container', this.dom)
      this._domMessageMePrototype = $('.message-me.wz-prototype', this._domMessageContainer)
      this._domMessageOtherPrototype = $('.message-other.wz-prototype', this._domMessageContainer)
      this._domCurrentConversation
      this.model = model;
      this.view = view;
      this._bindEvents();

    }

    _bindEvents(){

      // DOM Events
      this.dom.on( 'click', '.tab-selector', function(){

        //TODO revisar valores

        if( $(this).hasClass('chat-tab-selector') ){
          model.changeSidebarMode( SIDEBAR_CONVERSATIONS )
        }else if( $(this).hasClass('contact-tab-selector') ){
          model.changeSidebarMode( SIDEBAR_CONTACTS )
        }

      })

      this.dom.on( 'keypress', function( e ){

        if( e.which === 13 && !e.shiftKey && $.trim( this.dom.find('.conversation-input textarea').val() ) ){

          e.preventDefault();
          model.sendBuffer( $.trim( this.dom.find('.conversation-input textarea').val() ) );

        }

      }.bind( this ))

      this.dom.on( 'click', '.new-group-button', function(){
        model.startCreateGroup();
      })

      this.dom.on( 'click', '.group-menu .back, .cancel-group', function(){
        model.hideGroupMenu();
      })

      this.dom.on( 'click', '.memberDom', function(){

        $(this).toggleClass('active');
        $(this).find( '.ui-checkbox' ).toggleClass( 'active' );

      })

      this.dom.on( 'click', '.memberDom .ui-checkbox', function(e){

        $(this).toggleClass('active');
        $(this).parent().toggleClass( 'active' );
        e.stopPropagation();

      })

      this.dom.on( 'click', '.save-group, .accept-button', function(){
         
        var info = {

          name: $( '.group-name-input input' ).val(),
          members: $( '.memberDom.active' )

        }

        model.saveGroup( info );

      })

      this.dom.on( 'input', '.chat-search input', function(){
        model.filterElements( $( this ).val() )
      })

      this.dom.on( 'input', '.search-members input', function(){
        model.filterElements( $( this ).val() , true )
      })

      this._domContactsList.on( 'click', '.contact', function(){
        model.openConversationWithContact( parseInt( $(this).attr('data-id') ) )
      })

      this._domConversationsList.on( 'click', '.channel', function(){
        model.openConversation( parseInt( $(this).attr('data-id') ) )
      })

      // COM API Events
      api.com.on( 'message', function( event ){

        console.log( event )
        if( event.data.action === 'message' ){

          model.ensureConversation( event.context, function( err ){

            if( err ){
              return;
            }

            model.handleMessage( event );

          })

        }

      })

      api.com.on( 'messageMarkedAsAttended', function( comMessageId, comContextId, userId, notificationId ){
        model.updateMessageAttendedUI( comMessageId, comContextId )
      })

    }  

  }

  return new Controller( model, view );

})( model, view )