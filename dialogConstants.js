const versionMessage = "Hello Kapamilya! I am Raz (v1.2), your Kapamilya chat bot!";

const mainMenu = { 
    "News": { item: "newsMenu" },
    "Entertainment": { item: "entertainmentMenu" },
    "MYX": { item: "myxMenu" },
    "Lifestyle": { item : "lifestyleMenu" },
    "Sports": { item: "sportsMenu" },
    "Push" : { item: "pushMenu" },
    "E! News": { item: "eNewsMenu" },
    "Choose Philippines" : { item: "choosePhilippinesMenu" },
    "TrabaHanap": { item: "trabahanapMenu" },
    "Government": { item: "governmentMenu" }
};

const newsMenu = {
    "Latest": { item: "newsLatest" },
    "Nation": { item: "newsNation" },
    "Business": { item: "newsBusiness" },
    "Entertainment": { item: "newsEntertainment" },
    "Metro Manila": { item: "newsMetroManila" },
    "Sports": { item: "newsSports" },
    "Back": { item: "mainMenu" }
};

const governmentMenu = { 
    "SSS": { item: "governmentSSS" },
    "LTO - License & Permit": { item: "governmentLtoLicensePermit" },
    "LTO - Motor Vehicle Registration": { item: "governmentLtoVehicle" },
    "LTO - Law Enforcement & Adjudication of Cases": { item: "governmentLtoLaw" },
    "LTO - Optional Motor Vehicle Special Plates": { item: "governmentLtoOMVSP" },
    "Pag-IBIG": { item: "governmentPagIBIG" },
    "Back": { item: "mainMenu" }
};

module.exports.VersionMessage = versionMessage;
module.exports.MainMenu = mainMenu;
module.exports.NewsMenu = newsMenu;
module.exports.GovernmentMenu = governmentMenu;