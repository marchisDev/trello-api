
// param socket se duoc lay tu thu vien socket.io
export const inviteUserToBoardSocket = (socket) => {
  // Lang nghe su kien ma client emit len co ten la FE_USER_INVITED_TO_BOARD
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    // Cach lam nhanh va don gian nhat la Emit nguoc lai 1 su kien ve cho moi client khac (tru chinh cai gui request len)
    // roi de phia FE check
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}
