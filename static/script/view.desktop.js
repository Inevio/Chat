
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

  		this._domContactsList = $( '.contact-list', this.dom)
		  this._domConversationsList = $( '.channel-list', this.dom)
		  this._domMessageContainer = $( '.message-container', this.dom)
		  this._domMessageMePrototype = $( '.message-me.wz-prototype', this._domMessageContainer)
		  this._domMessageOtherPrototype = $( '.message-other.wz-prototype', this._domMessageContainer)
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
		  return this._domMessageContainer[ 0 ].scrollHeight - this._domMessageContainer[ 0 ].scrollTop - this._domMessageContainer[ 0 ].clientHeight < 15
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

		  var expNameWords = groupName.split( ' ' )

		  avatar.html( '<span>' + (expNameWords[0] || ' ' )[0].toUpperCase() + (expNameWords[1] || ' ' )[0].toUpperCase() + '</span>' )

		  var colorId = this._selectColor( groupName )

		  avatar.addClass( 'group' ).css({
		    'background-image'  : 'none',
		    'background-color'  : colorPalette[colorId].light,
		    'border-color'      : colorPalette[colorId].border,
		    'border-style'      : 'solid'
		  })
		  avatar.find( 'span' ).css( 'color', colorPalette[colorId].text)

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

  	appendMessage( message, loadingList ){

  		var dom = ( message.sender === api.system.user().id ? this._domMessageMePrototype : this._domMessageOtherPrototype ).clone().removeClass( 'wz-prototype' ).data( 'message', message )
		  var date = new Date( message.time )
		  var hh = ( '0' + date.getHours().toString() ).slice(-2)
		  var mm = ( '0' + date.getMinutes().toString() ).slice(-2)
		  var text = message.data.text

		  text = text.replace( /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&%@.\w_]*)#?(?:[\w]*))?)/ , '<a href="$1" target="_blank">$1</a>' )
		  //textProcessed = text.replace( /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/ , '<a href="$1" target="_blank">$1</a>' )
		  //textProcessed = text.replace( /((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/ig, '<a href="$1" target="_blank">$1</a>' )
		  text = text.replace(/\n/g, "<br />")
		  text = $( '<div/>' ).html( text )

		  text.find( 'a' ).each( function(){

		    if( !(/^http(s)?:\/\//i).test( $(this).attr( 'href' ) ) ){
		      $(this).attr( 'href', 'http://' + $(this).attr( 'href' ) ).addClass( 'wz-selectable' )
		    }

		  })

		  text = text.html()

		  dom.find( '.message-text' ).html( text )
		  dom.find( '.message-time' ).text( hh + ':' + mm )

		  if( message.senderName ){
		    //dom.addClass( 'sender-group' ).find( '.sender' ).addClass( 'visible' ).text( senderName ).css( 'color' , COLORS[ this._selectColor( senderName ) ] )
		    dom.find( '.sender' ).addClass( 'visible' ).text( message.senderName ).css( 'color' , COLORS[ this._selectColor( message.senderName ) ] )
		  }

		  if( message.sender !== api.system.user().id ){
		    dom.find( '.message-avatar' ).css( 'background-image' , 'url( ' + message.senderAvatar + ' )' )
		  }

		  if( message.attended.length ){
		    dom.addClass( 'readed' )
		  }

		  dom.addClass( 'message-' + message.id )
		  dom.addClass( 'sender-' + message.sender );
		  
		  if( loadingList ){

				return dom;

		  }else{

		  	var down = this._isScrolledToBottom()
			  this._domMessageContainer.append( dom )

			  if( down ){
			    this._domMessageContainer.scrollTop( this._domMessageContainer[ 0 ].scrollHeight )
			  }
		  	
		  }


  	}

  	appendMessageList( list ){

  		var domList = []

  		list.forEach( function( message ){
		    domList.push( this.appendMessage( message, true ) )
	    }.bind(this) )

  		this._domMessageContainer.append( domList )
  		this._domMessageContainer.scrollTop( this._domMessageContainer[ 0 ].scrollHeight )

  	}

		changeMainAreaMode( value, additionalData, conversation ){

		  if( value === MAINAREA_NULL ){

		    $( '.ui-content' ).removeClass( 'visible' )
		    $( '.no-content' ).addClass( 'visible' )
		    this.hideGroupMenu()

		  }else if( value === MAINAREA_CONVERSATION ){

		    $( '.ui-content' ).addClass( 'visible' )
		    $( '.no-content' ).removeClass( 'visible' )
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
			this.dom.find( '.conversation-input textarea' ).val( '' )
		}

		conversationSetOpened( conversationId, value ){

			if( value ){
		    $( '.channel-id-' + conversationId ).addClass( 'active' )
		  }else{
		    $( '.channel-id-' + conversationId ).removeClass( 'active' )
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

		launchBanner( name , text , avatar , callback ){

			if ( !this.dom.parent().hasClass( 'wz-app-focus' ) ){

			  api.banner()
			  .setTitle( name )
			  .setText( text )
			  .setIcon( avatar )
			  // To Do -> .sound( 'marimba' )
			  .on( 'click', callback )
			  .render()

			}

		}

		markMessageAsRead( messageId ){
			this._domMessageContainer.find( '.message-' + messageId ).addClass( 'readed' )
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

				$( '.group-menu' ).removeClass( 'group-edit' ).removeClass( 'group-view' )
		    $( '.group-menu' ).addClass( 'visible' ).addClass( 'group-new' )
		    $( '.group-name-input input' ).val( '' )
		    this._setGroupAvatar( '?' , $( '.group-avatar' ) )

			}
	    
	    $( '.memberDom' ).remove()
	    $( '.group-menu .ui-input-search input' ).val( '' )

	    this._domGroupMemberList.empty().append( friendList.map( function( item ){

	    	item.dom = memberPrototype.clone().removeClass( 'wz-prototype' )
			  item.dom.find( 'span' ).text( item.user.fullName )
			  item.dom.addClass( 'memberDom' )
			  item.dom.find( '.member-avatar' ).css( 'background-image' , 'url( ' + item.user.avatar.big + ' )' )
			  item.dom.attr( 'data-id', item.user.id )

			  if( conversation && conversation.users && (conversation.users.indexOf( item.user.id ) != -1) ){

			  	item.dom.addClass( 'active' )
			  	item.dom.find( '.ui-checkbox' ).addClass( 'active' )

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

	  		item.dom = contactPrototype.clone().removeClass( 'wz-prototype' )

	  		if( item.connected ){
	  			item.dom.addClass( 'conected' )
	  		}

	  		item.dom.addClass( 'user-id-' + item.user.id )
			  item.dom.find( '.contact-name' ).text( item.user.fullName )
			  item.dom.find( '.contact-img' ).css( 'background-image', 'url( ' + item.user.avatar.big + ' )' )
			  item.dom.attr( 'data-id', item.user.id )

		  	return item.dom

		  }) )

		}

		updateConversationInfo( conversation, isConnected ){

    	$( '.conversation-name, .conver-header .conver-title' ).text( conversation.name )

		  if( conversation.isGroup ){

		  	$( '.conversation-info' ).addClass( 'isGroup' )
		  	var membersText = conversation.users.length === 0 ? ( conversation.users.length + 1 + ' ' + lang.member ) : ( conversation.users.length + 1 + ' ' + lang.members )
		    $( '.conversation-moreinfo, .conver-moreinfo' ).removeClass( 'conected' ).text( membersText )

		  }else if( isConnected ) {

		  	$( '.conversation-info' ).removeClass( 'isGroup' )
		    $( '.conversation-moreinfo, .conver-moreinfo' ).addClass( 'conected' ).text( lang.conected )

		  }else{

		  	$( '.conversation-info' ).removeClass( 'isGroup' )
		    $( '.conversation-moreinfo, .conver-moreinfo' ).removeClass( 'conected' ).text( lang.disconected )

		  }

		  $( '.conversation-input textarea' ).val( '' ).focus()


		}

  	updateConversationUI( conversation ){

  		var conversationDom = $( '.channel-id-' + conversation.context.id )
  		conversationDom.attr( 'data-id' , conversation.context.id )
		  conversationDom.find( '.channel-name' ).text( conversation.name )

		  if( conversation.isGroup ){
		  	this._setGroupAvatar( conversation.name, conversationDom.find( '.channel-img' ) )
		  }else{
		  	conversationDom.find( '.channel-img' ).css( 'background-image' , 'url( ' + conversation.img + ' )' )
		  }
		  
		  conversationDom.find( '.channel-last-msg' ).text( conversation.lastMessage ? conversation.lastMessage.data.text : '' )

		  if( conversation.unread > 0 ) {
        conversationDom.find( '.channel-badge' ).addClass( 'visible' ).find( 'span' ).text( conversation.unread )
      }else{
        conversationDom.find( '.channel-badge' ).removeClass( 'visible' ).find( 'span' ).text( '' )
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

		  	item.dom = conversationPrototype.clone().removeClass( 'wz-prototype' )
			  item.dom.addClass( 'channel-id-' + item.context.id )
		  	item.dom.attr( 'data-id', item.context.id )
			  item.dom.find( '.channel-name' ).text( item.name )

			  if( item.context.id == id ){
			  	item.dom.addClass( 'active' )
			  }

			  if( item.isGroup ){

			  	this._setGroupAvatar( item.name, item.dom.find( '.channel-img' ) )
			  	item.dom.addClass( 'isGroup' )

			  }else{
			  	item.dom.find( '.channel-img' ).css( 'background-image' , 'url( ' + item.img + ' )' )
			  }

			  if( item.unread > 0 ) {
	        item.dom.find( '.channel-badge' ).addClass( 'visible' ).find( 'span' ).text( item.unread )
	      }else{
	        item.dom.find( '.channel-badge' ).removeClass( 'visible' ).find( 'span' ).text( '' )
	      }

			  
			  item.dom.find( '.channel-last-msg' ).text( item.lastMessage ? item.lastMessage.data.text : '' )

		  	return item.dom 

		  }.bind( this ) ))

		  if( id ){
		  	this.changeSidebarMode( SIDEBAR_CONVERSATIONS )
		  	$( '.channel-id-' + id ).trigger( 'click' )
		  }

  	}

  	updateMessagesUI( user ){

  		$( '.sender-' + user.id + ' .sender' ).text( user.fullName ).css( 'color' , COLORS[ this._selectColor( user.fullName ) ] );
  		$( '.sender-' + user.id + ' .message-avatar' ).css( 'background-image' , 'url( ' + user.avatar.big + ' )' )

		  this._domMessageContainer.scrollTop( this._domMessageContainer[ 0 ].scrollHeight )

  	}

  }

  return new View()

})()
