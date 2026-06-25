# Como funciona o Mealfy

> Explicação em linguagem simples. Para o plano técnico completo, veja
> [`BACKEND_AUDIT_AND_IMPLEMENTATION_PLAN.md`](./BACKEND_AUDIT_AND_IMPLEMENTATION_PLAN.md).

---

## O que é o app

O **Mealfy** é um aplicativo de celular para **combater a fome infantil**.

A ideia é simples: uma pessoa que quer ajudar (o **apoiador**) escolhe uma **família com crianças** no mapa e faz uma **doação por Pix**. Quando o pagamento é confirmado, essa família recebe um **vale-refeição/mercado** (um código de gift card, tipo iFood, 99 ou Carrefour) para comprar comida.

Cada família pode receber **uma ajuda por dia**.

---

## Quem usa o app

São **quatro tipos de usuário**:

- **Apoiador** — quem doa. Escolhe a família e paga via Pix.
- **Entidade** — uma ONG, igreja, escola ou instituto. É quem **cadastra as famílias** que precisam de ajuda.
- **Beneficiário (família)** — quem **recebe** a ajuda. Vê o código do vale dentro do app.
- **Admin (Mealfy)** — a equipe que **importa os vales** comprados e **organiza** tudo no painel.

> Importante: a família **não se cadastra sozinha**. Quem cadastra é a **entidade**, que conhece a realidade local.

---

## Como o apoiador doa

1. Abre o app e vê famílias no **mapa**.
2. Escolhe uma família que precisa de ajuda.
3. Faz a doação por **Pix** (aparece o QR Code / Pix copia-e-cola).
4. Paga pelo app do banco.
5. Quando o pagamento é confirmado, ele vê: **"A família recebeu o apoio"** e qual vale foi enviado (ex.: "Vale iFood enviado para a família").

➡️ O apoiador **nunca vê o código** do vale. Ele vê só que ajudou — e, quando for o caso, o selo **"Alimentada por você"**.

---

## Como a entidade cadastra

1. A entidade entra com a conta dela.
2. Cadastra a família: nome do responsável, bairro/cidade, e as **crianças/dependentes** (com idade).
3. A família só pode ser aprovada se tiver **pelo menos uma criança ou adolescente (0 a 17 anos)**.
4. O cadastro passa por **aprovação manual** (da entidade/admin) antes de aparecer para os apoiadores.

> Ter NIS ou Bolsa Família **não aprova sozinho** — é só um sinal. A aprovação é sempre conferida por uma pessoa.

---

## Como a família recebe

1. Todo dia, a família **escolhe o tipo de vale** que prefere: **iFood**, **99Pay/99 Mercado** ou **mercado/Carrefour**.
2. Quando um apoiador doa e o pagamento é confirmado, o sistema **libera um código** daquele tipo escolhido.
3. A família **vê o código dentro do app**, com o nome do parceiro, a instrução de uso e a data/hora.
4. Depois de receber, a família fica marcada como **"alimentada hoje"** e só pode receber de novo **no dia seguinte**.

---

## Como o gift card é liberado

A ordem é sempre esta (e nunca fora dela):

```
Apoiador paga via Pix  →  Banco/gateway confirma o pagamento
        →  Sistema separa um código disponível do parceiro escolhido
        →  Marca o código como usado (não pode ser reaproveitado)
        →  A família vê o código no app
```

**Regra de ouro:** o vale **só é liberado depois que o Pix é confirmado de verdade**. Nunca antes.

Os códigos vêm de um **estoque interno**: a operação da Mealfy compra os vales e o **admin importa** os códigos no painel. Cada código só pode ir para **uma** família.

---

## O que ainda é mockado (simulado) hoje

Hoje o app está **funcionando de ponta a ponta, mas com dados simulados** guardados no próprio celular (localStorage). Ainda são simulação:

- o **pagamento** (não existe Pix de verdade ainda — "doar" hoje já entrega o vale, o que vai mudar);
- o **estoque de vales** (códigos fictícios);
- o **login** (senha única de teste);
- o **cadastro de famílias, entidades e o painel admin** (dados ficam só no aparelho);
- a **verificação de NIS/CadÚnico** (sempre diz "encontrado", sem consultar nada);
- **e-mails e compartilhamento** (apenas avisos na tela).

---

## O que vai virar backend real

Vamos construir um **servidor de verdade** (com banco de dados PostgreSQL) responsável por:

- guardar **famílias, entidades, doações e vales** de forma confiável;
- processar o **Pix** e só liberar o vale **após o pagamento confirmado**;
- controlar o **estoque de vales** (importação, reserva e uso seguro, sem repetir código);
- garantir a regra de **uma ajuda por dia** por família (no servidor, não no celular);
- guardar **login seguro** (senha protegida) e um **registro de auditoria** das ações importantes.

O app e o painel admin que já existem serão **conectados a esse servidor**.

---

## O que depende de integração futura

Algumas coisas ficam para depois, por dependerem de parceiros, contratos ou base legal:

- **Gateway de pagamento Pix** — escolher a empresa que processa o Pix (ainda não definido).
- **Integração automática com iFood/99/Carrefour** — no começo os vales são comprados e importados à mão; no futuro pode virar integração automática.
- **Gov.br / CadÚnico / NIS** — só com **convênio e permissão legal**; até lá, continua como estudo/simulação.
- **Login social** (Google/Meta/Gov.br) e **deep links/QR Code reais** de compartilhamento.

---

## Em uma frase

> O apoiador **escolhe uma família e doa por Pix**; quando o pagamento é confirmado, a **família recebe um vale-refeição** para comprar comida — **uma vez por dia** — enquanto as **entidades cadastram** as famílias e o **admin abastece** o estoque de vales. Hoje isso funciona simulado no celular; o próximo passo é colocar um **servidor real** por trás de tudo.
