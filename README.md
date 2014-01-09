Enemy Unknown
===============

Enemy Unknown is a fast-paced multiplayer strategy game based on HTML5. We built this game since we want an easily accessible strategy game in browser that people can with with their friends in 10 minutes, yet with deep strategic depth.

The game mechanism is inspired by Stratego, where asymmetric information creates strategic depth. There 5 unit types (vampire, wolf, hunter, zombie, and wizard) under your command, each with 4 HP points. Vampire is the strongest unit, and wizard is the weakest. A stronger unit can punch a weaker unit hard, while a weaker unit cannot deal any damage to a stronger unit, except wizard, who can one-kill a vampire. You CANNOT see the type of enemy units during battle, so key to success is to figure out who they are, and try to keep the identity of your units hidden.

Each unit has a 2-grid move/attack range, and has 10 seconds cooldown after each move/attack.

There are several scenarios, each with different settings and winning strategies. There are also fog of war in this game, which means you cannot see too far on the battlefield. Some scenarios has resource points; capture them to gain resources and build more units!

The multiplayer feature is based on node.js and socket.io. See the usage below to install necessary modules.

Programmer: Beck Chen & Frank Zhang

Artist: Yi Hua

## Usage
* Get node.js
* run `npm install` inside the cloned folder
* run `node main.js` inside the cloned folder
* Visit http://127.0.0.1:4004/