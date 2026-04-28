const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], forceNER: true });

// Train Intents
const trainNLP = async () => {
  // Routes
  manager.addDocument('en', 'what is the route', 'yatra.route');
  manager.addDocument('en', 'how do i go to kedarnath', 'yatra.route');
  manager.addDocument('en', 'sequence of chardham', 'yatra.route');
  manager.addDocument('en', 'tell me the path', 'yatra.route');
  manager.addDocument('en', 'where do we start', 'yatra.route');

  // Budget
  manager.addDocument('en', 'what is the cost', 'yatra.budget');
  manager.addDocument('en', 'cheap options', 'yatra.budget');
  manager.addDocument('en', 'is it expensive', 'yatra.budget');
  manager.addDocument('en', 'what is my budget', 'yatra.budget');
  manager.addDocument('en', 'price details', 'yatra.budget');

  // Recommendations
  manager.addDocument('en', 'recommend a package', 'yatra.recommendation');
  manager.addDocument('en', 'which one is the best', 'yatra.recommendation');
  manager.addDocument('en', 'short trip', 'yatra.recommendation');
  manager.addDocument('en', 'suggest a tour', 'yatra.recommendation');
  manager.addDocument('en', 'what should I book', 'yatra.recommendation');

  // Features
  manager.addDocument('en', 'what is included', 'yatra.features');
  manager.addDocument('en', 'hotels', 'yatra.features');
  manager.addDocument('en', 'transportation', 'yatra.features');
  manager.addDocument('en', 'do you provide food', 'yatra.features');
  manager.addDocument('en', 'guide included', 'yatra.features');

  // Experience & Past Reviews
  manager.addDocument('en', 'is it hard', 'yatra.experience');
  manager.addDocument('en', 'what do people say', 'yatra.experience');
  manager.addDocument('en', 'reviews', 'yatra.experience');
  manager.addDocument('en', 'fitness required', 'yatra.experience');
  manager.addDocument('en', 'past experience of other people', 'yatra.experience');

  // Greetings
  manager.addDocument('en', 'hello', 'greetings.hello');
  manager.addDocument('en', 'hi', 'greetings.hello');
  manager.addDocument('en', 'hey', 'greetings.hello');
  manager.addDocument('en', 'bye', 'greetings.bye');

  // Answers
  manager.addAnswer('en', 'yatra.route', 'The traditional Char Dham sequence is West to East: Yamunotri, Gangotri, Kedarnath, and finally Badrinath. We offer packages that cover this exact route starting from Haridwar/Dehradun!');
  manager.addAnswer('en', 'yatra.budget', 'Our packages range from ₹15,000 for budget trips up to ₹45,000 for luxury or helicopter tours. The price includes transport, accommodation, and meals. Check our "Packages" page for dynamic pricing deals!');
  manager.addAnswer('en', 'yatra.recommendation', 'If you are short on time, I highly recommend the "Do Dham Yatra" (Kedarnath & Badrinath) which takes 5-6 days. For the full experience, the "Complete Char Dham Yatra" is 10-12 days. Check the "Recommended For You" section on the Packages page!');
  manager.addAnswer('en', 'yatra.features', 'Our packages generally include comfortable hotel stays, daily breakfast and dinner, AC transportation (Innova/Tempo Traveller), and a knowledgeable local guide. Helicopter tickets can be added as extras.');
  manager.addAnswer('en', 'yatra.experience', 'The Yatra is spiritually rewarding but physically demanding, especially the 16km Kedarnath trek. Past pilgrims highly recommend carrying warm clothes, basic medicines, and preparing with some light cardio 2 months before the trip. Most reviews praise the breathtaking views and our supportive guides!');
  
  manager.addAnswer('en', 'greetings.hello', 'Namaste! 🙏 I am your Char Dham AI assistant. How can I help you plan your spiritual journey?');
  manager.addAnswer('en', 'greetings.bye', 'Har Har Mahadev! Safe travels, and let us know if you need any more help.');

  // Train the model
  await manager.train();
  manager.save();
  console.log('[NLP] Chatbot trained successfully.');
};

const processMessage = async (message) => {
  const response = await manager.process('en', message);
  return response.answer || "I'm sorry, I didn't quite catch that. You can ask me about routes, budget, recommendations, or what's included in our packages!";
};

module.exports = { trainNLP, processMessage };
