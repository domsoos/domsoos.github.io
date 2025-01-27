export function Header() {
    // Return the header HTML structure as a string
    return `
      <header class="header">
        <div class="logo"><a href="index.html">SciSense</a></div>
        <br>
        <br>
  
        <!-- Tabs and Categories -->
        <button class="tab active" data-tab="trending">Trending</button>
        <button class="tab" data-tab="most-discussed">Most Discussed</button>
        <button class="tab" data-tab="leaderboard">Leaderboard</button> <!-- Leaderboard Tab -->
  
        <button id="create-account-button">Create Account</button>
        <button id="sign-in-button">Sign In</button>
      </header>
    `;
  }
  