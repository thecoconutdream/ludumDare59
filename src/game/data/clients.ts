export interface Client {
  name: string
  title: string
  order: string
  signal: string
  successQuote: string
  failQuote: string
}

export const CLIENTS: Client[] = [
  {
    name: 'Lord Biscuit IX',
    title: 'Heir of the Crouton Duchy',
    order: 'Quattro Formaggi, no crust',
    signal: 'His security AI rotates encryption keys every 3 minutes.',
    successQuote: '"Acceptable. The crust is absent. I ordered that."',
    failQuote: '"My lawyers operate on Frequency 9. Expect a call."',
  },
  {
    name: 'CEO Klorva Max',
    title: 'Founder of NebulaCoin (probably)',
    order: 'Spicy Meteor Wings x40, invoiced to treasury',
    signal: 'She never shares coordinates. Trust issues. Long story.',
    successQuote: '"Payment incoming. In NebulaCoin. Current value: unclear."',
    failQuote: '"This goes in the Q3 earnings report. Under losses."',
  },
  {
    name: 'Ambassador Gritta-6',
    title: 'Outer Rim Cheese Council, 3rd Delegate',
    order: 'Margherita, politically neutral toppings only',
    signal: 'Diplomatic protocol: all coordinates stay classified.',
    successQuote: '"Flawless. I will mention this at the summit. Probably."',
    failQuote: '"This incident delays the cheese treaty by six weeks."',
  },
  {
    name: 'Professor Wumbus',
    title: 'Retired Theoretical Pizza Physicist',
    order: 'Black Hole BBQ, extra spacetime on the side',
    signal: 'His quantum key rotates every 11 seconds. He finds this funny.',
    successQuote: '"The delivery paradox is solved! I will write a paper."',
    failQuote: '"Fascinating. My thesis was wrong. Back to square one."',
  },
  {
    name: 'Baroness Fluffhausen',
    title: 'Owner of 14 Moons, 3 Asteroid Belts',
    order: 'Truffle & Stardust, must not touch the crust',
    signal: 'Her estate AI scrambles all signals. For the aesthetic.',
    successQuote: '"Cold. But I will forgive you. This time."',
    failQuote: '"I own the moon you parked on. Consider this a warning."',
  },
  {
    name: 'DJ Solaris',
    title: "Galaxy's Most Wanted Beats, Allegedly",
    order: 'Hawaiian. Yes, Hawaiian. Fight me.',
    signal: 'His signal rotates through 12 frequencies per bar.',
    successQuote: '"It dropped harder than my last mixtape. LETSGO."',
    failQuote: '"No pizza, no beats. The galaxy suffers tonight."',
  },
  {
    name: 'General Quorb',
    title: 'Retired. Self-Declared. Claims 3 Planets.',
    order: 'Mega Meat, no olives (classified incident)',
    signal: 'Military channels only. He thinks we do not know.',
    successQuote: '"Adequate. In my day, pizza flew at Mach 9."',
    failQuote: '"Retreat accepted. Send coordinates for next attempt."',
  },
  {
    name: 'Countess Zelara',
    title: 'Mystic, Influencer, Part-Time Villain',
    order: 'Dark Matter Fungi, cosmic vibes only',
    signal: 'She encodes addresses as prophecy. It is very annoying.',
    successQuote: '"The stars aligned. So did this pizza. Fate is pleased."',
    failQuote: '"The void spoke. It said: no pizza. The void was right."',
  },
]
