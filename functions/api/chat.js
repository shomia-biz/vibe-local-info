export async function onRequestPost(context) {
  try {
    const { messages } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are an AI assistant for a Korean local information blog. Answer in Korean.' },
        ...messages
      ],
      max_tokens: 300
    });

    return new Response(JSON.stringify(response), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
