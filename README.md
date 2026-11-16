# Manual do Interno

Web app estática (HTML + CSS + JavaScript, sem compilação) com conteúdo editável por Pages CMS.

## Estrutura
- `index.html`, `assets/` – aplicação (aspeto e lógica)
- `data/*.json` – **todo o conteúdo** (editado pelos gestores no Pages CMS)
- `media/` – imagens e PDF carregados pelo CMS
- `.pages.yml` – configuração do Pages CMS

## Publicar (GitHub Pages)
1. Enviar estes ficheiros para o repositório `dim-ulscoimbra/manualdointerno` (ramo `main`).
2. No GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
3. O site fica em `https://dim-ulscoimbra.github.io/manualdointerno/`.

## Gestão de conteúdo (Pages CMS)
1. Os gestores precisam de acesso de escrita ao repositório (**Settings → Collaborators**).
2. Entrar em https://app.pagescms.org com a conta GitHub e abrir o repositório `manualdointerno`.
3. Editar: *Definições do site*, *Informações Gerais*, as 4 áreas clínicas, *Recursos Humanos* e *Medicina do Trabalho*.
4. Cada gravação gera um commit e o GitHub Pages atualiza o site em cerca de 1 minuto.

## Notas
- Para repositório privado, o GitHub Pages exige plano pago; em alternativa, usar Cloudflare Pages / Netlify (sem alterações ao código).
- Não colocar dados de doentes ou informação confidencial: o site é público quando publicado em GitHub Pages.
