# Mettre l'application en ligne et l'installer sur Android

L'application est un dossier de fichiers (HTML, CSS, JavaScript). Pour l'installer sur ton téléphone, elle doit être en ligne à une adresse **HTTPS**. GitHub Pages le fait gratuitement.

> **Confidentialité** : tu mets en ligne **uniquement le code**. Les dossiers patients restent dans le téléphone et ne sont jamais envoyés nulle part.

---

## 1. Ce qu'il faut glisser sur GitHub

### Obligatoire : 3 fichiers et 4 dossiers (60 fichiers au total)

| Élément | Contenu |
|---|---|
| `index.html` | la page de l'application |
| `manifest.webmanifest` | nom, icône, installation sur le téléphone |
| `sw.js` | fonctionnement hors ligne et mises à jour (contient le **numéro de version**) |
| `css/` | 1 fichier (`app.css`) |
| `js/` | 16 fichiers : `app.js`, `store.js`, et les sous-dossiers `engine/` et `ui/` |
| `config/` | 37 fichiers : tout le contenu médical, avec les sous-dossiers `motifs/`, `scores/` et `sections/` |
| `icons/` | 3 icônes PNG |

### Facultatif : documentation lisible sur GitHub, non utilisée par l'app

`README.md`, `SPECIFICATION.md`, `docs/`

### À ne pas envoyer

Les fichiers cachés comme `.DS_Store` (le Finder ne les montre pas, donc tu ne les glisseras pas par erreur).

---

## 2. Mise en ligne avec GitHub Pages (une seule fois, ~10 min)

1. Crée un compte gratuit sur **https://github.com**.
2. En haut à droite : **+** → **New repository**.
   - *Repository name* : `observation-dechocage`
   - Laisse **Public** : c'est obligatoire pour GitHub Pages gratuit. Seul le code est public.
   - Clique **Create repository**.
3. Clique **uploading an existing file**.
4. Ouvre le dossier `app observation` dans le Finder et sélectionne les **7 éléments obligatoires** (et la documentation si tu veux). Glisse-les dans la page GitHub.
   - Fais-le avec **Chrome** sur le Mac : il conserve les sous-dossiers. Safari peut ignorer le contenu des dossiers.
   - Attends que la liste affiche tous les fichiers (`js/engine/…`, `config/motifs/…`), puis clique **Commit changes**.
5. Va dans **Settings** → **Pages**.
   - *Source* : **Deploy from a branch**
   - *Branch* : **main**, dossier **/ (root)**, puis **Save**.
6. Après 1 à 2 minutes, l'adresse s'affiche : **`https://<ton-pseudo>.github.io/observation-dechocage/`**

**Vérifications sur GitHub** : `index.html` doit être à la racine du dépôt (et non dans un sous-dossier), et le dossier `js` doit contenir `engine` et `ui`.

## 3. Installation sur le téléphone Android

1. Ouvre l'adresse dans **Chrome**, avec Internet.
2. Menu **⋮** → **Installer l'application** (ou **Ajouter à l'écran d'accueil**).
3. Ouvre l'application une fois avec Internet. Elle télécharge alors tous ses fichiers pour fonctionner hors ligne.
4. **Test** : active le mode avion, puis rouvre l'application. Elle doit fonctionner normalement.
5. Dans **⚙ Réglages**, tu dois voir **Version installée :** suivi du numéro inscrit dans `sw.js`.

> Pour essayer : **⚙ → Charger les patients de démonstration**.

---

## 4. Mettre à jour l'application

### Ce que tu fais

1. Modifie les fichiers concernés (motif, normes, correction…).
2. Ouvre **`sw.js`** et augmente le numéro (5e ligne) : `const VERSION = "1.0.1";`
   **Sans ce changement, les téléphones gardent l'ancienne version.**
3. Sur GitHub : **Add file → Upload files**, glisse les fichiers modifiés **et `sw.js`**, en respectant leurs dossiers, puis **Commit changes**.
   Le plus simple est de glisser à nouveau les 7 éléments obligatoires : GitHub remplace les anciens fichiers.
4. Attends 1 à 2 minutes que GitHub Pages publie la version.

### Ce qui se passe sur le téléphone

1. À chaque ouverture de l'app (et toutes les heures si elle reste ouverte), le téléphone vérifie `sw.js`.
2. Si le numéro a changé, la nouvelle version est **téléchargée en entier, en arrière-plan**, à côté de l'ancienne. L'ancienne continue de fonctionner pendant ce temps. Si le téléchargement échoue (réseau coupé), rien ne change et la tentative est refaite plus tard.
3. Le bandeau **« Nouvelle version disponible (1.0.1) — Recharger »** apparaît. Touche **Recharger** : le dossier ouvert est enregistré, puis l'app redémarre sur la nouvelle version.
   Tu peux aussi fermer le bandeau (✕) et finir ton observation : la nouvelle version s'activera à la prochaine ouverture complète de l'app.
4. **⚙ Réglages** affiche la version installée. Le bouton **« Rechercher une mise à jour »** force la vérification.

### Les dossiers en cours ne sont jamais effacés

Les dossiers sont enregistrés dans le stockage local du navigateur. La mise à jour ne remplace que les fichiers de l'application, dans un cache séparé. Si une future version renomme une question, l'ancienne réponse est simplement ignorée, pas effacée.

---

## 5. Tester sur l'ordinateur avant de mettre en ligne (facultatif)

Dans le Terminal du Mac :

```bash
cd ~/Desktop/"app observation "
```

```bash
python3 -m http.server 8000
```

Ouvre ensuite **http://localhost:8000** dans Chrome. Pour simuler un téléphone : clic droit → **Inspecter** → icône téléphone. Arrête le serveur avec `Ctrl + C`.

---

## 6. Bon à savoir

- **Les données sont uniquement sur ce téléphone.** Désinstaller l'app ou effacer les données de Chrome (Paramètres → Applications → Chrome → Stockage) **efface tous les dossiers**. Une mise à jour, elle, ne les efface pas.
- Il n'y a **pas de synchronisation** entre téléphones : c'est voulu, pour la confidentialité.
- **Suppression automatique** : 7 jours par défaut (réglable dans ⚙), avec un rappel et un bouton d'export PDF.
- **PDF** : bouton PDF → fenêtre d'impression d'Android → **Enregistrer au format PDF**.
- Protège ton téléphone par un code de verrouillage.

## 7. Problèmes fréquents

| Problème | Solution |
|---|---|
| Pas d'option « Installer l'application » | L'adresse doit commencer par `https://` et être ouverte dans Chrome. Recharge la page une fois. |
| Écran « Erreur au chargement » | Un fichier modifié contient une erreur (virgule, guillemet, accolade). Le message indique le fichier et la ligne. |
| La mise à jour n'arrive pas | As-tu augmenté `VERSION` dans `sw.js` et envoyé `sw.js` ? Attends 2 min, puis ⚙ → **Rechercher une mise à jour**. |
| Page GitHub « 404 » | Attends 2 min après l'activation de Pages, et vérifie que `index.html` est à la racine du dépôt. |
| L'app ne s'ouvre pas hors ligne | Elle doit avoir été ouverte une fois avec Internet après l'installation ou la mise à jour. |
