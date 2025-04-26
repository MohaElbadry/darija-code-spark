import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// --- Gemini API Configuration ---
// IMPORTANT: Store your Gemini API Key securely as a Supabase Secret:
// Go to Project Settings > Edge Functions > Add new secret > Name: GEMINI_API_KEY, Value: your_api_key
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
// Choose the appropriate Gemini model
const GEMINI_MODEL = "gemini-1.5-flash-latest"; // Or another suitable model
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Get system prompt based on language preference
function getSystemPrompt(language: string): string {
  switch (language.toLowerCase()) {
    case 'darija':
      return `
        أنت مساعد ذكي ودود متخصص في البرمجة. مهمتك هي مساعدة المستخدمين على تعلم البرمجة باللهجة المغربية (الدارجة).
        يجب عليك الإجابة على أسئلة المستخدمين حول البرمجة بالدارجة المغربية.
        إذا كان هناك مصطلحات تقنية لا يوجد لها ترجمة مباشرة في الدارجة، فاستخدم المصطلح الإنجليزي مع شرح بسيط.
        كن مشجعا، صبورا، وداعما للمستخدمين على مختلف مستويات المهارة.
        عندما يُطلب منك تقديم خيارات متعددة، اكتب الإجابات بدون استخدام علامات النجمة أو الشرطات أو أي علامات تنسيق.
        قم دائمًا بإعطاء الإجابة مباشرة دون استخدام رموز التنسيق.
      `;
    case 'arabic':
      return `
        أنت مساعد ذكي ودود متخصص في البرمجة. مهمتك هي مساعدة المستخدمين على تعلم البرمجة باللغة العربية.
        يجب عليك الإجابة على أسئلة المستخدمين حول البرمجة بالعربية.
        إذا كان هناك مصطلحات تقنية لا يوجد لها ترجمة مباشرة في العربية، فاستخدم المصطلح الإنجليزي مع شرح بسيط.
        كن مشجعا، صبورا، وداعما للمستخدمين على مختلف مستويات المهارة.
        عندما يُطلب منك تقديم خيارات متعددة، اكتب الإجابات بدون استخدام علامات النجمة أو الشرطات أو أي علامات تنسيق.
        قم دائمًا بإعطاء الإجابة مباشرة دون استخدام رموز التنسيق.
      `;
    case 'french':
      return `
        Vous êtes un assistant intelligent et amical spécialisé dans la programmation. Votre mission est d'aider les utilisateurs à apprendre la programmation en français.
        Vous devez répondre aux questions des utilisateurs sur la programmation en français.
        S'il y a des termes techniques qui n'ont pas de traduction directe en français, utilisez le terme anglais avec une brève explication.
        Soyez encourageant, patient et solidaire des utilisateurs de tous niveaux de compétence.
        Lorsqu'on vous demande de fournir plusieurs options, écrivez les réponses sans utiliser d'astérisques, de tirets ou d'autres marques de formatage.
        Donnez toujours la réponse directement sans utiliser de symboles de formatage.
      `;
    default: // English
      return `
        You are an intelligent and friendly assistant specialized in programming. Your mission is to help users learn programming in English.
        You should answer users' questions about programming in English.
        Be encouraging, patient, and supportive of users of all skill levels.
        When asked to provide multiple options, write the answers without using asterisks, bullets, or any formatting marks.
        Always give the answer directly without using formatting symbols.
      `;
  }
}

// Function to clean response text from markdown formatting
function cleanResponseText(text: string): string {
  // Remove markdown asterisks (bold/italic formatting)
  let cleaned = text.replace(/\*\*?(.*?)\*\*?/g, '$1');
  
  // Remove markdown bullet points
  cleaned = cleaned.replace(/^\s*[\*\-]\s+/gm, '');
  
  // Remove backticks used for code formatting
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  return cleaned;
}

// --- Edge Function Handler ---
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // 1. Get data from the request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    const { message, language = 'english', chatHistory = [] } = requestData;
    
    if (!message) {
      return new Response(JSON.stringify({ error: "Missing message parameter" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return new Response(JSON.stringify({ error: "API key configuration error" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Received request:', { language, messageLength: message.length });

    // 2. Prepare the chat history for Gemini
    const systemPrompt = getSystemPrompt(language);
    
    // Format the chat history for Gemini API
    const formattedHistory = chatHistory.map((entry: any) => ({
      role: entry.role === 'user' ? 'user' : 'model',
      parts: [{ text: entry.content }]
    }));

    // Add system prompt as a "model" message at the beginning if there's no history
    // or the first message isn't already a system prompt
    if (formattedHistory.length === 0 || 
        (formattedHistory[0].role !== 'model' && !formattedHistory[0].parts[0].text.includes('assistant'))) {
      formattedHistory.unshift({
        role: 'model',
        parts: [{ text: systemPrompt }]
      });
    }

    // Add the current user message
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // 3. Call the Gemini API
    const geminiPayload = {
      contents: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };

    let geminiRes;
    try {
      geminiRes = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiPayload),
      });
    } catch (error) {
      console.error("Network error when calling Gemini API:", error);
      return new Response(JSON.stringify({ error: "Failed to connect to AI service" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!geminiRes.ok) {
      const errorBody = await geminiRes.text();
      console.error("Gemini API Error Response:", errorBody);
      return new Response(JSON.stringify({ error: `AI service error: ${geminiRes.status} ${geminiRes.statusText}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502, // Bad Gateway to indicate upstream service error
      });
    }

    const geminiData = await geminiRes.json();
    
    // 4. Extract and return the assistant's response
    const generatedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error("Could not extract text from Gemini response:", geminiData);
      return new Response(JSON.stringify({ error: "Invalid response from AI service" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      });
    }

    // Clean the response text to remove markdown formatting
    const cleanedText = cleanResponseText(generatedText);

    // 5. Return the response
    return new Response(
      JSON.stringify({ 
        reply: cleanedText,
        model: GEMINI_MODEL
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown server error" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 