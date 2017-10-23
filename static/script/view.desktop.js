
var win = $(this);
// Static values
const MAINAREA_NULL = 0
const MAINAREA_CONVERSATION = 1
const SIDEBAR_NULL = 0
const SIDEBAR_CONVERSATIONS = 1
const SIDEBAR_CONTACTS = 2

var view = ( function(){

	var contactPrototype      = $( '.contact.wz-prototype' );
	var conversationPrototype = $( '.channel.wz-prototype' );

  class View{

  	constructor(){

  		//this.model = model;
  		this.dom = win;

  		this._domContactsList = $('.contact-list', this.dom)
		  this._domConversationsList = $('.channel-list', this.dom)
		  this._domMessageContainer = $('.message-container', this.dom)
		  this._domMessageMePrototype = $('.message-me.wz-prototype', this._domMessageContainer)
		  this._domMessageOtherPrototype = $('.message-other.wz-prototype', this._domMessageContainer)
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

		changeMainAreaMode( value ){

		  if( this._mainAreaMode === value ){
		    return
		  }

		  this._mainAreaMode = value

		  if( value === MAINAREA_NULL ){
		    $('.ui-content').removeClass('visible')
		    $('.no-content').addClass('visible')
		  }else if( value === MAINAREA_CONVERSATION ){
		    $('.ui-content').addClass('visible')
		    $('.no-content').removeClass('visible')
		  }

		}

  	changeSidebarMode( value ){

  		console.log( value );

		  this.dom.find( '.chat-footer > section' ).removeClass( 'active' )
		  this.dom.find( '.chat-body > section' ).removeClass( 'visible' )

		  if( value === SIDEBAR_CONVERSATIONS ){

		    this.dom.find( '.chat-footer .chat-tab-selector' ).addClass( 'active' )
		    this.dom.find( '.chat-body .chat-tab' ).addClass( 'visible' )

		  }else if( value === SIDEBAR_CONTACTS ){

		    this.dom.find( '.chat-footer .contact-tab-selector' ).addClass( 'active' )
		    this.dom.find( '.chat-body .contact-tab' ).addClass( 'visible' )

		  }

		}

		clearInput(){
			this.dom.find('.conversation-input textarea').val('')
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
