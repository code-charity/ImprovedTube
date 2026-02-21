---
name: bug report  (for MarkDown authors)
about: Create a report to help us improve
title: ''
labels: Bug, good first issue, help wanted, up-for-grabs
assignees: ''

---

## Bug Report:
 - **Description:**              _(Clear/concise. Screenshot/Video welcome)_
 - **Steps to reproduce this:**  _(Might only happen with a certain feature of our's enabled?)_
 - **Since when?:** When YouTube changed something? Through our update?
 - **Browser:**  
 - **Are any errors shown in the Browser-Console?:**   _(`F12`-key, then `console`-tab)_
 - **Does the bug not happen when you log out of YouTube? Then please copy your experiment flags list twice** _(with & without the error to compare). Enter: `yt.config_.EXPERIMENT_FLAGS` into the Browser console on youtube (F12-Key - Or find it in the html source(ctrl+U)_

<!-- 
### Before submitting:
Thanks for coming & caring! 
Sometime even 3 words are enough of a bug report. 
Just --> please check, if the issue has already been reported ever. (If so, that might inspires you to add different/better words to that report.)
  [GitHub's issue search](https://github.com/ImprovedTube/ImprovedTube/issues?q=) _(use the link or remove "is:issue is:open" from the search)_ 
  <!--   (If it was posted before, you can answer/react there to give it your voice and this also move it up in our lists) 
          If the status is  "closed" (=fixed) recently, then the Browser's stores can be updated soon, 
             yet if it was already closed month or years ago, then it might appeared again & must be fixed again.) 
                                                                                        
### OPTIONAL (usually):                                                                   -->
 - Expected preferred behavior: 
 - ImprovedTube Version (Written in the Extension header & your Browser's store)
 - Tested as only active extension or in incognito mode?:
 - Your Settings (From the Extension's `⋮`-Hamburger menu > Settings > Backup & reset > Export settings (You can remove any Blocklist, History Analyzer data - or paste the following in the Browser-Console and hit enter: `(function({analyzer, blocklist, ...a}){return JSON.stringify(a)})(ImprovedTube.storage)` )
 - YouTube-Document: (`F12` copy the whole root element: \<html> (alternative: CTRL+U) (https://github.com/code-charity/youtube/wiki/Contributing#Test ) 
 - OS / Device:  

 <!-- Many thanks & smiles !  -->
