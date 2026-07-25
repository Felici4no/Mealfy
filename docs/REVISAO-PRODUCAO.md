# Revisão para produção — modularidade do fornecimento e entrega digital

> Foco desta revisão: **trocar o fornecimento de gift card sem reescrever o núcleo**
> (hoje compra/venda na mão, amanhã API do iFood) e tratar a entrega como
> **fulfillment digital**. Complementa [`PRODUCAO-READINESS.md`](./PRODUCAO-READINESS.md),
> que cobre deploy/segurança/LGPD.

---

## 0. Antes de tudo: "produto digital" é uma decisão com consequência dupla ⚠️

Vale separar **arquitetura** de **enquadramento comercial** — são coisas diferentes e
misturá-las custa dinheiro:

| | Arquitetura (técnico) | Enquadramento (loja + fiscal) |
|---|---|---|
| O que é | Pipeline de fulfillment digital: pagou → emite → entrega código | Como você **declara** a transação |
| Recomendação | ✅ Sim, trate como produto digital. É o desenho certo e já é o que o código faz | ⚠️ **Cuidado** com "venda de produto digital" |

**Por quê o cuidado:** doações beneficentes são **isentas** da obrigação de usar o
Google Play Billing. Gift card consumido no mundo real (comida) normalmente também.
Mas se a ficha da loja descrever "venda de produto digital", você convida o revisor a
aplicar as regras de bens digitais — e aí o Play Billing passa a ser exigido, com
**15–30% de comissão sobre cada doação**. No fiscal brasileiro a diferença é igualmente
grande (venda de produto vs. recebimento de doação têm tributação distinta — já está
como pendência de contador no roadmap).

**Sugestão:** manter o enquadramento de **doação/apoio** na loja e no fiscal, e usar o
modelo de produto digital apenas como **arquitetura interna de entrega**. Confirmar com
contador/advogado antes de publicar.

---

## 1. Modularidade do fornecimento — o que já está pronto ✅

A abstração que você quer **já existe e está bem feita**. Não precisa construir, precisa
endurecer:

- `GiftCardProvider` (`giftCards/providers/gift-card-provider.ts`): `getCatalog`,
  `checkAvailability`, `purchaseGiftCard`, `getOrderStatus`, `cancelOrder?`
- `ManualInventoryGiftCardProvider` implementado (estoque importado à mão)
- Fábrica por env (`GIFT_CARD_PROVIDER`); `ifood_card`, `todo_incomm`, etc. são
  placeholders declarados
- Orquestrador (`donationFulfillment.service.ts`) com desenho de **2 fases**: marca
  em andamento → chama o provider **fora** da transação → claim atômico
- `manual_review` **preserva o código já comprado** (cifrado) em vez de perder dinheiro
- Códigos nunca em texto puro: `codeEncrypted` + `codeMasked` + `codeHash`
- `idempotencyKey` por doação na compra

Isso significa que a troca de fornecedor **não deveria** exigir mexer no núcleo. Os 4
pontos abaixo são onde essa promessa ainda não se sustenta.

---

## 2. Os 4 gaps reais para plugar o iFood amanhã

### 2.1 🔴 Provider é global, mas a marca é por doação
`GIFT_CARD_PROVIDER` é **uma** variável e `giftCardProvider` é um singleton de módulo.
Só que a marca do cartão (`ifood` / `ninetynine` / `carrefour`) é escolhida **por doação**.

**Consequência:** você não consegue ter *"iFood via API + Carrefour via estoque manual"*
ao mesmo tempo — que é exatamente o estado de transição que você vai viver.

**Revisar:** trocar o singleton por um **registry por marca** com fallback:
```
resolveProvider(brand) → provider   // ifood → IfoodApiProvider
                                    // carrefour → ManualInventory (fallback)
```

### 2.2 🔴 A compra é assumida como síncrona
`PurchaseGiftCardOutput.code` é **obrigatório** (`code: string`) — o contrato só admite
"comprei e já tenho o código". Uma API de fornecedor real costuma ser **assíncrona**:
aceita o pedido e entrega o código depois (webhook ou polling).

Os estados já existem (`gift_card_purchase_pending`, tabela `GiftCardOrder`), mas o
contrato não expressa "aceito, código vem depois".

**Revisar:** tornar o retorno uma união discriminada:
```ts
| { status: 'issued';  code: string; ... }
| { status: 'pending'; externalOrderId: string }   // código chega depois
```

### 2.3 🔴 Não existe reconciliação — risco de pedido órfão
`getOrderStatus` está no contrato mas **nunca é chamado**. Não há job que verifique
orders presas em `processing`.

**Consequência:** com fornecedor assíncrono (ou queda de rede no meio da compra), o
pedido fica órfão — **doador pagou, família não recebeu, e ninguém é avisado**. Hoje
está mascarado porque o `manual_inventory` é local e síncrono.

**Revisar:** cron de reconciliação que varre `processing` antigas, consulta
`getOrderStatus` e conclui ou escala para `manual_review` + **alerta**.

### 2.4 🟡 `existingGiftCardId` vaza o modelo manual no contrato genérico
O campo existe em `PurchaseGiftCardOutput` só para o `manual_inventory` (reclamar um
`GiftCard` já em estoque). Funciona — providers de API deixam `undefined` e o
orquestrador cria a linha nova — mas é o único ponto onde a abstração se curva para uma
implementação específica.

**Revisar:** não é bug; decidir se vale isolar (ex.: o provider devolver sempre um
código e o "reclamar do estoque" ficar interno ao manual provider).

---

## 3. Revisão por área

### Pagamento
- [ ] `PAYMENT_PROVIDER=stripe` + chaves (boot já falha sem elas ✅)
- [ ] Endpoint de webhook registrado no Stripe com os 4 eventos (ver [`PAGAMENTOS-GOOGLE-PAY.md`](./PAGAMENTOS-GOOGLE-PAY.md))
- [ ] Confirmar que **nada** libera vale fora do webhook
- [ ] `rawBody` preservado — se alguém trocar o parser em `app.ts`, a assinatura quebra
- [ ] Cron de expiração de Pix (hoje é endpoint manual `/payments/expire-overdue`)
- [ ] Conciliação financeira: valor cobrado × custo do gift card × repasse

### Entrega do código (o "produto")
- [ ] `ENCRYPTION_KEY` com **backup seguro** e plano de rotação — perdê-la = perder
      todos os códigos (risco já marcado como crítico no roadmap)
- [ ] Confirmar que doador **nunca** vê o código; só o beneficiário
- [ ] Código não aparece em log, audit metadata, resposta de erro ou Sentry
- [ ] Política de expiração do código e o que acontece se expirar sem uso
- [ ] Reenvio de código (beneficiário perdeu o e-mail) sem gerar código novo

### Estoque (enquanto for manual)
- [ ] Alerta de **estoque baixo por marca** antes de zerar
- [ ] O que a UI faz quando o estoque acaba no meio da doação (hoje: pré-check na
      criação + `manual_review` no fulfillment — validar a mensagem ao doador)
- [ ] Processo humano documentado: quem compra, com que frequência, quem importa
- [ ] Conferência periódica: estoque no sistema × códigos realmente comprados

### Dados e privacidade
- [ ] Banco de **produção separado** do staging atual
- [ ] Dados de menores (LGPD art. 14) — base legal e minimização
- [ ] Backup automatizado + **teste de restore documentado**
- [ ] RLS: hoje habilitado sem policies, seguro porque o acesso é via API própria.
      Se algum dia o app falar direto com o Postgres, isso muda completamente

### Observabilidade (o que dói mais em produção)
- [ ] Logging estruturado + request-id
- [ ] Error tracking (Sentry)
- [ ] **Alertas** nos 4 eventos que significam dinheiro parado:
      webhook falhando · order em `manual_review` · order presa em `processing` ·
      estoque baixo
- [ ] Painel/consulta de `GiftCardOrder` por status (o `listOrders` já existe ✅)

### Testes (nenhum automatizado hoje)
- [ ] Vale só é liberado **após** pagamento confirmado
- [ ] 1 doação por família por ciclo (o claim atômico já cobre — precisa de teste)
- [ ] Webhook idempotente (evento duplicado não libera 2 vales)
- [ ] Código não é reutilizado
- [ ] Doador não vê código
- [ ] Falha do provider → `manual_review` **preservando** o código comprado

### Loja
- [ ] Ícone da marca ✅ (feito)
- [ ] Política de privacidade e exclusão de conta ✅ (in-app feito) — falta **URL pública**
- [ ] Enquadramento da ficha (ver seção 0)
- [ ] Build **AAB assinado** (keystore ✅) em vez de APK debug

---

## 4. Prioridade sugerida

| # | Item | Por quê agora |
|---|---|---|
| 1 | Definir enquadramento (seção 0) | Decide comissão de 15–30% e tributação; afeta tudo |
| 2 | Reconciliação + alertas (2.3) | É o gap que **perde dinheiro silenciosamente** |
| 3 | Testes das 6 regras críticas | Sem eles, qualquer refactor pode liberar vale sem pagamento |
| 4 | Backup da `ENCRYPTION_KEY` | Incidente aqui é irreversível |
| 5 | Registry por marca (2.1) | Necessário **antes** da transição para API real |
| 6 | Contrato assíncrono (2.2) | Necessário quando o fornecedor real entrar |
