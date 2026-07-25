# MoneyVision — Landing

Sito vetrina statico di MoneyVision, pubblicato su Netlify.

L'applicazione vera e propria è stata dismessa in questa forma (web app React +
Supabase) e viene riscritta come app iOS nativa in un repository separato.
Qui resta soltanto la landing page: nessun backend, nessuna autenticazione,
nessun dato utente.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS
- Deploy: Netlify (`npm run build` → `dist`)

## Sviluppo

```sh
npm install
npm run dev      # http://localhost:8080
npm run build
npm run preview
```

## Struttura

```
src/
  App.tsx                 # monta la landing
  main.tsx                # entry point + dismissione del vecchio service worker
  pages/Landing.tsx       # contenuto del sito
  components/ui/button.tsx
  index.css               # variabili tema + Tailwind
```

## Note

- Non ci sono variabili d'ambiente. Nessuna chiave API deve essere aggiunta a
  questo progetto: è un sito pubblico e statico.
- `public/sw.js` è un service worker di dismissione: svuota le cache e si
  deregistra, per rimuovere la vecchia PWA dai browser che l'avevano installata.
  Può essere eliminato quando si stima che tutti i client si siano aggiornati.
