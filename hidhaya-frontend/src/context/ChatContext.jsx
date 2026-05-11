import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const ChatContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setIsPremium(user.isPremium || false)
    }
  }, [])

  const fetchChats = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChats(response.data)
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const createChat = async (title = 'New Chat') => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await axios.post(`${API_URL}/api/chats`, { title }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChats(prev => [response.data, ...prev])
      setCurrentChat(response.data)
      return response.data
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const sendMessage = async (content) => {
    if (!currentChat) {
      await createChat()
    }

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await axios.post(
        `${API_URL}/api/chats/${currentChat._id}/messages`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(prev => [...prev, response.data])
      return response.data
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const deleteChat = async (chatId) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await axios.delete(`${API_URL}/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChats(prev => prev.filter(c => c._id !== chatId))
      if (currentChat?._id === chatId) {
        setCurrentChat(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const bookmarkChat = async (chatId) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await axios.post(`${API_URL}/api/chats/${chatId}/bookmark`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChats(prev => prev.map(c =>
        c._id === chatId ? { ...c, isBookmarked: !c.isBookmarked } : c
      ))
    } catch (error) {
      console.error('Error bookmarking chat:', error)
    }
  }

  return (
    <ChatContext.Provider value={{
      chats,
      currentChat,
      messages,
      loading,
      isPremium,
      fetchChats,
      createChat,
      sendMessage,
      deleteChat,
      bookmarkChat,
      setCurrentChat,
      setMessages
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)