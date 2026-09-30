# 🕹️ JS Quest - Plataforma de Gamificação Educacional

![Preview do Projeto](https://via.placeholder.com/1200x600?text=JS+Quest+-+Aprenda+JavaScript+Jogando)

Uma aplicação front-end gamificada inspirada em plataformas educacionais modernas (como Duolingo e Mimo). O **JS Quest** foi desenvolvido para testar e aprimorar conhecimentos em JavaScript, abordando desde os fundamentos até simulações de projetos reais de mercado, como sistemas de delivery, agregadores de web rádio e painéis de estoque.

## 🚀 Funcionalidades

* **Trilha de Aprendizado Modular:** 15 módulos progressivos que são desbloqueados linearmente conforme o avanço do usuário.
* **Simulação de API (Fetch API):** O currículo e as perguntas são consumidos assincronamente a partir de um arquivo JSON externo, preparando a arquitetura para futuras integrações com back-ends reais.
* **Feedback Imediato:** Validação de respostas em tempo real com explicações técnicas detalhadas para fixação do aprendizado.
* **Mini-Projetos Visuais (HTML5 Canvas):** Integração com a API Canvas para renderização de gráficos dinâmicos (Dashboards) que reagem aos acertos do usuário.
* **Persistência de Dados (LocalStorage):** O progresso (XP e módulos concluídos) é salvo de forma segura no navegador do usuário, permitindo continuar de onde parou sem necessidade de banco de dados.
* **Design Responsivo e Humanizado:** Interface limpa, cores inspiradas na identidade visual oficial do JavaScript e foco na experiência do usuário (UX/UI).

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído puramente com tecnologias nativas, sem a utilização de frameworks, focando na proficiência em manipulação de DOM e lógica de programação:

* **HTML5:** Semântica e estrutura de dados.
* **CSS3:** Estilização, animações (`@keyframes`), variáveis CSS e layout responsivo (Flexbox/Grid).
* **JavaScript (Vanilla):** Manipulação de DOM, Event Listeners, Promises/Async Await, ES Modules e LocalStorage.
* **HTML5 Context2D (Canvas):** Renderização de gráficos visuais dinâmicos.
* **Bootstrap Icons:** Biblioteca de ícones.
* **Google Fonts (Nunito):** Tipografia moderna e legível.

## 📂 Estrutura de Arquivos

```text
/
├── index.html       # Estrutura principal da aplicação e views (Dashboard/Exercícios)
├── style.css        # Folha de estilos completa
├── script.js        # Lógica central: Gerenciamento de estado, renderização, Canvas e feedback
├── dados.json       # Banco de dados simulado contendo todos os módulos e perguntas
└── README.md        # Documentação do projeto
```
## ⚙️ Como Executar Localmente
* **Como o projeto utiliza a Fetch API para consumir o arquivo dados.json, os navegadores bloqueiam a requisição direta de arquivos locais por questões de segurança (CORS). Para rodar o projeto corretamente na sua máquina:

* **Clone este repositório:

Bash
git clone [https://github.com/SEU-USUARIO/js-quest.git](https://github.com/SEU-USUARIO/js-quest.git)
Abra a pasta do projeto no Visual Studio Code.

* **Instale a extensão Live Server (caso não possua).

* **Clique com o botão direito no arquivo index.html e selecione "Open with Live Server".

* **O projeto abrirá automaticamente no seu navegador padrão, pronto para uso!

## 🧠 Cenários Abordados nos Módulos
O currículo foge do convencional e aplica a teoria em cenários do dia a dia de um Desenvolvedor Full-Stack:

* Lógica para Sistemas de Delivery (taxas, rotas e horários).

* Manipulação de Arrays complexos para Gestão de Estoque e OCR.

* Interação com WhatsApp via formatação de URLs.

* Consumo assíncrono de APIs RESTful (viaCEP).

* Orientação a Objetos (OOP) e Formatação Financeira (Intl.NumberFormat).

##
*Desenvolvido por **Ronaldo Melo** como parte da jornada de especialização em **Desenvolvimento Web Full-Stack.**
