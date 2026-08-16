# Déploiement RSVP — Samuel Choukroun

Cette version n'utilise pas Formspree.

Architecture :

- le site reste statique et peut être hébergé sur Vercel ;
- `POST /api/rsvp` enregistre chaque réponse dans Firebase Firestore ;
- WhatsApp s'ouvre comme avant après le clic RSVP ;
- si l'API est temporairement indisponible, le navigateur garde une petite file locale et retente l'enregistrement plus tard ;
- `/admin.html` affiche la liste des RSVP et permet un export CSV ;
- `/api/rsvps` est protégé par `ADMIN_TOKEN`.

## 1. Créer Firebase

1. Créer un projet Firebase.
2. Ouvrir **Firestore Database** et créer la base en mode Production.
3. Ouvrir **Project settings > Service accounts**.
4. Générer une nouvelle clé privée de compte de service.
5. Le fichier JSON téléchargé contient les 3 valeurs nécessaires :
   - `project_id`
   - `client_email`
   - `private_key`

Ne jamais mettre le fichier JSON ou la clé privée dans GitHub.

## 2. Déployer sur Vercel

Le plus simple est de pousser le contenu du dossier `bm-main` sur GitHub puis d'importer le dépôt sur Vercel.

Dans Vercel > Project > Settings > Environment Variables, ajouter :

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `ADMIN_TOKEN`

Pour `FIREBASE_PRIVATE_KEY`, coller la clé privée complète. Le code accepte aussi une clé où les retours à la ligne sont écrits `\\n`.

Après le premier déploiement, tu peux aussi ajouter :

- `ALLOWED_ORIGIN=https://ton-domaine.fr`

puis redéployer. Cette variable est optionnelle mais recommandée quand le domaine final est connu.

## 3. Configurer Maurice et Vanessa

Dans `script.js`, modifier :

```js
const WHATSAPP_CONTACTS = {
  maurice: { name: "Maurice", phone: "33600000000" },
  vanessa: { name: "Vanessa", phone: "33600000001" },
};
```

Les numéros doivent être au format international, sans `+`, espace ou tiret.

## 4. Voir les inscriptions

Ouvrir :

`https://ton-domaine/admin.html`

Entrer la valeur choisie pour `ADMIN_TOKEN`.

La page affiche :

- toutes les réponses ;
- présents / absents ;
- total de personnes présentes ;
- Maurice ou Vanessa ;
- les messages ;
- export CSV.

Le token est gardé uniquement dans `sessionStorage` du navigateur et n'est pas écrit dans le site.

## 5. Tester avant diffusion

1. Envoyer un RSVP test depuis le site.
2. Vérifier que WhatsApp s'ouvre.
3. Aller sur `/admin.html` et vérifier que la ligne apparaît.
4. Vérifier aussi dans Firebase > Firestore > collection `rsvps`.

## Fichiers backend

- `api/rsvp.js` : insertion sécurisée côté serveur.
- `api/rsvps.js` : lecture admin protégée.
- `lib/firebase.js` : connexion Firestore via variables d'environnement.
- `admin.html`, `admin.js`, `admin.css` : tableau de bord privé.

## Important

Le frontend ne contient jamais la clé privée Firebase ni le token admin. Les secrets restent dans les variables d'environnement Vercel.
