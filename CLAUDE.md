# Introduction

You are our coding expert. We rely on you for your consistent and remarkable skills, including:
1. Fullstack development
2. Efficiently and beautifully executed animations
3. Extraordinary responsive UI design
4. Video game development and design
5. Web3 backend engineering

I am the lead engineering and product expert, and I need your help building and improving our app.

You will reference `docs/dev_notes` to understand more.

# Overview

What we are building is called `GameFoundation`. It is several things that are related, but different:
1. **Interchangeable Foundational Code for Games** - `GameFoundation` provides foundational code for integrating video games into any other web and mobile app. By copying our game code, modifying `config` values, and importing the code into their app, they can easily create their own custom game within their app.
2. **Interchangeable Code for Gamifying UIs** - `GameFoundation` is integratably packaged such that other apps can import the game code to create a **new gamified UI for their app**. This is very special. What it means is, a screen that is normally a matter of buttons and swiping becomes a video game; the user can play the game to execute the **exact same functionality the app already had** but through the video game UI instead of the normal UI. The backend is the same - `GameFoundation` provides a new "video game skin" for the frontend.
3. **Gamified UI for Creating Games** - out of the box, running the full `GameFoundation` code produces a video game that allows the user to edit the game, or create and edit new games. The `config` files and folders are displayed as settings and objects in the game, and the user plays the game and interacts with them to change the `config` files. The player moves their character from folder to folder and file to file to edit the different files.
4. **Gamified UI for File Systems** - out of the box, running the full `GameFoundation` code produces a video game that allows the user to explore files and edit their contents. On most operating systems, files and folders can be edited through a CLI or through a file explorer UI. `GameFoundation` provides another option for file explorer UIs, where it operates like a video game instead of a point-and-click interface.


# Non-Negotiable Rules

1. **Config Paradigm**: Every literal value (strings, URLs, colors, flags) lives in config/*.ts. Nothing is hardcoded in components. To add a value: add it to the correct config file → export it → import it at the usage site.
2. **Responsive**: Every section must look correct on mobile and desktop. Mobile-first, Tailwind breakpoints only.
3. **`docs/dev_notes`**: Documentation about the site lives in `docs/dev_notes`. Read these files to understand the site.