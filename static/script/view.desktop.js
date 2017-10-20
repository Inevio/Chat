const win = $( this );

var view = ( function( model ){

  class View{

  	constructor( model ){

  		this.model = model;
  		this.dom = win;

  		this._translateInterface();

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

  	changeSidebarMode( value ){

		  if( this._sidebarMode === value ){
		    return
		  }

		  this._sidebarMode = value

		  this.dom.find( '.chat-footer > section' ).removeClass( 'active' )
		  this.dom.find( '.chat-body > section' ).removeClass( 'visible' )

		  if( this._sidebarMode === App.SIDEBAR_CONVERSATIONS ){

		    this.dom.find( '.chat-footer .chat-tab-selector' ).addClass( 'active' )
		    this.dom.find( '.chat-body .chat-tab' ).addClass( 'visible' )

		  }else if( this._sidebarMode === App.SIDEBAR_CONTACTS ){

		    this.dom.find( '.chat-footer .contact-tab-selector' ).addClass( 'active' )
		    this.dom.find( '.chat-body .contact-tab' ).addClass( 'visible' )

		  }

		}

  	updateConversationUI(){

  		this.dom.attr( 'data-id' , this.context.id );
		  this.dom.find( '.channel-name' ).text( this.name );
		  this.dom.find( '.channel-img' ).css( 'background-image' , 'url(' + img + ')' );
		  this.dom.find( '.channel-last-msg' ).text( this.lastMessage ? this.lastMessage.data.text : '' );

  	}

  }

  return new View()

})( model )
