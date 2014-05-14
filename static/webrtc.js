    configuration      = { "iceServers": [
                                    {
                                        url: 'turn:numb.viagenie.ca',
                                        credential: 'mangakas123',
                                        username: 'rrojot@hotmail.com'
                                    },
                                    {
                                        url: 'turn:192.158.29.39:3478?transport=udp',
                                        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                                        username: '28224511:1379330808'
                                    },
                                    {
                                        url: 'turn:192.158.29.39:3478?transport=tcp',
                                        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                                        username: '28224511:1379330808'
                                    },
                                    {
                                        url: 'turn:192.158.30.23:3478?transport=udp',
                                        credential: 'RaebIwHQPUmabKiySrCr8kbHtSg=',
                                        username: '1394128738:02043197'
                                    },
                                    {
                                        url: 'turn:192.158.30.23:3478?transport=tcp',
                                        credential: 'RaebIwHQPUmabKiySrCr8kbHtSg=',
                                        username: '1394128738:02043197'
                                    }
                                 ]};

RTCPeerConnection      = typeof webkitRTCPeerConnection === 'undefined' ? mozRTCPeerConnection : webkitRTCPeerConnection;
navigator.getUserMedia = navigator.getUserMedia  || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
pc                     = new RTCPeerConnection( configuration );

wz.channel.on('message', function ( info, data ) {

	if  ( data.receiver === wz.system.user().id ) {

		if ( data.event === "newCall" && data.callType === 1 ) {

			wz.user( info.sender, function ( err, user ) {
				wz.app.createView({ event: 'newSuspCall', desc: data.desc, channel: info.id, avatar: user.avatar.big, name: user.fullName, callType: data.callType });
			});

		}

	}

});