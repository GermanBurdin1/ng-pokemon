export interface AllPokemons {
    count: number;
    next: string;
    previous: string | null;
    results: {
        name: string
        url: string;
    }[]
}

export interface Pokemon {
    id: number;
    name: string;
    types: {
        slot: number;
        type: {
            name: string;
            url: string
        }
    }[];
    sprites: {
        back_default: string | null;
        back_female: string | null;
        back_shiny: string | null;
        back_shiny_female: string | null;
        front_default: string | null;
        front_female: string | null;
        front_shiny: string | null;
        front_shiny_female: string | null;
    }
}

export interface StatePokemons {
    nextUrl: string | null;
    previousUrl: string | null;
    pokemonsObj: Record<number, Pokemon>;
}