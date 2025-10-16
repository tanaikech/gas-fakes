# only required to rebuild the gas docs from scratch
# node gi.js

# add completiong status form gas-fakes
node gi-analyzer-all.js

# render as md
node gi-render

# create progress summary
node gi-progress-summary.js