# PocketCard

PocketCard e um aplicativo mobile desenvolvido com React Native e Expo, projetado para o controle e organizacao de cartoes de credito, despesas e acompanhamento de ciclos de faturas, com sincronizacao em tempo real na nuvem por meio do Firebase.

---

## Proposta e Visao Geral

O PocketCard foi concebido para resolver a complexidade de quem gerencia multiplos cartoes de credito simultaneamente. O acompanhamento manual de diferentes datas de corte, limites comprometidos, datas de vencimento e parcelas frequentemente gera desorganizacao financeira e pagamentos em atraso.

A aplicacao atua como um hub centralizado onde o usuario mantem o registro detalhado de seus cartoes, visualiza o comprometimento do limite disponivel e recebe avisos automatizados. Todo o ciclo financeiro do cartao e calculado automaticamente com base no fechamento e vencimento definidos pelo usuario, garantindo precisao no rastreamento de cada fatura (passada, presente e futura).

---

## Funcionalidades Detalhadas

### 1. Autenticacao e Seguranca
- Cadastro de novos usuarios com validacao de campos essenciais.
- Login de usuarios integrado ao Firebase Authentication.
- Isolamento dos dados por sessao de usuario.

### 2. Gestao de Cartoes de Credito
- Cadastro e edicao de cartoes com informacoes como instituicao emissora, apelido e limite total.
- Personalizacao visual por cor de cartao para facilitar a identificacao no painel principal.
- Definicao das datas operacionais cruciais:
  - **Dia de Fechamento (Corte)**: Data em que a fatura do ciclo e fechada para novas compras.
  - **Dia de Vencimento**: Data limite para o pagamento da fatura sem cobranca de encargos.
- Exibicao dinamica do limite disponivel, limite total e total comprometido.

### 3. Registro e Acompanhamento de Despesas
- Lancamento rapido de despesas associando-as ao cartao correspondente.
- Inclusao de descricao, categoria, data exata da transacao e valor.
- Selecao de data via componente nativo de calendario.
- Validacao e alertas preventivos no momento do lancamento caso o valor ultrapasse o limite restante do cartao selecionado.
- Historico estruturado de transacoes ordenadas cronologicamente.

### 4. Motor de Calculo de Ciclos e Faturas
- Logica automatizada de ciclos de fatura:
  - Agrupa despesas realizadas dentro da janela de compras (do dia seguinte ao ultimo fechamento ate o dia do fechamento atual).
  - Aloca compras realizadas apos o dia de corte diretamente na fatura do ciclo seguinte.
  - Realiza o tratamento correto de variacoes de tamanho dos meses do calendario (inclusive anos bissextos e meses com menos de 31 dias).
- Marcacao de faturas como pagas e baixa do saldo utilizado correspondente.

### 5. Notificacoes e Monitoramento
- **Lembretes de Vencimento**: Agendamento de notificacoes locais para alertar o usuario com antecedencia da proximidade do dia de vencimento da fatura.
- **Alertas de Limite Estourado**: Notificacao imediata ao usuario quando um cartao alcanca ou excede 100% de utilizacao de seu limite.

### 6. Persistencia e Operacao Offline
- Conexao em tempo real com o Cloud Firestore via listeners de atualizacao continua.
- Suporte a cache e funcionamento offline, com sincronizacao automatica assim que a conexao de rede for restabelecida.

---

## Arquitetura e Tecnologias

- **Framework**: React Native com Expo (SDK 58)
- **Roteamento e Navegacao**: Expo Router (roteamento baseado em arquivos com layouts e abas)
- **Linguagens**: JavaScript e TypeScript
- **Backend como Servico (BaaS)**: Google Firebase
  - **Firebase Authentication**: Gerenciamento de credenciais e controle de acesso.
  - **Cloud Firestore**: Banco de dados orientado a documentos em tempo real.
  - **Firebase Data Connect**: Camada de integracao GraphQL para servicos corporativos e consultas tipadas.
- **Notificacoes Nativas**: `expo-notifications`
- **Componentes de Interface**: `@expo/vector-icons`, `react-native-safe-area-context`, `@react-native-community/datetimepicker`
- **Gerenciamento de Estado**: React Context API (`CardsContext`)

---

## Estrutura de Diretorios

```text
PocketCard/
├── app/                        # Estrutura de rotas do Expo Router
│   ├── (tabs)/                 # Rotas com navegacao em barra inferior
│   │   ├── index.js            # Tela inicial com dashboard e lista de cartoes
│   │   ├── expenses.js         # Tela de historico e listagem de despesas
│   │   └── _layout.js          # Configuracao visual da barra de abas
│   ├── card/                   # Rotas dinamicas para cartoes
│   │   └── [id].js             # Tela de detalhes, faturas e acoes do cartao
│   ├── login.js                # Tela de autenticacao de usuarios
│   ├── cadastro.js             # Tela de registro de novas contas
│   ├── new-card.js             # Formulario de adicao de novo cartao
│   ├── new-expense.js          # Formulario de lancamento de nova despesa
│   └── _layout.js              # Provedores de contexto globais e configuracao de pilha
├── components/                 # Componentes reutilizaveis (CardItem, FadeIn, ui.js)
├── config/                     # Parametros de configuracao (firebase.ts)
├── dataconnect/                # Conectores, esquemas GraphQL e dados de exemplo
├── services/                   # Modulos de servico (firebase.js, notifications.js)
├── store/                      # Estados globais (cards-context.js)
├── utils/                      # Regras de negocio e formatadores (invoice.js, format.js, theme.js)
├── assets/                     # Recursos graficos (icones, splash e imagens)
├── package.json                # Dependencias do ecossistema e scripts
└── app.json                    # Metadados de configuracao do Expo
```

---

## Requisitos e Instalacao

### Pre-requisitos

- Node.js (versao 18 ou superior)
- Gerenciador de dependencias: npm, yarn ou bun
- Aplicativo Expo Go instalado em um dispositivo fisico (Android ou iOS) ou ambiente de emulador devidamente configurado.

### Passo a Passo de Instalacao

1. Clone o repositorio:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd PocketCard/PocketCard
   ```

2. Instale as dependencias do projeto:
   ```bash
   npm install
   ```

3. Configure o arquivo de variaveis de ambiente:
   Crie um arquivo `.env` dentro da pasta `PocketCard/` utilizando o modelo disponibilizado em `.env.example`:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=seu_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=seu_app_id
   ```

---

## Execucao

No diretorio do aplicativo (`PocketCard/`), execute o comando correspondente:

- **Iniciar servidor Metro / Expo**:
  ```bash
  npm start
  ```
- **Executar no emulador Android**:
  ```bash
  npm run android
  ```
- **Executar no simulador iOS**:
  ```bash
  npm run ios
  ```
- **Executar no navegador web**:
  ```bash
  npm run web
  ```

---

## Licenca

Projeto desenvolvido para fins educacionais e gerenciamento financeiro pessoal.
