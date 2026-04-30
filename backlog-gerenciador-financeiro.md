# Gerenciador Financeiro

## Visão do Produto

Aplicação de gerenciamento financeiro voltada para controle de gastos diários e mensais, definição de budget por categoria, acompanhamento do consumo acumulado, registro de poupança e envio de alertas conforme o percentual utilizado do budget.

## Objetivo do Produto

Permitir que o usuário tenha uma gestão financeira eficiente, registrando gastos, valores de poupança e rendas com valores decimais e símbolo de moeda identificado, acompanhando limites por categoria, comparando gastos entre meses e visualizando o total acumulado de gastos.

## Categorias Disponíveis

- mercado
- lazer
- saúde
- outros
- carro
- combustível
- restaurante
- contas
- shopping
- renda
- poupança

## Epics

### EP01 - Autenticação e acesso do usuário

Garantir que o usuário possa se cadastrar e fazer login por autenticação JWT para acessar a aplicação com segurança.

### EP02 - Cadastro e manutenção de lançamentos financeiros

Permitir registrar, editar e consultar lançamentos relacionados a gastos, renda e poupança com valores decimais e símbolo de moeda.

### EP03 - Gestão de budget por categoria

Permitir definir, consultar e ajustar budgets por categoria a qualquer momento.

### EP04 - Monitoramento de consumo e alertas

Permitir acompanhar o percentual consumido do budget e receber alertas aos marcos de 50% e 90%.

### EP05 - Consolidação, visualização e comparação financeira

Permitir visualizar os gastos acumulados por categoria e o somatório geral de gastos, além de comparar o mês atual com o mês anterior.

## Requisitos Funcionais

### RF01 - Autenticação JWT obrigatória

O sistema deve exigir autenticação do usuário por meio de JWT antes do acesso às funcionalidades da aplicação.

### RF02 - Cadastro de usuários

O sistema deve permitir o cadastro de novos usuários informando nome, sobrenome, e-mail e senha.

### RF03 - Registro de lançamentos financeiros

O sistema deve permitir cadastrar lançamentos financeiros informando categoria, símbolo da moeda, valor decimal, data e descrição opcional.

### RF04 - Registro de lançamentos de gastos

A aplicação deve receber lançamentos relacionados a gastos.

### RF05 - Registro de lançamentos de renda

O sistema deve permitir registrar valores de renda.

### RF06 - Registro de lançamentos de poupança

O sistema deve permitir registrar valores de poupança.

### RF07 - Uso de categorias predefinidas

O sistema deve permitir selecionar somente as categorias disponíveis: mercado, lazer, saúde, outros, carro, combustível, restaurante, contas, shopping, renda e poupança.

### RF08 - Edição de lançamentos

O sistema deve permitir editar dados de um lançamento já cadastrado.

### RF09 - Exclusão de lançamentos

O sistema deve permitir excluir um lançamento cadastrado.

### RF10 - Definição de budget por categoria

O sistema deve permitir definir um budget por categoria para controle mensal.

### RF11 - Atualização de budget

O sistema deve permitir ajustar o budget de qualquer categoria a qualquer momento.

### RF12 - Consulta do budget consumido

O sistema deve exibir o valor do budget definido, o valor já consumido e o percentual utilizado por categoria.

### RF13 - Alerta de 50% do budget

O sistema deve retornar uma mensagem de alerta quando o consumo da categoria atingir ou ultrapassar 50% do budget definido.

### RF14 - Alerta de 90% do budget

O sistema deve retornar uma mensagem de alerta quando o consumo da categoria atingir ou ultrapassar 90% do budget definido.

### RF15 - Exibição do gasto acumulado geral

O sistema deve mostrar o gasto acumulado com a soma de todas as categorias de despesa.

### RF16 - Exibição do gasto acumulado por categoria

O sistema deve mostrar o gasto acumulado de cada categoria de despesa.

### RF17 - Consulta de histórico financeiro

O sistema deve permitir visualizar os lançamentos diários e mensais realizados pelo usuário.

### RF18 - Comparação geral entre meses

O sistema deve permitir comparar os gastos do mês atual com os gastos do mês anterior de forma consolidada.

### RF19 - Comparação por categoria entre meses

O sistema deve permitir comparar os gastos do mês atual com os gastos do mês anterior por categoria.

## Requisitos Não Funcionais

### RNF01 - Precisão monetária

O sistema deve tratar valores monetários decimais com precisão adequada para operações financeiras.

### RNF02 - Clareza visual de moeda

O sistema deve exibir o símbolo da moeda sempre associado ao valor informado ou apresentado.

### RNF03 - Segurança de acesso

O sistema deve proteger o acesso aos dados financeiros do usuário por meio de autenticação JWT.

### RNF04 - Usabilidade

O sistema deve apresentar informações de gastos, budgets, alertas e comparações de forma clara e fácil de entender.

## Regras de Negócio

### RN01 - Valores decimais

Todos os valores financeiros cadastrados devem aceitar casas decimais.

### RN02 - Formato monetário obrigatório

Todo valor financeiro deve ser exibido com o símbolo da moeda no formato `€1.875,85`.

### RN03 - Login obrigatório

Nenhuma funcionalidade financeira pode ser acessada sem login válido.

### RN04 - Budget mensal por categoria

O budget deve ser configurado individualmente por categoria e considerado em base mensal.

### RN05 - Alertas por percentual de consumo

Os alertas devem ser disparados quando o consumo atingir ou ultrapassar 50% e 90% do budget da categoria.

### RN06 - Ajuste imediato de budget

Ao alterar o budget de uma categoria, o sistema deve recalcular imediatamente os percentuais de consumo e os alertas correspondentes.

### RN07 - Soma consolidada de despesas

O gasto acumulado geral deve considerar a soma de todas as categorias de despesa.

### RN08 - Comparação mensal

As comparações devem considerar sempre o mês atual em relação ao mês imediatamente anterior, tanto no consolidado geral quanto por categoria.

## User Stories

### EP01 - Autenticação e acesso do usuário

**US01 - Vinculada ao EP01**  
Como usuário, quero realizar login com autenticação JWT na aplicação para acessar meus dados financeiros com segurança.

**US02 - Vinculada ao EP01**  
Como usuário, quero ser impedido de acessar a aplicação sem autenticação válida para garantir a privacidade das minhas informações.

**US19 - Vinculada ao EP01**  
Como usuário, quero realizar meu cadastro na aplicação para criar uma conta e acessar minhas informações financeiras com segurança.

### EP02 - Cadastro e manutenção de lançamentos financeiros

**US03 - Vinculada ao EP02**  
Como usuário, quero registrar um gasto diário informando categoria, símbolo da moeda, valor decimal e data para controlar minhas despesas.

**US04 - Vinculada ao EP02**  
Como usuário, quero registrar uma renda informando categoria, símbolo da moeda, valor decimal e data para acompanhar minhas entradas financeiras.

**US05 - Vinculada ao EP02**  
Como usuário, quero registrar valores de poupança para acompanhar quanto estou guardando ao longo do tempo.

**US06 - Vinculada ao EP02**  
Como usuário, quero editar um lançamento financeiro para corrigir informações cadastradas incorretamente.

**US07 - Vinculada ao EP02**  
Como usuário, quero excluir um lançamento financeiro para manter meu histórico atualizado e correto.

**US08 - Vinculada ao EP02**  
Como usuário, quero consultar meus lançamentos diários e mensais para acompanhar minha movimentação financeira.

### EP03 - Gestão de budget por categoria

**US09 - Vinculada ao EP03**  
Como usuário, quero definir um budget mensal para cada categoria para controlar quanto pretendo gastar.

**US10 - Vinculada ao EP03**  
Como usuário, quero ajustar o budget de uma categoria a qualquer momento para refletir mudanças no meu planejamento.

**US11 - Vinculada ao EP03**  
Como usuário, quero visualizar o budget definido e o valor já consumido por categoria para acompanhar meu limite.

### EP04 - Monitoramento de consumo e alertas

**US12 - Vinculada ao EP04**  
Como usuário, quero receber um alerta quando atingir 50% do budget de uma categoria para poder rever meus gastos com antecedência.

**US13 - Vinculada ao EP04**  
Como usuário, quero receber um alerta quando atingir 90% do budget de uma categoria para evitar ultrapassar meu limite planejado.

**US14 - Vinculada ao EP04**  
Como usuário, quero que os percentuais consumidos sejam recalculados automaticamente quando eu registrar gastos ou alterar o budget para ter informações atualizadas.

### EP05 - Consolidação, visualização e comparação financeira

**US15 - Vinculada ao EP05**  
Como usuário, quero visualizar o gasto acumulado por categoria para entender onde estou gastando mais.

**US16 - Vinculada ao EP05**  
Como usuário, quero visualizar o gasto acumulado total com a soma de todas as categorias para acompanhar minha despesa geral.

**US17 - Vinculada ao EP05**  
Como usuário, quero comparar os gastos do mês atual com o mês anterior no consolidado geral para identificar aumento ou redução de despesas.

**US18 - Vinculada ao EP05**  
Como usuário, quero comparar os gastos do mês atual com o mês anterior por categoria para entender quais grupos tiveram maior variação.

## Estrutura de Publicação Após Aprovação

### Wiki do Repositório

- Visão do Produto
- Objetivo do Produto
- Categorias Disponíveis
- Requisitos Funcionais
- Requisitos Não Funcionais
- Regras de Negócio

### Projects do Repositório

- Epics cadastrados como itens identificados
- User Stories cadastradas como itens vinculados ao Epic correspondente

## Próximos Passos Após Aprovação

1. Criar o repositório `Gerenciador-Financeiro` no GitHub.
2. Publicar na wiki a visão do produto, requisitos e regras de negócio de forma estruturada.
3. Cadastrar os Epics e as User Stories na aba `Projects`, mantendo o vínculo de cada User Story com seu Epic correspondente.
