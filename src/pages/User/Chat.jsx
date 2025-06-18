import { useEffect, useRef, useState } from 'react';

const Chat = () => {
    const url = import.meta.env.VITE_CHATBOT_BASE_URL || 'http://localhost:5000';
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [typing, messages]);
    const sendMessage = async () => {
        const userMsg = input.trim();
        if (!userMsg || isDisabled) return;

        setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setTyping('...');
        setIsDisabled(true);

        try {
            const res = await fetch(`${url}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });

            const data = await res.json();
            typeBotResponse(data);
        } catch (err) {
            console.error(' API error:', err);
            setMessages((prev) => [...prev, { sender: 'bot', text: 'Something went wrong. Please try again.' }]);
            setTyping('');
            setIsDisabled(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    };

    const typeBotResponse = (response) => {
        setTyping('');

        if (!response || response.length === 0) {
            setMessages((prev) => [...prev, { sender: 'bot', text: "Sorry, I didn't get that." }]);
            setIsDisabled(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            return;
        }

        if (response[0].message) {
            typeTextLineByLine({
                text: response[0].message,
            });
        } else if (response[0].Book) {
            const intro = 'Here are some recommended books you might enjoy:\n\n';
            const html = response
                .map((book, index) => {
                    return `${index + 1}. <strong>${book.Book.trim()}</strong> by <i>${book.Authors.trim()}</i> <br>${book.Feedback ? book.Feedback.trim() : ''}`;
                })
                .join('<br><br>');
            const text = response
                .map((book, index) => {
                    return `${index + 1}. ${book.Book.trim()} by ${book.Authors.trim()}\n${book.Feedback ? book.Feedback.trim() : ''}`;
                })
                .join('\n\n');

            typeTextLineByLine({
                html: intro + html,
                text: intro + text,
            });
        }
    };

    const typeTextLineByLine = (fullText) => {
        let index = 0;
        setTyping('');

        setTimeout(() => {
            const interval = setInterval(() => {
                if (index < fullText.text.length) {
                    setTyping((prev) => prev + fullText.text.charAt(index));
                    index++;
                } else {
                    clearInterval(interval);
                    setMessages((prev) => [...prev, Object.assign({ sender: 'bot' }, fullText)]);
                    setTyping('');
                    setIsDisabled(false);
                    setTimeout(() => {
                        inputRef.current?.focus();
                    }, 50);
                }
            }, 5);
        }, 10);
    };

    const linkifyText = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = [];
        let lastIndex = 0;

        const matches = [...text.matchAll(urlRegex)];

        for (const match of matches) {
            const url = match[0];
            const startIndex = match.index;

            // Thêm phần text trước URL
            if (startIndex > lastIndex) {
                parts.push(text.slice(lastIndex, startIndex));
            }

            // Thêm link
            parts.push(
                <a
                    key={startIndex}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-blue-500 underline"
                >
                    {url}
                </a>,
            );

            lastIndex = startIndex + url.length;
        }

        // Thêm phần text còn lại
        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts;
    };

    return (
        <div className="rounded bg-white p-4 shadow">
            <div className="mb-4 h-[520px] overflow-y-auto pr-4 whitespace-pre-line">
                {messages.map((msg, i) => (
                    <div key={i} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <span
                            className={`inline-block max-w-[80%] rounded-lg px-3 py-2 ${
                                msg.sender === 'user' ? 'bg-blue-200 text-black' : 'bg-gray-200 text-black'
                            }`}
                        >
                            {msg.html ? <span dangerouslySetInnerHTML={{ __html: msg.html }} /> : linkifyText(msg.text)}
                        </span>
                    </div>
                ))}
                {typing && <div className="text-left text-gray-500 italic">{typing}</div>}
                <div ref={chatEndRef} />
            </div>
            <div className="flex">
                <input
                    type="text"
                    ref={inputRef}
                    value={input}
                    disabled={isDisabled}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={isDisabled ? 'Bot is typing...' : 'Type your message...'}
                    className="flex-grow rounded-l border px-4 py-2 outline-none"
                />
                <button
                    onClick={sendMessage}
                    disabled={isDisabled}
                    className={`cursor-pointer rounded-r px-4 py-2 text-white ${
                        isDisabled ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
