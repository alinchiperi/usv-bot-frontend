import React, {useState, useRef, useEffect} from 'react';
import './App.css';
import {BotIcon, SendIcon, TrashIcon, UserIcon} from 'lucide-react'
import axios from 'axios';

const defaultMessage = 'Salut! Sunt USV Chat Bot. Cu ce pot sa te ajut astazi?'

const ChatMessage = ({message, isUser}) => {
    return (
        <div className={`flex py-4 px-4 ${isUser ? 'bg-gray-50' : 'bg-white'}`}>
            <div className="mr-4">
                {isUser ? <UserIcon/> : <BotIcon/>}
            </div>
            <div className="flex-1">
                <p className="text-gray-800 " style={{whiteSpace: 'pre-wrap'}}>{message}</p>
            </div>
        </div>
    );
};

const App = () => {
    const [messages, setMessages] = useState([
        {text: defaultMessage, isUser: false}
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() === '') return;

        // Add user message
        const newMessages = [
            ...messages,
            {text: input, isUser: true}
        ];
        setMessages(newMessages);

        try {
            const response = await axios.post('http://localhost:8080/api/v1/chat',
                {message: input}, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            console.log(response)
            const botMessage = response.data.message;

            setMessages(prevMessages => [
                ...prevMessages,
                {text: botMessage, isUser: false}
            ]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prevMessages => [
                ...prevMessages,
                {text: 'Error sending message. Please try again.', isUser: false}
            ]);
        }

        setInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {text: defaultMessage, isUser: false}
        ]);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-64 bg-white border-r p-4">
                <button
                    className="w-full bg-blue-500 text-white py-2 rounded-md mb-4 flex items-center justify-center"
                    onClick={() => clearChat()}
                >
                    <span className="mr-2">↻</span> Chat nou
                </button>

                <div className="text-sm text-gray-500">
                    <p>Istoric Chat</p>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <ChatMessage
                            key={index}
                            message={msg.text}
                            isUser={msg.isUser}
                        />
                    ))}
                    <div ref={messagesEndRef}/>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t">
                    <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Trimite un mesaj"
                                className="w-full p-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            >
                                <SendIcon/>
                            </button>
                        </div>
                        <button
                            onClick={clearChat}
                            className="text-gray-500 hover:text-red-500"
                        >
                            <TrashIcon/>
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">
                        AI poate face greseli. Verifica informatiile importante.
                    </p>
                </div>
            </div>
        </div>
    );
};


export default App;
