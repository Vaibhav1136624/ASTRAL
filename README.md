# ASTRAL

[Play ASTRAL in your browser](https://astral-the-game.pages.dev/). Split moonlight through a prism and guide four wavelengths home across 101 optical puzzles.

The playable site is in `www/`; open it using any static web server. The Android Studio project is in `android/`, and the Windows launcher source is in `windows/`. The Android app has not been released on Google Play.

## Development
Install Node.js 22+ and run `npm ci`. Use `npm run build` to regenerate assets, then `npm run android:sync` to update Android. Use `npm run android:open` to open Android Studio. The Android project targets API 36.

## Checks
From the repository root, run:
```
node tests/verify.cjs
node tests/verify-cosmos.cjs
node tests/verify-animations.cjs
```

## Windows
Copy the contents of `www/` into a distribution folder, then compile `windows/Astral.cs` there with the .NET Framework C# compiler, using `/target:winexe /out:Astral.exe /win32icon:assets/astral.ico /r:System.Drawing.dll /r:System.Windows.Forms.dll`. Run Astral.exe with Microsoft Edge installed.
