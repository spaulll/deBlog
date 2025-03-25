function getRandomUsername() {
    const adjectives = [
        "Fast", "Cool", "Dark", "Red", "Blue", "Big", "Tiny", "Sharp", "Happy", "Swift",
        "Brave", "Clever", "Fierce", "Bold", "Lucky", "Witty", "Chill", "Wild", "Sneaky", "Jolly",
        "Neat", "Zesty", "Breezy", "Glowy", "Cheery", "Sunny", "Icy", "Misty", "Stormy", "Snappy"
    ];

    const nouns = [
        "Cat", "Dog", "Bat", "Owl", "Fox", "Lion", "Frog", "Hawk", "Wolf", "Bear",
        "Otter", "Panda", "Tiger", "Raven", "Shark", "Cobra", "Bison", "Falcon", "Lynx", "Turtle",
        "Moth", "Rhino", "Sloth", "Pigeon", "Panther", "Dingo", "Koala", "Viper", "Deer", "Gecko"
    ];

    const symbols = ["", "_", "-", "."]; // Safe special characters

    let username = "";
    while (username.length === 0 || username.length <= 10) {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        let num = Math.floor(Math.random() * 1000); // 000-999

        // Generate base username
        username = `${adj}${symbol}${noun}`;

        // Trim number if it exceeds 10 characters
        if (username.length + num.toString().length > 10) {
            num = Math.floor(Math.random() * 10); // Use single digit instead
        }

        username += num;
    }

    return username;
}

export default getRandomUsername;
