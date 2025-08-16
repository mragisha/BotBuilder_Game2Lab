import { useState } from "react";   
import './App.css';
import ReactMarkdown from 'react-markdown';



export default function BotConfigForm() {


    //UseState hook to manage form data
    //formData: holds the current state of the form inputs
    //setFormData: function to update the formData state

    //Intital state of form data
    const [formData, setFormData] = useState({
        botName: '',
        persona: '',
        model: 'llama3',
        safetyRules: 'Be helpful and harmless. Avoid inappropriate content.'
    });

  //handle messages
  const [messages, setMessages] = useState([]);
  //handle change of user input
  const [userInput, setUserInput] = useState('');
  //handle typing state
  const [isTyping, setIsTyping] = useState(false);
  //handle bot configuration state
  const [isBotConfigured, setIsBotConfigured] = useState(false);
  //handle chatLog
  const [chatLog, setChatLog] = useState([]);

  //handle input change in the form
  const handleInputChange = (e) => {
    //name is the name of the input field
    //value is the value entered by the user
    const { name, value } = e.target;
    //prev is the previous state of formData
    //setFormData updates the formData state with the new value - whichever value changes
    setFormData(prev => ({
      ...prev,
        [name]: value
    }));
  };

  //Get current timestamp
  const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
   // Truncate text for log display
   const truncateText = (text, maxLength = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  //Add entry to chat log
  const addToLog = (prompt,response) =>{
    //Create a log entry with timestamp, model, prompt and response
    const logEntry = {
      timestamp: getCurrentTimestamp(),
      model: formData.model,
      prompt: truncateText(prompt),
      response: truncateText(response)
    };

    setChatLog(prev => {
      const newLog = [logEntry, ...prev];
      //Limit log to last 5 entries
      return newLog.slice(0, 5);
    });
  };

  //handle form submission
  const handleSubmit = () => {
    //Check if botName and persona are filled
    if (!formData.botName.trim() || !formData.persona.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    //Set bot as configured
    setIsBotConfigured(true);
    //Set initial message from bot
    setMessages([{
      type: 'bot',
      text: `Hi! I'm ${formData.botName}. ${formData.persona} How can I help you?`
    }]);
    alert('Bot configured successfully!');
  };

  //Function to send message to the bot
  const sendMessage = async () => {
    //If user input is empty, return
    if (!userInput.trim()) return;

    //Create a new user message object
    const timestamp = getCurrentTimestamp();
    const newUserMessage = {
      type: 'user',
      text: userInput,
      timestamp: timestamp
    };

    //Update messages state with the new user message
    setMessages(prev => [...prev, newUserMessage]);
    //Clear user input field
    setUserInput(''); 
    //Set loading state to true
    setIsTyping(true);

    try {
      //Send POST request to the backend API to generate bot response
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: formData.model,
          prompt: `You are ${formData.botName}. ${formData.persona} Format the response properly in points and paragraph so that it is easy to understand\n\nUser: ${userInput}\nAssistant:`,
          stream: false
        })
      });
        //Check if response is ok
        if (response.ok) {
            //Parse the response data
            const data = await response.json();
            //Create a new bot message object with the response
            const botMessage = {
              type: 'bot',
              text: data.response
            };
            //Update messages state with the new bot message
            setMessages(prev => [...prev, botMessage]);
            addToLog(userInput, data.response); 
        } else {
            throw new Error('Failed to get response');
        }
    } catch (error) {
        const errorMessage = {
            type: 'bot',
            text: 'Sorry, I cannot respond right now. Please make sure Ollama is running on your system.'
        };
        setMessages(prev => [...prev, errorMessage]);
    }
    //Set loading state to false
    setIsTyping(false);

    }

    const handleKeyPress = (e) => {
    //Check if the pressed key is Enter
    if (e.key === 'Enter') {
      sendMessage();
    }
    }

    return (
        <div className="container">
            {/* Left Panel - Form */}
            <div className="leftPanel">
                    <h2 className="title">Bot Configuration</h2>
                    {/*Bot Name*/}
                    <div className="formGroup">
                        <label htmlFor="botName" className="label">Bot Name</label>
                        <input 
                            type="text"
                            id="botName"
                            name="botName"
                            value={formData.botName}
                            onChange={handleInputChange}
                            className="input"
                            placeholder="Enter bot name"
                            />
                    </div>
                    {/*Persona*/}
                    <div className="formGroup">
                        <label htmlFor="persona" className="label">Persona</label>
                        <textarea
                            id="persona"
                            name="persona"
                            value={formData.persona}
                            onChange={handleInputChange}
                            className="textarea"
                            placeholder="Describe the bot's personality"
                            rows={3}
                        />
                    </div>
                    {/*Model*/}
                    <div className="formGroup">
                        <label htmlFor="model" className="label">Model</label>
                        <select
                            id="model"
                            name="model"
                            value={formData.model}
                            onChange={handleInputChange}
                            className="select"
                        >
                            <option value="llama3">Llama3</option>
                            <option value="mistral">Mistral</option>
                        </select>
                    </div>
                    {/*Safety Rules*/}
                    <div className="formGroup">
                      <label htmlFor="safetyRules" className="label">Safety Rules</label>
                      <textarea
                        id="safetyRules"
                        name="safetyRules"
                        value={formData.safetyRules}
                        onChange={handleInputChange}
                        className="textarea"
                        placeholder="Define safety guidelines"
                        rows={3}
                      />
                    </div>

                    {/*Submit Button*/}
                    <button onClick={handleSubmit} className="submitBtn">
                        Configure Bot
                    </button>
                
            </div>

            {/* Middle Panel - Chat Interface */}
            <div className="middlePanel">
                <div className="chatHeader">
                    <h3 className="chatTitle">
                        {isBotConfigured ? formData.botName : 'Chat Interface'}
                    </h3>
                    <p className="chatStatus">
                        {isBotConfigured
                            ? `Model: ${formData.model} | Ready to chat` 
                            : 'Please configure your bot first'
                        }
                    </p>
                </div>

                <div className="messagesContainer">
                    {/* If there is no message */}
                    {messages.length == 0 && (
                        <p style={{ color: '#666', textAlign: 'center', marginTop: '50px' }}>
                            {isBotConfigured ? 'Start a conversation!' : 'Configure your bot to start chatting'}
                        </p>
                    )}

                    {/* Map through messages and display them */}
                    {messages.map((message, index) => (
                        <div 
                            key={index}
                            className={`message ${message.type === 'user' ? 'userMessage' : 'botMessage'}`}>
                              <div className="messageHeader">
                                <span className="messageTime">{message.timestamp}</span>
                              </div>
                              <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="message botMessage">
                            <div className="messageHeader">
                                <span className="messageTime">{getCurrentTimestamp()}</span>
                            </div>
                            <div className="typingIndicator">
                              <span>{formData.botName || 'Bot'} is thinking...</span>
                            </div>
                    
                        </div>
                    )}     
                
                </div>

                <div className="inputContainer">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="chatInput"
                        placeholder={isBotConfigured ? "Type your message..." : "Configure bot first"}
                        disabled={!isBotConfigured}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!isBotConfigured || isTyping || !userInput.trim()}
                        className={`sendBtn ${(!isBotConfigured || isTyping || !userInput.trim()) ? 'disabledBtn' : ''}`}
                    >
                    Send
                    </button>
                </div>
            </div> 

            {/* Right Panel - Chat Log */}
            <div className="rightPanel">
              <div className="logContainer">
                <h2 className="logTitle">Chat Log</h2>
                {chatLog.length === 0 ? (
                  <p className="noLogMessage">No conversation yet. <br />Start chatting to see history!</p>
                ) : (
                  chatLog.map((entry,index) =>(
                    <div key={index} className="longEntry">
                      <div className="logTime">{entry.timestamp}</div>
                      <div className="logModel">Model: {entry.model}</div>
                      <div className="logText"><strong>Question:</strong> {entry.prompt}</div>
                      <div className="logText"><strong>Response:</strong> {entry.response}</div>
                    </div>
                  ))
                )}
              </div>
              </div>              
        </div>
    );

}

