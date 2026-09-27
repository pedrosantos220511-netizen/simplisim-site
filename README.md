# Simplisim Decorações

Site comercial estático da Simplisim Decorações, desenvolvido exclusivamente com HTML, CSS e JavaScript puro.

## Funcionalidades

- Catálogo modular de produtos e soluções.
- Filtros por categoria.
- Seleção de vários itens.
- Persistência da seleção no navegador via localStorage.
- Modal de orçamento.
- Formulário opcional com dados do evento.
- Geração automática de mensagem para WhatsApp.
- CTA B2B com mensagem pré-preenchida.
- Links oficiais de WhatsApp, Instagram e e-mail.
- Layout responsivo.
- SEO básico.
- Acessibilidade básica.
- Preparado para substituição das áreas de imagem pelas fotos reais da Simplisim.

## Estrutura

```text
simplisim/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   └── images/
└── README.md
```

## Executar

Não há dependências ou build.

Basta abrir `index.html` no navegador.

Para desenvolvimento no VS Code, pode usar uma extensão de servidor local, como Live Server.

## WhatsApp

O número configurado é:

`5511965453661`

A seleção do catálogo é convertida automaticamente em uma mensagem e enviada para:

`https://wa.me/5511965453661`

## Fotos

As áreas "FOTO DO ACERVO" são placeholders. Substitua-as pelas fotos reais da Simplisim em `assets/images/` e ajuste o catálogo no JavaScript conforme o acervo real.

Não apresentar fotos de banco ou geradas como trabalhos reais da empresa.

## Publicação na Hostinger

1. Teste o site localmente.
2. Substitua os placeholders pelas fotos reais.
3. Revise textos, contatos e produtos.
4. Faça upload de `index.html`, `css/`, `js/` e `assets/` para o diretório público da hospedagem.
5. Configure o domínio e HTTPS na Hostinger.
6. Teste o site em celular e desktop.
7. Teste cada botão de WhatsApp.
8. Teste os links de Instagram e e-mail.

## Observação

Este primeiro pacote é uma versão estática e não possui banco de dados ou painel administrativo. Isso mantém o projeto simples e compatível com hospedagem estática. Uma futura área administrativa pode ser adicionada quando houver necessidade real de gerenciamento de produtos, fotos, disponibilidade e leads.
