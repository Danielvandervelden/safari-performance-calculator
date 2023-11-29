import inquirer from "inquirer";

// In seconds
const CATCH_TIME_1_BALL = 25;
const ROCK = 5;

const pokemon = {
    nidoran_female: {
        name: "Nidoran (F)",
        weight: 3,
        rock: false,
    },
    nidoran_male: {
        name: "Nidoran (M)",
        weight: 3,
        rock: false,
    },
    nidorina: {
        name: "Nidorina",
        weight: 2,
        rock: true,
    },
    nidorino: {
        name: "Nidorino",
        weight: 2,
        rock: true,
    },
    paras: {
        name: "Paras",
        weight: 1,
        rock: false,
    },
    parasect: {
        name: "Parasect",
        weight: 1,
        rock: true,
    },
    venonat: {
        name: "Venonat",
        weight: 1,
        rock: false,
    },
    venomoth: {
        name: "Venomoth",
        weight: 1,
        rock: true,
    },
    exeggcute: {
        name: "Exeggcute",
        weight: 2,
        rock: true,
    },
    rhyhorn: {
        name: "Rhyhorn",
        weight: 1,
        rock: true,
    },
    doduo: {
        name: "Doduo",
        weight: 1,
        rock: false,
    },
    tauros: {
        name: "Tauros",
        weight: 1,
        rock: true,
    },
    kangaskhan: {
        name: "Kangaskhan",
        weight: 1,
        rock: true,
    },
    scyther: {
        name: "Scyther",
        weight: 1,
        rock: true,
    },
    chansey: {
        name: "Chansey",
        weight: 1,
        rock: true,
    },
};

inquirer
    .prompt([
        {
            message: "What is the safari zone entry time? (HH:MM:SS)",
            name: "entryTime",
            type: "input",
            validate: (input: string) => {
                const isValidTime = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(
                    input
                );
                return isValidTime || "Please enter a valid time in HH:MM:SS format.";
            },
        },
        {
            message: "What pokemon were caught?",
            name: "caughtPokemon",
            type: "checkbox",
            choices: Object.values(pokemon).map((p) => p.name),
        },
        {
            message: "What is the safari zone exit time? (HH:MM:SS)",
            name: "exitTime",
            type: "input",
            validate: (input: string) => {
                const isValidTime = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(
                    input
                );
                return isValidTime || "Please enter a valid time in HH:MM:SS format.";
            },
        },
    ])
    .then(
        ({
            entryTime,
            exitTime,
            caughtPokemon,
        }: {
            entryTime: string;
            exitTime: string;
            caughtPokemon: string[];
        }) => {
            const timeSpentCatchingPokemon = caughtPokemon.reduce((acc, poke) => {
                const rockTime = pokemon[
                    convertPokemonNameToKey(poke) as keyof typeof pokemon
                ].rock
                    ? ROCK
                    : 0;
                return acc + CATCH_TIME_1_BALL + rockTime;
            }, 0);

            const timeSpentInSeconds = subtractTimes(entryTime, exitTime);

            const score = calculateScore(
                caughtPokemon,
                timeSpentCatchingPokemon,
                parseInt(timeSpentInSeconds)
            );

            const formattedTimeString = formatTime(parseInt(timeSpentInSeconds));

            const pokemonList = caughtPokemon.join(", ");
            const scoreMessage = `gunShow Safari Zone Report gunShow || Caught Pokémon: ${caughtPokemon.length} (${pokemonList}) || Time spent: ${formattedTimeString} seconds || gunWow Final score... ${score}/10 gunWow`;

            console.log(scoreMessage);
        }
    );

function calculateScore(
    caughtPokemon: string[],
    timeSpentCatchingPokemon: number,
    timeSpentInSafariZone: number
): string {
    adjustWeightsForDuplicates(caughtPokemon);
    const totalWeight = caughtPokemon.reduce((acc: number, poke: string) => {
        return (
            acc + pokemon[convertPokemonNameToKey(poke) as keyof typeof pokemon].weight
        );
    }, 0);

    const weightOverflow = totalWeight - caughtPokemon.length;

    console.log("Total safari time: ", timeSpentInSafariZone);
    console.log("Time spent catching pokemon: ", timeSpentCatchingPokemon);
    console.log(
        "Safari time - catch time: ",
        timeSpentInSafariZone - timeSpentCatchingPokemon
    );
    console.log("Pokemon caught: ", caughtPokemon.length);
    console.log("Weight overflow: ", weightOverflow);

    const weightOverflowScore = getWeightOverflowScore(weightOverflow);
    const safariTimeScore = getSafariTimeScore(
        timeSpentInSafariZone,
        timeSpentCatchingPokemon
    );

    console.log("Weight overflow score: ", weightOverflowScore);
    console.log("Safari time score: ", safariTimeScore);

    return ((safariTimeScore + weightOverflowScore) / 2 / 10).toFixed(2);
}

function getWeightOverflowScore(weightOverflow: number): number {
    if (weightOverflow < 3) {
        return Math.floor((100 / 3) * weightOverflow);
    }

    return 100;
}

function getSafariTimeScore(
    timeSpentInSafariZone: number,
    timeSpentCatchingPokemon: number
): number {
    const timeInSafariMinusCatching = timeSpentInSafariZone - timeSpentCatchingPokemon;
    const PERFECTION_TIME = 100;
    const INTERVAL_FOR_POINT_LOSS = 13;
    const POINT_LOSS_PER_INTERVAL = 5;
    let pointDeduction = 0;

    console.log("Time in safari minus catching: ", timeInSafariMinusCatching);

    const differenceVsPerfection = timeInSafariMinusCatching - PERFECTION_TIME;

    if (differenceVsPerfection > 0) {
        pointDeduction =
            (differenceVsPerfection / INTERVAL_FOR_POINT_LOSS) * POINT_LOSS_PER_INTERVAL;
    }

    console.log("Point deduction: ", pointDeduction);

    return 100 - pointDeduction;
}

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minutes ${remainingSeconds} seconds`;
}

function adjustWeightsForDuplicates(caughtPokemon: string[]) {
    const hasNidorina = caughtPokemon.includes("Nidorina");
    const hasNidorino = caughtPokemon.includes("Nidorino");

    return caughtPokemon.map((poke) => {
        let key = convertPokemonNameToKey(poke);

        if (key === "nidoran_female" && hasNidorina) {
            pokemon[key].weight = 1;
        }

        if (key === "nidoran_male" && hasNidorino) {
            pokemon[key].weight = 1;
        }
    });
}

function timeToSeconds(time: string): number {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

export function subtractTimes(startTime: string, endTime: string): string {
    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);
    const difference = endSeconds - startSeconds;

    if (difference < 0) {
        throw new Error("End time must be later than start time.");
    }

    return difference.toString();
}

export function convertPokemonNameToKey(name: string): string {
    const lowercase = name.toLowerCase().replace(" ", "_");
    const fixMaleSuffix = lowercase.replace("(m)", "male");
    const fixFemaleSuffix = fixMaleSuffix.replace("(f)", "female");

    return fixFemaleSuffix;
}
