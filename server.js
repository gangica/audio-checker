const io = require('socket.io')(5000)
console.log('server CONNECT')

io.on('connection', socket => {
	// const id = socket.handshake.query.id
	// socket.join(id)
	
	socket.on('check-success', () => {
		socket.emit('check-success-client', {
			parent: {
				title: 'Test song',
				artist: 'Dumamay',
				composer: 'Dumayma',
				authorRight: 'Tao',
				publisher: 'MCM',
				image: 'https://cdn-icons.flaticon.com/png/512/2769/premium/2769339.png?token=exp=1652612636~hmac=6d8b9e1b061327683133b6327ab9b517',
				phone: '0961254897',
				email: '3@gmail.com'
			}
		})
	})
})