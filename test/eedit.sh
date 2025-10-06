#!/bin/bash
# eedit-minimal.sh - Minimal version

if [[ "${@:--}" == "-" ]]; then
    INPUT_CACHE=$(mktemp)
    cat > "$INPUT_CACHE"
    CLEAN_VALUE=$(grep '^CLEAN=' "$INPUT_CACHE" | head -1 | cut -d'=' -f2- | sed 's/^["'"'"']*//; s/["'"'"']*$//')
    cat "$INPUT_CACHE" | sh etosh.sh
    rm -f "$INPUT_CACHE"
else
    CLEAN_VALUE=$(grep '^CLEAN=' "$1" | head -1 | cut -d'=' -f2- | sed 's/^["'"'"']*//; s/["'"'"']*$//')
    cat "$1" | sh etosh.sh
fi | awk -v clean_value="$CLEAN_VALUE" '
$0 == "}" { next }
$0 ~ /"CLEAN":/ { 
    if (clean_value == "1" || clean_value == 1 || tolower(clean_value) == "true") print "  \"CLEAN\": true,"
    else print "  \"CLEAN\": false,"
    next 
}
$0 ~ /"PREFIX":/ { 
    sub(/"PREFIX": "[^"]*"/, "\"PREFIX\": Drive.isFake ? \"--f\" : \"--g\"", $0)
    print $0
    next
}
{ print }
END { 
    print "  \"PREFIX\": Drive.isFake ? \"--f\" : \"--g\","
    print "}"
}
'