// Use your computer's local IP address here
const API_URL = 'http://192.168.1.231:3000';

export const generateAIResponse = async (userMessage: string): Promise<string> => {
  try {
    console.log('Sending request to:', `${API_URL}/chat`);
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get response from server');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "Dude, I'm having trouble connecting to the cosmic consciousness right now...";
  }
}; 