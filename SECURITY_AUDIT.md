# 🔒 Relatório de Segurança - Sistema Provedores Internet

## ✅ O que já está Bom

### 1. Row Level Security (RLS)
- Políticas de isolamento por organização implementadas
- Usuários só veem dados da própria organização
- Função `get_user_organization_id()` para controle de acesso

### 2. Autenticação
- Supabase Auth integrado
- JWT para Edge Functions
- Senhas com hash bcrypt

### 3. Edge Functions
- Rate limiting implementado nas automações
- Headers CORS configurados
- Validação de input nas principais funções

### 4. Variáveis de Ambiente
- Service Role Key protegida no backend
- Chaves públicas apenas no frontend (VITE_)

---

## ⚠️ Vulnerabilidades Encontradas

### CRÍTICAS

#### 1. CORS Allow-Origin: "*" em todas Edge Functions
```typescript
"Access-Control-Allow-Origin": "*"  // ❌ Permite qualquer domínio
```
**Risco:** Qualquer site pode fazer requisições para as Edge Functions
**Solução:** Definir domínios específicos permitidos

#### 2. Billing Automation sem validação robusta
```typescript
// ❌ Não valida se o usuário tem permissão
const { data: organizations } = await supabase
  .from("organizations")
  .select("id, name")
```
**Risco:** Pode expor dados de outras organizações
**Solução:** Adicionar validação de organização via RLS

### MÉDIAS

#### 3. Rate Limiting em memória (Edge Functions)
```typescript
const rateLimits = new Map<string, { count: number; resetAt: number }>();
```
**Risco:** Rate limits são por instância, não globais
**Solução:** Usar Supabase para persistir rate limits

#### 4. Sem proteção CSRF em webhooks
```typescript
// Webhook não valida origin/token secreto
if (device.webhook_url) { ... }
```
**Risco:** Webhooks podem ser invocados por atacantes
**Solução:** Validar signature/secret do webhook

#### 5. Sem input sanitization em alguns campos
**Risco:** Potencial XSS em campos de texto
**Solução:** Sanitizar todas as entradas do usuário

---

## 🔧 Melhorias Recomendadas

### Alta Prioridade

#### 1. Corrigir CORS para domínios específicos
```typescript
const ALLOWED_ORIGINS = [
  "https://vercel-deploy-inky-delta.vercel.app",
  "https://seudominio.com.br"
];

function getCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin || "") 
      ? origin 
      : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}
```

#### 2. Adicionar autenticação em todas Edge Functions
```typescript
// Verificar JWT antes de qualquer operação
const authHeader = req.headers.get("Authorization");
if (!authHeader) {
  return new Response("Unauthorized", { status: 401 });
}
```

#### 3. Implementar webhook signature validation
```typescript
async function verifyWebhookSignature(
  payload: string, 
  signature: string, 
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const expectedSig = await crypto.subtle.verify(
    "HMAC",
    key,
    Uint8Array.from(atob(signature), c => c.charCodeAt(0)),
    encoder.encode(payload)
  );
  return expectedSig;
}
```

### Média Prioridade

#### 4. Adicionar proteção Rate Limit no banco
```sql
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  requests INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key)
);
```

#### 5. Adicionar logging de segurança
```typescript
// Registrar tentativas de acesso
await supabase.from("security_logs").insert({
  organization_id: orgId,
  action: "billing_automation_executed",
  ip_address: req.headers.get("x-forwarded-for"),
  success: true,
  timestamp: new Date().toISOString()
});
```

#### 6. Sanitizar inputs
```typescript
import DOMPurify from "isomorphic-dompurify";

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}
```

---

## 📋 Checklist de Segurança

| Item | Status | Prioridade |
|------|--------|------------|
| RLS por organização | ✅ Implementado | - |
| Rate limiting | ⚠️ Parcial | Alta |
| CORS configurado | ❌ "*" | Alta |
| Webhook signature | ❌ Não implementado | Alta |
| Logging segurança | ❌ Não implementado | Média |
| Input sanitization | ⚠️ Parcial | Média |
| HTTPS forçado | ✅ Vercel faz | - |
| Headers segurança | ❌ Não implementado | Média |
| 2FA | ⏳ Supabase Auth | Baixa |

---

## 🚀 Plano de Ação

### Fase 1 (Crítico)
1. [x] ~~Corrigir CORS~~
2. [ ] Adicionar autenticação em todas Edge Functions
3. [ ] Implementar webhook signature validation

### Fase 2 (Importante)
4. [ ] Adicionar headers de segurança (CSP, HSTS, etc.)
5. [ ] Implementar logging de segurança
6. [ ] Adicionar rate limiting persistente

### Fase 3 (Desejável)
7. [ ] Sanitização de inputs
8. [ ] 2FA opcional
9. [ ] Audit trail completo

---

## 📞 Ferramentas de Monitoramento

Configure alertas em:
- **Supabase Dashboard** → Logs → Filtering
- **Vercel Analytics** → Performance + Errors
- **GitHub Actions** → Notifications on failure

---

*Relatório gerado em: 2026-04-16*
