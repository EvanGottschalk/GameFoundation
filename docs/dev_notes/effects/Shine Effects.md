# Shine Overview

A `shine effect` is a specific type of animated effect that can be overlayed on anything in the game. It appears as a band of color (or bands of colors) that periodically appear on an object/character/item/background/etc. and gradually pass over it before disappearing. Each band is referred to as a `wave`.

Pre-made templates for `shine effects` are saved in `config/effects/shine_effects` and can be imported by other game assets to have the effect layered over it.

# Shine Parameters

`name`: a name identifier for reference.
`width`: this number is the total distance a shine effect is functionally traveling from start to finish.
`height`: this number is usually not used, but it can limit the height of a shine effect. By default, a shine effect covers an entire object from top to bottom.
`waveDefaults`: this object defines the default features of the individual wave(s).
    `waveDefaults.color`: color of waves.
    `waveDefaults.opacity`: opacity of waves.
    `waveDefaults.start`: this is effectively a delay on when the wave appears. If it's 0, the wave appears immediately. If it's 1, it appears 1 second after the asset is loaded.
    `waveDefaults.speed`: this number is the speed the wave travels across the asset it is overlaying. If the overall width is 500 pixels, and the speed is 500, then the wave will travel the full length in 1 second.
    `waveDefaults.width`: width of the wave in pixels.
    `waveDefaults.period`: number of seconds between each time the wave animation starts and stops. For example, if the period is 5, then the wave will appear and go through its animation every 5 seconds.
    `waveDefaults.orientation`: this defines the style of the waves and the axis along which they travel. There are 3 possible values for orientation: 'horizontal' is left-to-right; 'vertical' is top-to-bottom; 'radial' is inner circles going outward. 
    `waveDefaults.reverseDirection`: if set to `true`, the direction associated with the orientation is negated. Thus, 'horizontal' would become right-to-left; 'vertical' would become bottom-to-top; 'radial' would become outer circles going inward
    `waveDefaults.angle`: angle in degrees by which the waves are skewed. Given a 'horizontal' orientation, then 0 degrees means each wave is a perfectly vertical rectangle, and 90 degrees means each wave is perfectly horizontal.
`waves`: this list contains each individual wave. It is only necessary if there are multiple different types of waves within a shine animation.