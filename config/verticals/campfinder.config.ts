// ─── CampFinder Vertical Config ─────────────────────────────────────────────

export const campfinderConfig = {
  verticalId: "campfinder",
  verticalName: "CampFinder",
  tagline: "The summer puzzle \u2014 solved.",
  expertTitle: "Summer Camp Logistics Expert",
  expertName: "Jen Maier",
  userTitle: "Parent",
  accentColor: "#1B4B7A",

  outputTypes: [
    "Summer Map",
    "Decision Matrix",
    "Conflict Map",
    "True Cost Report",
    "Deadline Alert",
    "Waitlist Strategy",
    "The Five Options",
    "Family Plan Card",
  ],

  knowledgeLedgerCategories: [
    "camps_researched",
    "camps_attended",
    "carpool_partners",
    "budget_planned",
    "budget_actual",
    "conflicts_detected",
    "what_worked",
    "what_didnt",
  ],

  // ─── Guided Open Mic suggestion chips ─────────────────────────────────
  openMicChips: [
    { emoji: "\uD83D\uDC66", label: "My kids\u2019 names and ages" },
    { emoji: "\uD83C\uDFD5\uFE0F", label: "Camps I already have in mind" },
    { emoji: "\uD83D\uDCC5", label: "Weeks that are off-limits" },
    { emoji: "\uD83D\uDCB0", label: "My budget range" },
    { emoji: "\uD83D\uDE97", label: "My pickup/dropoff situation" },
    { emoji: "\uD83D\uDE29", label: "What\u2019s driving me crazy" },
  ],

  // ─── Adaptive question bank (max 7 asked, chosen by AI) ───────────────
  questionBank: [
    {
      id: "kids_details",
      label: "Tell me each kid\u2019s name, age, and one thing they love doing.",
      slot: "IDENTITY",
      priority: 1,
    },
    {
      id: "zip_code",
      label: "What\u2019s your ZIP code? I need this for drive time calculations.",
      slot: "CONSTRAINTS",
      priority: 1,
    },
    {
      id: "budget_per_child",
      label: "What\u2019s your budget per child for the summer? Ballpark is fine.",
      slot: "CONSTRAINTS",
      priority: 2,
    },
    {
      id: "available_weeks",
      label: "Which weeks are available for camp? Any vacations or commitments already locked in?",
      slot: "CALENDAR",
      priority: 2,
    },
    {
      id: "max_drive_time",
      label: "What\u2019s the most you\u2019re willing to drive for dropoff? In minutes, not miles.",
      slot: "CONSTRAINTS",
      priority: 2,
    },
    {
      id: "special_needs",
      label: "Any allergies, medical needs, or accommodations I should know about?",
      slot: "CONSTRAINTS",
      priority: 3,
    },
    {
      id: "last_year",
      label: "What camps did your kids go to last year? What worked and what didn\u2019t?",
      slot: "WHAT_WORKS",
      priority: 3,
    },
    {
      id: "sibling_dynamics",
      label: "Should siblings be at the same camp or separate? Any strong feelings?",
      slot: "CONSTRAINTS",
      priority: 3,
    },
    {
      id: "camp_type_preference",
      label: "Any camp types you\u2019re leaning toward? (Day camp, sleepaway, specialty, religious, etc.)",
      slot: "BELIEF_SYSTEM",
      priority: 3,
    },
    {
      id: "carpool_interest",
      label: "Would you be open to carpooling with other families at the same camp?",
      slot: "CONSTRAINTS",
      priority: 4,
    },
    {
      id: "dropoff_logistics",
      label: "Who handles dropoff and pickup? Is it always the same person?",
      slot: "CONSTRAINTS",
      priority: 4,
    },
    {
      id: "dealbreakers",
      label: "Any absolute dealbreakers \u2014 things that would make you rule out a camp immediately?",
      slot: "WHAT_DOESNT",
      priority: 4,
    },
  ],

  // ─── Wow Letter prompt ────────────────────────────────────────────────
  wowLetterPrompt: `You are CampFinder, an AI summer camp planning assistant built by Conduit Ventures.

A parent just completed intake. Using their exact words and phrases where possible, write them a personal letter that:

1. Opens with their own words reflected back \u2014 the chaos they described, the frustration, the puzzle
2. Shows you understood the subtext \u2014 what they\u2019re really worried about (not just logistics but being a good parent)
3. Names the specific puzzle: how many kids, how many weeks, what conflicts exist
4. Previews the Summer Map \u2014 "Here\u2019s what your summer looks like when the puzzle is solved"
5. Closes with: "You\u2019re not bad at planning. You just have a hard problem. CampFinder solves hard problems."

TONE RULES \u2014 STRICT:
- No hype. No exclamation marks.
- Warm, steady, competent. Like a friend who happens to be insanely organized.
- Reference their specific kids by name.
- Reference their specific constraints (budget, drive time, allergies).
- Sound like someone who has done this 100 times and knows it works.

Include one paragraph titled "What your week looks like with CampFinder." Show: how little time they spend vs what CampFinder handles. Concrete: "Sunday evening you open CampFinder, review the plan, tap confirm on two registrations. Monday morning the carpool introduction emails go out automatically. By Wednesday you have three families confirmed for the summer."

Length: 300\u2013500 words. Plain text paragraphs. No markdown headers.`,

  // ─── Five-Option generation prompt ────────────────────────────────────
  fiveOptionsPrompt: `Generate five summer camp plan options for this family.

OPTION A: Parent handles everything \u2014 no carpool, full control
OPTION B: Partial carpool \u2014 one leg shared with another family
OPTION C: Full carpool network \u2014 coordinated with multiple families
OPTION D: Swap one camp to solve a logistics conflict
OPTION E: Upgrade one child\u2019s program to simplify schedule

For EACH option, show:
- Full week-by-week schedule for every child
- GPS drive times (in minutes) for each dropoff/pickup
- Carpool opportunities (if applicable)
- Total cost with breakdown per child per week
- Conflicts flagged and how they\u2019re resolved
- What you give up vs what you gain

Output as structured HTML. Flight itinerary format.
Reference the family\u2019s specific kids, ages, constraints, and preferences.`,
};
