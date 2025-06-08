const API_URL = 'http://localhost:3000';

export const testConnection = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/test`);
    if (!response.ok) {
      throw new Error('Failed to connect to test server');
    }
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Test connection error:', error);
    return 'Failed to connect to test server';
  }
};

export const testChat = async (message: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from test server');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Test chat error:', error);
    return 'Failed to get response from test server';
  }
}; 