# Gerenciador Financeiro API

Implementacao em JavaScript com Express e banco em memoria da API definida em [docs/openapi.yaml](./docs/openapi.yaml).

## Requisitos

- Node.js 20+

## Executar

```bash
npm install
npm start
```

## Autenticacao inicial

Usuario de teste:

- email: `maria@exeplo.com`
- senha: `123456`

## Cadastro

Novo cadastro disponivel em:

- `POST /api/v1/auth/register`

Campos obrigatorios:

- `firstName`
- `lastName`
- `email`
- `password`

## Base URL local

`http://localhost:8080/api/v1`

## Swagger

- UI: `http://localhost:8080/api/docs`
- YAML: `http://localhost:8080/api/docs/openapi.yaml`
