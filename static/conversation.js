
    // Local Variables
    var widget                 = $( this );
    var header                 = $( '.weechat-friends-card', widget );
    var counter                = $( '.weechat-counter', header );
    var conversation           = $( '.weechat-conversation-opened', widget );
    var message                = $( 'section.wz-prototype', conversation );
    var writingGlobe           = $( '.weechat-conversation-writing', conversation );
    var bottom                 = $( '.weechat-conversation-bottom', widget );
    var textarea               = $( 'textarea', bottom );
    var user                   = null;
    var status                 = null;
    var channel                = null;
    var actualReq              = false;

    if ( typeof mozRTCSessionDescription !== 'undefined' ) {
        RTCSessionDescription = mozRTCSessionDescription;
    }

    if ( typeof mozRTCIceCandidate !== 'undefined' ) {
        RTCIceCandidate = mozRTCIceCandidate;
    }

    wz.channel( function( error, chn ){

        if( error ){
            console.log('NO PUEDE CREAR CANAL');
        }else{

            channel = chn;
            channel.addUser( params[ 0 ].id );

        }

    });

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

            wz.channel( function( error, chn ){

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

    var hangUp = function () {

        if ( actualReq ) {

            pc.close();
            wz.app.storage('localStream').stop();

            ( wz.app.storage('renew') )();
            actualReq = false;
            $('.weechat-button-call').css('display', 'inline');
            $('.weechat-button-video').css('display', 'inline');
            $('.weechat-button-hangup').css('display', 'none');

        }

    };

    // WZ Events
    wz.channel
    .on( 'message', function( info, data ){

        if( data.sender === user.id || data.receiver === user.id ){

            if( data.text ){

                if( data.sender === user.id ){
                    $( '.weechat-conversation-writing', widget ).removeClass( 'writing' );
                    conversation.scrollTop( conversation[ 0 ].scrollHeight );
                }

                addMessage( data.text, Boolean( info.selfUser ) );

                if( !info.selfUser && widget.hasClass('hidden') ){

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
                        .text( data.text )
                        .icon( user.avatar.tiny )
                        .sound( 'marimba' )
                        .action( function(){
                            $( '.weechat-friends-card', widget ).click();
                        })
                        .render();

                }else{
                    widget.removeClass( 'messages' );
                }

            }else if ( data.event === 'ICEcandidate' && data.sender === user.id ){

                pc.addIceCandidate( new RTCIceCandidate({
                    sdpMLineIndex: data.label,
                    candidate: data.candidate
                }) );

            }else{

                if( data.sender === user.id ){

                    if( data.writing ){
                        $( '.weechat-conversation-writing', widget ).addClass( 'writing' );
                        conversation.scrollTop( conversation[ 0 ].scrollHeight );
                    }else{
                        $( '.weechat-conversation-writing', widget ).removeClass( 'writing' );
                        conversation.scrollTop( conversation[ 0 ].scrollHeight );
                    }

                }

            }

        }else if( data.receiver === wz.system.user().id ) {
            
            if ( data.event === 'remoteAudio' ) {

                if ( !actualReq ) actualReq = true;
                
                $('.weechat-conversation-voice')[0].src = data.stream;
                $('.weechat-conversation-voice')[0].play();
                $('.weechat-button-call').css('display', 'none');
                $('.weechat-button-video').css('display', 'none');
                $('.weechat-button-hangup').css('display', 'inline');

            }else if( data.event === 'acceptCall' && data.callType === 2 ) {

                pc.setRemoteDescription( new RTCSessionDescription( data.desc ), function () {
                }, function ( err ) {
                    console.log( err );
                });

            } else if ( data.event === 'hangUp' ) {
                hangUp();
            }

        }

    });

    // Events
    widget

    .on( 'mousedown', function( e ){

        if( !widget.hasClass('wz-app-focus') ){
            e.preventDefault();
        }

    })

    .on( 'ui-view-focus', function(){

        if( !widget.hasClass('hidden') ){
            textarea.focus();
        }

    })

    .on( 'ui-view-blur', function(){
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

    .on( 'click', '.wz-view-close', function( e ){

        e.stopPropagation();
        widget.remove();

        var others     = wz.app.getWidgets('conversation').not( widget );
        var othersSize = others.size();
        var control    = 0;

        if( othersSize ){

            others.each( function(){

                $( this ).css({
                    right : wz.app.getWidgets('list').children( '.weechat-icon' ).outerWidth( true ) + control * $( this ).outerWidth( true ) + 5 * ( control + 1 )
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

                sendMessage( { text: text, receiver : user.id, sender : wz.system.user().id } );
                $( this ).val('');

            }

        }

    })

    .on( 'keyup', function( e ){

        if( e.which !== 13 ){

            var text = $( this ).val();

            if( $.trim( text ).length ){
                sendMessage( { writing: true, receiver : user.id, sender : wz.system.user().id } );
            }else{
                sendMessage( { writing: false, receiver : user.id, sender : wz.system.user().id } );
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

    var others     = wz.app.getWidgets('conversation').not( widget );
    var othersSize = others.size();

    if( othersSize ){

        widget.css({
            right : wz.app.getWidgets('list').children( '.weechat-icon' ).outerWidth( true ) + othersSize * widget.outerWidth( true ) + 5 * ( othersSize + 1 )
        });

    }

    autoResize( textarea );

    // Nullify
    others = othersSize = null;

    $('.weechat-button-call').on( 'click', function ( e ) {

        e.stopPropagation();

        if ( !actualReq ) {

            actualReq = true;

            navigator.getUserMedia( { audio: true, video: false }, function ( stream ) {

                wz.app.storage('localStream', stream);
                wz.app.storage('channel', channel);
                pc.addStream( stream );

                pc.createOffer( function ( desc ) {

                    localDesc = new RTCSessionDescription( desc );
                    pc.setLocalDescription( localDesc );
                    channel.send({ event: 'newCall', desc: desc, callType: 2, receiver: user.id });

                }, function ( err ) {
                    console.log( err );
                });

            }, function ( err ) {
                console.log( err );
            });

        }

    });

    $('.weechat-button-video').on( 'click', function ( e ) {

        e.stopPropagation();

        if ( !actualReq ) {

            actualReq = true;

            wz.app.storage('channel', channel);
            wz.app.storage('done', true);
            wz.app.storage('callType', 1);

            navigator.getUserMedia( { audio: true, video: true }, function ( stream ) {

                localStream = stream;
                wz.app.createView({ stream: stream, event: 'localVid' });
                pc.addStream( stream );

                pc.createOffer( function ( desc ) {

                    localDesc = new RTCSessionDescription( desc );
                    pc.setLocalDescription( localDesc );
                    channel.send({ event: 'newCall', desc: desc, callType: 1, receiver: user.id });

                }, function ( err ) {
                    console.log( err );
                });

            }, function ( err ) {
                console.log( err );
            });

        }

    });

    $('.weechat-button-hangup').on('click', function ( e ) {
        
        e.stopPropagation();
        channel.send({ receiver: user.id, event: 'hangUp' });
        hangUp();

    });
