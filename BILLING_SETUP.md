# 💰 Automação de Cobrança - Guia de Configuração

Este documento explica como configurar e ativar o sistema de automação de cobrança.

## 📋 Visão Geral

O sistema executa automaticamente:

| Tarefa | Descrição |
|--------|-----------|
| **Gerar Faturas** | Cria faturas mensais para contratos ativos |
| **Notificações** | Lembretes por WhatsApp (7, 3, 1 dia antes) |
| **Suspensão** | Suspende inadimplentes (7+ dias) |
| **Reativação** | Reativa após pagamento |

## 🚀 Configuração

### 1. Secrets no GitHub

Vá em **Settings → Secrets and variables → Actions** e adicione:

| Secret | Descrição |
|--------|----------|
| `SUPABASE_URL` | URL do projeto (ex: `https://xxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (Dashboard → Settings → API) |
| `SUPABASE_PROJECT_ID` | ID do projeto |
| `SUPABASE_ACCESS_TOKEN` | Token de acesso (supabase.com → Profile → Access Tokens) |
| `SUPABASE_DB_PASSWORD` | Senha do banco de dados |

### 2. Executar Migration

A migration `20260415203000_billing_automation.sql` cria as tabelas necessárias:
- `billing_configurations` - Configurações por organização
- `billing_automation_logs` - Log de execuções
- `notification_templates` - Templates de mensagens
- `notification_control` - Controle de duplicatas

O workflow `deploy-supabase.yml` executa automaticamente quando há mudanças no Supabase.

### 3. Testar Manual

```bash
curl -X POST https://seu-projeto.supabase.co/functions/v1/billing-automation \
  -H "Authorization: Bearer sua-anon-key" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 4. Verificar Logs

```sql
-- Ver últimas execuções
SELECT * FROM billing_automation_logs ORDER BY created_at DESC LIMIT 10;

-- Ver notificações
SELECT * FROM notification_alerts ORDER BY created_at DESC LIMIT 20;
```

## ⏰ Agendamento

O workflow `.github/workflows/billing-cron.yml` executa todo dia às 6h automaticamente.

Para ativar:
1. Vá em **Actions** no GitHub
2. Selecione "Billing Automation"
3. Clique em **Run workflow**

## 📱 WhatsApp

A função usa `whatsapp-api` para enviar mensagens. Configure sua API do WhatsApp:

### Opções populares no Brasil:
- **Z-API**: z-api.io (~R$0,05/mensagem)
- **Kingmob**: kingmob.com.br (~R$0,04/mensagem)
- **Wizebot**: wizebot.com.br (grátis com limite)

### Para configurar:
1. Obtenha credenciais da API
2. Adicione no Supabase Dashboard → Settings → Edge Functions → Secrets:
   ```
   WHATSAPP_API_URL=sua_url
   WHATSAPP_API_TOKEN=seu_token
   ```

## 🔧 Troubleshooting

### Automação não executa
1. Verifique os secrets no GitHub
2. Teste manualmente via curl
3. Verifique logs em `billing_automation_logs`

### Clientes não são suspensos
1. Verifique se `suspend_after_days` está correto
2. Verifique se a fatura está com `status = 'pending'`
3. Verifique se o cliente está com `status = 'active'`

### WhatsApp não envia
1. Verifique se a API está configurada
2. Verifique se o telefone está correto (formato: 5511999999999)
3. Verifique logs da função `whatsapp-api`

## 📊 Monitoramento

```sql
-- Estatísticas por organização (últimos 30 dias)
SELECT 
    organization_id,
    SUM(invoices_generated) as total_faturas,
    SUM(notifications_sent) as total_notificacoes,
    SUM(customers_suspended) as total_suspensoes,
    SUM(customers_reactivated) as total_reativacoes
FROM billing_automation_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY organization_id;
```

## 🔒 Segurança

- Rate limiting: 10 execuções por minuto
- Service Role Key: apenas em Edge Functions
- RLS: organizações só veem seus próprios dados
