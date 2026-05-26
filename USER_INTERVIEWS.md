# User Interviews: College Students & Side Projectors

Notes from three real conversations had with potential users (peers and colleagues) during development week.

---

## Interview 1: Manish — M.Tech 1st Year
**Role:** Student Developer / Aspiring AI Engineer  
**Company Stage:** Individual Projects / Academic Projects

- **Quote:** *"I basically pay for Cursor and Copilot at the same time because I thought I needed both for the autocomplete to work properly. I'm definitely overpaying on a student budget."*
- **Quote:** *"I don't track my subscriptions. I usually just see the Apple or Google billing notification and realize I've spent $60 this month on AI tools."*
- **Quote:** *"I'd use a tool like this if it told me exactly which plan to cancel without losing the features I actually use for my thesis."*
- **The most surprising thing they said:** He actually believed that Cursor *required* a GitHub Copilot subscription to function, effectively paying for the same underlying LLM twice.
- **What it changed about my design:** I implemented the **Redundancy Logic** in the audit engine (`auditEngine.ts`) specifically to catch the "Cursor + Copilot" trap, which I found to be a common misconception among student developers.

---

## Interview 2: Akshay Gupta — Pre-Final Year Student 
**Role:** Freelance Developer / Student  
**Company Stage:** Freelancing (Side income)

- **Quote:** *"I forget to cancel subscriptions after my freelance project ends. I currently have three different AI image generators active and I probably only use one."*
- **Quote:** *"Student discounts are hard to find. I usually just pay the regular price because the 'Education' verification takes too long."*
- **Quote:** *"Wait, I can get credits for free? I thought you always had to pay the monthly $20."*
- **The most surprising thing they said:** He was paying for Gemini Advanced even though his father has a family Google One plan that includes it. He was effectively throwing away $20/month because of a lack of "household budget" visibility.
- **What it changed about my design:** I added the "Primary Use Case" selection to the audit engine so that I could distinguish between "Hobbyist" and "Pro" needs, helping users find the absolute cheapest entry points.

---

## Interview 3: Anish Garg — Alumni / Early Career
**Role:** Junior Dev / General Productivity User  
**Company Stage:** Early Career (Side projects)

- **Quote:** *"I just want one tool that does everything. I don't want to check five different tabs to see where my money is going."*
- **Quote:** *"I keep ChatGPT Plus mostly out of habit, but I use Claude for 90% of my actual coding now. I'm just scared of losing my chat history."*
- **Quote:** *"If a tool showed me I could save $200 a year, that's literally a week of groceries for me."*
- **The most surprising thing they said:** The "Optimal Stack" checkmark was the most exciting part of the UI for him. He wanted the external validation that his spend was "efficient."
- **What it changed about my design:** This feedback led me to prioritize the "Optimal Stack" visual state. If a user is already spending well, the tool shouldn't just be silent—it should reward them with a "Stack Already Optimal" badge to build confidence.

