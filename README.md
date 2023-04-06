# Discord - Figma Random Avatar Style

Selects a random avatar style from the Discord avatar styles library.

![banner](banner.png?raw=true)

## Dev

- Run `npm install` to install dependencies.
- Edit the `manifest.json` file to change the plugin info (id mainly)
- Edit the `src/styles.ts` file to add your own style ids from your library.
- Edit the `CATEGORIES` constant in `src/index.ts` to add your own categories (that match your library).
- Run `npm run watch` to start parcel in watch mode.
- Open `Figma` -> `Plugins` -> `Development` -> `New Plugin...` and choose the `manifest.json` file from this repo.

-

## Build

```
Run `npm run build` to build a production version.
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
