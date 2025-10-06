#!/bin/bash

# env-to-json-pipe-bool.sh - Pipe-friendly with numeric and boolean detection

# Usage examples:
#   cat env_vars.txt | ./env-to-json-pipe-bool.sh > output.json
#   ./env-to-json-pipe-bool.sh < env_vars.txt > output.json

awk '
function is_numeric(str) {
    # Check for integer: optional minus, digits only
    if (str ~ /^-?[0-9]+$/) return 1
    
    # Check for float: optional minus, digits, optional decimal, digits
    if (str ~ /^-?[0-9]*\.?[0-9]+$/) return 1
    if (str ~ /^-?[0-9]+\.?[0-9]*$/) return 1
    
    # Check for scientific notation (basic)
    if (str ~ /^-?[0-9]+\.?[0-9]*[eE][+-]?[0-9]+$/) return 1
    if (str ~ /^-?[0-9]*\.?[0-9]+[eE][+-]?[0-9]+$/) return 1
    
    return 0
}

function is_boolean(str) {
    # Convert to lowercase for case-insensitive comparison
    lower_str = tolower(str)
    return (lower_str == "true" || lower_str == "false")
}

function escape_json(str) {
    gsub(/\\/, "\\\\", str)
    gsub(/"/, "\\\"", str)
    gsub(/\//, "\\/", str)
    gsub(/\x08/, "\\b", str)
    gsub(/\x0c/, "\\f", str)
    gsub(/\x0a/, "\\n", str)
    gsub(/\x0d/, "\\r", str)
    gsub(/\x09/, "\\t", str)
    return str
}

BEGIN {
    print "export const testFixes = {"
    first = 1
}
/^[A-Z_][A-Z0-9_]*=/ {
    if (!first) {
        print ","
    }
    first = 0
    
    # Split key and value
    split($0, parts, "=")
    key = parts[1]
    
    # Reconstruct value (in case there are = in the value)
    value = substr($0, length(key) + 2)
    
    # Remove surrounding quotes if present
    gsub(/^["]|["]$/, "", value)
    gsub(/^'"'"'|'"'"'$/, "", value)
    
    # Check if value is boolean
    if (is_boolean(value)) {
        printf "  \"%s\": %s", key, tolower(value)
    }
    # Check if value is numeric
    else if (is_numeric(value)) {
        printf "  \"%s\": %s", key, value
    } else {
        # Escape and quote string value
        escaped_value = escape_json(value)
        printf "  \"%s\": \"%s\"", key, escaped_value
    }
}
END {
    print "\n}"
}
' "${@:--}"