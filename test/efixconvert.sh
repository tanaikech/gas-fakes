# converts from .env inputs to special fiexs input file
# run once, check testfixes.js, run a test - if all okay - delete from ../env all keys that are required for testing
# in other words all the items that are not in ../.env-setup-template
cat ../.env | sh efilter.sh | sh etosh.sh > testfixes.js