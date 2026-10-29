# Sistema de Apoio às ONGs e Protetores de Animais

Projeto desenvolvido em grupo na Residência Full Stack 5.0.

Aplicação web para auxiliar ONGs, abrigos e protetores independentes na gestão de animais,
necessidades, padrinhos e doações.

> **Status atual:** o back-end **ainda não foi implementado**. Existe apenas o bootstrap do
> Spring Boot e um front-end estático completo, que roda com **dados mockados** para simular a
> futura API. Esta é uma entrega de MVP para validar as telas e os fluxos dos três perfis.

---

## Visão geral

O MVP considera uma ONG e três perfis de uso, **sem cadastro e sem login**. O perfil é escolhido
na tela inicial e define quais funcionalidades são exibidas.

| Perfil | Funcionalidades no MVP |
| --- | --- |
| **Administrador (ONG)** | Cadastrar animais e suas necessidades, definir meta de arrecadação, acompanhar a porcentagem da meta, visualizar as doações recebidas, inativar animais **somente quando a meta for atingida** e editar os dados da ONG (incluindo a chave PIX). |
| **Doador** | Visualizar os animais ativos, ver necessidades, informações da ONG e chave PIX, doar qualquer valor e marcar a doação como realizada. |
| **Padrinho** | Visualizar "meus afilhados", consultar necessidades e informações de cada animal e contribuir com uma mensalidade. |

Para simplificar o MVP:

- não há autenticação nem autorização;
- não há processamento real de pagamento;
- a doação é registrada por confiança: o usuário faz o PIX e clica em "Já fiz o PIX • Marcar como doado";
- os dados são fictícios e ficam no navegador (ver seção sobre o mock).

---

## Arquitetura

**Arquitetura adotada: monolito modular com Spring Boot + Java 21, servindo o front-end estático.**

O front-end foi colocado em `src/main/resources/static/`, portanto é servido pela própria
aplicação. Ao rodar o Spring Boot, o acesso a `http://localhost:8080` já entrega o sistema.

Essa escolha é adequada ao MVP porque:

- o domínio é pequeno e fortemente acoplado (animal, necessidades, meta, doação e padrinho se
  relacionam diretamente);
- não há autenticação nem pagamento que justifiquem serviços separados;
- um único deploy e um único processo são suficientes;
- microsserviços adicionariam complexidade de rede, consistência distribuída, gateway e
  observabilidade sem benefício neste momento.

Quando o back-end for implementado, a recomendação é organizá-lo em módulos por domínio
(`animal`, `doacao`, `padrinho`, `ong`), cada um com controller, service, repository, domain e DTO.
Se algum módulo crescer e precisar escalar isoladamente, ele pode ser extraído depois.

### Tecnologias

- Java 21 (target do projeto)
- Spring Boot 4.1.2
- Maven (com Maven Wrapper)
- Front-end: HTML5, CSS3 e JavaScript puro (ES Modules), sem framework e sem etapa de build
- Dados do MVP: JSON estáticos + `localStorage`

---

## Estrutura do projeto

```text
atividade_ongs/
├── pom.xml                          # dependências (spring-boot-starter-web, test)
├── mvnw / mvnw.cmd                  # Maven Wrapper
├── src/
│   ├── main/
│   │   ├── java/com/ongs/atividade_ongs/
│   │   │   └── AtividadeOngsApplication.java   # classe main do Spring Boot
│   │   └── resources/
│   │       ├── application.properties          # configurações da aplicação
│   │       └── static/                         # FRONT-END servido pelo Spring
│   │           ├── index.html
│   │           ├── css/styles.css
│   │           ├── data/                       # base mockada (simula o back-end)
│   │           │   ├── ong.json
│   │           │   ├── animais.json
│   │           │   ├── doacoes.json
│   │           │   └── usuarios.json
│   │           └── js/
│   │               ├── config.js               # chave de troca mock -> API real
│   │               ├── api.js                  # única camada de acesso a dados
│   │               ├── mock.js                 # leitura dos JSON + localStorage
│   │               ├── state.js                # perfil ativo no navegador
│   │               ├── app.js                  # roteador por hash
│   │               ├── components.js           # cards, modal, toast, progresso
│   │               ├── doacao-modal.js         # fluxo de doação via PIX
│   │               └── views/
│   │                   ├── perfil.js
│   │                   ├── adm.js
│   │                   ├── usuario.js
│   │                   └── padrinho.js
│   └── test/java/com/ongs/atividade_ongs/
│       └── AtividadeOngsApplicationTests.java
└── README.md
```

### Back-end

Neste momento contém somente:

- `AtividadeOngsApplication.java`, que inicializa o Spring Boot;
- `application.properties`, com o nome da aplicação e as configurações padrão (porta 8080);
- a dependência `spring-boot-starter-web`, necessária para subir o Tomcat e servir os arquivos
  estáticos do front-end.

Não existem controllers, services, repositories, entidades ou banco de dados ainda.

### Front-end

O front-end é uma SPA (Single Page Application) em JavaScript puro, dividida em:

- **`index.html`**: estrutura base, cabeçalho fixo, área `#app`, modal e toasts;
- **`app.js`**: roteamento por hash e controle do perfil ativo;
- **`views/`**: uma view por perfil;
- **`components.js`**: componentes reutilizáveis (card de animal, barra de progresso, modal,
  confirmação e toast);
- **`api.js`**: camada que concentra toda a comunicação de dados;
- **`mock.js`** e **`data/`**: simulação do back-end.

---

## Como funciona o front-end (modo mock)

Como o back-end ainda não existe, o front-end **simula a API**:

1. O arquivo `js/config.js` define:
   ```js
   export const CONFIG = {
     USE_MOCK: true,
     MOCK_DIR: 'data',
     BASE_URL: '/api'
   };
   ```
2. Com `USE_MOCK: true`, o `js/api.js` lê os arquivos de `static/data/` via `fetch`
   (`ong.json`, `animais.json`, `doacoes.json`, `usuarios.json`).
3. As ações que alteram dados (doar, cadastrar animal, inativar animal, editar a ONG) são gravadas
   em um overlay no `localStorage`, na chave `ong_mock_mutacoes_v1`. Na leitura, esse overlay é
   mesclado com os JSON originais.
4. O perfil escolhido é salvo em `localStorage` na chave `ong_perfil_ativo`.
5. O botão **"Resetar dados da demonstração"** (na tela de seleção de perfil) apaga o overlay e
   volta aos dados originais.

As views **nunca** acessam os JSON diretamente: todo acesso passa por `js/api.js`. Isso permite
trocar o mock pela API real alterando apenas a configuração e implementando os endpoints.

### Rotas (hash)

| Rota | Tela |
| --- | --- |
| `#/` | Seleção de perfil |
| `#/adm` | Painel da ONG (administrador) |
| `#/usuario` | Área do doador |
| `#/padrinho` | Área do padrinho |

### Regras de negócio já refletidas no front

- A porcentagem de cada animal é calculada como `arrecadado / meta`, limitada a 100%.
- `arrecadado` é a soma das doações do animal com status diferente de `CANCELADA`.
- O botão de inativação fica **desabilitado** enquanto a meta não for atingida.
- A doação exige valor maior que zero e só aparece para animais com status `ATIVO`.
- Doações, cadastros e inativações refletem imediatamente na interface (estado otimista).

### Modelo dos dados mockados

**Animal**

```json
{
  "id": "animal-1",
  "nome": "Mel",
  "especie": "Cachorro",
  "idade": "3 anos",
  "descricao": "Resgatada em situação de rua...",
  "status": "ATIVO",
  "meta": 1200,
  "necessidades": ["Ração hipoalergênica", "Consultas dermatológicas"],
  "padrinhoIds": ["padrinho-1"],
  "mensalidadeSugerida": 60
}
```

**Doação**

```json
{
  "id": "doacao-1",
  "animalId": "animal-1",
  "perfil": "USUARIO",
  "padrinhoId": null,
  "doadorNome": "Ana Souza",
  "valor": 500,
  "data": "2026-09-12T14:20:00.000Z",
  "status": "DOADO"
}
```

**ONG**

```json
{
  "id": "ong-1",
  "nome": "Patas Felizes",
  "descricao": "ONG dedicada ao resgate...",
  "chavePix": "contato@patasfelizes.org.br",
  "tipoChavePix": "E-mail",
  "telefone": "(11) 99999-0000",
  "endereco": "Rua dos Bichinhos, 120 - São Paulo/SP"
}
```

---

## Como rodar

Pré-requisitos: **JDK 21 ou superior** e o projeto aberto no IntelliJ IDEA (ou uso do Maven Wrapper
no terminal).

### Pelo IntelliJ IDEA

1. Abra a pasta do projeto (`File → Open` e selecione `atividade_ongs`).
2. Aguarde o **sync do Maven** (necessário para baixar as dependências, inclusive o Tomcat).
3. Abra `src/main/java/com/ongs/atividade_ongs/AtividadeOngsApplication.java`.
4. Clique no **▶ verde** ao lado do método `main` e escolha **Run 'AtividadeOngsApplication'**.
5. Quando o console exibir `Tomcat started on port 8080`, acesse:
   **http://localhost:8080**

Se aparecer erro de SDK, configure em `File → Project Structure → Project SDK` um JDK 21+.

### Pelo terminal

```bash
./mvnw spring-boot:run
```

No Windows (PowerShell/CMD):

```powershell
.\mvnw.cmd spring-boot:run
```

Depois acesse **http://localhost:8080**.

### Observações

- O front-end **não deve ser aberto via `file://`**, pois o navegador bloqueia o `fetch` dos JSON.
  Use sempre a aplicação Spring em `http://localhost:8080`.
- Ao alterar arquivos em `src/main/resources/static/`, pare e execute novamente a aplicação para
  ver as mudanças (ou adicione `spring-boot-devtools` para recarregar automaticamente).
- Para gerar o pacote executável:
  ```powershell
  .\mvnw.cmd -DskipTests package
  java -jar target/atividade_ongs-0.0.1-SNAPSHOT.jar
  ```

---

## Migrando do mock para a API real

Quando o back-end estiver implementado:

1. Em `src/main/resources/static/js/config.js`, altere:
   ```js
   export const CONFIG = {
     USE_MOCK: false,
     MOCK_DIR: 'data',
     BASE_URL: '/api'
   };
   ```
2. Implemente no Spring os endpoints esperados por `js/api.js` (tabela abaixo).
3. Como o front é servido pela mesma aplicação, não há necessidade de configurar CORS.

### Endpoints esperados

| Método | Rota | Uso no front |
| --- | --- | --- |
| `GET` | `/api/ong` | Carregar dados e chave PIX da ONG |
| `PUT` | `/api/ong` | Salvar dados da ONG (perfil administrador) |
| `GET` | `/api/usuarios` | Obter o padrinho atual para "meus afilhados" |
| `GET` | `/api/animais` | Listar animais |
| `POST` | `/api/animais` | Cadastrar animal |
| `PATCH` | `/api/animais/{id}/status` | Inativar animal (body `{ "status": "INATIVO" }`) |
| `GET` | `/api/doacoes` | Listar doações |
| `POST` | `/api/doacoes` | Registrar doação |

> Importante: em modo real, o front busca **`/api/animais` e `/api/doacoes`** e calcula
> `arrecadado`, `percentual` e `metaAtingida` no cliente. Portanto, o back-end precisa fornecer os
> campos `meta`, `status`, `necessidades`, `padrinhoIds` e `mensalidadeSugerida` em cada animal, e
> `animalId`, `perfil`, `padrinhoId`, `doadorNome`, `valor`, `data` e `status` em cada doação.

Sugestão para o back-end:

- `PATCH /api/animais/{id}/status` deve recusar a inativação quando a meta não foi atingida,
  devolvendo erro em JSON com a propriedade `mensagem` (o front exibe esse texto);
- `POST /api/doacoes` deve gravar o status como `DOADO` e preencher `data` no servidor;
- `GET /api/usuarios` pode ser substituído futuramente pela autenticação, retornando o padrinho
  logado.

---

## Limitações do MVP

- Sem autenticação, login ou controle real de acesso: o perfil é apenas uma escolha no navegador.
- Sem integração de pagamento: o PIX é apenas informativo e a doação é marcada manualmente.
- Sem persistência em banco: os dados alterados ficam no `localStorage` do navegador.
- Sem validações de back-end: as validações existentes são apenas no front-end.
- Dados fictícios, adequados apenas para demonstração.

---

## Próximos passos sugeridos (back-end)

1. Modelar as entidades `Ong`, `Animal`, `Necessidade`, `Doacao`, `Usuario`/`Padrinho`.
2. Criar as camadas `controller`, `service`, `repository`, `domain` e `dto`, organizadas por domínio.
3. Implementar a regra de inativação: somente animais com meta atingida podem ser inativados e
   animais inativos não devem aceitar novas doações.
4. Configurar banco PostgreSQL e migrações com Flyway.
5. Implementar os endpoints da tabela acima e então desligar o modo mock (`USE_MOCK: false`).
6. Evoluir para autenticação e, futuramente, integração real de pagamento.