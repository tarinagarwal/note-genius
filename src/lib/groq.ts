import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const generateResponse = async (imageData: string): Promise<string> => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageData
              }
            },
            {
              type: 'text',
              text: 'Analyze this whiteboard drawing and provide a response in markdown format. If it contains:\n\n- Mathematical equations: Show the solution steps\n- Code: Explain the logic and suggest improvements\n- Diagrams/flowcharts: Describe the structure and relationships\n\nFocus only on the content visible in the drawing.'
            }
          ]
        }
      ],
      model: 'llama-3.2-90b-vision-preview',
      temperature: 0.7,
      max_tokens: 2048,
    });

    return completion.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};