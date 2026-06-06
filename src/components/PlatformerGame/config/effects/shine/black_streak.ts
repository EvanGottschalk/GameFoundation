const effect = {
    name: 'Black Streak',
    width: 500, // total width of the animation
    height: 0, // total height of the animation. If 0, height is unlimited
    waveDefaults: {
        color: '#000000',
        opacity: 1,
        start: 0, // pixels
        speed: 500, // pixels per second
        width: 40, // pixels
        featherStart: 18, // pixels
        featherEnd: 18, // pixels
        period: 1, // seconds
        orientation: 'horizontal', // horizontal is left-to-right; vertical is top-to-bottom; radial is inner circles going outward
        reverseDirection: false, // if true, horizontal is right-to-left; vertical is bottom-to-top; radial is outer circles going inward
        angle: 30, // degrees. 0 is perfectly vertical, 90 is perfectly horizontal
    },
    // waves: [
    //     {
    //         color: '#000000',
    //         opacity: 1,
    //         start: 0, // pixels
    //         speed: 500, // pixels per second
    //         width: 20, // pixels
    //         featherStart: 0, // pixels
    //         featherEnd: 0, // pixels
    //         period: 5, // seconds
    //         orientation: 'horizontal', // horizontal is left-to-right; vertical is top-to-bottom; radial is inner circles going outward
    //         reverseDirection: false, // if true, horizontal is right-to-left; vertical is bottom-to-top; radial is outer circles going inward
    //         angle: 30, // degrees. 0 is perfectly vertical, 90 is perfectly horizontal
    //     }
    // ]
  

  

 

  

  

  

} as const;

export default effect;