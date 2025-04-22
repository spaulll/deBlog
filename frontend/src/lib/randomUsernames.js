function getRandomUsername() {
    // Expanded adjective list (only lengths 3–5 so adj.len + noun.len = 8)
    const adjectives = [
        // 3 letters
        "Red", "Big", "Icy", "Hot", "Raw", "Sly", "New", "Fun", "Sad", "Mad",
        "Fit", "Odd", "Bad", "Wet", "Dry", "Hip", "Old", "Dim", "Shy", "Coy",
        "Tan", "Any", "All", "Ace", "Air", "Apt",
        // 4 letters
        "Fast", "Cool", "Dark", "Blue", "Bold", "Wild", "Neat", "Tiny", "Calm", "Keen",
        "Huge", "Kind", "Wise", "Warm", "Soft", "Good", "Last", "Same", "Next", "High",
        "Long", "Able", "Free", "True", "Real",
        // 5 letters
        "Sharp", "Happy", "Swift", "Brave", "Lucky", "Witty", "Chill", "Jolly", "Zesty", "Glowy",
        "Sunny", "Misty", "Spicy", "Quiet", "Fuzzy", "Merry", "Scary", "Sassy", "Quick", "Brisk",
        "Frost", "Hasty", "Noisy", "Proud", "Rapid", "Rough", "Sweet", "Bland", "Harsh", "Great",
        "Small", "Young", "Slow", "Bright", "Dark", "Light", "Heavy", "Empty", "Clean"
    ];
    
    const nouns = [
        // 3 letters
        "Cat", "Dog", "Bat", "Owl", "Fox", "Rat", "Cow", "Ant", "Eel", "Pig",
        "Ram", "Yak", "Emu", "Gnu", "Bee", "Ape", "Elk", "Hen", "Jay", "Koi",
        "Asp", "Boa", "Cod", "Doe", "Ewe", "Fly", "Gar",
        // 4 letters
        "Lion", "Frog", "Hawk", "Wolf", "Bear", "Lynx", "Moth", "Deer", "Seal", "Crab",
        "Bull", "Goat", "Fawn", "Swan", "Lamb", "Mule", "Puma", "Kiwi", "Duck", "Hare",
        "Mole", "Pike", "Toad", "Wasp", "Worm", "Zebu", "Crow", "Dove",
        // 5 letters
        "Otter", "Panda", "Tiger", "Raven", "Shark", "Cobra", "Bison", "Rhino", "Sloth", "Dingo",
        "Koala", "Viper", "Gecko", "Whale", "Goose", "Horse", "Zebra", "Moose", "Shrew", "Eagle",
        "Llama", "Camel", "Hyena", "Lemur", "Mouse", "Quail", "Sheep", "Crane", "Snake", "Trout",
        "Bream"
    ];

    const symbols = ["_", "-", "~", "+"]; // always include a symbol

    let adj, noun;
    // Keep picking until we get a pair whose lengths sum to 8
    do {
        adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        noun = nouns[Math.floor(Math.random() * nouns.length)];
    } while (adj.length + noun.length !== 8);

    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const digit = Math.floor(Math.random() * 10); // single 0–9

    // adj (len A) + symbol (1) + noun (len N) + digit (1) = A + N + 2 = 8 + 2 = 10
    return `${adj}${symbol}${noun}${digit}`;
}

export default getRandomUsername;
