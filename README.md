# MoneyVision — Landing

Il sito pubblico di MoneyVision, l'app per iPhone che risponde a una domanda sola:
quanto posso ancora spendere fino alla prossima paga? Pubblicato su Netlify.

L'app web originale (React + Supabase) è stata dismessa e viene riscritta come app iOS
nativa in un repository separato. Qui resta soltanto il sito: nessun backend, nessuna
autenticazione, nessun cookie, nessuna analitica, nessun dato utente.

## Pagine

| Percorso | Contenuto |
|---|---|
| `/` | Hero con demo interattiva, le schede dell'app, la sezione sulla privacy, lo stato del lavoro, le domande frequenti |
| `/about` | Perché esiste, tre impegni, cronologia, come è costruita, chi c'è dietro |
| `/changelog` | Il build log: tappe datate dalla storia reale dei due repository |
| `/privacy` | Informativa sul sito e sull'app |
| `/terms` | Condizioni d'uso del sito |
| `/support` | Come scrivere, domande comuni |
| qualunque altro | `404.html` con stato 404 (mai un 200 camuffato) |

## Il principio che governa i contenuti

Il sito dice solo ciò che è vero oggi. L'app **non è ancora disponibile**: non è su
TestFlight né sull'App Store, e nessuna pagina lo lascia intendere. Ogni affermazione
sull'app descrive il codice com'è, e dove una cosa è costruita ma non ancora provata su
dispositivo reale lo dice (`src/content/status.ts`).

Di conseguenza, quando il lavoro sull'app cambia, questi file vanno aggiornati insieme:

- `src/content/status.ts`: cosa è costruito, cosa attende la prova, cosa si sta rifinendo, cosa non è iniziato;
- `src/content/buildLog.ts`: le tappe datate, scritte per chi legge e verificabili con `git log` del repository dell'app;
- `src/content/faq.ts`: lo stesso testo alimenta le domande visibili e i dati strutturati `FAQPage`, quindi solo testo semplice;
- `src/site/config.ts`: **ogni fatto che il sito dichiara su se stesso** (nome, indirizzo email, date, stato del prodotto). Pagine, footer, testi legali e dati strutturati leggono da qui.

Se si modificano privacy o condizioni, si aggiornano insieme `legalUpdatedLabel` e
`legalUpdatedISO` in `config.ts`.

### Chi c'è dietro

Per scelta il sito si presenta come «progetto indipendente dall'Italia» e non nomina
nessuno. Per nominare la persona (pagina About, informativa privacy, dati strutturati,
footer) basta valorizzare `site.founder` in `src/site/config.ts`:

```ts
founder: { name: 'Nome Cognome', url: 'https://…' },
```

## Stack

- Vite 5 + React 18 + TypeScript
- CSS semplice con token di design (`src/styles/site.css`), che riprendono quelli del design system dell'app: una figura dominante per vista, un solo accento, nessun colore d'allarme, superfici in vetro, movimento che avviene una volta e non si ripete
- Tailwind solo come reset (`src/index.css`): le classi `mv-*` non devono mai essere eliminate dal purge
- Inter variabile, ospitata in locale (`@fontsource-variable/inter`), solo sottoinsieme latino
- Pre-rendering: ogni pagina diventa un vero file HTML, quindi un visitatore, un'anteprima di link o un crawler che non esegue JavaScript legge comunque il contenuto. In browser React si aggancia al markup (hydration) e le demo diventano interattive
- Deploy: Netlify (`npm run build` → `dist`)

## Sviluppo

```sh
npm install
npm run dev        # http://localhost:8080
npm run lint
npm run build      # tipi, build client, build SSR, pre-rendering
npm run preview    # serve dist/ così com'è, pagine pre-renderizzate comprese
```

Node 22 o successivo (Netlify usa il 22).

`npm run build` fallisce se una pagina pre-renderizzata non ha un `<h1>` o conserva un
segnaposto del template: una build che produce pagine vuote non deve arrivare online.

## Struttura

```
index.html                  template: <!--app-head--> e <!--app-html-->
netlify.toml                build, intestazioni di sicurezza, cache
scripts/prerender.mjs       scrive un file HTML per pagina, sitemap.xml e 404.html
src/
  entry-client.tsx          hydration in browser
  entry-server.tsx          render lato build
  site/
    config.ts               i fatti del sito, in un posto solo
    routes.tsx              elenco delle pagine, titoli e descrizioni
    head.ts                 <head> di ogni pagina: meta, Open Graph, dati strutturati
  pages/                    Home, About, Changelog, Privacy, Terms, Support, NotFound
  content/                  status, build log, domande frequenti
  components/
    site/                   Page, SiteHeader, SiteFooter
    app/                    PhoneFrame, Figure, CapacityBar: i pezzi dell'app disegnati
    demos/                  le demo interattive (Oggi, Analisi, Ricorrenze, Inserimento, widget)
  lib/                      demoModel (numeri inventati, calcolati in centesimi), money, useAnimatedNumber
  styles/site.css           token e componenti
public/
  og.png                    scheda per le anteprime sui social, 1200×630
  brand/                    marchio (PNG 256 px per i dati strutturati, WebP 96 px per header e footer)
  icons/, favicon.ico
  sw.js                     service worker di dismissione della vecchia PWA
```

### Le demo usano numeri inventati

Tutte le cifre delle demo sono inventate e il sito lo dichiara (footer, condizioni, didascalie).
Sono però calcolate come le calcola l'app: importi interi in centesimi, nessuna virgola mobile
nei calcoli, e a ogni livello la somma dei contributi coincide con la differenza mostrata
(`src/lib/demoModel.ts`, `src/lib/money.ts`).

## Sicurezza e intestazioni

`netlify.toml` imposta una Content-Security-Policy restrittiva (`script-src 'self'`, nessuna risorsa
da terzi), `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` e la cache
immutabile per `/assets/*`. Non c'è alcun rewrite verso `index.html`: un indirizzo inesistente
risponde 404.

Il sito non carica nulla da altri domini, non imposta cookie e non usa `localStorage`. Per questo
l'informativa può dire che non c'è nulla da accettare.

## Immagine per i social

`public/og.png` (1200×630) è uno scatto composto con il CSS e il markup veri della home: titolo,
domanda del prodotto e il telefono con la cifra del margine. Si sostituisce con qualunque PNG
1200×630; il testo alternativo sta in `src/site/head.ts` (`OG_ALT`) e va tenuto coerente con
l'immagine.

## Pubblicazione e indicizzazione

Un sito si trova sui motori di ricerca solo dopo che questi lo hanno letto, e un dominio nuovo
non letto da nessuno non esce. Nulla di ciò che segue si può forzare: si può solo rendere il
sito leggibile e dire ai motori che esiste.

**1. Pubblicare.** Prima della versione attuale il sito era una pagina vuota riempita da JavaScript
(`<div id="root"></div>`), senza sitemap, con ogni indirizzo che rispondeva 200. Un crawler che non
esegue JavaScript non leggeva nulla. Il push su `main` pubblica la versione pre-renderizzata.

**2. Controllare dopo il deploy.**

```sh
curl -s https://moneyvision.it/ | grep -c '<h1'                 # 1: il testo c'è nell'HTML
curl -sI https://moneyvision.it/sitemap.xml | grep -i content-type   # application/xml, non text/html
curl -sI https://moneyvision.it/nope | head -1                  # 404, non 200
curl -sI https://moneyvisionv2.netlify.app/ | grep -i -E 'HTTP|location'   # 301 verso moneyvision.it
```

**3. Google Search Console** (l'unico strumento che dice *perché* una pagina non è indicizzata).

1. Aggiungere una proprietà di tipo **Dominio**: `moneyvision.it`.
2. Aggiungere il record **TXT** `google-site-verification=…` nel pannello DNS di Register.it
   (i name server sono `ns1/ns2.register.it`). Sul dominio c'è già un TXT con l'SPF della posta:
   se ne **aggiunge** un secondo, non si sostituisce.
3. Sitemap → inviare `sitemap.xml`.
4. Controllo URL → incollare `https://moneyvision.it/` → *Richiedi indicizzazione*. Ripetere per
   `/about`, `/privacy`, `/changelog`.

**4. Bing Webmaster Tools.** Importare la proprietà da Search Console in un clic e inviare la sitemap.
L'indice di Bing è usato, in tutto o in parte, anche da DuckDuckGo, Ecosia, Copilot e da vari
assistenti con ricerca sul web.

**5. IndexNow** (Bing, Yandex, Naver, Seznam; non Google). La chiave è il nome del file in `public/`
e sta già online insieme al sito. Dopo ogni deploy che cambia pagine:

```sh
curl -X POST https://api.indexnow.org/IndexNow -H 'Content-Type: application/json' -d '{
  "host": "moneyvision.it",
  "key": "181076ba337298bf7bc432421e62f4e6",
  "keyLocation": "https://moneyvision.it/181076ba337298bf7bc432421e62f4e6.txt",
  "urlList": [
    "https://moneyvision.it/", "https://moneyvision.it/about", "https://moneyvision.it/changelog",
    "https://moneyvision.it/privacy", "https://moneyvision.it/terms", "https://moneyvision.it/support"
  ]
}'
```

**6. Segnali dall'esterno.** Un dominio senza link in ingresso resta invisibile anche se perfetto.
Dove possibile, un link a `https://moneyvision.it` da: il profilo e i repository GitHub, LinkedIn,
la scheda dell'app sull'App Store quando esisterà, post nelle community dove il tema è pertinente.
Quando i profili esistono e puntano al sito, vanno elencati in `site.profiles`
(`src/site/config.ts`): diventano `sameAs` nei dati strutturati.

**Tempi.** Dopo l'invio della sitemap la prima lettura arriva di solito in pochi giorni, e
l'indicizzazione può richiedere da qualche giorno a qualche settimana: nessuno strumento la
garantisce. La ricerca del dominio esatto (`moneyvision.it`) è quella che di solito compare per
prima. La ricerca del solo nome «MoneyVision» è un'altra cosa: è un nome già usato da altri (un'app
di obiettivi finanziari sull'App Store, `moneyvision.online`, `moneyvision.net`) e si conquista nel
tempo, con link in ingresso e contenuti. Search Console, alla voce *Pagine*, dice per ogni URL il
motivo esatto se non è indicizzato.

## Note

- Non ci sono variabili d'ambiente. Nessuna chiave API deve essere aggiunta: è un sito pubblico e statico.
- `public/sw.js` è un service worker di dismissione: svuota le cache e si deregistra, per rimuovere la
  vecchia PWA dai browser che l'avevano installata. Può essere eliminato (insieme alla registrazione in
  `entry-client.tsx` e alla riga relativa nell'informativa) quando si stima che tutti i client si siano aggiornati.
- Le pagine usano le view transition tra documenti: passando da una pagina all'altra il contenuto
  dissolve invece di lampeggiare. Dove il browser non le supporta, o con «riduci movimento» attivo, non cambia nulla.
