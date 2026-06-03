TARGET="$1"

FILES=$(ls test${TARGET}*.js)
echo "files="$FILES
for F in $FILES; do
  npm run "${F%.*}"
done
