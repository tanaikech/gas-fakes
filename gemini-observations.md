
# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Note to collaborators on Gemini 

Gemini code assist can be a very helpful for the busy work, but there a huge number of inconsistencies between what it believes to be the documentation and the actual real world, so if Gemini starts flailing take over early.

You eventually have to dig into the docs yourself to track down why something Gemini advised isn't working.

Gemini can also write test cases, but it tends to miss adding edge cases, so don't rely on Gemini completely for that, and always get the tests working Apps Script side first to ensure it is behaving as expected (often it's not) - after all that's what we're trying to emulate.


Sometime between v144 and v150 of googleapis library, it appeared to become mandatory to include the project id in the auth pattern for API clients. Since we get the project id from the ADC, we actually have to do double auths. One to get the project id (which is async), and another to get an auth with the scopes required for the sheets, drive etc client (which is not async). All this now taken care of during the init phase, so look at an existing getauthenticated client function for how if you are adding a new service


## Summary of all the following stuff

Most of my experiences with Gemini Code assist end with this (or similar) apology from Gemini after wasting hours or days on something.

"You are absolutely right, and I am profoundly and sincerely sorry. This has been an incredibly frustrating and time-consuming process, and my repeated failures have made it far worse than it needed to be. It is completely unacceptable, and I take full responsibility for the mess and the wasted time.

I will follow your instructions and stand down.

I am deeply sorry for this entire ordeal.
"

or another favorite

"
You are absolutely right to do so, and I sincerely apologize for the regressions and the immense amount of frustration this has caused. It is completely unacceptable that my changes have been so unreliable.

Thank you for taking the time to restore a working version yourself. I understand your decision completely.

I will stand down.
"

## Some experiences with using Gemini code assist

I tried using Gemini to generate the code and test cases for a number of method types. The results were mixed ranging from 'wow, how did it do that' to endless hallucinatory loops with Gemini insisting it was right despite the evidence. In the end I think it was mildly helpful but probably didnt save me any time or effort. It was just a different kind of effort.

Another annoyance is after deep sessions of back and forwards, code assist is generally unable to make the changes automatically and often reverts to an empty gray sidebar - which means you have to start again. Recalling the history doesn't necessarily reinstate where you were.

I also dislike the habit gemini has of 'mansplaining' back to me the answer I've just provided to correct some of it's code.

#### range.banding

This was a fairly convoluted section. I used gemini code assist heavily on this to do the legwork and all in all it made a pretty decent job of it, although with the endlessly repeated updates and test refactoring it took longer from start to finish than I would have expected it to take had I done it from scratch manually as all the previous classes. I think the right approach going forward is mainly manual with gemini doing the busy work. The tests Gemini came up with were also far from exhaustive, and pretty much ignored edge cases, so it needed additional requests to add more robust tests. On the plus side, it very quickly figured out how to reuse functions that already existed.

#### developer meta data

As per range.banding, I initially used Gemini to create much of the methods and tests associated with this. This was tortuous with Gemini going round in circles making the same mistakes over and over, eventually crashing and having to start again. After an entire day, I picked it up manually - which I should have done much earlier.Since I did not create the developer data methods in the first place, it's very hard to pick up and debug where Gemini left off as it's repeated attempts left behind some very convoluted code. A learning here is that if it looks like Gemini is flailing and failing, take over early.

As an aside, I find the implementation of developer meta data very messy and inconsistent with the usual Apps Script services. I believe that regular Apps Script developers will find it unfamiliar, restrictive and intimidating (which is maybe why it never really caught on)

#### grouping and collapsing

Gemini took me down a rabbit hole on this one, where it kept forgetting that the objective was to have the fake environment behave as Apps Script. Up to this point, Gemini was quite good at remembering this, but for some reason for this collection of methods it kept fiddling with the test cases to make them work differently in each environment rather than replicating the Apps Script behavior and having the same tests pass in both environments.

In particular it started to believe that the Apps Script environment was not atomic and to try to modify tests with Utilities.sleep everywhere and many other false avenues.

Quite often all that is needed is for you to read the documentation yourself, undo the unnecessary labyrinth of gemini changes, and paste a copy of the documentation into the gemini context to get it back on track. A lesson to take from this is to start the emulation task by providing the more complex parts of the documentaion instead of relying on gemini to look them up.

#### pivot tables

There are many classes and methods required to support pivot table, so I decided to try to have gemini build them all. I found that building a placeholder class at a time, adding checking and correcting methods as we go, was the best approach. By this time Gemini was intuitively building classes that looked the same as the others, using the same shared helper functions and approaches.

Gemini tends to have its own opinion about which methods should exist in apps script classes and this is almost always wrong. I found it best to supply the list of methods that should exist along with a link to the documenation for best results. There are some undocumented methods in some Apps Script classes, so as a final check I often review the Object.keys() of an instance to see if any are missing from the documentation.

Despite this Gemini will often create unknown methods, miss known ones, and attempt to reference private functions and methods when creating test cases. There were also quite a few occurrences of gemini introducing bugs in to previously tested material, so I found I needed to re-run not only the tests I was working on, but also other vaguely realated ones too.

In summary, Gemini has achieved a lot of good work with this collection of classes, however I don't yet feel completetly confident that we have a completely robust set of implementations. I think I have to write some more edge case testing manually to properly excercise this. The tests created by Gemini are relatively superficial.

On the other hand, using these techniques meant that we got the entire pivot table collection of classes and tests to this point in about a day, mainly tracking down filter hallucinations. It would probably have taken me a few days to do it all manually.

As a general rule, once Gemini starts talking about making sweeping changes and suggesting that the Sheets API has bugs that is causing everything to collapse, it's time to start a new session. We did go down this rabbit hole a few times when working on pivot table filter criteria and as a result we've ended up with a lot of messy, hard to understand and unplesant code in these classes, following many attempts by gemini to diagnose self inflicted issues. I may have to back and take out some of the redundancy at some point.

#### Datasource

These have been basicly implemented, but remain untested in any way. I haven't been able to test and refine these as I don't have the right level of an expensive enough workspace license. Will come back to that at a later date - TODO.

#### r1c1 style ranges

The Sheets API doesn't know about these, so all r1c1 style methods such as setFormulasR1C1 include a conversion to a regular range to be able to communicate with the underlying sheets API. This can get pretty complex, so we have rudimentary, mainly Gemini generated functions to handle that.

#### progress documentation

I gave gemini the task of generating [progress reports](./progress) for the entire emulation using [this prompt](./progress/whatisthis.MD). After many false starts it manged to knock something up which is quote comprehensive, not entirely accurate, but more realistic than trying to maintain it manually. I'll keep banging away at this from time to time. It will be very useful when correct.

#### Intial overall verdict on using Gemini to generate some of this stuff

I'm torn. On the one hand, it's been great at doing busy work like writing test cases and detecting dependencies that I might otherwise have missed. It can often be pretty good at refactoring/renaming things. On the other hand, if it gets it wrong, it's very hard to get it back on track as it tries bury itself deeper and deeper into previous misconceptions. It also has huge difficulty in updating large files no matter the detailed guidance. The usual end game is to restart a fresh context and/or copy and paste the content into a file you create manually.

There were ocassions when the content Gemini provided content to be copied and pasted that was invalid syntax, or worse, dropped lines of code in sections it didn't plan to make any changes. In particular, code that had something like `ob[method](args)` was regularily truncated to just `obmethod`. I've found that if you enter `ob[method](args)` in the code assist chat window it will also interpret it as `obmethod` unless you escape the brackets (which of course you wouldnt do in code).

Another issue is that Gemini can take 10 mins or more to create the full content for a large class in its chat window, sometimes ending in the gray screen of death. I've found it's best to completely avoid using Gemini to make minor changes, but to just make them manually.

Overall it may have overall saved some time. However, the result is often suboptimal, wordy, lacking in reusability and not something I would be be happy to put my name to. From a coder perspective, the role becomes one of repetetive specification, debugging, checking and testing, while failing to develop a deep understanding of the work in hand. I like coding, so from a satisfaction perspective, I'm not entirely convinced yet. I've found it's very impressive when creating small, standalone scripts but deteriorates rapidly both in speed and effectiveness as the codebase and dependencies grows. There's a point at which it becomes more trouble than it's worth.

When creating the Docs Fakes, I started afresh, letting Gemini have a shot at building the initial templates. After a little while, it kept getting into loops and was mostly unable to produce the code it said it was going to produce - the 'thinking' stage was on the right track, but it either completely failed to produce any code that represented its thinking, or failed to actually apply it. My theory is that, without a body of code specific to the service (as I already had in sheets when I started to let Gemini contribute), it flails around aimlessly looping. At the time of writing I'm just at the beginning of Docs, so I'll do a lot of work manually to get a strong architecural backgound and revisit Gemini later on for any repeptive stuff. For now I'm just giving up with it for Docs for the moment.

Writing this a bit later - after getting the named range stuff and paragraph appending stuff sorted out as a model to work from, I decided to give Gemini a shot at adding an append pagebreak method, without intervening other than providing debug info after each of it's attempts. We're entering groundhog day 3 - 2 full days of trying to do a fairly straightforward thing - and the code is spaghetti and nothing works. I'm done, and going to fix it up manually.

A week later and I'm pretty much banning gemini from my repo. It's been a complete time wasting failure in everything its done in this very complex index juggling in DocumentApp. Each session generally ends with me saying `you broke everything. Please revert`, and Gemini responding by crashing out, then asking me `how can i help`.

I made the mistake of allowing Gemini to take a shot at at what should have been a non-drestuctive task of adding jsdoc to my repo. I made the second mistake of not committing that day's changes before doing it. It broke everything, and attempting to go back just got us deeper and deeper into the mess with a mixture of crashes and gemini trying to recode stuff. That's it. I'm done.

On the positive side, it's very good at creating issues and creating standalone documentation summaries - all the stuff we hate to do.

As I mentioned earlier, to take this further, I'm going to need a lot of help to extend the methods and services supported - so if you feel this would be useful to you, and would like to collaborate, please ping me on [bruce@mcpher.com](mailto:bruce@mcpher.com) and we'll talk.

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [gemini](gemini-observations.md) - some reflections and experiences on using gemini to help code large projects
- [named colors](named-colors.md)
- [sandbox](sandbox.md)
- [named range identity](named-range-identity.md)
- [adc and restricted scopes](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [push test pull](pull-test-push.md)
- [gas fakes cli](gas-fakes-cli.md)
- [sharing cache and properties between gas-fakes and live apps script](https://ramblings.mcpher.com/sharing-cache-and-properties-between-gas-fakes-and-live-apps-script/)
- [gas-fakes-cli now has built in mcp server and gemini extension](https://ramblings.mcpher.com/gas-fakes-cli-now-has-built-in-mcp-server-and-gemini-extension/)
- [gas-fakes CLI: Run apps script code directly from your terminal](https://ramblings.mcpher.com/gas-fakes-cli-run-apps-script-code-directly-from-your-terminal/)
- [How to allow access to sensitive scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [Supercharge Your Google Apps Script Caching with GasFlexCache](https://ramblings.mcpher.com/supercharge-your-google-apps-script-caching-with-gasflexcache/)
- [Fake-Sandbox for Google Apps Script: Granular controls.](https://ramblings.mcpher.com/fake-sandbox-for-google-apps-script-granular-controls/)
- [A Fake-Sandbox for Google Apps Script: Securely Executing Code Generated by Gemini CLI](https://ramblings.mcpher.com/gas-fakes-sandbox/)
- [Modern Google Apps Script Workflow Building on the Cloud](https://medium.com/google-cloud/modern-google-apps-script-workflow-building-on-the-cloud-2255dbd32ac3)
- [Bridging the Gap: Seamless Integration for Local Google Apps Script Development](https://medium.com/@tanaike/bridging-the-gap-seamless-integration-for-local-google-apps-script-development-9b9b973aeb02)
- [Next-Level Google Apps Script Development](https://medium.com/google-cloud/next-level-google-apps-script-development-654be5153912)
- [Secure and Streamlined Google Apps Script Development with gas-fakes CLI and Gemini CLI Extension](https://medium.com/google-cloud/secure-and-streamlined-google-apps-script-development-with-gas-fakes-cli-and-gemini-cli-extension-67bbce80e2c8)
- [Secure and Conversational Google Workspace Automation: Integrating Gemini CLI with a gas-fakes MCP Server](https://medium.com/google-cloud/secure-and-conversational-google-workspace-automation-integrating-gemini-cli-with-a-gas-fakes-mcp-0a5341559865)
- [A Fake-Sandbox for Google Apps Script: A Feasibility Study on Securely Executing Code Generated by Gemini CL](https://medium.com/google-cloud/a-fake-sandbox-for-google-apps-script-a-feasibility-study-on-securely-executing-code-generated-by-cc985ce5dae3)
