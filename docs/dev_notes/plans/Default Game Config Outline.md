To start off, we’ll want to implement an absolutely basic, default level and game configuration for testing. The initial version of our code will have:

1. Default controls.ts with:
    primaryAction: ‘jump’
    secondaryAction: ‘attack’
    keyboardLayout: {
        z: ‘primaryAction’
        x: ‘secondaryAction’}
2. Default player.ts with:
    characterImage: ‘player_image.png’
3. Default global.ts with:
    Gravity value, which is dynamically pulled into the game for use
    backgroundColor: ‘#000000’
    objectColor: ‘#ffffff’
4. Default display.ts with:
    Basic display values that make sense, which are dynamically pulled into the game for use
5. Default zones/test_zone_0.ts with:
    Settings to define a perfectly square room with 1 object
    name: “Test Zone 0”
    objects: {
    block_white: {
        x: .5
        y: .5
        }
    }
6. Default objects/test_block_0.ts with:
    appearance: {
        displayMode: ‘drawnDisplay’,
        drawnDisplay: {
            ‘color’: ‘#ffffff’
            width: ‘.1’
            height: ‘.1’
        }
    }
