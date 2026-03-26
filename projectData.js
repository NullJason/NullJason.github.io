// projectData.js

const GITHUB_USERNAME = 'NullJason';

let manualProjects = [
    {
        id: 'dodeca-drop',
        title: "Dodeca Drop",
        shortDesc: "Break 2D geometry with the shrapnel of the mouse.",
        longDesc: "A 2D physics-based sim where the objective is to clear the screen by breaking geometric shapes.",
        link: "dodecaDrop.html",
        imageUrl: "Icons/geodropIcon.png", 
        category: "Entertainment",
        tags: ["Web Project", "Physics"]
    },
    {
        id: 'geometry-sim',
        title: "Geometry Crunch",
        shortDesc: "3D Version of Dodeca Drop, shapes to your heart's content.",
        longDesc: "This is a fully 3D interactive physics simulation in the form of a game, Enjoy.",
        link: "geometrySim.html",
        imageUrl: "Icons/GeoCrushIcon.png",
        category: "Entertainment",
        tags: ["3D", "WIP"]
    },
    {
        id: 'cpu-sim',
        title: "CPU Simulator",
        shortDesc: "Macroarch visual explorer (MAVE)",
        longDesc: "Interactive Visualizers including CPU visuals & toy ISA. A work-in-progress project aimed at teaching computer architecture fundamentals.",
        link: "MAVE_Hub.html",
        imageUrl: "Icons/MAVEIcon.png",
        category: "Education",
        tags: ["Computer Architecture", "WIP"]
    },
    {
        id: 'firework',
        title: "Explosives",
        shortDesc: "Watch the fireworks(?) cascading through the spacescape.",
        longDesc: "Use and watch some questionable explosives. Web Graphics woohoo.",
        link: "RealisticExplosions.html",
        imageUrl: "Icons/explosivesIcon.png",
        category: "Entertainment",
        tags: ["Graphics", "WIP"]
    },
    {
        id: 'universe-sandbox',
        title: "Universe Sandbox 2D",
        shortDesc: "A 2D Sandbox that allows you to merge planets, shoot debris, and much more.",
        longDesc: "This sandbox is a attempt at making a 2D version of Universe Sandbox 2 that can be played on the web.",
        link: "2DUniSandboxSim.html",
        imageUrl: "Icons/Uni2DIcon.png",
        category: "Entertainment",
        tags: ["3D","Physics","Graphics", "WIP"]
    }
];

const explicitRepos = {
    // 'TrashyCollector': { category: 'Entertainment', tags: ['Game Dev', 'C#'] },
    'Decked-Out-Shuffled': { category: 'Entertainment', tags: ['Game Dev', 'Card Game'] },
    'DungeonCrawler': { category: 'Entertainment', tags: ['Game', 'RPG'] }
};