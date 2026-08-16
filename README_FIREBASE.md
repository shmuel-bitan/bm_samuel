# Backend RSVP Firebase / Vercel

Cette version conserve le site actuel et ajoute uniquement le stockage des RSVP.

## 1. Firebase
1. Créer un projet Firebase.
2. Créer une base Firestore en mode Production.
3. Project Settings > Service accounts > Firebase Admin SDK > Generate new private key.
4. Ne jamais ajouter le fichier JSON téléchargé au dépôt GitHub.

## 2. Variables Vercel
Dans Project > Settings > Environment Variables, ajouter :

- `FIREBASE_PROJECT_ID` : valeur `project_id` du JSON Firebase
- `FIREBASE_CLIENT_EMAIL` : valeur `client_email`
- `FIREBASE_PRIVATE_KEY` : valeur complète `private_key`
- `ADMIN_TOKEN` : un mot de passe long et aléatoire pour le dashboard
- `ALLOWED_ORIGIN` : facultatif au début; ensuite l'URL du site, par ex. `https://votre-site.vercel.app`

Après modification des variables, faire un nouveau déploiement Vercel.

## 3. Fonctionnement
- Le formulaire appelle `POST /api/rsvp`.
- L'inscription est enregistrée dans la collection Firestore `rsvps`.
- WhatsApp s'ouvre avec le message préparé.
- Si le backend échoue temporairement, le navigateur garde jusqu'à 20 RSVP en attente et réessaie au prochain chargement / retour en ligne.
- Les envois répétés du même RSVP utilisent un identifiant déterministe côté document pour éviter les doublons liés aux retries.

## 4. Dashboard
Ouvrir `/admin.html`, entrer la valeur de `ADMIN_TOKEN`.
Le dashboard permet de voir les réponses, compter les invités et exporter en CSV.

## 5. Fichiers ajoutés
- `api/rsvp.js`
- `api/rsvps.js`
- `lib/firebase.js`
- `admin.html`, `admin.css`, `admin.js`
- `package.json`
- `.env.example`

## 6. Test rapide
Après déploiement :
1. Envoyer un RSVP test depuis le site.
2. Vérifier dans Firebase > Firestore > Data qu'une collection `rsvps` apparaît.
3. Ouvrir `/admin.html` et vérifier la ligne de test.
