DESTINY=$1
if [ ! $1 ]; then
  echo "Warning: No app assigned... Using Dev Android as default"
  DESTINY=RegattaDevAndroid
fi
DEVELOPER=$2
if [ ! $2 ]; then
  echo "Warning: No developer assigned... Using Queue as default"
  DESTINY=Queue
fi

NOTES=$3
if [ ! $3 ]; then
  echo "Warning: No Notes found... Using own's notes (empty)"
  NOTES=""
fi
TIME_STAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
RELEASE_NOTE="Released on: "
echo $RELEASE_NOTE$TIME_STAMP
