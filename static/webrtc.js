
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

wz.channel.on('message', function ( info, data ) {

	if  ( data.receiver === wz.system.user().id ) {

		if ( data.event === "newCall" && data.callType === 1 ) {

			wz.user( info.sender, function ( err, user ) {
				wz.app.createView({ event: 'newSuspCall', desc: data.desc, channel: info.id, avatar: user.avatar.big, name: user.fullName, callType: data.callType });
			});

		}

	}

});
