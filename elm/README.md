# Tetris made by Elm

## Development environment

- CLI
  - Node.js 20.0.0 via nodenv or something like this
- Editor
  - Visual Studio Code
    - [Elm](https://marketplace.visualstudio.com/items?itemName=Elmtooling.elm-ls-vscode)
    - [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
    - [Run on Save](https://marketplace.visualstudio.com/items?itemName=emeraldwalk.runonsave)

The following `settings.json` in Visual Studio Code is for hot reloading in this
project.

```settings.json
{
  "emeraldwalk.runonsave": {
    "commands": [
      {
        "match": "Main\\.elm$",
        "cmd": "npm run build"
      }
    ]
  }
}
```

## How to run

Click `Go Live` button of Live Server at Visual Studio Code and open `output` folder.

## Demo

[Elm Tetris](https://satosystems.github.io/tetris/elm/)
