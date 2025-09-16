// AI Proxy Server for Vercel
// This file should be in /api/ai-proxy.js

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get OpenAI API key from environment (server-side only)
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { prompt, idea } = req.body;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en análisis de negocios y planes de acción. Responde en español.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    return res.status(200).json({ 
      success: true, 
      content: data.choices[0].message.content 
    });

  } catch (error) {
    console.error('AI Proxy Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
