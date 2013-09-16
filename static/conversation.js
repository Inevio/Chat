
    // Local Variables
    var header       = $( '.weechat-friends-card', widget );
    var counter      = $( '.weechat-counter', header );
    var conversation = $( '.weechat-conversation-opened', widget );
    var message      = $( 'section.wz-prototype', conversation );
    var writingGlobe = $( '.weechat-conversation-writing', conversation );     
    var bottom       = $( '.weechat-conversation-bottom', widget );
    var textarea     = $( 'textarea', bottom );
    var user         = null;
    var status       = null;
    var channel      = null;

    // Local Functions
    var readParams = function( params ){

        user   = params[ 0 ];
        status = params[ 1 ];

        widget.addClass( 'weechat-user-' + user.id );
        header.addClass( params[ 1 ] );

        header.find( 'img' )
            .attr( 'src', user.avatar.tiny );

        header.find( 'span' )
            .text( user.fullName );

        if( params[ 2 ] ){

            widget.trigger( 'message', [ user, params[ 2 ] ] );

            if( widget.hasClass('hidden') ){
                header.click();
            }

        }else{
            header.click();
        }

        widget.removeClass( 'messages' );

        if( channel === null ){

            wz.channel.create( function( error, chn ){

                if( error ){
                    console.log('NO PUEDE CREAR CANAL');
                }else{

                    channel = chn;
                    channel.addUser( user.id );

                }

            });

        }

    };

    var sendMessage = function( message ){
        channel.send( message );
    };

    var addMessage = function( text, self ){

        var item = message.clone();

        var date = new Date();

        var hour = date.getHours();
            if( hour < 10 ){ hour = '0' + hour; }
        var minute = date.getMinutes();
            if( minute < 10 ){ minute = '0' + minute; }

        item
            .removeClass()
            .addClass( ( self ) ? 'me' : 'you' )
            .find('.weechat-conversation-message span')
                .text( text );

        item
            .children('.weechat-conversation-hour')
                .text( hour + ':' + minute );

        conversation
            .append( item )
            .append( writingGlobe );

        conversation.scrollTop( conversation[ 0 ].scrollHeight );

    };

    var autoResize = function( textarea ){

        var settings = $.extend({ onResize : function(){}, extraSpace : 0, limit: 100 } );

        origHeight = textarea.height(),
         
        clone = ( function(){
         
            var props = [ 'height', 'width', 'lineHeight', 'textDecoration', 'letterSpacing' ], propOb = {};
             
            $.each( props, function( i, prop ){ propOb[prop] = textarea.css( prop ); } );
             
            return textarea.clone().css({
                position: 'absolute',
                top: 0,
                left: -9999
            }).css( propOb ).attr( 'tabIndex', '-1' ).insertBefore( textarea );
         
        })(),
        lastScrollTop = null,
        updateSize = function() {
         
            clone.height( 0 ).val( $( this ).val() ).scrollTop( 10000 );
             
            var scrollTop = Math.max( clone.scrollTop(), origHeight ) + settings.extraSpace, toChange = $( this ).add( clone );
         
            // Don't do anything if scrollTop hasen't changed:
            if ( lastScrollTop === scrollTop ) { return; }
            lastScrollTop = scrollTop;
             
            // Check for limit:
            if ( scrollTop >= settings.limit ) {
                $( this ).css( 'overflow-y', 'auto' );
                return;
            }

            settings.onResize.call( this );
            toChange.height( scrollTop );

            textarea.trigger( 'resize' );

        };
     
        // Bind namespaced handlers to appropriate events:
        textarea
            .unbind( '.dynSiz' )
            .bind( 'keyup.dynSiz', updateSize )
            .bind( 'keydown.dynSiz', updateSize )
            .bind( 'change.dynSiz', updateSize );

    };

    // Events
    widget

    .on( 'mousedown', function( e ){

        if( !widget.hasClass('wz-deskitem-focus') ){
            e.preventDefault();
        }

    })

    .on( 'message', function( e, userInfo, data ){

        if( data[ 0 ].sender === user.id || data[ 0 ].receiver === user.id ){

            if( data[ 0 ].text ){

                if( data[ 0 ].sender === user.id ){
                    $( '.weechat-conversation-writing', widget ).removeClass( 'writing' ); 
                    conversation.scrollTop( conversation[ 0 ].scrollHeight );
                }

                addMessage( data[ 0 ].text, Boolean( userInfo.selfUser ) );

                if( !userInfo.selfUser && widget.hasClass('hidden') ){

                    widget.addClass( 'messages' );

                    var num = parseInt( counter.text(), 10 );

                    if( isNaN( num ) ){
                        num = 0;
                    }

                    if( num < 999 ){
                        counter.text( ++num );
                    }else{
                        counter.text( '+' );
                    }

                    wz.banner()
                        .title( user.fullName )
                        .text( data[ 0 ].text )
                        .icon( user.avatar.tiny )
                        .sound( 'marimba' )
                        .render();

                }else{
                    widget.removeClass( 'messages' );
                }

            }else{

                if( data[ 0 ].sender === user.id ){

                    if( data[ 0 ].writing ){
                        $( '.weechat-conversation-writing', widget ).addClass( 'writing' );
                        conversation.scrollTop( conversation[ 0 ].scrollHeight );
                    }else{
                        $( '.weechat-conversation-writing', widget ).removeClass( 'writing' );
                        conversation.scrollTop( conversation[ 0 ].scrollHeight );
                    }

                }

            }

        }

    })

    .on( 'wz-focus', function(){

        if( !widget.hasClass('hidden') ){
            textarea.focus();
        }

    })

    .on( 'wz-blur', function(){
        textarea.blur();
    })

    .on( 'user-connect', function( event, data ){

        if( user.id === data.id ){ 

            header.removeClass( 'offline' ).addClass( 'online' );

        }

    })

    .on( 'user-disconnect', function( event, data ){

        if( user.id === data.id ){ 

            header.removeClass( 'online' ).addClass( 'offline' );

        }

    });

    header

    .on( 'click', '.wz-win-close', function( e ){

        e.stopPropagation();
        widget.remove();

        var others     = wz.tool.widget( 14, 'conversation' ).not( widget );
        var othersSize = others.size();
        var control    = 0;

        if( othersSize ){

            others.each( function(){

                $( this ).css({
                    right : wz.tool.widget( 14, 'list' ).children( '.weechat-icon' ).outerWidth( true ) + control * widget.outerWidth( true ) + 5 * ( control + 1 )
                });

                control++;

            });

        }

    })

    .on( 'click', function(){

        widget.toggleClass('hidden');

        if( !widget.hasClass('hidden') ){

            counter.text('');
            textarea.focus();

        }else{
            textarea.blur();
        }

    });

    textarea
    .on( 'keypress', function( e ){

        if( e.which === 13 ){

            var text = $( this ).val();

            e.preventDefault();

            if( $.trim( text ).length ){

                sendMessage( { text: text, receiver : user.id, sender : wz.info.user().id } );
                $( this ).val('');

            }

        }

    })

    .on( 'keyup', function( e ){

        if( e.which !== 13 ){

            var text = $( this ).val();

            if( $.trim( text ).length ){
                sendMessage( { writing: true, receiver : user.id, sender : wz.info.user().id } );
            }else{
                sendMessage( { writing: false, receiver : user.id, sender : wz.info.user().id } );
            }

        }

    })

    .on( 'resize', function(){

        bottom.height( textarea.outerHeight( true ) );
        conversation.height( 339 - bottom.outerHeight( true ) );

    });

    // Start the widget
    widget.addClass('weechat-conversation hidden');

    readParams( params );

    var others     = wz.tool.widget( 14, 'conversation' ).not( widget );
    var othersSize = others.size();

    if( othersSize ){

        widget.css({
            right : wz.tool.widget( 14, 'list' ).children( '.weechat-icon' ).outerWidth( true ) + othersSize * widget.outerWidth( true ) + 5 * ( othersSize + 1 )
        });

    }

    autoResize( textarea );

    // Nullify
    others = othersSize = null;
