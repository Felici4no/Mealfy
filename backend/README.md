# Mealfy Backend - Monolito Modular

Backend desenvolvido em **Node.js + TypeScript** para centralizar as regras de negócio e persistência da rede Mealfy.

## 🚀 Tecnologias
- **Node.js** v18+
- **Express** (Framework HTTP)
- **TypeScript** (Tipagem estática)
- **Zod** (Validação de esquemas)
- **JSON File-System** (Persistência mockada)

## 🛠️ Como rodar

1. **Instalação**:
   ```bash
   cd backend
   npm install
   ```

2. **Popular o banco (Seed)**:
   ```bash
   npm run seed
   ```

3. **Rodar em desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Build e Start**:
   ```bash
   npm run build
   npm run start
   ```

## 🔐 Autenticação
O backend utiliza um sistema de autenticação mockado.
Envie o `id` do usuário no cabeçalho:
- `x-user-id: [user-id]`
ou
- `Authorization: Bearer [user-id]`

## 📁 Estrutura de Pastas
Consulte o arquivo [ARCHITECTURE.md](./ARCHITECTURE.md) para detalhes da organização modular.
