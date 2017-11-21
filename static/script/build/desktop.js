
var win = $(this)
// Static values
const MAINAREA_NULL = 0
const MAINAREA_CONVERSATION = 1
const MAINAREA_GROUPMODE = 2
const SIDEBAR_NULL = 0
const SIDEBAR_CONVERSATIONS = 1
const SIDEBAR_CONTACTS = 2
const GROUP_NULL = 0
const GROUP_CREATE = 1
const GROUP_EDIT = 2

var view = ( function(){

	var contactPrototype      = $( '.contact.wz-prototype' )
	var conversationPrototype = $( '.channel.wz-prototype' )
	var memberPrototype      	= $( '.member.wz-prototype' )

	const COLORS = [ '#4fb0c6' , '#d09e88' , '#fab1ce' , '#4698e0' , '#e85c5c', '#ebab10', '#5cab7d' , '#a593e0', '#fc913a' , '#58c9b9' ]
	const colorPalette = [
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
	]

  class View{

  	constructor(){

  		//this.model = model
  		this.dom = win

  		this._domContactsList = $('.contact-list', this.dom)
		  this._domConversationsList = $('.channel-list', this.dom)
		  this._domMessageContainer = $('.message-container', this.dom)
		  this._domMessageMePrototype = $('.message-me.wz-prototype', this._domMessageContainer)
		  this._domMessageOtherPrototype = $('.message-other.wz-prototype', this._domMessageContainer)
		  this._domGroupMemberList = $( '.member-list', this.dom )
		  this._domCurrentConversation

  		this._translateInterface()
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

		  var id = 0

		  for( var i = 0; i < string.length; i++ ){

		    id += string.charCodeAt(i)
		    id++

		  }
		  return id = id%colorPalette.length

		}

		_setGroupAvatar( groupName , avatar ){

		  var expNameWords = groupName.split(' ')

		  avatar.html( '<span>' + (expNameWords[0] || ' ')[0].toUpperCase() + (expNameWords[1] || ' ')[0].toUpperCase() + '</span>')

		  var colorId = this._selectColor( groupName )

		  avatar.addClass('group').css({
		    'background-image'  : 'none',
		    'background-color'  : colorPalette[colorId].light,
		    'border-color'      : colorPalette[colorId].border,
		    'border-style'      : 'solid'
		  })
		  avatar.find( 'span' ).css('color', colorPalette[colorId].text)

		}

  	_translateInterface(){

		  $( '.addPeople span' , this.dom ).text( lang.addPeople )
		  $( '.app-color .dark' , this.dom ).text( lang.dark )
		  $( '.app-color .white' , this.dom ).text( lang.white )
		  $( '.cancel-group span' , this.dom ).text( lang.cancel )
		  $( '.chat-search input' , this.dom ).attr( 'placeholder' , lang.search )
		  $( '.chat-tab-selector span' , this.dom ).text( lang.chats )
		  $( '.click-chat-txt' , this.dom ).text( lang.clickChat )
		  $( '.close-coversation' , this.dom ).text( lang.close )
		  $( '.contact-tab-selector span' , this.dom ).text( lang.contacts )
		  $( '.conversation-input textarea' , this.dom ).attr( 'placeholder' , lang.msg )
		  $( '.group-info .title' , this.dom ).text( lang.info )
		  $( '.group-members .title' , this.dom ).text( lang.members )
		  $( '.group-members input' , this.dom ).attr( 'placeholder' , lang.searchContacts )
		  $( '.group-menu .back span' , this.dom ).text( lang.back )
		  $( '.group-menu .edit' , this.dom ).text( lang.edit )
		  $( '.group-name' , this.dom ).text( lang.groupName )
		  $( '.group-name-input input' , this.dom ).attr( 'placeholder' , lang.groupName )
		  $( '.groupName' , this.dom ).text( lang.nameGroup )
		  $( '.invite .add' , this.dom ).text( lang.invite.add )
		  $( '.invite .next' , this.dom ).text( lang.invite.send )
		  $( '.invite h1' , this.dom ).text( lang.invite.title )
		  $( '.invite h2' , this.dom ).html( lang.invite.subtitle )
		  $( '.invite h3' , this.dom ).text( lang.invite.email )
		  $( '.new-group-button span' , this.dom ).text( lang.newGroup )
		  $( '.no-chat-txt' , this.dom ).text( lang.noChat )
		  $( '.save-group span' , this.dom ).text( lang.save )
		  $( '.send-txt' , this.dom ).text( lang.send )

  	}

  	appendMessage( message, senderName, senderAvatar ){

  		var dom = ( message.sender === api.system.user().id ? this._domMessageMePrototype : this._domMessageOtherPrototype ).clone().removeClass('wz-prototype').data( 'message', message )
		  var date = new Date( message.time )
		  var hh = ( '0' + date.getHours().toString() ).slice(-2)
		  var mm = ( '0' + date.getMinutes().toString() ).slice(-2)
		  var text = message.data.text

		  text = text.replace( /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&%@.\w_]*)#?(?:[\w]*))?)/ , '<a href="$1" target="_blank">$1</a>')
		  //textProcessed = text.replace( /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/ , '<a href="$1" target="_blank">$1</a>' )
		  //textProcessed = text.replace( /((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/ig, '<a href="$1" target="_blank">$1</a>' )
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
		    dom.addClass( 'sender-group' ).find('.sender').addClass( 'visible' ).text( senderName ).css( 'color' , COLORS[ this._selectColor( senderName ) ] )
		  }

		  if( message.sender !== api.system.user().id ){
		    dom.find( '.message-avatar' ).css( 'background-image' , 'url(' + senderAvatar + ')' )
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

		changeMainAreaMode( value, additionalData, conversation ){

		  if( value === MAINAREA_NULL ){

		    $('.ui-content').removeClass('visible')
		    $('.no-content').addClass('visible')
		    this.hideGroupMenu()

		  }else if( value === MAINAREA_CONVERSATION ){

		    $('.ui-content').addClass('visible')
		    $('.no-content').removeClass('visible')
		    this.hideGroupMenu()

		  }else if( value === MAINAREA_GROUPMODE && additionalData && additionalData.length ){
		 		this.startCreateGroup( additionalData, conversation )
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

	    var chats = $( '.channel' )
	    var containerToCompare = '.channel-name'
	    chats.show()
	    var chatsToShow = chats.filter( this.startsWith( filter, containerToCompare ) )
	    var chatsToHide = chats.not( chatsToShow )
	    chatsToHide.hide()

		}

		filterContacts( filter, groupFilter ){

			var contacts
			var containerToCompare

			if( groupFilter ){

				contacts = $( '.memberDom' )
				containerToCompare = 'span'

			}else{

				contacts = $( '.contact' )
				containerToCompare = '.contact-name'

			}

	    contacts.show()
	    var contactsToShow = contacts.filter( this.startsWith( filter, containerToCompare ) )
	    var contactsToHide = contacts.not( contactsToShow )
	    contactsToHide.hide()

		}

		hideGroupMenu(){

			$( '.group-menu' ).removeClass( 'visible' )

		}

		launchAlert( message ){

			console.error( message )
			alert( message )

		}

		markMessageAsRead( messageId ){
			this._domMessageContainer.find( '.message-' + messageId ).addClass('readed')
		}

		openConversation( conversation, isConnected ){

			this.updateConversationInfo( conversation, isConnected )
		  this._cleanMessages()

		}

		startCreateGroup( friendList, conversation ){

			if( conversation ){

			  $( '.group-menu' ).removeClass( 'group-view' ).removeClass( 'group-new' ).addClass( 'group-edit' )
			  $( '.group-edit' ).addClass( 'visible' )
			  $( '.group-name editMode' ).text( lang.nameGroup )
			  $( '.group-name-input input' ).val( conversation.name )
			  this._setGroupAvatar( conversation.name , $( '.group-avatar' ) )

			}else{

				$( '.group-menu' ).removeClass('group-edit').removeClass('group-view')
		    $( '.group-menu' ).addClass( 'visible' ).addClass( 'group-new' )
		    $( '.group-name-input input' ).val( '' )
		    this._setGroupAvatar( '?' , $( '.group-avatar' ) )

			}
	    
	    $( '.memberDom' ).remove()
	    $( '.group-menu .ui-input-search input' ).val('')

	    this._domGroupMemberList.empty().append( friendList.map( function( item ){

	    	item.dom = memberPrototype.clone().removeClass('wz-prototype')
			  item.dom.find( 'span' ).text( item.user.fullName )
			  item.dom.addClass( 'memberDom' )
			  item.dom.find( '.member-avatar' ).css( 'background-image' , 'url(' + item.user.avatar.big + ')' )
			  item.dom.attr( 'data-id', item.user.id )

			  if( conversation && conversation.users && (conversation.users.indexOf( item.user.id ) != -1) ){

			  	item.dom.addClass( 'active' )
			  	item.dom.find('.ui-checkbox').addClass( 'active' )

			  }

		  	return item.dom 

	    }))

		}

		startsWith( wordToCompare, containterToCompare ){

		  return function( index , element ) {
		    return $( element ).find( containterToCompare ).text().toLowerCase().indexOf( wordToCompare.toLowerCase() ) !== -1
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

	  		if( item.connected ){
	  			item.dom.addClass( 'conected' )
	  		}

	  		item.dom.addClass( 'user-id-' + item.user.id )
			  item.dom.find('.contact-name').text( item.user.fullName )
			  item.dom.find('.contact-img').css( 'background-image', 'url(' + item.user.avatar.big + ')' )
			  item.dom.attr( 'data-id', item.user.id )

		  	return item.dom

		  }) )

		}

		updateConversationInfo( conversation, isConnected ){

    	$('.conversation-name, .conver-header .conver-title').text( conversation.name )

		  if( conversation.isGroup ){

		  	$('.conversation-info').addClass('isGroup')
		  	var membersText = conversation.users.length === 0 ? (conversation.users.length + 1 + ' ' + lang.member) : (conversation.users.length + 1 + ' ' + lang.members)
		    $('.conversation-moreinfo, .conver-moreinfo').removeClass('conected').text( membersText )

		  }else if( isConnected ) {

		  	$('.conversation-info').removeClass('isGroup')
		    $('.conversation-moreinfo, .conver-moreinfo').addClass('conected').text( lang.conected )

		  }else{

		  	$('.conversation-info').removeClass('isGroup')
		    $('.conversation-moreinfo, .conver-moreinfo').removeClass('conected').text( lang.disconected )

		  }

		  $( '.conversation-input textarea' ).val('').focus()


		}

  	updateConversationUI( conversation ){

  		var conversationDom = $( '.channel-id-' + conversation.context.id )
  		conversationDom.attr( 'data-id' , conversation.context.id )
		  conversationDom.find( '.channel-name' ).text( conversation.name )

		  if( conversation.isGroup ){
		  	this._setGroupAvatar( conversation.name, conversationDom.find( '.channel-img' ) )
		  }else{
		  	conversationDom.find( '.channel-img' ).css( 'background-image' , 'url(' + conversation.img + ')' )
		  }
		  
		  conversationDom.find( '.channel-last-msg' ).text( conversation.lastMessage ? conversation.lastMessage.data.text : '' )

		  if( conversation.unread > 0 ) {
        conversationDom.find( '.channel-badge' ).addClass('visible').find('span').text( conversation.unread )
      }else{
        conversationDom.find( '.channel-badge' ).removeClass('visible').find('span').text( '' )
      }

  	}

  	updateConversationsListUI( list, id ){

		  list = list.sort( function( a, b ){
		  	
		  	var dateA = a.lastMessage ? a.lastMessage.time : a.context.created
		  	var dateB = b.lastMessage ? b.lastMessage.time : b.context.created

		  	if( dateA && dateB ){

		  		return dateB - dateA
		  		
		  	}
		  	
		  })

		  this._domConversationsList.empty().append( list.map( function( item ){ 

		  	item.dom = conversationPrototype.clone().removeClass('wz-prototype')
			  item.dom.addClass( 'channel-id-' + item.context.id )
		  	item.dom.attr( 'data-id', item.context.id )
			  item.dom.find('.channel-name').text( item.name )

			  if( item.context.id == id ){
			  	item.dom.addClass('active')
			  }

			  if( item.isGroup ){

			  	this._setGroupAvatar( item.name, item.dom.find( '.channel-img' ) )
			  	item.dom.addClass( 'isGroup' )

			  }else{
			  	item.dom.find('.channel-img').css( 'background-image' , 'url(' + item.img + ')' )
			  }

			  if( item.unread > 0 ) {
	        item.dom.find( '.channel-badge' ).addClass('visible').find('span').text( item.unread )
	      }else{
	        item.dom.find( '.channel-badge' ).removeClass('visible').find('span').text( '' )
	      }

			  
			  item.dom.find('.channel-last-msg').text( item.lastMessage ? item.lastMessage.data.text : '' )

		  	return item.dom 

		  }.bind( this ) ))

		  if( id ){
		  	this.changeSidebarMode( SIDEBAR_CONVERSATIONS )
		  	$( '.channel-id-' + id ).trigger( 'click' )
		  }

  	}

  }

  return new View()

})()

var model = ( function( view ){

	var async = {

	  each : function( list, step, callback ){

	    var position = 0
	    var closed   = false
	    var checkEnd = function( error ){

	      if( closed ){
	        return
	      }

	      position++

	      if( position === list.length || error ){

	        closed = true

	        callback( error )

	        // Nullify
	        list = step = callback = position = checkEnd = closed = null

	      }

	    }

	    if( !list.length ){
	      return callback()
	    }

	    list.forEach( function( item ){
	      step( item, checkEnd )
	    })

	  },

	  parallel : function( fns, callback ){

	    var list     = Object.keys( fns )
	    var position = 0
	    var closed   = false
	    var res      = {}
	    var checkEnd = function( i, error, value ){

	      if( closed ){
	        return
	      }

	      res[ i ] = value
	      position++

	      if( position === list.length || error ){

	        closed = true

	        callback( error, res )

	        // Nullify
	        list = callback = position = checkEnd = closed = null

	      }

	    }

	    if( !list.length ){
	      return callback()
	    }

	    list.forEach( function( fn ){
	      fns[ fn ]( checkEnd.bind( null, fn ) )
	    })

	  }

	}

  class Model{

  	constructor( view ){

  		this.view = view
  	  this.openedChat
		  this.contacts = {}
		  this.conversations = {}
		  this._mainAreaMode
		  this._prevMainAreaMode = MAINAREA_NULL
  		this._sidebarMode
  		this._groupMode = GROUP_NULL

  		this.unread

		  this.changeMainAreaMode( MAINAREA_NULL )
		  this.changeSidebarMode( SIDEBAR_NULL )
		  this.reloadUnread()
  		this.fullLoad()

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

  	}

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

		  //Si me añaden a una conversacion y no tenia ninguna
		  if( Object.keys( this.conversations ).length == 1 && ( this._sidebarMode == SIDEBAR_CONTACTS || this._sidebarMode == SIDEBAR_NULL ) ){
		  	this.changeSidebarMode( SIDEBAR_CONVERSATIONS )
		  }

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

			var senderName = null
			var senderAvatar = null
			//console.log( message );

		  if( !this.openedChat || this.openedChat.context.id !== message.context ){
		    return
		  }

		  if( message.sender !== api.system.user().id ){

				senderAvatar = this.contacts[ message.sender ].user.avatar.big

				if( this.conversations[ message.context ].isGroup ){
		    	senderName = this.contacts[ message.sender ].user.fullName
		  	}

		  	
		  	if( message.attended.length === 0 || message.attended.indexOf( api.system.user().id ) === -1 ){
					message.markAsAttended( { full: true }, console.log.bind( console ) )
		  	}

			}else{
				senderName = api.system.user().fullName
			}

		  view.appendMessage( message, senderName, senderAvatar )

		}

		changeMainAreaMode( value, list, conversation ){

		  if( this._mainAreaMode === value ){
		    return
		  }

		  this._prevMainAreaMode = this._mainAreaMode
		  this._mainAreaMode = value

			view.changeMainAreaMode( value, list, conversation )

		}

		changeSidebarMode( value ){

		  if( this._sidebarMode === value ){
		    return
		  }

		  this._sidebarMode = value
		  view.changeSidebarMode( value )

		}

		changeGroupMode( value ){

			if( this._groupMode === value ){
		    return
		  }

		  this._groupMode = value

		}

		deleteConversationFront( conversationId ){

			if( this.openedChat && conversationId === this.openedChat.context.id ){
				this.changeMainAreaMode( MAINAREA_NULL )
			}

			delete this.conversations[ conversationId ]
			this.updateConversationsListUI()

		}

		deleteConversationApi( conversationId ){

			this.conversations[ conversationId ].context.remove( function( err ){

				if( err ){
					return view.launchAlert( err )
				}

			})

		}

		editGroup( conversationId ){

		  var list = []

		  for( var i in this.contacts ){
		    list.push( this.contacts[ i ] )
		  }

			if( conversationId ){

				if( this.conversations[ conversationId ] && this.conversations[ conversationId ].isGroup 
					&& this.conversations[ conversationId ].admins && this.conversations[ conversationId ].admins.indexOf( api.system.user().id ) !== -1 ){

					this.changeMainAreaMode( MAINAREA_GROUPMODE, list, this.conversations[ conversationId ] )
					this.changeGroupMode( GROUP_EDIT )

				}

			}else{

				this.changeMainAreaMode( MAINAREA_GROUPMODE, list )
				this.changeGroupMode( GROUP_CREATE )

			}

			//view.startCreateGroup( list )

	    /*if( mobile ){

	      prevMode = mode
	      mode = MODE_ANIMATING
	      $('.group-menu').transition({
	        'x' : 0
	      }, animationDuration, animationEffect, function(){
	        mode = MODE_CREATING_GROUP
	      })
	      $('.initial-header .new-group').removeClass('visible')
	      $('.initial-header .back-button').addClass('visible')
	      //$('.initial-header .more-button').hide()
	      $('.initial-header .accept-button').show()

	    }*/

		}

		ensureConversation( contextId, callback ){

			callback = api.tool.secureCallback( callback )

		  if( this.conversations[ contextId ] ){
		    return callback()
		  }

		  api.com.get( contextId, function( err, event ){

		  	if( err ){
		  		return callback(err)
		  	}

		    this.addConversation( event )
		    callback()

		  }.bind(this))

		}

		leaveConversation( groupId ){

			if( !this.conversations[ groupId ] ){
				return view.launchAlert( 'Grupo no existe' )
			}

			this.conversations[ groupId ].context.removeUser( api.system.user().id, function( err ){

				if( err ){
					return view.launchAlert( err )
				}

			})

		}

		filterElements( filter, groupSearch ){

		  if( groupSearch ){
		  	view.filterContacts( filter, groupSearch )
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
		    	return console.log( err )
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

		  return this

		}

		handleMessage( message ){

			this.conversations[ message.context ].updateLastMessage( message )
      this.appendMessage( message )

		}

		hideGroupMenu(){

			this.changeGroupMode( GROUP_NULL )
			this.changeMainAreaMode( this._prevMainAreaMode )
			view.hideGroupMenu()

		}

		openConversation( conversationId ){

			var conversation
			if( typeof conversationId == 'number' ){
				conversation = this.conversations[ conversationId ]
			}else{
				conversation = conversationId
			}
			console.log(conversation)

			var isConnected = this.contacts[ conversation.users[ 0 ] ] && this.contacts[ conversation.users[ 0 ] ].connected

		  this.changeSidebarMode( SIDEBAR_CONVERSATIONS )

		  if( this.openedChat && conversation.context.id === this.openedChat.context.id ){
		    return this
		  }

		  if( this.openedChat ){
		    this.openedChat.setOpened( false )
		  }

		  this.openedChat = conversation.setOpened( true )

		  this.changeMainAreaMode( MAINAREA_CONVERSATION )

		  view.openConversation( conversation, isConnected )
		  //TODO mirar como atender conversacion

		  api.notification.markAsAttended( 'chat', { comContext : conversation.context.id, full: true }, function( err ){

		  	if( err ){
		  		view.launchAlert( err )
		  	}

			})

	  	conversation.context.getMessages( { withAttendedStatus : true }, function( err, list ){

		    // To Do -> Error
		    list.forEach( function( message ){
		      this.appendMessage( message )
		    }.bind(this))

		  }.bind(this))

		  return this

		}

		openConversationWithContact( contactId ){

			var contact = this.contacts[ contactId ]

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

		}

		reloadUnread(){

			api.notification.count( 'chat', {}, function( err, counter ){

		  	if( err ){
		  		return
		  	}

		  	this.unread = counter

		  }.bind( this ))

		}

		saveGroup( info ){

			if( info.name === '' ){
				return view.launchAlert( 'Wrong name' )
			}

			var list = []

		  info.members.each( function(){
		    list.push( parseInt( $(this).attr('data-id') ) )
		  })

		  info.members = list

		  if( this._groupMode == GROUP_EDIT && info.conversationId ){

				if( this.conversations[ info.conversationId ] ){
					this.conversations[ info.conversationId ].editConversation( info )
				}		  	

		  }else if( this._groupMode == GROUP_CREATE ){
		  	new Conversation( this, null, info )
		  }

		}

		sendBuffer( value ){

			if( this.openedChat && value ){
				this.openedChat.sendBuffer( value )
			}

		}

		setContactConnection( id, connected ){

		  if( this.contacts[ id ] ){
		    this.contacts[ id ].setConnection( connected )
		  }

		  return this

		}

		updateContactsListUI(){

		  var list = []

		  for( var i in this.contacts ){
		    list.push( this.contacts[ i ] )
		  }

		  this.view.updateContactsListUI( list )
		
		}

		updateConversationId( oldId, newId ){

		  this.conversations[ newId ] = this.conversations[ oldId ]
		  delete this.conversations[ oldId ]
		  this.updateConversationsListUI()

		  return this

		}

		updateConversationInfo( conversationId ){

			if( this.conversations[ conversationId ] ){
				this.conversations[ conversationId ]._loadAdditionalInfo()
			}

		}

		updateConversationUnread( conversationId ){

			var converId = parseInt(conversationId)

			if( this.conversations[ converId ] ){
				this.conversations[ converId ]._loadUnread()
			}

		}

		updateConversationsListUI(){

		  var list = []
		  var id = null

		  for( var i in this.conversations ){
		    list.push( this.conversations[ i ] )
		  }

		  if( this.openedChat && this.openedChat.context.id ){
		  	id = this.openedChat.context.id
		  }

			this.view.updateConversationsListUI( list, id )

		}

		updateMessageAttendedUI( messageId, contextId ){

		  if( !this.openedChat || this.openedChat.context.id !== contextId ){
		    return
		  }

		  view.markMessageAsRead( messageId )

		}

  }

  class Contact{

  	constructor( app, user ){

  		this.app = app
  		this.user = user
  		this.connected = false

  	}

  	setConnection( value ){

  		this.connected = !!value
		  this.app.updateContactsListUI()

		  return this

  	}

  }

  class Conversation{

  	constructor( app, context, info ){

  		this.app = app
		  this.context = context
		  this.world
		  this.lastMessage
		  this.opened = false
		  this.admins = [];

		  if( info ){

		  	this.isGroup = true
		  	this.name = info.name || ''
		  	this.users = info.members || []

		  }else{

		  	this.isGroup = false // To Do
		  	this.name = ''
		  	this.users = []

		  }

		  this.img
		  this.unread

		  this._startConversation()

  	}

  	_loadAdditionalInfo(){

  		this._loadUsers()
  		this._loadLastMessage()
  		this._loadUnread()

		}

  	_loadLastMessage(){

		  this.context.getMessages( { withAttendedStatus : true, limit : 1, order : 'newFirst' }, function( err, list ){ // To Do -> Limit to the last one

		  	if( err ){
		  		return this.app.view.launchAlert( err )
		  	}
		    this.updateLastMessage( list[0] )

		  }.bind( this ))

  	}

  	_loadUnread(){

  		api.notification.count( 'chat', { comContext : this.context.id }, function( err, counter ){

		  	if( err ){
		  		return this.app.view.launchAlert( err )
		  	}
		  	this.unread = counter
		  	this.updateUI()

		  }.bind( this ))

  	}

   	_loadUsers(){

  		this.context.getUsers( { full : false }, function( err, list, admins ){

		  	if( err ){
		  		return this.app.view.launchAlert( err )
		  	}

		  	console.log( list, admins )
		    this.users = api.tool.arrayDifference( list, [ api.system.user().id ] )
		    this.admins = admins;
		    this.updateUI()

		  }.bind( this ))

  	}

		_startConversation(){


			if( this.context ){

				this._loadAdditionalInfo()
				this.updateUI()

			}else{

		    api.com.create( 
		    { 
		    	protocol : 'chat', 
		    	name: this.name, 
		    	users : this.users 
		    }, function( err, context ){

		    	if( err ){
		    		return view.launchAlert( err ) 
		    	}

		    	this.app.conversations[ context.id ] = this
	      	this.context = context
	      	this.app.hideGroupMenu()
	      	this.app.updateConversationsListUI() 
	      	this._loadAdditionalInfo()
	      	this.app.openConversation( context.id )

		    }.bind( this ))

			}

		}

		_upgradeToRealConversation( callback ){

			callback = api.tool.secureCallback( callback )
			
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

		editConversation( info ){

			this.name = info.name

			//TODO cambiarMiembros
			var toDelete = []
	    var toAdd = []
	    console.log( this.users, info.members )

	    for( var i = 0; i < info.members.length; i++ ){

	    	var index = this.users.indexOf( info.members[i] )

	      if( index == -1 ){
	        toAdd.push( info.members[i] )
	      }

	    }

	    for( var i = 0; i < this.users.length; i++ ){

	    	var index = info.members.indexOf( this.users[i] )

	    	if( index == -1 ){
	        toDelete.push( this.users[i] )
	      }

	    }

	   	this.context.addUser( toAdd, function( err, res ){
	   		console.log( err )
	   	})

	   	this.context.removeUser( toDelete, function( err, res ){
	   		console.log( err )
	   	})
			console.log( toAdd, toDelete )
			this.app.hideGroupMenu()

		}

		sendBuffer( value ){

		  if( !value ){
		    return
		  }

		  this._upgradeToRealConversation( function(){

		  	view.clearInput()
		    this.context.send( { data : { action : 'message', text : value }, persistency : true, notify : value }, function( err ){

		      // To Do -> Error
		      if( err ){
		      	return view.launchAlert( err )
		      }

		    })

		  }.bind( this ))

		  return this

		}

		setOpened( value ){

		  this.opened = !!value
		  view.conversationSetOpened( this.context.id, this.opened )

		  return this

		}

		updateLastMessage( message ){

		  this.lastMessage = message
		  //view.updateConversationUI( this )
		  this.app.updateConversationsListUI()

		}

		updateUI(){

		  var img

		  if( this.context.name ){

		    this.name = this.context.name
		    this.isGroup = true

		  }else if( this.app.contacts[ this.users[ 0 ] ] ){
		    this.name = this.app.contacts[ this.users[ 0 ] ].user.fullName
		  }else{
		    // To Do -> lang.unknown
		  }

		  if( this.world ){
		    this.img = this.world.icon.big // To Do -> Mirar si es el tamaño adecuado
		  }else if( this.isGroup ){
		  	this.img = ''
		  }else if( this.app.contacts[ this.users[ 0 ] ] ){
		    this.img = this.app.contacts[ this.users[ 0 ] ].user.avatar.big // To Do -> Mirar si es el tamaño adecuado
		  }

		  //TODO llamar a la view
		  view.updateConversationUI( this )

		  //Si la conversación esta abierta, tambien actualizamos su informacion en pantalla
		  if( this.app.openedChat && this.app.openedChat.context.id === this.context.id ){

				var isConnected = this.app.contacts[ this.users[ 0 ] ] && this.app.contacts[ this.users[ 0 ] ].connected
		  	view.updateConversationInfo( this, isConnected )

		  }

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

		}

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
      this.model = model
      this.view = view
      this._bindEvents()

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

      this.dom.on( 'click', '.new-group-button', function(){
        model.editGroup( null )
      })

      this.dom.on( 'click', '.conversation-info.isGroup', function(){
        model.editGroup( parseInt( $('.channel.active').attr( 'data-id' ) ) )
      })

      this.dom.on( 'click', '.group-menu .back, .cancel-group', function(){
        model.hideGroupMenu()
      })

      this.dom.on( 'click', '.memberDom', function(){

        $(this).toggleClass('active')
        $(this).find( '.ui-checkbox' ).toggleClass( 'active' )

      })

      this.dom.on( 'click', '.memberDom .ui-checkbox', function(e){

        $(this).toggleClass('active')
        $(this).parent().toggleClass( 'active' )
        e.stopPropagation()

      })

      this.dom.on( 'contextmenu', '.channel', function(){

        var menu = api.menu()
        var id = $( this ).attr( 'data-id' )

        menu.addOption( lang.deleteChat , function(){
          model.deleteConversationApi( id )
        })

        if( $( this ).hasClass( 'isGroup' ) ){

          menu.addOption( lang.exitGroup , function(){
            model.leaveConversation( id )
          })

        }

        menu.render()

      })

      this.dom.on( 'click', '.save-group, .accept-button', function(){
         
        var info = {

          name: $( '.group-name-input input' ).val(),
          members: $( '.memberDom.active' ),
          conversationId: parseInt( $( '.channel-list .channel.active' ).attr('data-id') )

        }

        model.saveGroup( info )

      })

      this.dom.on( 'keypress', function( e ){

        if( e.which === 13 && !e.shiftKey && $.trim( this.dom.find('.conversation-input textarea').val() ) ){

          e.preventDefault()
          model.sendBuffer( $.trim( this.dom.find('.conversation-input textarea').val() ) )

        }

      }.bind( this ))

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
              return view.launchAlert( err )
            }

            model.handleMessage( event )

          })

        }

      })

      api.com.on( 'messageMarkedAsAttended', function( comMessageId, comContextId, userId, notificationId ){
        model.updateMessageAttendedUI( comMessageId, comContextId )
      })

      api.com.on( 'userAdded', function( conversationId, user ){

        console.log( 'userAdded', conversationId, user )
        if( user.id == api.system.user().id ){
          model.ensureConversation( conversationId )
        }else{
          model.updateConversationInfo( conversationId )
        }

      })

      api.com.on( 'userRemoved', function( conversationId, userId ){

        console.log( 'userRemoved', conversationId, userId )
        if( userId === api.system.user().id ){
          model.deleteConversationFront( conversationId )
        }else{
          model.updateConversationInfo( conversationId )
        }

      })

      api.com.on( 'contextRemoved', function( conversationId ){

        console.log( 'contextRemoved', conversationId )
        model.deleteConversationFront( conversationId )

      })

      api.notification.on( 'new', function( notification ){
        model.updateConversationUnread( notification.comContext )
      })

      api.notification.on( 'attended', function( list ){

        list.forEach( function( element ){

          if( element.comContext ){
            model.updateConversationUnread( parseInt( element.comContext ) )
          }

        })

      })

    }  

  }

  return new Controller( model, view )

})( model, view )