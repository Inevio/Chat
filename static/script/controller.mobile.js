var controller = ( function( model, view ){

  class Controller{

    constructor( model, view ){

      this.dom = win
      this._domContactsList = $( '.contact-list', this.dom )
      this._domConversationsList = $( '.channel-list', this.dom )
      this._domMessageContainer = $( '.message-container', this.dom )
      this._domMessageMePrototype = $( '.message-me.wz-prototype', this._domMessageContainer )
      this._domMessageOtherPrototype = $( '.message-other.wz-prototype', this._domMessageContainer )
      this._domCurrentConversation
      this.model = model
      this.view = view
      this._bindEvents()
      this._checkOpenParams()

    }

    _checkOpenParams(){

      if(window.params && window.params.command && window.params.command === 'pushAttended' && window.params.data && window.params.data.comContext ){

        console.log(window.params.data.comContext)
        setTimeout(function(){
          model.openConversation( parseInt(window.params.data.comContext) )
        },750)
        
      }
      
    }

    _bindEvents(){

      // DOM Events
      this.dom.on( 'click' , '.back-button', function(){
        this.model.goBack();
      }.bind(this))

      this.dom.on( 'click', '.tab-selector', function(){

        //TODO revisar valores
        if( $(this).hasClass( 'chat-tab-selector' ) ){
          model.changeSidebarMode( SIDEBAR_CONVERSATIONS )
        }else if( $(this).hasClass( 'contact-tab-selector' ) ){
          model.changeSidebarMode( SIDEBAR_CONTACTS )
        }

      })

      this.dom.on( 'click', '.new-group', function(){
        model.editGroup( null )
      })

      this.dom.on( 'click', '.conversation-info.isGroup', function(){
        model.editGroup( parseInt( $( '.channel.active' ).attr( 'data-id' ) ) )
      })

      this.dom.on( 'click', '.group-menu .back, .cancel-group', function(){
        model.hideGroupMenu()
      })

      this.dom.on( 'click', '.memberDom', function(){

        $(this).toggleClass( 'active' )
        $(this).find( '.ui-checkbox' ).toggleClass( 'active' )

      })

      this.dom.on( 'click', '.memberDom .ui-checkbox', function(e){

        $(this).toggleClass( 'active' )
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

      this.dom.on( 'click', '.conversation-send', function(e){

        model.sendBuffer( $.trim( this.dom.find( '.conversation-input textarea' ).val() ) )

      }.bind(this))

      this.dom.on( 'click', '.save-group, .accept-button', function(){

        var info = {

          name: $( '.group-name-input input' ).val(),
          members: $( '.memberDom.active' ),
          conversationId: parseInt( $( '.channel-list .channel.active' ).attr( 'data-id' ) )

        }

        model.saveGroup( info )

      })

      this.dom.on( 'keypress', function( e ){

        if( e.which === 13 && !e.shiftKey && $.trim( this.dom.find( '.conversation-input textarea' ).val() ) ){

          e.preventDefault()
          model.sendBuffer( $.trim( this.dom.find( '.conversation-input textarea' ).val() ) )

        }

      }.bind( this ))

      this.dom.on( 'input', '.chat-search input', function(){
        model.filterElements( $( this ).val() )
      })

      this.dom.on( 'input', '.search-members input', function(){
        model.filterElements( $( this ).val() , true )
      })

      this.dom.on( 'app-param', function( e, params ){

        console.log('app-param', params)
        if( params && params.command === 'pushAttended' ){

          //console.log(JSON.parse(params.data))
          if( params.data.comContext ){
            model.openConversation( parseInt( params.data.comContext ) )
          }

        }

      })

      $(window).on('resize', () => {
        console.log('resize')
        view.adjustScrollResize(this.dom.height())
      })

      this._domContactsList.on( 'click', '.contact', function(){
        model.openConversationWithContact( parseInt( $(this).attr( 'data-id' ) ) )
      })

      this._domConversationsList.on( 'click', '.channel', function(){
        model.openConversation( parseInt( $(this).attr( 'data-id' ) ) )
      })

      // COM API Events
      api.com.on( 'message', function( event ){

        console.log( 'message', event )
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
        if( user.id == api.system.workspace().idWorkspace ){
          model.ensureConversation( conversationId )
        }else{
          model.updateConversationInfo( conversationId )
        }

      })

      api.com.on( 'userRemoved', function( conversationId, userId ){

        console.log( 'userRemoved', conversationId, userId )
        if( userId === api.system.workspace().idWorkspace ){
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
        model.handleNewNotification( notification.comContext )
      })

      api.notification.on( 'attended', function( list ){

        console.log('attended', list)
        list.forEach( function( element ){

          if( element.comContext ){
            model.updateConversationUnread( parseInt( element.comContext ) )
          }

        })

      })

      // System API Events
      api.system.on('connect', function(){
        console.log('connect')
        model.fullLoad()
      })

      api.system.on('disconnect', function(){
        console.log('disconnect')
      })

    }

  }

  return new Controller( model, view )

})( model, view )
