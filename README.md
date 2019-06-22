npm install discord.js

npm install request

copy/rename config.example.json to config.json and fill in settings as desired/required

**Config options:**

**token** - Bot Token, required

**channel** - channel to post current version and forced version info, required

**users** - users to tag when version changes, optional

**queryDelay** - how long to wait between checks for version changes in milliseconds, default of 60000 is 1 minute

**delayAfterForce** - how long to wait between checks on version force, default is 5 minutes, the reason for the longer delay is that the tag will be deleted on the next update though I suspect discord would keep the red notification even after message edit on next update.
