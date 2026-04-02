---
description: gas-fake objective
---

To emulate the behavior of live apps script exactly by mapping classes and methods to those fake equivalents found in src folder. This means that we can run apps script anywhere that Node runs. These equivalents typically use the workspace apis to emulate live Apps Script, with a worker mechanism to handle the conversion from sync (apps scipt) to async (apis) and return the results syncronously.

Utimately all apps script classes and methods will be available via gas-fakes.