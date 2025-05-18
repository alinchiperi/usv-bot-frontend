import React, {useState, useRef, useEffect} from 'react';
import './App.css';
import {BotIcon, SendIcon, Sliders, TrashIcon, UserIcon, Search} from 'lucide-react'
import axios from 'axios';
import LoadingIndicator from "./components/LoadingIndicator";
import ReactMarkdown from "react-markdown";

const defaultMessage = 'Salut! Sunt USV Chat Bot. Cu ce pot sa te ajut astazi?'

const ChatMessage = ({message, isUser}) => {
    return (
        <div
            className={`flex py-4 px-4 mt-2 rounded-full ${isUser ? 'bg-blue-100 ml-12' : 'bg-white mr-12 shadow-sm'}`}>
            <div className="mr-4 flex items-center">
                {isUser ? <UserIcon/> : <BotIcon/>}
            </div>
            <div className="flex-1">
                {isUser ? (
                    <p className="text-gray-800" style={{whiteSpace: 'pre-wrap'}}>{message}</p>
                ) : (
                    <ReactMarkdown>{message}</ReactMarkdown>
                )}
            </div>
        </div>
    );
};

const App = () => {
    const [messages, setMessages] = useState([
        {text: defaultMessage, isUser: false}
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTestMode, setIsTestMode] = useState(false);
    const [topK, setTopK] = useState(3);
    const [threshold, setThreshold] = useState(0.5);
    const [showSettings, setShowSettings] = useState(false);
    const [retrievedDocs, setRetrievedDocs] = useState([]);
    const [expandedDocId, setExpandedDocId] = useState(null);
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
        setIsLoading(true);
        setInput('');
        try {
            let url = 'http://localhost:8080/api/v2/chat';
            if (isTestMode) {
                const params = new URLSearchParams();
                params.append('topK', topK);
                params.append('similarityThreshold', threshold);
                url += '?' + params.toString();
            }
            const response = await axios.post(url,
                {message: input}, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            const botMessage = response.data.response;
            const retrievedDocs = response.data.documents;

            setRetrievedDocs(retrievedDocs);

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
        } finally {
            setIsLoading(false)
        }

    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };
    const toggleDocExpansion = (docId) => {
        if (expandedDocId === docId) {
            setExpandedDocId(null);
        } else {
            setExpandedDocId(docId);
        }
    };

    const clearChat = () => {
        setMessages([
            {text: defaultMessage, isUser: false}
        ]);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">USV Chatbot </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsTestMode(!isTestMode)}
                        className={`px-3 py-1 rounded-md ${isTestMode ? 'bg-yellow-500' : 'bg-blue-700'}`}
                    >
                        {isTestMode ? 'Test Mode: ON' : 'Test Mode: OFF'}
                    </button>
                    {isTestMode && (
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 rounded-full bg-blue-700 hover:bg-blue-800"
                        >
                            <Sliders size={16}/>
                        </button>
                    )}

                </div>
            </div>
            {isTestMode && showSettings && (
                <div className="bg-white p-4 shadow-md">
                    <h2 className="font-semibold mb-2">Test Mode Settings</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Top-K Results</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={topK}
                                onChange={(e) => setTopK(parseInt(e.target.value))}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Score Threshold</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={threshold}
                                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <div className="text-xs text-gray-500 text-right">{threshold.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            )}
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Messages Container */}
                <div className="flex-1 max-w-3xl mx-auto space-y-4">
                    {messages.map((msg, index) => (
                        <ChatMessage
                            key={index}
                            message={msg.text}
                            isUser={msg.isUser}
                        />
                    ))}
                    {isLoading && <LoadingIndicator/>}
                    <div ref={messagesEndRef}/>
                </div>

                {isTestMode && retrievedDocs.length > 0 && (
                    <div className="bg-gray-100 border-t border-gray-200 p-4">
                        <div className="max-w-3xl mx-auto">
                            <h3 className="font-semibold mb-2 flex items-center">
                                <Search size={16} className="mr-1"/>
                                Retrieved Documents
                            </h3>
                            <div className="space-y-2">
                                {retrievedDocs.map((doc, index) => {
                                    return (
                                        <div
                                            key={doc.id}
                                            className={`p-2 rounded border transition-all ${
                                                'bg-green-50 border-green-200 cursor-pointer hover:bg-green-100'
                                            }`}
                                            onClick={() => toggleDocExpansion(doc.id)}
                                        >
                                            <div className="flex justify-between">
                                                <div
                                                    className="text-sm font-medium truncate">{doc.text.substring(0, 50)}...
                                                </div>
                                                <div className={`px-2 rounded text-xs ${
                                                    doc.score >= threshold ? 'bg-green-100' : 'bg-gray-200'
                                                }`}>
                                                    Score: {doc.score.toFixed(2)}
                                                </div>
                                            </div>

                                            {/* Expanded Document View - Only for selected documents */}
                                            {expandedDocId === doc.id && (
                                                <div className="mt-2 border-t pt-2 text-sm">
                                                    <div className="bg-white p-3 rounded mb-2">
                                                        <div className="font-medium mb-1">Full Content:</div>
                                                        <div className="whitespace-pre-wrap">{doc.text}</div>
                                                    </div>

                                                    <div className="bg-white p-3 rounded">
                                                        <div className="font-medium mb-1">Metadata:</div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <span
                                                                    className="text-gray-500">Source:</span> {doc.metadata.source}
                                                            </div>
                                                            <div>
                                                                <span
                                                                    className="text-gray-500">Distance:</span> {doc.metadata.distance.toFixed(4)}
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">ID:</span> {doc.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

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
