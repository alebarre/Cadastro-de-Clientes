# 📋 Cadastro de Clientes (Angular Standalone + Bootstrap)

Aplicação em **Angular 17+** (standalone components) com **Bootstrap 5**, para cadastro e gerenciamento de clientes.  
Cada cliente pode ter **até 2 endereços**, com preenchimento automático via **ViaCEP**.

---

## 🚀 Funcionalidades

- **Cadastro de clientes** com nome, e-mail e telefone.
- **Até 2 endereços por cliente**:
  - Campos: CEP, logradouro, número, complemento, bairro, cidade, UF.
  - **Busca automática do endereço pelo CEP** via [ViaCEP API](https://viacep.com.br/).
  - Validação: número somente numérico, CEP válido, campos obrigatórios.
- **Listagem de clientes**:
  - Nome, e-mail, telefone.
  - Coluna de **cidades**: mostra até 2 cidades (se houver mais de uma).
  - Ações: **Ver**, **Editar**, **Excluir**.
- **Visualização detalhada (Card do cliente)**:
  - Exibe dados do cliente e endereços em formato de cartões.
- **UX / UI**:
  - **Bootstrap 5 responsivo** para desktop, tablet e mobile.
  - Botões ajustam largura: no celular ocupam 100% da linha; no desktop ficam lado a lado.
  - **Toasts** para feedback de sucesso/erro.
  - **Modal de confirmação** (standalone Angular) para excluir cliente ou endereço.
- **Persistência local** via **LocalStorage** (não requer backend).

---

## 🛠️ Tecnologias

- [Angular 17+](https://angular.io/) (standalone components)
- [Bootstrap 5](https://getbootstrap.com/)
- [RxJS](https://rxjs.dev/)
- [ViaCEP API](https://viacep.com.br/) para busca de endereços
- **LocalStorage** para persistência dos dados

---

## 📂 Estrutura Simplificada

