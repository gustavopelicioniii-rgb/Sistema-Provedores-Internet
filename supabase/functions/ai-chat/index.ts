/**
 * AI CHAT - MiniMax Integration
 * 
 * Provides AI-powered chat for ISP management system
 * Uses MiniMax API for natural language processing
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MINIMAX_API_KEY = Deno.env.get("MINIMAX_API_KEY");
const MINIMAX_BASE_URL = "https://api.minimax.chat";

const SYSTEM_PROMPT = `Você é o assistente IA integrado de um sistema de gestão para provedores de internet (ISP) brasileiro chamado NetPulse.
Você pode ajudar com:
- Dúvidas sobre o sistema (clientes, contratos, faturas, tickets, ordens de serviço, rede, estoque, frota, automações)
- Análise de dados e métricas do provedor
- Sugestões de automações e fluxos de trabalho
- Boas práticas de gestão de ISP
- Troubleshooting de rede e equipamentos MikroTik, OLT, etc
- Dúvidas sobre cobrança, fiscal (NFSe, CND) e financeiro
- Configuração de planos, pacotes e promoções
- Monitoramento NOC e alertas de rede

Instruções:
- Responda sempre em português brasileiro
- Use markdown para formatar suas respostas
- Seja proativo em sugerir soluções
- Para dados do sistema, use ferramentas disponíveis quando solicitado
- Máximo 500 tokens por resposta

Dados do sistema:
- ERP completo para ISPs
- Gestão de clientes e contratos  
- Faturas e cobranças (ASAAS, Pagar.me)
- NOC integrado para monitoramento
- Automação de suspensão/reativação
- Portal do assinante
- App técnico em campo`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!MINIMAX_API_KEY) {
    return new Response(
      JSON.stringify({ error: "MINIMAX_API_KEY não configurada" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages, stream = true } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format messages for MiniMax
    const formattedMessages = [
      { role: "system", name: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        name: m.name || "user",
        content: m.content
      }))
    ];

    if (stream) {
      // Streaming response
      const response = await fetch(`${MINIMAX_BASE_URL}/v1/text/chatcompletion_v2`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MINIMAX_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "MiniMax-Text-01",
          messages: formattedMessages,
          stream: true,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("MiniMax API error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: `Erro da API MiniMax: ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Transform MiniMax stream to OpenAI-compatible format
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          const encoder = new TextEncoder();

          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") {
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    break;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    // MiniMax stream format to OpenAI format
                    if (parsed.choices?.[0]?.delta?.content) {
                      const content = parsed.choices[0].delta.content;
                      const openAIFormat = {
                        choices: [{
                          delta: { content },
                          index: 0,
                          finish_reason: null
                        }],
                        id: parsed.id || "chatcmpl-minimax",
                        object: "chat.completion.chunk",
                        created: Math.floor(Date.now() / 1000),
                      };
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIFormat)}\n\n`));
                    }
                  } catch (e) {
                    // Skip malformed JSON
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });

    } else {
      // Non-streaming response
      const response = await fetch(`${MINIMAX_BASE_URL}/v1/text/chatcompletion_v2`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MINIMAX_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "MiniMax-Text-01",
          messages: formattedMessages,
          stream: false,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("MiniMax API error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: `Erro da API MiniMax: ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      
      // Transform MiniMax response to OpenAI-compatible format
      // MiniMax uses 'messages' array in choices, not 'message' object
      const assistantMessage = data.choices?.[0]?.messages?.[0]?.content || 
                              data.choices?.[0]?.text || "";
      
      const openAIResponse = {
        id: data.id || "chatcmpl-minimax",
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "MiniMax-Text-01",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: assistantMessage,
          },
          finish_reason: "stop",
        }],
        usage: {
          prompt_tokens: data.usage?.prompt_tokens || 0,
          completion_tokens: data.usage?.completion_tokens || 0,
          total_tokens: (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0),
        },
      };

      return new Response(JSON.stringify(openAIResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (e) {
    console.error("AI chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
