/**
 * Concordância do artigo antes do nome: "da Marina", "do Gabriel".
 *
 * A regra prática do português brasileiro é o gênero de quem fala, não a
 * terminação — mas dentro do clube os nomes são conhecidos, e terminação em A
 * acerta os cinco. Quando os membros passarem a ser cadastrados de verdade,
 * isto vira um campo do perfil.
 */
export function articleFor(name: string): 'do' | 'da' {
  return name.trim().toLowerCase().endsWith('a') ? 'da' : 'do';
}

export function withArticle(name: string): string {
  return `${articleFor(name)} ${name}`;
}
