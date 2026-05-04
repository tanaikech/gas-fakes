#!/bin/bash


# Interactive script to run natural language tests for gf_agent

# Define the tests
declare -a TESTS=(
  "Summarise Data: Find latest 5 emails from 'Martin Hawksey' and summarize them in a Google Doc."
  "Manage Files: Create a sheet called 'Todays drive files' and add any files on Drive modified today to it."
  "Schedule Events: Add a meeting to discuss gf_agent with martin Hawksey to my calendar for tomorrow at 10am."
  "Summarize and chart: Create a bar chart of how much time by week ive spent in meetings in my calendar this year."
  "Compare and inform: Am I on average spending more of my time in meetings this year than last? Show me the average hours per week for each year on the console."
  "Multiple services and image manipulation: get the content of https://ramblings.mcpher.com/resurrecting-scriptdb-nosql-database-for-apps-script/ and create a google document. Make a copy of that document and reduce all the images to 25% of their current size."
  "Process Spreadsheets: Using my airports spreadsheet, from the sheet with the most data, find the highest 5 airports in the world, convert their elevation to metres and show their distance from London in kilometres."
)

echo "========================================================"
echo "   gf_agent Natural Language Test Runner"
echo "========================================================"
echo "Select a test to run. This will execute the Gemini CLI"
echo "in headless mode with the selected prompt."
echo ""

PS3="Select a test (or type 8 to Quit): "
select test in "${TESTS[@]}" "Quit"; do
    case $test in
        "Quit")
            echo "Exiting test runner."
            break
            ;;
        *)
            if [ -n "$test" ]; then
                echo ""
                echo "========================================================"
                # Extract just the prompt part after the colon
                PROMPT=$(echo "$test" | cut -d':' -f2- | sed 's/^ //')
                echo "Executing Prompt:"
                echo "\"$PROMPT\""
                echo "========================================================"
                
                # Execute the prompt using the gemini CLI
                gemini skills enable gf_agent && gemini run gf_agent "$PROMPT" -y
                
                echo ""
                echo "Test completed. You can select another test or type 8 to quit."
            else
                echo "Invalid selection. Please enter a number from the menu."
            fi
            ;;
    esac
done
