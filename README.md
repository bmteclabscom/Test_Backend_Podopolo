# Node Backend Test for Podopolo

## Run the project

Prerequisites:

- [NodeJS](https://nodejs.org/en/)

Steps:

- Install NodeJS dependencies: `npm i`
- Create files named `.common.env` and `.local.env`
- The `.common.env` file should contain this line:

```bash
NODE_ENV=local
```

- Copy the content of the file `.example.env` into the file `.local.env` and set the right values of the variables
- Please make sure you have environment for PostgreSQL
- Create `podopolo` Database in PgAdmin 
- Run the command:

```bash
npm run start
```
## Unit test the project

```bash
npm run test
```


## Generators

- Generate `JWT` certificates:

```bash
npm run generate:certs
```

This will generate two file: **es512-private.pem** and **es512-public.pem**. Make sure you have already installed [openssl](https://www.openssl.org/)

- Generate a new schema:

```bash
npm run generate:schema
```

## VSCode snippets

- To initiate a `routes file` use the snippet `routes`
- To add a new route to an existing `routes file` use the snippet `routes:add`
- To add a new method to an existing `route` use the snippet `routes:method`
