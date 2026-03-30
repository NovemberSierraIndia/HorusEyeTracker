export const quotes = [
  { text: "If you no longer go for a gap that exists, you are no longer a racing driver.", author: "Ayrton Senna" },
  { text: "To achieve anything in this game, you must be prepared to dabble on the boundary of disaster.", author: "Stirling Moss" },
  { text: "I am not designed to come second or third. I am designed to win.", author: "Ayrton Senna" },
  { text: "Once you've raced, you never forget it, and you never get over it.", author: "Richard Childress" },
  { text: "A racing car is an animal with a thousand adjustments.", author: "Mario Andretti" },
  { text: "What's behind you doesn't matter.", author: "Enzo Ferrari" },
  { text: "To finish first, you must first finish.", author: "Juan Manuel Fangio" },
  { text: "Desire is the key to motivation, but it's determination and commitment to an unrelenting pursuit of your goal that will enable you to attain the success you seek.", author: "Mario Andretti" },
  { text: "Racing is life. Everything before and after is just waiting.", author: "Steve McQueen" },
  { text: "I have made my own weapons since I was very young. The difference between the possible and the impossible lies in a person's determination.", author: "Tommy Lasorda" },
  { text: "From the moment the dream is planted in your brain, every single day you work to achieve it or you work to kill it.", author: "Niki Lauda" },
  { text: "I refuse to accept that merely surviving is enough. Living should be an act of ambition.", author: "Niki Lauda" },
  { text: "Speed has never killed anyone. Suddenly becoming stationary, that's what gets you.", author: "Jeremy Clarkson" },
  { text: "There is always one more thing you can do to increase your odds of success.", author: "Niki Lauda" },
  { text: "If everything seems under control, you're just not going fast enough.", author: "Mario Andretti" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "I don't count my sit-ups. I only start counting when it starts hurting because they're the only ones that count.", author: "Muhammad Ali" },
  { text: "The people who are crazy enough to think they can change the world are the ones who do.", author: "Steve Jobs" },
  { text: "It is not the strongest of the species that survive, nor the most intelligent, but the one most responsive to change.", author: "Charles Darwin" },
  { text: "Be so good they can't ignore you.", author: "Steve Martin" },
  { text: "Cars are the sculptures of our everyday life.", author: "Chris Bangle" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Without struggle, there is no progress.", author: "Frederick Douglass" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In racing, they say that your weights are your wings. When you stop worrying about weight, you can fly.", author: "Dieter Rams" },
  { text: "A car for every purse and purpose.", author: "Alfred P. Sloan" },
  { text: "Vision without execution is hallucination.", author: "Thomas Edison" },
  { text: "The competitor to be feared is one who never bothers about you at all, but goes on making his own business better all the time.", author: "Henry Ford" },
  { text: "When you want to succeed as bad as you want to breathe, then you'll be successful.", author: "Eric Thomas" },
];

export function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return quotes[dayOfYear % quotes.length];
}
