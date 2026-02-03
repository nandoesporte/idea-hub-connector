
# Harmonizar Paleta de Cores da Seção CTA

## Problema Identificado
A seção CTA acima do rodapé está com cores desarmoniosas devido ao fundo escuro (`foreground`) que cria baixo contraste com elementos decorativos e textos secundários.

## Solução

Redesenhar a seção CTA com **gradiente primary-to-accent** que mantém a identidade "tech moderna" do site, usando as cores principais (Deep Electric Blue e Electric Cyan) de forma harmoniosa.

### Estrutura Visual

```text
+------------------------------------------------------------------+
|                                                                  |
|  [Gradient Background: Primary -> Accent diagonal]               |
|                                                                  |
|      Badge: "Consultoria Gratuita" (glass style)                 |
|                                                                  |
|      "Pronto para Transformar Seu Negocio?"                      |
|      (titulo em branco)                                          |
|                                                                  |
|      Descricao elegante em branco/90%                            |
|                                                                  |
|      [Agendar Consultoria] (botao branco)                        |
|      [WhatsApp] (outline com destaque verde)                     |
|                                                                  |
|      Tel: (44) 98805-7213    Email: contato@idealhub.com.br      |
|                                                                  |
+------------------------------------------------------------------+
```

## Detalhes Tecnicos

### Arquivo a ser modificado
`src/components/landing/CTASection.tsx`

### Mudancas especificas

1. **Fundo**: Gradiente diagonal usando cores primarias
   - De: `from-foreground via-foreground/95 to-foreground`
   - Para: `from-primary via-primary/90 to-accent`

2. **Remover overlay**: Remover o overlay de gradiente secundario que causa conflito visual

3. **Badge**: Estilo glass com borda branca
   - De: `bg-primary/10 border-primary/20`
   - Para: `bg-white/15 border-white/25`

4. **Textos**: Usar branco para alto contraste
   - Titulo: `text-white` (substituir `text-background`)
   - Descricao: `text-white/85`
   - Badge texto: `text-white`
   - Contatos: `text-white/70`

5. **Botoes**:
   - Primario: `bg-white text-primary hover:bg-white/90` com sombra branca
   - WhatsApp: `border-white/40 text-white` com hover verde (`hover:bg-green-500/20`)

6. **Elementos Decorativos**: Blur circles em branco
   - De: `bg-primary/10`, `bg-accent/10`
   - Para: `bg-white/10`, `bg-white/5`

7. **Contatos hover**: 
   - De: `text-background/50 hover:text-accent`
   - Para: `text-white/70 hover:text-white`

### Resultado Esperado
- Alta legibilidade com contraste adequado
- Harmonia visual com a identidade do site (azul e ciano)
- Destaque que convida a acao de conversao
- Consistencia com as cores primary e accent da marca
