
    configuration = {

        iceServers: [

            { url : 'stun:stun.l.google.com:19302' },
            { url : 'stun:stun1.l.google.com:19302' },
            { url : 'stun:stun2.l.google.com:19302' },
            { url : 'stun:stun3.l.google.com:19302' },
            { url : 'stun:stun4.l.google.com:19302' },

            {
                
                url        : 'turn:5.135.159.85', // To Do -> Es la IP de la beta, ponerle el nombre del dominio
                username   : 'test',              // To Do -> Datos muy vulnerables
                credential : 'test'

            }

    ]};

    RTCPeerConnection      = typeof webkitRTCPeerConnection === 'undefined' ? mozRTCPeerConnection : webkitRTCPeerConnection;
    navigator.getUserMedia = navigator.getUserMedia  || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    pc                     = new RTCPeerConnection( configuration );
    channel                = null;
    callType               = null;

    if ( typeof mozRTCSessionDescription !== 'undefined' ) {
        RTCSessionDescription = mozRTCSessionDescription;
    }

    if ( typeof mozRTCIceCandidate !== 'undefined' ) {
        RTCIceCandidate = mozRTCIceCandidate;
    }

    pc.onaddstream     = streamAdded;
    pc.onicecandidate  = ICEcandidate;

    function streamAdded ( event ) {
        var internChannel  = channel ? channel : wz.app.storage('channel');
        internChannel.send({ stream: URL.createObjectURL( event.stream ), receiver: wz.system.user().id, event: 'remoteAudio' });
    }

    function ICEcandidate ( e ) {
        
        var internChannel = channel ? channel : wz.app.storage('channel');

        if ( e.candidate ) {

            internChannel.send({

                event: "ICEcandidate",
                sender: wz.system.user().id,
                label: e.candidate.sdpMLineIndex,
                id: e.candidate.sdpMid,
                candidate: e.candidate.candidate

            });

        }

    }


    wz.channel.on('message', function ( info, data ) {

    	if  ( data.receiver === wz.system.user().id ) {

    		if ( data.event === "newCall" ) {

                if ( data.callType === 2 ) {

                    callType = data.callType;
                    channel  = wz.channel( info.id );

                    wz.banner()
                        .setTitle('Incomming call')
                        .setButton( 0, 'Accept', 'accept' )
                        .setButton( 1, 'Dismiss', 'cancel' )
                        .on('button', function ( button ) {

                            if ( button ) {
                                //Cancell
                            } else {
                            
                                pc.setRemoteDescription( new RTCSessionDescription( data.desc ), function () {

                                    navigator.getUserMedia({ audio: true, video: false }, function ( stream ) {

                                        wz.app.storage('localStream', stream);
                                        pc.addStream( stream );

                                        pc.createAnswer( function ( desc ) {

                                            pc.setLocalDescription( new RTCSessionDescription( desc ) );
                                            channel.send({ event: 'acceptCall', callType: 2, receiver: info.sender, desc: desc });

                                        }, function ( err ) {
                                            console.log( err );
                                        });

                                    }, function ( err ) {
                                        console.log( err );
                                    });

                                }, function ( err ) {
                                    console.log( err );
                                });

                            }

                        })
                        .render();

                } else {
                    wz.user( info.sender, function ( err, user ) {
                        wz.app.createView({ event: 'newSuspCall', desc: data.desc, channel: info.id, avatar: user.avatar.big, name: user.fullName, callType: data.callType });
                    });
                }

    		}

    	}

    });

    var renewPC = function () {
        pc = new RTCPeerConnection( configuration );
        pc.onaddstream     = streamAdded;
        pc.onicecandidate  = ICEcandidate;   
    }

    wz.app.storage('renew', renewPC);