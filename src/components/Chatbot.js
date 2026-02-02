import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Namaste! I'm your Char Dham Yatra assistant. How can I help you today?",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    // Char Dham information
    if (message.includes('yamunotri')) {
      return "Yamunotri is the source of the Yamuna River, dedicated to Goddess Yamuna. It's located at an altitude of 3,293 meters. The temple opens in May and closes in November. The best time to visit is from May to June and September to October.";
    }

    if (message.includes('gangotri')) {
      return "Gangotri is the origin of the holy Ganges River, dedicated to Goddess Ganga. It's situated at 3,100 meters above sea level. The temple is open from May to November. The weather is pleasant during May-June and September-October.";
    }

    if (message.includes('kedarnath')) {
      return "Kedarnath is one of the 12 Jyotirlingas, dedicated to Lord Shiva. It's located at 3,583 meters in the Garhwal Himalayas. The temple opens in late April/early May and closes in November. It's accessible by trekking or helicopter.";
    }

    if (message.includes('badrinath')) {
      return "Badrinath is the abode of Lord Vishnu, one of the most important pilgrimage sites. It's situated at 3,133 meters. The temple opens in late April/early May and closes in November. It's easily accessible by road.";
    }

    if (message.includes('weather') || message.includes('climate')) {
      return "The weather in Char Dham varies with altitude. Summer (May-June) is pleasant with temperatures 15-25°C. Monsoon (July-August) brings heavy rainfall. Winter (November-April) is extremely cold with snow. Best time to visit is May-June and September-October.";
    }

    if (message.includes('best time') || message.includes('when to visit')) {
      return "The best time to visit Char Dham is from May to June and September to October. During these months, the weather is pleasant, roads are accessible, and all temples are open. Avoid monsoon (July-August) due to heavy rainfall and landslides.";
    }

    if (message.includes('package') || message.includes('tour') || message.includes('booking')) {
      return "We offer various packages for Char Dham Yatra. You can explore our packages section to see different tour options, durations, and prices. All packages include accommodation, transportation, and meals.";
    }

    if (message.includes('distance') || message.includes('route') || message.includes('how to reach')) {
      return "The Char Dham circuit typically starts from Haridwar/Rishikesh. The route is: Haridwar → Yamunotri → Gangotri → Kedarnath → Badrinath. Total distance is approximately 1,600 km. You can travel by road, and for Kedarnath, you'll need to trek or take a helicopter.";
    }

    if (message.includes('accommodation') || message.includes('hotel') || message.includes('stay')) {
      return "Accommodation options vary from budget guesthouses to comfortable hotels. All our packages include accommodation. During peak season (May-June), it's advisable to book in advance. Basic facilities are available at all locations.";
    }

    if (message.includes('preparation') || message.includes('what to carry') || message.includes('essentials')) {
      return "Essential items to carry: warm clothes, raincoat, comfortable trekking shoes, first aid kit, water bottles, dry fruits, identity proof, and necessary medications. Physical fitness is important, especially for Kedarnath trek.";
    }

    if (message.includes('hello') || message.includes('hi') || message.includes('namaste')) {
      return "Namaste! I'm here to help you with information about Char Dham Yatra. You can ask me about the four temples, weather, best time to visit, packages, routes, or any other questions.";
    }

    if (message.includes('help')) {
      return "I can help you with information about: Yamunotri, Gangotri, Kedarnath, Badrinath, weather conditions, best time to visit, tour packages, routes and distances, accommodation, and preparation tips. What would you like to know?";
    }

    if (message.includes('track') || message.includes('location') || message.includes('map')) {
      return "You can track your live location and find the nearest temple using our Map feature. Go to the 'Map' section in the menu and click on 'Get My Location' to start tracking.";
    }

    if (message.includes('current weather') || message.includes('my weather')) {
      return "To check the weather at your current location, visit the 'Weather' page and click on 'Get My Location Weather' button. We also show real-time weather for all Char Dham locations.";
    }

    // Default response
    return "I'm here to help you with Char Dham Yatra information. You can ask me about the four temples (Yamunotri, Gangotri, Kedarnath, Badrinath), weather, best time to visit, packages, routes, or accommodation. How can I assist you?";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate bot thinking
    setTimeout(() => {
      const botMessage = {
        text: getBotResponse(input),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Char Dham Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn">×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-content">{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="chatbot-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about Char Dham..."
              className="chatbot-input"
            />
            <button type="submit" className="send-btn">Send</button>
          </form>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-toggle"
        aria-label="Toggle chatbot"
      >
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  );
};

export default Chatbot;
