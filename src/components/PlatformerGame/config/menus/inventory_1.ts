const menu = {
    lists: [
        {
            name: 'item list',
            contents: ['???'], // dynamically every item stored in player inventory
            position: {
                x_alignment: 'centered',
                x_offset: -160, // pixels left or right of alignment position
                y_alignment: 'top',
                y_offset: '50' // pixels from top
            },
            spacing: 40, // pixels between each item shown 
            maxItemsDisplayed: 50,           
            itemImages: {
                display: true,
                width: 80, // pixel width of item images
            },
            itemNames: {
                display: false,
                fontSize: 10,
            },
        }
    ]
    


} as const;

export default menu;