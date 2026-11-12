# Sistema de Apoio às ONGs e Protetores de Animais

Projeto desenvolvido em grupo na Residência Full Stack 5.0.

Aplicação web para auxiliar ONGs, abrigos e protetores independentes na gestão de animais,
necessidades, padrinhos e doações.

> **Status atual:** o back-end já possui **Spring Data JPA + Hibernate + PostgreSQL**
> configurados, modelos mapeados, repositórios e controllers de API. O front-end estático é
> servido pela própria aplicação e **já está com os mocks desativados** (`USE_MOCK: false`).
> Os controllers ainda são **stubs**: os endpoints existem, mas retornam respostas vazias e não
> acessam o banco. Não há dados cadastrados nem regras de negócio implementadas no back-end.

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
- o perfil ativo fica salvo no `localStorage` do navegador;
- o banco de desenvolvimento é criado localmente e não possui dados de exemplo.

---

## Arquitetura

**Arquitetura adotada: monolito modular com Spring Boot + Java 21, servindo o front-end estático.**

O front-end está em `src/main/resources/static/`, portanto é servido pela própria aplicação.
Ao rodar o Spring Boot, `http://localhost:8080` já entrega o sistema.

Fluxo atual:

```text
Front-end (JS puro, USE_MOCK: false)
        │
        │ fetch /api/...
        ▼
Controllers REST (stubs, sem regra de negócio)
        │
        │ (services/DTOs ainda não implementados)
        ▼
Repositories Spring Data JPA (criados, ainda não usados)
        │
        ▼
PostgreSQL + Hibernate
```

Essa escolha é adequada ao MVP porque:

- o domínio é pequeno e fortemente acoplado (animal, necessidades, meta, doação e padrinho se
  relacionam diretamente);
- não há autenticação nem pagamento que justifiquem serviços separados;
- um único deploy e um único processo são suficientes;
- microsserviços adicionariam complexidade de rede, consistência distribuída, gateway e
  observabilidade sem benefício neste momento.

---

## Tecnologias

| Tecnologia | Versão / uso |
| --- | --- |
| Java | 21 (target do projeto) |
| Spring Boot | 4.1.2 |
| Spring Web | API REST e servidor Tomcat embutido |
| Spring Data JPA | Repositórios e abstração de persistência |
| Hibernate ORM | 7.4.13.Final |
| PostgreSQL | 18 (testado localmente) |
| Driver PostgreSQL | 42.7.14 |
| Maven | Maven Wrapper (`mvnw` / `mvnw.cmd`) |
| Front-end | HTML5, CSS3 e JavaScript puro (ES Modules), sem framework e sem build |

---

## Estrutura do projeto

```text
atividade_ongs/
├── pom.xml
├── mvnw / mvnw.cmd
├── README.md
└── src/
    ├── main/
    │   ├── java/br/com/ongs/atividadeongs/
    │   │   ├── AtividadeOngsApplication.java
    │   │   ├── controller/
    │   │   │   ├── AnimalController.java
    │   │   │   ├── DoacaoController.java
    │   │   │   ├── OngController.java
    │   │   │   ├── StatusController.java
    │   │   │   └── UsuarioController.java
    │   │   ├── models/
    │   │   │   ├── Animal.java
    │   │   │   ├── Doacao.java
    │   │   │   ├── Ong.java
    │   │   │   ├── Usuario.java
    │   │   │   ├── PerfilUsuario.java
    │   │   │   ├── StatusAnimal.java
    │   │   │   ├── StatusDoacao.java
    │   │   │   └── TipoChavePix.java
    │   │   └── repository/
    │   │       ├── AnimalRepository.java
    │   │       ├── DoacaoRepository.java
    │   │       ├── OngRepository.java
    │   │       └── UsuarioRepository.java
    │   └── resources/
    │       ├── application.properties
    │       └── static/
    │           ├── index.html
    │           ├── css/styles.css
    │           ├── data/                  # JSONs do antigo modo mock
    │           │   ├── animais.json
    │           │   ├── doacoes.json
    │           │   ├── ong.json
    │           │   └── usuarios.json
    │           └── js/
    │               ├── api.js
    │               ├── app.js
    │               ├── components.js
    │               ├── config.js
    │               ├── doacao-modal.js
    │               ├── mock.js
    │               ├── state.js
    │               └── views/
    │                   ├── adm.js
    │                   ├── padrinho.js
    │                   ├── perfil.js
    │                   └── usuario.js
    └── test/
        └── java/                          # sem testes automatizados no momento
```

---

## Back-end

### Modelos JPA

As entidades ficam em `src/main/java/br/com/ongs/atividadeongs/models/` e já estão anotadas com
`@Entity`, `@Table`, `@Column`, `@ManyToOne`, `@ManyToMany`, `@ElementCollection`, etc.

| Modelo | Tabela | Principais campos |
| --- | --- | --- |
| `Ong` | `ongs` | `id`, `nome`, `descricao`, `chavePix`, `tipoChavePix`, `telefone`, `endereco` |
| `Usuario` | `usuarios` | `id`, `nome`, `email`, `perfil` |
| `Animal` | `animais` | `id`, `nome`, `especie`, `idade`, `descricao`, `status`, `meta`, `mensalidadeSugerida` |
| `Doacao` | `doacoes` | `id`, `animal`, `perfil`, `padrinho`, `doadorNome`, `valor`, `data`, `status` |

Tabelas auxiliares geradas pelas relações:

| Tabela | Origem |
| --- | --- |
| `animal_necessidades` | `@ElementCollection` da lista `necessidades` do `Animal` (`animal_id`, `necessidade`, `ordem`) |
| `animal_padrinhos` | `@ManyToMany` entre `Animal` e `Usuario` (`animal_id`, `usuario_id`) |

Relacionamentos:

- `Doacao.animal` → `@ManyToOne` para `Animal` (`doacoes.animal_id`).
- `Doacao.padrinho` → `@ManyToOne` opcional para `Usuario` (`doacoes.padrinho_id`).
- `Animal.padrinhos` → `@ManyToMany` com `Usuario` (tabela `animal_padrinhos`).
- `Usuario.afilhados` → lado inverso de `Animal.padrinhos`.
- `Usuario.doacoes` → lado inverso de `Doacao.padrinho`.

Enums usados e serializados como texto no banco (`@Enumerated(EnumType.STRING)`):

| Enum | Valores |
| --- | --- |
| `StatusAnimal` | `ATIVO`, `INATIVO` |
| `StatusDoacao` | `DOADO`, `CANCELADA` |
| `PerfilUsuario` | `ADM`, `USUARIO`, `PADRINHO` |
| `TipoChavePix` | `CPF_CNPJ`, `EMAIL`, `TELEFONE`, `CHAVE_ALEATORIA` |

O `TipoChavePix` mantém no JSON os rótulos usados pelo front-end (`"CPF/CNPJ"`, `"E-mail"`,
`"Telefone"`, `"Chave aleatória"`) por meio de `@JsonValue` e `@JsonCreator`.

Detalhes importantes do mapeamento:

- valores monetários usam `BigDecimal` (`precision = 12, scale = 2`);
- `Doacao.data` usa `Instant` e é preenchida automaticamente no `@PrePersist` quando não enviada;
- `Animal.necessidades` é uma coleção de strings com ordem preservada;
- `Doacao` e `Animal` usam `fetch = LAZY` nas relações, por isso o futuro controller deve usar
  DTOs e/ou transações para evitar `LazyInitializationException`.

### Repositórios Spring Data JPA

Ficam em `src/main/java/br/com/ongs/atividadeongs/repository/`:

| Repositório | Métodos personalizados |
| --- | --- |
| `AnimalRepository` | `findByStatusOrderByNomeAsc`, `findByNomeContainingIgnoreCase` |
| `DoacaoRepository` | `findByAnimalIdOrderByDataDesc`, `findByPadrinhoIdOrderByDataDesc`, `findByStatus` |
| `OngRepository` | `findFirstByOrderByIdAsc` |
| `UsuarioRepository` | `findByEmailIgnoreCase`, `findByPerfil` |

Todos herdam de `JpaRepository<T, Long>`, portanto já possuem `save`, `findAll`, `findById`,
`delete`, etc. **Os controllers atuais ainda não usam esses repositórios.**

### Controllers (stubs)

Os endpoints necessários para o front-end já existem, mas estão **sem implementação**.
Eles não acessam service, repositório nem banco.

| Método | Endpoint | Resposta atual |
| --- | --- | --- |
| `GET` | `/api/status` | `200` com mensagem de status |
| `GET` | `/api/ong` | `200 {}` |
| `PUT` | `/api/ong` | `204 No Content` |
| `GET` | `/api/usuarios` | `200 {"padrinhoAtual":{}}` |
| `GET` | `/api/animais` | `200 []` |
| `GET` | `/api/animais/{id}` | `204 No Content` |
| `POST` | `/api/animais` | `204 No Content` |
| `PATCH` | `/api/animais/{id}/status` | `204 No Content` |
| `GET` | `/api/doacoes` | `200 []` |
| `POST` | `/api/doacoes` | `204 No Content` |

Os métodos estão marcados com `// TODO: implementar` e recebem o corpo como `Map<String, Object>`
para não acoplar o stub a DTOs que ainda serão criados.

---

## Banco de dados PostgreSQL

### Como o banco é criado

O Hibernate **não cria o banco de dados**. Ele cria e atualiza as tabelas dentro de um banco que
já precisa existir no PostgreSQL.

O fluxo é:

1. Criar o banco `atividade_ongs` manualmente no PostgreSQL.
2. Configurar URL, usuário e senha em `application.properties`.
3. Subir a aplicação.
4. Com `spring.jpa.hibernate.ddl-auto=update`, o Hibernate lê as entidades e cria/atualiza as
   tabelas, chaves estrangeiras e tabelas auxiliares.

Criando o banco pelo `psql` (Windows):

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE atividade_ongs;"
```

> Ajuste o caminho `18` para a versão do PostgreSQL instalada na sua máquina.

Ou pelo pgAdmin: **Databases → Create → Database**, nome `atividade_ongs`.

Alternativa com Docker:

```powershell
docker run --name postgres-ongs -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=atividade_ongs -p 5432:5432 -d postgres:18
```

### Tabelas geradas

Com o mapeamento atual, o Hibernate cria:

```text
ongs
usuarios
animais
animal_necessidades
animal_padrinhos
doacoes
```

Conferindo pelo `psql`:

```powershell
$env:PGPASSWORD = "admin"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d atividade_ongs -c "\dt"
```

### Configuração atual

Arquivo `src/main/resources/application.properties`:

```properties
spring.application.name=atividade-ongs

spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/atividade_ongs}
spring.datasource.username=${DB_USER:postgres}
spring.datasource.password=${DB_PASSWORD:admin}
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false
```

As variáveis de ambiente podem sobrescrever os valores padrão:

| Variável | Padrão no projeto | Uso |
| --- | --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/atividade_ongs` | URL JDBC |
| `DB_USER` | `postgres` | Usuário do PostgreSQL |
| `DB_PASSWORD` | `admin` | Senha do PostgreSQL |

Exemplo no PowerShell:

```powershell
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "admin"
.\mvnw.cmd spring-boot:run
```

> **Atenção:** o usuário padrão criado pelo instalador do PostgreSQL é `postgres`.
> `admin` no exemplo acima é apenas a senha local usada no desenvolvimento. Ajuste conforme a
> sua instalação.

### `ddl-auto`

| Valor | Comportamento |
| --- | --- |
| `update` | Cria/atualiza tabelas e colunas que faltam. Usado no desenvolvimento. |
| `validate` | Apenas valida se o schema está igual às entidades. Não altera nada. |
| `create` | Recria as tabelas a cada inicialização. |
| `create-drop` | Cria ao subir e apaga ao parar. |
| `none` | Não faz nada. |

Para produção, o recomendado é usar `validate` e versionar o schema com **Flyway** ou
**Liquibase**. O `update` é prático no início, mas não é adequado para evoluções controladas.

---

## Front-end

O front-end é uma SPA em JavaScript puro, dividida em:

- **`index.html`**: estrutura base, cabeçalho fixo, área `#app`, modal e toasts;
- **`app.js`**: roteamento por hash e controle do perfil ativo;
- **`views/`**: uma view por perfil;
- **`components.js`**: componentes reutilizáveis (card de animal, barra de progresso, modal,
  confirmação e toast);
- **`api.js`**: camada que concentra toda a comunicação de dados;
- **`config.js`**: configuração da URL da API e da chave `USE_MOCK`.

### Configuração atual

Arquivo `src/main/resources/static/js/config.js`:

```js
export const CONFIG = {
  USE_MOCK: false,
  MOCK_DIR: 'data',
  BASE_URL: '/api'
};
```

Com `USE_MOCK: false`, o `api.js` chama a API real em `/api/...`. Os arquivos `mock.js` e
`static/data/*.json` continuam no projeto como referência histórica, mas não são mais usados
para carregar os dados.

A tela de seleção de perfil ainda exibe o botão **"Resetar dados da demonstração"**, que limpa
apenas o overlay antigo do `localStorage`. Como o modo mock está desligado, esse botão não
altera os dados da API.

### Rotas (hash)

| Rota | Tela |
| --- | --- |
| `#/` | Seleção de perfil |
| `#/adm` | Painel da ONG (administrador) |
| `#/usuario` | Área do doador |
| `#/padrinho` | Área do padrinho |

### O que o front espera da API

Como os controllers ainda retornam respostas vazias, as telas exibem listas vazias e alguns
valores indefinidos (por exemplo, nome da ONG e nome do padrinho). Isso é esperado até a
implementação dos endpoints.

Quando forem implementados, o contrato esperado é:

**Animal**

```json
{
  "id": 1,
  "nome": "Mel",
  "especie": "Cachorro",
  "idade": "3 anos",
  "descricao": "Resgatada em situação de rua...",
  "status": "ATIVO",
  "meta": 1200.00,
  "necessidades": ["Ração hipoalergênica", "Consultas dermatológicas"],
  "padrinhoIds": [1],
  "mensalidadeSugerida": 60.00,
  "arrecadado": 860.00,
  "percentual": 72,
  "metaAtingida": false
}
```

**Doação**

```json
{
  "id": 1,
  "animalId": 1,
  "perfil": "PADRINHO",
  "padrinhoId": 1,
  "doadorNome": "Carlos Andrade",
  "valor": 60.00,
  "data": "2026-10-05T11:00:00Z",
  "status": "DOADO"
}
```

**ONG**

```json
{
  "id": 1,
  "nome": "Patas Felizes",
  "descricao": "ONG dedicada ao resgate...",
  "chavePix": "contato@patasfelizes.org.br",
  "tipoChavePix": "E-mail",
  "telefone": "(11) 99999-0000",
  "endereco": "Rua dos Bichinhos, 120 - São Paulo/SP"
}
```

**Usuários**

O front lê `usuarios.padrinhoAtual`, então o endpoint precisa retornar:

```json
{
  "padrinhoAtual": {
    "id": 1,
    "nome": "Carlos Andrade",
    "email": "carlos.andrade@email.com"
  }
}
```

### Regras que ainda estão no front-end

- `arrecadado` é a soma das doações do animal com status diferente de `CANCELADA`.
- `percentual` é `arrecadado / meta`, limitado a 100%.
- `metaAtingida` é `arrecadado >= meta`.
- O botão de inativação fica desabilitado enquanto a meta não for atingida.
- Ao criar doação, o front envia `animalId`, `perfil`, `padrinhoId`, `doadorNome` e `valor`.
- Ao criar animal, o front envia `status: "ATIVO"`, `padrinhoIds: []` e
  `mensalidadeSugerida: 50` por padrão.

Essas regras devem migrar para os services do back-end.

---

## Como rodar

### Pré-requisitos

- JDK 21 ou superior (o projeto compila com target 21);
- PostgreSQL instalado e em execução;
- banco `atividade_ongs` criado;
- credenciais configuradas em `application.properties` ou nas variáveis de ambiente.

### Pelo terminal

```powershell
.\mvnw.cmd spring-boot:run
```

Depois acesse **http://localhost:8080**.

Se a porta 8080 estiver ocupada, encerre a instância anterior (`Ctrl + C`) ou rode em outra porta:

```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

### Pelo IntelliJ IDEA

1. Abra a pasta do projeto.
2. Aguarde o sync do Maven.
3. Abra `src/main/java/br/com/ongs/atividadeongs/AtividadeOngsApplication.java`.
4. Clique no ▶ verde ao lado do método `main`.
5. Acesse **http://localhost:8080** quando o console exibir o Tomcat iniciado.

### Verificando se subiu

```powershell
Invoke-RestMethod http://localhost:8080/api/status
```

Resposta esperada:

```json
{
  "mensagem": "API do Sistema de ONGs funcionando!"
}
```

### Gerando o pacote executável

```powershell
.\mvnw.cmd -DskipTests package
java -jar target/atividade_ongs-0.0.1-SNAPSHOT.jar
```

> O front-end é servido a partir de `src/main/resources/static/`. Depois de alterar HTML, CSS ou
> JavaScript, reinicie a aplicação para que os arquivos atualizados sejam copiados para
> `target/classes/` (ou adicione `spring-boot-devtools` para recarregar automaticamente).

---

## Como testar os endpoints atuais

Os endpoints existem, mas retornam respostas vazias:

```powershell
Invoke-RestMethod http://localhost:8080/api/ong
# {}

Invoke-RestMethod http://localhost:8080/api/usuarios
# padrinhoAtual: {}

Invoke-RestMethod http://localhost:8080/api/animais
# lista vazia

Invoke-RestMethod http://localhost:8080/api/doacoes
# lista vazia
```

Para as rotas que retornam `204`:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/doacoes `
  -ContentType "application/json" -Body '{}'

Invoke-RestMethod -Method Put -Uri http://localhost:8080/api/ong `
  -ContentType "application/json" -Body '{}'

Invoke-RestMethod -Method Patch -Uri http://localhost:8080/api/animais/1/status `
  -ContentType "application/json" -Body '{"status":"INATIVO"}'
```

### Problemas comuns

| Erro | Causa provável | Solução |
| --- | --- | --- |
| `404` em `/api/animais`, `/api/ong`, etc. | Instância antiga da aplicação ainda rodando | Pare com `Ctrl + C` e suba novamente |
| `28P01` / `password authentication failed` | Usuário ou senha incorretos | Use o usuário `postgres` e a senha definida na instalação |
| `3D000` / `database ... does not exist` | Banco não criado | Execute `CREATE DATABASE atividade_ongs;` |
| `Connection refused` | PostgreSQL parado | Inicie o serviço do PostgreSQL |
| `permission denied for schema public` | Usuário sem permissão no schema | Use o dono do banco/superusuário em desenvolvimento |
| Front com dados antigos | Cache do navegador ou instância antiga | Recarregue com `Ctrl + F5` e reinicie a aplicação |

---

## Estado atual da feature de persistência

### Já implementado

- [x] Dependências `spring-boot-starter-data-jpa` e driver PostgreSQL no `pom.xml`.
- [x] Configuração de conexão com PostgreSQL em `application.properties`.
- [x] Hibernate configurado com `ddl-auto=update`.
- [x] Modelos `Ong`, `Usuario`, `Animal` e `Doacao` mapeados com anotações JPA.
- [x] Enums de status, perfil e tipo de chave PIX.
- [x] Relacionamentos `@ManyToOne`, `@ManyToMany` e `@ElementCollection`.
- [x] Repositórios Spring Data JPA.
- [x] Controllers com todos os endpoints necessários (stubs).
- [x] Front-end com `USE_MOCK: false`, chamando `/api/...`.
- [x] Tabelas criadas automaticamente pelo Hibernate no PostgreSQL.

### Ainda falta implementar

- [ ] DTOs de request/response.
- [ ] Services com as regras de negócio.
- [ ] Uso dos repositórios pelos controllers.
- [ ] Cálculo de `arrecadado`, `percentual` e `metaAtingida` no back-end.
- [ ] Validação da inativação apenas com meta atingida.
- [ ] Criação de doação com `data` e `status` definidos no servidor.
- [ ] Tratamento global de erros com a propriedade `mensagem`.
- [ ] Validações de entrada (`jakarta.validation`).
- [ ] Dados iniciais/seed (opcional).
- [ ] Migrações com Flyway ou Liquibase.
- [ ] Testes automatizados.
- [ ] Autenticação e autorização.
- [ ] Integração real de pagamento.

---

## Limitações do MVP

- Sem autenticação, login ou controle real de acesso: o perfil é apenas uma escolha no navegador.
- Sem integração de pagamento: o PIX é apenas informativo e a doação é marcada manualmente.
- Persistência configurada, mas **os endpoints ainda não leem nem gravam no banco**.
- Sem validações de back-end: as validações existentes são apenas no front-end.
- Sem dados iniciais no banco.
- Sem testes automatizados no momento.

---

## Próximos passos sugeridos

1. Criar DTOs de resposta e request para os quatro domínios.
2. Implementar os services com as regras de negócio.
3. Ligar os controllers aos services/repositórios.
4. Implementar primeiro os endpoints de leitura (`GET /api/ong`, `/api/animais`,
   `/api/doacoes`, `/api/usuarios`).
5. Implementar os endpoints de escrita (`POST`, `PUT`, `PATCH`).
6. Adicionar validação de entrada e tratamento global de erros.
7. Popular o banco com dados iniciais (se desejado) ou criar um script de seed.
8. Trocar `ddl-auto=update` por `validate` e adicionar Flyway/Liquibase.
9. Criar testes de integração com `@DataJpaTest` e testes de controller.
10. Evoluir para autenticação e, futuramente, integração real de pagamento.
