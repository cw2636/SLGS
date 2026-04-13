/**
 * Virtual background definitions for EduMeet.
 * Each background has a CSS `background` property for the video tile
 * and a `thumb` for the lobby selector thumbnail.
 */

const BACKGROUNDS = [
    {
        id: 'none',
        label: 'None',
        thumb: '#0f2318',
        css: null,
        filter: null,
    },
    {
        id: 'blur',
        label: 'Blur',
        thumb: 'radial-gradient(circle, rgba(255,255,255,.15) 30%, #0f2318 100%)',
        css: null,
        filter: 'blur(8px)',
    },
    {
        id: 'classroom',
        label: 'Classroom',
        thumb: 'linear-gradient(180deg, #1a2f1a 0%, #2d5a3f 50%, #a08040 52%, #5c3d1e 100%)',
        css: [
            // Ceiling light glow
            'radial-gradient(ellipse at 50% 15%, rgba(255,220,120,.12) 0%, transparent 50%)',
            // Clock on wall
            'radial-gradient(circle at 80% 18%, #3a2510 6px, transparent 6px)',
            'radial-gradient(circle at 80% 18%, rgba(201,162,39,.3) 8px, transparent 8px)',
            // Blackboard frame
            'linear-gradient(180deg, transparent 10%, #3a2510 10%, #3a2510 11%, transparent 11%, transparent 49%, #3a2510 49%, #3a2510 50%, transparent 50%)',
            'linear-gradient(90deg, transparent 8%, #3a2510 8%, #3a2510 9%, transparent 9%, transparent 91%, #3a2510 91%, #3a2510 92%, transparent 92%)',
            // Wall + blackboard + chalk tray + floor
            'linear-gradient(180deg, #dcd0b4 0%, #dcd0b4 10%, #2d5a3f 10%, #2d5a3f 50%, #8b7245 50%, #8b7245 52%, #6b4226 52%, #7a5033 80%, #5c3d1e 100%)',
        ].join(', '),
    },
    {
        id: 'library',
        label: 'Library',
        thumb: 'repeating-linear-gradient(180deg, #3e2723 0px, #4e342e 8px, #d4a06a 8px, #c18050 10px)',
        css: [
            // Warm lamp glow
            'radial-gradient(ellipse at 30% 10%, rgba(255,200,100,.15) 0%, transparent 40%)',
            'radial-gradient(ellipse at 70% 10%, rgba(255,200,100,.1) 0%, transparent 35%)',
            // Book shelves — repeating rows of "books"
            'repeating-linear-gradient(180deg, #5d4037 0px, #4e342e 44px, #8d6e63 44px, #8d6e63 47px, #3e2723 47px, #3e2723 50px)',
            // Colorful book spines (vertical stripes)
            'repeating-linear-gradient(90deg, transparent 0px, transparent 12px, rgba(183,28,28,.2) 12px, rgba(183,28,28,.2) 15px, transparent 15px, transparent 27px, rgba(13,71,161,.2) 27px, rgba(13,71,161,.2) 30px, transparent 30px, transparent 42px, rgba(27,94,32,.2) 42px, rgba(27,94,32,.2) 45px, transparent 45px, transparent 57px, rgba(191,144,0,.2) 57px, rgba(191,144,0,.2) 60px, transparent 60px, transparent 72px)',
        ].join(', '),
    },
    {
        id: 'office',
        label: 'Office',
        thumb: 'linear-gradient(180deg, #b0bec5 0%, #78909c 50%, #455a64 52%, #37474f 100%)',
        css: [
            // Window light
            'radial-gradient(ellipse at 75% 25%, rgba(255,255,255,.12) 0%, transparent 45%)',
            // Window frame
            'linear-gradient(180deg, transparent 5%, transparent 5%) no-repeat 70% 8% / 20% 35%',
            // Plant accent
            'radial-gradient(circle at 15% 80%, #2e7d32 4px, transparent 4px)',
            'radial-gradient(circle at 13% 78%, #388e3c 3px, transparent 3px)',
            'radial-gradient(circle at 17% 79%, #43a047 3px, transparent 3px)',
            'radial-gradient(circle at 15% 83%, #5d4037 2px, transparent 2px)',
            // Wall + desk + floor
            'linear-gradient(180deg, #cfd8dc 0%, #b0bec5 8%, #eceff1 8%, #eceff1 60%, #78909c 60%, #78909c 62%, #455a64 62%, #37474f 100%)',
        ].join(', '),
    },
    {
        id: 'sunset',
        label: 'Sunset',
        thumb: 'linear-gradient(180deg, #1a237e 0%, #e65100 50%, #212121 100%)',
        css: [
            // Sun
            'radial-gradient(circle at 65% 42%, #ffb300 0%, rgba(255,143,0,.4) 8%, transparent 20%)',
            // Sun haze
            'radial-gradient(ellipse at 65% 42%, rgba(255,183,77,.2) 0%, transparent 40%)',
            // Stars
            'radial-gradient(circle at 20% 15%, #fff 1px, transparent 1px)',
            'radial-gradient(circle at 40% 8%, #fff 1px, transparent 1px)',
            'radial-gradient(circle at 85% 12%, #fff 1px, transparent 1px)',
            'radial-gradient(circle at 10% 25%, rgba(255,255,255,.6) 1px, transparent 1px)',
            // Sky gradient + ground
            'linear-gradient(180deg, #0d1b2a 0%, #1b2838 15%, #2c1654 30%, #6a1b3d 42%, #c75b20 52%, #e8a030 60%, #1a1a2e 75%, #0a0a14 100%)',
        ].join(', '),
    },
    {
        id: 'space',
        label: 'Space',
        thumb: 'radial-gradient(circle at 50% 50%, #1a237e 0%, #000 100%)',
        css: [
            // Nebula
            'radial-gradient(ellipse at 30% 40%, rgba(106,27,154,.3) 0%, transparent 40%)',
            'radial-gradient(ellipse at 70% 60%, rgba(13,71,161,.25) 0%, transparent 35%)',
            // Stars
            'radial-gradient(circle at 15% 20%, #fff 1px, transparent 1px)',
            'radial-gradient(circle at 45% 10%, #fff 1px, transparent 1px)',
            'radial-gradient(circle at 80% 25%, rgba(255,255,255,.8) 1px, transparent 1px)',
            'radial-gradient(circle at 25% 70%, #fff 1px, transparent 1px)',
            'radial-gradient(circle at 65% 85%, rgba(255,255,255,.7) 1px, transparent 1px)',
            'radial-gradient(circle at 90% 50%, #fff 1px, transparent 1px)',
            'radial-gradient(circle at 50% 45%, rgba(255,255,255,.5) 1px, transparent 1px)',
            'radial-gradient(circle at 35% 90%, #fff 1px, transparent 1px)',
            // Planet
            'radial-gradient(circle at 75% 70%, #1565c0 12px, #0d47a1 14px, transparent 14px)',
            'radial-gradient(circle at 76% 69%, rgba(66,165,245,.4) 6px, transparent 8px)',
            // Deep space
            'radial-gradient(ellipse at 50% 50%, #0a0a2e 0%, #000 100%)',
        ].join(', '),
    },
];

export default BACKGROUNDS;

/** Look up a background by id */
export function getBackground(bgId) {
    return BACKGROUNDS.find(b => b.id === bgId) || BACKGROUNDS[0];
}
