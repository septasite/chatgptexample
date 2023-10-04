import { Fragment, useEffect, useState } from 'react'
import io from 'socket.io-client'
import ImgChatbot from '../assets/react.svg'

const socket = io('http://localhost:5599', {
  path: '/api/socket.io',
})
export const SocketConnect = () => {
  const [message, setMessage] = useState('')
  const [chatList, setChatList] = useState([])

  socket.on('receiveMessage', (data) => {
    const newList = [...chatList]
    if (newList.length) {
      newList[newList.length - 1].message = data.message
      newList[newList.length - 1].loading = false

      setChatList(newList)
    }
  })

  useEffect(() => {
    socket.on('connect', () => {
      console.log('socket Connected')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket])

  const onSubmit = (e) => {
    e.preventDefault()
    socket.emit('sendMessage', { message })
    const newList = [
      ...chatList,
      { role: 'client', message: message, loading: false },
      { role: 'server', message: '', loading: true },
    ]
    setChatList(newList)
    setMessage('')
  }

  return (
    <div className='wrapper'>
      <div className='chat-container'>
        <div className='chat-header'>
          <h2 className='title'>Chat With AI</h2>
        </div>
        <div className='chat-body'>
          {chatList.map((chat, index) => (
            <Fragment key={index}>
              <div className='message-item'>
                {chat.role !== 'client' ? <img src={ImgChatbot} className='img-chatbot' /> : null}

                <div className={chat.role === 'client' ? 'message sender-message' : 'message receiver-message'}>
                  {chat.loading ? (
                    <p className='typing-message'>
                      <span></span>
                      <span></span>
                      <span></span>
                    </p>
                  ) : (
                    <p>{chat.message}</p>
                  )}
                </div>
              </div>
            </Fragment>
          ))}
        </div>
        <div className='chat-footer'>
          <input
            className='form-control'
            type='text'
            value={message}
            placeholder='Type your message'
            onChange={(e) => setMessage(e.target.value)}
          />
          <div>
            <form onSubmit={onSubmit}>
              <button type='submit' className='send-btn'>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
