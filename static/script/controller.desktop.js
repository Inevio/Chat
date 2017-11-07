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

      this.dom.on( 'click', '.new-group-button', function(){
        model.editGroup( null );
      })

      this.dom.on( 'click', '.conversation-info.isGroup', function(){
        model.editGroup( parseInt( $('.channel.active').attr( 'data-id' ) ) );
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

      this.dom.on( 'contextmenu', '.channel', function(){

        var menu = api.menu();
        var id = $( this ).attr( 'data-id' );

        menu.addOption( lang.deleteChat , function(){
          model.deleteConversationApi( id );
        });

        if( $( this ).hasClass( 'isGroup' ) ){

          menu.addOption( lang.exitGroup , function(){
            model.leaveConversation( id );
          });

        }

        menu.render();

      })

      this.dom.on( 'click', '.save-group, .accept-button', function(){
         
        var info = {

          name: $( '.group-name-input input' ).val(),
          members: $( '.memberDom.active' ),
          conversationId: parseInt( $( '.channel-list .channel.active' ).attr('data-id') )

        }

        model.saveGroup( info );

      })

      this.dom.on( 'keypress', function( e ){

        if( e.which === 13 && !e.shiftKey && $.trim( this.dom.find('.conversation-input textarea').val() ) ){

          e.preventDefault();
          model.sendBuffer( $.trim( this.dom.find('.conversation-input textarea').val() ) );

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
              return view.launchAlert( err );
            }

            model.handleMessage( event );

          })

        }

      })

      api.com.on( 'messageMarkedAsAttended', function( comMessageId, comContextId, userId, notificationId ){
        model.updateMessageAttendedUI( comMessageId, comContextId )
      })

      api.com.on( 'userAdded', function( conversationId, userId ){

        /*if( userId === api.system.user().id ){
          model.deleteConversationFront( conversationId );
        }else{
          model.updateConversationInfo( conversationId );
        }*/

      })

      api.com.on( 'userRemoved', function( conversationId, userId ){

        if( userId === api.system.user().id ){
          model.deleteConversationFront( conversationId );
        }else{
          model.updateConversationInfo( conversationId );
        }

      })

      api.notification.on( 'new', function( notification ){
        console.log( notification )
      })

      api.notification.on( 'attended', function( list ){
        console.log( list )
      })

    }  

  }

  return new Controller( model, view );

})( model, view )