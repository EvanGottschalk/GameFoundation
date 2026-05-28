Each file in the `zones` folder defines a certain place in the game; a "setting", which is technically referred to as a `zone`. `zone` files in the `zones` folder define the world that is seen on the screen when the user is in the respective `zone`. The `zone` is what is behind menu elements.

Each `zone` file may import game information, such as:
1. `objects` - each entry for `objects` in a particular `zone` identifies an `object` asset that the user can interact with in the geography of the `zone`. The entries define when, where, and how the `object` can be interacted with. It may also define features of the `object` that are particular to the `zone`.
2. `backgrounds`
3. `characters`
4. `items` - each entry for `items` in a particular `zone` identifies an `item` asset that the user can collect in their inventory within the `zone`. The entries define when, where, and how the `item` can be collected. It may also define features of the `item` that are particular to the `zone`.
5. `events`
6. `dialogues`

This game information comes from the respective `config` folders and files.

The importing of game information in `zones` is for two purposes:
1. Listing what game assets are in the particular zone, and when/where they appear.
2. Zone-specific modifications to the assets, such as dialogue for a character that is specific to the zone.

**Hierarchy Rule** - features defined in a `zone` have a higher authority than features defined in any individual asset. Zone-specific modifications always take priority over features defined in individual asset files.